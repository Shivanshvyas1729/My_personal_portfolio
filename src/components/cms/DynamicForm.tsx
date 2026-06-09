import React from 'react';
import { z } from 'zod';
import { Plus, Trash2, Image as ImageIcon, Video, ExternalLink, Upload, FileText, X, Eye, Save, RotateCcw, Sparkles, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ArrowUpLeft, ArrowUpRight, ArrowDownLeft, ArrowDownRight, Move } from 'lucide-react';
import { toast } from 'sonner';
import { useCMSState } from '@/context/CMSContext';
import { useTheme } from '../../hooks/useTheme';
import { PremiumColorPicker } from './PremiumColorPicker';
import { registerLocalImage, getLocalImage } from "@/lib/localImageStore";
import { 
  ENUM_ICONS, 
  MediaPreview, 
  formatLabel, 
  convertToRawGitHubUrl, 
  unwrapSchema, 
  getSuggestionsForField,
  getPreviewUrl
} from './FormHelpers';
import { SpaciousMarkdownNotepad } from './SpaciousMarkdownNotepad';
import { ArrayItemWrapper } from './ArrayItemWrapper';
import { SettingsAccordionContainer } from './SettingsAccordionContainer';
import { ImageCropperModal } from './ImageCropperModal';
import { useCloudinary } from '../../hooks/useCloudinary';
import { KnowledgeAutocomplete } from './KnowledgeAutocomplete';
import { KnowledgeCategory } from '@/data/knowledge/categories';

const FIELD_CATEGORY_MAP: Record<string, KnowledgeCategory[]> = {
  evaluation_metrics: ["Evaluation Metrics"],
  modeling: ["Machine Learning", "Deep Learning", "Computer Vision", "Natural Language Processing", "Generative AI", "RAG", "Agents"],
  features: ["Feature Engineering"],
  preprocessing: ["Preprocessing"],
  validation_strategy: ["Validation"],
  explainability: ["Explainability"],
  deployment: ["Deployment", "MLOps", "Cloud", "DevOps"],
  risks: ["Risks"],
  ethics: ["Ethics", "Privacy"],
  data_sources: ["Databases", "Vector Databases"]
};

interface DynamicFormProps {
  schema: z.ZodTypeAny;
  data: any;
  onChange: (data: any) => void;
  path?: string[];
  parentData?: any;  // parent object so media url can read sibling 'type'
}

const MediaUploadDropzone = ({ 
  fieldKeyLower, 
  path, 
  isMediaUrl, 
  onChange 
}: { 
  fieldKeyLower: string;
  path: string[];
  isMediaUrl: boolean;
  onChange: (data: any) => void;
}) => {
  const { uploadMedia, isUploading, progress } = useCloudinary();
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [pendingCropFile, setPendingCropFile] = React.useState<{src: string, file: File, shape: 'rect'|'round', aspect: number, fileName: string} | null>(null);

  const initiateCrop = (file: File) => {
    const src = URL.createObjectURL(file);
    const isAvatar = fieldKeyLower.includes('avatar') || fieldKeyLower.includes('profile');
    const shape = 'rect'; // The user prefers a rectangle crop box rather than a circle overlay
    const aspect = isAvatar ? 1 : (isMediaUrl ? 16/9 : 1);
    setPendingCropFile({ src, file, shape, aspect, fileName: file.name });
  };

  const handleUploadFile = async (file: File) => {
    setUploadError(null);
    try {
      const result = await uploadMedia(file);
      onChange(result);
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload file");
      toast.error("Upload failed. Check console for details.");
    }
  };

  return (
    <div className="w-full">
      <div 
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          if (file) {
            if (file.type.startsWith("image/") && file.type !== "image/gif" && !isMediaUrl) {
              initiateCrop(file);
            } else {
              handleUploadFile(file);
            }
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
          accept={isMediaUrl ? "image/*,video/*" : "image/*"}
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) {
              if (file.type.startsWith("image/") && file.type !== "image/gif" && !isMediaUrl) {
                initiateCrop(file);
              } else {
                handleUploadFile(file);
              }
            }
          }}
          className="hidden" 
          id={`upload-file-${fieldKeyLower}-${path.join("-")}`}
        />
        <label 
          htmlFor={`upload-file-${fieldKeyLower}-${path.join("-")}`}
          className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
        >
          <Upload size={18} className="text-muted-foreground mb-1 animate-pulse" />
          <span className="text-[10px] font-semibold text-muted-foreground text-center">
            {isUploading ? `Uploading to Cloudinary... ${progress}%` : "Drag & Drop Media or Click to Upload"}
          </span>
          {uploadError && (
            <span className="text-[9px] text-destructive mt-1 font-medium">{uploadError}</span>
          )}
        </label>
      </div>
      
      {pendingCropFile && (
        <ImageCropperModal
          isOpen={true}
          imageSrc={pendingCropFile.src}
          fileName={pendingCropFile.fileName}
          shape={pendingCropFile.shape}
          aspectRatio={pendingCropFile.aspect}
          onCropComplete={(croppedFile) => {
            setPendingCropFile(null);
            handleUploadFile(croppedFile);
          }}
          onCancel={() => {
            setPendingCropFile(null);
          }}
        />
      )}
    </div>
  );
};

interface ConnectionsFieldProps {
  data: any;
  parentData: any;
  onChange: (data: any) => void;
}

const ConnectionsField: React.FC<ConnectionsFieldProps> = ({ data, parentData, onChange }) => {
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
};

interface StringFieldProps {
  data: any;
  onChange: (data: any) => void;
  path: string[];
  previewData: any;
  isDark: boolean;
  mediaInputMode: 'upload' | 'link';
  setMediaInputMode: React.Dispatch<React.SetStateAction<'upload' | 'link'>>;
  parentData: any;
}

const StringField: React.FC<StringFieldProps> = ({
  data,
  onChange,
  path,
  previewData,
  isDark,
  mediaInputMode,
  setMediaInputMode,
  parentData
}) => {
  const fieldKey = path[path.length - 1] || '';
  const supportsSuggestions = ['category', 'tech', 'techStack', 'featured', 'all', 'items', 'type'].includes(fieldKey);
  const suggestions = supportsSuggestions && previewData ? getSuggestionsForField(path, previewData, false) : [];
  const fieldKeyLower = fieldKey.toLowerCase();

  const isUrlField = fieldKeyLower.includes('url') || fieldKeyLower.includes('link') || fieldKeyLower.includes('href') || fieldKeyLower.includes('website');
  const isMediaUrl = fieldKeyLower === 'url' && path.includes('media');
  const isImage = 
    ['image', 'avatar', 'logo', 'thumbnail', 'icon'].some(k => fieldKeyLower.includes(k)) || 
    (fieldKeyLower === 'value' && path.some(p => ['image', 'avatar', 'logo', 'icon'].some(k => p.toLowerCase().includes(k))));
    
  const isLargeText = fieldKeyLower.includes('content') || fieldKeyLower.includes('description') || fieldKeyLower.includes('bio') || fieldKeyLower.includes('readme') || fieldKeyLower.includes('text') || fieldKeyLower.includes('markdown') || fieldKeyLower.includes('statement') || fieldKeyLower.includes('summary');

  const [localValue, setLocalValue] = React.useState(data || '');
  const [isNotepadOpen, setIsNotepadOpen] = React.useState(false);
  const draftKey = React.useMemo(() => `cms-notepad-draft-${path.join('.')}`, [path]);
  const [hasDraft, setHasDraft] = React.useState(false);
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  React.useEffect(() => {
    if (isNotepadOpen && localValue) {
      localStorage.setItem(draftKey, localValue);
    }
  }, [localValue, isNotepadOpen, draftKey]);

  React.useEffect(() => {
    if (isNotepadOpen) {
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft && savedDraft !== (data || '')) {
        setHasDraft(true);
      } else {
        setHasDraft(false);
      }
    }
  }, [isNotepadOpen, data, draftKey]);

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

  const isColorField = fieldKeyLower.includes('color') || fieldKeyLower.includes('accent') || fieldKeyLower.includes('hex') || path.some(p => p.toLowerCase().includes('color'));

  if (isColorField) {
    return (
      <PremiumColorPicker
        value={data || ''}
        onChange={onChange}
        isDark={isDark}
      />
    );
  }

  if (fieldKey === 'objectPosition') {
    return null;
  }

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
        <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 text-[10px] text-muted-foreground/90 leading-relaxed max-w-lg mt-1 mb-2">
          <strong className="text-primary flex items-center gap-1 mb-0.5 font-bold">💡 Google Fonts Integrator:</strong>
          Type any standard Google Font family name or select from the premium layout fonts below to dynamically skin your portfolio's typography in real-time.
        </div>

        <div className="flex gap-2">
          <select
            value={popularFonts.includes(localValue) ? localValue : ""}
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

  const valueIsUrl = typeof data === 'string' && /^https?:\/\//i.test(data.trim());
  const isClickable = (isUrlField || valueIsUrl) && valueIsUrl;

  const isChildOfMediaObj = (path.includes('media') || path.includes('profileImage') || path.includes('architectureImage')) && 
                            (path[path.length - 1] !== 'media' && path[path.length - 1] !== 'profileImage' && path[path.length - 1] !== 'architectureImage');



  return (
    <div className="w-full">
      {(isImage || isMediaUrl) && !isChildOfMediaObj && (
        <div className="flex items-center gap-2 mb-2 mt-1">
          <button type="button" onClick={() => setMediaInputMode('upload')} className={`px-2.5 py-1 text-[9px] uppercase tracking-wider font-bold rounded transition-all ${mediaInputMode === 'upload' ? 'bg-primary text-primary-foreground shadow' : 'bg-muted/50 text-muted-foreground hover:bg-muted/80'}`}>Upload from PC</button>
          <button type="button" onClick={() => setMediaInputMode('link')} className={`px-2.5 py-1 text-[9px] uppercase tracking-wider font-bold rounded transition-all ${mediaInputMode === 'link' ? 'bg-primary text-primary-foreground shadow' : 'bg-muted/50 text-muted-foreground hover:bg-muted/80'}`}>Provide Image Address</button>
        </div>
      )}

      {(!(isImage || isMediaUrl) || isChildOfMediaObj || mediaInputMode === 'link') && (
        isLargeText ? (
        <div className="w-full relative group/editor font-sans">
          <div className="flex items-center justify-between mb-1.5 select-none">
            <span className="text-[10px] text-muted-foreground/80 font-medium italic">
              📝 Click editor area below to open spacious Notepad
            </span>
            <button
              type="button"
              onClick={() => setIsNotepadOpen(true)}
              className="text-[10px] font-bold text-primary hover:text-primary-foreground hover:bg-primary/20 border border-primary/20 px-2 py-0.5 rounded transition-all bg-primary/5 shrink-0 flex items-center gap-1.5 shadow-sm"
            >
              <FileText size={11} /> Fullscreen Notepad
            </button>
          </div>
          
          <textarea
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleBlur}
            onClick={() => setIsNotepadOpen(true)}
            className="w-full bg-background/50 hover:bg-background/80 hover:border-border/60 border border-border/30 rounded-lg p-3 text-xs md:text-sm focus:outline-none focus:border-primary/50 text-foreground/90 resize-y min-h-[90px] transition-all cursor-pointer font-mono leading-relaxed"
            placeholder="Click to type and edit in Fullscreen Notepad..."
            readOnly
          />

          <SpaciousMarkdownNotepad
            isNotepadOpen={isNotepadOpen}
            setIsNotepadOpen={setIsNotepadOpen}
            localValue={localValue}
            setLocalValue={setLocalValue}
            onChange={onChange}
            fieldKey={fieldKey}
            isDark={isDark}
            draftKey={draftKey}
            hasDraft={hasDraft}
            setHasDraft={setHasDraft}
            data={data || ''}
          />
        </div>
      ) : (
        <div className="flex items-center gap-1.5 w-full">
          {(isUrlField || isMediaUrl || fieldKey === 'themeFontFamily' || fieldKeyLower === 'category' || path.length === 1) ? (
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
          ) : (
            <div className="flex-1 min-w-0">
              <KnowledgeAutocomplete 
                value={localValue}
                onChange={(val) => setLocalValue(val)}
                onSelect={(val) => {
                  setLocalValue(val);
                  onChange(val);
                }}
                onBlur={handleBlur}
                placeholder="Type to search Knowledge Matrix..."
                allowedCategories={FIELD_CATEGORY_MAP[fieldKey as string]}
              />
            </div>
          )}
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
      ))}

      {(isImage || isMediaUrl) && !isChildOfMediaObj && mediaInputMode === 'upload' && (
        <MediaUploadDropzone
          fieldKeyLower={fieldKeyLower}
          path={path}
          isMediaUrl={isMediaUrl}
          onChange={(result) => {
            setLocalValue(result.secureUrl);
            onChange(result.secureUrl);
          }}
        />
      )}

      {isMediaUrl && localValue && <MediaPreview url={typeof localValue === 'string' ? localValue : localValue?.secureUrl} type={parentData?.type} />}
      {isImage && localValue && !isMediaUrl && (
        <div className="mt-2 w-full h-28 rounded-lg bg-muted/30 border border-border/50 overflow-hidden flex items-center justify-center relative">
          <img 
            src={getPreviewUrl(typeof localValue === 'string' ? localValue : localValue?.secureUrl)} 
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

      <div className={`grid transition-all duration-300 [transition-timing-function:cubic-bezier(0.25,1,0.5,1)] ${
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
                    setShowSuggestions(false);
                    toast.success(`Applied: ${sug}`);
                  }}
                  className={`px-2.5 py-1 rounded bg-muted/35 hover:bg-primary/20 hover:text-primary text-[10px] font-bold border transition-all ${
                    isActive 
                      ? 'bg-primary/20 text-primary border-primary/40' 
                      : 'border-border/30'
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
};

export const DynamicForm: React.FC<DynamicFormProps> = React.memo(({ schema, data, onChange, path = [], parentData }) => {
  let previewData: any = null;
  try {
    const cmsState = useCMSState();
    previewData = cmsState?.previewData;
  } catch (e) {}

  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [mediaInputMode, setMediaInputMode] = React.useState<'upload' | 'link'>(() => {
    if (typeof data === 'string') {
      if (data && !data.includes('res.cloudinary.com')) return 'link';
    } else if (data) {
      if (data.secureUrl && !data.secureUrl.includes('res.cloudinary.com')) return 'link';
      if (data.url && !data.url.includes('res.cloudinary.com')) return 'link';
    }
    return 'upload';
  });
  const unwrapped = unwrapSchema(schema, data);
  const { theme } = useTheme();
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  // ─── Graphical Synapse connections Interceptor ───
  if (path[path.length - 1] === 'connections') {
    return (
      <ConnectionsField
        data={data}
        parentData={parentData}
        onChange={onChange}
      />
    );
  }


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
        'sharpLightSpeed',
        'textHoverColors',
        'textTransitionSpeed',
        'textLeaveSpeed',
        'textAnimationSpeed',
        'textBaseOpacity',
        'textGlowIntensity'
      ]);

      const allGroups = [
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
          desc: 'Configure the crisp inner neon edge colors, thickness, and flow speed for Dark Mode.',
          keys: ['sharpLightColorsDark', 'sharpLightThicknessDark', 'sharpLightSpeedDark']
        },
        {
          id: 'sharp-light-light',
          title: '💡 Sharp Outline Light (Light Mode)',
          desc: 'Configure the crisp inner neon edge colors, thickness, and flow speed for Light Mode.',
          keys: ['sharpLightColorsLight', 'sharpLightThicknessLight', 'sharpLightSpeedLight']
        },
        {
          id: 'text-animation-dark',
          title: '✏️ Interactive Text Animation Effects (Dark Mode)',
          desc: 'Tweak speed, glow properties, colors, and base opacity for cursor hover animations in Dark Mode.',
          keys: ['textTransitionSpeedDark', 'textLeaveSpeedDark', 'textAnimationSpeedDark', 'textBaseOpacityDark', 'textGlowIntensityDark', 'textHoverColorsDark']
        },
        {
          id: 'text-animation-light',
          title: '✏️ Interactive Text Animation Effects (Light Mode)',
          desc: 'Tweak speed, glow properties, colors, and base opacity for cursor hover animations in Light Mode.',
          keys: ['textTransitionSpeedLight', 'textLeaveSpeedLight', 'textAnimationSpeedLight', 'textBaseOpacityLight', 'textGlowIntensityLight', 'textHoverColorsLight']
        },
        {
          id: 'brand-identity',
          title: '💎 Brand Identity & Font Family',
          desc: 'Skin site accents, highlight themes, backgrounds, and global typography options.',
          keys: ['themePrimaryColor', 'themeAccentColor', 'themeBackgroundColor', 'themeFontFamily', 'themeHighlightColorDark', 'themeHighlightColorLight']
        }
      ];

      const keysInGroups = new Set(allGroups.flatMap(g => g.keys));
      const visibleKeys = keys.filter(k => !keysToHide.has(k) && !keysInGroups.has(k));

      // Filter groups to display only the current theme's sections
      const groups = allGroups
        .map(g => {
          if (g.id === 'brand-identity') {
            return {
              ...g,
              keys: [
                'themePrimaryColor', 'themeAccentColor', 'themeBackgroundColor', 'themeFontFamily',
                ...(isDark ? ['themeHighlightColorDark'] : ['themeHighlightColorLight'])
              ]
            };
          }
          return g;
        })
        .filter(g => {
          if (g.id.endsWith('-dark') && !isDark) return false;
          if (g.id.endsWith('-light') && isDark) return false;
          return true;
        });

      // Curated Theme Presets Registry
      const PRESETS = [
        {
          name: "Cyberpunk Neon 🌌",
          values: {
            ropeLightColorsDark: ["#f43f5e99", "#d946ef99", "#8b5cf699", "#3b82f699"],
            ropeLightThicknessDark: 3.5,
            ropeLightGlowIntensityDark: 4.5,
            ropeLightSpeedDark: 15.0,
            sharpLightColorsDark: ["#f43f5edd", "#d946efdd", "#3b82f6dd"],
            sharpLightThicknessDark: 2.0,
            themePrimaryColor: "#d946ef",
            themeAccentColor: "#3b82f6",
            themeFontFamily: "Space Grotesk"
          }
        },
        {
          name: "Midnight Aurora 🧪",
          values: {
            ropeLightColorsDark: ["#10b98199", "#34d39966", "#059669cc", "#6ee7b7aa"],
            ropeLightThicknessDark: 2.5,
            ropeLightGlowIntensityDark: 3.5,
            ropeLightSpeedDark: 10.0,
            sharpLightColorsDark: ["#34d399cc", "#6ee7b7cc"],
            sharpLightThicknessDark: 1.5,
            themePrimaryColor: "#10b981",
            themeAccentColor: "#059669",
            themeFontFamily: "Outfit"
          }
        },
        {
          name: "Sunset Mist 🌅",
          values: {
            ropeLightColorsDark: ["#f97316aa", "#f43f5eaa", "#eab30888", "#ef444499"],
            ropeLightThicknessDark: 3.0,
            ropeLightGlowIntensityDark: 4.0,
            ropeLightSpeedDark: 12.5,
            sharpLightColorsDark: ["#f97316dd", "#f43f5edd"],
            sharpLightThicknessDark: 1.8,
            themePrimaryColor: "#f97316",
            themeAccentColor: "#f43f5e",
            themeFontFamily: "Poppins"
          }
        },
        {
          name: "Cosmic Nebula 🛸",
          values: {
            ropeLightColorsDark: ["#8b5cf6aa", "#6366f1aa", "#ec489999", "#a855f7aa"],
            ropeLightThicknessDark: 4.0,
            ropeLightGlowIntensityDark: 5.0,
            ropeLightSpeedDark: 16.0,
            sharpLightColorsDark: ["#8b5cf6dd", "#6366f1dd", "#ec4899dd"],
            sharpLightThicknessDark: 2.2,
            themePrimaryColor: "#8b5cf6",
            themeAccentColor: "#ec4899",
            themeFontFamily: "Syne"
          }
        },
        {
          name: "Minimalist Silver 💎",
          values: {
            ropeLightColorsDark: ["#cbd5e1aa", "#94a3b8aa", "#e2e8f088"],
            ropeLightThicknessDark: 1.5,
            ropeLightGlowIntensityDark: 2.0,
            ropeLightSpeedDark: 8.0,
            sharpLightColorsDark: ["#e2e8f0cc", "#94a3b8cc"],
            sharpLightThicknessDark: 1.0,
            themePrimaryColor: "#64748b",
            themeAccentColor: "#475569",
            themeFontFamily: "Inter"
          }
        }
      ];

      // Factory Reset Defaults Helper
      const handleResetLightsOnly = () => {
        const lightFallbacks: Record<string, any> = {
          ropeLightColors: ["#eab30866", "#67e8f966", "#6366f166", "#a855f766"],
          ropeLightSpeed: 12.0,
          ropeLightThickness: 1.5,
          ropeLightGlowIntensity: 3.0,
          ropeLightColorsLight: ["#fde68a44", "#93c5fd44", "#67e8f944"],
          ropeLightColorsDark: ["#eab30866", "#67e8f966", "#6366f166", "#a855f766"],
          ropeLightSpeedLight: 12.0,
          ropeLightSpeedDark: 12.0,
          ropeLightThicknessLight: 1.5,
          ropeLightThicknessDark: 1.5,
          ropeLightGlowIntensityLight: 3.0,
          ropeLightGlowIntensityDark: 3.0,
          ropeLightColorLight: "#fde68a44",
          ropeLightColorDark: "#a1620744",
          sharpLightColorsDark: ["#facc1544", "#93c5fd44", "#67e8f944"],
          sharpLightThicknessDark: 1.5,
          sharpLightColorsLight: ["#facc1533", "#93c5fd33"],
          sharpLightThicknessLight: 1.5,
          sharpLightSpeed: 12.0,
          sharpLightSpeedDark: 12.0,
          sharpLightSpeedLight: 12.0,
        };

        const updated = { ...currentData };
        Object.entries(lightFallbacks).forEach(([key, val]) => {
          if (shape[key]) {
            updated[key] = val;
          }
        });

        onChange(updated);
        toast.success("Light configurations reset to premium defaults!");
      };

      const handleFactoryResetLights = () => {
        const fallbacks: Record<string, any> = {
          // Rope lights baseline
          ropeLightColors: ["#eab30866", "#67e8f966", "#6366f166", "#a855f766"],
          ropeLightSpeed: 12.0,
          ropeLightThickness: 1.5,
          ropeLightGlowIntensity: 3.0,

          // Dark wash baseline
          ropeLightColorsDark: ["#eab30866", "#67e8f966", "#6366f166", "#a855f766"],
          ropeLightThicknessDark: 1.5,
          ropeLightGlowIntensityDark: 3.0,
          ropeLightSpeedDark: 12.0,

          // Light wash baseline
          ropeLightColorsLight: ["#fde68a44", "#93c5fd44", "#67e8f944"],
          ropeLightThicknessLight: 1.5,
          ropeLightGlowIntensityLight: 3.0,
          ropeLightSpeedLight: 12.0,

          // Fallbacks for legacy/light keys
          ropeLightColorLight: "#fde68a44",
          ropeLightColorDark: "#a1620744",

          // Sharp Outline Light baseline
          sharpLightColorsDark: ["#facc1544", "#93c5fd44", "#67e8f944"],
          sharpLightThicknessDark: 1.5,
          sharpLightColorsLight: ["#facc1533", "#93c5fd33"],
          sharpLightThicknessLight: 1.5,
          sharpLightSpeed: 12.0,
          sharpLightSpeedDark: 12.0,
          sharpLightSpeedLight: 12.0,

          // Text animation baseline settings
          textHoverColors: ["#22d3ee", "#fbbf24", "#6366f1", "#8b5cf6"],
          textTransitionSpeed: "0.8s",
          textAnimationSpeed: "4s",
          textGlowIntensity: 1.3,

          // Interactive Text Anim Dark baseline
          textTransitionSpeedDark: "0.8s",
          textLeaveSpeedDark: "0.4s",
          textAnimationSpeedDark: "4s",
          textBaseOpacityDark: 0.7,
          textGlowIntensityDark: 1.3,
          textHoverColorsDark: ["#22d3ee", "#fbbf24", "#6366f1", "#8b5cf6"],

          // Interactive Text Anim Light baseline
          textTransitionSpeedLight: "0.6s",
          textLeaveSpeedLight: "0.3s",
          textAnimationSpeedLight: "5s",
          textBaseOpacityLight: 0.8,
          textGlowIntensityLight: 1.0,
          textHoverColorsLight: ["#2563eb", "#ea580c", "#4f46e5"],

          // Theme branding colors and Google Fonts baseline reset values
          themePrimaryColor: "#6366f1",
          themeBackgroundColor: "#030712",
          themeAccentColor: "#c084fc",
          themeFontFamily: "Inter"
        };

        const updated = { ...currentData };
        Object.entries(fallbacks).forEach(([key, val]) => {
          if (shape[key]) {
            updated[key] = val;
          }
        });

        onChange(updated);
        toast.success("All aesthetic configurations reset to baseline defaults!");
      };

      const handleApplyPreset = (preset: typeof PRESETS[0]) => {
        const updated = { ...currentData };
        Object.entries(preset.values).forEach(([key, val]) => {
          if (shape[key]) {
            updated[key] = val;
          }
        });
        onChange(updated);
        toast.success(`Applied ${preset.name} combination!`);
      };

      const renderField = (key: string) => (
        <DynamicForm
          schema={shape[key]}
          data={currentData[key]}
          path={[...path, key]}
          parentData={currentData}
          onChange={(newVal) => onChange({ ...currentData, [key]: newVal })}
        />
      );

      return (
        <div className="space-y-6">
          {/* Aesthetic Controls Board */}
          <div className={`p-4 rounded-2xl border ${
            isDark ? 'bg-slate-900/40 border-border/30' : 'bg-slate-50 border-slate-350 shadow-sm'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 select-none">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-foreground/90">
                  <Sparkles size={14} className="text-primary animate-pulse" />
                  Aesthetic Controls Board
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Quickly select curated combinations or reset edge properties.</p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleResetLightsOnly}
                  className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                  title="Restore all edge lights, thickness, colors and speeds to balanced, visually appealing defaults"
                >
                  <RotateCcw size={12} /> Reset Lights
                </button>

                <button
                  type="button"
                  onClick={handleFactoryResetLights}
                  className="px-3 py-1.5 bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 text-destructive text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                  title="Restore all edge lights, theme colors, background colors, and Google Fonts to clean baseline defaults"
                >
                  <RotateCcw size={12} /> Reset All
                </button>
              </div>
            </div>

            {/* Scrolling curations list */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-muted-foreground/80 uppercase tracking-widest block">Curated Theme Combos:</span>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x max-w-full">
                {PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className={`shrink-0 px-3 py-2 rounded-xl text-xs font-bold border transition-all snap-start select-none cursor-pointer hover:scale-103 ${
                      isDark 
                        ? 'bg-slate-950/60 border-border/40 hover:border-primary/50 text-foreground hover:bg-slate-900' 
                        : 'bg-white border-slate-300 hover:border-primary/50 hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <SettingsAccordionContainer
            groups={groups}
            shape={shape}
            currentData={currentData}
            path={path}
            onChange={onChange}
            renderField={renderField}
          />

          {/* Any settings keys not wrapped by accordion groups rendered normally */}
          {visibleKeys.length > 0 && (
            <div className={`p-4 rounded-xl border space-y-4 ${isDark ? 'bg-muted/5 border-border/20' : 'bg-slate-100/20 border-slate-200 shadow-sm'}`}>
              <span className="text-[10px] font-extrabold text-muted-foreground/85 uppercase tracking-widest block">Additional Configuration:</span>
              {visibleKeys.map((key: string) => (
                <div key={key} className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider block">
                    {formatLabel(key)}
                  </label>
                  {renderField(key)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Media Uploader Injection for objects */}
        {(() => {
          const isMediaObj = keys.includes('secureUrl') || keys.includes('url') || path[path.length - 1] === 'profileImage' || path[path.length - 1] === 'architectureImage';
          if (!isMediaObj) return null;

          return (
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-muted/10 border-border/20' : 'bg-slate-100/50 border-slate-200'} shadow-sm`}>
              <div className="flex items-center gap-2 mb-3">
                <button type="button" onClick={() => setMediaInputMode('upload')} className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-md transition-all ${mediaInputMode === 'upload' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted/50 text-muted-foreground hover:bg-muted/80'}`}>Upload from PC</button>
                <button type="button" onClick={() => setMediaInputMode('link')} className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-md transition-all ${mediaInputMode === 'link' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted/50 text-muted-foreground hover:bg-muted/80'}`}>Provide Image Address</button>
              </div>

              {mediaInputMode === 'upload' && (
                <>
                  <MediaUploadDropzone
                    fieldKeyLower={path[path.length - 1]?.toLowerCase() || ''}
                    path={path}
                    isMediaUrl={path.includes('media')}
                    onChange={(result) => onChange({ ...currentData, ...result })}
                  />
                  {(currentData.secureUrl || currentData.url) && (
                    <div className="mt-4 border-t border-border/30 pt-4">
                      <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider block mb-2">Current Image:</span>
                      <MediaPreview url={currentData.secureUrl || currentData.url} type={currentData.resourceType || currentData.type} />
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })()}

        {(() => {
          const renderFieldWrapper = (key: string) => {
            const isMediaObj = keys.includes('secureUrl') || keys.includes('url') || path[path.length - 1] === 'profileImage' || path[path.length - 1] === 'architectureImage';
            
            if (key === 'url' && keys.includes('secureUrl')) {
               if (currentData['url'] && !currentData['secureUrl']) return (
                 <div key={key} className="space-y-1.5">
                   <label className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider block">{formatLabel(key)}</label>
                   <DynamicForm schema={shape[key]} data={currentData[key]} path={[...path, key]} parentData={currentData} onChange={(newVal) => onChange({ ...currentData, [key]: newVal })} />
                 </div>
               );
               return null;
            }

            if (isMediaObj && mediaInputMode === 'upload') {
              if (key === 'secureUrl' || key === 'url' || key === 'publicId' || key === 'resourceType') return null;
            }
            if (key === 'publicId' || key === 'resourceType') {
              if (!currentData[key]) return null;
            }

            return (
              <div key={key} className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider block">
                  {formatLabel(key)}
                </label>
                {key === 'themeFontFamily' && (
                  <div className="bg-primary/5 border border-primary/10 rounded-lg p-2.5 text-[10px] text-muted-foreground/90 leading-relaxed max-w-lg mt-0.5 mb-1.5">
                    <strong className="text-primary flex items-center gap-1 mb-0.5 font-bold">💡 Google Fonts Integrator:</strong>
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
            );
          };

          // Project Form Grouping Logic
          const isProjectForm = path.length === 0 && keys.includes('github') && keys.includes('tech');
          if (isProjectForm) {
            const groups = [
              {
                id: 'basic-info',
                title: 'Basic Info',
                keys: ['id', 'title', 'slug', 'category', 'description', 'tech', 'github', 'live', 'featured', 'impact']
              },
              {
                id: 'content-media',
                title: 'Content & Media',
                keys: ['media', 'architectureImage', 'howItWorks', 'resources', 'open_resources']
              },
              {
                id: 'problem-objectives',
                title: 'Problem & Objectives',
                keys: ['problem_statement', 'business_problem', 'objectives', 'success_criteria', 'learning_outcomes']
              },
              {
                id: 'data-details',
                title: 'Data & Features',
                keys: ['data_sources', 'data_volume', 'class_distribution', 'target_variable', 'features']
              },
              {
                id: 'modeling-ml',
                title: 'Modeling & Pipeline',
                keys: ['preprocessing', 'feature_engineering', 'model_inputs', 'model_outputs', 'modeling', 'hyperparameters', 'evaluation_metrics', 'validation_strategy', 'explainability']
              },
              {
                id: 'deployment-mlops',
                title: 'Deployment & Architecture',
                keys: ['training_environment', 'inference_pipeline', 'deployment', 'monitoring', 'versioning', 'architecture']
              },
              {
                id: 'governance',
                title: 'Governance (Risks & Ethics)',
                keys: ['risks', 'ethics', 'privacy', 'known_limitations', 'future_improvements']
              },
              {
                id: 'advanced',
                title: 'Advanced / Overrides',
                keys: ['knowledge_overrides']
              }
            ];

            return (
              <div className="space-y-4">
                {groups.map(group => {
                  const groupKeys = keys.filter(k => group.keys.includes(k));
                  if (groupKeys.length === 0) return null;
                  return (
                    <details key={group.id} className="group/details bg-background border border-border/30 rounded-xl overflow-hidden shadow-sm" open={group.id === 'basic-info'}>
                      <summary className="p-4 cursor-pointer bg-muted/5 hover:bg-muted/10 transition-colors font-bold text-sm text-foreground flex items-center justify-between select-none border-b border-transparent group-open/details:border-border/30">
                        {group.title}
                        <div className="text-muted-foreground group-open/details:rotate-180 transition-transform">▼</div>
                      </summary>
                      <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7">
                        {groupKeys.map(key => {
                          const unwrappedField = unwrapSchema(shape[key], currentData[key]);
                          // Arrays, Objects, or known long text fields should take full width
                          const isFullWidth = 
                            unwrappedField instanceof z.ZodArray || 
                            unwrappedField instanceof z.ZodObject || 
                            ['description', 'problem_statement', 'business_problem', 'howItWorks', 'markdown_content', 'architecture', 'knowledge_overrides', 'architectureImage'].includes(key);

                          return (
                            <div key={key} className={isFullWidth ? "md:col-span-2" : "col-span-1"}>
                              {renderFieldWrapper(key)}
                            </div>
                          );
                        })}
                      </div>
                    </details>
                  );
                })}
                {/* Any remaining keys not in groups */}
                {(() => {
                  const groupedKeys = new Set(groups.flatMap(g => g.keys));
                  const remainingKeys = keys.filter(k => !groupedKeys.has(k) && !['knowledge_overrides'].includes(k));
                  if (remainingKeys.length === 0) return null;
                  return (
                    <details className="group/details bg-background border border-border/30 rounded-xl overflow-hidden shadow-sm">
                      <summary className="p-4 cursor-pointer bg-muted/5 hover:bg-muted/10 transition-colors font-bold text-sm text-foreground flex items-center justify-between select-none border-b border-transparent group-open/details:border-border/30">
                        Other Fields
                        <div className="text-muted-foreground group-open/details:rotate-180 transition-transform">▼</div>
                      </summary>
                      <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7">
                        {remainingKeys.map(key => {
                          const unwrappedField = unwrapSchema(shape[key], currentData[key]);
                          const isFullWidth = unwrappedField instanceof z.ZodArray || unwrappedField instanceof z.ZodObject;
                          return (
                            <div key={key} className={isFullWidth ? "md:col-span-2" : "col-span-1"}>
                              {renderFieldWrapper(key)}
                            </div>
                          );
                        })}
                      </div>
                    </details>
                  );
                })()}
              </div>
            );
          }

          // Default fallback rendering
          return keys.map((key: string) => renderFieldWrapper(key));
        })()}
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

    if (currentArray.length === 0) {
      return (
        <div className="flex flex-col gap-2 pt-1 pb-1">
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

          <div className={`grid transition-all duration-300 [transition-timing-function:cubic-bezier(0.25,1,0.5,1)] ${
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

    return (
      <div className="bg-muted/5 border border-border/20 rounded-xl p-4 space-y-4 shadow-sm">
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
            >
              <DynamicForm
                schema={itemSchema}
                data={item}
                path={[...path, String(index)]}
                onChange={(newVal) => {
                  const a = [...currentArray];
                  a[index] = newVal;
                  onChange(a);
                }}
              />
            </ArrayItemWrapper>
          ))}
        </div>
        
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/10">
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

        <div className={`grid transition-all duration-300 [transition-timing-function:cubic-bezier(0.25,1,0.5,1)] ${
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
          className="w-full appearance-none bg-background border border-border/40 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 text-foreground pr-10 cursor-pointer transition-colors hover:border-border/70 animate-in fade-in duration-100"
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
    return (
      <StringField
        data={data}
        onChange={onChange}
        path={path}
        previewData={previewData}
        isDark={isDark}
        mediaInputMode={mediaInputMode}
        setMediaInputMode={setMediaInputMode}
        parentData={parentData}
      />
    );
  }

  // ── Number ──────────────────────────────────────────────────────────────────
  if (unwrapped instanceof z.ZodNumber) {
    const currentNum = typeof data === 'number' ? data : 0;
    const minVal = typeof (unwrapped as any).minValue === 'number' ? (unwrapped as any).minValue : undefined;
    const maxVal = typeof (unwrapped as any).maxValue === 'number' ? (unwrapped as any).maxValue : undefined;
    const step = typeof (unwrapped as any).step === 'number' ? (unwrapped as any).step : undefined;

    return (
      <div className="w-full max-w-sm animate-in fade-in duration-100">
        <input
          type="number"
          min={minVal}
          max={maxVal}
          step={step}
          value={data === undefined || data === null ? "" : data}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "") {
              onChange(undefined);
            } else {
              const num = Number(val);
              if (!isNaN(num)) {
                onChange(num);
              }
            }
          }}
          className={`w-full p-2.5 text-sm rounded-lg border focus:outline-none focus:border-primary/50 shadow-inner ${
            isDark ? 'bg-slate-900 border-border/30 text-foreground font-semibold' : 'bg-white border-slate-350 text-slate-800 font-semibold'
          }`}
          placeholder={minVal !== undefined && maxVal !== undefined ? `Range: [${minVal} to ${maxVal}]...` : "Enter numeric value..."}
        />
      </div>
    );
  }

  // ── ZodBoolean → Custom Styled Switch ─────────────────────────────────────────
  if (unwrapped instanceof z.ZodBoolean) {
    return (
      <label className="relative inline-flex items-center cursor-pointer select-none mt-1 animate-in fade-in duration-100">
        <div 
          onClick={() => onChange(!data)}
          className={`w-11 h-6 rounded-full border transition-all duration-200 relative ${
            data 
              ? 'bg-primary border-primary shadow-[0_0_10px_rgba(99,102,241,0.25)]' 
              : `border-border/30 ${isDark ? 'bg-slate-900' : 'bg-slate-200'}`
          }`}
        >
          {/* Thumb circle slider */}
          <div className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-all duration-200 ${
            data ? 'translate-x-5' : 'translate-x-0'
          }`} />
        </div>
        <span className="ml-3 text-xs font-semibold text-muted-foreground/90 uppercase tracking-wider">
          {data ? 'Enabled' : 'Disabled'}
        </span>
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
