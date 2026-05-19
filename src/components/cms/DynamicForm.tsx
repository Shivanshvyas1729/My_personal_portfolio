import React from 'react';
import { z } from 'zod';
import { Plus, Trash2, Image as ImageIcon, Video, ExternalLink, ArrowUp, ArrowDown, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useCMSState } from '@/context/CMSContext';

// ─── Enum Option Icons ────────────────────────────────────────────────────────
const ENUM_ICONS: Record<string, string> = {
  image: '🖼️',
  video: '🎬',
  iframe: '🌐',
  pdf: '📄',
};

// ─── Media Preview ────────────────────────────────────────────────────────────
const MediaPreview = ({ url, type }: { url: string; type?: string }) => {
  if (!url) return null;
  const isVideo = type === 'video' || /\.(mp4|webm|mov)/i.test(url) || /youtube|vimeo/i.test(url);
  return (
    <div className="mt-2 w-full h-28 rounded-lg bg-muted/30 border border-border/50 overflow-hidden relative">
      {isVideo ? (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground/60 gap-1">
          <Video size={28} />
          <span className="text-[10px]">Video URL set</span>
          <a href={url} target="_blank" rel="noreferrer" className="text-[10px] text-primary hover:underline truncate max-w-[90%]">{url}</a>
        </div>
      ) : (
        <img
          src={url}
          alt="Preview"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            (e.currentTarget.nextElementSibling as HTMLElement)?.style.setProperty('display', 'flex');
          }}
        />
      )}
      {!isVideo && (
        <div className="absolute inset-0 hidden flex-col items-center justify-center bg-muted text-muted-foreground/50">
          <ImageIcon size={22} className="mb-1" />
          <span className="text-[10px]">Image failed to load</span>
        </div>
      )}
    </div>
  );
};

// Convert camelCase to Title Case
const formatLabel = (key: string) => {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

// Helper to convert GitHub blob URLs and relative upload paths to raw.githubusercontent.com direct image URLs
const convertToRawGitHubUrl = (url: string): string => {
  if (!url) return url;
  
  const trimmed = url.trim();

  // Handle relative upload paths by resolving them to GitHub Raw CDN
  if (trimmed.startsWith('/assets/uploads/')) {
    const filename = trimmed.substring('/assets/uploads/'.length);
    return `https://raw.githubusercontent.com/Shivanshvyas1729/My_personal_portfolio/refs/heads/main/public/assets/uploads/${filename}`;
  }
  if (trimmed.startsWith('assets/uploads/')) {
    const filename = trimmed.substring('assets/uploads/'.length);
    return `https://raw.githubusercontent.com/Shivanshvyas1729/My_personal_portfolio/refs/heads/main/public/assets/uploads/${filename}`;
  }

  // Match: https://github.com/owner/repo/blob/branch/path
  const githubBlobRegex = /^https?:\/\/(?:www\.)?github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/i;
  const match = trimmed.match(githubBlobRegex);
  if (match) {
    const [, owner, repo, branch, path] = match;
    return `https://raw.githubusercontent.com/${owner}/${repo}/refs/heads/${branch}/${path}`;
  }
  return url;
};

// ─── Fully unwrap nested Zod types ───────────────────────────────────────────
function unwrapSchema(schema: z.ZodTypeAny): z.ZodTypeAny {
  let s = schema;
  while (
    s instanceof z.ZodOptional ||
    s instanceof z.ZodDefault ||
    s instanceof z.ZodNullable ||
    s instanceof z.ZodUnion
  ) {
    if (s instanceof z.ZodUnion) {
      const options = s._def.options;
      const objectOption = options.find((opt: any) => unwrapSchema(opt) instanceof z.ZodObject);
      s = objectOption || options[0];
    } else {
      s = s._def.innerType;
    }
  }
  return s;
}

const getItemPreview = (item: any): string => {
  if (!item) return "";
  if (typeof item === 'string') return item;
  if (typeof item === 'number' || typeof item === 'boolean') return String(item);
  if (typeof item === 'object') {
    const candidates = ['title', 'name', 'label', 'text', 'heading', 'role', 'school', 'company', 'url'];
    for (const cand of candidates) {
      if (item[cand] && typeof item[cand] === 'string') return item[cand];
    }
    for (const val of Object.values(item)) {
      if (typeof val === 'string' && val.trim().length > 0) return val;
    }
  }
  return "";
};

const getSuggestionsForField = (path: string[], previewData: any, isArray: boolean): string[] => {
  const fieldName = path[path.length - 1];
  if (!fieldName) return [];

  const suggestions = new Set<string>();

  // 1. PROJECT OR BLOG CATEGORIES (COMPLETELY SEPARATED)
  if (fieldName === 'category') {
    if (isArray) {
      // PROJECT CATEGORIES ONLY (Project category is an array)
      const projects = previewData?.projects || [];
      for (const p of projects) {
        if (Array.isArray(p.category)) {
          p.category.forEach((c: any) => c && suggestions.add(String(c).trim()));
        }
      }
      if (suggestions.size === 0) {
        ['Computer Vision', 'Deep Learning', 'Machine Learning', 'Generative AI', 'NLP', 'MLOps', 'Cloud Infrastructure', 'DevOps'].forEach(s => suggestions.add(s));
      }
    } else {
      // BLOG CATEGORIES ONLY (Blog category is a simple string)
      const blogs = previewData?.blog || [];
      for (const b of blogs) {
        if (typeof b.category === 'string' && b.category) {
          suggestions.add(b.category.trim());
        }
      }
      if (suggestions.size === 0) {
        ['Thoughts', 'Notes', 'Books', 'Links', 'General'].forEach(s => suggestions.add(s));
      }
    }
  }

  // 2. TECH STACK (for 'tech' inside project, 'featured' or 'all' inside techStack, etc.)
  if (fieldName === 'tech' || fieldName === 'techStack' || fieldName === 'featured' || fieldName === 'all' || fieldName === 'items') {
    // Collect from all existing projects' tech
    const projects = previewData?.projects || [];
    for (const p of projects) {
      if (Array.isArray(p.tech)) {
        p.tech.forEach((t: any) => t && suggestions.add(String(t).trim()));
      }
    }
    // Collect from skills items in portfolio
    const skillCats = previewData?.skills?.categories || [];
    for (const cat of skillCats) {
      if (Array.isArray(cat.items)) {
        cat.items.forEach((item: any) => item && suggestions.add(String(item).trim()));
      }
    }
    // Collect from techStack settings
    const featuredTech = previewData?.techStack?.featured || [];
    featuredTech.forEach((t: any) => t && suggestions.add(String(t).trim()));
    const allTech = previewData?.techStack?.all || [];
    allTech.forEach((t: any) => t && suggestions.add(String(t).trim()));

    // Add default popular tech items if none found
    if (suggestions.size === 0) {
      ['Python', 'TypeScript', 'React', 'Next.js', 'PyTorch', 'Docker', 'AWS', 'TensorFlow', 'FastAPI', 'LangChain'].forEach(s => suggestions.add(s));
    }
  }

  // 3. BLOG TYPE
  if (fieldName === 'type') {
    // Collect from all existing blogs' type
    const blogs = previewData?.blog || [];
    for (const b of blogs) {
      if (Array.isArray(b.type)) {
        b.type.forEach((t: any) => t && suggestions.add(String(t).trim()));
      }
    }
    
    if (suggestions.size === 0) {
      ['article', 'tutorial', 'case-study', 'cloud', 'quick-note', 'guide'].forEach(s => suggestions.add(s));
    }
  }

  return Array.from(suggestions).filter(Boolean).sort();
};

interface ArrayItemWrapperProps {
  item: any;
  index: number;
  total: number;
  itemSchema: z.ZodTypeAny;
  path: string[];
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRemove: () => void;
  onChange: (newVal: any) => void;
}

const ArrayItemWrapper: React.FC<ArrayItemWrapperProps> = ({
  item,
  index,
  total,
  itemSchema,
  path,
  onMoveUp,
  onMoveDown,
  onRemove,
  onChange
}) => {
  const previewText = getItemPreview(item);
  const [isExpanded, setIsExpanded] = React.useState(() => !previewText);

  return (
    <div className={`relative rounded-xl border transition-all duration-150 overflow-hidden ${
      isExpanded 
        ? 'border-accent/40 bg-slate-900/30' 
        : 'border-border/30 bg-muted/10 hover:border-border/50 hover:bg-muted/15'
    }`}>
      {/* Accordion Header */}
      <div 
        onClick={() => setIsExpanded(prev => !prev)}
        className={`flex items-center justify-between p-3.5 cursor-pointer select-none transition-all ${
          isExpanded 
            ? 'bg-accent/5 border-l-4 border-accent/70 pl-2.5' 
            : 'bg-muted/10 hover:bg-muted/20 pl-3.5'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0 pr-12">
          <span className={`text-[10px] font-mono font-bold tracking-wide uppercase shrink-0 ${
            isExpanded ? 'text-accent font-extrabold' : 'text-muted-foreground/80'
          }`}>
            Item {index + 1}
          </span>
          {!isExpanded && previewText && (
            <span className="text-xs text-muted-foreground font-medium truncate italic opacity-85">
              — {previewText.length > 50 ? `${previewText.slice(0, 50)}...` : previewText}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
          {onMoveUp && (
            <button
              type="button"
              onClick={onMoveUp}
              className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted/40 transition-colors"
              title="Move Up"
            >
              <ArrowUp size={13} />
            </button>
          )}
          {onMoveDown && (
            <button
              type="button"
              onClick={onMoveDown}
              className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted/40 transition-colors"
              title="Move Down"
            >
              <ArrowDown size={13} />
            </button>
          )}
          <button
            type="button"
            onClick={onRemove}
            className="text-muted-foreground hover:text-destructive p-1 rounded hover:bg-muted/40 transition-colors"
            title="Remove Item"
          >
            <Trash2 size={13} />
          </button>
          
          <div className="w-5 h-5 flex items-center justify-center text-muted-foreground/60 ml-1">
            <span className={`text-[10px] transform transition-transform duration-200 ${isExpanded ? 'rotate-180 text-accent font-bold' : ''}`}>
              ▼
            </span>
          </div>
        </div>
      </div>

      {/* Accordion Content */}
      <div className={`grid transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
        isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
      }`}>
        <div className="overflow-hidden">
          <div className="p-4 border-t border-border/15 bg-black/35">
            <DynamicForm
              schema={itemSchema}
              data={item}
              path={[...path, String(index)]}
              onChange={onChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface DynamicFormProps {
  schema: z.ZodTypeAny;
  data: any;
  onChange: (data: any) => void;
  path?: string[];
  parentData?: any;  // parent object so media url can read sibling 'type'
}

export const DynamicForm: React.FC<DynamicFormProps> = React.memo(({ schema, data, onChange, path = [], parentData }) => {
  let previewData: any = null;
  try {
    const cmsState = useCMSState();
    previewData = cmsState?.previewData;
  } catch (e) {}

  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const unwrapped = unwrapSchema(schema);

  // ─── Graphical Synapse connections Interceptor ───
  if (path[path.length - 1] === 'connections') {
    const currentConnections = Array.isArray(data) ? data : [];
    const techOptions = Array.from(new Set([
      ...(parentData?.featured || []),
      ...(parentData?.all || []),
      "Python", "PyTorch", "TensorFlow", "LangChain", "FastAPI", "Docker", "AWS", "GitHub"
    ]));

    const [srcNode, setSrcNode] = React.useState(techOptions[0] || "");
    const [dstNode, setDstNode] = React.useState(techOptions[1] || techOptions[0] || "");

    const handleAddConnection = () => {
      if (!srcNode || !dstNode) return;
      if (srcNode === dstNode) {
        toast.error("Cannot connect a node to itself!");
        return;
      }
      const exists = currentConnections.some(
        ([t1, t2]) => 
          (t1.toLowerCase() === srcNode.toLowerCase() && t2.toLowerCase() === dstNode.toLowerCase()) ||
          (t2.toLowerCase() === srcNode.toLowerCase() && t1.toLowerCase() === dstNode.toLowerCase())
      );
      if (exists) {
        toast.error("This connection already exists!");
        return;
      }
      onChange([...currentConnections, [srcNode, dstNode]]);
      toast.success(`Synapse connected: ${srcNode} ➔ ${dstNode}`);
    };

    return (
      <div className="space-y-4 bg-muted/5 border border-border/30 rounded-xl p-4">
        {/* Link Creator */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Source Tech</label>
            <select
              value={srcNode}
              onChange={e => setSrcNode(e.target.value)}
              className="w-full bg-background border border-border/40 rounded-lg p-2.5 text-xs text-foreground cursor-pointer focus:outline-none focus:border-primary/50"
            >
              {techOptions.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Target Tech</label>
            <select
              value={dstNode}
              onChange={e => setDstNode(e.target.value)}
              className="w-full bg-background border border-border/40 rounded-lg p-2.5 text-xs text-foreground cursor-pointer focus:outline-none focus:border-primary/50"
            >
              {techOptions.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddConnection}
          className="w-full py-2 bg-primary/10 border border-primary/30 rounded-lg text-xs font-bold text-primary hover:bg-primary/20 transition-all flex items-center justify-center gap-1.5"
        >
          <Plus size={14} /> Connect Synapse Link
        </button>

        {/* Existing connections List */}
        <div className="space-y-2 mt-4">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Active Synapses</label>
          <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
            {currentConnections.length > 0 ? (
              currentConnections.map((conn, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between bg-background border border-border/30 rounded-lg px-3 py-2 text-xs hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center gap-2 font-semibold">
                    <span className="px-2 py-0.5 rounded bg-primary/5 text-primary text-[10px]">{conn[0]}</span>
                    <span className="text-muted-foreground/60">──✦──</span>
                    <span className="px-2 py-0.5 rounded bg-accent/5 text-accent text-[10px]">{conn[1]}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const copy = [...currentConnections];
                      copy.splice(idx, 1);
                      onChange(copy);
                    }}
                    className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-xs text-muted-foreground/60 italic py-3 text-center bg-muted/5 rounded-lg border border-dashed border-border/40">
                No custom synapses defined. Nearest-neighbor connections active.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

interface SettingsAccordionContainerProps {
  groups: { id: string; title: string; desc: string; keys: string[] }[];
  shape: Record<string, z.ZodTypeAny>;
  currentData: any;
  path: string[];
  onChange: (newVal: any) => void;
}

const SettingsAccordionContainer: React.FC<SettingsAccordionContainerProps> = ({
  groups,
  shape,
  currentData,
  path,
  onChange
}) => {
  const [openGroup, setOpenGroup] = React.useState<string | null>(() => {
    const storageKey = `active_accordion_group_${path.join('_')}`;
    return sessionStorage.getItem(storageKey) || groups[0]?.id || null;
  });

  const handleToggleGroup = (groupId: string | null) => {
    const storageKey = `active_accordion_group_${path.join('_')}`;
    setOpenGroup(groupId);
    if (groupId) {
      sessionStorage.setItem(storageKey, groupId);
    } else {
      sessionStorage.removeItem(storageKey);
    }
  };

  return (
    <div className="space-y-3">
      {groups.map(group => {
        // Filter out keys that don't exist in the current Zod shape to prevent rendering errors
        const activeKeys = group.keys.filter((k: string) => shape[k]);
        if (activeKeys.length === 0) return null;

        const isOpen = openGroup === group.id;

        return (
          <div 
            key={group.id} 
            className={`rounded-xl border transition-all duration-250 overflow-hidden ${
              isOpen 
                ? 'border-primary/45 bg-slate-900/35 shadow-[0_0_20px_-5px_rgba(99,102,241,0.08)]' 
                : 'border-border/20 bg-muted/5 hover:border-border/40 hover:bg-muted/10'
            }`}
          >
            {/* Header Accordion */}
            <div
              onClick={() => handleToggleGroup(isOpen ? null : group.id)}
              className={`flex items-center justify-between p-4 cursor-pointer select-none transition-all ${
                isOpen 
                  ? 'bg-primary/5 border-l-4 border-primary/70 pl-3' 
                  : 'bg-muted/5 hover:bg-muted/10 pl-4'
              }`}
            >
              <div>
                <h4 className={`text-xs font-bold tracking-wide uppercase transition-colors ${
                  isOpen ? 'text-primary font-extrabold' : 'text-foreground/90'
                }`}>
                  {group.title}
                </h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">{group.desc}</p>
              </div>
              <span className={`text-xs transform transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-primary font-bold animate-pulse' : 'text-muted-foreground/75'
              }`}>
                ▼
              </span>
            </div>

            {/* Accordion Content */}
            <div className={`grid transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
              isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
            }`}>
              <div className="overflow-hidden">
                <div className="p-5 space-y-5 border-t border-border/15 bg-black/40">
                  {activeKeys.map((key: string) => (
                    <div key={key} className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider block">
                        {formatLabel(key)}
                      </label>
                      <DynamicForm
                        schema={shape[key]}
                        data={currentData[key]}
                        path={[...path, key]}
                        parentData={currentData}
                        onChange={(newVal) => onChange({ ...currentData, [key]: newVal })}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ── Object ──────────────────────────────────────────────────────────────────
  if (unwrapped instanceof z.ZodObject) {
    const shape = unwrapped.shape;
    const currentData = data || {};
    const keys = Object.keys(shape);

    // If path is under settings or matches aesthetic values, render organized collapsible accordions
    const isSettings = path.includes('settings') || keys.some(k => k.startsWith('ropeLight') || k.startsWith('textAnimation') || k.startsWith('themePrimary'));

    if (isSettings) {
      // 1. Hide redundant and overly complex parameters to keep things readable with less functionality
      const keysToHide = new Set([
        'ropeLightColors',
        'ropeLightSpeed',
        'ropeLightThickness',
        'ropeLightGlowIntensity',
        'ropeLightColorLight',
        'ropeLightColorDark',
        'ropeLightAccentLight',
        'ropeLightAccentDark',
        'sharpLightThickness',
        'textHoverColors',
        'textTransitionSpeed',
        'textLeaveSpeed',
        'textAnimationSpeed',
        'textBaseOpacity',
        'textGlowIntensity'
      ]);

      const visibleKeys = keys.filter(k => !keysToHide.has(k));

      const groups = [
        {
          id: 'neon-fog-dark',
          title: '🌙 Neon Fog Edge Wash (Dark Mode)',
          desc: 'Configure the blurry backdrop ambient wash colors, thickness, intensity, and flow speed for Dark Mode.',
          keys: ['ropeLightColorsDark', 'ropeLightThicknessDark', 'ropeLightGlowIntensityDark', 'ropeLightSpeedDark']
        },
        {
          id: 'neon-fog-light',
          title: '☀️ Neon Fog Edge Wash (Light Mode)',
          desc: 'Configure the blurry backdrop ambient wash colors, thickness, intensity, and flow speed for Light Mode.',
          keys: ['ropeLightColorsLight', 'ropeLightThicknessLight', 'ropeLightGlowIntensityLight', 'ropeLightSpeedLight']
        },
        {
          id: 'sharp-light-dark',
          title: '⚡ Sharp Outline Light (Dark Mode)',
          desc: 'Configure the crisp inner neon edge colors and thickness for Dark Mode.',
          keys: ['sharpLightColorsDark', 'sharpLightThicknessDark']
        },
        {
          id: 'sharp-light-light',
          title: '⚡ Sharp Outline Light (Light Mode)',
          desc: 'Configure the crisp inner neon edge colors and thickness for Light Mode.',
          keys: ['sharpLightColorsLight', 'sharpLightThicknessLight']
        },
        {
          id: 'theme-colors',
          title: '🎨 Theme & Typography Skinning',
          desc: 'Set the primary theme color palette and choose dynamic Google Fonts.',
          keys: ['themePrimaryColor', 'themeBackgroundColor', 'themeAccentColor', 'themeFontFamily']
        }
      ];

      const groupedKeys = new Set(groups.flatMap(g => g.keys));
      const remainingKeys = visibleKeys.filter(k => !groupedKeys.has(k));

      return (
        <div className="space-y-4">
          <SettingsAccordionContainer 
            groups={groups} 
            shape={shape} 
            currentData={currentData} 
            path={path} 
            onChange={onChange} 
          />
          {remainingKeys.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-border/20">
              {remainingKeys.map(key => (
                <div key={key} className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block opacity-70">
                    {formatLabel(key)}
                  </label>
                  <DynamicForm
                    schema={shape[key]}
                    data={currentData[key]}
                    path={[...path, key]}
                    parentData={currentData}
                    onChange={(newVal) => onChange({ ...currentData, [key]: newVal })}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    const isProject = keys.includes('problem_statement') || keys.includes('howItWorks') || keys.includes('architectureImage');

    if (isProject) {
      const projectGroups = [
        {
          id: 'proj-basic',
          title: '📌 Basic Information',
          desc: 'Title, ID, category tags, description, and featured status.',
          keys: ['title', 'id', 'category', 'description', 'featured']
        },
        {
          id: 'proj-links',
          title: '🔗 Links & Media',
          desc: 'GitHub link, live deployment, and core project display media.',
          keys: ['github', 'live', 'media']
        },
        {
          id: 'proj-overview',
          title: '💡 Project Overview & Objectives',
          desc: 'Problem statements, goals, success criteria, and learning outcomes.',
          keys: ['problem_statement', 'objectives', 'success_criteria', 'learning_outcomes']
        },
        {
          id: 'proj-architecture',
          title: '🏗️ High-Level Architecture & Flow',
          desc: 'Architecture diagrams, operational stages, flow steps, and deployment.',
          keys: ['architecture', 'architectureImage', 'howItWorks', 'deployment']
        },
        {
          id: 'proj-ml-pipeline',
          title: '🧠 Deep Engineering & ML Pipeline',
          desc: 'Data sources, targets, preprocessing, models, and explainability.',
          keys: ['data_sources', 'target_variable', 'features', 'preprocessing', 'modeling', 'evaluation_metrics', 'validation_strategy', 'explainability']
        },
        {
          id: 'proj-ethics',
          title: '⚖️ Ethics & Operational Risks',
          desc: 'Potential failure modes, constraints, safety profile, and public license.',
          keys: ['risks', 'ethics']
        },
        {
          id: 'proj-resources',
          title: '📚 Spec Documents & Reference Materials',
          desc: 'Research papers, presentation decks, or other resource attachments.',
          keys: ['resources', 'open_resources']
        }
      ];

      const groupedKeys = new Set(projectGroups.flatMap(g => g.keys));
      const remainingKeys = keys.filter(k => !groupedKeys.has(k));

      return (
        <div className="space-y-4">
          <SettingsAccordionContainer 
            groups={projectGroups} 
            shape={shape} 
            currentData={currentData} 
            path={path} 
            onChange={onChange} 
          />
          {remainingKeys.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-border/20">
              {remainingKeys.map(key => (
                <div key={key} className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block opacity-70">
                    {formatLabel(key)}
                  </label>
                  <DynamicForm
                    schema={shape[key]}
                    data={currentData[key]}
                    path={[...path, key]}
                    parentData={currentData}
                    onChange={(newVal) => onChange({ ...currentData, [key]: newVal })}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className={`space-y-4 ${path.length > 0 ? "pl-2 md:pl-4 border-l-2 border-border/40 mt-2" : ""}`}>
        {keys.map(key => (
          <div key={key} className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block opacity-70">
              {formatLabel(key)}
            </label>
            {key === 'themeFontFamily' && (
              <div className="bg-primary/5 border border-primary/10 rounded-lg p-2.5 text-[10px] text-muted-foreground/90 leading-relaxed max-w-lg mt-0.5 mb-1.5">
                <strong className="text-primary flex items-center gap-1 mb-0.5">💡 Google Fonts Integrator:</strong>
                Type any standard Google Font family name (for example: <span className="font-semibold text-foreground">Space Grotesk</span>, <span className="font-semibold text-foreground">Outfit</span>, <span className="font-semibold text-foreground">Poppins</span>, or <span className="font-semibold text-foreground">Inter</span>) to dynamically load and skin the site typography in real-time.
              </div>
            )}
            <DynamicForm
              schema={shape[key]}
              data={currentData[key]}
              path={[...path, key]}
              parentData={currentData}
              onChange={(newVal) => onChange({ ...currentData, [key]: newVal })}
            />
          </div>
        ))}
      </div>
    );
  }

  // ── Array ───────────────────────────────────────────────────────────────────
  if (unwrapped instanceof z.ZodArray) {
    const itemSchema = unwrapped.element;
    const currentArray = Array.isArray(data) ? data : [];
    
    // Check suggestions support
    const fieldKey = path[path.length - 1] || '';
    const supportsSuggestions = ['category', 'tech', 'techStack', 'featured', 'all', 'items', 'type'].includes(fieldKey);
    const suggestions = supportsSuggestions && previewData ? getSuggestionsForField(path, previewData, true) : [];

    return (
      <div className="bg-muted/5 border border-border/20 rounded-xl p-3.5 space-y-3.5 shadow-sm">
        {currentArray.length > 0 ? (
          <div className="space-y-3">
            {currentArray.map((item, index) => (
              <ArrayItemWrapper
                key={index}
                item={item}
                index={index}
                total={currentArray.length}
                itemSchema={itemSchema}
                path={path}
                onMoveUp={index > 0 ? () => {
                  const a = [...currentArray];
                  const temp = a[index];
                  a[index] = a[index - 1];
                  a[index - 1] = temp;
                  onChange(a);
                } : undefined}
                onMoveDown={index < currentArray.length - 1 ? () => {
                  const a = [...currentArray];
                  const temp = a[index];
                  a[index] = a[index + 1];
                  a[index + 1] = temp;
                  onChange(a);
                } : undefined}
                onRemove={() => {
                  const a = [...currentArray];
                  a.splice(index, 1);
                  onChange(a);
                }}
                onChange={(newVal) => {
                  const a = [...currentArray];
                  a[index] = newVal;
                  onChange(a);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground/60 italic py-3 px-4 bg-muted/5 rounded-lg border border-dashed border-border/40 text-center">
            No items defined yet. Click "Add" below to begin.
          </div>
        )}
        
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              let empty: any = "";
              const inner = unwrapSchema(itemSchema);
              if (inner instanceof z.ZodObject) empty = {};
              if (inner instanceof z.ZodNumber) empty = 0;
              if (inner instanceof z.ZodBoolean) empty = false;
              if (inner instanceof z.ZodEnum) empty = inner.options[0];
              onChange([...currentArray, empty]);
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors px-3 py-1.5 rounded-lg bg-primary/5 hover:bg-primary/10 border border-primary/20 w-fit"
          >
            <Plus size={14} /> Add {formatLabel(path[path.length - 1] || "Item")}
          </button>

          {supportsSuggestions && suggestions.length > 0 && (
            <button
              type="button"
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent/80 transition-colors px-3 py-1.5 rounded-lg bg-accent/5 hover:bg-accent/10 border border-accent/20 select-none cursor-pointer"
            >
              💡 {showSuggestions ? "Hide Options" : "Show Suggestions"}
            </button>
          )}
        </div>

        <div className={`grid transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
          showSuggestions && suggestions.length > 0 ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'
        }`}>
          <div className="overflow-hidden">
            <div className="bg-black/35 rounded-lg p-3 border border-border/20 space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground/85 uppercase tracking-wider block">
                Used Previously:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map(sug => {
                  const alreadyAdded = currentArray.some((x: any) => String(x).toLowerCase().trim() === sug.toLowerCase().trim());
                  return (
                    <button
                      key={sug}
                      type="button"
                      disabled={alreadyAdded}
                      onClick={() => {
                        onChange([...currentArray, sug]);
                        toast.success(`Added option: ${sug}`);
                      }}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold border transition-all select-none ${
                        alreadyAdded
                          ? 'bg-muted/15 border-border/10 text-muted-foreground/45 cursor-not-allowed opacity-50'
                          : 'bg-primary/5 hover:bg-primary/15 border-primary/25 hover:border-primary/50 text-primary cursor-pointer'
                      }`}
                    >
                      {sug}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Enum → Styled Select Dropdown ───────────────────────────────────────────
  if (unwrapped instanceof z.ZodEnum) {
    const options: string[] = unwrapped.options;
    const currentVal = data ?? options[0];
    return (
      <div className="relative w-full">
        <select
          value={currentVal}
          onChange={e => onChange(e.target.value)}
          className="w-full appearance-none bg-background border border-border/40 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 text-foreground pr-10 cursor-pointer transition-colors hover:border-border/70"
        >
          {options.map((opt: string) => (
            <option key={opt} value={opt}>
              {ENUM_ICONS[opt] || ''} {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </option>
          ))}
        </select>
        {/* Custom dropdown arrow */}
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">▼</div>
      </div>
    );
  }

  // ── String ──────────────────────────────────────────────────────────────────
  if (unwrapped instanceof z.ZodString) {
    const fieldKey = path[path.length - 1] || '';
    const supportsSuggestions = ['category', 'tech', 'techStack', 'featured', 'all', 'items', 'type'].includes(fieldKey);
    const suggestions = supportsSuggestions && previewData ? getSuggestionsForField(path, previewData, false) : [];
    const fieldKeyLower = fieldKey.toLowerCase();

    // Detect URL fields by name
    const isUrlField =
      fieldKeyLower.includes('url') ||
      fieldKeyLower.includes('link') ||
      fieldKeyLower.includes('github') ||
      fieldKeyLower.includes('live') ||
      fieldKeyLower.includes('source') ||
      fieldKeyLower.includes('dataset') ||
      fieldKeyLower.includes('kaggle') ||
      fieldKeyLower.includes('paper') ||
      fieldKeyLower.includes('repo') ||
      fieldKeyLower.includes('demo');

    // Also detect by value — if it looks like a URL, treat it as clickable
    const valueIsUrl = typeof data === 'string' && /^https?:\/\//i.test(data.trim());
    const isClickable = (isUrlField || valueIsUrl) && valueIsUrl;

    const isImage = fieldKeyLower.includes('image') || path.includes('profileImage');
    const isLargeText = ['description', 'content', 'impact', 'architecture', 'problem_statement', 'howItWorks', 'explainability', 'deployment', 'validation_strategy'].includes(fieldKey);
    const isMediaUrl = fieldKey === 'url' && path.includes('media');

    // Performance Optimization: Local state for inputs to prevent global re-renders on every keystroke
    const [localValue, setLocalValue] = React.useState(data || '');
    const [isUploading, setIsUploading] = React.useState(false);
    const [uploadError, setUploadError] = React.useState<string | null>(null);
    
    // Sync local state with global data if global data changes from outside (e.g. undo/redo or sync)
    React.useEffect(() => {
      if (data !== localValue) {
        const converted = convertToRawGitHubUrl(data || '');
        setLocalValue(converted);
      }
    }, [data]);

    const handleBlur = () => {
      const converted = convertToRawGitHubUrl(localValue);
      if (converted !== data) {
        onChange(converted);
      }
    };

    const handleUploadFile = async (file: File) => {
      setIsUploading(true);
      setUploadError(null);

      try {
        // 1. Client-Side WebP Compression
        const compressedBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d");
              
              const maxDim = 1200;
              let w = img.width;
              let h = img.height;
              if (w > maxDim || h > maxDim) {
                if (w > h) {
                  h = Math.round((h * maxDim) / w);
                  w = maxDim;
                } else {
                  w = Math.round((w * maxDim) / h);
                  h = maxDim;
                }
              }

              canvas.width = w;
              canvas.height = h;
              ctx?.drawImage(img, 0, 0, w, h);
              
              const dataUrl = canvas.toDataURL("image/webp", 0.8);
              const base64 = dataUrl.split(",")[1];
              resolve(base64);
            };
            img.onerror = (e) => reject(new Error("Failed to load image for compression"));
          };
          reader.onerror = (e) => reject(new Error("File reader error"));
        });

        // Generate clean file name with timestamp
        const extension = ".webp";
        const baseName = file.name.substring(0, file.name.lastIndexOf(".")).replace(/[^a-zA-Z0-9.\-_]/g, "_");
        const uniqueFileName = `${baseName}_${Date.now()}${extension}`;

        // 2. Post to our API Upload endpoint
        const res = await fetch("/api/cms-upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: uniqueFileName,
            fileContent: compressedBase64
          })
        });

        const result = await res.json();
        if (result.success) {
          const convertedUrl = convertToRawGitHubUrl(result.url);
          setLocalValue(convertedUrl);
          onChange(convertedUrl);
        } else {
          throw new Error(result.error || "Upload failed");
        }
      } catch (err: any) {
        setUploadError(err.message || "Failed to upload file");
      } finally {
        setIsUploading(false);
      }
    };

    if (fieldKey === 'themeFontFamily') {
      const popularFonts = [
        'Space Grotesk',
        'Outfit',
        'Poppins',
        'Inter',
        'Space Mono',
        'Syne',
        'Playfair Display',
        'Montserrat',
        'Cabinet Grotesk'
      ];

      return (
        <div className="w-full space-y-2">
          {/* Explanatory Integrator Card */}
          <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 text-[10px] text-muted-foreground/90 leading-relaxed max-w-lg mt-1 mb-2">
            <strong className="text-primary flex items-center gap-1 mb-0.5 font-bold">💡 Google Fonts Integrator:</strong>
            Type any standard Google Font family name or select from the premium layout fonts below to dynamically skin your portfolio's typography in real-time.
          </div>

          <div className="flex gap-2 items-center max-w-lg">
            {/* Font Selector Dropdown next to input */}
            <select
              value={popularFonts.includes(localValue) ? localValue : ''}
              onChange={(e) => {
                const val = e.target.value;
                if (val) {
                  setLocalValue(val);
                  onChange(val);
                }
              }}
              className="bg-background border border-border/30 rounded-lg px-2 py-2 text-xs text-foreground cursor-pointer focus:outline-none focus:border-primary/50 min-w-[130px] h-9"
            >
              <option value="" disabled>Choose Font...</option>
              {popularFonts.map(font => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>

            <input
              type="text"
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={(e) => { if (e.key === 'Enter') handleBlur(); }}
              className="flex-1 bg-background border border-border/30 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary/50 text-foreground min-w-0 font-medium h-9"
              placeholder="e.g. Space Grotesk, Outfit, Poppins, Inter"
            />
          </div>

          {/* Clickable Pills Underneath */}
          <div className="flex flex-wrap gap-1.5 max-w-lg pt-1">
            {popularFonts.map(font => {
              const isActive = localValue.toLowerCase().trim() === font.toLowerCase().trim();
              return (
                <button
                  key={font}
                  type="button"
                  onClick={() => {
                    setLocalValue(font);
                    onChange(font);
                  }}
                  className={`px-2.5 py-1 rounded bg-muted/20 hover:bg-primary/15 hover:text-primary text-[10px] font-semibold border transition-all select-none ${
                    isActive 
                      ? 'bg-primary/15 text-primary border-primary/40 shadow-sm font-bold' 
                      : 'border-border/30 hover:border-primary/30 text-muted-foreground'
                  }`}
                >
                  {font}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div className="w-full">
        {isLargeText ? (
          <textarea
            value={localValue}
            onChange={(e) => {
              const val = e.target.value;
              if (isImage || isMediaUrl) {
                const converted = convertToRawGitHubUrl(val);
                setLocalValue(converted);
                onChange(converted);
              } else {
                setLocalValue(val);
              }
            }}
            onBlur={handleBlur}
            className="w-full bg-background border border-border/30 rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary/50 text-foreground resize-y min-h-[80px] transition-colors"
            placeholder="Type here..."
          />
        ) : (
          <div className="flex items-center gap-1.5">
            <input
              type={isUrlField || isMediaUrl ? "url" : "text"}
              value={localValue}
              onChange={(e) => {
                const val = e.target.value;
                if (isImage || isMediaUrl) {
                  const converted = convertToRawGitHubUrl(val);
                  setLocalValue(converted);
                  onChange(converted);
                } else {
                  setLocalValue(val);
                }
              }}
              onBlur={handleBlur}
              onKeyDown={(e) => { if (e.key === 'Enter') handleBlur(); }}
              className="flex-1 bg-background border border-border/30 rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary/50 text-foreground min-w-0 transition-colors"
              placeholder={fieldKey === 'themeFontFamily' ? "e.g. Space Grotesk, Outfit, Poppins, Inter" : (isUrlField || isMediaUrl ? "https://..." : "Value...")}
            />
            {isClickable && (
              <a
                href={data.trim()}
                target="_blank"
                rel="noopener noreferrer"
                title="Open link"
                className="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg border border-primary/30 bg-primary/5 text-primary hover:bg-primary/15 hover:border-primary/60 transition-all"
              >
                <ExternalLink size={15} />
              </a>
            )}
          </div>
        )}

        {(isImage || isMediaUrl) && (
          <div 
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file && file.type.startsWith("image/")) {
                handleUploadFile(file);
              } else {
                setUploadError("Only images are supported.");
              }
            }}
            className={`mt-2 border border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${
              isUploading 
                ? 'bg-muted/40 border-muted-foreground/30 pointer-events-none' 
                : 'bg-muted/10 border-border/60 hover:bg-muted/20 hover:border-primary/50'
            }`}
          >
            <input 
              type="file" 
              accept="image/*"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) handleUploadFile(file);
              }}
              className="hidden" 
              id={`upload-file-${fieldKey}-${path.join("-")}`}
            />
            <label 
              htmlFor={`upload-file-${fieldKey}-${path.join("-")}`}
              className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
            >
              <Upload size={18} className="text-muted-foreground mb-1 animate-pulse" />
              <span className="text-[10px] font-semibold text-muted-foreground">
                {isUploading ? "Uploading & Compressing..." : "Drag & Drop Image or Click to Upload (Auto-WebP)"}
              </span>
              {uploadError && (
                <span className="text-[9px] text-destructive mt-1 font-medium">{uploadError}</span>
              )}
            </label>
          </div>
        )}

        {/* Show media preview for media[].url field */}
        {isMediaUrl && localValue && <MediaPreview url={localValue} type={parentData?.type} />}
        {/* Show image preview for architectureImage and similar */}
        {isImage && localValue && !isMediaUrl && (
          <div className="mt-2 w-full h-28 rounded-lg bg-muted/30 border border-border/50 overflow-hidden flex items-center justify-center relative">
            <img 
              src={localValue} 
              alt="Preview" 
              className="w-full h-full object-cover animate-in fade-in duration-300"
              onError={(e) => { 
                e.currentTarget.style.display = 'none';
                (e.currentTarget.nextElementSibling as HTMLElement)?.style.setProperty('display', 'flex');
              }} 
            />
            <div className="absolute inset-0 hidden flex-col items-center justify-center bg-muted/40 text-muted-foreground/50">
              <ImageIcon size={22} className="mb-1" />
              <span className="text-[10px]">Image failed to load / invalid URL</span>
            </div>
          </div>
        )}

        <div className={`grid transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
          showSuggestions && suggestions.length > 0 ? 'grid-rows-[1fr] opacity-100 mt-2.5' : 'grid-rows-[0fr] opacity-0'
        }`}>
          <div className="overflow-hidden">
            <div className="bg-black/35 rounded-lg p-2.5 border border-border/20 flex flex-wrap gap-1.5 animate-in fade-in duration-100">
              {suggestions.map(sug => {
                const isActive = localValue.toLowerCase().trim() === sug.toLowerCase().trim();
                return (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => {
                      setLocalValue(sug);
                      onChange(sug);
                      toast.success(`Selected category: ${sug}`);
                    }}
                    className={`px-2 py-0.5 rounded text-[9px] font-bold border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-primary/20 border-primary/50 text-primary'
                        : 'bg-muted/10 border-border/30 hover:border-primary/30 text-muted-foreground'
                    }`}
                  >
                    {sug}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Number → Dynamic Sliders or Manual Inputs ───────────────────────────────
  if (unwrapped instanceof z.ZodNumber) {
    const fieldKey = path[path.length - 1] || '';
    const fieldKeyLower = fieldKey.toLowerCase();
    
    // Smart aesthetic boundaries
    let min = 0;
    let max = 100;
    let step = 1;

    if (fieldKeyLower.includes('speed')) {
      min = 0.1;
      max = 20;
      step = 0.1;
    } else if (fieldKeyLower.includes('thickness')) {
      min = 0.5;
      max = 15; // Enable thicker neon wash mists if desired
      step = 0.1;
    } else if (fieldKeyLower.includes('intensity') || fieldKeyLower.includes('glow')) {
      min = 0;
      max = 12;
      step = 0.1;
    } else if (fieldKeyLower.includes('opacity')) {
      min = 0;
      max = 1;
      step = 0.05;
    } else if (fieldKeyLower.includes('count')) {
      min = 0;
      max = 100;
      step = 1;
    }

    const currentVal = data ?? min;
    const [localVal, setLocalVal] = React.useState(currentVal);

    React.useEffect(() => {
      setLocalVal(currentVal);
    }, [currentVal]);

    // Check if this field should be rendered as a manual number input box rather than a slider
    const isManualInput = fieldKeyLower.includes('count') || 
                          fieldKeyLower.includes('experience') || 
                          fieldKeyLower.includes('year') || 
                          fieldKeyLower.includes('id');

    if (isManualInput) {
      return (
        <div className="flex items-center gap-3 w-full max-w-[220px]">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={localVal}
            onChange={(e) => {
              const val = e.target.value === '' ? min : Number(e.target.value);
              setLocalVal(val);
              onChange(val);
            }}
            className="w-24 bg-background border border-border/30 rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary/50 text-foreground font-semibold font-mono text-center shadow-inner h-9"
          />
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
            Manual Count
          </span>
        </div>
      );
    }

    // Debounced onChange to prevent intermediate lagging during slider drag
    const debouncedOnChange = React.useMemo(() => {
      let timeoutId: any = null;
      return (val: number) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          onChange(val);
        }, 50); // Small debouncing buffer to keep visual dragging extremely silky
      };
    }, [onChange]);

    return (
      <div className="flex items-center gap-4 w-full bg-muted/5 border border-border/20 rounded-xl px-4 py-2.5">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localVal}
          onChange={(e) => {
            const val = Number(e.target.value);
            setLocalVal(val);
            debouncedOnChange(val);
          }}
          className="flex-1 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
        />
        <span className="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary font-mono font-bold text-xs shrink-0 min-w-[42px] text-center shadow-inner">
          {localVal}
        </span>
      </div>
    );
  }

  // ── Boolean → Toggle ────────────────────────────────────────────────────────
  if (unwrapped instanceof z.ZodBoolean) {
    return (
      <label className="flex items-center gap-2 cursor-pointer pt-1">
        <div className={`w-10 h-5 rounded-full p-0.5 transition-colors ${data ? 'bg-primary' : 'bg-border'}`}>
          <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${data ? 'translate-x-5' : 'translate-x-0'}`} />
        </div>
        <span className="text-sm font-medium select-none">{data ? 'Yes' : 'No'}</span>
        <input type="checkbox" checked={!!data} onChange={(e) => onChange(e.target.checked)} className="hidden" />
      </label>
    );
  }

  // ── Fallback: JSON editor ───────────────────────────────────────────────────
  return (
    <textarea
      value={typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data || '')}
      onChange={e => { try { onChange(JSON.parse(e.target.value)); } catch { onChange(e.target.value); } }}
      className="w-full bg-background border border-border/30 rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary/50 font-mono text-[10px] text-foreground/80 h-20"
    />
  );
});

