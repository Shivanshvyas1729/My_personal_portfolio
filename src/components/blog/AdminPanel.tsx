import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { 
  Save, Plus, Loader2, Link as LinkIcon, Trash2, GripHorizontal, 
  Minimize2, Maximize2, Star, EyeOff, Search, Edit3, ChevronLeft, 
  ChevronRight, Bold, Italic, Underline, Code, List, ListOrdered, 
  FileText, Eye, Check, X, AlertCircle, BookOpen
} from "lucide-react";
import { BlogPost } from "@/pages/Blog";
import { apiFetch, API_ROUTES } from "@/lib/apiClient";
import { useCMS } from "@/context/CMSContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface AdminPanelProps {
  onSuccess: (post: BlogPost) => void;
}

const DEFAULT_W = 480;
const DEFAULT_H = 640;
const MIN_W = 360;
const MIN_H = 400;

const PRESET_CATEGORIES = ["Notes", "Thoughts", "Books", "Links"];

function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <span className="relative group/tip inline-flex items-center">
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 text-[11px] leading-relaxed bg-popover border border-border/50 text-muted-foreground rounded-lg px-3 py-2 shadow-xl opacity-0 group-hover/tip:opacity-100 transition-opacity z-[100] text-center">
        {text}
      </span>
    </span>
  );
}

export function AdminPanel({ onSuccess }: AdminPanelProps) {
  const { previewData, refreshData, cmsMode, forceLocalMode, isLocalEnvironment } = useCMS();
  const allBlogs: BlogPost[] = useMemo(() => previewData.blog || [], [previewData.blog]);

  // Tab State
  const [activeTab, setActiveTab] = useState<"form" | "manage" | "preview">("form");

  // Form State
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "Notes",
    type: "", // comma separated tags in raw input
    featured: false,
    draft: true,
    link: "",
    linkText: "",
  });

  const [resources, setResources] = useState<{ label: string; url: string }[]>([]);
  
  // Tag / Category suggestion helpers
  const [customCategoryInput, setCustomCategoryInput] = useState("");
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All"); // All, Draft, Published, Featured
  const [managePage, setManagePage] = useState(1);
  const postsPerPage = 5;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const [isMinimized, setIsMinimized] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cms-blog-admin-minimized");
      return saved ? saved === "true" : true;
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem("cms-blog-admin-minimized", String(isMinimized));
  }, [isMinimized]);

  // ── Suggestions computed dynamically ─────────────────────────────────────
  const existingCategories = useMemo(() => {
    const set = new Set<string>(PRESET_CATEGORIES);
    allBlogs.forEach(b => {
      if (b.category) set.add(b.category.trim());
    });
    return Array.from(set).sort();
  }, [allBlogs]);

  const existingTags = useMemo(() => {
    const set = new Set<string>();
    allBlogs.forEach(b => {
      if (Array.isArray(b.type)) {
        b.type.forEach(t => {
          if (t) set.add(t.trim());
        });
      }
    });
    return Array.from(set).sort();
  }, [allBlogs]);

  // ── DOM ref for dragging & resizing ────────────────────────────────────────
  const panelRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const geom = useRef({ x: 0, y: 0, w: DEFAULT_W, h: DEFAULT_H, ready: false });

  // Set responsive initial position on mount
  useEffect(() => {
    const isMobile = window.innerWidth < 640;
    const w = isMobile ? window.innerWidth - 32 : DEFAULT_W;
    const h = isMobile ? window.innerHeight - 120 : DEFAULT_H;
    geom.current = {
      x: isMobile ? 16 : window.innerWidth - w - 24,
      y: isMobile ? 80 : 96,
      w,
      h,
      ready: true,
    };
    applyGeom();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyGeom = useCallback(() => {
    const el = panelRef.current;
    if (!el) return;
    const { x, y, w, h } = geom.current;
    el.style.left   = `${x}px`;
    el.style.top    = `${y}px`;
    el.style.width  = `${w}px`;
    el.style.height = `${h}px`;
  }, []);

  const clamp = (x: number, y: number, w: number, h: number) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    return {
      x: Math.max(0, Math.min(x, vw - w)),
      y: Math.max(0, Math.min(y, vh - 48)),
    };
  };

  // Dragging
  const drag = useRef({ active: false, sx: 0, sy: 0, ox: 0, oy: 0 });

  const onHeaderPointerDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("[data-no-drag]")) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { active: true, sx: e.clientX, sy: e.clientY, ox: geom.current.x, oy: geom.current.y };
    document.body.style.userSelect = "none";
  }, []);

  const onHeaderPointerMove = useCallback((e: React.PointerEvent) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.sx;
    const dy = e.clientY - drag.current.sy;
    const { x, y } = clamp(drag.current.ox + dx, drag.current.oy + dy, geom.current.w, geom.current.h);
    geom.current.x = x;
    geom.current.y = y;
    applyGeom();
  }, [applyGeom]);

  const onHeaderPointerUp = () => {
    drag.current.active = false;
    document.body.style.userSelect = "";
  };

  // Resizing
  const resize = useRef({ active: false, edge: "", sx: 0, sy: 0, ox: 0, oy: 0, ow: 0, oh: 0 });

  const startResize = useCallback((e: React.PointerEvent, edge: string) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    resize.current = {
      active: true, edge,
      sx: e.clientX, sy: e.clientY,
      ox: geom.current.x, oy: geom.current.y,
      ow: geom.current.w, oh: geom.current.h,
    };
    document.body.style.userSelect = "none";
  }, []);

  const onWindowPointerMove = useCallback((e: PointerEvent) => {
    const rs = resize.current;
    if (!rs.active) return;

    const dx = e.clientX - rs.sx;
    const dy = e.clientY - rs.sy;
    let { ox: x, oy: y, ow: w, oh: h } = rs;

    if (rs.edge.includes("e")) w = Math.max(MIN_W, rs.ow + dx);
    if (rs.edge.includes("s")) h = Math.max(MIN_H, rs.oh + dy);
    if (rs.edge.includes("w")) {
      const nw = Math.max(MIN_W, rs.ow - dx);
      x = rs.ox + (rs.ow - nw);
      w = nw;
    }
    if (rs.edge.includes("n")) {
      const nh = Math.max(MIN_H, rs.oh - dy);
      y = rs.oy + (rs.oh - nh);
      h = nh;
    }

    const clamped = clamp(x, y, w, h);
    geom.current = { ...geom.current, x: clamped.x, y: clamped.y, w, h };
    applyGeom();
  }, [applyGeom]);

  const onWindowPointerUp = useCallback(() => {
    resize.current.active = false;
    drag.current.active = false;
    document.body.style.userSelect = "";
  }, []);

  useEffect(() => {
    window.addEventListener("pointermove", onWindowPointerMove);
    window.addEventListener("pointerup", onWindowPointerUp);
    return () => {
      window.removeEventListener("pointermove", onWindowPointerMove);
      window.removeEventListener("pointerup", onWindowPointerUp);
    };
  }, [onWindowPointerMove, onWindowPointerUp]);

  // ── Markdown editor toolbar helper ─────────────────────────────────────────
  const insertMarkdown = (before: string, after: string = "", newline: boolean = false) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const s = ta.selectionStart;
    const e = ta.selectionEnd;
    const val = ta.value;
    const sel = val.substring(s, e);
    const ins = newline
      ? `\n${before}${sel}${after}\n`
      : `${before}${sel}${after}`;
    const nv = val.substring(0, s) + ins + val.substring(e);
    setFormData(prev => ({ ...prev, content: nv }));
    setTimeout(() => {
      ta.focus();
      const ns = s + (newline ? before.length + 1 : before.length);
      ta.setSelectionRange(ns, ns + sel.length);
    }, 0);
  };

  // ── Resources list ─────────────────────────────────────────────────────────
  const addResource = () => setResources([...resources, { label: "", url: "" }]);
  
  const updateResource = (idx: number, key: "label" | "url", val: string) => {
    const updated = [...resources];
    updated[idx][key] = val;
    setResources(updated);
  };
  
  const removeResource = (idx: number) => setResources(resources.filter((_, i) => i !== idx));

  // ── Edit Mode Loader ───────────────────────────────────────────────────────
  const startEditPost = (post: BlogPost) => {
    setEditingPostId(post.id);
    setFormData({
      title: post.title || "",
      content: post.content || "",
      category: post.category || "Notes",
      type: Array.isArray(post.type) ? post.type.join(", ") : "",
      featured: !!post.featured,
      draft: !!post.draft,
      link: post.link || "",
      linkText: post.linkText || "",
    });
    setResources(post.resources ? [...post.resources] : []);
    setActiveTab("form");
    setSuccessMsg("");
    setError("");
  };

  const cancelEdit = () => {
    setEditingPostId(null);
    setFormData({
      title: "",
      content: "",
      category: "Notes",
      type: "",
      featured: false,
      draft: true,
      link: "",
      linkText: "",
    });
    setResources([]);
    setSuccessMsg("");
    setError("");
  };

  // ── Submit / Save ──────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return setError("Title and content required");

    setLoading(true);
    setError("");
    setSuccessMsg("");

    const payload = {
      ...(editingPostId ? { id: editingPostId } : {}),
      title: formData.title,
      content: formData.content,
      category: formData.category,
      type: formData.type.split(",").map(t => t.trim()).filter(Boolean),
      featured: formData.featured,
      draft: formData.draft,
      link: formData.link,
      linkText: formData.linkText,
      resources: resources.filter(r => r.label && r.url),
    };

    try {
      const { ok, data } = await apiFetch(API_ROUTES.saveBlog, {
        password: sessionStorage.getItem("sitePassword") || "",
        blogData: payload,
      });

      if (!ok) throw new Error((data as any).error || "Failed to save post");

      const successPost = {
        id: editingPostId || Date.now(),
        ...payload,
        date: new Date().toISOString().split("T")[0],
        slug: payload.title.replace(/\s+/g, "-").toLowerCase(),
      } as BlogPost;

      onSuccess(successPost);
      
      // Dynamic CRM Matrix Context sync
      await refreshData();

      setSuccessMsg(editingPostId ? "Post updated successfully!" : "Post published successfully!");
      cancelEdit();
    } catch (err: any) {
      setError(err.message || "Failed to save post");
    }
    setLoading(false);
  };

  // ── Delete Post ────────────────────────────────────────────────────────────
  const handleDeletePost = async (post: BlogPost) => {
    if (!confirm(`Are you sure you want to delete "${post.title}"?`)) return;

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const { ok, data } = await apiFetch(API_ROUTES.deleteBlog, {
        password: sessionStorage.getItem("sitePassword") || "",
        postId: post.id,
        postSlug: post.slug,
      });

      if (!ok) throw new Error((data as any).error || "Deletion failed");

      // Dynamic CRM Matrix Context sync
      await refreshData();
      
      setSuccessMsg(`"${post.title}" deleted successfully.`);
      if (editingPostId === post.id) {
        cancelEdit();
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete post");
    }
    setLoading(false);
  };

  // ── Filtering & Searching list ─────────────────────────────────────────────
  const filteredBlogs = useMemo(() => {
    return allBlogs.filter(b => {
      const matchesSearch = 
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        b.content.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = filterCategory === "All" || b.category === filterCategory;
      
      let matchesStatus = true;
      if (filterStatus === "Draft") matchesStatus = !!b.draft;
      else if (filterStatus === "Published") matchesStatus = !b.draft;
      else if (filterStatus === "Featured") matchesStatus = !!b.featured;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [allBlogs, searchQuery, filterCategory, filterStatus]);

  // Reset page bounds when filters change
  useEffect(() => {
    setManagePage(1);
  }, [searchQuery, filterCategory, filterStatus]);

  const totalPages = Math.ceil(filteredBlogs.length / postsPerPage);
  const paginatedBlogs = useMemo(() => {
    const start = (managePage - 1) * postsPerPage;
    return filteredBlogs.slice(start, start + postsPerPage);
  }, [filteredBlogs, managePage]);

  // Resize handle helper
  const Handle = ({ edge, cursor, className }: { edge: string; cursor: string; className: string }) => (
    <div
      className={`absolute z-20 select-none ${className}`}
      style={{ cursor }}
      onPointerDown={e => startResize(e, edge)}
    />
  );

  const syncStatus = (forceLocalMode || cmsMode === "local") ? "Local Mode" : "GitHub Mode";

  return (
    <div
      ref={panelRef}
      data-lenis-prevent="true"
      style={{
        position: "fixed",
        zIndex: 60,
        willChange: "transform",
      }}
      className={`glass-card rounded-2xl shadow-2xl border border-primary/20 flex flex-col overflow-hidden transition-all duration-300 ${isMinimized ? "!h-12 !w-52" : ""}`}
    >
      {/* Resizing handles */}
      {!isMinimized && (
        <>
          <Handle edge="n"  cursor="n-resize"  className="top-0 left-3 right-3 h-1.5" />
          <Handle edge="s"  cursor="s-resize"  className="bottom-0 left-3 right-3 h-1.5" />
          <Handle edge="e"  cursor="e-resize"  className="right-0 top-3 bottom-3 w-1.5" />
          <Handle edge="w"  cursor="w-resize"  className="left-0 top-3 bottom-3 w-1.5" />
          <Handle edge="se" cursor="se-resize" className="bottom-0 right-0 w-4 h-4" />
          <Handle edge="sw" cursor="sw-resize" className="bottom-0 left-0 w-4 h-4" />
          <Handle edge="ne" cursor="ne-resize" className="top-0 right-0 w-4 h-4" />
          <Handle edge="nw" cursor="nw-resize" className="top-0 left-0 w-4 h-4" />
        </>
      )}

      {/* Dragging Header */}
      <div
        onPointerDown={onHeaderPointerDown}
        onPointerMove={onHeaderPointerMove}
        onPointerUp={onHeaderPointerUp}
        className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-primary/5 cursor-grab active:cursor-grabbing rounded-t-2xl shrink-0 select-none"
      >
        <h3 className="text-xs font-heading font-bold flex items-center gap-1.5 pointer-events-none">
          <Save size={14} className="text-primary" /> Admin Matrix 
          <span className="text-[9px] font-normal px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">{syncStatus}</span>
        </h3>
        <div className="flex items-center gap-1">
          <GripHorizontal size={13} className="text-muted-foreground/30 pointer-events-none" />
          <button
            data-no-drag
            onClick={() => setIsMinimized(m => !m)}
            className="p-1 rounded hover:bg-muted/60 text-muted-foreground transition-colors ml-1"
            title={isMinimized ? "Expand" : "Collapse"}
          >
            {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Main Tabbed panel workspace */}
      {!isMinimized && (
        <div className="flex-1 flex flex-col min-h-0 bg-background/30">
          
          {/* Header Tab Actions */}
          <div className="flex border-b border-border/30 bg-muted/20 p-1 shrink-0 text-xs gap-1">
            <button
              onClick={() => setActiveTab("form")}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === "form" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              }`}
            >
              <FileText size={12} /> {editingPostId ? "Edit Post" : "Create Post"}
            </button>
            <button
              onClick={() => setActiveTab("manage")}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === "manage" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              }`}
            >
              <Search size={12} /> Manage ({allBlogs.length})
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === "preview" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              }`}
            >
              <Eye size={12} /> Live Preview
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin flex flex-col">
            {error && (
              <div className="mb-3 p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-1.5 select-none animate-in fade-in">
                <AlertCircle size={13} /> {error}
              </div>
            )}
            {successMsg && (
              <div className="mb-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-1.5 select-none animate-in fade-in">
                <Check size={13} /> {successMsg}
              </div>
            )}

            {/* TAB 1: FORM EDITOR */}
            {activeTab === "form" && (
              <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3.5">
                  {/* Title */}
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border/40 bg-background/60 text-xs focus:outline-none focus:border-primary/50 text-foreground"
                      placeholder="Title of your digital garden log..."
                      required
                    />
                  </div>

                  {/* Category Picker & Custom Input */}
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Category *</label>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {existingCategories.map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setFormData({ ...formData, category: cat })}
                          className={`px-2 py-1 rounded text-[10px] font-semibold transition-all border cursor-pointer ${
                            formData.category === cat
                              ? "bg-primary/25 border-primary text-primary"
                              : "bg-muted/30 border-border/30 text-muted-foreground hover:border-border/60 hover:text-foreground"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add new category..."
                        value={customCategoryInput}
                        onChange={e => setCustomCategoryInput(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-border/40 bg-background/60 text-xs focus:outline-none focus:border-primary/50 text-foreground"
                        onKeyDown={e => {
                          if (e.key === "Enter" && customCategoryInput.trim()) {
                            e.preventDefault();
                            setFormData({ ...formData, category: customCategoryInput.trim() });
                            setCustomCategoryInput("");
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customCategoryInput.trim()) {
                            setFormData({ ...formData, category: customCategoryInput.trim() });
                            setCustomCategoryInput("");
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/25 text-xs font-bold cursor-pointer"
                      >
                        Set
                      </button>
                    </div>
                  </div>

                  {/* Tag Suggestions & Inputs */}
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Type Tags (Comma Separated)</label>
                    <input
                      type="text"
                      placeholder="React, TypeScript, AI..."
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border/40 bg-background/60 text-xs focus:outline-none focus:border-primary/50 text-foreground"
                    />
                    {existingTags.length > 0 && (
                      <div className="mt-1.5">
                        <span className="text-[9px] text-muted-foreground/60 block mb-1">Quick Picks:</span>
                        <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto pr-1">
                          {existingTags.map(tag => {
                            const tagsArray = formData.type.split(",").map(t => t.trim()).filter(Boolean);
                            const active = tagsArray.includes(tag);
                            return (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => {
                                  if (active) {
                                    setFormData({
                                      ...formData,
                                      type: tagsArray.filter(t => t !== tag).join(", "),
                                    });
                                  } else {
                                    setFormData({
                                      ...formData,
                                      type: [...tagsArray, tag].join(", "),
                                    });
                                  }
                                }}
                                className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border tracking-wider transition-all cursor-pointer ${
                                  active
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-muted/10 border-border/25 text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                {active ? "✓ " : "+ "}{tag}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* External Link & Display Text */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">External Link URL</label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={formData.link}
                        onChange={e => setFormData({ ...formData, link: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-border/40 bg-background/60 text-xs focus:outline-none focus:border-primary/50 text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Link Display Text</label>
                      <input
                        type="text"
                        placeholder="e.g. Read Github Code"
                        value={formData.linkText}
                        onChange={e => setFormData({ ...formData, linkText: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-border/40 bg-background/60 text-xs focus:outline-none focus:border-primary/50 text-foreground"
                      />
                    </div>
                  </div>

                  {/* Content (MD) & Markdown Formatting Toolbar */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Content (Markdown)</label>
                      
                      {/* Markdown Toolbar */}
                      <div className="flex gap-0.5 bg-muted/30 border border-border/30 p-0.5 rounded text-muted-foreground select-none">
                        <button type="button" onClick={() => insertMarkdown("**", "**")} className="p-1 rounded hover:bg-primary/20 hover:text-primary transition-all" title="Bold"><Bold size={11} /></button>
                        <button type="button" onClick={() => insertMarkdown("*", "*")} className="p-1 rounded hover:bg-primary/20 hover:text-primary transition-all" title="Italic"><Italic size={11} /></button>
                        <button type="button" onClick={() => insertMarkdown("<u>", "</u>")} className="p-1 rounded hover:bg-primary/20 hover:text-primary transition-all" title="Underline"><Underline size={11} /></button>
                        <button type="button" onClick={() => insertMarkdown("`", "`")} className="p-1 rounded hover:bg-primary/20 hover:text-primary transition-all" title="Code"><Code size={11} /></button>
                        <button type="button" onClick={() => insertMarkdown("- ")} className="p-1 rounded hover:bg-primary/20 hover:text-primary transition-all" title="Bullet List"><List size={11} /></button>
                        <button type="button" onClick={() => insertMarkdown("1. ")} className="p-1 rounded hover:bg-primary/20 hover:text-primary transition-all" title="Numbered List"><ListOrdered size={11} /></button>
                        <button type="button" onClick={() => insertMarkdown("[", "](https://)")} className="p-1 rounded hover:bg-primary/20 hover:text-primary transition-all" title="Link"><LinkIcon size={11} /></button>
                      </div>
                    </div>

                    <textarea
                      ref={textareaRef}
                      rows={7}
                      value={formData.content}
                      onChange={e => setFormData({ ...formData, content: e.target.value })}
                      className="w-full bg-background/60 border border-border/40 rounded-lg p-2 text-xs focus:outline-none focus:border-primary/50 font-mono resize-none leading-relaxed text-foreground"
                      placeholder="Write your blog post in Markdown format here..."
                      required
                    />
                  </div>

                  {/* Resources Links */}
                  <div className="pt-2 border-t border-border/20">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Attached Resources</label>
                      <button type="button" onClick={addResource} className="text-[10px] text-primary hover:underline flex items-center gap-0.5 cursor-pointer">
                        <Plus size={11} /> Add Resource
                      </button>
                    </div>
                    <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                      {resources.length === 0 && (
                        <span className="text-[10px] italic text-muted-foreground/50">No resources linked yet.</span>
                      )}
                      {resources.map((res, i) => (
                        <div key={i} className="flex gap-2 items-center bg-muted/20 p-1.5 rounded-lg border border-border/30">
                          <LinkIcon size={12} className="text-muted-foreground shrink-0" />
                          <input
                            placeholder="Resource label"
                            value={res.label}
                            onChange={e => updateResource(i, "label", e.target.value)}
                            className="w-[38%] bg-transparent border-none text-[10px] text-foreground focus:outline-none"
                          />
                          <input
                            placeholder="https://"
                            value={res.url}
                            onChange={e => updateResource(i, "url", e.target.value)}
                            className="flex-1 bg-transparent border-none text-[10px] text-foreground focus:outline-none"
                          />
                          <button type="button" onClick={() => removeResource(i)} className="text-destructive hover:bg-destructive/10 p-1 rounded cursor-pointer">
                            <Trash2 size={11} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Submit actions footer */}
                <div className="flex items-center justify-between pt-3 mt-4 border-t border-border/25">
                  <div className="flex gap-2 text-xs font-semibold text-muted-foreground select-none">
                    <Tooltip text="⭐ Featured posts appear with a gold star badge.">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.featured}
                          onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                          className="accent-primary w-3.5 h-3.5 rounded"
                        />
                        <Star size={12} className={formData.featured ? "fill-yellow-500 text-yellow-500" : ""} />
                        Featured
                      </label>
                    </Tooltip>
                    
                    <Tooltip text="🔒 Draft posts are hidden from public visitors.">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.draft}
                          onChange={e => setFormData({ ...formData, draft: e.target.checked })}
                          className="accent-primary w-3.5 h-3.5 rounded"
                        />
                        <EyeOff size={12} className={formData.draft ? "text-amber-500" : ""} />
                        Draft
                      </label>
                    </Tooltip>
                  </div>

                  <div className="flex gap-2">
                    {editingPostId && (
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold border border-border/40 hover:bg-muted text-muted-foreground transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg font-bold text-xs flex items-center gap-1.5 hover:bg-primary/95 disabled:opacity-50 transition-colors shadow-lg cursor-pointer"
                    >
                      {loading ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                      {editingPostId ? "Save Changes" : "Commit Push"}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* TAB 2: MANAGE POSTS */}
            {activeTab === "manage" && (
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  {/* Search and Filters */}
                  <div className="space-y-2 mb-3.5 select-none">
                    <div className="relative">
                      <Search size={13} className="absolute left-2.5 top-2.5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search posts..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border/40 bg-background/60 text-xs focus:outline-none focus:border-primary/50 text-foreground"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">Category</span>
                        <select
                          value={filterCategory}
                          onChange={e => setFilterCategory(e.target.value)}
                          className="w-full bg-background border border-border/40 rounded-lg p-1.5 text-xs focus:outline-none focus:border-primary/40 text-foreground"
                        >
                          <option value="All">All Categories</option>
                          {existingCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">Status</span>
                        <select
                          value={filterStatus}
                          onChange={e => setFilterStatus(e.target.value)}
                          className="w-full bg-background border border-border/40 rounded-lg p-1.5 text-xs focus:outline-none focus:border-primary/40 text-foreground"
                        >
                          <option value="All">All Statuses</option>
                          <option value="Published">Live</option>
                          <option value="Draft">Drafts Only</option>
                          <option value="Featured">Featured Only</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Blog Post List */}
                  <div className="space-y-2">
                    {paginatedBlogs.length === 0 ? (
                      <p className="text-center py-10 text-xs text-muted-foreground/60 italic border border-dashed border-border/30 rounded-xl">
                        No logs matched your criteria.
                      </p>
                    ) : (
                      paginatedBlogs.map(b => (
                        <div key={b.id} className="p-3 bg-muted/15 border border-border/30 rounded-xl hover:border-primary/30 transition-all flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">{b.category}</span>
                              {b.featured && <Star size={10} className="fill-yellow-500 text-yellow-500 shrink-0" />}
                              {b.draft && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-widest scale-90 origin-left">Draft</span>}
                              <span className="text-[9px] text-muted-foreground/60 font-mono">{b.date}</span>
                            </div>
                            <h4 className="font-bold text-xs truncate text-foreground/90 leading-tight">{b.title}</h4>
                            <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{b.content.substring(0, 100)}</p>
                          </div>
                          
                          <div className="flex gap-1 shrink-0 select-none">
                            <button
                              onClick={() => startEditPost(b)}
                              className="p-1.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                              title="Edit Log"
                            >
                              <Edit3 size={11} />
                            </button>
                            <button
                              onClick={() => handleDeletePost(b)}
                              className="p-1.5 rounded bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors cursor-pointer"
                              title="Delete Log"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t border-border/20 mt-4 text-xs font-semibold select-none">
                    <button
                      onClick={() => setManagePage(p => Math.max(1, p - 1))}
                      disabled={managePage === 1}
                      className="px-2.5 py-1 rounded border border-border/40 hover:bg-muted disabled:opacity-30 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft size={11} /> Prev
                    </button>
                    <span className="text-muted-foreground text-[10px]">
                      Page {managePage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setManagePage(p => Math.min(totalPages, p + 1))}
                      disabled={managePage === totalPages}
                      className="px-2.5 py-1 rounded border border-border/40 hover:bg-muted disabled:opacity-30 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      Next <ChevronRight size={11} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: LIVE PREVIEW */}
            {activeTab === "preview" && (
              <div className="flex-1 flex flex-col space-y-4">
                <div className="border-b border-border/30 pb-2 flex items-center justify-between">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1 select-none">
                    <Eye size={12} className="text-primary" /> Live Preview Pane
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-bold uppercase tracking-wider">{formData.category}</span>
                </div>
                
                <div className="flex-1 overflow-y-auto max-h-[400px] pr-1 leading-relaxed text-left scrollbar-thin select-text">
                  <h2 className="text-lg font-bold font-heading text-foreground mb-1">
                    {formData.title || "Untitled Post"}
                  </h2>
                  
                  {formData.link && (
                    <div className="mb-4">
                      <a 
                        href={formData.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs text-primary hover:underline font-bold inline-flex items-center gap-0.5"
                      >
                        {formData.linkText || "External Link"} <LinkIcon size={10} />
                      </a>
                    </div>
                  )}

                  <div className="prose prose-invert prose-xs max-w-none 
                                  prose-headings:font-heading prose-headings:font-bold prose-headings:text-foreground
                                  prose-strong:text-foreground prose-strong:font-bold
                                  prose-code:text-primary prose-code:bg-primary/5 prose-code:px-1 prose-code:py-0.5 prose-code:rounded-md
                                  prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:py-0.5 prose-blockquote:px-3 prose-blockquote:rounded-r-lg
                                  text-muted-foreground text-xs leading-relaxed">
                    {formData.content ? (
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]} 
                        rehypePlugins={[rehypeRaw]}
                        components={{
                          a: ({ node, ...props }) => (
                            <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5" />
                          ),
                          p: ({ node, ...props }) => (
                            <p {...props} className="whitespace-pre-wrap mb-4" />
                          )
                        }}
                      >
                        {formData.content}
                      </ReactMarkdown>
                    ) : (
                      <p className="italic text-muted-foreground/40">No content drafted yet. Switch to the editor and write content to see it here.</p>
                    )}
                    {resources && resources.length > 0 && (
                      <div className="mt-6 border-t border-border/30 pt-4">
                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-2 select-none">
                          <BookOpen size={12} className="text-primary" /> Attached Resources
                        </h4>
                        <div className="grid grid-cols-1 gap-1.5">
                          {resources.map((res, idx) => (
                            <div key={idx} className="flex justify-between items-center p-2 rounded-lg border border-border/40 bg-muted/15 text-[10px]">
                              <span className="flex items-center gap-1.5 font-medium">
                                <LinkIcon size={10} className="text-primary" />
                                {res.label}
                              </span>
                              <span className="text-[9px] text-muted-foreground break-all">{res.url}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
