import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BlogPost } from "@/pages/Blog";
import { Calendar, Clock, ExternalLink, Link as LinkIcon, BookOpen, Star, Lock, X, Maximize2, Minimize2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { getLocalImage } from '@/lib/localImageStore';
import { convertToRawGitHubUrl } from "@/components/cms/FormHelpers";

interface BlogModalProps {
  post: BlogPost | null;
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
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

export function BlogModal({ post, isOpen, onClose, isAdmin }: BlogModalProps) {
  const [activePost, setActivePost] = useState<BlogPost | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    if (post) {
      setActivePost(post);
    }
  }, [post]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Reset fullscreen state when opened newly
      setIsFullScreen(false);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && activePost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 overflow-hidden">
          {/* Backdrop Layer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/60 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
            style={{
              willChange: "transform, opacity, filter",
              transform: "translate3d(0,0,0)",
            }}
            className={`relative flex flex-col p-0 gap-0 bg-background/90 backdrop-blur-2xl border border-border/50 shadow-2xl z-10 transition-all duration-300 ${
              isFullScreen 
                ? "w-screen h-screen max-w-none rounded-none inset-0 absolute" 
                : `w-full h-[90vh] overflow-hidden rounded-2xl ${activePost.content.length > 800 ? "max-w-6xl lg:max-w-7xl" : "max-w-3xl"}`
            }`}
          >
            {/* Native App Style Top Title Bar Buttons */}
            <div className="absolute top-5 right-5 flex items-center gap-2 z-50">
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="p-2 rounded-full bg-muted/40 hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all duration-300 cursor-pointer shadow-sm border border-border/10 flex items-center justify-center"
                title={isFullScreen ? "Restore" : "Full Screen"}
              >
                {isFullScreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-muted/40 hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all duration-300 cursor-pointer shadow-sm border border-border/10 flex items-center justify-center"
                title="Close Panel"
              >
                <X size={15} />
              </button>
            </div>

            {/* Header Section */}
            <div className="flex-none p-6 md:p-10 border-b border-border/40 bg-muted/20 pb-8 pr-16">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="text-xs font-semibold px-3 py-1.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                  {activePost.category}
                </span>
                {activePost.featured && (
                  <span className="text-xs font-medium px-2 py-1.5 rounded-md bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 flex items-center gap-1">
                    <Star size={12} className="fill-yellow-500" /> Featured
                  </span>
                )}
                {activePost.draft && isAdmin && (
                  <span className="text-xs font-medium px-2 py-1.5 rounded-md bg-destructive/10 text-destructive border border-destructive/20 flex items-center gap-1">
                    <Lock size={12} /> Confidential Draft
                  </span>
                )}
              </div>

              <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground leading-tight text-left">
                {activePost.title}
              </h2>

              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mt-8">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-primary" />
                  {new Date(activePost.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                {activePost.readingTime && (
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-primary" />
                    {activePost.readingTime} min read
                  </div>
                )}
              </div>
            </div>

            {/* Scrollable Body */}
            <div data-lenis-prevent="true" className="flex-1 overflow-y-auto p-6 md:p-10 leading-relaxed scrollbar-thin">
              <div className="prose prose-invert prose-lg max-w-none 
                              prose-headings:font-heading prose-headings:font-bold prose-headings:text-foreground
                              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                              prose-strong:text-foreground prose-strong:font-bold
                              prose-code:text-primary prose-code:bg-primary/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md
                              prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:py-1 prose-blockquote:px-5 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                              leading-relaxed text-muted-foreground">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    img: ({ node, ...props }) => {
                      let src = props.src;
                      if (src?.startsWith('https://local.image/')) {
                        const b64 = getLocalImage(src);
                        if (b64) src = `data:image/webp;base64,${b64}`;
                      } else if (src) {
                        src = convertToRawGitHubUrl(src);
                      }
                      return (
                        <div className="my-8 flex flex-col items-center gap-2 group/img">
                          <img 
                            {...props} 
                            src={src}
                            className="rounded-2xl border border-border/40 max-h-[450px] w-auto max-w-full object-contain shadow-2xl hover:border-primary/30 hover:scale-[1.01] transition-all duration-300" 
                            loading="lazy" 
                          />
                          {props.alt && (
                            <span className="text-xs text-muted-foreground/60 italic opacity-0 group-hover/img:opacity-100 transition-opacity">
                              {props.alt}
                            </span>
                          )}
                        </div>
                      );
                    },
                    table: ({ node, ...props }) => (
                      <div className="overflow-x-auto my-6 border border-border/40 rounded-xl shadow-lg bg-card/25">
                        <table {...props} className="min-w-full divide-y divide-border/30 text-sm" />
                      </div>
                    ),
                    th: ({ node, ...props }) => (
                      <th {...props} className="px-4 py-3 bg-muted/40 font-bold text-foreground text-left" />
                    ),
                    td: ({ node, ...props }) => (
                      <td {...props} className="px-4 py-3 border-t border-border/20 text-muted-foreground" />
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
                        className="border-l-4 border-primary bg-primary/5 py-3 px-5 rounded-r-xl my-6 not-italic font-medium text-foreground/90 shadow-sm"
                      />
                    )
                  }}
                >
                  {activePost.content}
                </ReactMarkdown>
              </div>

              {/* Optional Attachments / Resources */}
              {activePost.resources && activePost.resources.length > 0 && (
                <div className="mt-16 border-t border-border/50 pt-10">
                  <h3 className="text-xl font-heading font-semibold flex items-center gap-2 mb-6">
                    <BookOpen size={20} className="text-primary" /> Attached Resources
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activePost.resources.map((res: any, idx: number) => (
                      <a 
                        key={idx} 
                        href={res.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex justify-between items-center p-4 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted hover:border-primary/50 transition-all duration-300 group"
                      >
                        <span className="flex items-center gap-3 font-medium text-sm">
                          <LinkIcon size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                          {res.label}
                        </span>
                        <ExternalLink size={14} className="text-muted-foreground group-hover:text-primary opacity-50 group-hover:opacity-100 transition-all" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Tags */}
              {activePost.type && activePost.type.length > 0 && (
                <div className="mt-12 flex flex-wrap gap-2">
                  {activePost.type.map((tag: string, idx: number) => (
                    <span key={idx} className="text-[11px] px-3 py-1 rounded-full bg-primary/5 text-primary border border-primary/20 uppercase tracking-widest font-semibold">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
