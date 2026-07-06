import React, { useState, useEffect } from "react";
import { z } from "zod";
import { DynamicForm } from "./DynamicForm";
import { useCMSState } from "@/context/CMSContext";
import { RefreshCw, Save, Database, Plus, Trash2, Edit3, X, CheckCircle2, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { KnowledgeDefinition, KNOWLEDGE_CATEGORIES, KnowledgeCategory } from "@/data/knowledge/categories";
import { KnowledgeTooltip } from "../portfolio/KnowledgeTooltip";
import { KnowledgeHealthCheck } from "./KnowledgeHealthCheck";

const KnowledgeDefinitionSchema = z.object({
  id: z.string().describe("Unique lowercase identifier (e.g., 'f1_score')"),
  title: z.string().describe("Display Name (e.g., 'F1-Score')"),
  primary_category: z.enum(KNOWLEDGE_CATEGORIES as unknown as [string, ...string[]]).describe("High-level grouping"),
  difficulty_level: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]).optional(),
  term_type: z.enum(["Metric", "Concept", "Algorithm", "Tool", "Process", "Architecture", "Other"]).optional(),
  aliases: z.array(z.string()).optional().describe("Alternative names to match against"),
  secondary_tags: z.array(z.string()).optional(),
  definition: z.string().describe("Primary simple explanation"),
  real_world_example: z.string().optional().describe("An analogy or real world example to explain it simply"),
  why_used: z.string().optional().describe("The business or technical reason we use this"),
  interview_point: z.string().optional().describe("Key point to remember for technical interviews"),
  advantages: z.array(z.string()).optional(),
  limitations: z.array(z.string()).optional(),
  formula: z.string().optional(),
  good_value: z.string().optional(),
  use_cases: z.array(z.string()).optional(),
  related_terms: z.array(z.string()).optional(),
});

const KNOWLEDGE_DOMAINS = [
  { id: "evaluation-metrics", title: "Evaluation Metrics", file: "src/data/knowledge/evaluation-metrics.json" },
  { id: "machine-learning", title: "Machine Learning", file: "src/data/knowledge/machine-learning.json" },
  { id: "deep-learning", title: "Deep Learning", file: "src/data/knowledge/deep-learning.json" },
  { id: "computer-vision", title: "Computer Vision", file: "src/data/knowledge/computer-vision.json" },
  { id: "nlp", title: "NLP & Text", file: "src/data/knowledge/nlp.json" },
  { id: "llm-rag", title: "LLM & RAG", file: "src/data/knowledge/llm-rag.json" },
  { id: "agents", title: "AI Agents", file: "src/data/knowledge/agents.json" },
  { id: "preprocessing", title: "Preprocessing", file: "src/data/knowledge/preprocessing.json" },
  { id: "feature-engineering", title: "Feature Engineering", file: "src/data/knowledge/feature-engineering.json" },
  { id: "validation", title: "Validation Strategies", file: "src/data/knowledge/validation.json" },
  { id: "explainability", title: "Explainability", file: "src/data/knowledge/explainability.json" },
  { id: "deployment", title: "Deployment", file: "src/data/knowledge/deployment.json" },
  { id: "mlops", title: "MLOps", file: "src/data/knowledge/mlops.json" },
  { id: "risks", title: "Risks & Mitigations", file: "src/data/knowledge/risks.json" },
  { id: "ethics", title: "Ethics", file: "src/data/knowledge/ethics.json" },
  { id: "privacy", title: "Privacy", file: "src/data/knowledge/privacy.json" },
  { id: "software-engineering", title: "Software Engineering", file: "src/data/knowledge/software-engineering.json" },
  { id: "cloud", title: "Cloud Services", file: "src/data/knowledge/cloud.json" },
  { id: "databases", title: "Databases", file: "src/data/knowledge/databases.json" },
  { id: "vector-databases", title: "Vector Databases", file: "src/data/knowledge/vector-databases.json" },
];

export const KnowledgeMatrixAdmin = () => {
  const { cmsMode, forceLocalMode, isLocalEnvironment } = useCMSState();
  const [activeDomain, setActiveDomain] = useState(KNOWLEDGE_DOMAINS[0]);
  const [data, setData] = useState<KnowledgeDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // In-memory cache for loaded domains
  const [domainCache, setDomainCache] = useState<Record<string, KnowledgeDefinition[]>>({});
  
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempDef, setTempDef] = useState<Partial<KnowledgeDefinition>>({});
  const [showGuide, setShowGuide] = useState(false);
  
  const mode = (forceLocalMode || cmsMode === 'local') ? 'local' : 'github';

  const updateData = (newData: KnowledgeDefinition[]) => {
    setData(newData);
    setDomainCache(prev => ({ ...prev, [activeDomain.id]: newData }));
  };

  const loadDomainData = async (domain: typeof KNOWLEDGE_DOMAINS[0], forceReload = false) => {
    if (!forceReload && domainCache[domain.id]) {
      setData(domainCache[domain.id]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/cms-knowledge?filePath=${encodeURIComponent(domain.file)}&mode=${mode}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      const loadedData = Array.isArray(json) ? json : [];
      setData(loadedData);
      setDomainCache(prev => ({ ...prev, [domain.id]: loadedData }));
    } catch (e: unknown) {
      toast.error(`Could not load ${domain.title}. It might be empty or missing.`);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDomainData(activeDomain);
  }, [activeDomain]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        filePath: activeDomain.file,
        sectionKey: "root", // Ignored for JSON
        newData: data,
        isSafeMode: false,
        role: "admin",
        mode: mode
      };

      const res = await fetch("/api/cms-save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (res.ok && result.success) {
        toast.success(`Saved ${activeDomain.title} to ${mode}!`);
      } else {
        throw new Error(result.error || "Failed to save");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const openEditor = (idx: number | null) => {
    if (idx !== null && idx !== -1) {
      setTempDef(data[idx]);
    } else {
      setTempDef({
        id: "",
        title: "",
        primary_category: activeDomain.title as unknown as KnowledgeCategory,
        definition: ""
      });
    }
    setEditingIndex(idx);
  };

  const saveEditor = () => {
    if (!tempDef.id || !tempDef.title || !tempDef.definition) {
      toast.error("ID, Title, and Definition are required.");
      return;
    }

    const newData = [...data];
    if (editingIndex !== null && editingIndex !== -1) {
      newData[editingIndex] = tempDef as KnowledgeDefinition;
    } else {
      // Avoid duplicate IDs
      if (newData.some(d => d.id === tempDef.id)) {
        toast.error("A definition with this ID already exists.");
        return;
      }
      newData.push(tempDef as KnowledgeDefinition);
    }

    updateData(newData);
    setEditingIndex(null);
    toast.success("Definition updated locally. Don't forget to save!");
  };

  const deleteDef = (idx: number) => {
    if (window.confirm("Are you sure you want to delete this definition?")) {
      const newData = [...data];
      newData.splice(idx, 1);
      updateData(newData);
      toast.success("Deleted. Don't forget to save.");
    }
  };

  return (
    <div className="flex w-full h-full">
      {/* Domain Sidebar */}
      <div className="w-[220px] shrink-0 border-r border-border/40 bg-muted/10 overflow-y-auto flex flex-col p-3">
        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2 flex items-center gap-1.5">
          <Database size={12} /> Knowledge Domains
        </h3>
        <div className="space-y-1">
          {KNOWLEDGE_DOMAINS.map(domain => (
            <button
              key={domain.id}
              onClick={() => {
                if (editingIndex !== null) {
                  if (!window.confirm("Discard unsaved edits to the current definition?")) return;
                  setEditingIndex(null);
                }
                setActiveDomain(domain);
              }}
              className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                activeDomain.id === domain.id 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
            >
              {domain.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full bg-background/20 relative">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-border/40 bg-muted/5 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold">{activeDomain.title}</h2>
            <p className="text-xs text-muted-foreground mt-1 font-mono">{activeDomain.file}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowGuide(true)}
              className="px-3 py-1.5 rounded-lg border border-border/50 bg-background text-xs font-semibold hover:bg-muted transition-colors flex items-center gap-1.5"
            >
              <HelpCircle size={14} /> Read Guide
            </button>
            <button
              onClick={() => loadDomainData(activeDomain, true)}
              disabled={isLoading || isSaving}
              className="px-3 py-1.5 rounded-lg border border-border/50 bg-background text-xs font-semibold hover:bg-muted transition-colors flex items-center gap-1.5"
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} /> Reload
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || isSaving}
              className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-1.5"
            >
              {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />} 
              {mode === 'local' ? 'Save Local' : 'Push to GitHub'}
            </button>
          </div>
        </div>

        {/* Workspace */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 relative">
          {editingIndex !== null ? (
            <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/30">
                <h3 className="font-bold text-lg">{editingIndex === -1 ? 'New Definition' : 'Edit Definition'}</h3>
                <button onClick={() => setEditingIndex(null)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                  <X size={16} />
                </button>
              </div>

              <div className="grid lg:grid-cols-[1fr,300px] gap-6">
                <div>
                  <DynamicForm
                    schema={KnowledgeDefinitionSchema}
                    data={tempDef}
                    onChange={(val) => setTempDef(val)}
                  />
                  <div className="mt-6 flex justify-end gap-3 border-t border-border/30 pt-4">
                    <button onClick={() => setEditingIndex(null)} className="px-4 py-2 text-sm font-semibold border border-border/50 rounded-xl hover:bg-muted">Cancel</button>
                    <button onClick={saveEditor} className="px-5 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-xl shadow-md hover:bg-primary/90 flex items-center gap-1.5">
                      <CheckCircle2 size={16} /> Apply Edit
                    </button>
                  </div>
                </div>

                {/* Live Preview Tooltip */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Live Tooltip Preview</h4>
                  <div className="bg-background border border-primary/20 rounded-xl p-4 shadow-xl min-h-[300px]">
                    <KnowledgeTooltip term={tempDef.title || "Preview Term"} overrides={tempDef as Record<string, unknown>} />
                    <p className="text-[10px] text-muted-foreground mt-4 text-center">Hover over the term above to see the tooltip render exactly as it will appear on the site.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <KnowledgeHealthCheck domains={KNOWLEDGE_DOMAINS} />
              
              <button
                onClick={() => openEditor(-1)}
                className="w-full py-3 border border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Add New Definition
              </button>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.map((def, idx) => (
                  <div key={def.id || idx} className="bg-background border border-border/40 rounded-xl p-4 hover:border-primary/30 transition-colors group relative">
                    <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditor(idx)} className="p-1.5 bg-muted hover:bg-primary hover:text-primary-foreground text-muted-foreground rounded-md transition-colors"><Edit3 size={12} /></button>
                      <button onClick={() => deleteDef(idx)} className="p-1.5 bg-muted hover:bg-destructive hover:text-destructive-foreground text-muted-foreground rounded-md transition-colors"><Trash2 size={12} /></button>
                    </div>

                    <h4 className="font-bold text-foreground mb-1 pr-14">{def.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{def.definition}</p>
                    
                    <div className="flex flex-wrap items-center gap-1.5 mt-3">
                      <span className="text-[9px] font-mono bg-muted/50 px-1.5 py-0.5 rounded text-muted-foreground border border-border/30">{def.id}</span>
                      {def.difficulty_level && <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500">{def.difficulty_level}</span>}
                    </div>
                  </div>
                ))}
              </div>
              
              {data.length === 0 && !isLoading && (
                <div className="text-center py-12 border border-dashed border-border/40 rounded-xl bg-muted/5">
                  <Database size={32} className="mx-auto text-muted-foreground/30 mb-3" />
                  <p className="font-semibold text-foreground">No definitions found</p>
                  <p className="text-xs text-muted-foreground mt-1">Click "Add New Definition" to start building your knowledge matrix.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border/50 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-border/30 flex items-center justify-between shrink-0 bg-primary/5">
              <div className="flex items-center gap-2">
                <Database className="text-primary" size={20} />
                <h3 className="font-bold text-lg text-foreground">Knowledge Matrix Guide</h3>
              </div>
              <button 
                onClick={() => setShowGuide(false)} 
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-5 text-sm leading-relaxed text-muted-foreground">
              <div>
                <h4 className="font-bold text-foreground text-sm mb-1.5">🧠 What is the Knowledge Matrix?</h4>
                <p>
                  The Knowledge Matrix is a centralized database of technical definitions, concept cards, algorithms, metrics, and software engineering terms. It serves as an interactive glossary across your portfolio.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-foreground text-sm mb-1.5">⚡ How is this data used?</h4>
                <p>
                  The portfolio website automatically scans all project descriptions, success criteria, learning outcomes, and blog posts. If it finds a keyword that matches any term's <strong>ID</strong>, <strong>Title</strong>, or <strong>Aliases</strong>, it automatically highlights it and shows a beautiful <strong>educational tooltip</strong> when hovered.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-foreground text-sm mb-1.5">⚙️ How to manage definitions:</h4>
                <ul className="list-disc pl-5 space-y-1 mt-1">
                  <li><strong>Add New:</strong> Click the "Add New Definition" button to add a term to the current category.</li>
                  <li><strong>Save:</strong> Click "Push to GitHub" (or "Save Local" in local mode) to persist all modifications.</li>
                  <li><strong>Aliases:</strong> Provide synonyms to match the term in different grammatical contexts (e.g., matching "accuracy" and "accuracies").</li>
                  <li><strong>Project Overrides:</strong> If a specific project requires a more customized definition of a term, you can override it directly in the Projects Admin panel by matching the term's ID.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-foreground text-sm mb-1.5">📂 Data Storage:</h4>
                <p>
                  Each knowledge domain is stored as an independent JSON array file inside the <code className="bg-muted px-1.5 py-0.5 rounded text-primary text-xs">src/data/knowledge/</code> directory. Keeping them separated prevents git conflicts and enables fast, target-based loads.
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-border/30 bg-muted/20 flex justify-end shrink-0">
              <button 
                onClick={() => setShowGuide(false)} 
                className="px-5 py-2 bg-primary text-primary-foreground font-bold rounded-xl shadow-md hover:bg-primary/90 transition-all text-xs"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
