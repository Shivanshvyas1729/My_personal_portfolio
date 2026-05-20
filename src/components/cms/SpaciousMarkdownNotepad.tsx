import React from 'react';
import {
  FileText, Minimize2, Maximize2, X, Undo2, Redo2,
  Bold, Italic, Quote, Code, Table, Image as ImageIcon,
  Link as LinkIcon, Eye, BookOpen, Save, Upload,
  Underline, List, ListOrdered, Minus, Type, ChevronDown
} from 'lucide-react';
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
  const [showHeadingMenu, setShowHeadingMenu] = React.useState(false);
  const [showLinkDialog, setShowLinkDialog] = React.useState(false);
  const [linkText, setLinkText] = React.useState('');
  const [linkUrl, setLinkUrl] = React.useState('');

  // History Undo/Redo tracking
  const [history, setHistory] = React.useState<string[]>([data || '']);
  const [historyIndex, setHistoryIndex] = React.useState(0);

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const lastPushedValue = React.useRef(data || '');
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const headingMenuRef = React.useRef<HTMLDivElement>(null);

  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  const pushHistory = React.useCallback((val: string) => {
    if (val === lastPushedValue.current) return;
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(val);
    if (newHistory.length > 50) newHistory.shift();
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
    // Undo / Redo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); handleUndo(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); handleRedo(); }

    // Tab → insert 2 spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      insertMarkdown('  ');
    }

    // Enter → auto-continue list items
    if (e.key === 'Enter') {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const { selectionStart, value } = textarea;
      const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
      const currentLine = value.substring(lineStart, selectionStart);
      const ulMatch = currentLine.match(/^(\s*)([-*+] )/);
      const olMatch = currentLine.match(/^(\s*)(\d+)\. /);
      if (ulMatch) {
        e.preventDefault();
        const indent = ulMatch[1];
        const bullet = ulMatch[2];
        // If line is only the bullet (empty item), remove the bullet
        if (currentLine.trim() === bullet.trim()) {
          const newVal = value.substring(0, lineStart) + '\n' + value.substring(selectionStart);
          setLocalValue(newVal);
          setTimeout(() => textarea.setSelectionRange(lineStart + 1, lineStart + 1), 0);
        } else {
          const insert = `\n${indent}${bullet}`;
          insertMarkdown(insert);
        }
        return;
      }
      if (olMatch) {
        e.preventDefault();
        const indent = olMatch[1];
        const num = parseInt(olMatch[2], 10) + 1;
        const insert = `\n${indent}${num}. `;
        insertMarkdown(insert);
        return;
      }
    }
  };

  const insertMarkdown = React.useCallback((before: string, after: string = '') => {
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

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selected.length;
      textarea.setSelectionRange(
        start + before.length,
        after ? start + before.length + selected.length : newCursorPos
      );
    }, 0);
  }, [pushHistory, setLocalValue]);

  // Insert heading at start of current line
  const insertHeading = React.useCallback((level: number) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const prefix = '#'.repeat(level) + ' ';
    const { selectionStart, value } = textarea;
    const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
    const lineEnd = value.indexOf('\n', selectionStart);
    const currentLine = value.substring(lineStart, lineEnd === -1 ? value.length : lineEnd);
    // Remove existing heading prefix if any
    const cleanLine = currentLine.replace(/^#{1,6}\s/, '');
    const newLine = prefix + cleanLine;
    const before = value.substring(0, lineStart);
    const after = lineEnd === -1 ? '' : value.substring(lineEnd);
    const newValue = before + newLine + after;
    setLocalValue(newValue);
    pushHistory(newValue);
    setShowHeadingMenu(false);
    setTimeout(() => {
      textarea.focus();
      const newPos = lineStart + newLine.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  }, [pushHistory, setLocalValue]);

  // <u>underline</u> via HTML in markdown
  const insertUnderline = React.useCallback(() => {
    insertMarkdown('<u>', '</u>');
  }, [insertMarkdown]);

  // Insert link from dialog
  const handleInsertLink = React.useCallback(() => {
    const text = linkText.trim() || 'Link Text';
    const url = linkUrl.trim() || 'https://';
    insertMarkdown(`[${text}](${url})`);
    setLinkText('');
    setLinkUrl('');
    setShowLinkDialog(false);
  }, [linkText, linkUrl, insertMarkdown]);

  // Paste handler for images
  const handlePaste = React.useCallback(async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file) {
          toast.info('Uploading pasted image…');
          await handleUploadFile(file);
        }
        return;
      }
    }
  }, []);

  const handleUploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const compressedBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target?.result as string;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const maxDim = 1200;
            let w = img.width;
            let h = img.height;
            if (w > maxDim || h > maxDim) {
              if (w > h) { h = Math.round((h * maxDim) / w); w = maxDim; }
              else { w = Math.round((w * maxDim) / h); h = maxDim; }
            }
            canvas.width = w;
            canvas.height = h;
            ctx?.drawImage(img, 0, 0, w, h);
            const dataUrl = canvas.toDataURL('image/webp', 0.8);
            resolve(dataUrl.split(',')[1]);
          };
          img.onerror = () => reject(new Error('Failed to load image'));
        };
        reader.onerror = () => reject(new Error('File reader error'));
      });

      const extension = '.webp';
      const baseName = file.name.substring(0, file.name.lastIndexOf('.')).replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const uniqueFileName = `${baseName}_${Date.now()}${extension}`;

      const res = await fetch('/api/cms-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: uniqueFileName, fileContent: compressedBase64 })
      });

      const result = await res.json();
      if (result.success) {
        const convertedUrl = convertToRawGitHubUrl(result.url);
        insertMarkdown(`![${file.name.split('.')[0]}](${convertedUrl})`);
        toast.success('Image uploaded and embedded!');
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload file');
      toast.error(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // Close heading menu on outside click
  React.useEffect(() => {
    if (!showHeadingMenu) return;
    const handler = (e: MouseEvent) => {
      if (headingMenuRef.current && !headingMenuRef.current.contains(e.target as Node)) {
        setShowHeadingMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showHeadingMenu]);

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
    return () => { if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current); };
  }, []);

  if (!isNotepadOpen) return null;

  const btnBase = `px-2.5 py-1 rounded border font-medium transition-all flex items-center gap-1 cursor-pointer text-xs`;
  const btnStyle = `${btnBase} ${isDark ? 'bg-muted/40 border-border/30 hover:bg-primary/10 hover:text-primary text-foreground' : 'bg-white border-slate-300 hover:bg-primary/10 hover:text-primary text-slate-700'}`;

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-md animate-in fade-in duration-200 bg-background/80 ${isFullscreenNotepad ? 'p-0' : 'p-4 md:p-8'}`}>
      <div className={`w-full h-full border flex flex-col overflow-hidden transition-all duration-200 bg-card border-border/80 shadow-2xl ${
        isFullscreenNotepad
          ? 'max-w-none rounded-none border-none shadow-none'
          : 'max-w-6xl rounded-2xl animate-in zoom-in-95 duration-200'
      }`}>

        {/* ── Titlebar ─────────────────────────────────────────────────── */}
        <div className="px-4 py-2.5 flex items-center justify-between select-none shrink-0 border-b bg-muted/80 border-border/40 text-foreground">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-primary animate-pulse" />
            <span className="text-xs font-mono font-bold">
              notepad.exe — Editing <span className="text-primary">{formatLabel(fieldKey)}</span> (Markdown)
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button type="button" onClick={() => setIsFullscreenNotepad(!isFullscreenNotepad)}
              className="p-1 rounded transition-colors cursor-pointer hover:bg-muted text-muted-foreground hover:text-foreground"
              title={isFullscreenNotepad ? 'Restore Window' : 'Maximize'}>
              {isFullscreenNotepad ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
            <button type="button"
              onClick={() => { setLocalValue(data || ''); setIsNotepadOpen(false); toast.info('Changes discarded.'); }}
              className="p-1 rounded transition-colors cursor-pointer hover:bg-destructive/20 text-muted-foreground hover:text-destructive">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Draft recovery banner ─────────────────────────────────────── */}
        {hasDraft && (
          <div className="px-4 py-2.5 flex items-center justify-between text-xs shrink-0 select-none animate-in slide-in-from-top duration-200 border-b bg-primary/10 border-primary/30 text-foreground/90">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span><strong>Unsaved Draft Found:</strong> We recovered a local draft from a previous session.</span>
            </div>
            <div className="flex items-center gap-2">
              <button type="button"
                onClick={() => {
                  const draft = localStorage.getItem(draftKey);
                  if (draft) { setLocalValue(draft); pushHistory(draft); toast.success('Draft restored!'); }
                  setHasDraft(false);
                }}
                className="px-2.5 py-1 bg-primary text-primary-foreground hover:bg-primary/90 text-[10px] font-bold rounded transition-colors shadow cursor-pointer">
                Restore Draft
              </button>
              <button type="button"
                onClick={() => { localStorage.removeItem(draftKey); setHasDraft(false); toast.info('Draft discarded.'); }}
                className="px-2.5 py-1 text-[10px] font-bold rounded border transition-colors cursor-pointer bg-muted hover:bg-destructive/20 hover:text-destructive border-border/30">
                Discard
              </button>
            </div>
          </div>
        )}

        {/* ── Toolbar ──────────────────────────────────────────────────── */}
        <div className="px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0 select-none border-b bg-card text-muted-foreground border-border/40">
          <div className="flex items-center gap-1 flex-wrap">

            {/* Undo / Redo */}
            <button type="button" onClick={handleUndo} disabled={historyIndex <= 0}
              className={`p-1.5 rounded border transition-all flex items-center justify-center cursor-pointer ${historyIndex > 0 ? 'bg-muted text-foreground border-border/30 hover:bg-primary/10 hover:text-primary' : 'opacity-30 cursor-not-allowed bg-muted/10 border-none'}`}
              title="Undo (Ctrl+Z)"><Undo2 size={13} /></button>
            <button type="button" onClick={handleRedo} disabled={historyIndex >= history.length - 1}
              className={`p-1.5 rounded border transition-all flex items-center justify-center cursor-pointer ${historyIndex < history.length - 1 ? 'bg-muted text-foreground border-border/30 hover:bg-primary/10 hover:text-primary' : 'opacity-30 cursor-not-allowed bg-muted/10 border-none'}`}
              title="Redo (Ctrl+Y)"><Redo2 size={13} /></button>

            <div className="w-px h-4 bg-border/40 mx-0.5 shrink-0" />

            {/* ── Heading dropdown ── */}
            <div className="relative" ref={headingMenuRef}>
              <button type="button"
                onClick={() => setShowHeadingMenu(v => !v)}
                className={`${btnStyle} gap-0.5`}
                title="Insert Heading">
                <Type size={12} />
                <span className="hidden sm:inline">Heading</span>
                <ChevronDown size={10} className={`transition-transform ${showHeadingMenu ? 'rotate-180' : ''}`} />
              </button>
              {showHeadingMenu && (
                <div className="absolute top-full left-0 mt-1 z-50 bg-card border border-border/60 rounded-xl shadow-xl overflow-hidden min-w-[140px] animate-in fade-in zoom-in-95 duration-150">
                  {[1, 2, 3, 4].map(level => (
                    <button key={level} type="button"
                      onClick={() => insertHeading(level)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-primary/10 hover:text-primary transition-colors">
                      <span className="font-mono text-[10px] text-muted-foreground w-6">H{level}</span>
                      <span className={`font-bold ${level === 1 ? 'text-base' : level === 2 ? 'text-sm' : level === 3 ? 'text-xs' : 'text-[11px]'}`}>
                        {'#'.repeat(level)} Heading {level}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bold / Italic / Underline */}
            <button type="button" onClick={() => insertMarkdown('**', '**')} className={btnStyle} title="Bold (select text then click)">
              <Bold size={12} /><span className="hidden sm:inline">Bold</span>
            </button>
            <button type="button" onClick={() => insertMarkdown('*', '*')} className={btnStyle} title="Italic">
              <Italic size={12} /><span className="hidden sm:inline">Italic</span>
            </button>
            <button type="button" onClick={insertUnderline} className={btnStyle} title="Underline (HTML <u> tag)">
              <Underline size={12} /><span className="hidden sm:inline">Underline</span>
            </button>

            <div className="w-px h-4 bg-border/40 mx-0.5 shrink-0" />

            {/* Lists */}
            <button type="button" onClick={() => insertMarkdown('- ')} className={btnStyle} title="Bullet List">
              <List size={12} /><span className="hidden sm:inline">List</span>
            </button>
            <button type="button" onClick={() => insertMarkdown('1. ')} className={btnStyle} title="Numbered List">
              <ListOrdered size={12} /><span className="hidden sm:inline">Ordered</span>
            </button>

            <div className="w-px h-4 bg-border/40 mx-0.5 shrink-0" />

            {/* Quote / Code / Table / HR */}
            <button type="button" onClick={() => insertMarkdown('> ')} className={btnStyle} title="Blockquote">
              <Quote size={12} /><span className="hidden sm:inline">Quote</span>
            </button>
            <button type="button" onClick={() => insertMarkdown('```\n', '\n```')} className={btnStyle} title="Code Block">
              <Code size={12} /><span className="hidden sm:inline">Code</span>
            </button>
            <button type="button"
              onClick={() => insertMarkdown('| Col 1 | Col 2 | Col 3 |\n|-------|-------|-------|\n| val 1 | val 2 | val 3 |\n')}
              className={btnStyle} title="Insert Table">
              <Table size={12} /><span className="hidden sm:inline">Table</span>
            </button>
            <button type="button" onClick={() => insertMarkdown('\n---\n')} className={btnStyle} title="Horizontal Rule">
              <Minus size={12} /><span className="hidden sm:inline">HR</span>
            </button>

            <div className="w-px h-4 bg-border/40 mx-0.5 shrink-0" />

            {/* Link (popup dialog) */}
            <div className="relative">
              <button type="button"
                onClick={() => {
                  const textarea = textareaRef.current;
                  if (textarea) {
                    const sel = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
                    if (sel) setLinkText(sel);
                  }
                  setShowLinkDialog(v => !v);
                }}
                className={btnStyle} title="Insert Link">
                <LinkIcon size={12} /><span className="hidden sm:inline">Link</span>
              </button>
              {showLinkDialog && (
                <div className="absolute top-full left-0 mt-1 z-50 bg-card border border-border/60 rounded-xl shadow-xl p-3 min-w-[260px] animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Insert Link</p>
                  <input
                    type="text"
                    placeholder="Link text"
                    value={linkText}
                    onChange={e => setLinkText(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-border/50 bg-background/60 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                    autoFocus
                  />
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={linkUrl}
                    onChange={e => setLinkUrl(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleInsertLink()}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-border/50 bg-background/60 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <div className="flex gap-2 justify-end mt-1">
                    <button type="button" onClick={() => setShowLinkDialog(false)} className="px-3 py-1 text-[10px] font-bold rounded border bg-muted hover:bg-muted/80 text-muted-foreground border-border/30 cursor-pointer">Cancel</button>
                    <button type="button" onClick={handleInsertLink} className="px-3 py-1 text-[10px] font-bold rounded bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer">Insert</button>
                  </div>
                </div>
              )}
            </div>

            {/* Image upload (file picker) */}
            <div className="relative inline-block">
              <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) handleUploadFile(f); }} className="hidden" id="notepad-embed-file" />
              <label htmlFor="notepad-embed-file"
                className={`${btnStyle} ${isUploading ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                title="Upload image and embed (also paste an image directly!)">
                <Upload size={12} className={isUploading ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">{isUploading ? 'Uploading…' : 'Image'}</span>
              </label>
            </div>
          </div>

          {/* Right: view toggles */}
          <div className="flex items-center gap-3 shrink-0">
            <label className="flex items-center gap-1.5 cursor-pointer text-[10px] uppercase font-bold text-muted-foreground select-none">
              <input type="checkbox" checked={wordWrap} onChange={e => setWordWrap(e.target.checked)}
                className="rounded border-border bg-slate-950 text-primary focus:ring-0 cursor-pointer w-3.5 h-3.5" />
              Wrap
            </label>
            <button type="button"
              onClick={() => { const v = !splitPreview; setSplitPreview(v); if (v) setPreviewOnly(false); }}
              className={`px-2.5 py-1 rounded border transition-all text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer ${splitPreview && !previewOnly ? 'bg-primary/20 text-primary border-primary/45' : 'bg-muted/30 border-border/40 text-muted-foreground hover:text-foreground'}`}
              title="Split Editor + Preview">
              <Eye size={12} /> Split
            </button>
            <button type="button"
              onClick={() => { const v = !previewOnly; setPreviewOnly(v); if (v) setSplitPreview(false); }}
              className={`px-2.5 py-1 rounded border transition-all text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer ${previewOnly ? 'bg-accent/20 text-accent border-accent/45' : 'bg-muted/30 border-border/40 text-muted-foreground hover:text-foreground'}`}
              title="Preview Only">
              <BookOpen size={12} /> Preview
            </button>
          </div>
        </div>

        {/* Upload error banner */}
        {uploadError && (
          <div className="px-4 py-2 text-xs bg-destructive/10 text-destructive border-b border-destructive/20 flex items-center justify-between">
            <span>⚠ {uploadError}</span>
            <button onClick={() => setUploadError(null)} className="text-destructive/70 hover:text-destructive"><X size={12} /></button>
          </div>
        )}

        {/* ── Editor + Preview Pane ──────────────────────────────────── */}
        <div className="flex-1 flex overflow-hidden min-h-0 bg-background/30">
          {/* Editor */}
          {!previewOnly && (
            <div className={`flex-1 h-full flex flex-col overflow-hidden ${splitPreview ? 'border-r border-border/40 md:w-1/2' : 'w-full'}`}>
              <textarea
                ref={textareaRef}
                value={localValue}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                className={`flex-1 w-full p-6 font-mono leading-relaxed focus:outline-none focus:ring-0 border-none resize-none caret-primary scrollbar-thin bg-transparent text-foreground placeholder-muted-foreground/50 ${wordWrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre overflow-x-auto'}`}
                placeholder={`Write ${formatLabel(fieldKey)} content here…\n\nTips:\n  # Heading 1   ## Heading 2   ### Heading 3\n  **bold**   *italic*   <u>underline</u>\n  - bullet   1. numbered list\n  [Link](https://url)   ![Alt](image-url)\n  > blockquote   \`\`\`code\`\`\`\n\nYou can also PASTE images directly from clipboard!`}
                style={{ fontSize: `${fontSize}px` }}
              />
            </div>
          )}

          {/* Preview */}
          {(splitPreview || previewOnly) && (
            <div className={`h-full flex flex-col overflow-y-auto p-6 scrollbar-thin bg-muted/10 ${previewOnly ? 'w-full' : 'hidden md:flex md:w-1/2'}`}>
              {localValue ? (
                <div className="notepad-preview">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ node, ...props }) => (
                        <h1 {...props} className="text-2xl font-extrabold text-foreground mt-6 mb-3 pb-2 border-b border-border/30 leading-tight" />
                      ),
                      h2: ({ node, ...props }) => (
                        <h2 {...props} className="text-xl font-bold text-foreground mt-5 mb-2.5 pb-1.5 border-b border-border/20 leading-tight" />
                      ),
                      h3: ({ node, ...props }) => (
                        <h3 {...props} className="text-lg font-bold text-foreground mt-4 mb-2 leading-tight" />
                      ),
                      h4: ({ node, ...props }) => (
                        <h4 {...props} className="text-base font-semibold text-foreground mt-3 mb-1.5 leading-tight" />
                      ),
                      p: ({ node, ...props }) => (
                        <p {...props} className="text-sm text-muted-foreground leading-7 mb-3" />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul {...props} className="list-disc list-inside space-y-1.5 mb-3 text-sm text-muted-foreground pl-4" />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol {...props} className="list-decimal list-inside space-y-1.5 mb-3 text-sm text-muted-foreground pl-4" />
                      ),
                      li: ({ node, ...props }) => (
                        <li {...props} className="leading-6" />
                      ),
                      strong: ({ node, ...props }) => (
                        <strong {...props} className="font-bold text-foreground" />
                      ),
                      em: ({ node, ...props }) => (
                        <em {...props} className="italic text-foreground/80" />
                      ),
                      code: ({ node, inline, ...props }: any) =>
                        inline
                          ? <code {...props} className="text-primary bg-primary/10 px-1.5 py-0.5 rounded-md text-[0.85em] font-mono" />
                          : <code {...props} className="block font-mono" />,
                      pre: ({ node, ...props }) => (
                        <pre {...props} className="bg-muted/50 border border-border/40 rounded-xl p-4 overflow-x-auto text-xs font-mono mb-4 text-foreground/80" />
                      ),
                      blockquote: ({ node, ...props }) => (
                        <blockquote {...props} className="border-l-4 border-primary bg-primary/5 py-2 px-4 rounded-r-xl my-4 not-italic font-medium text-foreground/90 shadow-sm" />
                      ),
                      hr: ({ node, ...props }) => (
                        <hr {...props} className="border-border/40 my-6" />
                      ),
                      img: ({ node, ...props }) => (
                        <span className="my-6 flex flex-col items-center gap-1.5 group/img">
                          <img {...props} className="rounded-xl border border-border/40 max-h-[300px] w-auto max-w-full object-contain shadow-xl hover:border-primary/30 hover:scale-[1.01] transition-all duration-300" loading="lazy" />
                          {props.alt && <span className="text-[10px] text-muted-foreground/60 italic select-none">{props.alt}</span>}
                        </span>
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
                        <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline underline-offset-2 inline-flex items-center gap-0.5" />
                      ),
                    }}
                  >
                    {localValue}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-muted-foreground/50 italic text-sm">Markdown preview will render here as you type…</p>
              )}
            </div>
          )}
        </div>

        {/* ── Status Bar ──────────────────────────────────────────────── */}
        <div className="px-4 py-1.5 flex items-center justify-between text-[10px] font-mono select-none shrink-0 border-t bg-muted/50 text-muted-foreground border-border/40">
          <div className="flex items-center gap-3">
            <span>Lines: {localValue.split('\n').length}</span>
            <span>Words: {localValue.trim() ? localValue.trim().split(/\s+/).length : 0}</span>
            <span>Chars: {localValue.length}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-primary/60">Paste images directly into editor ✓</span>
            <span>UTF-8 | Markdown | {fontSize}px</span>
          </div>
        </div>

        {/* ── Footer Actions ───────────────────────────────────────────── */}
        <div className="px-4 py-3 flex items-center justify-between gap-3 shrink-0 border-t bg-card border-border/40">
          <div className="flex items-center gap-2 select-none">
            <button type="button" onClick={() => setFontSize(prev => Math.max(10, prev - 1))}
              className="p-1 rounded border text-[10px] font-bold font-mono w-6 h-6 flex items-center justify-center cursor-pointer transition-colors bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border-border/30" title="Decrease font size">
              A-
            </button>
            <span className="text-[10px] text-muted-foreground font-mono">{fontSize}px</span>
            <button type="button" onClick={() => setFontSize(prev => Math.min(24, prev + 1))}
              className="p-1 rounded border text-[10px] font-bold font-mono w-6 h-6 flex items-center justify-center cursor-pointer transition-colors bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border-border/30" title="Increase font size">
              A+
            </button>
          </div>
          <div className="flex gap-2">
            <button type="button"
              onClick={() => { setLocalValue(data || ''); setIsNotepadOpen(false); toast.info('Changes discarded.'); }}
              className="px-4 py-2 text-xs font-semibold rounded-lg transition-colors border cursor-pointer bg-muted hover:bg-muted/80 text-muted-foreground border-border/30">
              Cancel
            </button>
            <button type="button"
              onClick={() => { onChange(localValue); localStorage.removeItem(draftKey); setIsNotepadOpen(false); toast.success('Markdown applied successfully!'); }}
              className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold rounded-lg transition-colors shadow-lg flex items-center gap-1.5 cursor-pointer">
              <Save size={13} /> Save &amp; Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
