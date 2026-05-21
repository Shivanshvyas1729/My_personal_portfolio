import React, { useState, useMemo } from 'react';
import { BookOpen, Edit3, Trash2, X, Star, EyeOff, Save, Plus, Calendar, Clock, Link as LinkIcon, Eye, Tag, Hash } from 'lucide-react';
import { useCMSState } from '@/context/CMSContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { getLocalImage } from '@/lib/localImageStore';
import { convertToRawGitHubUrl } from './FormHelpers';
import { SpaciousMarkdownNotepad } from './SpaciousMarkdownNotepad';
import { useTheme } from '@/hooks/useTheme';


// ── Default preset categories (always shown as quick picks) ─────────────────
const DEFAULT_CATEGORIES = ['Thoughts', 'Notes', 'Books', 'Links'];


interface BlogsAdminProps {
  blogs: any[];
  onChange: (blogs: any[]) => void;
  onSave: (data?: any[]) => Promise<{ success: boolean; error?: string } | undefined>;
  isLoading: boolean;
  mode: "local" | "github" | "unknown";
}

// ─── Dedicated Blog Post Form ────────────────────────────────────────────────
const BlogPostForm: React.FC<{ blog: any; onChange: (b: any) => void; allBlogs: any[] }> = ({ blog, onChange, allBlogs }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // ── Category + Type tag state ──────────────────────────────────────────────
  const [tagInput, setTagInput] = useState('');
  const [catInput, setCatInput] = useState('');

  const [isNotepadOpen, setIsNotepadOpen] = useState(false);
  const [localContent, setLocalContent] = useState(blog.content || '');
  const [hasDraft, setHasDraft] = useState(false);
  const draftKey = `cms-notepad-draft-blog-${blog.id}`;

  // Sync local content when blog changes (e.g. switching posts)
  React.useEffect(() => { setLocalContent(blog.content || ''); }, [blog.id]);

  // Collect all unique type tags from existing blogs — normalized to Title Case
  const allTypeSuggestions = useMemo(() => {
    const set = new Set<string>();
    for (const b of allBlogs) {
      if (Array.isArray(b.type)) {
        for (const t of b.type) {
          if (t && typeof t === 'string') {
            set.add(t.trim().toLowerCase()
              .split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
          }
        }
      }
    }
    return Array.from(set).sort();
  }, [allBlogs]);

  const currentTypes: string[] = Array.isArray(blog.type) ? blog.type : [];

  const normalizeTag = (t: string) =>
    t.trim().toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const addTag = (raw: string) => {
    const tag = normalizeTag(raw);
    if (!tag) return;
    if (currentTypes.some(t => t.toLowerCase() === tag.toLowerCase())) return; // deduplicate
    onChange({ ...blog, type: [...currentTypes, tag] });
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    onChange({ ...blog, type: currentTypes.filter(t => t !== tag) });
  };

  const field = 'text-sm font-medium text-muted-foreground uppercase tracking-wider block mb-1.5';
  const input = 'w-full px-3 py-2.5 rounded-lg border border-border/40 bg-background/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all text-foreground';

  return (
    <div className="space-y-5">

      {/* Title */}
      <div>
        <label className={field}>Title *</label>
        <input type="text" value={blog.title || ''} onChange={e => onChange({ ...blog, title: e.target.value })}
          className={input} placeholder="Post title..." />
      </div>

      {/* ── CATEGORY — dynamic picker + custom input ──────────────────────── */}
      <div>
        <label className={field}>Category *</label>
        <p className="text-[10px] text-muted-foreground/60 mb-2">
          Pick a preset or type a new one — it will appear as a filter tab on the blog page.
        </p>

        {/* All known categories: presets + any already used in other posts */}
        {(() => {
          const usedInBlogs = Array.from(
            new Set(
              allBlogs
                .map(b => (typeof b.category === 'string' ? b.category.trim() : ''))
                .filter(Boolean)
            )
          ).sort();
          const allCats = Array.from(new Set([...DEFAULT_CATEGORIES, ...usedInBlogs]));
          return (
            <div className="flex flex-wrap gap-2 mb-3">
              {allCats.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onChange({ ...blog, category: cat })}
                  className={`px-3 py-2 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                    blog.category === cat
                      ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_12px_hsl(var(--primary)/0.35)]'
                      : DEFAULT_CATEGORIES.includes(cat)
                        ? 'bg-muted/20 border-border/40 text-muted-foreground hover:bg-muted/40 hover:text-foreground hover:border-border/70'
                        : 'bg-accent/10 border-accent/30 text-accent hover:bg-accent/20 hover:border-accent/60'
                  }`}
                >
                  {cat}
                  {!DEFAULT_CATEGORIES.includes(cat) && (
                    <span className="ml-1.5 text-[9px] opacity-60 font-normal">custom</span>
                  )}
                </button>
              ))}
            </div>
          );
        })()}

        {/* Add a new custom category */}
        <div className="flex gap-2">
          <input
            type="text"
            value={catInput}
            onChange={e => setCatInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && catInput.trim()) {
                e.preventDefault();
                const cat = catInput.trim();
                onChange({ ...blog, category: cat });
                setCatInput('');
              }
            }}
            className={`${input} flex-1`}
            placeholder="New custom category (e.g. Research, Tutorials…)"
          />
          <button
            type="button"
            disabled={!catInput.trim()}
            onClick={() => {
              const cat = catInput.trim();
              if (cat) { onChange({ ...blog, category: cat }); setCatInput(''); }
            }}
            className="px-3 py-2 rounded-lg bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 disabled:opacity-40 cursor-pointer transition-all flex items-center gap-1 text-xs font-bold"
          >
            <Plus size={13} /> Create
          </button>
        </div>
        {blog.category && (
          <p className="text-[10px] mt-1.5 text-muted-foreground/60">
            Selected: <strong className="text-foreground/80">{blog.category}</strong>
          </p>
        )}
      </div>


      {/* ── TYPE — case-normalized tag manager with deduplication ─────────── */}
      <div>
        <label className={field}>Type Tags</label>
        <p className="text-[10px] text-muted-foreground/60 mb-2">
          Sub-tags shown below the category bar. They appear in uppercase on the blog page.
        </p>

        {/* Current tags */}
        <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
          {currentTypes.length === 0 && (
            <span className="text-[11px] text-muted-foreground/50 italic">No tags added yet.</span>
          )}
          {currentTypes.map(tag => (
            <span key={tag}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[11px] font-semibold uppercase tracking-wider">
              {tag}
              <button type="button" onClick={() => removeTag(tag)}
                className="ml-0.5 hover:text-destructive transition-colors cursor-pointer">
                <X size={10} />
              </button>
            </span>
          ))}
        </div>

        {/* Add tag input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => {
              if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
                e.preventDefault();
                addTag(tagInput);
              }
            }}
            className={`${input} flex-1`}
            placeholder="Type a tag and press Enter…"
          />
          <button type="button" onClick={() => addTag(tagInput)}
            disabled={!tagInput.trim()}
            className="px-3 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 disabled:opacity-40 cursor-pointer transition-all flex items-center gap-1 text-xs font-bold">
            <Plus size={13} /> Add
          </button>
        </div>

        {/* Suggestions from existing blogs */}
        {allTypeSuggestions.length > 0 && (
          <div className="mt-3">
            <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider mb-1.5">Used in other posts:</p>
            <div className="flex flex-wrap gap-1.5">
              {allTypeSuggestions.map(tag => {
                const already = currentTypes.some(t => t.toLowerCase() === tag.toLowerCase());
                return (
                  <button key={tag} type="button"
                    disabled={already}
                    onClick={() => addTag(tag)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider transition-all cursor-pointer ${
                      already
                        ? 'bg-primary/10 text-primary border-primary/20 opacity-50 cursor-not-allowed'
                        : 'bg-muted/20 border-border/40 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30'
                    }`}>
                    {already ? '✓ ' : '+ '}{tag}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Excerpt (Card Details) ─────────── */}
      <div>
        <label className={field}>Card Details / Excerpt (Optional)</label>
        <p className="text-[10px] text-muted-foreground/60 mb-2">
          This text appears on the blog card. If left blank, it auto-generates from the first few lines of your content.
        </p>
        <textarea
          value={blog.excerpt || ''}
          onChange={e => onChange({ ...blog, excerpt: e.target.value })}
          className={`${input} min-h-[60px] resize-y`}
          placeholder="Brief summary for the blog card..."
        />
      </div>

      {/* Content — opens Notepad */}
      <div>
        <label className={field}>Content * (Markdown)</label>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-muted-foreground/60 italic">Click below to edit in full Markdown notepad</span>
          <button type="button" onClick={() => setIsNotepadOpen(true)}
            className="text-[10px] font-bold text-primary hover:text-primary-foreground hover:bg-primary/20 border border-primary/20 px-2 py-0.5 rounded transition-all bg-primary/5 flex items-center gap-1">
            📝 Fullscreen Notepad
          </button>
        </div>
        <textarea
          value={localContent}
          onClick={() => setIsNotepadOpen(true)}
          readOnly
          className="w-full bg-background/50 hover:bg-background/80 border border-border/30 hover:border-border/60 rounded-lg p-3 text-xs font-mono leading-relaxed cursor-pointer transition-all min-h-[90px] resize-y text-foreground/80"
          placeholder="Click to open Markdown editor…"
        />
        <SpaciousMarkdownNotepad
          isNotepadOpen={isNotepadOpen}
          setIsNotepadOpen={setIsNotepadOpen}
          localValue={localContent}
          setLocalValue={setLocalContent}
          onChange={(val) => { setLocalContent(val); onChange({ ...blog, content: val }); }}
          fieldKey="content"
          isDark={isDark}
          draftKey={draftKey}
          hasDraft={hasDraft}
          setHasDraft={setHasDraft}
          data={blog.content || ''}
        />
      </div>

      {/* Date, Reading Time row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={field}>Date</label>
          <input type="date" value={blog.date || ''} onChange={e => onChange({ ...blog, date: e.target.value })}
            className={input} />
        </div>
        <div>
          <label className={field}>Reading Time (min)</label>
          <input type="number" min="1" value={blog.readingTime || ''}
            onChange={e => onChange({ ...blog, readingTime: e.target.value ? Number(e.target.value) : undefined })}
            className={input} placeholder="Auto-calculated" />
        </div>
      </div>

      {/* Slug */}
      <div>
        <label className={field}>Slug <span className="text-muted-foreground/50 normal-case font-normal">(optional URL identifier)</span></label>
        <input type="text" value={blog.slug || ''} onChange={e => onChange({ ...blog, slug: e.target.value })}
          className={input} placeholder="e.g. my-post-about-pandas" />
      </div>

      {/* Link */}
      <div>
        <label className={field}>External Link <span className="text-muted-foreground/50 normal-case font-normal">(optional)</span></label>
        <input type="url" value={blog.link || ''} onChange={e => onChange({ ...blog, link: e.target.value })}
          className={input} placeholder="https://..." />
      </div>

      {/* Toggles */}
      <div className="flex items-center gap-4 flex-wrap">
        {[
          { key: 'featured', label: '⭐ Featured', color: 'yellow' },
          { key: 'draft', label: '🔒 Draft', color: 'amber' },
        ].map(({ key, label, color }) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange({ ...blog, [key]: !blog[key] })}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
              blog[key]
                ? 'bg-primary/15 text-primary border-primary/30 shadow-sm'
                : 'bg-muted/20 border-border/30 text-muted-foreground hover:border-border/60'
            }`}
          >
            <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
              blog[key] ? 'bg-primary border-primary' : 'border-border/50'
            }`}>
              {blog[key] && <span className="w-2 h-2 rounded-full bg-white" />}
            </span>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── Main BlogsAdmin component ────────────────────────────────────────────────
export const BlogsAdmin: React.FC<BlogsAdminProps> = ({ blogs, onChange, onSave, isLoading, mode }) => {
  const { liveData } = useCMSState();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [tempBlog, setTempBlog] = useState<any>({});
  const [saveError, setSaveError] = useState('');
  const [previewTab, setPreviewTab] = useState<'card' | 'detailed'>('card');

  const hasPendingChanges = JSON.stringify(blogs) !== JSON.stringify(liveData.blog);

  const handleEdit = (blog: any) => {
    setTempBlog({ ...blog });
    setEditingId(blog.id);
  };

  const handleAddNew = () => {
    const highestId = blogs.reduce((max, b) => (b.id || 0) > max ? b.id : max, 0);
    setTempBlog({
      id: highestId + 1,
      title: "",
      content: "",
      category: "Notes",
      type: [],
      featured: false,
      draft: true,
      date: new Date().toISOString().split('T')[0]
    });
    setAddingNew(true);
  };

  const saveEdit = () => {
    if (!tempBlog.title || !tempBlog.content) {
      alert("Title and Content are required.");
      return;
    }

    let updated: any[];
    if (addingNew) {
      updated = [tempBlog, ...blogs];
    } else {
      updated = blogs.map(b => b.id === tempBlog.id ? tempBlog : b);
    }
    onChange(updated);
    closeModal();
    return updated;
  };

  const deleteBlog = (id: number) => {
    if (confirm("Are you sure you want to delete this blog post?")) {
      onChange(blogs.filter(b => b.id !== id));
    }
  };

  const closeModal = () => {
    setEditingId(null);
    setAddingNew(false);
    setTempBlog({});
  };

  const isModalOpen = editingId !== null || addingNew;

  return (
    <div className="flex flex-col h-full bg-background relative">
      <div className="flex items-center justify-between mb-4 px-4 pt-4 shrink-0">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-foreground font-heading">Manage Blogs</h3>
          {hasPendingChanges && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-bold uppercase tracking-wider border border-amber-500/20">
              Pending Changes
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAddNew}
            className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 transition-colors rounded-lg text-sm font-medium flex items-center gap-1.5"
          >
            <Plus size={14} /> New Post
          </button>
          <button
            onClick={async () => {
              setSaveError("");
              const result = await onSave();
              if (result && !result.success) {
                setSaveError(result.error || "Save failed. Check the Logs tab for details.");
              }
            }}
            disabled={isLoading || !hasPendingChanges}
            className="px-4 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-1.5"
          >
            {isLoading ? <><span className="animate-spin inline-block w-3 h-3 border border-white/30 border-t-white rounded-full" /> Saving...</> : (mode === 'local' ? "Save to Local" : "Save to GitHub")}
          </button>
        </div>
      </div>
      
      {saveError && (
        <div className="mx-4 mb-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs font-medium">
          ⚠️ {saveError}
        </div>
      )}

      {/* Grid of Blogs */}
      <div data-lenis-prevent="true" className="flex-1 overflow-y-auto px-4 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {blogs.map(b => (
            <div key={b.id} className="group glass-card border border-border/50 rounded-xl p-4 flex flex-col hover:border-primary/40 transition-colors relative">
              <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(b)} className="p-1.5 bg-muted hover:bg-primary/10 hover:text-primary rounded text-muted-foreground transition-colors">
                  <Edit3 size={14} />
                </button>
                <button onClick={() => deleteBlog(b.id)} className="p-1.5 bg-muted hover:bg-destructive/10 hover:text-destructive rounded text-muted-foreground transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
              
              <div className="flex items-start gap-2 mb-2 pr-16">
                {b.featured && <Star size={14} className="text-yellow-500 fill-yellow-500 mt-1 shrink-0" />}
                <h4 className="font-bold text-foreground leading-tight">{b.title}</h4>
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                 <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground font-bold uppercase tracking-wider">{b.category}</span>
                 {b.draft && (
                   <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold uppercase tracking-wider flex items-center gap-1">
                     <EyeOff size={10} /> Draft
                   </span>
                 )}
                 <span className="text-[10px] text-muted-foreground ml-auto">{b.date}</span>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{b.content}</p>
              
              <div className="mt-auto flex items-center gap-3">
                <div className="flex gap-1 flex-wrap">
                  {b.type?.slice(0, 3).map((t: string) => (
                    <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor Modal */}
      <div className={`absolute inset-0 z-50 flex flex-col overflow-hidden rounded-xl transition-all duration-500 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] ${
        isModalOpen 
          ? 'opacity-100 pointer-events-auto visible' 
          : 'opacity-0 pointer-events-none invisible translate-y-4 scale-[0.98]'
      }`}>
        <div className={`absolute inset-0 bg-background/60 backdrop-blur-sm transition-opacity duration-500 ${
          isModalOpen ? 'opacity-100' : 'opacity-0'
        }`} onClick={closeModal} />
        <div className={`glass-card shadow-2xl border-l border-border/50 flex flex-col h-full absolute right-0 top-0 bottom-0 w-full max-w-full transition-all duration-500 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] ${
          isModalOpen ? 'translate-y-0 scale-100' : 'translate-y-8 scale-[0.96]'
        }`}>
           <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/20 shrink-0">
             <h3 className="font-bold">{addingNew ? "New Post" : "Edit Post"}</h3>
             <button onClick={closeModal} className="p-1.5 rounded hover:bg-muted/60 text-muted-foreground transition-colors">
               <X size={16} />
             </button>
           </div>
           
           {/* Side-by-Side Editor & Live Preview Workspace */}
           <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
             {/* Left Column: Form Editor */}
             <div data-lenis-prevent="true" className="w-full md:w-1/2 border-r border-border/50 overflow-y-auto p-5 scrollbar-thin">
                <BlogPostForm
                   blog={tempBlog}
                   onChange={setTempBlog}
                   allBlogs={blogs}
                 />
             </div>
             
             {/* Right Column: Interactive Live Preview Pane */}
             <div data-lenis-prevent="true" className="w-full md:w-1/2 bg-muted/10 overflow-y-auto p-6 flex flex-col gap-6 scrollbar-thin">
               <div className="flex items-center justify-between border-b border-border/40 pb-3 shrink-0">
                 <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 select-none">
                   <Eye size={14} className="text-primary animate-pulse" /> Live Preview
                 </h4>
                 <div className="flex bg-muted/50 p-0.5 rounded-lg border border-border/40 text-[10px] select-none">
                   <button 
                     onClick={() => setPreviewTab('card')}
                     className={`px-2.5 py-1 rounded-md font-medium transition-all ${previewTab === 'card' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                   >
                     Card View
                   </button>
                   <button 
                     onClick={() => setPreviewTab('detailed')}
                     className={`px-2.5 py-1 rounded-md font-medium transition-all ${previewTab === 'detailed' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                   >
                     Detailed View
                   </button>
                 </div>
               </div>
               
               <div className="flex-1 min-h-0 flex items-center justify-center">
                 {previewTab === 'card' ? (
                   <div className="w-full max-w-md mx-auto p-2">
                     {/* Replica of BlogCard for Visual Preview */}
                     <article className={`glass-card p-6 md:p-8 rounded-2xl border border-border/60 hover:border-primary/45 transition-all duration-300 relative flex flex-col bg-background/50 h-full ${tempBlog.draft ? 'border-dashed border-destructive/50 opacity-80' : ''}`}>
                       <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                         <div className="flex flex-wrap items-center gap-2">
                           <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20">
                             {tempBlog.category || "Thoughts"}
                           </span>
                           {tempBlog.featured && (
                             <span className="text-xs font-medium px-2 py-1 rounded-md bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 flex items-center gap-1">
                               Featured
                             </span>
                           )}
                           {tempBlog.draft && (
                             <span className="text-xs font-medium px-2 py-1 rounded-md bg-destructive/10 text-destructive border border-destructive/20 flex items-center gap-1">
                               Draft
                             </span>
                           )}
                         </div>
                         <div className="flex items-center gap-3 text-xs text-muted-foreground whitespace-nowrap">
                           <span className="flex items-center gap-1"><Calendar size={12} /> {tempBlog.date || new Date().toISOString().split('T')[0]}</span>
                           <span className="flex items-center gap-1">
                             <Clock size={12} /> 
                             {tempBlog.readingTime || Math.max(1, Math.ceil((tempBlog.content || "").trim().split(/\s+/).filter(Boolean).length / 200))} min read
                           </span>
                         </div>
                       </div>
                       
                       <h2 className="text-xl md:text-2xl font-bold font-heading mb-3 text-foreground">
                         {tempBlog.title || "Untitled Post Title"}
                       </h2>
                       
                       <div className="text-muted-foreground text-sm leading-relaxed mb-5 prose prose-invert prose-sm max-w-none prose-p:my-0 prose-ul:my-0 prose-li:my-0 prose-ul:pl-4">
                         {tempBlog.excerpt ? (
                           <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{tempBlog.excerpt}</ReactMarkdown>
                         ) : (
                           <p>{tempBlog.content ? (tempBlog.content.split("\n")[0].substring(0, 150) + "...") : "Type content in the editor to see it here..."}</p>
                         )}
                       </div>
                       
                       {tempBlog.type && tempBlog.type.length > 0 && (
                         <div className="flex flex-wrap gap-1.5 mt-auto pt-4 border-t border-border/30">
                           {tempBlog.type.map((tag: string, idx: number) => (
                             <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50 uppercase tracking-widest">
                               {tag}
                             </span>
                           ))}
                         </div>
                       )}
                     </article>
                   </div>
                 ) : (
                   /* Replica of BlogModal for detailed rich content markdown preview */
                   <div className="w-full h-full flex flex-col bg-background/40 backdrop-blur-md border border-border/50 shadow-xl rounded-2xl overflow-hidden min-h-[350px]">
                      <div className="p-6 border-b border-border/40 bg-muted/20 pb-5 pr-6">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20">
                            {tempBlog.category || "Thoughts"}
                          </span>
                          {tempBlog.featured && (
                            <span className="text-xs font-medium px-2 py-1 rounded-md bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 flex items-center gap-1">
                              Featured
                            </span>
                          )}
                          {tempBlog.draft && (
                            <span className="text-xs font-medium px-2 py-1 rounded-md bg-destructive/10 text-destructive border border-destructive/20 flex items-center gap-1">
                              Draft
                            </span>
                          )}
                        </div>
                        
                        <h2 className="text-xl md:text-2xl font-heading font-bold text-foreground leading-tight text-left">
                          {tempBlog.title || "Untitled Post Title"}
                        </h2>
                        
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-3">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-primary" />
                            {tempBlog.date || new Date().toISOString().split('T')[0]}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock size={14} className="text-primary" />
                            {tempBlog.readingTime || Math.max(1, Math.ceil((tempBlog.content || "").trim().split(/\s+/).filter(Boolean).length / 200))} min read
                          </div>
                        </div>
                      </div>
                      
                      <div data-lenis-prevent="true" className="flex-1 overflow-y-auto p-6 leading-relaxed scrollbar-thin">
                        <div className="prose prose-invert prose-sm max-w-none 
                                        prose-headings:font-heading prose-headings:font-bold prose-headings:text-foreground
                                        prose-strong:text-foreground prose-strong:font-bold
                                        prose-code:text-primary prose-code:bg-primary/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md
                                        prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                                        leading-relaxed text-muted-foreground text-left">
                          {tempBlog.content ? (
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              rehypePlugins={[rehypeRaw]}
                              components={{
                                img: ({ node, ...props }) => {
                                  let src = props.src;
                                  if (src?.startsWith('https://local.image/')) {
                                    const b64 = getLocalImage(src);
                                    if (b64) src = `data:image/webp;base64,${b64}`;
                                  } else if (src) {
                                    src = convertToRawGitHubUrl(src);
                                  }
                                  return (
                                    <div className="my-8 flex flex-col items-center gap-2 group/img">
                                      <img 
                                        {...props}
                                        src={src}
                                        className="rounded-2xl border border-border/60 max-h-[350px] w-auto max-w-full object-contain shadow-2xl hover:border-primary/40 hover:scale-[1.01] transition-all duration-300" 
                                        loading="lazy" 
                                      />
                                      {props.alt && (
                                        <span className="text-[10px] text-muted-foreground/75 italic select-none">
                                          {props.alt}
                                        </span>
                                      )}
                                    </div>
                                  );
                                },
                                table: ({ node, ...props }) => (
                                  <div className="overflow-x-auto my-4 border border-border/40 rounded-xl shadow-md bg-card/25">
                                    <table {...props} className="min-w-full divide-y divide-border/30 text-xs" />
                                  </div>
                                ),
                                th: ({ node, ...props }) => (
                                  <th {...props} className="px-3 py-2 bg-muted/40 font-bold text-foreground text-left" />
                                ),
                                td: ({ node, ...props }) => (
                                  <td {...props} className="px-3 py-2 border-t border-border/20 text-muted-foreground" />
                                ),
                                a: ({ node, ...props }) => (
                                  <a 
                                    {...props} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-primary font-medium hover:underline inline-flex items-center gap-0.5"
                                  />
                                ),
                                blockquote: ({ node, ...props }) => (
                                  <blockquote 
                                    {...props} 
                                    className="border-l-4 border-primary bg-primary/5 py-2 px-4 rounded-r-xl my-4 not-italic font-medium text-foreground/90 shadow-sm"
                                  />
                                )
                              }}
                            >
                              {tempBlog.content}
                            </ReactMarkdown>
                          ) : (
                            <p className="text-muted-foreground italic">Add markdown content in the editor to see it rendered here...</p>
                          )}
                        </div>
                        
                        {tempBlog.resources && tempBlog.resources.length > 0 && (
                          <div className="mt-8 border-t border-border/40 pt-6">
                            <h3 className="text-xs font-heading font-semibold flex items-center gap-2 mb-3">
                              <BookOpen size={14} className="text-primary" /> Attached Resources
                            </h3>
                            <div className="grid grid-cols-1 gap-2">
                              {tempBlog.resources.map((res: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-border/50 bg-muted/20">
                                  <span className="flex items-center gap-2 font-medium text-xs">
                                    <LinkIcon size={12} className="text-primary" />
                                    {res.label}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground break-all">{res.url}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {tempBlog.type && tempBlog.type.length > 0 && (
                          <div className="mt-6 flex flex-wrap gap-1.5">
                            {tempBlog.type.map((tag: string, idx: number) => (
                              <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/5 text-primary border border-primary/20 uppercase tracking-widest font-semibold">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                   </div>
                 )}
               </div>
             </div>
           </div>

           <div className="p-4 border-t border-border/50 bg-muted/10 flex justify-end gap-2 shrink-0">
             <button onClick={closeModal} className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted text-muted-foreground transition-colors">
               Cancel
             </button>
             <button onClick={saveEdit} className="px-4 py-2 bg-primary/20 text-primary rounded-lg text-sm font-medium hover:bg-primary/30 transition-colors">
               Apply to Preview
             </button>
             <button 
               onClick={async () => {
                 const updated = saveEdit();
                 if (updated) setTimeout(() => onSave(updated), 0);
               }} 
               className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg flex items-center gap-2"
             >
               <Save size={14} />
               Apply & {mode === 'local' ? "Save" : "Push"}
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};
