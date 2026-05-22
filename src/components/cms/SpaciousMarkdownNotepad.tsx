import React from 'react';
import {
  FileText, Minimize2, Maximize2, X, Undo2, Redo2,
  Bold, Italic, Quote, Code, Table,
  Link as LinkIcon, Eye, BookOpen, Save, Upload,
  Underline, List, ListOrdered, Minus, ChevronDown,
  Strikethrough, Highlighter, Search, Hash, AlignLeft,
  CheckSquare, Subscript, Superscript as SuperscriptIcon, Copy, Clipboard
} from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { formatLabel, convertToRawGitHubUrl } from './FormHelpers';
import { useCloudinary } from '../../hooks/useCloudinary';

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

// ─── Keyboard Shortcuts ──────────────────────────────────────────────────────
const SHORTCUTS: { keys: string; desc: string }[] = [
  { keys: 'Ctrl+Z', desc: 'Undo' },
  { keys: 'Ctrl+Y', desc: 'Redo' },
  { keys: 'Ctrl+B', desc: 'Bold' },
  { keys: 'Ctrl+I', desc: 'Italic' },
  { keys: 'Ctrl+U', desc: 'Underline' },
  { keys: 'Ctrl+K', desc: 'Insert Link' },
  { keys: 'Ctrl+F', desc: 'Find & Replace' },
  { keys: 'Ctrl+D', desc: 'Duplicate Line' },
  { keys: 'Tab', desc: 'Indent 2 spaces' },
  { keys: 'Enter', desc: 'Continue list' },
];

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
  // ── View state ───────────────────────────────────────────────────────────────
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [wordWrap, setWordWrap] = React.useState(true);
  const [splitPreview, setSplitPreview] = React.useState(true);
  const [previewOnly, setPreviewOnly] = React.useState(false);
  const [fontSize, setFontSize] = React.useState(13);

  // ── Dropdown / Dialog state ─────────────────────────────────────────────────
  const [showHeadingMenu, setShowHeadingMenu] = React.useState(false);
  const [showLinkDialog, setShowLinkDialog] = React.useState(false);
  const [showFindReplace, setShowFindReplace] = React.useState(false);
  const [showShortcuts, setShowShortcuts] = React.useState(false);
  const [linkText, setLinkText] = React.useState('');
  const [linkUrl, setLinkUrl] = React.useState('');
  const [findQuery, setFindQuery] = React.useState('');
  const [replaceQuery, setReplaceQuery] = React.useState('');
  const [findMatchCase, setFindMatchCase] = React.useState(false);
  const [findCount, setFindCount] = React.useState(0);
  const [wordGoal, setWordGoal] = React.useState(0);

  // ── History ──────────────────────────────────────────────────────────────────
  const [history, setHistory] = React.useState<string[]>([data || '']);
  const [historyIndex, setHistoryIndex] = React.useState(0);

  // ── Refs ─────────────────────────────────────────────────────────────────────
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const lastPushedValue = React.useRef(data || '');
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const headingMenuRef = React.useRef<HTMLDivElement>(null);
  const linkDialogRef = React.useRef<HTMLDivElement>(null);

  // ── Upload state ─────────────────────────────────────────────────────────────
  const { uploadMedia, isUploading, progress } = useCloudinary();
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  // ─── History helpers ─────────────────────────────────────────────────────────
  const pushHistory = React.useCallback((val: string) => {
    if (val === lastPushedValue.current) return;
    setHistory(prev => {
      const trimmed = prev.slice(0, historyIndex + 1);
      const next = [...trimmed, val];
      if (next.length > 100) next.shift();
      return next;
    });
    setHistoryIndex(i => Math.min(i + 1, 99));
    lastPushedValue.current = val;
  }, [historyIndex]);

  const handleUndo = React.useCallback(() => {
    if (historyIndex > 0) {
      const ni = historyIndex - 1;
      setHistoryIndex(ni);
      const v = history[ni];
      setLocalValue(v);
      lastPushedValue.current = v;
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  }, [history, historyIndex, setLocalValue]);

  const handleRedo = React.useCallback(() => {
    if (historyIndex < history.length - 1) {
      const ni = historyIndex + 1;
      setHistoryIndex(ni);
      const v = history[ni];
      setLocalValue(v);
      lastPushedValue.current = v;
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  }, [history, historyIndex, setLocalValue]);

  // ─── Insert helpers ──────────────────────────────────────────────────────────
  const insertMarkdown = React.useCallback((before: string, after: string = '', newline: boolean = false) => {
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
    setLocalValue(nv);
    pushHistory(nv);
    setTimeout(() => {
      ta.focus();
      const ns = s + (newline ? before.length + 1 : before.length);
      ta.setSelectionRange(ns, ns + sel.length);
    }, 0);
  }, [pushHistory, setLocalValue]);

  // Insert heading at start of line
  const insertHeading = React.useCallback((level: number) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const prefix = '#'.repeat(level) + ' ';
    const { selectionStart: s, value } = ta;
    const ls = value.lastIndexOf('\n', s - 1) + 1;
    const le = value.indexOf('\n', s);
    const line = value.substring(ls, le === -1 ? value.length : le);
    const clean = line.replace(/^#{1,6}\s/, '');
    const nLine = prefix + clean;
    const nv = value.substring(0, ls) + nLine + (le === -1 ? '' : value.substring(le));
    setLocalValue(nv);
    pushHistory(nv);
    setShowHeadingMenu(false);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(ls + nLine.length, ls + nLine.length); }, 0);
  }, [pushHistory, setLocalValue]);

  // Insert link from dialog
  const handleInsertLink = React.useCallback(() => {
    const t = linkText.trim() || 'Link Text';
    const u = linkUrl.trim() || 'https://';
    insertMarkdown(`[${t}](${u})`);
    setLinkText(''); setLinkUrl(''); setShowLinkDialog(false);
  }, [linkText, linkUrl, insertMarkdown]);

  // Find & Replace
  const handleFindReplace = React.useCallback(() => {
    if (!findQuery) return;
    const flags = findMatchCase ? 'g' : 'gi';
    const re = new RegExp(findQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
    const matches = localValue.match(re);
    setFindCount(matches?.length ?? 0);
    if (replaceQuery !== undefined && matches) {
      const nv = localValue.replace(re, replaceQuery);
      setLocalValue(nv);
      pushHistory(nv);
      toast.success(`Replaced ${matches.length} occurrence(s)`);
    }
  }, [findQuery, replaceQuery, findMatchCase, localValue, pushHistory, setLocalValue]);

  // Count find matches live
  React.useEffect(() => {
    if (!findQuery) { setFindCount(0); return; }
    try {
      const flags = findMatchCase ? 'g' : 'gi';
      const re = new RegExp(findQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
      setFindCount(localValue.match(re)?.length ?? 0);
    } catch { setFindCount(0); }
  }, [findQuery, findMatchCase, localValue]);

  // ─── Keyboard Handler ────────────────────────────────────────────────────────
  const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const ctrl = e.ctrlKey || e.metaKey;

    if (ctrl && e.key === 'z') { e.preventDefault(); handleUndo(); return; }
    if (ctrl && e.key === 'y') { e.preventDefault(); handleRedo(); return; }
    if (ctrl && e.key === 'b') { e.preventDefault(); insertMarkdown('**', '**'); return; }
    if (ctrl && e.key === 'i') { e.preventDefault(); insertMarkdown('*', '*'); return; }
    if (ctrl && e.key === 'u') { e.preventDefault(); insertMarkdown('<u>', '</u>'); return; }
    if (ctrl && e.key === 'k') { e.preventDefault(); setShowLinkDialog(v => !v); return; }
    if (ctrl && e.key === 'f') { e.preventDefault(); setShowFindReplace(v => !v); return; }

    // Ctrl+D: duplicate line
    if (ctrl && e.key === 'd') {
      e.preventDefault();
      const ta = textareaRef.current;
      if (!ta) return;
      const { selectionStart: s, value } = ta;
      const ls = value.lastIndexOf('\n', s - 1) + 1;
      const le = value.indexOf('\n', s);
      const line = value.substring(ls, le === -1 ? value.length : le);
      const nv = value.substring(0, le === -1 ? value.length : le) + '\n' + line + (le === -1 ? '' : value.substring(le));
      setLocalValue(nv);
      pushHistory(nv);
      return;
    }

    // Tab → indent
    if (e.key === 'Tab') {
      e.preventDefault();
      insertMarkdown('  ');
      return;
    }

    // Enter → continue list
    if (e.key === 'Enter') {
      const ta = textareaRef.current;
      if (!ta) return;
      const { selectionStart: s, value } = ta;
      const ls = value.lastIndexOf('\n', s - 1) + 1;
      const line = value.substring(ls, s);
      const ulM = line.match(/^(\s*)([-*+] (?:\[[ x]\] )?)/);
      const olM = line.match(/^(\s*)(\d+)\. /);
      if (ulM) {
        e.preventDefault();
        const [, indent, bullet] = ulM;
        if (line.trim() === bullet.trim()) {
          const nv = value.substring(0, ls) + '\n' + value.substring(s);
          setLocalValue(nv);
          setTimeout(() => ta.setSelectionRange(ls + 1, ls + 1), 0);
        } else {
          insertMarkdown(`\n${indent}${bullet}`);
        }
        return;
      }
      if (olM) {
        e.preventDefault();
        const [, indent, num] = olM;
        insertMarkdown(`\n${indent}${parseInt(num) + 1}. `);
        return;
      }
    }
  }, [handleUndo, handleRedo, insertMarkdown, pushHistory, setLocalValue]);

  // ─── Text area change ────────────────────────────────────────────────────────
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLocalValue(val);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => pushHistory(val), 600);
  };

  // ─── Paste handler (images) ──────────────────────────────────────────────────
  const handlePaste = React.useCallback(async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    for (const item of Array.from(e.clipboardData.items)) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) { toast.info('Uploading pasted image…'); await handleUploadFile(file); }
        return;
      }
    }
  }, []);

  // ─── Drag-over image drop ─────────────────────────────────────────────────────
  const handleDrop = React.useCallback(async (e: React.DragEvent<HTMLTextAreaElement>) => {
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith('image/')) {
      e.preventDefault();
      toast.info('Uploading dropped image…');
      await handleUploadFile(file);
    }
  }, []);

  // ─── Upload ──────────────────────────────────────────────────────────────────
  const handleUploadFile = async (file: File) => {
    setUploadError(null);
    try {
      const result = await uploadMedia(file);
      insertMarkdown(`![${file.name.replace(/\.[^.]+$/, '')}](${result.secureUrl})`);
      toast.success('Image securely uploaded to Cloudinary.');
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
      toast.error(err.message || 'Upload failed');
    }
  };

  // ─── Close menus on outside click ───────────────────────────────────────────
  React.useEffect(() => {
    const h = (e: MouseEvent) => {
      if (headingMenuRef.current && !headingMenuRef.current.contains(e.target as Node)) setShowHeadingMenu(false);
      if (linkDialogRef.current && !linkDialogRef.current.contains(e.target as Node)) setShowLinkDialog(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // ─── Unsaved changes warning ─────────────────────────────────────────────────
  React.useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (isNotepadOpen && localValue !== (data || '')) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [isNotepadOpen, localValue, data]);

  // ─── Reset history on open ──────────────────────────────────────────────────
  React.useEffect(() => {
    if (isNotepadOpen) {
      const v = data || '';
      setHistory([v]); setHistoryIndex(0); lastPushedValue.current = v;
    }
  }, [isNotepadOpen, data]);

  React.useEffect(() => () => { if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current); }, []);

  if (!isNotepadOpen) return null;

  // ─── Derived stats ───────────────────────────────────────────────────────────
  const lineCount = localValue.split('\n').length;
  const wordCount = localValue.trim() ? localValue.trim().split(/\s+/).length : 0;
  const charCount = localValue.length;
  const goalPct = wordGoal > 0 ? Math.min(100, Math.round((wordCount / wordGoal) * 100)) : 0;

  // ─── Reusable toolbar button style ──────────────────────────────────────────
  const btn = `flex items-center gap-1 px-2 py-1 rounded border text-[11px] font-medium cursor-pointer transition-all
    bg-muted/40 border-border/30 text-foreground hover:bg-primary/15 hover:text-primary hover:border-primary/40 select-none shrink-0`;

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-md animate-in fade-in duration-200 bg-background/80 ${isFullscreen ? 'p-0' : 'p-4 md:p-8'}`}>
      <div className={`w-full h-full border flex flex-col overflow-hidden transition-all duration-200 bg-card shadow-2xl border-border/70 ${isFullscreen ? 'max-w-none rounded-none border-none' : 'max-w-6xl rounded-2xl animate-in zoom-in-95 duration-200'}`}>

        {/* ── Title bar ─────────────────────────────────────────────────── */}
        <div className="px-4 py-2 flex items-center justify-between shrink-0 border-b bg-muted/70 border-border/40 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <FileText size={15} className="text-primary shrink-0" />
            <span className="text-[11px] font-mono font-bold truncate text-foreground/90">
              notepad.exe — <span className="text-primary">{formatLabel(fieldKey)}</span>
              <span className="text-muted-foreground/60 font-normal ml-1">(Markdown + HTML)</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Shortcuts toggle */}
            <button type="button" onClick={() => setShowShortcuts(v => !v)}
              className={`px-2 py-1 rounded text-[10px] font-bold border transition-all cursor-pointer ${showShortcuts ? 'bg-primary/20 text-primary border-primary/40' : 'bg-muted/30 border-border/30 text-muted-foreground hover:text-foreground'}`}
              title="Keyboard shortcuts">⌨ Shortcuts</button>
            <button type="button" onClick={() => setIsFullscreen(v => !v)}
              className="p-1.5 rounded transition-colors cursor-pointer hover:bg-muted text-muted-foreground hover:text-foreground border border-transparent hover:border-border/30"
              title={isFullscreen ? 'Restore' : 'Fullscreen'}>
              {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
            <button type="button"
              onClick={() => { setLocalValue(data || ''); setIsNotepadOpen(false); toast.info('Changes discarded.'); }}
              className="p-1.5 rounded transition-colors cursor-pointer hover:bg-destructive/20 text-muted-foreground hover:text-destructive border border-transparent hover:border-destructive/30">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* ── Keyboard shortcuts panel ──────────────────────────────────── */}
        {showShortcuts && (
          <div className="px-4 py-2.5 border-b bg-muted/30 border-border/30 animate-in slide-in-from-top duration-150">
            <div className="flex flex-wrap gap-x-5 gap-y-1">
              {SHORTCUTS.map(s => (
                <div key={s.keys} className="flex items-center gap-1.5 text-[10px]">
                  <kbd className="px-1.5 py-0.5 rounded bg-background border border-border/50 font-mono text-foreground/80 shadow-sm">{s.keys}</kbd>
                  <span className="text-muted-foreground">{s.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Draft banner ──────────────────────────────────────────────── */}
        {hasDraft && (
          <div className="px-4 py-2 flex items-center justify-between text-[11px] shrink-0 border-b bg-amber-500/10 border-amber-500/30 animate-in slide-in-from-top duration-200">
            <div className="flex items-center gap-2 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <span><strong>Unsaved Draft Found</strong> — recovered from previous session.</span>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => { const d = localStorage.getItem(draftKey); if (d) { setLocalValue(d); pushHistory(d); toast.success('Draft restored!'); } setHasDraft(false); }}
                className="px-2.5 py-1 bg-amber-500 text-black hover:bg-amber-400 text-[10px] font-bold rounded cursor-pointer transition-colors">Restore</button>
              <button type="button" onClick={() => { localStorage.removeItem(draftKey); setHasDraft(false); toast.info('Draft discarded.'); }}
                className="px-2.5 py-1 text-[10px] font-bold rounded border bg-muted hover:bg-destructive/20 hover:text-destructive border-border/30 cursor-pointer transition-colors">Discard</button>
            </div>
          </div>
        )}

        {/* ── Find & Replace bar ────────────────────────────────────────── */}
        {showFindReplace && (
          <div className="px-4 py-2 border-b bg-background/60 border-border/30 flex flex-wrap items-center gap-2 shrink-0 animate-in slide-in-from-top duration-150">
            <Search size={13} className="text-muted-foreground shrink-0" />
            <input type="text" placeholder="Find…" value={findQuery} onChange={e => setFindQuery(e.target.value)}
              className="px-2 py-1 text-xs rounded-lg border border-border/40 bg-background focus:outline-none focus:ring-1 focus:ring-primary/40 w-36" />
            <input type="text" placeholder="Replace with…" value={replaceQuery} onChange={e => setReplaceQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleFindReplace()}
              className="px-2 py-1 text-xs rounded-lg border border-border/40 bg-background focus:outline-none focus:ring-1 focus:ring-primary/40 w-36" />
            <label className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground cursor-pointer select-none">
              <input type="checkbox" checked={findMatchCase} onChange={e => setFindMatchCase(e.target.checked)} className="w-3 h-3" />
              Case
            </label>
            <span className="text-[10px] text-muted-foreground">{findCount} match{findCount !== 1 ? 'es' : ''}</span>
            <button type="button" onClick={handleFindReplace}
              className="px-3 py-1 text-[10px] font-bold rounded bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer transition-colors">Replace All</button>
            <button type="button" onClick={() => setShowFindReplace(false)}
              className="ml-auto p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"><X size={12} /></button>
          </div>
        )}

        {/* ── Toolbar ──────────────────────────────────────────────────── */}
        <div className="px-3 py-1.5 flex flex-wrap items-center justify-between gap-1 shrink-0 border-b bg-card/80 border-border/30">
          {/* Left: format buttons */}
          <div className="flex items-center gap-0.5 flex-wrap">

            {/* Undo/Redo */}
            <button type="button" onClick={handleUndo} disabled={historyIndex <= 0}
              className={`${btn} ${historyIndex <= 0 ? 'opacity-30 cursor-not-allowed' : ''}`} title="Undo (Ctrl+Z)">
              <Undo2 size={12} />
            </button>
            <button type="button" onClick={handleRedo} disabled={historyIndex >= history.length - 1}
              className={`${btn} ${historyIndex >= history.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`} title="Redo (Ctrl+Y)">
              <Redo2 size={12} />
            </button>

            <div className="w-px h-4 bg-border/40 mx-1 shrink-0" />

            {/* Heading dropdown */}
            <div className="relative" ref={headingMenuRef}>
              <button type="button" onClick={() => setShowHeadingMenu(v => !v)}
                className={`${btn} ${showHeadingMenu ? 'bg-primary/20 text-primary border-primary/40' : ''}`} title="Headings">
                <Hash size={12} />
                <span className="hidden sm:inline">H</span>
                <ChevronDown size={9} className={`transition-transform ${showHeadingMenu ? 'rotate-180' : ''}`} />
              </button>
              {showHeadingMenu && (
                <div className="absolute top-full left-0 mt-1 z-[100] bg-card border border-border/60 rounded-xl shadow-2xl overflow-hidden min-w-[180px] animate-in fade-in zoom-in-95 duration-100">
                  {[1, 2, 3, 4, 5, 6].map(lv => (
                    <button key={lv} type="button" onClick={() => insertHeading(lv)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-primary/10 hover:text-primary transition-colors text-left border-b border-border/10 last:border-0">
                      <code className="text-[9px] text-muted-foreground/70 w-8 shrink-0">{'#'.repeat(lv)}</code>
                      <span className={`font-bold ${lv === 1 ? 'text-lg' : lv === 2 ? 'text-base' : lv === 3 ? 'text-sm' : 'text-xs'} leading-tight`}>
                        Heading {lv}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Inline formats */}
            <button type="button" onClick={() => insertMarkdown('**', '**')} className={btn} title="Bold (Ctrl+B)">
              <Bold size={12} /><span className="hidden sm:inline">Bold</span>
            </button>
            <button type="button" onClick={() => insertMarkdown('*', '*')} className={btn} title="Italic (Ctrl+I)">
              <Italic size={12} /><span className="hidden sm:inline">Italic</span>
            </button>
            {/* ✅ FIX: Underline — uses <u> tag rendered via rehype-raw */}
            <button type="button" onClick={() => insertMarkdown('<u>', '</u>')} className={btn} title="Underline (Ctrl+U)">
              <Underline size={12} /><span className="hidden sm:inline">Underline</span>
            </button>
            <button type="button" onClick={() => insertMarkdown('~~', '~~')} className={btn} title="Strikethrough">
              <Strikethrough size={12} /><span className="hidden sm:inline">Strike</span>
            </button>
            <button type="button" onClick={() => insertMarkdown('<mark>', '</mark>')} className={btn} title="Highlight">
              <Highlighter size={12} /><span className="hidden sm:inline">Highlight</span>
            </button>
            <button type="button" onClick={() => insertMarkdown('<sup>', '</sup>')} className={btn} title="Superscript">
              <SuperscriptIcon size={12} /><span className="hidden sm:inline">Sup</span>
            </button>
            <button type="button" onClick={() => insertMarkdown('<sub>', '</sub>')} className={btn} title="Subscript">
              <Subscript size={12} /><span className="hidden sm:inline">Sub</span>
            </button>

            <div className="w-px h-4 bg-border/40 mx-1 shrink-0" />

            {/* Lists */}
            <button type="button" onClick={() => insertMarkdown('- ')} className={btn} title="Bullet list">
              <List size={12} /><span className="hidden sm:inline">List</span>
            </button>
            <button type="button" onClick={() => insertMarkdown('1. ')} className={btn} title="Numbered list">
              <ListOrdered size={12} /><span className="hidden sm:inline">Ordered</span>
            </button>
            <button type="button" onClick={() => insertMarkdown('- [ ] ')} className={btn} title="Task checklist">
              <CheckSquare size={12} /><span className="hidden sm:inline">Task</span>
            </button>

            <div className="w-px h-4 bg-border/40 mx-1 shrink-0" />

            {/* Block-level */}
            <button type="button" onClick={() => insertMarkdown('> ')} className={btn} title="Blockquote">
              <Quote size={12} /><span className="hidden sm:inline">Quote</span>
            </button>
            <button type="button" onClick={() => insertMarkdown('`', '`')} className={btn} title="Inline code">
              <Code size={12} /><span className="hidden sm:inline">Code</span>
            </button>
            <button type="button" onClick={() => insertMarkdown('```\n', '\n```')} className={btn} title="Code block">
              <Code size={12} /><span className="hidden sm:inline">Block</span>
            </button>
            <button type="button" onClick={() => insertMarkdown('\n---\n')} className={btn} title="Horizontal rule">
              <Minus size={12} /><span className="hidden sm:inline">HR</span>
            </button>
            <button type="button"
              onClick={() => insertMarkdown('| Col 1 | Col 2 | Col 3 |\n|-------|-------|-------|\n| val 1 | val 2 | val 3 |\n')}
              className={btn} title="Table">
              <Table size={12} /><span className="hidden sm:inline">Table</span>
            </button>

            <div className="w-px h-4 bg-border/40 mx-1 shrink-0" />

            {/* Link dialog */}
            <div className="relative" ref={linkDialogRef}>
              <button type="button" onClick={() => { const ta = textareaRef.current; if (ta) { const sel = ta.value.substring(ta.selectionStart, ta.selectionEnd); if (sel) setLinkText(sel); } setShowLinkDialog(v => !v); }}
                className={`${btn} ${showLinkDialog ? 'bg-primary/20 text-primary border-primary/40' : ''}`} title="Insert link (Ctrl+K)">
                <LinkIcon size={12} /><span className="hidden sm:inline">Link</span>
              </button>
              {showLinkDialog && (
                <div className="absolute top-full left-0 mt-1 z-[100] bg-card border border-border/60 rounded-xl shadow-2xl p-3 min-w-[240px] flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-100">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Insert Link</p>
                  <input type="text" placeholder="Display text" value={linkText} onChange={e => setLinkText(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-border/40 bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary/30" autoFocus />
                  <input type="url" placeholder="https://example.com" value={linkUrl} onChange={e => setLinkUrl(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleInsertLink()}
                    className="px-2.5 py-1.5 rounded-lg border border-border/40 bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary/30" />
                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => setShowLinkDialog(false)} className="px-3 py-1 text-[10px] font-bold rounded border bg-muted border-border/30 cursor-pointer text-muted-foreground">Cancel</button>
                    <button type="button" onClick={handleInsertLink} className="px-3 py-1 text-[10px] font-bold rounded bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer">Insert</button>
                  </div>
                </div>
              )}
            </div>

            {/* Find & Replace toggle */}
            <button type="button" onClick={() => setShowFindReplace(v => !v)}
              className={`${btn} ${showFindReplace ? 'bg-primary/20 text-primary border-primary/40' : ''}`} title="Find & Replace (Ctrl+F)">
              <Search size={12} /><span className="hidden sm:inline">Find</span>
            </button>

            {/* Image upload */}
            <div className="relative inline-block">
              <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) handleUploadFile(f); }} className="hidden" id="notepad-embed-file" />
              <label htmlFor="notepad-embed-file"
                className={`${btn} ${isUploading ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                title="Upload image (or paste/drag into editor)">
                <Upload size={12} className={isUploading ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">{isUploading ? `Uploading... ${progress}%` : 'Image'}</span>
              </label>
            </div>

            {/* Copy all */}
            <button type="button" onClick={() => { navigator.clipboard.writeText(localValue); toast.success('Copied to clipboard!'); }}
              className={btn} title="Copy all">
              <Copy size={12} /><span className="hidden sm:inline">Copy</span>
            </button>
          </div>

          {/* Right: view controls */}
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <label className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground cursor-pointer select-none">
              <input type="checkbox" checked={wordWrap} onChange={e => setWordWrap(e.target.checked)} className="w-3 h-3 rounded" />
              Wrap
            </label>
            <button type="button" onClick={() => { setSplitPreview(v => !v); if (!splitPreview) setPreviewOnly(false); }}
              className={`px-2 py-1 rounded border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all ${splitPreview && !previewOnly ? 'bg-primary/20 text-primary border-primary/40' : 'bg-muted/30 border-border/30 text-muted-foreground hover:text-foreground'}`}>
              <Eye size={11} /> Split
            </button>
            <button type="button" onClick={() => { setPreviewOnly(v => !v); if (!previewOnly) setSplitPreview(false); }}
              className={`px-2 py-1 rounded border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all ${previewOnly ? 'bg-accent/20 text-accent border-accent/40' : 'bg-muted/30 border-border/30 text-muted-foreground hover:text-foreground'}`}>
              <BookOpen size={11} /> Preview
            </button>
          </div>
        </div>

        {/* ── Upload error ──────────────────────────────────────────────── */}
        {uploadError && (
          <div className="px-4 py-1.5 text-xs bg-destructive/10 text-destructive border-b border-destructive/20 flex items-center justify-between">
            <span>⚠ {uploadError}</span>
            <button onClick={() => setUploadError(null)} className="hover:text-destructive/70 ml-2"><X size={11} /></button>
          </div>
        )}

        {/* ── Main content area ─────────────────────────────────────────── */}
        <div className="flex-1 flex overflow-hidden min-h-0">

          {/* Editor pane */}
          {!previewOnly && (
            <div className={`h-full flex flex-col overflow-hidden ${splitPreview ? 'border-r border-border/30 md:w-1/2' : 'w-full'}`}>
              <textarea
                ref={textareaRef}
                value={localValue}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                onDragOver={e => e.preventDefault()}
                onDrop={handleDrop}
                spellCheck
                className={`flex-1 w-full p-5 font-mono leading-7 focus:outline-none border-none resize-none caret-primary bg-transparent text-foreground placeholder-muted-foreground/40 scrollbar-thin ${wordWrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre overflow-x-auto'}`}
                placeholder={`# Heading 1\n## Heading 2\n\n**Bold**  *Italic*  <u>Underline</u>  ~~Strike~~  <mark>Highlight</mark>\n\n- Bullet list\n1. Numbered list\n- [ ] Task item\n\n> Blockquote\n\`\`\`code block\`\`\`\n\n[Link](https://url)  ![Image](url)\n\nPaste or drag images directly!`}
                style={{ fontSize: `${fontSize}px` }}
              />
            </div>
          )}

          {/* Preview pane */}
          {(splitPreview || previewOnly) && (
            <div className={`h-full overflow-y-auto p-6 bg-muted/5 scrollbar-thin ${previewOnly ? 'w-full' : 'hidden md:block md:w-1/2'}`}>
              {localValue.trim() ? (
                <div className="notepad-preview-content space-y-0">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      h1: ({ node, ...p }) => <h1 {...p} className="text-2xl font-extrabold text-foreground mt-0 mb-4 pb-2 border-b-2 border-primary/30 leading-tight tracking-tight" />,
                      h2: ({ node, ...p }) => <h2 {...p} className="text-xl font-bold text-foreground mt-6 mb-3 pb-1.5 border-b border-border/40 leading-tight" />,
                      h3: ({ node, ...p }) => <h3 {...p} className="text-lg font-bold text-foreground mt-5 mb-2 leading-tight" />,
                      h4: ({ node, ...p }) => <h4 {...p} className="text-base font-semibold text-foreground/90 mt-4 mb-1.5" />,
                      h5: ({ node, ...p }) => <h5 {...p} className="text-sm font-semibold text-foreground/80 mt-3 mb-1" />,
                      h6: ({ node, ...p }) => <h6 {...p} className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-3 mb-1" />,
                      p: ({ node, ...p }) => <p {...p} className="text-sm text-foreground/80 leading-7 mb-3" />,
                      ul: ({ node, ...p }) => <ul {...p} className="list-disc pl-5 space-y-1 mb-3 text-sm text-foreground/80" />,
                      ol: ({ node, ...p }) => <ol {...p} className="list-decimal pl-5 space-y-1 mb-3 text-sm text-foreground/80" />,
                      li: ({ node, ...p }) => <li {...p} className="leading-6 marker:text-primary/60" />,
                      strong: ({ node, ...p }) => <strong {...p} className="font-bold text-foreground" />,
                      em: ({ node, ...p }) => <em {...p} className="italic text-foreground/80" />,
                      del: ({ node, ...p }) => <del {...p} className="line-through text-muted-foreground/60" />,
                      // ✅ HTML tags rendered via rehype-raw — underline, mark, sup, sub all work
                      code: ({ node, inline, ...p }: any) =>
                        inline
                          ? <code {...p} className="text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded text-[0.82em] font-mono" />
                          : <code {...p} className="block font-mono text-sm" />,
                      pre: ({ node, ...p }) => <pre {...p} className="bg-muted/60 border border-border/40 rounded-xl p-4 overflow-x-auto text-xs font-mono mb-4 text-foreground/80" />,
                      blockquote: ({ node, ...p }) => <blockquote {...p} className="border-l-4 border-primary/60 bg-primary/5 px-4 py-2 rounded-r-xl my-4 text-sm text-foreground/80 not-italic" />,
                      hr: ({ node, ...p }) => <hr {...p} className="border-border/40 my-6" />,
                      a: ({ node, ...p }) => <a {...p} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80 font-medium transition-colors" />,
                      img: ({ node, ...p }) => {
                        let src = p.src;
                        if (src) {
                          src = convertToRawGitHubUrl(src);
                        }
                        return (
                          <span className="flex flex-col items-center gap-1 my-4">
                            <img {...p} src={src} className="rounded-xl border border-border/40 max-h-64 max-w-full object-contain shadow-lg hover:scale-[1.02] transition-transform duration-200" loading="lazy" />
                            {p.alt && <span className="text-[10px] text-muted-foreground/60 italic">{p.alt}</span>}
                          </span>
                        );
                      },
                      table: ({ node, ...p }) => (
                        <div className="overflow-x-auto my-4 border border-border/40 rounded-xl shadow-sm bg-card/30">
                          <table {...p} className="min-w-full text-xs divide-y divide-border/30" />
                        </div>
                      ),
                      th: ({ node, ...p }) => <th {...p} className="px-3 py-2 bg-muted/50 font-bold text-foreground text-left border-r border-border/20 last:border-0" />,
                      td: ({ node, ...p }) => <td {...p} className="px-3 py-2 text-muted-foreground border-r border-border/10 last:border-0" />,
                      input: ({ node, ...p }: any) => (
                        <input {...p} className="mr-1.5 accent-primary" readOnly />
                      ),
                    }}
                  >
                    {localValue}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground/40 text-sm gap-2">
                  <AlignLeft size={32} className="opacity-30" />
                  <p>Preview renders here as you type…</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Status / word goal bar ────────────────────────────────────── */}
        <div className="px-4 py-1.5 flex items-center justify-between text-[10px] font-mono select-none shrink-0 border-t bg-muted/40 text-muted-foreground border-border/30 gap-3 flex-wrap">
          <div className="flex items-center gap-4">
            <span>Lines: <strong className="text-foreground/70">{lineCount}</strong></span>
            <span>Words: <strong className="text-foreground/70">{wordCount}</strong></span>
            <span>Chars: <strong className="text-foreground/70">{charCount}</strong></span>
          </div>

          {/* Word goal */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground/60">Goal:</span>
            <input type="number" min="0" value={wordGoal || ''} onChange={e => setWordGoal(Number(e.target.value))}
              placeholder="0" className="w-14 px-1.5 py-0.5 text-[10px] rounded border border-border/30 bg-background/50 focus:outline-none focus:border-primary/40 text-center" />
            {wordGoal > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="w-16 h-1.5 rounded-full bg-muted/60 overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${goalPct}%` }} />
                </div>
                <span className={goalPct >= 100 ? 'text-green-400 font-bold' : 'text-muted-foreground'}>{goalPct}%</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-primary/50">Paste/drag images ✓</span>
            <span>UTF-8 · Markdown · {fontSize}px</span>
          </div>
        </div>

        {/* ── Footer actions ────────────────────────────────────────────── */}
        <div className="px-4 py-2.5 flex items-center justify-between gap-3 shrink-0 border-t bg-card border-border/30">
          {/* Font size */}
          <div className="flex items-center gap-1 select-none">
            <button type="button" onClick={() => setFontSize(p => Math.max(10, p - 1))}
              className="w-6 h-6 flex items-center justify-center rounded border text-[9px] font-mono font-bold cursor-pointer transition-colors bg-muted hover:bg-muted/80 text-muted-foreground border-border/30">A-</button>
            <span className="text-[10px] text-muted-foreground font-mono px-1">{fontSize}px</span>
            <button type="button" onClick={() => setFontSize(p => Math.min(24, p + 1))}
              className="w-6 h-6 flex items-center justify-center rounded border text-[9px] font-mono font-bold cursor-pointer transition-colors bg-muted hover:bg-muted/80 text-muted-foreground border-border/30">A+</button>
          </div>

          <div className="flex gap-2">
            <button type="button"
              onClick={() => { setLocalValue(data || ''); setIsNotepadOpen(false); toast.info('Discarded.'); }}
              className="px-4 py-2 text-xs font-semibold rounded-lg border cursor-pointer transition-colors bg-muted hover:bg-muted/80 text-muted-foreground border-border/30">
              Cancel
            </button>
            <button type="button"
              onClick={() => { onChange(localValue); localStorage.removeItem(draftKey); setIsNotepadOpen(false); toast.success('Markdown applied!'); }}
              className="px-5 py-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold rounded-lg transition-colors shadow-lg flex items-center gap-1.5 cursor-pointer">
              <Save size={13} /> Save &amp; Apply
            </button>
          </div>
        </div>

      </div>

      {/* ── Global preview styles (underline, mark, sup, sub) ─────────── */}
      <style>{`
        .notepad-preview-content u { text-decoration: underline; text-underline-offset: 3px; }
        .notepad-preview-content mark { background: #fde68a55; color: inherit; padding: 0 2px; border-radius: 3px; }
        .notepad-preview-content sup { font-size: 0.7em; vertical-align: super; }
        .notepad-preview-content sub { font-size: 0.7em; vertical-align: sub; }
        .notepad-preview-content input[type="checkbox"] { pointer-events: none; }
      `}</style>
    </div>
  );
};
