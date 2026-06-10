import { useParams, Link } from "react-router-dom";
import { portfolioData as initialData } from "@/data/portfolioData";
import Navbar from "@/components/portfolio/Navbar";
import Footer from "@/components/portfolio/Footer";
import SEO from "@/components/portfolio/SEO";
import { ArrowLeft, Github, ExternalLink, Play, Lock } from "lucide-react";
import { useState } from "react";
import { useCMSData } from "@/context/CMSContext";
import Magnetic from "@/components/ui/Magnetic";
import { motion } from "framer-motion";
import { convertToRawGitHubUrl } from "@/components/cms/FormHelpers";
import { ResourcesModal } from "@/components/portfolio/ResourcesModal";
import { KnowledgeTooltip, renderTextWithLinks } from "@/components/portfolio/KnowledgeTooltip";
import type { Project } from "@/data/portfolioData";
import { ErrorBoundary } from "../components/cms/ErrorBoundary";

const DEFAULT_ETHICS = [
  "No personally identifiable information stored.",
  "Dataset used according to license.",
  "Access restricted to authorized users.",
  "Data encrypted in transit and at rest.",
  "Human review recommended for critical decisions.",
  "Model limitations disclosed.",
  "Bias monitoring recommended.",
  "Responsible AI practices followed."
];

const formatKeyName = (key: string) => {
  return key
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const springTransition = {
  type: "spring",
  stiffness: 110,
  damping: 18,
  mass: 0.75,
};

const pageVariants = {
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

const ProjectDetail = () => {
  const { id } = useParams();
  const cmsProjects = useCMSData(d => d.projects) || initialData.projects;
  const project = cmsProjects.find((p) => p.id === Number(id));
  const [activeMedia, setActiveMedia] = useState(0);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold mb-4">Project not found</h1>
          <Link to="/" className="text-primary hover:underline">Go back home</Link>
        </div>
      </div>
    );
  }

  const hasMedia = project.media && project.media.length > 0;

  const renderArraySection = (key: keyof Project, title?: string, icon?: React.ReactNode, extraClasses = "") => {
    let data = project[key] as string[] | undefined;
    
    // Special ethics default logic
    if (key === "ethics" && (!data || data.length === 0)) {
      data = DEFAULT_ETHICS;
    }

    if (!data || !Array.isArray(data) || data.length === 0) return (
      <div className={extraClasses}>
        <h4 className="text-sm font-bold text-foreground mb-1">{title || formatKeyName(key as string)}</h4>
        <p className="text-muted-foreground/50 italic text-sm">[Add {title ? title.toLowerCase() : formatKeyName(key as string).toLowerCase()} here]</p>
      </div>
    );

    const sectionTitle = title || formatKeyName(key as string);
    const overrides = project.knowledge_overrides || [];

    return (
      <div className={extraClasses}>
        <h4 className="text-sm font-bold text-foreground mb-1 flex items-center gap-1.5">
          {icon} {sectionTitle}
        </h4>
        <ul className="list-disc pl-5 text-muted-foreground text-sm space-y-1 no-text-effect">
          {data.map((item, i) => {
            const termOverrides = overrides.find((o) => o.id?.toLowerCase() === item.toLowerCase());

            // Check if there is an obtained value in metrics
            let obtainedVal = "";
            if (key === "evaluation_metrics" && project.metrics) {
              const exactVal = project.metrics[item];
              if (exactVal !== undefined) {
                obtainedVal = String(exactVal);
              } else {
                const lowerItem = item.toLowerCase().trim();
                const foundKey = Object.keys(project.metrics).find(k => {
                  const lowerK = k.toLowerCase().trim();
                  return lowerK === lowerItem || lowerK.includes(lowerItem) || lowerItem.includes(lowerK);
                });
                if (foundKey) {
                  obtainedVal = String(project.metrics[foundKey]);
                }
              }
            }

            return (
              <li key={i}>
                <span className="font-semibold text-foreground/95">
                  <KnowledgeTooltip term={item} overrides={termOverrides} />
                </span>
                {obtainedVal && (
                  <span className="ml-1.5 text-primary font-mono font-bold">
                    — {obtainedVal}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  // Render metrics grid if available
  const renderMetricsSection = () => {
    if (!project || !project.metrics) return null;
    const entries = Object.entries(project.metrics);
    if (entries.length === 0) return null;

    return (
      <div className="p-5 border border-border/40 rounded-xl bg-muted/10 md:col-span-2">
        <h4 className="font-heading font-bold text-foreground mb-4 text-sm flex items-center gap-1.5">
          📊 Performance Metrics & Stats
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {entries.map(([label, val]) => (
            <div key={label} className="p-3.5 rounded-lg bg-background/40 border border-border/20 flex flex-col justify-between">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1 leading-snug">
                {label}
              </span>
              <span className="text-lg font-bold text-primary font-mono leading-none">
                {val}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTextSection = (key: keyof Project, title?: string) => {
    const text = project[key] as string | undefined;
    if (!text || typeof text !== "string") return (
      <div>
        <h4 className="text-sm font-bold text-foreground mb-1">{title || formatKeyName(key as string)}</h4>
        <p className="text-muted-foreground/50 italic text-sm">[Add {title ? title.toLowerCase() : formatKeyName(key as string).toLowerCase()} here]</p>
      </div>
    );

    const sectionTitle = title || formatKeyName(key as string);
    const overrides = project.knowledge_overrides || [];
    
    const termOverrides = overrides.find((o) => o.id?.toLowerCase() === text.toLowerCase());
    
    const isTargetVar = key === "target_variable";

    return (
      <div>
        <h4 className="text-sm font-bold text-foreground mb-1">{sectionTitle}</h4>
        <p className="text-muted-foreground text-sm no-text-effect">
          <KnowledgeTooltip term={text} overrides={termOverrides} isTargetVariable={isTargetVar} />
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background w-full overflow-x-hidden flex flex-col relative">
      <SEO
        title={project.title} 
        description={project.description} 
        image={project.media?.[0]?.url} 
      />
      <Navbar />
      <ErrorBoundary fallbackTitle="Failed to render project details">
        <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={pageVariants}
        style={{
          willChange: "transform, opacity, filter",
          transform: "translate3d(0,0,0)",
        }}
        className="section-padding pt-28"
      >
        <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-16 xl:px-24 no-text-effect">
          <Link to="/projects" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft size={16} /> Back to Projects
          </Link>

          {/* Top: Title + Media side by side */}
          <div className={`grid gap-8 lg:gap-12 mb-12 ${hasMedia ? "lg:grid-cols-[1.1fr,1fr]" : ""}`}>
            {/* Left: Project Info */}
            <div>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(project.category) && project.category.map((cat, i) => (
                  <span key={i} className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full font-medium shadow-sm border border-primary/20">
                    {cat.trim()}
                  </span>
                ))}
                {project.domain && (
                  <span className="text-xs text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full font-medium shadow-sm border border-amber-500/20">
                    {project.domain}
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold mt-3 mb-4">{project.title}</h1>
              {project.metrics && Object.keys(project.metrics).length > 0 && (
                <div className="flex flex-wrap gap-x-6 gap-y-3 mb-6 p-4 rounded-xl bg-secondary/25 border border-border/40 backdrop-blur-md w-fit">
                  {Object.entries(project.metrics).map(([key, val]) => (
                    <div key={key} className="flex flex-col min-w-[100px]">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">{key}</span>
                      <span className="text-base font-bold text-primary font-mono">{val}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="mb-6">
                <h2 className="text-sm font-medium text-primary mb-1">Overview</h2>
                <p className="text-muted-foreground text-base md:text-lg leading-relaxed">{renderTextWithLinks(project.description)}</p>
              </div>

              <div className="mb-6">
                <h2 className="text-sm font-medium text-primary mb-1">Problem Statement</h2>
                {project.problem_statement ? (
                  <p className="text-muted-foreground text-base md:text-lg leading-relaxed">{renderTextWithLinks(project.problem_statement)}</p>
                ) : (
                  <p className="text-muted-foreground/50 italic text-sm">[Add your problem statement here]</p>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                {project.github && (
                  <Magnetic strength={0.15}>
                    <a href={project.github} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glass-card-hover text-sm font-medium">
                      <Github size={16} /> GitHub
                    </a>
                  </Magnetic>
                )}
                {project.live && (
                  <Magnetic strength={0.15}>
                    <a href={project.live} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:shadow-[0_0_20px_-5px_hsl(var(--primary)/0.5)] transition-all">
                      <ExternalLink size={16} /> Live Demo
                    </a>
                  </Magnetic>
                )}
                {(project.resources?.length ?? 0) > 0 && (
                  <Magnetic strength={0.15}>
                    <ResourcesModal project={project}>
                      <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-all border border-border">
                        <Lock size={16} className="text-primary" /> View Resources
                      </button>
                    </ResourcesModal>
                  </Magnetic>
                )}
              </div>
            </div>

            {/* Right: Media Gallery */}
            {hasMedia && (
              <div className="space-y-3">
                {/* Active media display */}
                <div className="glass-card rounded-xl overflow-hidden aspect-video">
                  {project.media![activeMedia].type === "video" || (!project.media![activeMedia].type && project.media![activeMedia].url?.match(/\.(mp4|webm|ogg)$/i)) ? (
                    <video
                      src={convertToRawGitHubUrl(project.media![activeMedia].url || '')}
                      controls
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={convertToRawGitHubUrl(project.media![activeMedia].url || '')}
                      alt={project.media![activeMedia].caption || project.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                {project.media![activeMedia].caption && (
                  <p className="text-xs text-muted-foreground text-center">{project.media![activeMedia].caption}</p>
                )}
                {/* Thumbnails */}
                {project.media!.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {project.media!.map((m, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveMedia(i)}
                        className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          i === activeMedia ? "border-primary" : "border-border/30 opacity-60 hover:opacity-100"
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
          </div>

          {/* My Learning in this Project */}
          <div className="glass-card p-4 md:p-6 mb-6">
            <h3 className="text-lg font-medium text-primary mb-3">My Learning in this Project</h3>
            {project.learning_outcomes && project.learning_outcomes.length > 0 ? (
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                {project.learning_outcomes.map((item, i) => <li key={i}>{renderTextWithLinks(item)}</li>)}
              </ul>
            ) : (
              <ul className="list-disc pl-5 text-muted-foreground/50 italic space-y-1">
                <li>[Add learning outcomes here]</li>
              </ul>
            )}
          </div>

          {/* Impact */}
          {project.impact && (
            <div className="glass-card p-4 md:p-6 mb-6">
              <h3 className="text-lg font-medium text-primary mb-2">Impact</h3>
              <p className="text-foreground">⚡ {renderTextWithLinks(project.impact)}</p>
            </div>
          )}

          {/* High-Level Architecture */}
          <div className="glass-card p-4 md:p-6 mb-6">
            <h3 className="text-lg font-medium text-primary mb-3">High-Level Architecture</h3>
            {project.architecture ? (
              <p className="text-muted-foreground leading-relaxed mb-4">{renderTextWithLinks(project.architecture)}</p>
            ) : (
              <p className="text-muted-foreground/50 italic mb-4">[Add architecture description here]</p>
            )}
            
            {project.architectureImage ? (
              <img 
                src={convertToRawGitHubUrl(project.architectureImage)} 
                alt="Architecture" 
                className="w-full max-h-[70vh] object-contain rounded-xl border border-border bg-muted/5 mx-auto" 
              />
            ) : (
              <div className="w-full h-32 flex items-center justify-center rounded-xl border border-dashed border-border text-muted-foreground/50 italic">
                [Insert Architecture Diagram Here]
              </div>
            )}
          </div>

          {/* Technical Implementation */}
          <div className="glass-card p-4 md:p-6 mb-6">
            <h3 className="text-xl font-medium text-primary mb-6">Technical Implementation</h3>
            
            {/* Tech Stack */}
            <div className="mb-6">
              <h4 className="text-sm font-bold text-foreground mb-2">Tech Stack</h4>
              <div className="flex flex-wrap gap-2">
                {project.tech.map((t) => (
                  <span key={t} className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm border border-primary/20">{t}</span>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {renderArraySection("objectives")}
              {renderArraySection("success_criteria")}
              {renderArraySection("data_sources")}
              {renderTextSection("target_variable")}
              {renderArraySection("features")}
              {renderArraySection("preprocessing")}
              {renderArraySection("modeling")}
              {renderMetricsSection()}
              {renderArraySection("evaluation_metrics")}
              {renderTextSection("validation_strategy")}
              {renderTextSection("explainability")}
              {renderTextSection("deployment")}
            </div>
            
            <hr className="my-6 border-border" />
            
            <div className="grid md:grid-cols-2 gap-6">
              {renderArraySection("risks", "Risks & Mitigation")}
              {renderArraySection("ethics", "Ethics & Privacy")}
            </div>
          </div>

          {/* Open Resources */}
          <div className="glass-card p-4 md:p-6 mb-6">
            <h3 className="text-lg font-medium text-primary mb-4">Open Resources</h3>
            {project.open_resources && project.open_resources.length > 0 ? (
              <div className="flex flex-col gap-2">
                {project.open_resources.map((res, i) => (
                  <a key={i} href={res.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm">
                    <ExternalLink size={14} /> {res.label}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground/50 italic text-sm">[No open resources available]</p>
            )}
          </div>
        </div>
        </motion.div>
      </ErrorBoundary>
      <Footer />
    </div>
  );
};

export default ProjectDetail;
