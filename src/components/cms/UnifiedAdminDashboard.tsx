import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useCMSState, useCMSActions } from '@/context/CMSContext';
import { useAuth } from '@/hooks/useAuth';
import { SECTION_SCHEMAS, validateData } from '@/lib/schema';
import { convertToRawGitHubUrl } from './FormHelpers';
import { getLocalImage, clearLocalImages } from '@/lib/localImageStore';
import { DynamicForm } from './DynamicForm';
import { ProjectsAdmin } from './ProjectsAdmin';
import { BlogsAdmin } from './BlogsAdmin';
import { DashboardPanel } from './DashboardPanel';
import { PortfolioData, Project } from '@/data/portfolioData';
import { ChevronDown, RefreshCw, AlertTriangle, ListRestart, ScrollText, Layout, User, Award, GraduationCap, RotateCcw, Save, Undo2, Github } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import IntroTransition, { IntroStyle } from '@/components/portfolio/IntroTransition';

// ─── Collapsible Section Groups (Accordion UI) ──────────────────────────────
const SECTION_GROUPS = [
  {
    id: 'presentation',
    title: 'Presentation',
    iconName: 'Layout',
    sections: ['home', 'hero']
  },
  {
    id: 'profile',
    title: 'Profile & About',
    iconName: 'User',
    sections: ['personal', 'about', 'stats']
  },
  {
    id: 'capabilities',
    title: 'Capabilities',
    iconName: 'Award',
    sections: ['skills', 'techStack', 'services', 'projects-shortcut']
  },
  {
    id: 'timeline',
    title: 'Timeline & CV',
    iconName: 'GraduationCap',
    sections: ['education', 'experience', 'resume']
  }
];

const renderGroupIcon = (name: string) => {
  switch (name) {
    case 'Layout': return <Layout size={12} className="text-primary/70" />;
    case 'User': return <User size={12} className="text-primary/70" />;
    case 'Award': return <Award size={12} className="text-primary/70" />;
    case 'GraduationCap': return <GraduationCap size={12} className="text-primary/70" />;
    default: return null;
  }
};

interface CommitLog {
  sha: string;
  message: string;
  date: string;
  author: string;
}

interface ModuleNavigationProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  isMobile: boolean;
  auditLogs: { status: string }[];
}

const ModuleNavigation = React.memo<ModuleNavigationProps>(({
  activeTab,
  setActiveTab,
  isMobile,
  auditLogs
}) => {
  const tabs = ['portfolio', 'projects', 'blog', 'history', 'settings', 'logs'] as const;

  return (
    <>
      {!isMobile && (
        <div className="text-[10px] font-bold text-muted-foreground uppercase opacity-70 tracking-wider mb-1 mt-2 px-2 select-none">
          Modules
        </div>
      )}
      {tabs.map(tab => {
        const isActive = activeTab === tab;
        const hasError = tab === 'logs' && auditLogs.some(l => l.status === 'error');

        return (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-sm font-semibold transition-colors duration-150 capitalize shrink-0 select-none ${isMobile
                ? 'px-4 py-1.5 rounded-full text-xs'
                : 'px-3 py-2 rounded-lg text-left w-full'
              } ${isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'hover:bg-muted/50 text-muted-foreground'
              }`}
          >
            {tab === 'logs' ? (
              <span className="flex items-center gap-2">
                {tab}
                {hasError && (
                  <span className={`w-1.5 h-1.5 rounded-full bg-destructive animate-pulse ${isActive ? 'bg-white' : ''}`} />
                )}
              </span>
            ) : tab}
          </button>
        );
      })}
    </>
  );
}, (prev, next) => {
  return prev.activeTab === next.activeTab &&
    prev.isMobile === next.isMobile &&
    prev.auditLogs.length === next.auditLogs.length;
});

interface SectionGroupAccordionProps {
  isEditorOnly: boolean;
  localActiveSection: string;
  setLocalActiveSection: (sec: string) => void;
  setActiveTab: (tab: any) => void;
  openGroups: Record<string, boolean>;
  toggleGroup: (groupId: string) => void;
}

const SectionGroupAccordion = React.memo<SectionGroupAccordionProps>(({
  isEditorOnly,
  localActiveSection,
  setLocalActiveSection,
  setActiveTab,
  openGroups,
  toggleGroup
}) => {
  return (
    <div className="flex flex-col gap-1.5 mt-3 w-full px-1">
      <div className="text-[10px] font-bold text-muted-foreground uppercase opacity-50 tracking-wider px-2 mb-1 select-none">
        Sections
      </div>
      {SECTION_GROUPS.map(group => {
        const visibleSecs = group.sections.filter(sec => {
          if (sec === 'projects-shortcut') return true;
          return !isEditorOnly || !["emailjs", "personal", "resume"].includes(sec);
        });

        if (visibleSecs.length === 0) return null;
        const isOpen = !!openGroups[group.id];

        return (
          <div key={group.id} className="flex flex-col border-b border-border/5 pb-1 last:border-0">
            <button
              onClick={() => toggleGroup(group.id)}
              className="flex items-center justify-between w-full text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-wide opacity-90 transition-colors duration-150 px-2 py-1.5 hover:bg-muted/40 rounded-lg text-left select-none"
            >
              <span className="flex items-center gap-2">
                {renderGroupIcon(group.iconName)}
                {group.title}
              </span>
              <ChevronDown
                size={10}
                className={`transition-transform duration-200 text-muted-foreground/60 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isOpen && (
              <div
                className="flex flex-col gap-0.5 mt-1 pl-3 transition-opacity duration-150 animate-in fade-in"
              >
                {visibleSecs.map(sec => {
                  const isActive = localActiveSection === sec;
                  return (
                    <button
                      key={sec}
                      onClick={() => {
                        if (sec === 'projects-shortcut') setActiveTab('projects');
                        else setLocalActiveSection(sec);
                      }}
                      className={`font-semibold text-[11px] px-2.5 py-1.5 rounded-lg text-left w-full border select-none transition-colors duration-100 ${sec === 'projects-shortcut'
                          ? 'text-primary/95 hover:bg-primary/5 italic border-transparent'
                          : isActive
                            ? 'bg-muted border-border/40 text-foreground shadow-sm'
                            : 'hover:bg-muted/30 text-muted-foreground border-transparent'
                        }`}
                    >
                      {sec === 'projects-shortcut' ? "→ Projects" : sec.replace(/([A-Z])/g, ' $1').trim()}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}, (prev, next) => {
  return prev.isEditorOnly === next.isEditorOnly &&
    prev.localActiveSection === next.localActiveSection &&
    prev.openGroups === next.openGroups;
});

interface MobileSectionSelectorProps {
  isEditorOnly: boolean;
  localActiveSection: string;
  setLocalActiveSection: (sec: string) => void;
  setActiveTab: (tab: any) => void;
}

const MobileSectionSelector = React.memo<MobileSectionSelectorProps>(({
  isEditorOnly,
  localActiveSection,
  setLocalActiveSection,
  setActiveTab
}) => {
  const secs = ['home', 'hero', 'personal', 'about', 'projects-shortcut', 'stats', 'skills', 'techStack', 'services', 'education', 'experience', 'resume'] as const;

  return (
    <>
      <div className="w-px h-6 bg-border mx-2 self-center shrink-0" />
      {secs
        .filter(sec => !isEditorOnly || !["emailjs", "personal", "resume"].includes(sec))
        .map(sec => {
          const isActive = localActiveSection === sec;
          return (
            <button
              key={sec}
              onClick={() => {
                if (sec === 'projects-shortcut') setActiveTab('projects');
                else setLocalActiveSection(sec);
              }}
              className={`font-semibold transition-colors duration-150 capitalize shrink-0 px-4 py-1.5 rounded-full text-xs ${sec === 'projects-shortcut'
                  ? 'text-primary/80 hover:bg-primary/5 italic border border-transparent'
                  : isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'hover:bg-muted/30 text-muted-foreground border border-transparent'
                }`}
            >
              {sec === 'projects-shortcut' ? "→ Projects" : sec.replace(/([A-Z])/g, ' $1').trim()}
            </button>
          );
        })}
    </>
  );
}, (prev, next) => {
  return prev.isEditorOnly === next.isEditorOnly &&
    prev.localActiveSection === next.localActiveSection;
});

interface FieldChange {
  path: string;
  from: string;
  to: string;
}

const getChangesSummary = (live: any, preview: any): FieldChange[] => {
  const changes: FieldChange[] = [];

  const compare = (l: any, p: any, path: string) => {
    if (l === p) return;

    if (typeof l !== typeof p) {
      if (l !== undefined || p !== undefined) {
        changes.push({ path, from: String(l ?? 'none'), to: String(p ?? 'none') });
      }
      return;
    }

    if (Array.isArray(l) && Array.isArray(p)) {
      if (l.length !== p.length) {
        changes.push({ path, from: `${l.length} items`, to: `${p.length} items` });
      } else {
        l.forEach((item, idx) => compare(item, p[idx], `${path}[${idx + 1}]`));
      }
      return;
    }

    if (typeof l === 'object' && l !== null && p !== null) {
      const allKeys = Array.from(new Set([...Object.keys(l), ...Object.keys(p)]));
      allKeys.forEach(key => {
        if (key === 'id' || key === 'updatedAt' || key === 'createdAt') return;
        compare(l[key], p[key], path ? `${path} ➔ ${key}` : key);
      });
      return;
    }

    if (l !== p) {
      changes.push({
        path,
        from: l === undefined ? "none" : String(l),
        to: p === undefined ? "none" : String(p)
      });
    }
  };

  compare(live, preview, "");
  return changes;
};

// ─── Intro Preview Card (right-side live preview) ────────────────────────────
const STYLE_PALETTE: Record<string, { bg: string; colors: string[]; icon: string; label: string }> = {
  namaste: { bg: 'linear-gradient(135deg, #0a0a1a 0%, #0d0520 100%)', colors: ['#38bdf8', '#818cf8', '#e879f9', '#f472b6'], icon: '🙏', label: 'Namaste' },
  pulse: { bg: 'linear-gradient(135deg, #011a0f 0%, #000d06 100%)', colors: ['#34d399', '#6ee7b7', '#059669', '#10b981'], icon: '💓', label: 'Pulse' },
  academic: { bg: 'linear-gradient(135deg, #18100a 0%, #0f0800 100%)', colors: ['#f59e0b', '#fcd34d', '#92400e', '#d97706'], icon: '🎓', label: 'Academic' },
  terminal: { bg: '#000000', colors: ['#4ade80', '#86efac', '#22d3ee', '#16a34a'], icon: '💻', label: 'Terminal' },
  minimal: { bg: 'linear-gradient(135deg, #0a0a10 0%, #000000 100%)', colors: ['#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b'], icon: '✦', label: 'Minimal' },
  creative: { bg: 'linear-gradient(135deg, #100a18 0%, #0a0010 100%)', colors: ['#f97316', '#fb923c', '#a855f7', '#ec4899'], icon: '🎨', label: 'Creative' },
};

interface IntroPreviewCardProps {
  settings: Record<string, any>;
}

const IntroPreviewCard: React.FC<IntroPreviewCardProps> = ({ settings }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const enabled = settings.introEnabled !== false;
  const style = (settings.introStyle as IntroStyle) || 'namaste';
  const meta = STYLE_PALETTE[style] || STYLE_PALETTE.namaste;
  const primaryText = settings.introPrimaryText || 'नमस्ते';
  const subtitle = settings.introSubtitle || 'Namaste';
  const tagline = settings.introTagline || 'Welcome to my universe';
  const duration = settings.introDuration || 3000;
  const colors = (settings.introColors?.length >= 2) ? settings.introColors : meta.colors;

  const handlePlay = () => setIsPlaying(true);
  const handleComplete = useCallback(() => setIsPlaying(false), []);

  return (
    <>
      {/* Real fullscreen IntroTransition overlay */}
      <AnimatePresence>
        {isPlaying && (
          <IntroTransition
            key="intro-preview-overlay"
            style={style}
            primaryText={primaryText}
            subtitle={subtitle}
            tagline={tagline}
            colors={settings.introColors}
            duration={duration}
            onComplete={handleComplete}
          />
        )}
      </AnimatePresence>

      {/* Static thumbnail card */}
      <div className="bg-background/40 border border-border/40 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
          <div className="flex items-center gap-2">
            <span className="text-base">{meta.icon}</span>
            <div>
              <p className="text-xs font-bold text-foreground">{meta.label} Style</p>
              <p className="text-[9px] text-muted-foreground/60 uppercase tracking-widest">
                {enabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
          <span className={`w-2 h-2 rounded-full ${enabled ? 'bg-primary shadow-[0_0_6px_hsl(var(--primary))]' : 'bg-muted-foreground/30'}`} />
        </div>

        {/* Scaled preview viewport */}
        <div className="relative overflow-hidden" style={{ height: 180, background: meta.bg }}>
          {/* Scanline overlay for terminal style */}
          {style === 'terminal' && (
            <div className="absolute inset-0 pointer-events-none opacity-[0.04] z-10"
              style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,1) 2px, rgba(0,0,0,1) 4px)' }} />
          )}

          {/* Ambient glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-32 h-32 rounded-full" style={{
              background: `radial-gradient(circle, ${colors[0]}25 0%, transparent 70%)`,
              filter: 'blur(20px)',
              animation: 'pulse 3s ease-in-out infinite',
            }} />
            {colors[1] && (
              <div className="absolute w-24 h-24 rounded-full" style={{
                background: `radial-gradient(circle, ${colors[1]}15 0%, transparent 70%)`,
                filter: 'blur(15px)',
                animation: 'pulse 2.5s ease-in-out infinite reverse',
              }} />
            )}
          </div>

          {/* Static preview content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4">
            {/* Primary text preview */}
            <div className="text-center">
              <div
                className="font-bold leading-tight"
                style={{
                  fontSize: primaryText.length > 10 ? '1.1rem' : '1.5rem',
                  color: colors[0],
                  textShadow: `0 0 20px ${colors[0]}aa, 0 0 40px ${colors[0]}44`,
                  fontFamily: style === 'terminal' ? 'monospace' : undefined,
                }}
              >
                {style === 'terminal' ? `> ${primaryText}` : primaryText}
              </div>
            </div>

            {/* Divider */}
            <div className="w-12 h-px" style={{ background: `linear-gradient(90deg, transparent, ${colors[1] || colors[0]}, transparent)` }} />

            {/* Subtitle */}
            <div
              className="text-[10px] font-bold tracking-[0.4em] uppercase"
              style={{
                color: colors[1] || colors[0],
                opacity: 0.8,
              }}
            >
              {subtitle}
            </div>

            {/* Tagline */}
            <div className="text-[9px] tracking-[0.3em] uppercase" style={{ color: `${colors[2] || colors[0]}60` }}>
              {tagline}
            </div>
          </div>

          {/* Style-specific decoration */}
          {style === 'pulse' && (
            <svg className="absolute bottom-0 left-0 right-0 w-full opacity-40" height="30" viewBox="0 0 280 30" fill="none">
              <path d="M 0,15 L 40,15 L 50,5 L 60,25 L 70,15 L 90,15 L 100,8 L 110,22 L 120,15 L 280,15"
                stroke={colors[0]} strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </svg>
          )}
          {(style === 'namaste' || style === 'creative') && (
            <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 280 180" fill="none">
              <defs>
                <linearGradient id="prev-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                  {colors.map((c, i) => <stop key={i} offset={`${(i / (colors.length - 1)) * 100}%`} stopColor={c} />)}
                </linearGradient>
              </defs>
              <path d="M 20,160 C 20,80 260,120 260,20" stroke="url(#prev-grad)" strokeWidth="2" strokeLinecap="round" fill="none" />
            </svg>
          )}
          {style === 'academic' && (
            <div className="absolute top-2 right-3 text-2xl opacity-40">🎓</div>
          )}
          {style === 'minimal' && (
            <div className="absolute inset-0 border border-white/5 m-3 rounded-lg pointer-events-none" />
          )}

          {/* Playing animation overlay */}
          {isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20 animate-in fade-in">
              <div className="text-center">
                <div className="text-2xl mb-1 animate-bounce">{meta.icon}</div>
                <p className="text-[9px] text-white/70 uppercase tracking-widest">Playing…</p>
              </div>
            </div>
          )}

          {/* Disabled overlay */}
          {!enabled && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-10">
              <p className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Intro Disabled</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 flex items-center justify-between border-t border-border/30 bg-muted/5">
          <div className="text-[9px] text-muted-foreground/60 font-mono">
            {(duration / 1000).toFixed(1)}s · {meta.label}
          </div>
          <button
            onClick={handlePlay}
            disabled={!enabled}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Preview the full intro transition"
          >
            ▶ Play Preview
          </button>
        </div>
      </div>
    </>
  );
};

// ─── Intro & Transitions Settings Panel ─────────────────────────────────────
type IntroStyleKey = 'namaste' | 'pulse' | 'academic' | 'terminal' | 'minimal' | 'creative';

const INTRO_STYLES: { key: IntroStyleKey; label: string; icon: string; desc: string; bg: string }[] = [
  { key: 'namaste', label: 'Namaste', icon: '🙏', desc: 'Spiritual / Wellness / Portfolio', bg: 'from-blue-900/30 to-violet-900/30' },
  { key: 'pulse', label: 'Pulse', icon: '💓', desc: 'Medical / Healthcare / Clinic', bg: 'from-emerald-900/30 to-teal-900/30' },
  { key: 'academic', label: 'Academic', icon: '🎓', desc: 'Education / University / School', bg: 'from-amber-900/30 to-orange-900/30' },
  { key: 'terminal', label: 'Terminal', icon: '💻', desc: 'Tech / Developer / SaaS', bg: 'from-green-900/30 to-cyan-900/30' },
  { key: 'minimal', label: 'Minimal', icon: '✦', desc: 'Any / Clean / Professional', bg: 'from-slate-800/30 to-slate-900/30' },
  { key: 'creative', label: 'Creative', icon: '🎨', desc: 'Agency / Design Studio / Brand', bg: 'from-orange-900/30 to-purple-900/30' },
];

interface IntroSettingsPanelProps {
  settings: Record<string, any>;
  onUpdate: (updated: Record<string, any>) => void;
  children?: React.ReactNode;
}

const IntroSettingsPanel: React.FC<IntroSettingsPanelProps> = ({ settings, onUpdate, children }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const enabled = settings.introEnabled !== false;
  const currentStyle: IntroStyleKey = (settings.introStyle as IntroStyleKey) || 'namaste';
  const handleComplete = useCallback(() => setIsPlaying(false), []);

  const update = (key: string, value: any) => onUpdate({ ...settings, [key]: value });

  return (
    <div className="border-t border-border/40 pt-6">
      <AnimatePresence>
        {isPlaying && (
          <IntroTransition
            key="intro-settings-overlay"
            style={currentStyle}
            primaryText={settings.introPrimaryText || 'नमस्ते'}
            subtitle={settings.introSubtitle || 'Namaste'}
            tagline={settings.introTagline || 'Welcome to my universe'}
            colors={settings.introColors}
            duration={settings.introDuration || 3000}
            onComplete={handleComplete}
          />
        )}
      </AnimatePresence>

      {/* Section header — collapsible */}
      <button
        onClick={() => setIsOpen(v => !v)}
        className="w-full flex items-center justify-between mb-4 group"
      >
        <h3 className="text-lg font-bold flex items-center gap-2 group-hover:text-primary transition-colors">
          <span className="text-xl">🎬</span> Intro &amp; Transitions
          {enabled && (
            <span className="ml-2 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-full bg-primary/15 text-primary border border-primary/20">Active</span>
          )}
        </h3>
        <div className="flex items-center gap-3">
          {enabled && (
            <button
              onClick={(e) => { e.stopPropagation(); setIsPlaying(true); }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all shadow-sm"
              title="Preview the full intro transition"
            >
              ▶ Play Preview
            </button>
          )}
          <ChevronDown size={16} className={`text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {enabled && (
            <div className="sm:hidden flex justify-end">
              <button
                onClick={() => setIsPlaying(true)}
                className="flex items-center gap-1.5 px-4 py-2 w-full justify-center rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all shadow-md"
              >
                ▶ Play Fullscreen Preview
              </button>
            </div>
          )}
          {/* Enable / Disable toggle */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all duration-300 ${enabled ? 'border-primary/30 bg-primary/5' : 'border-border/50 bg-muted/10'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all duration-300 ${enabled ? 'bg-primary/15' : 'bg-muted/40 opacity-50'}`}>🎬</div>
              <div>
                <p className="font-bold text-sm">Show Site Intro</p>
                <p className="text-xs text-muted-foreground mt-0.5">{enabled ? 'Intro screen plays on first visit' : 'Visitors go directly to the site'}</p>
              </div>
            </div>
            <button
              onClick={() => update('introEnabled', !enabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 transition-all duration-200 ${enabled ? 'bg-primary border-primary shadow-[0_0_10px_hsl(var(--primary)/0.4)]' : 'bg-muted border-border/60'}`}
              role="switch" aria-checked={enabled}
            >
              <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-md transition-transform duration-200 ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>

          {/* Collapsed when disabled */}
          {enabled && (
            <>
              {/* Style picker */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Transition Style</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {INTRO_STYLES.map(s => (
                    <button
                      key={s.key}
                      onClick={() => update('introStyle', s.key)}
                      className={`relative p-3 rounded-xl border text-left transition-all duration-200 bg-gradient-to-br ${s.bg} ${currentStyle === s.key
                          ? 'border-primary/50 shadow-[0_0_14px_hsl(var(--primary)/0.25)] ring-1 ring-primary/30'
                          : 'border-border/40 hover:border-border/70'
                        }`}
                    >
                      {currentStyle === s.key && (
                        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary))]" />
                      )}
                      <div className="text-xl mb-1">{s.icon}</div>
                      <div className="text-xs font-bold text-foreground">{s.label}</div>
                      <div className="text-[9px] text-muted-foreground/70 leading-tight mt-0.5">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Text fields group */}
              <div className="p-4 rounded-2xl border border-border/40 bg-muted/5 space-y-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Content</p>

                {/* Primary text */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-muted-foreground/80 uppercase tracking-wider block">
                    Primary Text
                    <span className="ml-2 font-normal normal-case text-muted-foreground/50">Big display text (e.g. नमस्ते, Hello, Welcome)</span>
                  </label>
                  <input
                    type="text"
                    value={settings.introPrimaryText ?? 'नमस्ते'}
                    onChange={e => update('introPrimaryText', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border/50 bg-background/60 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                    placeholder="e.g. नमस्ते"
                  />
                </div>

                {/* Subtitle */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-muted-foreground/80 uppercase tracking-wider block">
                    Subtitle
                    <span className="ml-2 font-normal normal-case text-muted-foreground/50">Appears below in smaller text</span>
                  </label>
                  <input
                    type="text"
                    value={settings.introSubtitle ?? 'Namaste'}
                    onChange={e => update('introSubtitle', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border/50 bg-background/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                    placeholder="e.g. Namaste"
                  />
                </div>

                {/* Tagline */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-muted-foreground/80 uppercase tracking-wider block">
                    Tagline
                    <span className="ml-2 font-normal normal-case text-muted-foreground/50">Smallest line at the bottom</span>
                  </label>
                  <input
                    type="text"
                    value={settings.introTagline ?? 'Welcome to my universe'}
                    onChange={e => update('introTagline', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border/50 bg-background/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                    placeholder="e.g. Welcome to my universe"
                  />
                </div>
              </div>

              {/* Duration slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Duration</label>
                  <span className="text-xs font-bold text-primary">{((settings.introDuration ?? 3000) / 1000).toFixed(1)}s</span>
                </div>
                <input
                  type="range" min={1500} max={6000} step={250}
                  value={settings.introDuration ?? 3000}
                  onChange={e => update('introDuration', Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none bg-muted accent-primary cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-muted-foreground/50">
                  <span>1.5s (snappy)</span><span>6s (cinematic)</span>
                </div>
              </div>
            </>
          )}
          {children}
        </div>
      )}
    </div>
  );
};

export const UnifiedAdminDashboard = () => {
  const {
    previewData,
    liveData,
    previewMode,
    safeMode,
    cmsMode,
    forceLocalMode,
    isLocalEnvironment,
    auditLogs,
    canUndo,
    canRedo
  } = useCMSState();

  const {
    setPreviewMode,
    setSafeMode,
    setForceLocalMode,
    updatePreviewSection,
    updateLiveSection,
    refreshData,
    clearLogs,
    undo,
    redo,
    restoreStateFromCommit
  } = useCMSActions();

  const { roles, isSuperAdmin } = useAuth();
  const isEditorOnly = roles.includes("editor") && !roles.includes("admin");
  const userRole = roles.includes("admin") ? "admin" : "editor";
  const adminLabel = roles.includes("admin")
    ? (isSuperAdmin ? "⚡ Master Shivansh" : "Masterji")
    : null;

  const [activeTab, setActiveTab] = useState<'portfolio' | 'projects' | 'blog' | 'settings' | 'history' | 'logs'>('portfolio');
  const [localActiveSection, setLocalActiveSection] = useState<string>('hero');
  const [isMinimized, setIsMinimized] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem('cms-minimized');
      return saved ? saved === 'true' : true; // Default to true (minimized/collapsed) so it starts tidy!
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem('cms-minimized', String(isMinimized));
  }, [isMinimized]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [historyLogs, setHistoryLogs] = useState<CommitLog[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyFile, setHistoryFile] = useState<string>('src/data/portfolio.yaml');

  // Accordion collapsed state for Desktop Sections
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    presentation: false,
    profile: false,
    capabilities: false,
    timeline: false,
    settings_sync: false,
    settings_effects: true,
    settings_aesthetics: false
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleGroup = useCallback((groupId: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  }, []);

  // Performance optimized Callback Handlers
  const handleProjectsChange = useCallback((proj: Project[]) => {
    updatePreviewSection('projects', proj);
  }, [updatePreviewSection]);

  const handleBlogChange = useCallback((blogPosts: unknown[]) => {
    updatePreviewSection('blog', blogPosts);
  }, [updatePreviewSection]);

  const handleFormChange = useCallback((data: unknown) => {
    updatePreviewSection(localActiveSection, data);
  }, [localActiveSection, updatePreviewSection]);

  // Active section data selector
  const activeSectionData = useMemo(() => {
    return (previewData[localActiveSection as keyof PortfolioData] || {}) as Record<string, unknown>;
  }, [previewData, localActiveSection]);

  const sessionChanges = useMemo(() => {
    return getChangesSummary(liveData, previewData);
  }, [liveData, previewData]);

  // Sync statuses helper
  const syncStatus = useMemo(() => {
    if (cmsMode === 'local' || forceLocalMode) {
      return { icon: "💻", label: "Local Filesystem", color: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" };
    }
    if (cmsMode === 'github') {
      return { icon: "☁️", label: "GitHub Cloud", color: "bg-blue-500/10 text-blue-500 border border-blue-500/20" };
    }
    return { icon: "❓", label: "Sync Unknown", color: "bg-muted text-muted-foreground" };
  }, [cmsMode, forceLocalMode]);

  // Conflict handling
  const [conflictData, setConflictData] = useState<{
    section: string;
    pendingData: unknown;
    latestSha: string;
  } | null>(null);

  const handleConflictResolve = (strategy: 'overwrite' | 'cancel') => {
    if (strategy === 'cancel') {
      setConflictData(null);
      refreshData();
      return;
    }
    if (conflictData) {
      saveContent(conflictData.section, conflictData.pendingData, conflictData.latestSha);
    }
  };

  const fetchHistory = async (file: string) => {
    if (!file) return;
    setHistoryFile(file);
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/cms-history?filePath=${encodeURIComponent(file)}`);
      if (!res.ok) {
        const text = await res.text();
        try {
          const json = JSON.parse(text);
          setErrorMsg(json.error || `Server Error (${res.status})`);
        } catch {
          setErrorMsg(`Network Error: ${res.statusText || res.status}`);
        }
        setLoadingHistory(false);
        return;
      }
      const result = await res.json();
      if (result.success) {
        setHistoryLogs(result.data.commits || []);
      } else {
        setErrorMsg(result.error || "Failed to load history");
      }
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e);
      setErrorMsg("Connection failure: " + errMsg);
    }
    setLoadingHistory(false);
  };

  // Clear error message when switching contexts
  useEffect(() => {
    setErrorMsg("");
  }, [activeTab, localActiveSection]);

  // Synchronize historyFile and fetch commits based on activeTab
  useEffect(() => {
    let file = 'src/data/portfolio.yaml';
    if (activeTab === 'projects') {
      file = 'src/data/projects.yaml';
    } else if (activeTab === 'blog') {
      file = 'src/data/blog.yaml';
    } else if (activeTab === 'history') {
      file = historyFile;
    }
    fetchHistory(file);
  }, [activeTab, historyFile]);

  const saveContent = async (section: string, data: unknown, forceSha?: string): Promise<{ success: boolean; error?: string } | undefined> => {
    setIsLoading(true);
    setErrorMsg("");
    setConflictData(null);

    try {
      const isProject = section === 'projects';
      const isBlog = section === 'blog';
      const filePath = isBlog ? 'src/data/blog.yaml' : (isProject ? 'src/data/projects.yaml' : 'src/data/portfolio.yaml');
      const sectionKey = isBlog ? 'blog' : (isProject ? 'projects' : section);

      const processedData = data;

      // Perform Frontend Schema Validation
      const currentSchema = SECTION_SCHEMAS[section];
      if (currentSchema) {
        const validation = validateData(currentSchema, processedData);

        // Strict explicit validation state check to guarantee type narrowing under all compilers
        if (validation.success === false) {
          setErrorMsg(`Validation Error: ${validation.errors.join(', ')}`);
          setIsLoading(false);
          toast.error("Validation Failed!");
          return { success: false, error: "Validation Failed" };
        }
      }

      logger.addLog({ action: "SAVE_DATA", status: "pending", message: `Saving ${sectionKey}...` });

      const res = await fetch("/api/cms-save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: userRole,
          filePath,
          sectionKey,
          newData: processedData,
          isSafeMode: safeMode,
          providedSha: forceSha
        })
      });

      const result = await res.json();
      
      // Cleanup local images on successful save
      if (res.ok) {
        clearLocalImages();
      }

      if (res.status === 409) {
        logger.addLog({ action: "SAVE_DATA", status: "error", message: "Conflict: Git SHA mismatch detected." });
        setConflictData({
          section,
          pendingData: data,
          latestSha: result.data.latestSha
        });
        toast.warning("Conflict Detected! Choose resolve option.");
        setIsLoading(false);
        return { success: false, error: "Conflict Detected" };
      }

      if (result.success) {
        logger.addLog({ action: "SAVE_DATA", status: "success", message: `Successfully persisted changes to ${sectionKey}` });
        toast.success(safeMode ? "Safe Mode simulation complete!" : "Changes saved successfully!");

        // Synchronize context data
        if (!safeMode) {
          await refreshData();
          sessionStorage.removeItem("cms-preview-data");
        }
        return { success: true };
      } else {
        throw new Error(result.error || "Save Failed");
      }
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e);
      setErrorMsg(errMsg || "Network Save Failure");
      logger.addLog({ action: "SAVE_DATA", status: "error", message: errMsg || "Network Save Failure" });
      toast.error("Save Failed!");
      return { success: false, error: errMsg };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardPanel
      isMinimized={isMinimized}
      setIsMinimized={setIsMinimized}
      activeTab={activeTab}
      canUndo={canUndo}
      canRedo={canRedo}
      undo={undo}
      redo={redo}
      safeMode={safeMode}
      setSafeMode={setSafeMode}
      previewMode={previewMode}
      setPreviewMode={setPreviewMode}
      syncStatus={syncStatus}
      adminLabel={adminLabel}
      isSuperAdmin={isSuperAdmin}
      auditLogs={auditLogs}
    >
      {conflictData && !isMinimized && (
        <div className="absolute inset-0 z-50 bg-background/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
          <AlertTriangle size={48} className="text-destructive mb-4" />
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500">Conflict Detected</h2>
          <p className="text-sm text-foreground/80 my-3 max-w-sm">Another editor recently pushed changes. Your local version is out of sync.</p>
          <div className="flex gap-3 mt-4">
            <button onClick={() => handleConflictResolve('cancel')} className="px-5 py-2 rounded-lg bg-muted hover:bg-muted/80 font-medium">Cancel</button>
            <button onClick={() => handleConflictResolve('overwrite')} className="px-5 py-2 rounded-lg bg-destructive text-destructive-foreground font-medium flex items-center gap-2">
              Over-write <RefreshCw size={14} />
            </button>
          </div>
        </div>
      )}

      {!isMinimized && (
        <div className={`flex flex-1 overflow-hidden relative ${isMobile ? 'flex-col' : 'flex-row'} w-full h-full`}>
          {/* SIDEBAR / MOBILE TAB BAR */}
          <div className={`${isMobile ? 'w-full h-auto flex-row overflow-x-auto whitespace-nowrap scrollbar-hide py-1.5 border-b' : 'w-[180px] flex-col overflow-y-auto border-r'} bg-muted/20 border-border/40 flex p-2 gap-1 shrink-0`}>
            <ModuleNavigation
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              isMobile={isMobile}
              auditLogs={auditLogs}
            />

            {activeTab === 'portfolio' && (
              <>
                {isMobile ? (
                  <MobileSectionSelector
                    isEditorOnly={isEditorOnly}
                    localActiveSection={localActiveSection}
                    setLocalActiveSection={setLocalActiveSection}
                    setActiveTab={setActiveTab}
                  />
                ) : (
                  <SectionGroupAccordion
                    isEditorOnly={isEditorOnly}
                    localActiveSection={localActiveSection}
                    setLocalActiveSection={setLocalActiveSection}
                    setActiveTab={setActiveTab}
                    openGroups={openGroups}
                    toggleGroup={toggleGroup}
                  />
                )}
              </>
            )}
          </div>

          {/* MAIN EDITING WORKSPACE */}
          <div className="flex-1 flex flex-col bg-background/40 relative h-full overflow-hidden">
            {activeTab === 'portfolio' && (
              <>
                {/* Left Side: Form Editor & Controls */}
                <div className="flex-1 flex flex-col overflow-hidden h-full bg-background/25">
                  <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                    {errorMsg && <div className="mb-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-3 text-sm">{errorMsg}</div>}
                    {SECTION_SCHEMAS[localActiveSection] ? (
                      <DynamicForm
                        schema={SECTION_SCHEMAS[localActiveSection]}
                        data={activeSectionData}
                        onChange={handleFormChange}
                      />
                    ) : (
                      <div className="text-muted-foreground text-sm">Select a section.</div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="p-4 border-t border-border/40 bg-muted/10 shrink-0 flex items-center justify-between gap-3 flex-wrap">
                    {/* Left Side: Reversal and Rollback Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        disabled={!canUndo}
                        onClick={() => {
                          undo();
                          toast.success("CRM session edit reverted!");
                        }}
                        className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 disabled:opacity-35 disabled:hover:bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 shadow-sm"
                        title="Undo last CRM session change instantly"
                      >
                        <Undo2 size={14} /> CRM Undo
                      </button>

                      {historyLogs.length > 1 && (
                        <button
                          disabled={isLoading}
                          onClick={async () => {
                            const targetSha = historyLogs[1]?.sha;
                            if (targetSha) {
                              const ok = await restoreStateFromCommit(targetSha, historyFile);
                              if (ok) {
                                toast.success("Reverted to previous Git commit!");
                              }
                            }
                          }}
                          className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 shadow-sm"
                          title={`Undo commit and rollback to: ${historyLogs[1]?.message || ''}`}
                        >
                          <RotateCcw size={14} /> Git Revert Commit
                        </button>
                      )}
                    </div>

                    {/* Right Side: Primary Actions */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setPreviewMode(!previewMode)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${previewMode ? 'bg-primary/20 text-primary border-primary/30' : 'bg-muted hover:bg-muted/80 text-muted-foreground border-border/50'}`}
                      >
                        {previewMode ? "Exit Preview" : "Preview Changes"}
                      </button>
                      <button
                        disabled={isLoading}
                        onClick={() => saveContent(localActiveSection, activeSectionData)}
                        className="px-5 py-2 bg-primary text-primary-foreground rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-lg"
                      >
                        {isLoading ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
                        {isLoading ? "Saving..." : (cmsMode === 'local' || forceLocalMode ? `Save Local` : `Commit GitHub`)}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'projects' && (
              <div className="relative flex-1 overflow-hidden flex flex-col h-full w-full">
                <ProjectsAdmin
                  projects={previewData.projects || []}
                  onChange={handleProjectsChange}
                  isLoading={isLoading}
                  mode={(forceLocalMode || cmsMode === 'local') ? 'local' : 'github'}
                  onSave={(data) => saveContent('projects', data || previewData.projects || [])}
                />
              </div>
            )}

            {activeTab === 'blog' && (
              <div className="relative flex-1 overflow-hidden flex flex-col h-full w-full">
                <BlogsAdmin
                  blogs={previewData.blog || []}
                  onChange={handleBlogChange}
                  isLoading={isLoading}
                  mode={(forceLocalMode || cmsMode === 'local') ? 'local' : 'github'}
                  onSave={(data) => saveContent('blog', data || previewData.blog || [])}
                />
              </div>
            )}

            {activeTab === 'history' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm">History</h3>
                  <div className="flex gap-2 text-xs">
                    <button
                      onClick={() => fetchHistory('src/data/portfolio.yaml')}
                      className={`p-1 px-2.5 rounded transition-all ${historyFile === 'src/data/portfolio.yaml' ? 'bg-primary text-primary-foreground font-semibold shadow-sm' : 'bg-muted hover:bg-muted/80 text-muted-foreground'}`}
                    >
                      Portfolio
                    </button>
                    <button
                      onClick={() => fetchHistory('src/data/projects.yaml')}
                      className={`p-1 px-2.5 rounded transition-all ${historyFile === 'src/data/projects.yaml' ? 'bg-primary text-primary-foreground font-semibold shadow-sm' : 'bg-muted hover:bg-muted/80 text-muted-foreground'}`}
                    >
                      Projects
                    </button>
                    <button
                      onClick={() => fetchHistory('src/data/blog.yaml')}
                      className={`p-1 px-2.5 rounded transition-all ${historyFile === 'src/data/blog.yaml' ? 'bg-primary text-primary-foreground font-semibold shadow-sm' : 'bg-muted hover:bg-muted/80 text-muted-foreground'}`}
                    >
                      Blog
                    </button>
                  </div>
                </div>
                {loadingHistory ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/60 gap-2">
                    <RefreshCw size={20} className="animate-spin text-primary" />
                    <span className="text-xs">Fetching history logs...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {historyLogs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/50 border border-dashed border-border/40 rounded-xl bg-muted/5 gap-2">
                        <ScrollText size={32} className="opacity-40 text-primary" />
                        <p className="text-xs font-semibold">No commits found</p>
                        <p className="text-[10px] text-muted-foreground/80 max-w-[250px] text-center">
                          History requires Git commits on this branch to display.
                        </p>
                      </div>
                    ) : (
                      historyLogs.map(log => (
                        <div key={log.sha} className="p-3 rounded-lg border border-border/50 bg-muted/5 text-xs flex flex-col gap-2 transition-all hover:border-primary/30 animate-in fade-in duration-200">
                          <div>
                            <p className="font-bold text-foreground/90">{log.message}</p>
                            <p className="opacity-70 mt-0.5 font-mono text-[10px]">{new Date(log.date).toLocaleString()} • {log.author}</p>
                          </div>
                          <button
                            onClick={async () => {
                              const ok = await restoreStateFromCommit(log.sha, historyFile);
                              if (ok) {
                                if (historyFile.includes("projects.yaml")) setActiveTab("projects");
                                else if (historyFile.includes("blog.yaml")) setActiveTab("blog");
                                else setActiveTab("portfolio");
                              }
                            }}
                            className="mt-1 px-2.5 py-1 text-[10px] font-bold bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20 rounded transition-all flex items-center gap-1.5 self-start shadow-sm"
                          >
                            <RotateCcw size={10} /> Restore Preview State
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="flex-1 flex overflow-hidden h-full">
                {/* Left Side: Form Editor */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3">

                  {/* ── Sync Settings ── */}
                  <div className="border border-border/40 bg-card rounded-2xl overflow-hidden">
                    <button
                      onClick={() => toggleGroup('settings_sync')}
                      className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                    >
                      <h3 className="text-sm font-bold flex items-center gap-2"><RefreshCw size={15} className="text-muted-foreground" /> Sync Settings</h3>
                      <ChevronDown size={15} className={`text-muted-foreground transition-transform duration-200 ${openGroups.settings_sync ? 'rotate-180' : ''}`} />
                    </button>
                    {openGroups.settings_sync && (
                      <div className="px-4 pb-4 border-t border-border/40 pt-4 space-y-3 animate-in fade-in duration-200">
                        <div className="p-4 rounded-xl border border-border/50 bg-muted/10 flex items-center justify-between gap-4">
                          <div>
                            <p className="font-bold text-sm">Force Local Mode</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Force-save to local filesystem instead of GitHub.</p>
                          </div>
                          <button
                            onClick={() => setForceLocalMode(!forceLocalMode)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                              forceLocalMode ? 'bg-primary border-primary shadow-[0_0_10px_hsl(var(--primary)/0.4)]' : 'bg-muted border-border/60'
                            }`}
                            role="switch" aria-checked={forceLocalMode} title="Toggle Force Local Mode"
                          >
                            <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-md transition-transform duration-200 ${forceLocalMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ── Global Effects ── */}
                  <div className="border border-border/40 bg-card rounded-2xl overflow-hidden">
                    <button
                      onClick={() => toggleGroup('settings_effects')}
                      className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                    >
                      <h3 className="text-sm font-bold flex items-center gap-2">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                        Global Effects
                      </h3>
                      <ChevronDown size={15} className={`text-muted-foreground transition-transform duration-200 ${openGroups.settings_effects ? 'rotate-180' : ''}`} />
                    </button>
                    {openGroups.settings_effects && (
                      <div className="px-4 pb-4 border-t border-border/40 pt-4 space-y-3 animate-in fade-in duration-200">

                        {/* Custom Cursor Toggle */}
                        <div className={`p-4 rounded-xl border transition-all duration-300 flex items-center justify-between gap-4 ${
                          previewData.settings?.customCursorEnabled !== false ? 'border-primary/30 bg-primary/5' : 'border-border/50 bg-muted/10'
                        }`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                              previewData.settings?.customCursorEnabled !== false ? 'bg-primary/15 text-primary' : 'bg-muted/40 text-muted-foreground'
                            }`}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m4 4 7.07 17 2.51-7.39L21 11.07z" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-bold text-sm">Premium Cursor Effect</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {previewData.settings?.customCursorEnabled !== false ? 'Custom trailing cursor is active' : 'System default cursor is active'}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const next = previewData.settings?.customCursorEnabled === false ? true : false;
                              const updated = { ...previewData.settings, customCursorEnabled: next };
                              updateLiveSection('settings', updated);
                              updatePreviewSection('settings', updated);
                            }}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                              previewData.settings?.customCursorEnabled !== false ? 'bg-primary border-primary shadow-[0_0_10px_hsl(var(--primary)/0.4)]' : 'bg-muted border-border/60'
                            }`}
                            role="switch" aria-checked={previewData.settings?.customCursorEnabled !== false}
                            title="Toggle premium cursor effect on/off"
                          >
                            <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-md transition-transform duration-200 ${
                              previewData.settings?.customCursorEnabled !== false ? 'translate-x-5' : 'translate-x-0.5'
                            }`} />
                          </button>
                        </div>

                        {/* Ambient Edge Lights Toggle */}
                        <div className={`p-4 rounded-xl border transition-all duration-300 flex items-center justify-between gap-4 ${
                          previewData.settings?.edgeLightsEnabled !== false ? 'border-primary/30 bg-primary/5' : 'border-border/50 bg-muted/10'
                        }`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                              previewData.settings?.edgeLightsEnabled !== false ? 'bg-primary/15 text-primary' : 'bg-muted/40 text-muted-foreground'
                            }`}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-bold text-sm">Ambient Edge Lights</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {previewData.settings?.edgeLightsEnabled !== false ? 'Glowing boundary rope lights active' : 'Edge lights disabled'}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const next = previewData.settings?.edgeLightsEnabled === false ? true : false;
                              const updated = { ...previewData.settings, edgeLightsEnabled: next };
                              updateLiveSection('settings', updated);
                              updatePreviewSection('settings', updated);
                            }}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                              previewData.settings?.edgeLightsEnabled !== false ? 'bg-primary border-primary shadow-[0_0_10px_hsl(var(--primary)/0.4)]' : 'bg-muted border-border/60'
                            }`}
                            role="switch" aria-checked={previewData.settings?.edgeLightsEnabled !== false}
                            title="Toggle ambient edge lights on/off"
                          >
                            <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-md transition-transform duration-200 ${
                              previewData.settings?.edgeLightsEnabled !== false ? 'translate-x-5' : 'translate-x-0.5'
                            }`} />
                          </button>
                        </div>

                        {/* Save / Push buttons for Global Effects */}
                        <div className="mt-4 pt-3 border-t border-border/30 flex justify-end gap-3">
                          {isLocalEnvironment && (
                            <button
                              disabled={isLoading}
                              onClick={() => saveContent('settings', previewData.settings || {})}
                              className="px-4 py-2.5 bg-muted text-foreground border border-border/60 rounded-xl font-semibold text-sm flex items-center gap-2 hover:bg-muted/80 disabled:opacity-50 transition-colors"
                            >
                              {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                              Save Local
                            </button>
                          )}
                          <button
                            disabled={isLoading}
                            onClick={async () => {
                              const prevForce = forceLocalMode;
                              setForceLocalMode(false);
                              await saveContent('settings', previewData.settings || {});
                              setForceLocalMode(prevForce);
                            }}
                            className="px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-lg"
                          >
                            {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <Github size={14} />}
                            Push to GitHub
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ── Intro & Transitions ── */}
                  <div className="border border-border/40 bg-card rounded-2xl overflow-hidden">
                    <IntroSettingsPanel
                      settings={previewData.settings || {}}
                      onUpdate={(updated) => updatePreviewSection('settings', updated)}
                    >
                      <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-border/30">
                        {isLocalEnvironment && (
                          <button
                            disabled={isLoading}
                            onClick={() => saveContent('settings', previewData.settings || {})}
                            className="px-4 py-2.5 bg-muted text-foreground border border-border/60 rounded-xl font-semibold text-sm flex items-center gap-2 hover:bg-muted/80 disabled:opacity-50 transition-colors"
                          >
                            {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                            Save Local
                          </button>
                        )}
                        <button
                          disabled={isLoading}
                          onClick={async () => {
                            const prevForce = forceLocalMode;
                            setForceLocalMode(false);
                            await saveContent('settings', previewData.settings || {});
                            setForceLocalMode(prevForce);
                          }}
                          className="px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-lg"
                        >
                          {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <Github size={14} />}
                          Push to GitHub
                        </button>
                      </div>
                    </IntroSettingsPanel>
                  </div>

                  {/* ── Global Aesthetic Settings ── */}
                  <div className="border border-border/40 bg-card rounded-2xl overflow-hidden">
                    <button
                      onClick={() => toggleGroup('settings_aesthetics')}
                      className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                    >
                      <h3 className="text-sm font-bold flex items-center gap-2"><Layout size={15} className="text-muted-foreground" /> Global Aesthetic Settings</h3>
                      <ChevronDown size={15} className={`text-muted-foreground transition-transform duration-200 ${openGroups.settings_aesthetics ? 'rotate-180' : ''}`} />
                    </button>
                    {openGroups.settings_aesthetics && (
                      <div className="px-4 pb-4 border-t border-border/40 pt-4 animate-in fade-in duration-200">
                        {errorMsg && <div className="mb-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-3 text-sm">{errorMsg}</div>}
                        <DynamicForm
                          schema={(SECTION_SCHEMAS['settings'] as any).omit({
                            introEnabled: true, introStyle: true, introPrimaryText: true,
                            introSubtitle: true, introTagline: true, introColors: true,
                            introDuration: true, customCursorEnabled: true, edgeLightsEnabled: true
                          })}
                          data={previewData.settings || {}}
                          onChange={(newSettings) => updatePreviewSection('settings', newSettings)}
                        />
                        <div className="mt-6 flex justify-end gap-3">
                          {isLocalEnvironment && (
                            <button
                              disabled={isLoading}
                              onClick={() => saveContent('settings', previewData.settings || {})}
                              className="px-4 py-2.5 bg-muted text-foreground border border-border/60 rounded-xl font-semibold text-sm flex items-center gap-2 hover:bg-muted/80 disabled:opacity-50 transition-colors"
                            >
                              {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                              Save Local
                            </button>
                          )}
                          <button
                            disabled={isLoading}
                            onClick={async () => {
                              const prevForce = forceLocalMode;
                              setForceLocalMode(false);
                              await saveContent('settings', previewData.settings || {});
                              setForceLocalMode(prevForce);
                            }}
                            className="px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-lg"
                          >
                            {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <Github size={14} />}
                            Commit to GitHub
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* Right Side: Interactive Aesthetic + Intro Preview Simulator */}
                <div className="hidden lg:flex w-[320px] shrink-0 border-l border-border/40 bg-muted/10 p-6 flex-col overflow-y-auto space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Live Preview</h4>
                    <p className="text-[10px] text-muted-foreground/60">Intro transition &amp; aesthetic changes reflected instantly.</p>
                  </div>

                  {/* Intro Preview Card */}
                  <IntroPreviewCard settings={previewData.settings || {}} />

                  {/* Neon Rope Light Preview */}
                  <div className="bg-background/40 border border-border/40 rounded-2xl p-4 flex flex-col items-center justify-center space-y-2 relative overflow-hidden h-36">
                    <span className="absolute top-2 left-3 text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Neon Rope Light</span>
                    <style dangerouslySetInnerHTML={{
                      __html: `
                      @keyframes ropeFlow {
                        0% { stroke-dashoffset: 200; }
                        100% { stroke-dashoffset: 0; }
                      }
                      @keyframes pulseGlow {
                        0%, 100% { filter: brightness(0.95) saturate(1); }
                        50% { filter: brightness(1.2) saturate(1.3); }
                      }
                    `}} />
                    <svg className="w-full h-16" overflow="visible">
                      <defs>
                        <linearGradient id="ropeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          {(previewData.settings?.ropeLightColors || ['#eab308', '#67e8f9', '#6366f1', '#a855f7']).map((color: string, idx: number, arr: any[]) => (
                            <stop key={idx} offset={`${(idx / (arr.length - 1)) * 100}%`} stopColor={color} />
                          ))}
                        </linearGradient>
                        <filter id="ropeGlow" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur stdDeviation={previewData.settings?.ropeLightGlowIntensity ?? 3} result="coloredBlur" />
                          <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>
                      <path
                        d="M 10,32 C 70,5 130,59 190,32 C 230,12 270,32 290,20"
                        fill="none"
                        stroke="url(#ropeGrad)"
                        strokeWidth={previewData.settings?.ropeLightThickness ?? 1.5}
                        filter="url(#ropeGlow)"
                        style={{
                          strokeDasharray: '30 10',
                          animation: `ropeFlow ${20 / (previewData.settings?.ropeLightSpeed ?? 12)}s linear infinite`
                        }}
                      />
                    </svg>
                    <span className="text-[9px] text-muted-foreground/60">Speed: {previewData.settings?.ropeLightSpeed ?? 12} • Width: {previewData.settings?.ropeLightThickness ?? 1.5}px</span>
                  </div>

                  {/* Dynamic Font and Text Glow Preview */}
                  <div className="bg-background/40 border border-border/40 rounded-2xl p-4 flex flex-col space-y-2 relative overflow-hidden">
                    <span className="absolute top-2 left-3 text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Neon Heading</span>
                    <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=${(previewData.settings?.themeFontFamily || 'Inter').replace(/\s+/g, '+')}:wght@400;700;800&display=swap`} />
                    <div className="py-6 flex items-center justify-center min-h-[80px]">
                      <div
                        style={{
                          fontFamily: `"${previewData.settings?.themeFontFamily || 'Inter'}", sans-serif`,
                          color: previewData.settings?.themePrimaryColor || '#60a5fa',
                          opacity: previewData.settings?.textBaseOpacity ?? 0.15,
                          textShadow: `0 0 ${(previewData.settings?.textGlowIntensity ?? 1.3) * 2}px ${previewData.settings?.themePrimaryColor || '#60a5fa'}, 0 0 ${(previewData.settings?.textGlowIntensity ?? 1.3) * 6}px ${previewData.settings?.themePrimaryColor || '#60a5fa'}`,
                          animation: `pulseGlow ${previewData.settings?.textAnimationSpeed || '4s'} ease-in-out infinite`
                        }}
                        className="text-base font-extrabold tracking-widest text-center uppercase transition-all duration-300"
                      >
                        SHIVANSH VYAS
                      </div>
                    </div>
                    <div className="text-[9px] text-muted-foreground/60 text-center border-t border-border/10 pt-2 font-mono">
                      Font: {previewData.settings?.themeFontFamily || 'Inter'}
                    </div>
                  </div>

                  {/* Color Palette Layout Mock Preview */}
                  <div className="bg-background/40 border border-border/40 rounded-2xl p-4 flex flex-col space-y-3 relative overflow-hidden">
                    <span className="absolute top-2 left-3 text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Theme Palette</span>
                    <div className="pt-4 space-y-2.5">
                      <div
                        style={{ backgroundColor: previewData.settings?.themeBackgroundColor || '#0f172a' }}
                        className="rounded-xl p-3 border border-border/40 space-y-3 transition-colors duration-300 shadow-inner"
                      >
                        <div className="flex items-center justify-between border-b border-border/10 pb-1.5">
                          <span
                            style={{
                              color: previewData.settings?.themePrimaryColor || '#60a5fa',
                              fontFamily: `"${previewData.settings?.themeFontFamily || 'Inter'}", sans-serif`
                            }}
                            className="text-[10px] font-bold uppercase tracking-wider transition-colors duration-300"
                          >
                            Portfolio Header
                          </span>
                          <div
                            style={{ backgroundColor: previewData.settings?.themeAccentColor || '#3b82f6' }}
                            className="w-2 h-2 rounded-full transition-colors duration-300"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <div className="h-1.5 w-5/6 rounded" style={{ backgroundColor: previewData.settings?.themePrimaryColor || '#60a5fa', opacity: 0.3 }} />
                          <div className="h-1.5 w-2/3 rounded" style={{ backgroundColor: previewData.settings?.themePrimaryColor || '#60a5fa', opacity: 0.15 }} />
                        </div>
                        <button
                          style={{
                            backgroundColor: previewData.settings?.themeAccentColor || '#3b82f6',
                            color: '#fff',
                            fontFamily: `"${previewData.settings?.themeFontFamily || 'Inter'}", sans-serif`
                          }}
                          className="w-full py-1 rounded text-[9px] font-bold uppercase tracking-wider shadow-sm transition-all duration-300"
                        >
                          Accent Button
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'logs' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border/40 shrink-0">
                  <div className="flex items-center gap-2">
                    <ScrollText size={18} className="text-primary" />
                    <h3 className="text-lg font-bold">Audit Logs</h3>
                  </div>
                  <button
                    onClick={clearLogs}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded-md hover:bg-destructive/5"
                  >
                    <ListRestart size={14} />
                    Clear History
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2 bg-muted/5">
                  {auditLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-muted-foreground/40">
                      <ScrollText size={32} className="mb-2 opacity-20" />
                      <p className="text-sm">No activity logs recorded yet.</p>
                    </div>
                  ) : (
                    auditLogs.map(log => (
                      <div key={log.id} className="group p-3 rounded-lg border border-border/30 bg-background/50 flex gap-4 text-[11px] font-mono leading-relaxed transition-all hover:border-primary/20 hover:bg-background shadow-sm">
                        <div className="text-muted-foreground/60 w-16 shrink-0 pt-0.5">{log.timestamp}</div>
                        <div className="flex-1 flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${log.status === 'success' ? 'bg-green-500/10 text-green-600' :
                                log.status === 'error' ? 'bg-red-500/10 text-red-600' :
                                  'bg-blue-500/10 text-blue-600'
                              }`}>
                              {log.action}
                            </span>
                            <span className="text-muted-foreground/40 group-hover:opacity-100 opacity-0 transition-opacity">ID: {log.id}</span>
                          </div>
                          <div className="text-foreground/80">{log.message}</div>
                          {log.metadata && (
                            <details className="mt-1">
                              <summary className="text-[9px] cursor-pointer text-primary/60 hover:text-primary">View Metadata</summary>
                              <pre className="mt-2 p-2 rounded bg-muted/50 border border-border/20 overflow-x-auto text-[9px]">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardPanel>
  );
};
