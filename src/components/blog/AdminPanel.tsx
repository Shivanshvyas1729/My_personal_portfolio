import { useState } from "react";
import { Save, Plus, Loader2, Link as LinkIcon, Trash2 } from "lucide-react";
import { BlogPost } from "@/pages/Blog";

interface AdminPanelProps {
  onSuccess: (post: BlogPost) => void;
}

export function AdminPanel({ onSuccess }: AdminPanelProps) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "Notes",
    type: "", // comma separated tags
    featured: false,
    draft: true
  });
  
  const [resources, setResources] = useState<{label: string, url: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addResource = () => setResources([...resources, { label: "", url: "" }]);
  const updateResource = (idx: number, key: 'label'|'url', val: string) => {
    const updated = [...resources];
    updated[idx][key] = val;
    setResources(updated);
  };
  const removeResource = (idx: number) => setResources(resources.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return setError("Title and content required");
    
    setLoading(true);
    setError("");

    const payload = {
      ...formData,
      type: formData.type.split(",").map(t => t.trim()).filter(Boolean),
      resources: resources.filter(r => r.label && r.url)
    };

    try {
      const response = await fetch("/.netlify/functions/save-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          password: sessionStorage.getItem("adminAuth") === "true" ? "ShivaAnt" : "", 
          blogData: payload 
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      // Map to correct mock representation for optimistic UI injection
      onSuccess({
        id: Date.now(),
        ...payload,
        date: new Date().toISOString(),
        slug: payload.title.replace(/\s+/g, '-').toLowerCase()
      } as any);

      // Reset Form
      setFormData({ title: "", content: "", category: "Notes", type: "", featured: false, draft: true });
      setResources([]);
    } catch (err: any) {
      setError(err.message || "Failed to commit");
    }
    setLoading(false);
  };

  return (
    <div className="glass-card rounded-2xl p-6 border-primary/20 sticky top-28 shadow-xl">
      <h3 className="text-lg font-heading font-bold mb-4 flex items-center gap-2">
        <Save size={18} className="text-primary"/> Admin Matrix
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Title</label>
          <input 
            type="text" 
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            className="w-full bg-background border border-border/50 rounded-lg p-2 text-sm focus:outline-none focus:border-primary/50 text-foreground" 
            required 
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Category</label>
            <select
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
              className="w-full bg-background border border-border/50 rounded-lg p-2 text-sm focus:outline-none focus:border-primary/50"
            >
              <option>Notes</option>
              <option>Thoughts</option>
              <option>Books</option>
              <option>Links</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Tags (CSV)</label>
            <input 
              type="text"
              placeholder="React, AI, Deep..."
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value})}
              className="w-full bg-background border border-border/50 rounded-lg p-2 text-sm focus:outline-none focus:border-primary/50" 
            />
          </div>
        </div>

        <div>
           <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Content (MD)</label>
           <textarea 
            rows={8}
            value={formData.content}
            onChange={e => setFormData({...formData, content: e.target.value})}
            className="w-full bg-background border border-border/50 rounded-lg p-2 text-sm focus:outline-none focus:border-primary/50 font-mono resize-none leading-relaxed" 
            required
           />
        </div>

        {/* Resources Builder */}
        <div className="pt-2 border-t border-border/30">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resources</label>
            <button type="button" onClick={addResource} className="text-xs text-primary hover:underline flex items-center gap-1">
              <Plus size={12} /> Add Link
            </button>
          </div>
          {resources.map((res, i) => (
             <div key={i} className="flex gap-2 mb-2 items-center bg-muted/20 p-2 rounded-lg border border-border/30">
                <LinkIcon size={14} className="text-muted-foreground" />
                <input placeholder="Label" value={res.label} onChange={e => updateResource(i, 'label', e.target.value)} className="w-[40%] bg-transparent border-none text-xs focus:outline-none" />
                <input placeholder="https://" value={res.url} onChange={e => updateResource(i, 'url', e.target.value)} className="flex-1 bg-transparent border-none text-xs focus:outline-none" />
                <button type="button" onClick={() => removeResource(i)} className="text-destructive hover:bg-destructive/10 p-1 rounded"><Trash2 size={12} /></button>
             </div>
          ))}
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4 text-sm font-medium">
             <label className="flex items-center gap-1.5 cursor-pointer">
               <input type="checkbox" checked={formData.featured} onChange={e => setFormData({...formData, featured: e.target.checked})} className="accent-primary" />
               Featured
             </label>
             <label className="flex items-center gap-1.5 cursor-pointer">
               <input type="checkbox" checked={formData.draft} onChange={e => setFormData({...formData, draft: e.target.checked})} className="accent-primary" />
               Draft
             </label>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm flex items-center gap-2 disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Commit Push
          </button>
        </div>
        {error && <p className="text-xs text-center text-destructive bg-destructive/10 py-1.5 rounded-md mt-2 border border-destructive/20">{error}</p>}
      </form>
    </div>
  );
}
