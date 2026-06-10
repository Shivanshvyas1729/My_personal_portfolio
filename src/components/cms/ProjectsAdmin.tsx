import React, { useState, useEffect, useMemo } from 'react';
import { Project } from '@/data/portfolioData';
import { Plus, Edit3, Trash2, X, Github, ExternalLink, Star, RefreshCw, BookOpen, Copy, AlertCircle, CheckCircle2, Info, Search } from 'lucide-react';
import { DynamicForm } from './DynamicForm';
import { ProjectSchema } from '@/lib/schema';
const ProjectFormSchema = ProjectSchema.omit({ title: true, description: true });
import { useCMSState } from '@/context/CMSContext';
import { logger } from '@/lib/logger';

// Required fields and their friendly names (for validation log)
const REQUIRED_FIELDS: Record<string, string> = {
  title: 'Project Title',
  description: 'Description',
};

// Example project JSON template pre-filled with descriptive comments
const SCHEMA_EXAMPLE_JSON = `{
  "id": 6,
  "// id": "Unique positive integer. Auto-incremented for new projects.",

  "title": "Solar Panel Defect Detection System",
  "// title": "Clear, impact-oriented title shown on the portfolio grid card",

  "category": ["Deep Learning", "Computer Vision"],
  "// category": "AI/ML sub-field tags used for filtering on the All Projects page",

  "domain": "🏥 Healthcare",
  "// domain": "OPTIONAL — Real-world industry sector. Adds a separate Domain filter. Examples: '🏥 Healthcare', '⚡ Renewable Energy', '🌤️ Meteorology', '🍶 Food & Beverage', '🎵 Media & Entertainment'. Remove this field entirely if not applicable.",

  "description": "An AI-powered solar panel defect detection system using transfer learning with EfficientNet-B0.",
  "// description": "Compelling 1–2 sentence summary of what the project does and its value",

  "tech": ["Python", "PyTorch", "Torchvision", "Streamlit"],
  "// tech": "Core frameworks, tools, and languages used",

  "github": "https://github.com/your-username/project",
  "// github": "Public repository URL (optional — omit if private)",

  "live": "https://your-app.streamlit.app/",
  "// live": "Live demo or deployed app URL (optional)",

  "featured": true,
  "// featured": "Set true to show this on the home page Featured Work carousel",

  "impact": "Reduces manual solar farm inspection time by 80% with automated AI defect classification.",
  "// impact": "One sentence quantifying the real-world operational or business impact",

  "problem_statement": "Manual inspection of solar panels across large farms is slow and costly. Defects like dust, cracks, and electrical damage reduce energy output if undetected.",
  "// problem_statement": "The business or engineering challenge this project solves",

  "learning_outcomes": [
    "Applied EfficientNet-B0 transfer learning for multi-class image classification with limited labelled data",
    "Built a custom PyTorch classification head with BatchNorm, ReLU, and Dropout",
    "Deployed a real-time Streamlit inference app on Streamlit Community Cloud"
  ],
  "// learning_outcomes": "Key skills or techniques you gained from building this project",

  "architecture": "User uploads image → PIL preprocessing → Torchvision normalization → EfficientNet-B0 inference → Top-3 softmax predictions returned with confidence scores.",
  "// architecture": "Text description of system topology, data flow, or pipeline stages",

  "architectureImage": "https://i.ibb.co/.../architecture.png",
  "// architectureImage": "URL to an architecture diagram image (optional)",

  "resources": [
    { "label": "Architecture PDF", "url": "https://drive.google.com/..." }
  ],
  "// resources": "Private/gated assets shown behind a Resources modal button (optional)",

  "open_resources": [
    { "label": "PyTorch EfficientNet Docs", "url": "https://pytorch.org/vision/stable/models/efficientnet.html" },
    { "label": "Kaggle Dataset", "url": "https://www.kaggle.com/datasets/..." }
  ],
  "// open_resources": "Publicly accessible papers, docs, or datasets shown at the bottom of the project page",

  "howItWorks": "1. User uploads a panel image. 2. PIL converts to RGB and resizes to 224×224. 3. Torchvision normalizes to ImageNet stats. 4. EfficientNet-B0 forward pass runs. 5. Softmax returns Top-3 predictions with confidence.",
  "// howItWorks": "Numbered step-by-step walkthrough of the execution pipeline",

  "objectives": [
    "Classify 6 solar panel defect categories with >90% accuracy using transfer learning",
    "Deploy real-time inference app with <500ms response per image"
  ],
  "// objectives": "Measurable engineering goals defined before development started",

  "success_criteria": [
    "Top-1 accuracy exceeds 90% on held-out test set",
    "Streamlit app serves predictions in under 500ms on CPU"
  ],
  "// success_criteria": "Conditions that define when the project is considered complete and successful",

  "data_sources": [
    "https://www.kaggle.com/datasets/pythonafroz/solar-panel-images-for-defect-detection"
  ],
  "// data_sources": "URLs or names of source datasets used for training",

  "data_volume": "2,624 labeled solar panel images across 6 defect classes",
  "// data_volume": "Total size of the dataset (images, rows, tokens, etc.)",

  "class_distribution": "Dust: 22%, Bird Drop: 18%, Electrical Damage: 15%, Physical Damage: 17%, Snow: 13%, Clean: 15%",
  "// class_distribution": "Label balance across classes — highlight imbalance if significant",

  "target_variable": "Defect Class: Bird Drop | Dust | Electrical Damage | Physical Damage | Snow | Clean",
  "// target_variable": "The label, class, or value the model predicts",

  "features": [
    "224×224 RGB pixel tensors normalized to ImageNet statistics",
    "EfficientNet-B0 convolutional feature maps (1280-dim global average pooling output)"
  ],
  "// features": "Input feature representations or engineered columns fed to the model",

  "feature_engineering": [
    "Data augmentation: RandomHorizontalFlip, RandomRotation(±15°), ColorJitter(brightness=0.2)",
    "Stratified 70/15/15 train-validation-test split by class label"
  ],
  "// feature_engineering": "Augmentation, transformation, or feature derivation steps applied (optional)",

  "model_inputs": [
    "Image tensor of shape (batch_size, 3, 224, 224)",
    "Normalized with mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]"
  ],
  "// model_inputs": "Exact shape and format of tensors or data passed into the model",

  "model_outputs": [
    "6-class softmax probability vector of shape (batch_size, 6)",
    "Top-3 (class_name, confidence%) tuples for display"
  ],
  "// model_outputs": "Shape and format of model predictions returned",

  "preprocessing": [
    "PIL image loading and RGB conversion",
    "Resize to 224×224 using Torchvision transforms.Resize",
    "Normalize channels with ImageNet mean and std",
    "Unsqueeze batch dimension: tensor.unsqueeze(0) for single-image inference"
  ],
  "// preprocessing": "Data cleaning, resizing, scaling, or tokenization operations",

  "modeling": [
    "Pretrained EfficientNet-B0 backbone (ImageNet weights, frozen during warmup phase)",
    "Custom head: Linear(1280→512) → BatchNorm1d → ReLU → Dropout(0.3) → Linear(512→6)",
    "Loss function: CrossEntropyLoss with label_smoothing=0.1",
    "Optimizer: Adam(lr=1e-4 backbone, lr=1e-3 head, weight_decay=1e-5)",
    "LR Scheduler: CosineAnnealingLR over 30 epochs"
  ],
  "// modeling": "Model architecture, loss functions, optimizers, and training configuration",

  "hyperparameters": [
    "Backbone LR: 1e-4 | Head LR: 1e-3",
    "Batch Size: 32",
    "Epochs: 30 with early stopping (patience=5)",
    "Dropout Rate: 0.3",
    "Label Smoothing: 0.1",
    "Image Size: 224×224"
  ],
  "// hyperparameters": "Key tunable configuration values used during training (optional)",

  "evaluation_metrics": [
    "Top-1 Classification Accuracy",
    "Weighted F1-Score (accounts for class imbalance)",
    "Top-3 Prediction Accuracy",
    "Mean Inference Latency (ms/image on CPU)"
  ],
  "// evaluation_metrics": "Metrics used to evaluate model quality and operational performance",

  "metrics": {
    "Test Accuracy": "96.2%",
    "ROC-AUC": "0.985",
    "Model Size": "14.5 MB",
    "Dataset Size": "3,654 images",
    "Avg Inference Time": "45ms"
  },
  "// metrics": "Highlighted key-value metrics and statistics displayed as a summary grid in the details view",

  "validation_strategy": "Stratified 70/15/15 train-validation-test split with random_seed=42. Early stopping on validation loss.",
  "// validation_strategy": "How data is split and how overfitting is prevented during training",

  "explainability": "Top-3 softmax probabilities displayed with percentage confidence bars. Planned: Grad-CAM heatmaps to highlight defect regions in the uploaded image.",
  "// explainability": "Explainability method used: Grad-CAM, SHAP, LIME, attention maps, confidence intervals, etc.",

  "training_environment": [
    "Python 3.10, PyTorch 2.1.0, Torchvision 0.16.0",
    "Hardware: NVIDIA T4 GPU (Google Colab Pro)",
    "Training time: ~12 minutes for 30 epochs on T4 GPU"
  ],
  "// training_environment": "Hardware, runtime, and software version details used for training (optional)",

  "deployment": "Streamlit Community Cloud. Model checkpoint (.pth) stored in GitHub repo root. Loaded once at app startup. CPU inference on user-uploaded images.",
  "// deployment": "Production hosting details — cloud platform, container setup, API gateway, or edge runtime",

  "inference_pipeline": [
    "Load model checkpoint from repo at Streamlit app startup",
    "Accept user image via st.file_uploader()",
    "Preprocess: PIL open → RGB → Torchvision transforms → unsqueeze(0)",
    "Forward pass: model.eval() with torch.no_grad()",
    "Softmax output → sort by confidence → return Top-3 (label, %) pairs"
  ],
  "// inference_pipeline": "Step-by-step execution flow from raw input to final prediction output (optional)",

  "monitoring": [
    "Confidence threshold alert: predictions below 60% confidence flagged for manual review",
    "All Top-3 predictions always surfaced in UI for human validation"
  ],
  "// monitoring": "How model outputs are tracked, flagged, or reviewed in production (optional)",

  "versioning": [
    "Model weights versioned as GitHub Releases: v1.0.0 (initial), v1.1.0 (improved head)",
    "Codebase versioned with Git tags matching model release numbers"
  ],
  "// versioning": "How model weights, datasets, and code are version-controlled (optional)",

  "risks": [
    "Accuracy degrades for panel images taken in unusual lighting (overexposed, night-time)",
    "Single-label classification fails for images with multiple co-occurring defects",
    "Streamlit Community Cloud memory limits cap batch inference to ~5 images at once"
  ],
  "// risks": "Known failure modes, edge cases, or operational constraints",

  "ethics": [
    "Dataset sourced from Kaggle under CC0 public domain licence — no proprietary data",
    "Model predictions are advisory only — qualified technicians must confirm before any action",
    "No personally identifiable information is collected or stored"
  ],
  "// ethics": "Data licensing, bias considerations, safety guardrails, or compliance requirements",

  "privacy": [
    "Uploaded images processed in-memory only and never stored server-side",
    "No user data is logged, retained, or shared with any third party"
  ],
  "// privacy": "Data retention policy, encryption, or user privacy protections (optional)",

  "known_limitations": [
    "Cannot detect multiple defect types simultaneously in a single image",
    "Not validated on real-world drone or satellite solar farm imagery",
    "Requires clear, well-lit panel images for reliable classification"
  ],
  "// known_limitations": "Honest list of current model constraints or unresolved shortcomings",

  "future_improvements": [
    "Add Grad-CAM heatmap overlay to visually highlight the defect region in predictions",
    "Extend model to multi-label classification for co-occurring defects",
    "Integrate real-time drone image stream for autonomous field inspection",
    "Fine-tune on proprietary solar farm imagery for higher real-world accuracy"
  ],
  "// future_improvements": "Planned enhancements or next-iteration research directions",

  "knowledge_overrides": [
    {
      "id": "EfficientNet-B0",
      "definition": "A lightweight CNN scaled via compound coefficient across depth, width, and resolution. Used here as a frozen feature extractor backbone with a custom 6-class classification head.",
      "real_world_example": "EfficientNet-B0 achieves 77.1% top-1 accuracy on ImageNet with only 5.3M parameters — ideal for resource-constrained deployment scenarios.",
      "why_used": "Excellent accuracy-to-parameter ratio enables high-quality feature extraction with minimal CPU inference overhead, perfect for Streamlit Community Cloud deployment."
    }
  ],
  "// knowledge_overrides": "Override or extend the global knowledge base for specific terms used in this project. Each entry needs 'id' (exact term match) and optionally: definition, real_world_example, why_used, advantages, limitations."
}`;

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
  const [editorMode, setEditorMode] = useState<'form' | 'code'>('form');
  const [codeValue, setCodeValue] = useState("");
  const [codeError, setCodeError] = useState("");
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);
  const [saveError, setSaveError] = useState("");
  const [showExampleModal, setShowExampleModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const query = searchQuery.toLowerCase().trim();
    return projects.filter(p => {
      const titleMatch = p.title?.toLowerCase().includes(query);
      const descMatch = p.description?.toLowerCase().includes(query);
      const categoryMatch = Array.isArray(p.category) && p.category.some((c: string) => c.toLowerCase().includes(query));
      const techMatch = Array.isArray(p.tech) && p.tech.some((t: string) => t.toLowerCase().includes(query));
      return titleMatch || descMatch || categoryMatch || techMatch;
    });
  }, [projects, searchQuery]);
  // Real-time validation state (Gmail-style: runs on every change)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [showValidationLog, setShowValidationLog] = useState(false);

  // Run Zod validation on every tempProject change
  useEffect(() => {
    const result = ProjectSchema.safeParse(tempProject);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(e => {
        const field = e.path.join('.');
        fieldErrors[field] = e.message;
      });
      setValidationErrors(fieldErrors);
    } else {
      setValidationErrors({});
    }
  }, [tempProject]);

  // Mark a field as touched so errors only show after first interaction
  const markTouched = (field: string) => {
    setTouched(prev => new Set(prev).add(field));
  };

  const isFieldInvalid = (field: string) => touched.has(field) && !!validationErrors[field];
  const isFormValid = Object.keys(validationErrors).filter(k => REQUIRED_FIELDS[k]).length === 0;
  const isSaveDisabled = !isFormValid || (editorMode === 'code' && !!codeError);

  const lastLoggedValueRef = React.useRef("");

  const logCodeValidation = (val: string, source: 'paste' | 'blur') => {
    if (!val.trim()) return;
    if (source === 'blur' && lastLoggedValueRef.current === val) return;
    
    lastLoggedValueRef.current = val;
    
    try {
      const parsed = JSON.parse(val);
      const result = ProjectSchema.safeParse(parsed);
      if (!result.success) {
        logger.addLog({
          action: source === 'paste' ? "CODE_PASTE_VALIDATION_ERROR" : "CODE_EDIT_VALIDATION_ERROR",
          status: "error",
          message: `Project code validation failed: ${result.error.errors.length} required/format issue(s) found.`,
          metadata: {
            type: "validation_error",
            section: "projects",
            source,
            errorCount: result.error.errors.length,
            errors: result.error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))
          }
        });
      } else {
        logger.addLog({
          action: source === 'paste' ? "CODE_PASTE_SUCCESS" : "CODE_EDIT_SUCCESS",
          status: "success",
          message: `Successfully validated project code: "${parsed.title || 'Untitled'}"`
        });
      }
    } catch (err: any) {
      logger.addLog({
        action: source === 'paste' ? "CODE_PASTE_JSON_ERROR" : "CODE_EDIT_JSON_ERROR",
        status: "error",
        message: `Failed to parse project JSON: ${err.message}`,
        metadata: {
          type: "syntax_error",
          source,
          error: err.message,
          textSnippet: val.slice(0, 500)
        }
      });
    }
  };

  const handleCodeChange = (val: string) => {
    setCodeValue(val);
    try {
      const parsed = JSON.parse(val);
      setTempProject(parsed);
      setCodeError("");
    } catch (e: any) {
      setCodeError(`JSON Syntax Error: ${e.message}`);
    }
  };

  const hasPendingChanges = JSON.stringify(projects) !== JSON.stringify(liveData?.projects || []);

  const handleEdit = (project: Project) => {
    setTempProject({ ...project });
    setEditingId(project.id);
    lastLoggedValueRef.current = "";
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
      domain: "🏥 Healthcare",
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
      metrics: {
        "Test Accuracy": "96.2%",
        "ROC-AUC": "0.985",
        "Model Size": "14.5 MB",
        "Dataset Size": "3,654 images",
        "Avg Inference Time": "45ms"
      },
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
    lastLoggedValueRef.current = "";
  };

  const saveEdit = () => {
    if (editorMode === 'code' && codeError) {
      logger.addLog({
        action: "VALIDATION_ERROR",
        status: "error",
        message: `Failed to apply JSON code changes: ${codeError}`,
        metadata: {
          type: "syntax_error",
          source: "save_apply",
          error: codeError,
          textSnippet: codeValue.slice(0, 500)
        }
      });
      setShowValidationLog(true);
      return;
    }

    // Mark all required fields as touched so errors appear
    const allTouched = new Set(touched);
    Object.keys(REQUIRED_FIELDS).forEach(f => allTouched.add(f));
    setTouched(allTouched);

    // Run final validation
    const result = ProjectSchema.safeParse(tempProject);
    if (!result.success) {
      const requiredErrors = result.error.errors.filter(e => REQUIRED_FIELDS[e.path[0]]);
      if (requiredErrors.length > 0) {
        logger.addLog({
          action: "VALIDATION_ERROR",
          status: "error",
          message: `Failed validation: ${requiredErrors.length} required field(s) missing or invalid.`,
          metadata: {
            type: "validation_error",
            section: "projects",
            errorCount: result.error.errors.length,
            errors: result.error.errors.map(e => ({
              field: e.path.join('.'),
              message: e.message
            }))
          }
        });
        setShowValidationLog(true);
        return;
      }
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
    setValidationErrors({});
    setTouched(new Set());
    setShowValidationLog(false);
    lastLoggedValueRef.current = "";
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

      {/* Search Bar */}
      <div className="px-4 mb-4 shrink-0 flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
          <input
            type="text"
            placeholder="Search projects by title, category, tech, or description..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-12 py-2 rounded-xl border border-border/40 bg-background/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all text-foreground"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs font-bold transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        <button
          type="button"
          className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 transition-colors rounded-xl text-sm font-semibold flex items-center gap-1.5 border border-primary/20"
        >
          <Search size={15} /> Search
        </button>
      </div>

      {/* Grid of Projects */}
      <div className="flex-1 overflow-y-auto px-4 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredProjects.length === 0 ? (
            <div className="col-span-full py-16 text-center text-muted-foreground/50 italic border border-dashed border-border/30 rounded-2xl bg-muted/5 flex flex-col items-center justify-center gap-2">
              <Search size={28} className="opacity-30 text-primary" />
              <span className="text-sm font-semibold">No projects found</span>
              <span className="text-xs text-muted-foreground/80 max-w-[280px]">We couldn't find any projects matching "{searchQuery}". Try a different term.</span>
            </div>
          ) :
            filteredProjects.map(p => (
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
      <div className={`absolute inset-0 z-50 flex flex-col overflow-hidden rounded-xl transition-all duration-500 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] ${
        isModalOpen 
          ? 'opacity-100 pointer-events-auto visible' 
          : 'opacity-0 pointer-events-none invisible translate-y-4 scale-[0.98]'
      }`}>
        {/* Backdrop */}
        <div className={`absolute inset-0 bg-background/60 backdrop-blur-sm transition-opacity duration-500 ${
          isModalOpen ? 'opacity-100' : 'opacity-0'
        }`} onClick={closeModal} />
        {/* Panel — slides and scales beautifully */}
        <div 
          className={`glass-card shadow-2xl border-l border-border/50 flex flex-col h-full absolute right-0 top-0 bottom-0 w-full max-w-full transition-all duration-500 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] ${
            isModalOpen ? 'translate-y-0 scale-100' : 'translate-y-8 scale-[0.96]'
          }`} 
          style={{ maxWidth: '100%' }}
        >
             <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/20">
               <div className="flex items-center gap-2">
                 <h3 className="font-bold">{addingNew ? "New Project" : "Edit Project"}</h3>
                 {/* Live validity indicator */}
                 {isFormValid ? (
                   <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                     <CheckCircle2 size={10} /> Ready
                   </span>
                 ) : (
                   <span className="flex items-center gap-1 text-[9px] font-bold text-destructive bg-destructive/10 border border-destructive/20 px-2 py-0.5 rounded-full">
                     <AlertCircle size={10} /> Required fields missing
                   </span>
                 )}
               </div>
               <button onClick={closeModal} className="p-1.5 rounded hover:bg-muted/60 text-muted-foreground transition-colors">
                 <X size={16} />
               </button>
             </div>

             <div className="flex border-b border-border/50 bg-muted/10 shrink-0">
               <button 
                 type="button"
                 disabled={editorMode === 'code' && !!codeError}
                 title={editorMode === 'code' && codeError ? "Please fix JSON syntax errors before switching back to the form" : ""}
                 onClick={() => setEditorMode('form')}
                 className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-colors
                   ${editorMode === 'form' 
                     ? 'border-b-2 border-primary text-primary bg-primary/5' 
                     : 'text-muted-foreground hover:bg-muted/30'}
                   ${editorMode === 'code' && codeError ? 'opacity-50 cursor-not-allowed' : ''}`}
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
             
             {/* ── Validation Log Panel ── */}
             {showValidationLog && (
               <div className="mx-4 mt-3 rounded-xl border border-destructive/40 bg-destructive/5 overflow-hidden">
                 {/* Header */}
                 <div className="flex items-center justify-between px-4 py-2.5 border-b border-destructive/20 bg-destructive/10">
                   <div className="flex items-center gap-2">
                     <AlertCircle size={13} className="text-destructive" />
                     <span className="text-[11px] font-black text-destructive uppercase tracking-wider">
                       Validation Log — {Object.keys(validationErrors).length + (codeError ? 1 : 0)} issue(s) found
                     </span>
                   </div>
                   <button onClick={() => setShowValidationLog(false)} className="text-destructive/60 hover:text-destructive transition-colors p-0.5">
                     <X size={13} />
                   </button>
                 </div>

                 <div className="p-3 space-y-2 max-h-52 overflow-y-auto">
                   {/* JSON Syntax Error */}
                   {codeError && (
                     <div className="flex items-start gap-2.5 p-2 rounded-lg bg-destructive/10 border border-destructive/20">
                       <AlertCircle size={11} className="text-destructive mt-0.5 shrink-0" />
                       <div className="flex-1 min-w-0">
                         <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                           <span className="font-black text-[10px] text-destructive uppercase tracking-wider">Code Editor</span>
                           <span className="px-1.5 py-0.5 rounded bg-destructive text-destructive-foreground text-[8px] font-bold uppercase">REQUIRED</span>
                           <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-[8px] font-bold">→ Check this field</span>
                         </div>
                         <p className="text-[10px] text-muted-foreground leading-relaxed">JSON Syntax Error: {codeError}</p>
                       </div>
                     </div>
                   )}

                   {/* Required field errors — shown first, bright red */}
                   {Object.entries(validationErrors)
                     .filter(([field]) => REQUIRED_FIELDS[field])
                     .map(([field, message]) => (
                       <div key={field} className="flex items-start gap-2.5 p-2 rounded-lg bg-destructive/10 border border-destructive/20">
                         <AlertCircle size={11} className="text-destructive mt-0.5 shrink-0" />
                         <div className="flex-1 min-w-0">
                           <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                             <span className="font-black text-[10px] text-destructive uppercase tracking-wider">
                               {REQUIRED_FIELDS[field]}
                             </span>
                             <span className="px-1.5 py-0.5 rounded bg-destructive text-destructive-foreground text-[8px] font-bold uppercase">REQUIRED</span>
                             <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-[8px] font-bold">→ Check this field</span>
                           </div>
                           <p className="text-[10px] text-muted-foreground leading-relaxed">{message}</p>
                         </div>
                       </div>
                     ))
                   }

                   {/* Optional field warnings — amber, shown below */}
                   {Object.entries(validationErrors)
                     .filter(([field]) => !REQUIRED_FIELDS[field])
                     .map(([field, message]) => {
                       // Make path human-readable: "media.0.url" → "Media › Item 1 › URL"
                       const readablePath = field
                         .split('.')
                         .map((part, i, arr) => {
                           if (!isNaN(Number(part))) return `Item ${Number(part) + 1}`;
                           return part.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
                         })
                         .map(p => p.charAt(0).toUpperCase() + p.slice(1))
                         .join(' › ');
                       return (
                         <div key={field} className="flex items-start gap-2.5 p-2 rounded-lg bg-amber-500/5 border border-amber-500/20">
                           <Info size={11} className="text-amber-500 mt-0.5 shrink-0" />
                           <div className="flex-1 min-w-0">
                             <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                               <span className="font-black text-[10px] text-amber-500 uppercase tracking-wider">{readablePath}</span>
                               <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 text-[8px] font-bold uppercase">OPTIONAL</span>
                               <span className="px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/50 text-[8px] font-bold">→ Check this field</span>
                             </div>
                             <p className="text-[10px] text-muted-foreground leading-relaxed">{message}</p>
                           </div>
                         </div>
                       );
                     })
                   }

                   {/* All clear */}
                   {Object.keys(validationErrors).length === 0 && !codeError && (
                     <div className="flex items-center gap-2 text-[11px] text-emerald-500 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                       <CheckCircle2 size={12} />
                       All fields look good! You can save now.
                     </div>
                   )}
                 </div>

                 {/* Footer tip */}
                 <div className="px-4 py-2 border-t border-destructive/15 bg-muted/10">
                   <p className="text-[10px] text-muted-foreground/70">
                     🔴 <strong>Required</strong> fields must be filled to save.&nbsp;
                     🟡 <strong>Optional</strong> fields have format issues but won't block saving.
                   </p>
                 </div>
               </div>
             )}

             <div className="flex-1 overflow-y-auto p-5">
                {editorMode === 'form' ? (
                  <>
                    {/* Required field guide at top of form */}
                    <div className="mb-4 p-3 rounded-lg bg-muted/20 border border-border/30 flex items-start gap-2">
                      <Info size={12} className="text-primary mt-0.5 shrink-0" />
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        Fields marked <span className="text-destructive font-black">*</span> are <strong className="text-foreground">required</strong>.
                        Validation runs as you type — errors appear instantly like Gmail.
                      </p>
                    </div>

                    {/* Title — required, validated in real-time */}
                    <div className="mb-4">
                      <label className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider mb-1.5">
                        Project Title
                        <span className="text-destructive font-black text-[11px]">*</span>
                      </label>
                      <input
                        type="text"
                        value={(tempProject as any).title ?? ''}
                        onChange={e => { setTempProject({...tempProject, title: e.target.value}); markTouched('title'); }}
                        onBlur={() => markTouched('title')}
                        placeholder="e.g. Cancer Detection with Explainable AI"
                        className={`w-full px-3 py-2.5 rounded-lg border text-sm bg-background text-foreground focus:outline-none transition-all ${
                          isFieldInvalid('title')
                            ? 'border-destructive/70 ring-1 ring-destructive/40 focus:border-destructive'
                            : touched.has('title') && !(validationErrors['title'])
                            ? 'border-emerald-500/50 ring-1 ring-emerald-500/20'
                            : 'border-border/40 focus:border-primary/60 focus:ring-1 focus:ring-primary/30'
                        }`}
                      />
                      {isFieldInvalid('title') && (
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-destructive font-semibold">
                          <AlertCircle size={10} />
                          {validationErrors['title']}
                        </div>
                      )}
                      {touched.has('title') && !validationErrors['title'] && (
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-500 font-semibold">
                          <CheckCircle2 size={10} /> Looks good!
                        </div>
                      )}
                    </div>

                    {/* Description — required, validated in real-time */}
                    <div className="mb-4">
                      <label className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider mb-1.5">
                        Description
                        <span className="text-destructive font-black text-[11px]">*</span>
                      </label>
                      <textarea
                        rows={3}
                        value={(tempProject as any).description ?? ''}
                        onChange={e => { setTempProject({...tempProject, description: e.target.value}); markTouched('description'); }}
                        onBlur={() => markTouched('description')}
                        placeholder="A compelling 1-2 sentence summary of what the project does..."
                        className={`w-full px-3 py-2.5 rounded-lg border text-sm bg-background text-foreground focus:outline-none transition-all resize-none ${
                          isFieldInvalid('description')
                            ? 'border-destructive/70 ring-1 ring-destructive/40 focus:border-destructive'
                            : touched.has('description') && !validationErrors['description']
                            ? 'border-emerald-500/50 ring-1 ring-emerald-500/20'
                            : 'border-border/40 focus:border-primary/60 focus:ring-1 focus:ring-primary/30'
                        }`}
                      />
                      {isFieldInvalid('description') && (
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-destructive font-semibold">
                          <AlertCircle size={10} />
                          {validationErrors['description']}
                        </div>
                      )}
                      {touched.has('description') && !validationErrors['description'] && (
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-500 font-semibold">
                          <CheckCircle2 size={10} /> Looks good!
                        </div>
                      )}
                    </div>

                    {/* Separator before rest of form */}
                    <div className="mb-4 pb-2 border-b border-border/30">
                      <span className="text-[10px] text-muted-foreground/60 font-semibold uppercase tracking-wider">Optional Fields</span>
                    </div>

                    {/* Rest of form — all optional fields */}
                    <DynamicForm 
                      schema={ProjectFormSchema} 
                      data={tempProject} 
                      onChange={data => {
                        setTempProject(prev => ({...data, title: prev.title, description: prev.description}));
                      }} 
                    />
                  </>
                ) : (
                  <div className="flex flex-col h-full min-h-[300px]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                          JSON Code Syntax
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowExampleModal(true)}
                          className="px-2 py-0.5 text-[9px] font-bold text-primary bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all rounded-md flex items-center gap-1 uppercase tracking-wider"
                        >
                          <BookOpen size={10} /> Show Example
                        </button>
                      </div>
                      <span className="text-[9px] text-primary/70 font-semibold">
                        Edit raw project attributes below
                      </span>
                    </div>
                    <textarea
                      value={codeValue}
                      onChange={(e) => handleCodeChange(e.target.value)}
                      onPaste={(e) => {
                        const pastedText = e.clipboardData.getData('text');
                        logCodeValidation(pastedText, 'paste');
                      }}
                      onBlur={(e) => {
                        logCodeValidation(e.target.value, 'blur');
                      }}
                      className="flex-1 w-full min-h-[320px] font-mono text-[11px] p-4 bg-muted/30 border border-border/50 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all text-foreground resize-none leading-relaxed"
                      placeholder="Paste or edit project JSON code here..."
                    />
                    {codeError && (
                      <div className="mt-2 p-2.5 bg-destructive/10 border border-destructive/25 text-destructive rounded-lg font-medium text-[10px] leading-relaxed flex items-start gap-1.5">
                        <AlertCircle size={12} className="mt-0.5 shrink-0" />
                        <span>{codeError}</span>
                      </div>
                    )}
                  </div>
                )}
             </div>

             <div className="p-4 border-t border-border/50 bg-muted/10">
               {/* Validation summary row above buttons */}
               {!isFormValid && (
                 <div
                   className="mb-3 flex items-center gap-2 p-2.5 rounded-lg bg-destructive/8 border border-destructive/25 cursor-pointer hover:bg-destructive/12 transition-colors"
                   onClick={() => setShowValidationLog(v => !v)}
                 >
                   <AlertCircle size={13} className="text-destructive shrink-0" />
                   <p className="text-[10px] text-destructive font-semibold flex-1">
                     {Object.keys(validationErrors).filter(k => REQUIRED_FIELDS[k]).length} required field(s) need attention before saving
                   </p>
                   <span className="text-[9px] text-destructive/70 font-bold uppercase tracking-wider">
                     {showValidationLog ? 'Hide Details ▲' : 'Show Details ▼'}
                   </span>
                 </div>
               )}
               <div className="flex justify-end gap-2">
                 <button onClick={closeModal} className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted text-muted-foreground transition-colors">
                   Cancel
                 </button>
                 <button
                   onClick={saveEdit}
                   disabled={isSaveDisabled}
                   title={editorMode === 'code' && codeError ? 'Please fix JSON syntax errors first' : (!isFormValid ? 'Fill required fields first' : 'Apply changes to preview')}
                   className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                     !isSaveDisabled
                       ? 'bg-primary/20 text-primary hover:bg-primary/30'
                       : 'bg-muted/40 text-muted-foreground/50 cursor-not-allowed'
                   }`}
                 >
                   Apply to Preview
                 </button>
                 {mode === 'local' ? (
                   <button 
                     onClick={async () => {
                       const updated = saveEdit();
                       if (updated) setTimeout(() => onSave(updated), 0);
                     }}
                     disabled={isSaveDisabled}
                     title={editorMode === 'code' && codeError ? 'Please fix JSON syntax errors first' : (!isFormValid ? 'Fill required fields first' : 'Save to local file')}
                     className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg ${
                       !isSaveDisabled
                         ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                         : 'bg-muted/50 text-muted-foreground/50 cursor-not-allowed'
                     }`}
                   >
                     Apply & Save to Local
                   </button>
                 ) : (
                   <button 
                     onClick={async () => {
                       const updated = saveEdit();
                       if (updated) setTimeout(() => onSave(updated), 0);
                     }}
                     disabled={isSaveDisabled}
                     title={editorMode === 'code' && codeError ? 'Please fix JSON syntax errors first' : (!isFormValid ? 'Fill required fields first' : 'Sync to GitHub')}
                     className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg ${
                       !isSaveDisabled
                         ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                         : 'bg-muted/50 text-muted-foreground/50 cursor-not-allowed'
                     }`}
                   >
                     Apply & Sync to GitHub
                   </button>
                 )}
               </div>
             </div>
          </div>
        </div>
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

      {/* Commented Schema Example Modal */}
      {showExampleModal && (
        <div className="absolute inset-0 z-[60] flex flex-col p-4 animate-in fade-in duration-150 rounded-xl overflow-hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/85 backdrop-blur-md" onClick={() => setShowExampleModal(false)} />
          
          {/* Dialog Container */}
          <div className="glass-card shadow-2xl border border-primary/20 rounded-xl flex flex-col h-full absolute inset-4 z-10 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-primary/5">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-primary" />
                <h4 className="font-bold text-sm text-foreground">Project Schema Field Reference</h4>
              </div>
              <button 
                onClick={() => setShowExampleModal(false)} 
                className="p-1.5 rounded hover:bg-muted/80 text-muted-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-5 font-mono text-[10.5px] leading-relaxed bg-muted/20">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-border/30">
                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">
                  Fully Commented JSON Template (Valid Syntax)
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(SCHEMA_EXAMPLE_JSON);
                    setCopySuccess(true);
                    setTimeout(() => setCopySuccess(false), 2000);
                  }}
                  className="px-2.5 py-1 bg-primary text-primary-foreground hover:bg-primary/95 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all active:scale-95 shadow-sm"
                >
                  <Copy size={11} /> {copySuccess ? "Copied!" : "Copy Code"}
                </button>
              </div>
              <pre className="text-foreground bg-muted/40 p-4 rounded-lg border border-border/30 overflow-x-auto select-text whitespace-pre">
                {SCHEMA_EXAMPLE_JSON}
              </pre>
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-border/50 bg-muted/10 flex justify-end">
              <button 
                onClick={() => setShowExampleModal(false)} 
                className="px-4 py-1.5 bg-primary/10 text-primary hover:bg-primary/25 rounded-lg text-xs font-semibold transition-colors"
              >
                Close Reference
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
