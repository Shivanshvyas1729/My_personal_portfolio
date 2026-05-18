import React, { useState } from 'react';
import { Project } from '@/data/portfolioData';
import { Plus, Edit3, Trash2, X, Github, ExternalLink, Star, RefreshCw } from 'lucide-react';
import { DynamicForm } from './DynamicForm';
import { ProjectSchema } from '@/lib/schema';
import { useCMSState } from '@/context/CMSContext';

interface ProjectsAdminProps {
  projects: Project[];
  onChange: (projects: Project[]) => void;
  onSave: (data?: Project[]) => Promise<{ success: boolean; error?: string } | undefined>;
  isLoading: boolean;
  mode: "local" | "github" | "unknown";
}

export const ProjectsAdmin: React.FC<ProjectsAdminProps> = ({ projects, onChange, onSave, isLoading, mode }) => {
  const { liveData } = useCMSState();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [tempProject, setTempProject] = useState<Partial<Project>>({});
  const [saveError, setSaveError] = useState("");
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);

  // Code editor states
  const [editorMode, setEditorMode] = useState<'form' | 'code'>('form');
  const [codeValue, setCodeValue] = useState("");
  const [codeError, setCodeError] = useState("");

  const handleCodeChange = (val: string) => {
    setCodeValue(val);
    try {
      const parsed = JSON.parse(val);
      if (!parsed.title || !parsed.description) {
        setCodeError("Title and Description are required in your project code.");
        return;
      }
      setTempProject(parsed);
      setCodeError("");
    } catch (e: any) {
      setCodeError(`JSON Syntax Error: ${e.message}`);
    }
  };

  const hasPendingChanges = JSON.stringify(projects) !== JSON.stringify(liveData.projects);

  const handleEdit = (project: Project) => {
    setTempProject({ ...project });
    setEditingId(project.id);
  };

  const handleAddNew = () => {
    // Determine highest ID
    const highestId = projects.reduce((max, p) => (p.id || 0) > max ? p.id : max, 0);
    setTempProject({
      id: highestId + 1,
      title: "",
      category: ["Deep Learning", "Computer Vision"],
      description: "An AI-powered solar panel defect detection system...",
      tech: ["Python", "PyTorch", "Streamlit"],
      github: "https://github.com/...",
      live: "https://...",
      featured: false,
      media: [
        {
          type: "image",
          url: "https://i.ibb.co/..."
        }
      ],
      problem_statement: "Explain the core challenge/problem your project solves...",
      learning_outcomes: [
        "Architected custom Transfer Learning models",
        "Streamlined containerized MLOps pipelines"
      ],
      architecture: "Describe the underlying server and execution flow...",
      architectureImage: "https://...",
      resources: [
        {
          label: "Research Paper",
          url: "https://..."
        }
      ],
      howItWorks: "Detailed description of the pipeline flow...",
      objectives: [
        "Achieve >95% operational classification accuracy",
        "Minimize detection inference latency to under 150ms"
      ],
      success_criteria: [
        "F1-score of at least 0.94 across imbalanced defect labels",
        "Zero memory leakage during continuous Streamlit socket connections"
      ],
      data_sources: [
        "https://www.kaggle.com/datasets/..."
      ],
      target_variable: "Defect Label (Dust, Bird Drops, Physical Damage, Clean)",
      features: [
        "Grayscale luminance histogram values",
        "Normalized RGB color channel moments"
      ],
      preprocessing: [
        "Resize all input frames to 224x224 pixels",
        "Perform Z-score standardization using ImageNet statistics"
      ],
      modeling: [
        "Transfer Learning utilizing pre-trained EfficientNet-B0 weights",
        "Linear dense head with dropout regularization"
      ],
      evaluation_metrics: [
        "Weighted F1-Score (Primary metric due to class skew)",
        "Macro Recall (Secondary metric to ensure high detection sensitivity)"
      ],
      validation_strategy: "5-Fold stratified cross-validation split across localized images",
      explainability: "Integrated Grad-CAM heatmaps showing exact visual pixels triggering defect predictions",
      deployment: "Deployed as a Streamlit server connected to an AWS ECS Fargate container instance",
      risks: [
        "Sensitivity to low lighting or deep shadow variations",
        "Potential false positives on reflective panel borders"
      ],
      ethics: [
        "All data gathered from public and consented community databases",
        "Algorithms audited to prevent biased false detections across regional modules"
      ],
      open_resources: [
        {
          label: "Research Drive Folder",
          url: "https://drive.google.com/..."
        }
      ]
    });
    setAddingNew(true);
  };

  const saveEdit = () => {
    if (editorMode === 'code' && codeError) {
      alert("Please fix all JSON syntax errors before saving: " + codeError);
      return;
    }

    if (!tempProject.title || !tempProject.description) {
      alert("Title and Description are required.");
      return;
    }

    let updated: Project[];
    if (addingNew) {
      updated = [tempProject as Project, ...projects];
    } else {
      updated = projects.map(p => p.id === tempProject.id ? tempProject as Project : p);
    }
    onChange(updated);
    closeModal();
    return updated;
  };

  const handleDeleteClick = (id: number) => {
    setProjectToDelete(id);
  };

  const confirmDelete = () => {
    if (projectToDelete !== null) {
      const updated = projects.filter(p => p.id !== projectToDelete);
      onChange(updated);
      setProjectToDelete(null);
      setTimeout(() => onSave(updated), 0);
    }
  };

  const closeModal = () => {
    setEditingId(null);
    setAddingNew(false);
    setTempProject({});
    setEditorMode('form');
    setCodeValue("");
    setCodeError("");
  };

  const isModalOpen = editingId !== null || addingNew;

  return (
    <div className="flex flex-col h-full bg-background relative">
      <div className="flex flex-col xs:flex-row xs:items-center justify-between mb-4 px-4 pt-4 shrink-0 gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-foreground font-heading">Manage Projects</h3>
          {hasPendingChanges && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[9px] font-bold uppercase tracking-wider border border-amber-500/20">
              Pending
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAddNew}
            className="flex-1 xs:flex-none px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 transition-colors rounded-lg text-xs font-medium flex items-center justify-center gap-1.5"
          >
            <Plus size={14} /> New
          </button>
          <button
            onClick={async () => {
              setSaveError("");
              const result = await onSave();
              if (result && !result.success) {
                setSaveError(result.error || "Save failed.");
              }
            }}
            disabled={isLoading || !hasPendingChanges}
            className="flex-1 xs:flex-none px-4 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-lg text-xs font-medium disabled:opacity-50 flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            {isLoading ? <><RefreshCw size={12} className="animate-spin" /> ...</> : (mode === 'local' ? "Save Local" : "Sync Cloud")}
          </button>
        </div>
      </div>
      {saveError && (
        <div className="mx-4 mb-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-[10px] font-medium leading-relaxed">
          ⚠️ {saveError}
        </div>
      )}

      {/* Grid of Projects */}
      <div className="flex-1 overflow-y-auto px-4 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {projects.map(p => (
            <div key={p.id} className="group glass-card border border-border/50 rounded-xl p-4 flex flex-col hover:border-primary/40 transition-colors relative">
              <div className="absolute top-2 right-2 flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(p)} className="p-2 bg-muted hover:bg-primary/10 hover:text-primary rounded text-muted-foreground transition-colors shadow-sm border border-border/50">
                  <Edit3 size={12} />
                </button>
                <button onClick={() => handleDeleteClick(p.id)} className="p-2 bg-muted hover:bg-destructive/10 hover:text-destructive rounded text-muted-foreground transition-colors shadow-sm border border-border/50">
                  <Trash2 size={12} />
                </button>
              </div>
              
              <div className="flex items-start gap-2 mb-1.5 pr-20 xs:pr-0 sm:pr-16">
                {p.featured && <Star size={12} className="text-yellow-500 fill-yellow-500 mt-1 shrink-0" />}
                <h4 className="font-bold text-[13px] text-foreground leading-tight">{p.title}</h4>
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-2 mb-3">{p.description}</p>
              
              <div className="mt-auto flex flex-wrap items-center gap-2">
                <div className="flex gap-1 flex-wrap flex-1 min-w-0">
                  {p.tech?.slice(0, 2).map(t => (
                    <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50">{t}</span>
                  ))}
                  {p.tech && p.tech.length > 2 && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50">+{p.tech.length - 2}</span>}
                </div>
                <div className="flex gap-2 shrink-0 items-center">
                  {p.github && <Github size={12} className="text-muted-foreground/60" />}
                  {p.live && <ExternalLink size={12} className="text-muted-foreground/60" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor Modal — fills the CMS matrix panel exactly, never overflows */}
      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex flex-col animate-in fade-in duration-150 overflow-hidden rounded-xl">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={closeModal} />
          {/* Panel — slides in from right, capped to parent width */}
          <div className="glass-card shadow-2xl border-l border-border/50 flex flex-col h-full absolute right-0 top-0 bottom-0 w-full max-w-full" style={{ maxWidth: '100%' }}>
             <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/20">
               <h3 className="font-bold">{addingNew ? "New Project" : "Edit Project"}</h3>
               <button onClick={closeModal} className="p-1.5 rounded hover:bg-muted/60 text-muted-foreground transition-colors">
                 <X size={16} />
               </button>
             </div>

             <div className="flex border-b border-border/50 bg-muted/10 shrink-0">
               <button 
                 type="button"
                 onClick={() => setEditorMode('form')}
                 className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-colors
                   ${editorMode === 'form' 
                     ? 'border-b-2 border-primary text-primary bg-primary/5' 
                     : 'text-muted-foreground hover:bg-muted/30'}`}
               >
                 Standard Form
               </button>
               <button 
                 type="button"
                 onClick={() => {
                   setEditorMode('code');
                   setCodeValue(JSON.stringify(tempProject, null, 2));
                   setCodeError("");
                 }}
                 className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-colors
                   ${editorMode === 'code' 
                     ? 'border-b-2 border-primary text-primary bg-primary/5' 
                     : 'text-muted-foreground hover:bg-muted/30'}`}
               >
                 Add Using Code
               </button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-5">
                {editorMode === 'form' ? (
                  <DynamicForm 
                    schema={ProjectSchema} 
                    data={tempProject} 
                    onChange={setTempProject} 
                  />
                ) : (
                  <div className="flex flex-col h-full min-h-[300px]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                        JSON Code Syntax
                      </span>
                      <span className="text-[9px] text-primary/70 font-semibold">
                        Edit raw project attributes below
                      </span>
                    </div>
                    <textarea
                      value={codeValue}
                      onChange={(e) => handleCodeChange(e.target.value)}
                      className="flex-1 w-full min-h-[320px] font-mono text-[11px] p-4 bg-muted/30 border border-border/50 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all text-foreground resize-none leading-relaxed"
                      placeholder="Paste or edit project JSON code here..."
                    />
                    {codeError && (
                      <div className="mt-2 p-2.5 bg-destructive/10 border border-destructive/25 text-destructive rounded-lg font-medium text-[10px] leading-relaxed">
                        ⚠️ {codeError}
                      </div>
                    )}
                  </div>
                )}
             </div>

             <div className="p-4 border-t border-border/50 bg-muted/10 flex justify-end gap-2">
               <button onClick={closeModal} className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted text-muted-foreground transition-colors">
                 Cancel
               </button>
               <button onClick={saveEdit} className="px-4 py-2 bg-primary/20 text-primary rounded-lg text-sm font-medium hover:bg-primary/30 transition-colors">
                 Apply to Preview
               </button>
               {mode === 'local' ? (
                 <button 
                   onClick={async () => {
                     const updated = saveEdit();
                     setTimeout(() => onSave(updated), 0);
                   }} 
                   className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg"
                 >
                   Apply & Save to Local
                 </button>
               ) : (
                 <button 
                   onClick={async () => {
                     const updated = saveEdit();
                     setTimeout(() => onSave(updated), 0);
                   }} 
                   className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg"
                 >
                   Apply & Sync to GitHub
                 </button>
               )}
             </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {projectToDelete !== null && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150 rounded-xl">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/65 backdrop-blur-sm" onClick={() => setProjectToDelete(null)} />
          {/* Dialog Card */}
          <div className="glass-card max-w-sm w-full p-6 border border-destructive/30 rounded-xl relative z-10 flex flex-col items-center text-center shadow-2xl animate-in zoom-in-95 duration-200" style={{ backdropFilter: 'blur(16px)' }}>
            <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-4">
              <Trash2 size={20} />
            </div>
            <h3 className="text-base font-bold text-foreground mb-2">Delete Project?</h3>
            <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-foreground">"{projects.find(p => p.id === projectToDelete)?.title}"</span>? This will apply to the local preview instantly, and you can sync it to the cloud afterward.
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setProjectToDelete(null)}
                className="flex-1 px-4 py-2 border border-border/50 bg-muted hover:bg-muted/80 text-muted-foreground rounded-lg text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg text-xs font-semibold transition-colors shadow-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
