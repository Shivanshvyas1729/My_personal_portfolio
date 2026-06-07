import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { getKnowledge } from "@/data/knowledge";
import { KnowledgeDefinition } from "@/data/knowledge/categories";
import { Info, HelpCircle, AlertCircle, BookOpen, ExternalLink, Lightbulb, CheckCircle2, GraduationCap, Link2, Target } from "lucide-react";
import { createPortal } from "react-dom";

interface KnowledgeTooltipProps {
  term: string;
  overrides?: Partial<KnowledgeDefinition>;
  isTargetVariable?: boolean;
}

export const KnowledgeTooltip: React.FC<KnowledgeTooltipProps> = ({ term, overrides, isTargetVariable }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [hasPositioned, setHasPositioned] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  // Fetch from global knowledge base (O(1))
  const globalKnowledge = getKnowledge(term);

  // Special Target Variable Rule
  if (isTargetVariable) {
    if (!overrides?.definition && !overrides?.real_world_example && !overrides?.why_used) {
      // If project context is missing, only show generic definition, no tooltip
      return <span>{term}</span>;
    }
  }

  // If no knowledge and no overrides exist, just render normal text
  if (!globalKnowledge && !overrides && !isTargetVariable) {
    return <span>{term}</span>;
  }

  // Merge knowledge intelligently
  const knowledge = { ...globalKnowledge, ...overrides } as KnowledgeDefinition;

  // Handle positioning and mobile detection
  const updatePosition = useCallback(() => {
    setIsMobile(window.innerWidth < 768);
    
    if (isOpen && !isMobile && !hasPositioned) {
      const tooltipWidth = Math.min(900, window.innerWidth - 32); 
      // Approximate height to center it nicely
      const tooltipHeight = 500; 
      
      let newTop = (window.innerHeight - tooltipHeight) / 2;
      let newLeft = (window.innerWidth - tooltipWidth) / 2;

      // Ensure it doesn't go off screen
      if (newTop < 16) newTop = 16;
      if (newLeft < 16) newLeft = 16;

      setPosition({ top: newTop, left: newLeft });
      setHasPositioned(true);
    }
  }, [isOpen, isMobile, hasPositioned]);

  useEffect(() => {
    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("resize", updatePosition);
    };
  }, [updatePosition]);

  useEffect(() => {
    if (!isOpen) setHasPositioned(false);
  }, [isOpen]);

  // Accessibility (ESC to close, Click outside to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen && 
        tooltipRef.current && 
        !tooltipRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsOpen(!isOpen);
  };

  const content = (
    <div className="space-y-4 text-left">
      {/* Definition */}
      <div className="space-y-1.5">
        <p className="text-[14px] leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">Definition: </span> 
          {knowledge.definition || (isTargetVariable ? "The output variable predicted by the model." : "No definition provided.")}
        </p>
        {overrides && Object.keys(overrides).length > 0 && !isTargetVariable && (
          <div className="flex items-center gap-1.5 text-[11px] text-amber-500 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-md mt-2 w-fit">
            <AlertCircle size={12} /> 
            Project-Specific Context Active
          </div>
        )}
      </div>

      {/* Target Variable Special Context */}
      {isTargetVariable && overrides?.definition && (
        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Target size={14} className="text-primary" />
            <h5 className="text-[12px] font-bold tracking-wider text-primary">Project Context</h5>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{overrides.definition}</p>
        </div>
      )}

      {/* Real World Example */}
      {knowledge.real_world_example && (
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-center gap-1.5 mb-1.5">
            <BookOpen size={14} className="text-blue-500" />
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-blue-500">Real World Example</h5>
          </div>
          <p className="text-[13px] text-foreground leading-relaxed">{knowledge.real_world_example}</p>
        </div>
      )}

      {/* Why Used */}
      {knowledge.why_used && (
        <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Lightbulb size={14} className="text-yellow-500" />
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-foreground">Why Used</h5>
          </div>
          <p className="text-[13px] text-muted-foreground leading-relaxed">{knowledge.why_used}</p>
        </div>
      )}

      {/* Interview Point */}
      {knowledge.interview_point && (
        <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
          <div className="flex items-center gap-1.5 mb-1.5">
            <HelpCircle size={14} className="text-primary" />
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-primary">Interview Point</h5>
          </div>
          <p className="text-[13px] text-muted-foreground leading-relaxed">{knowledge.interview_point}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Advantages */}
        {knowledge.advantages && knowledge.advantages.length > 0 && (
          <div className="space-y-1.5">
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
              <CheckCircle2 size={14} /> Advantages
            </h5>
            <ul className="text-[12px] text-muted-foreground space-y-1 list-disc pl-5">
              {knowledge.advantages.map((adv, i) => <li key={i}>{adv}</li>)}
            </ul>
          </div>
        )}
        
        {/* Limitations */}
        {knowledge.limitations && knowledge.limitations.length > 0 && (
          <div className="space-y-1.5">
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-destructive flex items-center gap-1.5">
              <AlertCircle size={14} /> Limitations
            </h5>
            <ul className="text-[12px] text-muted-foreground space-y-1 list-disc pl-5">
              {knowledge.limitations.map((lim, i) => <li key={i}>{lim}</li>)}
            </ul>
          </div>
        )}
      </div>

      {/* Formula / Good Value */}
      {(knowledge.formula || knowledge.good_value) && (
        <div className="flex flex-col sm:flex-row gap-4 p-3 rounded-xl bg-muted/40 border border-border/50">
          {knowledge.formula && (
            <div className="flex-1">
              <span className="block text-[11px] font-bold uppercase text-muted-foreground mb-1">Formula</span>
              <span className="text-[13px] font-mono text-primary/80 bg-primary/10 px-2 py-1 rounded">{knowledge.formula}</span>
            </div>
          )}
          {knowledge.good_value && (
            <div>
              <span className="block text-[11px] font-bold uppercase text-muted-foreground mb-1">Good Value</span>
              <span className="text-[13px] font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">{knowledge.good_value}</span>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Use Cases */}
        {knowledge.use_cases && knowledge.use_cases.length > 0 && (
          <div>
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <ExternalLink size={14} /> Common Use Cases
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {knowledge.use_cases.map((uc, i) => (
                <span key={i} className="text-[11px] bg-secondary text-secondary-foreground border border-border/50 px-2 py-0.5 rounded-full">
                  {uc}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Related Terms */}
        {knowledge.related_terms && knowledge.related_terms.length > 0 && (
          <div>
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <Link2 size={14} /> Related Terms
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {knowledge.related_terms.map((rt, i) => (
                <span key={i} className="text-[11px] bg-muted/50 text-muted-foreground border border-border/50 px-2 py-0.5 rounded-full cursor-help hover:text-primary transition-colors">
                  {rt}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const tooltipModal = isOpen ? createPortal(
    <AnimatePresence>
      <motion.div
        ref={tooltipRef}
        initial={isMobile ? { opacity: 0, y: "100%" } : { opacity: 0, y: 10, scale: 0.95 }}
        animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, y: 0, scale: 1 }}
        exit={isMobile ? { opacity: 0, y: "100%" } : { opacity: 0, y: 5, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        style={isMobile ? {
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 99999,
          maxHeight: '90vh'
        } : {
          position: 'fixed',
          top: position.top,
          left: position.left,
          zIndex: 99999,
          width: 'min(900px, calc(100vw - 32px))',
          minWidth: '300px',
          minHeight: '200px',
          resize: 'both',
          overflow: 'hidden'
        }}
        className={`glass-card bg-background/95 backdrop-blur-xl border border-primary/20 shadow-2xl flex flex-col pointer-events-auto ${
          isMobile ? 'rounded-t-3xl border-b-0 pb-safe' : 'rounded-2xl'
        }`}
        drag={!isMobile}
        dragControls={dragControls}
        dragListener={false}
        dragMomentum={false}
        // Prevent event propagation so clicking inside doesn't close
        onMouseDown={e => e.stopPropagation()}
        onWheel={e => e.stopPropagation()}
      >
        {isMobile && (
          <div className="w-12 h-1.5 bg-muted/50 rounded-full mx-auto mt-3 mb-1" />
        )}
        
        {/* Header */}
        <div 
          className="bg-primary/5 border-b border-primary/10 px-5 py-4 flex flex-wrap gap-3 items-center justify-between shrink-0 select-none cursor-move"
          onPointerDown={(e) => {
            if (!isMobile) {
              dragControls.start(e);
            }
          }}
        >
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-primary" />
            <h4 className="font-bold text-base md:text-lg text-foreground">{knowledge.title || term}</h4>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {knowledge.difficulty_level && (
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-0.5 rounded-full border border-border/50 bg-muted/30">
                <GraduationCap size={12} /> {knowledge.difficulty_level}
              </span>
            )}
            {knowledge.term_type && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 px-2 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/10">
                {knowledge.term_type}
              </span>
            )}
            {knowledge.primary_category && (
              <span className="px-2 py-0.5 rounded border border-primary/20 bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-wider">
                {knowledge.primary_category}
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div 
          className="p-5 overflow-y-auto scrollbar-thin flex-1 overscroll-contain" 
          style={{ maxHeight: isMobile ? 'calc(90vh - 80px)' : '60vh' }}
        >
          {content}
        </div>
      </motion.div>
      
      {/* Mobile Backdrop overlay */}
      {isMobile && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[99998]"
        />
      )}
    </AnimatePresence>,
    document.body
  ) : null;

  return (
    <>
      <span className="no-text-effect inline-flex items-center">
        <span className="text-left relative z-10 px-0.5 rounded-[2px] font-medium" style={{ textShadow: 'none' }}>
          {term}
        </span>
        <button 
          className="relative inline-flex items-center group cursor-pointer appearance-none bg-transparent border-none p-0 m-0 ml-1 text-inherit focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full z-10"
          onClick={handleToggle}
          ref={triggerRef}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          title="View details"
        >
          <Info size={14} className="text-muted-foreground/60 hover:text-primary transition-colors shrink-0 relative z-10" />
        </button>
      </span>
      {tooltipModal}
    </>
  );
};
