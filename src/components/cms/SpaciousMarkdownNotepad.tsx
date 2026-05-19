import React from 'react';
import { FileText, Minimize2, Maximize2, X, Undo2, Redo2, Heading, Bold, Italic, Quote, Code, Table, Image as ImageIcon, Link as LinkIcon, Eye, BookOpen, Save, Upload } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { formatLabel, convertToRawGitHubUrl } from './FormHelpers';

interface SpaciousMarkdownNotepadProps {
  isNotepadOpen: boolean;
  setIsNotepadOpen: (open: boolean) => void;
  localValue: string;
  setLocalValue: (val: string) => void;
  onChange: (val: string) => void;
  fieldKey: string;
  isDark: boolean;
  draftKey: string;
  hasDraft: boolean;
  setHasDraft: (has: boolean) => void;
  data: string;
}

export const SpaciousMarkdownNotepad: React.FC<SpaciousMarkdownNotepadProps> = ({
  isNotepadOpen,
  setIsNotepadOpen,
  localValue,
  setLocalValue,
  onChange,
  fieldKey,
  isDark,
  draftKey,
  hasDraft,
  setHasDraft,
  data
}) => {
  const [isFullscreenNotepad, setIsFullscreenNotepad] = React.useState(false);
  const [wordWrap, setWordWrap] = React.useState(true);
  const [splitPreview, setSplitPreview] = React.useState(true);
  const [previewOnly, setPreviewOnly] = React.useState(false);
  const [fontSize, setFontSize] = React.useState(13);
  
  // History Undo/Redo tracking
  const [history, setHistory] = React.useState<string[]>([data || '']);
  const [historyIndex, setHistoryIndex] = React.useState(0);
  
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const lastPushedValue = React.useRef(data || '');
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  const pushHistory = React.useCallback((val: string) => {
    if (val === lastPushedValue.current) return;
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(val);
    
    // Cap history size
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    lastPushedValue.current = val;
  }, [history, historyIndex]);

  const handleUndo = React.useCallback(() => {
    if (historyIndex > 0) {
      const nextIndex = historyIndex - 1;
      setHistoryIndex(nextIndex);
      const prevValue = history[nextIndex];
      setLocalValue(prevValue);
      lastPushedValue.current = prevValue;
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  }, [history, historyIndex, setLocalValue]);

  const handleRedo = React.useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      const nextValue = history[nextIndex];
      setLocalValue(nextValue);
      lastPushedValue.current = nextValue;
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  }, [history, historyIndex, setLocalValue]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLocalValue(val);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      pushHistory(val);
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      handleUndo();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
      e.preventDefault();
      handleRedo();
    }
  };

  const insertMarkdown = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = before + selected + after;
    
    const newValue = text.substring(0, start) + replacement + text.substring(end);
    setLocalValue(newValue);
    pushHistory(newValue);
    
    // Focus back and set selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
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
        insertMarkdown(`![${file.name.split('.')[0]}](${convertedUrl})`);
        toast.success("Image uploaded and embedded into editor!");
      } else {
        throw new Error(result.error || "Upload failed");
      }
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  // Intercept unsaved changes on reload/back
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isNotepadOpen && localValue !== (data || '')) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes in your Notepad. Are you sure you want to leave?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isNotepadOpen, localValue, data]);

  React.useEffect(() => {
    if (isNotepadOpen) {
      const initialVal = data || '';
      setHistory([initialVal]);
      setHistoryIndex(0);
      lastPushedValue.current = initialVal;
    }
  }, [isNotepadOpen, data]);

  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  if (!isNotepadOpen) return null;

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-md animate-in fade-in duration-200 bg-background/80 ${isFullscreenNotepad ? 'p-0' : 'p-4 md:p-8'}`}>
      <div className={`w-full h-full border flex flex-col overflow-hidden transition-all duration-200 bg-card border-border/80 shadow-2xl ${
        isFullscreenNotepad 
          ? 'max-w-none rounded-none border-none shadow-none' 
          : 'max-w-6xl rounded-2xl animate-in zoom-in-95 duration-200'
      }`}>
        {/* Notepad Titlebar */}
        <div className="px-4 py-2.5 flex items-center justify-between select-none shrink-0 border-b bg-muted/80 border-border/40 text-foreground">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-primary animate-pulse" />
            <span className="text-xs font-mono font-bold">
              notepad.exe - Editing {formatLabel(fieldKey)} (Markdown README format)
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsFullscreenNotepad(!isFullscreenNotepad)}
              className="p-1 rounded transition-colors cursor-pointer hover:bg-muted text-muted-foreground hover:text-foreground"
              title={isFullscreenNotepad ? "Restore Window Size" : "Maximize to Fullscreen"}
            >
              {isFullscreenNotepad ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
            <button 
              type="button"
              onClick={() => {
                setLocalValue(data || '');
                setIsNotepadOpen(false);
                toast.info("Changes discarded.");
              }}
              className="p-1 rounded transition-colors cursor-pointer hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {hasDraft && (
          <div className="px-4 py-2.5 flex items-center justify-between text-xs shrink-0 select-none animate-in slide-in-from-top duration-200 border-b bg-primary/10 border-primary/30 text-foreground/90">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span>
                <strong>Unsaved Draft Found:</strong> We recovered a local draft of this field from a previous session.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const draft = localStorage.getItem(draftKey);
                  if (draft) {
                    setLocalValue(draft);
                    pushHistory(draft);
                    toast.success("Draft restored successfully!");
                  }
                  setHasDraft(false);
                }}
                className="px-2.5 py-1 bg-primary text-primary-foreground hover:bg-primary/90 text-[10px] font-bold rounded transition-colors shadow cursor-pointer"
              >
                Restore Draft
              </button>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem(draftKey);
                  setHasDraft(false);
                  toast.info("Draft discarded.");
                }}
                className="px-2.5 py-1 text-[10px] font-bold rounded border transition-colors cursor-pointer bg-muted hover:bg-destructive/20 hover:text-destructive border-border/30"
              >
                Discard
              </button>
            </div>
          </div>
        )}

        {/* Markdown insertion and format toolbar */}
        <div className="px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 select-none border-b bg-card text-muted-foreground border-border/40">
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-full scrollbar-none">
            <button 
              type="button"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className={`p-1.5 rounded border transition-all flex items-center justify-center cursor-pointer ${
                historyIndex > 0
                  ? 'bg-muted text-foreground border-border/30 hover:bg-primary/10 hover:text-primary hover:border-primary/30'
                  : 'bg-muted/10 text-muted-foreground/45 cursor-not-allowed border-none opacity-40'
              }`}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 size={13} />
            </button>
            <button 
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className={`p-1.5 rounded border transition-all flex items-center justify-center cursor-pointer ${
                historyIndex < history.length - 1
                  ? 'bg-muted text-foreground border-border/30 hover:bg-primary/10 hover:text-primary hover:border-primary/30'
                  : 'bg-muted/10 text-muted-foreground/45 cursor-not-allowed border-none opacity-40'
              }`}
              title="Redo (Ctrl+Y)"
            >
              <Redo2 size={13} />
            </button>
            <div className="w-[1px] h-4 bg-border/40 mx-1 shrink-0" />

            <button 
              type="button"
              onClick={() => insertMarkdown("### ")}
              className="px-2.5 py-1 rounded border font-medium transition-all flex items-center gap-1 cursor-pointer bg-muted border-border/30 hover:bg-primary/10 hover:text-primary text-foreground"
              title="Insert Heading"
            >
              <Heading size={12} /> <span className="hidden sm:inline">Header</span>
            </button>
            <button 
              type="button"
              onClick={() => insertMarkdown("**", "**")}
              className={`px-2.5 py-1 rounded border font-medium transition-all flex items-center gap-1 cursor-pointer ${
                isDark ? 'bg-muted/40 border-border/30 hover:bg-primary/10 hover:text-primary' : 'bg-white border-slate-300 hover:bg-primary/10 hover:text-primary text-slate-700'
              }`}
              title="Insert Bold"
            >
              <Bold size={12} /> <span className="hidden sm:inline">Bold</span>
            </button>
            <button 
              type="button"
              onClick={() => insertMarkdown("*", "*")}
              className={`px-2.5 py-1 rounded border font-medium transition-all flex items-center gap-1 cursor-pointer ${
                isDark ? 'bg-muted/40 border-border/30 hover:bg-primary/10 hover:text-primary' : 'bg-white border-slate-300 hover:bg-primary/10 hover:text-primary text-slate-700'
              }`}
              title="Insert Italic"
            >
              <Italic size={12} /> <span className="hidden sm:inline">Italic</span>
            </button>
            <button 
              type="button"
              onClick={() => insertMarkdown("> ")}
              className={`px-2.5 py-1 rounded border font-medium transition-all flex items-center gap-1 cursor-pointer ${
                isDark ? 'bg-muted/40 border-border/30 hover:bg-primary/10 hover:text-primary' : 'bg-white border-slate-300 hover:bg-primary/10 hover:text-primary text-slate-700'
              }`}
              title="Insert Quote"
            >
              <Quote size={12} /> <span className="hidden sm:inline">Quote</span>
            </button>
            <button 
              type="button"
              onClick={() => insertMarkdown("```\n", "\n```")}
              className={`px-2.5 py-1 rounded border font-medium transition-all flex items-center gap-1 cursor-pointer ${
                isDark ? 'bg-muted/40 border-border/30 hover:bg-primary/10 hover:text-primary' : 'bg-white border-slate-300 hover:bg-primary/10 hover:text-primary text-slate-700'
              }`}
              title="Insert Code block"
            >
              <Code size={12} /> <span className="hidden sm:inline">Code</span>
            </button>
            <button 
              type="button"
              onClick={() => insertMarkdown("| Header 1 | Header 2 |\n|---|---|\n| Value 1 | Value 2 |")}
              className={`px-2.5 py-1 rounded border font-medium transition-all flex items-center gap-1 cursor-pointer ${
                isDark ? 'bg-muted/40 border-border/30 hover:bg-primary/10 hover:text-primary' : 'bg-white border-slate-300 hover:bg-primary/10 hover:text-primary text-slate-700'
              }`}
              title="Insert Markdown Table"
            >
              <Table size={12} /> <span className="hidden sm:inline">Table</span>
            </button>

            {/* Premium Drag & Drop or Click to Upload Image directly in editor */}
            <div className="relative inline-block">
              <input
                type="file"
                accept="image/*"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleUploadFile(file);
                }}
                className="hidden"
                id="notepad-embed-file"
              />
              <label
                htmlFor="notepad-embed-file"
                className={`px-2.5 py-1 rounded border font-medium transition-all flex items-center gap-1 cursor-pointer select-none text-[10px] md:text-xs ${
                  isUploading 
                    ? 'bg-muted/15 border-border/30 text-muted-foreground cursor-not-allowed'
                    : (isDark ? 'bg-muted/40 border-border/30 hover:bg-primary/10 hover:text-primary' : 'bg-white border-slate-300 hover:bg-primary/10 hover:text-primary text-slate-700')
                }`}
                title="Upload image and insert link directly"
              >
                <Upload size={12} className={isUploading ? 'animate-spin' : ''} />
                <span>{isUploading ? 'Uploading...' : 'Embed Image'}</span>
              </label>
            </div>

            <button 
              type="button"
              onClick={() => insertMarkdown("[Link Title](", ")")}
              className={`px-2.5 py-1 rounded border font-medium transition-all flex items-center gap-1 cursor-pointer ${
                isDark ? 'bg-muted/40 border-border/30 hover:bg-primary/10 hover:text-primary' : 'bg-white border-slate-300 hover:bg-primary/10 hover:text-primary text-slate-700'
              }`}
              title="Insert Anchor Link"
            >
              <LinkIcon size={12} /> <span className="hidden sm:inline">Link</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer text-[10px] uppercase font-bold text-muted-foreground">
              <input 
                type="checkbox" 
                checked={wordWrap}
                onChange={e => setWordWrap(e.target.checked)}
                className="rounded border-border bg-slate-950 text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer w-3.5 h-3.5"
              />
              Word Wrap
            </label>

            <button
              type="button"
              onClick={() => {
                const nextSplit = !splitPreview;
                setSplitPreview(nextSplit);
                if (nextSplit) setPreviewOnly(false);
              }}
              className={`px-3 py-1 rounded border transition-all text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer ${
                splitPreview && !previewOnly
                  ? 'bg-primary/20 text-primary border-primary/45 shadow-[0_0_10px_rgba(99,102,241,0.2)]' 
                  : 'bg-muted/30 border-border/40 text-muted-foreground hover:text-foreground'
              }`}
              title="Show side-by-side editing and formatted Markdown preview"
            >
              <Eye size={12} /> Split Preview
            </button>

            <button
              type="button"
              onClick={() => {
                const nextPreviewOnly = !previewOnly;
                setPreviewOnly(nextPreviewOnly);
                if (nextPreviewOnly) setSplitPreview(false);
              }}
              className={`px-3 py-1 rounded border transition-all text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer ${
                previewOnly 
                  ? 'bg-accent/20 text-accent border-accent/45 shadow-[0_0_10px_rgba(236,72,153,0.2)]' 
                  : 'bg-muted/30 border-border/40 text-muted-foreground hover:text-foreground'
              }`}
              title="Hide editor and display only the fullscreen formatted Markdown draft"
            >
              <BookOpen size={12} /> Preview Only
            </button>
          </div>
        </div>

        {/* Dual pane layout workspace */}
        <div className="flex-1 flex overflow-hidden min-h-0 bg-background/30">
          {!previewOnly && (
            <div className={`flex-1 h-full flex flex-col overflow-hidden ${splitPreview ? 'border-r md:w-1/2 border-border/40' : 'w-full'}`}>
              <textarea
                ref={textareaRef}
                value={localValue}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                className={`flex-1 w-full p-6 font-mono text-sm leading-relaxed focus:outline-none focus:ring-0 border-none resize-none caret-primary scrollbar-thin bg-transparent text-foreground placeholder-muted-foreground/50 ${
                  wordWrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre overflow-x-auto'
                }`}
                placeholder={`Write ${formatLabel(fieldKey)} markdown content here (supports README markdown preview style)...`}
                style={{ fontSize: `${fontSize}px` }}
              />
            </div>
          )}

          {(splitPreview || previewOnly) && (
            <div className={`h-full flex flex-col overflow-y-auto p-6 scrollbar-thin bg-muted/10 ${
              previewOnly ? 'w-full flex' : 'hidden md:flex md:w-1/2'
            }`}>
              <div className="prose prose-sm max-w-none 
                              prose-headings:font-heading prose-headings:font-bold 
                              prose-strong:font-bold
                              prose-code:text-primary prose-code:bg-primary/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md
                              prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                              leading-relaxed text-left prose-headings:text-foreground prose-strong:text-foreground text-muted-foreground">
                {localValue ? (
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      img: ({ node, ...props }) => (
                        <div className="my-6 flex flex-col items-center gap-1.5 group/img">
                          <img 
                            {...props} 
                            className="rounded-xl border border-border/40 max-h-[250px] w-auto max-w-full object-contain shadow-xl hover:border-primary/30 hover:scale-[1.01] transition-all duration-300" 
                            loading="lazy" 
                          />
                          {props.alt && (
                            <span className="text-[10px] text-muted-foreground/60 italic select-none">
                              {props.alt}
                            </span>
                          )}
                        </div>
                      ),
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
                    {localValue}
                  </ReactMarkdown>
                ) : (
                  <p className="text-muted-foreground italic">Markdown preview will render here in premium README format as you type...</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="px-4 py-1.5 flex items-center justify-between text-[10px] font-mono select-none shrink-0 border-t bg-muted/50 text-muted-foreground border-border/40">
          <div className="flex items-center gap-3">
            <span>Lines: {localValue.split('\n').length}</span>
            <span>Words: {localValue.trim() ? localValue.trim().split(/\s+/).length : 0}</span>
            <span>Chars: {localValue.length}</span>
          </div>
          <div>UTF-8 | Markdown | Size: {fontSize}px</div>
        </div>

        {/* Actions Footer */}
        <div className="px-4 py-3 flex items-center justify-between gap-3 shrink-0 border-t bg-card border-border/40">
          <div className="flex items-center gap-2 select-none">
            <button
              type="button"
              onClick={() => setFontSize(prev => Math.max(10, prev - 1))}
              className="p-1 rounded border text-[10px] font-bold font-mono w-6 h-6 flex items-center justify-center cursor-pointer transition-colors bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border-border/30"
              title="Decrease Font Size"
            >
              A-
            </button>
            <button
              type="button"
              onClick={() => setFontSize(prev => Math.min(24, prev + 1))}
              className="p-1 rounded border text-[10px] font-bold font-mono w-6 h-6 flex items-center justify-center cursor-pointer transition-colors bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border-border/30"
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setLocalValue(data || '');
                setIsNotepadOpen(false);
                toast.info("Changes discarded.");
              }}
              className="px-4 py-2 text-xs font-semibold rounded-lg transition-colors border cursor-pointer bg-muted hover:bg-muted/80 text-muted-foreground border-border/30"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onChange(localValue);
                localStorage.removeItem(draftKey);
                setIsNotepadOpen(false);
                toast.success("Markdown applied successfully!");
              }}
              className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold rounded-lg transition-colors shadow-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Save size={13} /> Save & Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
