import React, { useState } from 'react';
import { BookOpen, Edit3, Trash2, X, Star, EyeOff, Save, Plus, Calendar, Clock, Link as LinkIcon, Eye } from 'lucide-react';
import { DynamicForm } from './DynamicForm';
import { BlogSchema } from '@/lib/schema';
import { useCMSState } from '@/context/CMSContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface BlogsAdminProps {
  blogs: any[];
  onChange: (blogs: any[]) => void;
  onSave: (data?: any[]) => Promise<{ success: boolean; error?: string } | undefined>;
  isLoading: boolean;
  mode: "local" | "github" | "unknown";
}

export const BlogsAdmin: React.FC<BlogsAdminProps> = ({ blogs, onChange, onSave, isLoading, mode }) => {
  const { liveData } = useCMSState();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [tempBlog, setTempBlog] = useState<any>({});
  const [saveError, setSaveError] = useState("");
  const [previewTab, setPreviewTab] = useState<'card' | 'detailed'>('card');

  const hasPendingChanges = JSON.stringify(blogs) !== JSON.stringify(liveData.blog);

  const handleEdit = (blog: any) => {
    setTempBlog({ ...blog });
    setEditingId(blog.id);
  };

  const handleAddNew = () => {
    const highestId = blogs.reduce((max, b) => (b.id || 0) > max ? b.id : max, 0);
    setTempBlog({
      id: highestId + 1,
      title: "",
      content: "",
      category: "Notes",
      type: [],
      featured: false,
      draft: true,
      date: new Date().toISOString().split('T')[0]
    });
    setAddingNew(true);
  };

  const saveEdit = () => {
    if (!tempBlog.title || !tempBlog.content) {
      alert("Title and Content are required.");
      return;
    }

    let updated: any[];
    if (addingNew) {
      updated = [tempBlog, ...blogs];
    } else {
      updated = blogs.map(b => b.id === tempBlog.id ? tempBlog : b);
    }
    onChange(updated);
    closeModal();
    return updated;
  };

  const deleteBlog = (id: number) => {
    if (confirm("Are you sure you want to delete this blog post?")) {
      onChange(blogs.filter(b => b.id !== id));
    }
  };

  const closeModal = () => {
    setEditingId(null);
    setAddingNew(false);
    setTempBlog({});
  };

  const isModalOpen = editingId !== null || addingNew;

  return (
    <div className="flex flex-col h-full bg-background relative">
      <div className="flex items-center justify-between mb-4 px-4 pt-4 shrink-0">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-foreground font-heading">Manage Blogs</h3>
          {hasPendingChanges && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-bold uppercase tracking-wider border border-amber-500/20">
              Pending Changes
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAddNew}
            className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 transition-colors rounded-lg text-sm font-medium flex items-center gap-1.5"
          >
            <Plus size={14} /> New Post
          </button>
          <button
            onClick={async () => {
              setSaveError("");
              const result = await onSave();
              if (result && !result.success) {
                setSaveError(result.error || "Save failed. Check the Logs tab for details.");
              }
            }}
            disabled={isLoading || !hasPendingChanges}
            className="px-4 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-1.5"
          >
            {isLoading ? <><span className="animate-spin inline-block w-3 h-3 border border-white/30 border-t-white rounded-full" /> Saving...</> : (mode === 'local' ? "Save to Local" : "Save to GitHub")}
          </button>
        </div>
      </div>
      
      {saveError && (
        <div className="mx-4 mb-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs font-medium">
          ⚠️ {saveError}
        </div>
      )}

      {/* Grid of Blogs */}
      <div className="flex-1 overflow-y-auto px-4 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {blogs.map(b => (
            <div key={b.id} className="group glass-card border border-border/50 rounded-xl p-4 flex flex-col hover:border-primary/40 transition-colors relative">
              <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(b)} className="p-1.5 bg-muted hover:bg-primary/10 hover:text-primary rounded text-muted-foreground transition-colors">
                  <Edit3 size={14} />
                </button>
                <button onClick={() => deleteBlog(b.id)} className="p-1.5 bg-muted hover:bg-destructive/10 hover:text-destructive rounded text-muted-foreground transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
              
              <div className="flex items-start gap-2 mb-2 pr-16">
                {b.featured && <Star size={14} className="text-yellow-500 fill-yellow-500 mt-1 shrink-0" />}
                <h4 className="font-bold text-foreground leading-tight">{b.title}</h4>
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                 <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground font-bold uppercase tracking-wider">{b.category}</span>
                 {b.draft && (
                   <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold uppercase tracking-wider flex items-center gap-1">
                     <EyeOff size={10} /> Draft
                   </span>
                 )}
                 <span className="text-[10px] text-muted-foreground ml-auto">{b.date}</span>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{b.content}</p>
              
              <div className="mt-auto flex items-center gap-3">
                <div className="flex gap-1 flex-wrap">
                  {b.type?.slice(0, 3).map((t: string) => (
                    <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor Modal */}
      <div className={`absolute inset-0 z-50 flex flex-col overflow-hidden rounded-xl transition-all duration-500 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] ${
        isModalOpen 
          ? 'opacity-100 pointer-events-auto visible' 
          : 'opacity-0 pointer-events-none invisible translate-y-4 scale-[0.98]'
      }`}>
        <div className={`absolute inset-0 bg-background/60 backdrop-blur-sm transition-opacity duration-500 ${
          isModalOpen ? 'opacity-100' : 'opacity-0'
        }`} onClick={closeModal} />
        <div className={`glass-card shadow-2xl border-l border-border/50 flex flex-col h-full absolute right-0 top-0 bottom-0 w-full max-w-full transition-all duration-500 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] ${
          isModalOpen ? 'translate-y-0 scale-100' : 'translate-y-8 scale-[0.96]'
        }`}>
           <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/20 shrink-0">
             <h3 className="font-bold">{addingNew ? "New Post" : "Edit Post"}</h3>
             <button onClick={closeModal} className="p-1.5 rounded hover:bg-muted/60 text-muted-foreground transition-colors">
               <X size={16} />
             </button>
           </div>
           
           {/* Side-by-Side Editor & Live Preview Workspace */}
           <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
             {/* Left Column: Form Editor */}
             <div className="w-full md:w-1/2 border-r border-border/50 overflow-y-auto p-5 scrollbar-thin">
                <DynamicForm 
                  schema={BlogSchema} 
                  data={tempBlog} 
                  onChange={setTempBlog} 
                />
             </div>
             
             {/* Right Column: Interactive Live Preview Pane */}
             <div className="w-full md:w-1/2 bg-muted/10 overflow-y-auto p-6 flex flex-col gap-6 scrollbar-thin">
               <div className="flex items-center justify-between border-b border-border/40 pb-3 shrink-0">
                 <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 select-none">
                   <Eye size={14} className="text-primary animate-pulse" /> Live Preview
                 </h4>
                 <div className="flex bg-muted/50 p-0.5 rounded-lg border border-border/40 text-[10px] select-none">
                   <button 
                     onClick={() => setPreviewTab('card')}
                     className={`px-2.5 py-1 rounded-md font-medium transition-all ${previewTab === 'card' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                   >
                     Card View
                   </button>
                   <button 
                     onClick={() => setPreviewTab('detailed')}
                     className={`px-2.5 py-1 rounded-md font-medium transition-all ${previewTab === 'detailed' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                   >
                     Detailed View
                   </button>
                 </div>
               </div>
               
               <div className="flex-1 min-h-0 flex items-center justify-center">
                 {previewTab === 'card' ? (
                   <div className="w-full max-w-md mx-auto p-2">
                     {/* Replica of BlogCard for Visual Preview */}
                     <article className={`glass-card p-6 md:p-8 rounded-2xl border border-border/60 hover:border-primary/45 transition-all duration-300 relative flex flex-col bg-background/50 h-full ${tempBlog.draft ? 'border-dashed border-destructive/50 opacity-80' : ''}`}>
                       <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                         <div className="flex flex-wrap items-center gap-2">
                           <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20">
                             {tempBlog.category || "Thoughts"}
                           </span>
                           {tempBlog.featured && (
                             <span className="text-xs font-medium px-2 py-1 rounded-md bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 flex items-center gap-1">
                               Featured
                             </span>
                           )}
                           {tempBlog.draft && (
                             <span className="text-xs font-medium px-2 py-1 rounded-md bg-destructive/10 text-destructive border border-destructive/20 flex items-center gap-1">
                               Draft
                             </span>
                           )}
                         </div>
                         <div className="flex items-center gap-3 text-xs text-muted-foreground whitespace-nowrap">
                           <span className="flex items-center gap-1"><Calendar size={12} /> {tempBlog.date || new Date().toISOString().split('T')[0]}</span>
                           <span className="flex items-center gap-1">
                             <Clock size={12} /> 
                             {tempBlog.readingTime || Math.max(1, Math.ceil((tempBlog.content || "").trim().split(/\s+/).filter(Boolean).length / 200))} min read
                           </span>
                         </div>
                       </div>
                       
                       <h2 className="text-xl md:text-2xl font-bold font-heading mb-3 text-foreground line-clamp-2">
                         {tempBlog.title || "Untitled Post Title"}
                       </h2>
                       
                       <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-5">
                         {tempBlog.content ? (tempBlog.content.split("\n")[0].substring(0, 150) + "...") : "Type content in the editor to see it here..."}
                       </p>
                       
                       {tempBlog.type && tempBlog.type.length > 0 && (
                         <div className="flex flex-wrap gap-1.5 mt-auto pt-4 border-t border-border/30">
                           {tempBlog.type.map((tag: string, idx: number) => (
                             <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50 uppercase tracking-widest">
                               {tag}
                             </span>
                           ))}
                         </div>
                       )}
                     </article>
                   </div>
                 ) : (
                   /* Replica of BlogModal for detailed rich content markdown preview */
                   <div className="w-full h-full flex flex-col bg-background/40 backdrop-blur-md border border-border/50 shadow-xl rounded-2xl overflow-hidden min-h-[350px]">
                      <div className="p-6 border-b border-border/40 bg-muted/20 pb-5 pr-6">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20">
                            {tempBlog.category || "Thoughts"}
                          </span>
                          {tempBlog.featured && (
                            <span className="text-xs font-medium px-2 py-1 rounded-md bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 flex items-center gap-1">
                              Featured
                            </span>
                          )}
                          {tempBlog.draft && (
                            <span className="text-xs font-medium px-2 py-1 rounded-md bg-destructive/10 text-destructive border border-destructive/20 flex items-center gap-1">
                              Draft
                            </span>
                          )}
                        </div>
                        
                        <h2 className="text-xl md:text-2xl font-heading font-bold text-foreground leading-tight text-left">
                          {tempBlog.title || "Untitled Post Title"}
                        </h2>
                        
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-3">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-primary" />
                            {tempBlog.date || new Date().toISOString().split('T')[0]}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock size={14} className="text-primary" />
                            {tempBlog.readingTime || Math.max(1, Math.ceil((tempBlog.content || "").trim().split(/\s+/).filter(Boolean).length / 200))} min read
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto p-6 leading-relaxed scrollbar-thin">
                        <div className="prose prose-invert prose-sm max-w-none 
                                        prose-headings:font-heading prose-headings:font-bold prose-headings:text-foreground
                                        prose-strong:text-foreground prose-strong:font-bold
                                        prose-code:text-primary prose-code:bg-primary/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md
                                        prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                                        leading-relaxed text-muted-foreground text-left">
                          {tempBlog.content ? (
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              components={{
                                img: ({ node, ...props }) => (
                                  <div className="my-8 flex flex-col items-center gap-2 group/img">
                                    <img 
                                      {...props} 
                                      className="rounded-2xl border border-border/60 max-h-[350px] w-auto max-w-full object-contain shadow-2xl hover:border-primary/40 hover:scale-[1.01] transition-all duration-300" 
                                      loading="lazy" 
                                    />
                                    {props.alt && (
                                      <span className="text-[10px] text-muted-foreground/75 italic select-none">
                                        {props.alt}
                                      </span>
                                    )}
                                  </div>
                                ),
                                table: ({ node, ...props }) => (
                                  <div className="overflow-x-auto my-4 border border-border/40 rounded-xl shadow-md bg-card/25">
                                    <table {...props} className="min-w-full divide-y divide-border/30 text-xs" />
                                  </div>
                                ),
                                th: ({ node, ...props }) => (
                                  <th {...props} className="px-3 py-2 bg-muted/40 font-bold text-foreground text-left" />
                                ),
                                td: ({ node, ...props }) => (
                                  <td {...props} className="px-3 py-2 border-t border-border/20 text-muted-foreground" />
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
                                    className="border-l-4 border-primary bg-primary/5 py-2 px-4 rounded-r-xl my-4 not-italic font-medium text-foreground/90 shadow-sm"
                                  />
                                )
                              }}
                            >
                              {tempBlog.content}
                            </ReactMarkdown>
                          ) : (
                            <p className="text-muted-foreground italic">Add markdown content in the editor to see it rendered here...</p>
                          )}
                        </div>
                        
                        {tempBlog.resources && tempBlog.resources.length > 0 && (
                          <div className="mt-8 border-t border-border/40 pt-6">
                            <h3 className="text-xs font-heading font-semibold flex items-center gap-2 mb-3">
                              <BookOpen size={14} className="text-primary" /> Attached Resources
                            </h3>
                            <div className="grid grid-cols-1 gap-2">
                              {tempBlog.resources.map((res: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-border/50 bg-muted/20">
                                  <span className="flex items-center gap-2 font-medium text-xs">
                                    <LinkIcon size={12} className="text-primary" />
                                    {res.label}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground break-all">{res.url}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {tempBlog.type && tempBlog.type.length > 0 && (
                          <div className="mt-6 flex flex-wrap gap-1.5">
                            {tempBlog.type.map((tag: string, idx: number) => (
                              <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/5 text-primary border border-primary/20 uppercase tracking-widest font-semibold">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                   </div>
                 )}
               </div>
             </div>
           </div>

           <div className="p-4 border-t border-border/50 bg-muted/10 flex justify-end gap-2 shrink-0">
             <button onClick={closeModal} className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted text-muted-foreground transition-colors">
               Cancel
             </button>
             <button onClick={saveEdit} className="px-4 py-2 bg-primary/20 text-primary rounded-lg text-sm font-medium hover:bg-primary/30 transition-colors">
               Apply to Preview
             </button>
             <button 
               onClick={async () => {
                 const updated = saveEdit();
                 if (updated) setTimeout(() => onSave(updated), 0);
               }} 
               className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg flex items-center gap-2"
             >
               <Save size={14} />
               Apply & {mode === 'local' ? "Save" : "Push"}
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};
