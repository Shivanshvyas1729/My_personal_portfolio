import React from 'react';
import { z } from 'zod';
import { Plus, Trash2, Image as ImageIcon, Video, ExternalLink } from 'lucide-react';

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

// ─── Fully unwrap nested Zod types ───────────────────────────────────────────
function unwrapSchema(schema: z.ZodTypeAny): z.ZodTypeAny {
  let s = schema;
  while (
    s instanceof z.ZodOptional ||
    s instanceof z.ZodDefault ||
    s instanceof z.ZodNullable
  ) {
    s = s._def.innerType;
  }
  return s;
}

interface DynamicFormProps {
  schema: z.ZodTypeAny;
  data: any;
  onChange: (data: any) => void;
  path?: string[];
  parentData?: any;  // parent object so media url can read sibling 'type'
}

export const DynamicForm: React.FC<DynamicFormProps> = React.memo(({ schema, data, onChange, path = [], parentData }) => {
  const unwrapped = unwrapSchema(schema);

  // ── Object ──────────────────────────────────────────────────────────────────
  if (unwrapped instanceof z.ZodObject) {
    const shape = unwrapped.shape;
    const currentData = data || {};
    return (
      <div className={`space-y-4 ${path.length > 0 ? "pl-4 border-l-2 border-border/40 mt-2" : ""}`}>
        {Object.keys(shape).map(key => (
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
    );
  }

  // ── Array ───────────────────────────────────────────────────────────────────
  if (unwrapped instanceof z.ZodArray) {
    const itemSchema = unwrapped.element;
    const currentArray = Array.isArray(data) ? data : [];
    return (
      <div className="space-y-3">
        {currentArray.map((item, index) => (
          <div key={index} className="relative p-4 rounded-xl border border-border/50 bg-muted/10 group">
            <button
              onClick={() => { const a = [...currentArray]; a.splice(index, 1); onChange(a); }}
              className="absolute top-2 right-2 text-muted-foreground hover:text-destructive p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove Item"
            >
              <Trash2 size={14} />
            </button>
            <div className="text-[10px] font-mono text-muted-foreground mb-2 pb-2 border-b border-border/30 opacity-60">Item {index + 1}</div>
            <DynamicForm
              schema={itemSchema}
              data={item}
              path={[...path, String(index)]}
              onChange={(newVal) => { const a = [...currentArray]; a[index] = newVal; onChange(a); }}
            />
          </div>
        ))}
        <button
          onClick={() => {
            let empty: any = "";
            const inner = unwrapSchema(itemSchema);
            if (inner instanceof z.ZodObject) empty = {};
            if (inner instanceof z.ZodNumber) empty = 0;
            if (inner instanceof z.ZodBoolean) empty = false;
            if (inner instanceof z.ZodEnum) empty = inner.options[0];
            onChange([...currentArray, empty]);
          }}
          className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors px-2 py-1.5 rounded-md hover:bg-primary/5"
        >
          <Plus size={14} /> Add {formatLabel(path[path.length - 1] || "Item")}
        </button>
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

    const isImage = fieldKeyLower.includes('image') || fieldKeyLower.includes('architecture');
    const isLargeText = ['description', 'content', 'impact', 'architecture', 'problem_statement', 'howItWorks', 'explainability', 'deployment', 'validation_strategy'].includes(fieldKey);
    const isMediaUrl = fieldKey === 'url' && path.includes('media');

    return (
      <div className="w-full">
        {isLargeText ? (
          <textarea
            value={data || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-background border border-border/30 rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary/50 text-foreground resize-y min-h-[80px]"
            placeholder="Type here..."
          />
        ) : (
          <div className="flex items-center gap-1.5">
            <input
              type={isUrlField || isMediaUrl ? "url" : "text"}
              value={data || ''}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 bg-background border border-border/30 rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary/50 text-foreground min-w-0"
              placeholder={isUrlField || isMediaUrl ? "https://..." : "Value..."}
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
        {/* Show media preview for media[].url field */}
        {isMediaUrl && data && <MediaPreview url={data} type={parentData?.type} />}
        {/* Show image preview for architectureImage and similar */}
        {isImage && data && !isMediaUrl && (
          <div className="mt-2 w-full h-28 rounded-lg bg-muted/30 border border-border/50 overflow-hidden">
            <img src={data} alt="Preview" className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.style.opacity = '0.3'; }} />
          </div>
        )}
      </div>
    );
  }

  // ── Number ──────────────────────────────────────────────────────────────────
  if (unwrapped instanceof z.ZodNumber) {
    return (
      <input
        type="number"
        value={data ?? 0}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-background border border-border/30 rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary/50 text-foreground"
      />
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

