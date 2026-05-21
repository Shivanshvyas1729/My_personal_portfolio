import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Project } from "@/data/portfolioData";
import { convertToRawGitHubUrl } from "@/components/cms/FormHelpers";
import { Calendar, ExternalLink, Link as LinkIcon, BookOpen, Star, Lock, X, Play, ShieldAlert, HeartHandshake } from "lucide-react";

interface ProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

const springTransition = {
  type: "spring",
  stiffness: 110,
  damping: 18,
  mass: 0.75,
};

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    filter: "blur(10px)",
    transformPerspective: 1200,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    transition: springTransition,
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 10,
    filter: "blur(8px)",
    transition: {
      duration: 0.25,
    },
  },
};

export function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeMedia, setActiveMedia] = useState(0);

  useEffect(() => {
    if (project) {
      setActiveProject(project);
      setActiveMedia(0);
    }
  }, [project]);

  const hasMedia = activeProject?.media && activeProject.media.length > 0;

  return (
    <AnimatePresence mode="wait">
      {isOpen && activeProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 overflow-hidden">
          {/* Backdrop Layer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/60 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Container — Full Page Mode */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
            style={{
              willChange: "transform, opacity, filter",
              transform: "translate3d(0,0,0)",
            }}
            className="relative w-full h-full flex flex-col p-0 gap-0 bg-background/95 backdrop-blur-3xl z-10"
          >
            {/* Native App Style Top Title Bar Close Trigger */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 md:right-10 p-2.5 rounded-full bg-muted/40 hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all duration-300 z-50 cursor-pointer shadow-md border border-border/10 flex items-center justify-center"
              title="Close Full Screen View"
            >
              <X size={18} />
            </button>

            {/* Header Section */}
            <div className="flex-none p-6 md:p-12 md:px-16 lg:px-24 border-b border-border/40 bg-muted/20 pb-8 pr-20">
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {Array.isArray(activeProject.category) ? (
                  activeProject.category.map((cat, i) => (
                    <span key={i} className="text-xs font-semibold px-3 py-1.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                      {cat.trim()}
                    </span>
                  ))
                ) : (
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                    {activeProject.category}
                  </span>
                )}
                {activeProject.impact && (
                  <span className="text-xs font-medium px-3 py-1.5 rounded-md bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                    ⚡ {activeProject.impact}
                  </span>
                )}
              </div>

              <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground leading-tight text-left">
                {activeProject.title}
              </h2>

              <div className="flex flex-wrap gap-4 mt-6">
                {activeProject.github && (
                  <a
                    href={activeProject.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/40 hover:bg-muted/80 border border-border/50 text-sm font-medium transition-all duration-300"
                  >
                    GitHub Repository
                  </a>
                )}
                {activeProject.live && (
                  <a
                    href={activeProject.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all duration-300"
                  >
                    <ExternalLink size={14} /> Live Demo
                  </a>
                )}
              </div>
            </div>

            {/* Scrollable Body */}
            <div data-lenis-prevent="true" className="flex-1 overflow-y-auto p-6 md:p-12 md:px-16 lg:px-24 leading-relaxed scrollbar-thin">
              {/* Media Block & Overview Side-by-Side */}
              <div className={`grid gap-8 lg:gap-10 mb-10 ${hasMedia ? "lg:grid-cols-[1.2fr,1fr]" : ""}`}>
                {/* Media Gallery */}
                {hasMedia && (
                  <div className="space-y-4">
                    <div className="glass-card rounded-xl overflow-hidden aspect-video border border-border/40 relative">
                      {activeProject.media![activeMedia].type === "video" || (!activeProject.media![activeMedia].type && activeProject.media![activeMedia].url?.match(/\.(mp4|webm|ogg)$/i)) ? (
                        <video
                          src={convertToRawGitHubUrl(activeProject.media![activeMedia].url || '')}
                          controls
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={convertToRawGitHubUrl(activeProject.media![activeMedia].url || '')}
                          alt={activeProject.media![activeMedia].caption || activeProject.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    {activeProject.media![activeMedia].caption && (
                      <p className="text-xs text-muted-foreground text-center italic">{activeProject.media![activeMedia].caption}</p>
                    )}

                    {/* Thumbnails */}
                    {activeProject.media!.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {activeProject.media!.map((m, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveMedia(i)}
                            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                              i === activeMedia ? "border-primary scale-95" : "border-border/30 opacity-60 hover:opacity-100"
                            }`}
                          >
                            {m.type === "video" || (!m.type && m.url?.match(/\.(mp4|webm|ogg)$/i)) ? (
                              <div className="w-full h-full bg-muted flex items-center justify-center">
                                <Play size={14} className="text-primary" />
                              </div>
                            ) : (
                              <img src={convertToRawGitHubUrl(m.url || '')} alt="" className="w-full h-full object-cover" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Core Overview & Tech Stack */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs uppercase tracking-widest font-bold text-primary mb-2">Overview</h3>
                    <p className="text-muted-foreground text-base leading-relaxed">{activeProject.description}</p>
                  </div>

                  {activeProject.problem_statement && (
                    <div>
                      <h3 className="text-xs uppercase tracking-widest font-bold text-primary mb-2">Problem Statement</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{activeProject.problem_statement}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="text-xs uppercase tracking-widest font-bold text-primary mb-3">Core Tech Stack</h3>
                    <div className="flex flex-wrap gap-2">
                      {activeProject.tech.map((t) => (
                        <span key={t} className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs border border-border/40 font-medium">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Extra Details Sections */}
              <div className="space-y-8 mt-10">
                {/* Outcomes and Impact */}
                {activeProject.learning_outcomes && activeProject.learning_outcomes.length > 0 && (
                  <div className="glass-card p-6 border border-border/50 rounded-xl bg-muted/10">
                    <h3 className="text-lg font-heading font-semibold text-foreground mb-3">Key Learning Outcomes</h3>
                    <ul className="list-disc pl-5 text-muted-foreground space-y-1.5 text-sm">
                      {activeProject.learning_outcomes.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                )}

                {/* High-Level Architecture */}
                {(activeProject.architecture || activeProject.architectureImage) && (
                  <div className="glass-card p-6 border border-border/50 rounded-xl bg-muted/10">
                    <h3 className="text-lg font-heading font-semibold text-foreground mb-3">High-Level Architecture</h3>
                    {activeProject.architecture && (
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4">{activeProject.architecture}</p>
                    )}
                    {activeProject.architectureImage && (
                      <img 
                        src={convertToRawGitHubUrl(activeProject.architectureImage)} 
                        alt="High-level architectural workflow" 
                        className="w-full max-h-[50vh] object-contain rounded-xl border border-border/40 bg-background/50 p-2 mx-auto" 
                      />
                    )}
                  </div>
                )}

                {/* Core Parameters Matrices */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Objectives */}
                  {activeProject.objectives && activeProject.objectives.length > 0 && (
                    <div className="glass-card p-5 border border-border/40 rounded-xl bg-muted/10">
                      <h4 className="font-heading font-bold text-foreground mb-2 text-sm">Objectives & Scope</h4>
                      <ul className="list-disc pl-5 text-muted-foreground text-xs space-y-1">
                        {activeProject.objectives.map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                    </div>
                  )}

                  {/* Success Criteria */}
                  {activeProject.success_criteria && activeProject.success_criteria.length > 0 && (
                    <div className="glass-card p-5 border border-border/40 rounded-xl bg-muted/10">
                      <h4 className="font-heading font-bold text-foreground mb-2 text-sm">Success Criteria</h4>
                      <ul className="list-disc pl-5 text-muted-foreground text-xs space-y-1">
                        {activeProject.success_criteria.map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                    </div>
                  )}

                  {/* Data Sources */}
                  {activeProject.data_sources && activeProject.data_sources.length > 0 && (
                    <div className="glass-card p-5 border border-border/40 rounded-xl bg-muted/10">
                      <h4 className="font-heading font-bold text-foreground mb-2 text-sm">Data Sources</h4>
                      <ul className="list-disc pl-5 text-muted-foreground text-xs space-y-1">
                        {activeProject.data_sources.map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                    </div>
                  )}

                  {/* Preprocessing */}
                  {activeProject.preprocessing && activeProject.preprocessing.length > 0 && (
                    <div className="glass-card p-5 border border-border/40 rounded-xl bg-muted/10">
                      <h4 className="font-heading font-bold text-foreground mb-2 text-sm">Preprocessing Steps</h4>
                      <ul className="list-disc pl-5 text-muted-foreground text-xs space-y-1">
                        {activeProject.preprocessing.map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                    </div>
                  )}

                  {/* Explainability */}
                  {activeProject.explainability && (
                    <div className="glass-card p-5 border border-border/40 rounded-xl bg-muted/10 md:col-span-2">
                      <h4 className="font-heading font-bold text-foreground mb-2 text-sm">Explainability & Transparency</h4>
                      <p className="text-muted-foreground text-xs leading-relaxed">{activeProject.explainability}</p>
                    </div>
                  )}

                  {/* Risks */}
                  {activeProject.risks && activeProject.risks.length > 0 && (
                    <div className="glass-card p-5 border border-destructive/20 rounded-xl bg-destructive/5 md:col-span-2">
                      <h4 className="font-heading font-bold text-destructive mb-2 text-sm flex items-center gap-1.5">
                        <ShieldAlert size={14} /> Risks & Mitigation Strategy
                      </h4>
                      <ul className="list-disc pl-5 text-muted-foreground text-xs space-y-1">
                        {activeProject.risks.map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                    </div>
                  )}

                  {/* Ethics */}
                  {activeProject.ethics && activeProject.ethics.length > 0 && (
                    <div className="glass-card p-5 border border-primary/20 rounded-xl bg-primary/5 md:col-span-2">
                      <h4 className="font-heading font-bold text-primary mb-2 text-sm flex items-center gap-1.5">
                        <HeartHandshake size={14} /> Ethics & Privacy Framework
                      </h4>
                      <ul className="list-disc pl-5 text-muted-foreground text-xs space-y-1">
                        {activeProject.ethics.map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Resources list */}
                {activeProject.open_resources && activeProject.open_resources.length > 0 && (
                  <div className="mt-8 border-t border-border/50 pt-8">
                    <h3 className="text-lg font-heading font-semibold flex items-center gap-2 mb-4">
                      <BookOpen size={18} className="text-primary" /> Open Resources & Attachments
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {activeProject.open_resources.map((res: any, idx: number) => (
                        <a 
                          key={idx} 
                          href={res.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex justify-between items-center p-4 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted hover:border-primary/50 transition-all duration-300 group"
                        >
                          <span className="flex items-center gap-3 font-medium text-xs">
                            <LinkIcon size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                            {res.label}
                          </span>
                          <ExternalLink size={12} className="text-muted-foreground group-hover:text-primary opacity-50 group-hover:opacity-100 transition-all" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
