import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BlogPost } from "@/pages/Blog";
import { Calendar, Clock, ExternalLink, Link as LinkIcon, BookOpen, Star, Lock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface BlogModalProps {
  post: BlogPost | null;
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
}

export function BlogModal({ post, isOpen, onClose, isAdmin }: BlogModalProps) {
  if (!post) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] overflow-hidden flex flex-col p-0 gap-0 bg-background/95 backdrop-blur-xl border border-border/50 shadow-2xl sm:rounded-2xl">
        
        {/* Header Section */}
        <div className="flex-none p-6 md:p-10 border-b border-border/40 bg-muted/20 pb-8">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-md bg-primary/10 text-primary border border-primary/20">
              {post.category}
            </span>
            {post.featured && (
              <span className="text-xs font-medium px-2 py-1.5 rounded-md bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 flex items-center gap-1">
                <Star size={12} className="fill-yellow-500" /> Featured
              </span>
            )}
            {post.draft && isAdmin && (
               <span className="text-xs font-medium px-2 py-1.5 rounded-md bg-destructive/10 text-destructive border border-destructive/20 flex items-center gap-1">
                 <Lock size={12} /> Confidential Draft
               </span>
            )}
          </div>

          <DialogHeader>
            <DialogTitle className="text-3xl md:text-5xl font-heading font-bold text-foreground leading-tight text-left">
              {post.title}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mt-8">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-primary" />
              {new Date(post.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            {(post as any).readingTime && (
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-primary" />
                {(post as any).readingTime} min read
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          
          <div className="prose prose-invert prose-lg max-w-none 
                          prose-headings:font-heading prose-headings:font-bold prose-headings:text-foreground
                          prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                          prose-strong:text-foreground prose-strong:font-bold
                          prose-code:text-primary prose-code:bg-primary/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md
                          prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:py-1 prose-blockquote:px-5 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                          leading-relaxed text-muted-foreground">
            {/* Safely Render Markdown and block raw embedded HTML attacks completely via default react-markdown parsing */}
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Optional Attachments / Resources */}
          {post.resources && post.resources.length > 0 && (
            <div className="mt-16 border-t border-border/50 pt-10">
              <h3 className="text-xl font-heading font-semibold flex items-center gap-2 mb-6">
                <BookOpen size={20} className="text-primary" /> Attached Resources
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {post.resources.map((res: any, idx: number) => (
                  <a 
                    key={idx} 
                    href={res.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex justify-between items-center p-4 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted hover:border-primary/50 transition-colors group"
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
          {post.type && post.type.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-2">
              {post.type.map((tag: string, idx: number) => (
                <span key={idx} className="text-[11px] px-3 py-1 rounded-full bg-primary/5 text-primary border border-primary/20 uppercase tracking-widest font-semibold">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

      </DialogContent>
    </Dialog>
  );
}
