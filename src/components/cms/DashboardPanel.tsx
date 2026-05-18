import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, ChevronUp, Minimize2, Maximize2, ShieldCheck, ShieldAlert, Undo2, Redo2, Github, RefreshCw } from 'lucide-react';

interface DashboardPanelProps {
  children: React.ReactNode;
  isMinimized: boolean;
  setIsMinimized: React.Dispatch<React.SetStateAction<boolean>>;
  activeTab: 'portfolio' | 'projects' | 'blog' | 'settings' | 'history' | 'logs';
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  safeMode: boolean;
  setSafeMode: (val: boolean) => void;
  previewMode: boolean;
  setPreviewMode: (val: boolean) => void;
  syncStatus: { icon: string; label: string; color: string };
  adminLabel: string | null;
  isSuperAdmin: boolean;
  auditLogs: { status: string }[];
}

const DEFAULT_W = 750;
const DEFAULT_H = 600;

export const DashboardPanel: React.FC<DashboardPanelProps> = ({
  children,
  isMinimized,
  setIsMinimized,
  activeTab,
  canUndo,
  canRedo,
  undo,
  redo,
  safeMode,
  setSafeMode,
  previewMode,
  setPreviewMode,
  syncStatus,
  adminLabel,
  isSuperAdmin,
  auditLogs
}) => {
  const [isMaximized, setIsMaximized] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem('cms-maximized') === 'true';
    return false;
  });

  const [showLimitReport, setShowLimitReport] = useState(false);
  const [limitData, setLimitData] = useState<any>(null);
  const [loadingLimit, setLoadingLimit] = useState(false);
  const [limitError, setLimitError] = useState("");

  const fetchLimitData = async () => {
    setLoadingLimit(true);
    setLimitError("");
    try {
      const res = await fetch("/api/github-limit");
      const result = await res.json();
      if (result.success) {
        setLimitData(result.data);
      } else {
        setLimitError(result.error || "Failed to fetch");
      }
    } catch (e: any) {
      setLimitError(e.message || "Network Error");
    } finally {
      setLoadingLimit(false);
    }
  };

  const handleLimitClick = () => {
    if (!showLimitReport) {
      fetchLimitData();
    }
    setShowLimitReport(!showLimitReport);
  };

  const [dimensions, setDimensions] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem('cms-dimensions');
      return saved ? JSON.parse(saved) : { w: DEFAULT_W, h: DEFAULT_H };
    }
    return { w: DEFAULT_W, h: DEFAULT_H };
  });

  const panelRef = useRef<HTMLDivElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const geom = useRef({ x: 100, y: 100, w: DEFAULT_W, h: DEFAULT_H });
  const startPos = useRef({ x: 0, y: 0, panelX: 0, panelY: 0, panelW: 0, panelH: 0, mode: '' });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsMaximized(true);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const updatePanelDOM = useCallback(() => {
    if (panelRef.current && !isMaximized && !isMobile) {
      panelRef.current.style.transform = `translate3d(${geom.current.x}px, ${geom.current.y}px, 0)`;
      panelRef.current.style.width = `${geom.current.w}px`;
      panelRef.current.style.height = `${geom.current.h}px`;
      localStorage.setItem('cms-geometry', JSON.stringify(geom.current));
    }
  }, [isMaximized, isMobile]);

  // Set default starting point on screen center
  useEffect(() => {
    if (typeof window !== "undefined" && !isMobile) {
      const savedGeom = localStorage.getItem('cms-geometry');
      if (savedGeom) {
        try {
          geom.current = JSON.parse(savedGeom);
        } catch {
          geom.current = {
            x: (window.innerWidth - dimensions.w) / 2,
            y: (window.innerHeight - dimensions.h) / 2,
            w: dimensions.w,
            h: dimensions.h
          };
        }
      } else {
        geom.current = {
          x: (window.innerWidth - dimensions.w) / 2,
          y: (window.innerHeight - dimensions.h) / 2,
          w: dimensions.w,
          h: dimensions.h
        };
      }
      updatePanelDOM();
    }
  }, [isMobile, dimensions, updatePanelDOM]);

  useEffect(() => {
    localStorage.setItem('cms-maximized', String(isMaximized));
  }, [isMaximized]);

  useEffect(() => {
    localStorage.setItem('cms-dimensions', JSON.stringify(dimensions));
  }, [dimensions]);

  // Two-Finger Touch (Touchscreen/Tablet) & Two-Finger Swipe (Trackpad) translation listener
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const touchStartPos = { active: false, x: 0, y: 0, panelX: 0, panelY: 0 };

    const handleTouchStartRaw = (e: TouchEvent) => {
      if (isMaximized || isMobile) return;
      if (e.touches.length === 2) {
        touchStartPos.active = true;
        touchStartPos.x = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        touchStartPos.y = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        touchStartPos.panelX = geom.current.x;
        touchStartPos.panelY = geom.current.y;
        e.preventDefault(); // prevent zoom/scroll gesture triggering on page
      }
    };

    const handleTouchMoveRaw = (e: TouchEvent) => {
      if (!touchStartPos.active || e.touches.length !== 2) return;
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      
      const deltaX = midX - touchStartPos.x;
      const deltaY = midY - touchStartPos.y;

      geom.current.x = touchStartPos.panelX + deltaX;
      geom.current.y = touchStartPos.panelY + deltaY;

      updatePanelDOM();
      e.preventDefault();
    };

    const handleTouchEndRaw = () => {
      touchStartPos.active = false;
    };

    // Trackpad swipe handler on header
    const header = panel.querySelector('.cursor-grab');
    const handleWheelRaw = (e: WheelEvent) => {
      if (isMaximized || isMobile) return;
      
      // Prevent default page scroll
      e.preventDefault();
      
      // Accumulate position changes with damping ease
      geom.current.x += e.deltaX * 0.85;
      geom.current.y += e.deltaY * 0.85;
      
      updatePanelDOM();
    };

    panel.addEventListener('touchstart', handleTouchStartRaw, { passive: false });
    panel.addEventListener('touchmove', handleTouchMoveRaw, { passive: false });
    panel.addEventListener('touchend', handleTouchEndRaw);
    
    if (header) {
      header.addEventListener('wheel', handleWheelRaw, { passive: false });
    }

    return () => {
      panel.removeEventListener('touchstart', handleTouchStartRaw);
      panel.removeEventListener('touchmove', handleTouchMoveRaw);
      panel.removeEventListener('touchend', handleTouchEndRaw);
      if (header) {
        header.removeEventListener('wheel', handleWheelRaw);
      }
    };
  }, [isMaximized, isMobile, updatePanelDOM]);

  // Combined Pointer drag & resize capture handler
  const startDragOrResize = (e: React.PointerEvent<HTMLDivElement>, mode: 'drag' | 'right' | 'bottom' | 'corner') => {
    if (isMaximized || isMobile) return;
    
    // For header dragging, prevent if clicking inside action buttons or controls
    if (mode === 'drag') {
      const target = e.target as HTMLElement;
      if (target.closest('[data-no-drag]')) return;
    }

    e.preventDefault();
    setIsInteracting(true);
    
    startPos.current = {
      x: e.clientX,
      y: e.clientY,
      panelX: geom.current.x,
      panelY: geom.current.y,
      panelW: geom.current.w,
      panelH: geom.current.h,
      mode
    };
    
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isInteracting) return;
    const deltaX = e.clientX - startPos.current.x;
    const deltaY = e.clientY - startPos.current.y;
    
    if (startPos.current.mode === 'drag') {
      geom.current.x = startPos.current.panelX + deltaX;
      geom.current.y = startPos.current.panelY + deltaY;
    } else {
      if (startPos.current.mode === 'right' || startPos.current.mode === 'corner') {
        geom.current.w = Math.max(360, startPos.current.panelW + deltaX);
      }
      if (startPos.current.mode === 'bottom' || startPos.current.mode === 'corner') {
        geom.current.h = Math.max(300, startPos.current.panelH + deltaY);
      }
    }
    
    updatePanelDOM();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isInteracting) return;
    setIsInteracting(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    setDimensions({ w: geom.current.w, h: geom.current.h });
  };

  const containerStyle = isMaximized || isMobile
    ? { 
        position: "fixed" as const, 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        zIndex: 90, 
        width: '100vw', 
        height: '100vh',
        backfaceVisibility: 'hidden' as const
      } 
    : { 
        position: "fixed" as const, 
        zIndex: 90, 
        width: geom.current.w,
        height: geom.current.h,
        transform: `translate3d(${geom.current.x}px, ${geom.current.y}px, 0)`,
        willChange: 'transform, width, height',
        backfaceVisibility: 'hidden' as const
      };

  return (
    <div
      ref={panelRef}
      style={containerStyle}
      className={`no-text-effect glass-card ${isMaximized || isMobile ? 'rounded-2xl' : 'rounded-2xl shadow-2xl border border-primary/20'} flex flex-col overflow-hidden bg-background/95 backdrop-blur-3xl ${!isInteracting ? 'transition-all duration-300' : ''} ${isMinimized ? '!h-12 !w-80' : ''}`}
    >
      {/* HEADER WITH DRAG AND POINTER EVENTS */}
      <div 
        onPointerDown={(e) => startDragOrResize(e, 'drag')}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`flex items-center justify-between px-4 py-3 border-b border-border/30 bg-primary/10 ${isMobile ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'} shrink-0 select-none`}
      >
        <div className="flex items-center gap-2 pointer-events-none min-w-0">
           <span className="text-sm font-bold shrink-0">CRM Matrix</span>
           {!isMinimized && adminLabel && (
             <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter flex items-center gap-1 shrink-0 ${isSuperAdmin ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-blue-500/15 text-blue-400 border border-blue-500/20'}`}>
               {adminLabel}
             </span>
           )}
           {!isMinimized && !isMobile && (
             <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter flex items-center gap-1.5 shrink-0 ${syncStatus.color}`}>
               <span>{syncStatus.icon}</span>
               <span>{syncStatus.label}</span>
             </div>
           )}
        </div>
        <div data-no-drag className="flex items-center gap-2 shrink-0">
            {!isMinimized && (
              <button
                onClick={handleLimitClick}
                className={`px-2 py-1 flex items-center gap-1.5 text-[10px] font-bold rounded uppercase transition-all shrink-0 ${showLimitReport ? 'bg-primary/20 text-primary border border-primary/30 shadow-sm' : 'bg-muted hover:bg-muted/80 text-muted-foreground border border-border/10'}`}
                title="View GitHub API rate limit status"
              >
                <Github size={11} />
                <span>Limit Report</span>
              </button>
            )}
            {!isMinimized && (
              <>
               {/* Undo / Redo Buttons */}
               <div className="flex items-center gap-1 bg-muted/30 p-0.5 rounded-lg border border-border/10 shrink-0">
                 <button
                   onClick={undo}
                   disabled={!canUndo}
                   title="Undo Last Change (Ctrl+Z)"
                   className="p-1 hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent rounded text-muted-foreground hover:text-foreground transition-all flex items-center justify-center shrink-0"
                 >
                   <Undo2 size={13} />
                 </button>
                 <button
                   onClick={redo}
                   disabled={!canRedo}
                   title="Redo Reverted Change (Ctrl+Y)"
                   className="p-1 hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent rounded text-muted-foreground hover:text-foreground transition-all flex items-center justify-center shrink-0"
                 >
                   <Redo2 size={13} />
                 </button>
               </div>
               <div className="hidden sm:block w-px h-4 bg-border mx-0.5 animate-in fade-in" />
               <button 
                 onClick={() => setSafeMode(!safeMode)} 
                 className={`hidden sm:flex px-2 py-1 items-center gap-1 text-[10px] font-bold rounded uppercase transition-colors ${safeMode ? 'bg-amber-500/20 text-amber-500' : 'bg-muted text-muted-foreground'}`}
               >
                 {safeMode ? <ShieldCheck size={12}/> : <ShieldAlert size={12}/>} 
                 Safe Mode
               </button>
               <label className="flex items-center gap-1.5 cursor-pointer text-[10px] uppercase font-bold text-muted-foreground ml-2">
                 Preview
                 <input type="checkbox" checked={previewMode} onChange={e => setPreviewMode(e.target.checked)} className="accent-primary" />
               </label>
               <div className="hidden sm:block w-px h-4 bg-border mx-1" />
               <button onClick={() => setIsMaximized(!isMaximized)} className="hidden md:block p-1 hover:bg-muted rounded text-muted-foreground transition-colors">
                 {isMaximized ? <Minimize2 size={14}/> : <Maximize2 size={14} />}
               </button>
             </>
           )}
           <button 
             onClick={() => setIsMinimized(m => !m)} 
             title={isMinimized ? 'Restore Panel' : 'Minimize Panel'}
             className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold transition-all ${
               isMinimized 
                 ? 'bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30 animate-pulse' 
                 : 'hover:bg-muted text-muted-foreground'
             }`}
           >
             {isMinimized ? <><ChevronUp size={13}/> Restore</> : <ChevronDown size={14}/>}
           </button>
        </div>
      </div>

      {/* GITHUB RATE LIMIT POPUP REPORT */}
      {showLimitReport && !isMinimized && (
        <div className="absolute right-4 top-12 z-50 w-72 glass-card bg-background/95 border border-primary/30 p-4 rounded-xl shadow-2xl animate-in slide-in-from-top-2 duration-200" data-no-drag>
          <div className="flex items-center justify-between mb-3 pb-1.5 border-b border-border/30">
            <span className="text-xs font-bold flex items-center gap-1.5"><Github size={14} className="text-primary"/> GitHub Limit Report</span>
            <button onClick={() => setShowLimitReport(false)} className="text-[10px] text-muted-foreground hover:text-foreground">Close</button>
          </div>
          {loadingLimit ? (
            <div className="flex items-center justify-center py-6 gap-2 text-xs text-muted-foreground">
              <RefreshCw size={14} className="animate-spin text-primary" /> Loading limits...
            </div>
          ) : limitError ? (
            <div className="text-[10px] text-destructive bg-destructive/10 p-2.5 rounded-lg border border-destructive/20 leading-normal">
              ⚠️ {limitError}
            </div>
          ) : limitData ? (
            <div className="space-y-3 text-[11px]">
              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span>Core API (Commits/Saves)</span>
                  <span className={limitData.resources.core.remaining < 100 ? "text-red-400" : "text-emerald-400"}>
                    {limitData.resources.core.remaining} / {limitData.resources.core.limit}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-primary h-1.5 transition-all duration-500" 
                    style={{ width: `${(limitData.resources.core.remaining / limitData.resources.core.limit) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span>Search API</span>
                  <span>{limitData.resources.search.remaining} / {limitData.resources.search.limit}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-secondary h-1.5 transition-all duration-500" 
                    style={{ width: `${(limitData.resources.search.remaining / limitData.resources.search.limit) * 100}%` }}
                  />
                </div>
              </div>
              <div className="pt-2 border-t border-border/10 flex justify-between text-[9px] text-muted-foreground">
                <span>Reset: {new Date(limitData.resources.core.reset * 1000).toLocaleTimeString()}</span>
                <button onClick={fetchLimitData} className="text-primary hover:underline flex items-center gap-1 font-bold">
                  <RefreshCw size={8} /> Refresh
                </button>
              </div>
            </div>
          ) : (
            <div className="text-[10px] text-muted-foreground italic text-center py-2">No data. Click refresh.</div>
          )}
        </div>
      )}

      {/* DASHBOARD CONTENT BODY */}
      <div className={`flex-1 flex overflow-hidden relative ${isInteracting ? 'pointer-events-none' : ''}`}>
        {children}
      </div>

      {/* DRAG & RESIZE BORDERS WITH VALID POINTER EVENTS */}
      {!isMaximized && !isMinimized && (
        <>
          {/* Right Edge Resizer */}
          <div 
            onPointerDown={(e) => startDragOrResize(e, 'right')}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="absolute top-0 bottom-6 right-0 w-3 cursor-ew-resize z-[99]"
          />
          
          {/* Bottom Edge Resizer */}
          <div 
            onPointerDown={(e) => startDragOrResize(e, 'bottom')}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="absolute bottom-0 left-0 right-6 h-3 cursor-ns-resize z-[99]"
          />

          {/* Corner Resizer */}
          <div 
            onPointerDown={(e) => startDragOrResize(e, 'corner')}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="absolute bottom-0 right-0 w-8 h-8 cursor-nwse-resize z-[100] flex items-end justify-end p-1.5 group select-none"
          >
             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary/50 group-hover:text-primary transition-colors">
               <polyline points="21 15 21 21 15 21"></polyline>
               <line x1="21" y1="21" x2="15" y2="15"></line>
             </svg>
          </div>
        </>
      )}
    </div>
  );
};
