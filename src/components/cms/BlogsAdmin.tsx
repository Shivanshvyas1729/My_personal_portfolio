import React, { useState } from 'react';
import { BookOpen, Edit3, Trash2, X, Star, EyeOff, Save, Plus } from 'lucide-react';
import { DynamicForm } from './DynamicForm';
import { BlogSchema } from '@/lib/schema';
import { useCMSState } from '@/context/CMSContext';

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
      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex flex-col animate-in fade-in duration-150 overflow-hidden rounded-xl">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="glass-card shadow-2xl border-l border-border/50 flex flex-col h-full absolute right-0 top-0 bottom-0 w-full max-w-full">
             <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/20">
               <h3 className="font-bold">{addingNew ? "New Post" : "Edit Post"}</h3>
               <button onClick={closeModal} className="p-1.5 rounded hover:bg-muted/60 text-muted-foreground transition-colors">
                 <X size={16} />
               </button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-5">
                <DynamicForm 
                  schema={BlogSchema} 
                  data={tempBlog} 
                  onChange={setTempBlog} 
                />
             </div>

             <div className="p-4 border-t border-border/50 bg-muted/10 flex justify-end gap-2">
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
      )}
    </div>
  );
};
