import { Calendar, Clock, Lock, ShieldAlert } from "lucide-react";
import { BlogPost } from "@/pages/Blog";

interface BlogCardProps {
  post: BlogPost;
  onClick: () => void;
  isAdmin: boolean;
}

export function BlogCard({ post, onClick, isAdmin }: BlogCardProps) {
  return (
    <article 
      onClick={onClick}
      className={`glass-card p-6 md:p-8 rounded-2xl hover:border-primary/40 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 ${
        post.draft ? "border-dashed border-destructive/50 opacity-80" : ""
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20">
            {post.category}
          </span>
          
          {post.featured && (
            <span className="text-xs font-medium px-2 py-1 rounded-md bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 flex items-center gap-1">
              Featured
            </span>
          )}

          {post.draft && isAdmin && (
            <span className="text-xs font-medium px-2 py-1 rounded-md bg-destructive/10 text-destructive border border-destructive/20 flex items-center gap-1">
              <Lock size={12} /> Draft
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground whitespace-nowrap">
          <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(post.date).toLocaleDateString()}</span>
          {(post as any).readingTime && (
            <span className="flex items-center gap-1"><Clock size={12} /> {(post as any).readingTime} min read</span>
          )}
        </div>
      </div>
      
      <h2 className="text-xl md:text-2xl font-bold font-heading mb-3 text-foreground line-clamp-2">
        {post.title}
      </h2>
      
      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-5">
        {post.content.split('\n')[0].substring(0, 150)}...
      </p>

      {/* Render Tag Chips */}
      {post.type && post.type.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-auto pt-4 border-t border-border/30">
          {post.type.map((tag, idx) => (
            <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50 uppercase tracking-widest">
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
