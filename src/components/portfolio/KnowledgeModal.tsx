import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Database, BookOpen, Brain, Terminal, ChevronRight, HelpCircle, GraduationCap, Code2, Layers, CheckCircle2, X, Info, Link2, ExternalLink } from "lucide-react";
import { allDefinitions } from "@/data/knowledge/index";
import { KnowledgeDefinition } from "@/data/knowledge/categories";
import { KnowledgeTooltip } from "./KnowledgeTooltip";

interface KnowledgeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Group definitions by category
const categoriesWithCounts = Array.from(
  new Set(allDefinitions.map((d) => d.primary_category).filter(Boolean))
).map((catName) => {
  const count = allDefinitions.filter((d) => d.primary_category === catName).length;
  return { name: catName as string, count };
}).sort((a, b) => b.count - a.count);

export function KnowledgeModal({ isOpen, onClose }: KnowledgeModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<KnowledgeDefinition | null>(null);
  const [rightPanelWidth, setRightPanelWidth] = useState(420);
  const [isResizing, setIsResizing] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const startResizing = (mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizing(true);

    const startWidth = rightPanelWidth;
    const startX = mouseDownEvent.clientX;

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const doDrag = (mouseMoveEvent: MouseEvent) => {
      const diffX = mouseMoveEvent.clientX - startX;
      const newWidth = Math.max(300, Math.min(800, startWidth - diffX));
      setRightPanelWidth(newWidth);
    };

    const stopDrag = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener("mousemove", doDrag);
      window.removeEventListener("mouseup", stopDrag);
    };

    window.addEventListener("mousemove", doDrag);
    window.addEventListener("mouseup", stopDrag);
  };

  // Search logic
  const filteredDefinitions = (allDefinitions as KnowledgeDefinition[]).filter((def) => {
    if (!def.title || !def.definition) return false;

    // Filter by category if one is selected
    if (selectedCategory && def.primary_category !== selectedCategory) return false;

    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      def.title.toLowerCase().includes(query) ||
      def.id.toLowerCase().includes(query) ||
      def.definition.toLowerCase().includes(query) ||
      def.aliases?.some((alias) => alias.toLowerCase().includes(query)) ||
      def.secondary_tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  const getDifficultyColor = (level?: string) => {
    switch (level) {
      case "Beginner":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "Intermediate":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "Advanced":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };

  const renderFormattedText = (text?: string) => {
    if (!text) return null;
    
    // Check if it is a code block (delimited by ```)
    if (text.includes("```")) {
      const parts = text.split("```");
      return (
        <div className="space-y-3 my-2 text-xs">
          {parts.map((part, index) => {
            if (index % 2 === 1) {
              // Code block
              const lines = part.split("\n");
              // Skip first line if it represents code language
              const codeLines = ["python", "javascript", "typescript", "json", "html", "css", "bash", "pytorch"].includes(lines[0].trim().toLowerCase())
                ? lines.slice(1)
                : lines;
              return (
                <pre key={index} className="text-[11px] font-mono text-primary bg-background/80 border border-primary/20 rounded-xl p-4 shadow-sm overflow-x-auto leading-relaxed whitespace-pre select-all">
                  <code>{codeLines.join("\n").trim()}</code>
                </pre>
              );
            }
            // Normal text
            if (!part.trim()) return null;
            return (
              <p key={index} className="leading-relaxed text-muted-foreground whitespace-pre-line">
                {part.trim()}
              </p>
            );
          })}
        </div>
      );
    }

    // Standard text - check for custom quotes, strip outer double-quotes, replace literal newlines
    let processedText = text.trim();
    if (processedText.startsWith('"') && processedText.endsWith('"')) {
      processedText = processedText.slice(1, -1).trim();
    }
    
    return (
      <p className="leading-relaxed text-muted-foreground whitespace-pre-line">
        {processedText}
      </p>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="no-text-effect w-screen h-screen max-w-none max-h-none p-0 overflow-hidden flex flex-col gap-0 border-none bg-background">
        <DialogHeader className="p-5 border-b border-border/40 shrink-0 bg-muted/5">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <DialogTitle className="text-lg font-bold">Tech Stack Knowledge Matrix</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-0.5">
            An interactive educational glossary of machine learning, systems architecture, and software concepts powering this portfolio.
          </DialogDescription>
        </DialogHeader>

        {/* Outer Workspace Grid */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
          {/* Left Panel: Categories Sidebar */}
          <div className="w-full md:w-[220px] border-b md:border-b-0 md:border-r border-border/30 shrink-0 overflow-y-auto p-3 flex flex-row md:flex-col gap-1.5 scrollbar-none bg-muted/5">
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSelectedTerm(null);
              }}
              className={`px-3 py-1.5 md:py-2 text-xs font-semibold rounded-lg text-left transition-colors whitespace-nowrap md:whitespace-normal flex items-center justify-between gap-2 ${
                selectedCategory === null
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>All Concepts</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedCategory === null ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted-foreground/10 text-muted-foreground'}`}>{allDefinitions.length}</span>
            </button>
            {categoriesWithCounts.map((cat) => (
              <button
                key={cat.name}
                onClick={() => {
                  setSelectedCategory(cat.name);
                  setSelectedTerm(null);
                }}
                className={`px-3 py-1.5 md:py-2 text-xs font-semibold rounded-lg text-left transition-colors whitespace-nowrap md:whitespace-normal flex items-center justify-between gap-2 ${
                  selectedCategory === cat.name
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span className="truncate">{cat.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedCategory === cat.name ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted-foreground/10 text-muted-foreground'}`}>{cat.count}</span>
              </button>
            ))}
          </div>

          {/* Middle Panel: Scrollable list of concept cards */}
          <div className={`flex-1 min-h-0 flex flex-col ${selectedTerm ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-3 border-b border-border/30 bg-muted/5 flex items-center gap-2 shrink-0">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search terms, formulas, or tags..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedTerm(null);
                  }}
                  className="pl-8 bg-muted/30 border-border/40 text-xs h-9 focus-visible:ring-primary"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredDefinitions.map((def) => (
                <button
                  key={def.id}
                  onClick={() => setSelectedTerm(def)}
                  className={`w-full text-left p-3.5 rounded-xl border border-border/30 transition-all hover:border-primary/30 flex flex-col hover:bg-muted/10 group ${
                    selectedTerm?.id === def.id
                      ? "border-primary/40 bg-primary/5 shadow-sm"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 w-full mb-1">
                    <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                      {def.title}
                    </h4>
                    <ChevronRight size={14} className="text-muted-foreground opacity-60 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-xs text-muted-foreground/90 line-clamp-2 leading-relaxed mb-3">
                    {def.definition}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[9px] font-mono bg-muted/60 px-1.5 py-0.5 rounded text-muted-foreground/80 border border-border/30">
                      {def.id}
                    </span>
                    {def.difficulty_level && (
                      <span className={`text-[9px] font-semibold border px-1.5 py-0.5 rounded-full ${getDifficultyColor(def.difficulty_level)}`}>
                        {def.difficulty_level}
                      </span>
                    )}
                    {def.term_type && (
                      <span className="text-[9px] font-semibold bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground">
                        {def.term_type}
                      </span>
                    )}
                  </div>
                </button>
              ))}

              {filteredDefinitions.length === 0 && (
                <div className="text-center py-16 text-muted-foreground border border-dashed border-border/35 rounded-xl bg-muted/5">
                  <Database className="mx-auto w-8 h-8 text-muted-foreground/35 mb-2.5 animate-pulse" />
                  <p className="font-medium text-sm text-foreground/80">No concepts found</p>
                  <p className="text-xs mt-1 text-muted-foreground/60">Try searching for another keyword or select all categories.</p>
                </div>
              )}
            </div>
          </div>

          {/* Resizable Divider */}
          {selectedTerm && (
            <div
              className={`hidden md:block w-1 hover:w-1.5 bg-border/40 hover:bg-primary/60 cursor-col-resize transition-all duration-150 relative select-none shrink-0 ${
                isResizing ? 'bg-primary/80 w-1.5' : ''
              }`}
              onMouseDown={startResizing}
            >
              {/* Visual grab handle indicator */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-8 rounded-full border border-border bg-background flex flex-col gap-0.5 items-center justify-center pointer-events-none opacity-80 shadow-sm">
                <span className="w-0.5 h-2 bg-muted-foreground/60 rounded-full" />
                <span className="w-0.5 h-2 bg-muted-foreground/60 rounded-full" />
              </div>
            </div>
          )}

          {/* Right Panel: Detailed view of selected concept */}
          <div 
            style={isDesktop ? { width: `${rightPanelWidth}px` } : {}}
            className={`w-full border-t md:border-t-0 md:border-l border-border/30 shrink-0 flex flex-col bg-muted/5 min-h-0 ${selectedTerm ? 'flex' : 'hidden md:flex items-center justify-center p-6 text-center'}`}
          >
            {selectedTerm ? (
              <div className="flex-1 flex flex-col min-h-0">
                {/* Detail Header */}
                <div className="p-4 border-b border-border/30 flex items-center justify-between shrink-0 bg-background/50">
                  <div>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-0.5">
                      {selectedTerm.primary_category}
                    </span>
                    <h3 className="font-bold text-base text-foreground leading-tight">
                      {selectedTerm.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <KnowledgeTooltip
                      term={selectedTerm.title}
                      overrides={selectedTerm}
                      triggerElement={
                        <button className="text-xs text-primary font-bold px-2.5 py-1.5 bg-primary/10 rounded-lg hover:bg-primary/20 transition-all flex items-center gap-1 select-none">
                          <Info size={12} /> More Info
                        </button>
                      }
                    />
                    <button 
                      onClick={() => setSelectedTerm(null)} 
                      className="md:hidden text-xs text-primary font-bold px-2.5 py-1.5 bg-primary/10 rounded-lg hover:bg-primary/20 transition-all"
                    >
                      Back to List
                    </button>
                  </div>
                </div>
 
                {/* Detail Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5 select-text">
                  {/* Definition */}
                  <div className="space-y-1.5">
                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                      <BookOpen size={11} className="text-primary" /> Core Definition
                    </h4>
                    <div className="text-xs leading-relaxed text-foreground bg-background/60 border border-border/20 rounded-xl p-3.5 shadow-sm">
                      {renderFormattedText(selectedTerm.definition)}
                    </div>
                  </div>
 
                  {/* Formula / Good Value */}
                  {(selectedTerm.formula || selectedTerm.good_value) && (
                    <div className="flex flex-col gap-3.5 p-4 rounded-xl bg-muted/40 border border-border/50 shadow-sm">
                      {selectedTerm.formula && (
                        <div className="flex-1">
                          <span className="block text-[9px] font-black uppercase text-muted-foreground/70 tracking-wider mb-1.5 select-none">Mathematical Formula</span>
                          <div className="flex items-center justify-center p-3 rounded-lg bg-primary/5 border border-primary/15 font-mono text-xs text-primary font-bold text-center leading-relaxed tracking-wide select-all shadow-inner overflow-x-auto min-h-[46px] scrollbar-thin">
                            {selectedTerm.formula}
                          </div>
                        </div>
                      )}
                      {selectedTerm.good_value && (
                        <div className="flex-1">
                          <span className="block text-[9px] font-black uppercase text-muted-foreground/70 tracking-wider mb-1.5 select-none">Ideal Range / Metric Goal</span>
                          <div className="flex items-center justify-center p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/15 font-bold text-xs text-emerald-500 text-center select-all shadow-inner min-h-[46px]">
                            {selectedTerm.good_value}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
 
                  {/* Why We Use It */}
                  {selectedTerm.why_used && (
                    <div className="space-y-1.5">
                      <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                        <Brain size={11} className="text-primary" /> Why is this used?
                      </h4>
                      <div className="bg-background/40 border border-border/10 rounded-xl p-3.5 shadow-sm">
                        {renderFormattedText(selectedTerm.why_used)}
                      </div>
                    </div>
                  )}
 
                  {/* Real-World Analogy */}
                  {selectedTerm.real_world_example && (
                    <div className="space-y-1.5">
                      <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                        <GraduationCap size={11} className="text-primary" /> Real-World Analogy
                      </h4>
                      <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 shadow-sm">
                        {renderFormattedText(selectedTerm.real_world_example)}
                      </div>
                    </div>
                  )}
 
                  {/* Interview Point */}
                  {selectedTerm.interview_point && (
                    <div className="space-y-1.5">
                      <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                        <HelpCircle size={11} className="text-primary" /> Interview Checklist
                      </h4>
                      <div className="text-xs leading-relaxed text-foreground bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 shadow-sm">
                        <strong className="text-amber-500 text-[10px] uppercase tracking-wider block mb-1">Key Takeaway:</strong>
                        {selectedTerm.interview_point}
                      </div>
                    </div>
                  )}
 
                  {/* Advantages & Limitations */}
                  {((selectedTerm.advantages && selectedTerm.advantages.length > 0) || 
                    (selectedTerm.limitations && selectedTerm.limitations.length > 0)) && (
                    <div className="grid grid-cols-1 gap-4 pt-1">
                      {selectedTerm.advantages && selectedTerm.advantages.length > 0 && (
                        <div className="space-y-1.5">
                          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                            <CheckCircle2 size={11} className="text-emerald-500" /> Key Strengths
                          </h4>
                          <ul className="list-disc pl-4 space-y-1 text-xs text-muted-foreground">
                            {selectedTerm.advantages.map((adv, idx) => (
                              <li key={idx}>{adv}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {selectedTerm.limitations && selectedTerm.limitations.length > 0 && (
                        <div className="space-y-1.5">
                          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                            <X size={11} className="text-rose-500" /> Drawbacks & Limits
                          </h4>
                          <ul className="list-disc pl-4 space-y-1 text-xs text-muted-foreground">
                            {selectedTerm.limitations.map((lim, idx) => (
                              <li key={idx}>{lim}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Use Cases */}
                  {selectedTerm.use_cases && selectedTerm.use_cases.length > 0 && (
                    <div className="space-y-1.5">
                      <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                        <ExternalLink size={11} className="text-primary" /> Common Use Cases
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedTerm.use_cases.map((uc, i) => (
                          <span key={i} className="text-[10px] bg-secondary text-secondary-foreground border border-border/40 px-2.5 py-1 rounded-full font-medium">
                            {uc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Related Terms */}
                  {selectedTerm.related_terms && selectedTerm.related_terms.length > 0 && (
                    <div className="space-y-1.5">
                      <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                        <Link2 size={11} className="text-primary" /> Related Terms
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedTerm.related_terms.map((rt, i) => (
                          <span key={i} className="text-[10px] bg-muted/60 text-muted-foreground border border-border/40 px-2.5 py-1 rounded-full font-medium">
                            {rt}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6 max-w-[280px]">
                <BookOpen size={36} className="mx-auto text-muted-foreground/20 mb-3" />
                <h4 className="font-bold text-foreground/80 text-sm mb-1">No Concept Selected</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Select any technical concept from the list to view its complete definition, formula sheet, and interview notes.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
