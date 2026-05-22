import React, { createContext, useContext, useState, useMemo, useCallback, ReactNode, useEffect, useRef } from "react";
import { portfolioData as initialPortfolioData, PortfolioData } from "@/data/portfolioData";
import { logger, AuditEntry } from "@/lib/logger";
import { toast } from "sonner";
import YAML from "yaml";

interface CMSState {
  previewMode: boolean;
  safeMode: boolean;
  liveData: PortfolioData;
  previewData: PortfolioData;
  activeSection: string | null;
  cmsMode: "local" | "github" | "unknown";
  forceLocalMode: boolean;
  isLocalEnvironment: boolean;
  auditLogs: AuditEntry[];
  canUndo: boolean;
  canRedo: boolean;
}

interface CMSActions {
  setPreviewMode: (val: boolean) => void;
  setSafeMode: (val: boolean) => void;
  setForceLocalMode: (val: boolean) => void;
  updatePreviewSection: (section: string, data: any) => void;
  updateLiveSection: (section: string, data: any) => void;
  updateNestedField: (path: string, value: any) => void;
  setActiveSection: (sec: string | null) => void;
  refreshData: () => Promise<void>;
  clearLogs: () => void;
  undo: () => void;
  redo: () => void;
  restoreStateFromCommit: (sha: string, filePath: string) => Promise<boolean>;
}

const CMSStateContext = createContext<CMSState | undefined>(undefined);
const CMSActionsContext = createContext<CMSActions | undefined>(undefined);

export const CMSProvider = ({ children }: { children: ReactNode }) => {
  const [previewMode, setPreviewMode] = useState(false);
  const [safeMode, setSafeMode] = useState(false);
  const [cmsMode, setCmsMode] = useState<"local" | "github" | "unknown">("unknown");
  // Load cached data from localStorage if available to prevent one-second dynamic data flash on page load
  const [liveData, setLiveData] = useState<PortfolioData>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("cms-cached-portfolio-data");
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (e) {
        console.warn("Failed to parse cached portfolio data", e);
      }
    }
    return initialPortfolioData;
  });

  const [previewData, setPreviewData] = useState<PortfolioData>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("cms-cached-portfolio-data");
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (e) {
        console.warn("Failed to parse cached portfolio data", e);
      }
    }
    return initialPortfolioData;
  });
  const [activeSection, setActiveSection] = useState<string | null>(null);
  
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [forceLocalMode, setForceLocalMode] = useState(false);

  // Undo/Redo Stacks
  const [undoStack, setUndoStack] = useState<PortfolioData[]>([]);
  const [redoStack, setRedoStack] = useState<PortfolioData[]>([]);

  const isLocalEnvironment = useMemo(() => {
    return typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  }, []);

  // Client-only initialization to prevent hydration mismatch and restore state
  useEffect(() => {
    const savedForceLocal = localStorage.getItem("cms-force-local") === "true";
    if (savedForceLocal) setForceLocalMode(true);

    try {
      const savedPreview = sessionStorage.getItem("cms-preview-data");
      const savedUndo = sessionStorage.getItem("cms-undo-stack");
      const savedRedo = sessionStorage.getItem("cms-redo-stack");
      
      if (savedPreview) {
        setPreviewData(JSON.parse(savedPreview));
        logger.addLog({
          action: "RECOVER_SESSION",
          status: "success",
          message: "[CRM-HISTORY] Recovered active preview session from temporary storage."
        });
      }
      if (savedUndo) setUndoStack(JSON.parse(savedUndo));
      if (savedRedo) setRedoStack(JSON.parse(savedRedo));
    } catch (e: any) {
      console.warn("Failed to load temporary history from sessionStorage", e);
      logger.addLog({
        action: "RECOVER_SESSION",
        status: "error",
        message: `[CRM-HISTORY] Failed to recover active history stacks: ${e.message}`
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cms-force-local", String(forceLocalMode));
  }, [forceLocalMode]);

  // Subscribe to Logger
  useEffect(() => {
    return logger.subscribe(setAuditLogs);
  }, []);

  // Sync current stacks helper
  const syncStorage = (preview: PortfolioData, undo: PortfolioData[], redo: PortfolioData[]) => {
    try {
      sessionStorage.setItem("cms-preview-data", JSON.stringify(preview));
      sessionStorage.setItem("cms-undo-stack", JSON.stringify(undo));
      sessionStorage.setItem("cms-redo-stack", JSON.stringify(redo));
    } catch (err: any) {
      console.warn("Session storage sync failure:", err);
    }
  };

  // Capture current state for Undo before applying changes
  const pushToUndo = useCallback((stateBeforeChange: PortfolioData) => {
    // Stringify comparison to prevent duplicate consecutive states
    setUndoStack(prev => {
      if (prev.length > 0 && JSON.stringify(prev[prev.length - 1]) === JSON.stringify(stateBeforeChange)) {
        return prev;
      }
      const nextStack = [...prev, stateBeforeChange].slice(-25); // Max 25 depth (well above required 2)
      
      // Reset redo stack on a new user modification action
      setRedoStack([]);
      sessionStorage.removeItem("cms-redo-stack");
      
      try {
        sessionStorage.setItem("cms-undo-stack", JSON.stringify(nextStack));
      } catch (err) {
        console.warn("Failed to persist undo stack", err);
      }

      logger.addLog({
        action: "CREATE_SNAPSHOT",
        status: "success",
        message: "[CRM-HISTORY] State snapshot created."
      });

      return nextStack;
    });
  }, []);

  const refreshData = useCallback(async () => {
    try {
      logger.addLog({ action: "REFRESH_DATA", status: "pending", message: "Fetching live content..." });
      
      let portDataResult: any = null;
      let projDataResult: any = null;
      let blogDataResult: any = null;

      if (isLocalEnvironment) {
        // Local mode: Fetch from local backend serverless routes in parallel
        const [portRes, projRes, blogRes] = await Promise.all([
          fetch("/api/cms-load?filePath=src/data/portfolio.yaml"),
          fetch("/api/cms-load?filePath=src/data/projects.yaml"),
          fetch("/api/cms-load?filePath=src/data/blog.yaml")
        ]);

        const [portJson, projJson, blogJson] = await Promise.all([
          portRes.json(),
          projRes.json(),
          blogRes.json()
        ]);

        if (portJson.mode) setCmsMode(portJson.mode);

        portDataResult = portJson.success && portJson.data ? portJson.data : null;
        projDataResult = projJson.success && projJson.data?.projects ? projJson.data.projects : null;
        blogDataResult = blogJson.success && blogJson.data?.blog ? blogJson.data.blog : null;
      } else {
        // Production mode: Fetch directly from raw GitHub CDN in parallel
        // Completely bypasses Vercel Serverless execution and GitHub API rate limits
        setCmsMode("github");
        
        const RAW_BASE = "https://raw.githubusercontent.com/Shivanshvyas1729/My_personal_portfolio/main/src/data";
        // 5-minute cache-busting interval balances instant sync with aggressive browser caching
        const cacheBuster = Math.floor(Date.now() / 300000); 

        const [portRes, projRes, blogRes] = await Promise.all([
          fetch(`${RAW_BASE}/portfolio.yaml?t=${cacheBuster}`),
          fetch(`${RAW_BASE}/projects.yaml?t=${cacheBuster}`),
          fetch(`${RAW_BASE}/blog.yaml?t=${cacheBuster}`)
        ]);

        if (!portRes.ok || !projRes.ok || !blogRes.ok) {
          throw new Error("GitHub Raw CDN data load failed");
        }

        const [portYaml, projYaml, blogYaml] = await Promise.all([
          portRes.text(),
          projRes.text(),
          blogRes.text()
        ]);

        portDataResult = YAML.parse(portYaml);
        projDataResult = YAML.parse(projYaml)?.projects || null;
        blogDataResult = YAML.parse(blogYaml)?.blog || null;
      }

      let combinedData = { ...initialPortfolioData };
      if (portDataResult) combinedData = { ...combinedData, ...portDataResult };
      if (projDataResult) combinedData = { ...combinedData, projects: projDataResult };
      if (blogDataResult) combinedData = { ...combinedData, blog: blogDataResult };

      setLiveData(combinedData);
      
      // Update local storage cache to prevent asynchronous layout flash on future loads
      try {
        localStorage.setItem("cms-cached-portfolio-data", JSON.stringify(combinedData));
      } catch (err) {
        console.warn("Failed to save portfolio data to local storage cache", err);
      }

      // If we don't have active local edits in sessionStorage, sync previewData
      if (!sessionStorage.getItem("cms-preview-data")) {
        setPreviewData(combinedData);
      }
      
      logger.addLog({ 
        action: "REFRESH_DATA", 
        status: "success", 
        message: "Live content synchronized successfully." 
      });
    } catch (e: any) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      logger.addLog({ action: "REFRESH_DATA", status: "error", message: `Failed to fetch data: ${errorMsg}`, metadata: e });
      toast.error("CMS Sync Failed");
    }
  }, [isLocalEnvironment]);

  // Initial Sync
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const updatePreviewSection = useCallback((section: string, data: any) => {
    setPreviewMode(true); // Automatically ensure preview is active so changes show immediately
    setPreviewData(prev => {
      // Avoid recording snapshot if there is no actual change
      if (JSON.stringify(prev[section]) === JSON.stringify(data)) {
        return prev;
      }

      pushToUndo(prev);

      const next = {
        ...prev,
        [section]: data
      } as PortfolioData;

      try {
        sessionStorage.setItem("cms-preview-data", JSON.stringify(next));
      } catch (err) {
        console.warn("Failed to save preview data to session storage", err);
      }

      logger.addLog({ 
        action: "UPDATE_PREVIEW", 
        status: "success", 
        message: `Modified ${section} in preview.`,
        metadata: { section }
      });
      return next;
    });
  }, [pushToUndo]);

  const updateLiveSection = useCallback((section: string, data: any) => {
    setLiveData(prev => {
      const next = {
        ...prev,
        [section]: data
      } as PortfolioData;
      
      try {
        localStorage.setItem("cms-cached-portfolio-data", JSON.stringify(next));
      } catch (err) {
        console.warn("Failed to update local storage cache", err);
      }
      
      return next;
    });
    // Also sync previewData so the CRM panel stays consistent
    setPreviewData(prev => ({
      ...prev,
      [section]: data
    } as PortfolioData));
  }, []);

  const updateNestedField = useCallback((path: string, value: any) => {
    setPreviewMode(true); // Automatically ensure preview is active so changes show immediately
    setPreviewData(prev => {
      pushToUndo(prev);

      const keys = path.split('.');
      const next = { ...prev };
      let current: any = next;
      
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        current[key] = Array.isArray(current[key]) ? [...current[key]] : { ...current[key] };
        current = current[key];
      }
      
      current[keys[keys.length - 1]] = value;
      
      try {
        sessionStorage.setItem("cms-preview-data", JSON.stringify(next));
      } catch (err) {
        console.warn("Failed to save preview data to session storage", err);
      }

      return next;
    });
  }, [pushToUndo]);

  // Undo implementation
  const undo = useCallback(() => {
    if (undoStack.length === 0) {
      logger.addLog({ 
        action: "UNDO", 
        status: "error", 
        message: "[CRM-UNDO] Failed undo: no history exists" 
      });
      toast.warning("Nothing to undo");
      return;
    }

    setUndoStack(prevUndo => {
      const nextUndo = [...prevUndo];
      const prevState = nextUndo.pop();
      if (!prevState) return prevUndo;

      setPreviewData(current => {
        setRedoStack(prevRedo => {
          const nextRedo = [...prevRedo, current];
          syncStorage(prevState, nextUndo, nextRedo);
          return nextRedo;
        });
        return prevState;
      });

      logger.addLog({ 
        action: "UNDO", 
        status: "success", 
        message: "[CRM-UNDO] Last action reverted successfully." 
      });
      toast.success("Last change reverted");
      return nextUndo;
    });
  }, [undoStack]);

  // Redo implementation
  const redo = useCallback(() => {
    if (redoStack.length === 0) {
      logger.addLog({ 
        action: "REDO", 
        status: "error", 
        message: "[CRM-REDO] Failed redo: no redo history exists" 
      });
      toast.warning("Nothing to redo");
      return;
    }

    setRedoStack(prevRedo => {
      const nextRedo = [...prevRedo];
      const nextState = nextRedo.pop();
      if (!nextState) return prevRedo;

      setPreviewData(current => {
        setUndoStack(prevUndo => {
          const nextUndo = [...prevUndo, current];
          syncStorage(nextState, nextUndo, nextRedo);
          return nextUndo;
        });
        return nextState;
      });

      logger.addLog({ 
        action: "REDO", 
        status: "success", 
        message: "[CRM-REDO] Action restored successfully." 
      });
      toast.success("Action restored");
      return nextRedo;
    });
  }, [redoStack]);

  // GitHub Recovery Layer Rollback
  const restoreStateFromCommit = useCallback(async (sha: string, filePath: string): Promise<boolean> => {
    logger.addLog({
      action: "RESTORE_COMMIT",
      status: "pending",
      message: `[CRM-ROLLBACK] Fetching state from Git commit SHA ${sha.substring(0, 7)}...`
    });

    try {
      const res = await fetch(`/api/cms-commit-content?filePath=${encodeURIComponent(filePath)}&sha=${sha}`);
      
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const result = await res.json();
      if (!result.success || !result.data) {
        throw new Error(result.error || "Invalid response data structure");
      }

      // Check if it's projects list, blogs list, or portfolio settings
      const isProject = filePath.includes("projects.yaml");
      const isBlog = filePath.includes("blog.yaml");
      const key = isBlog ? "blog" : (isProject ? "projects" : null);

      setPreviewData(prev => {
        pushToUndo(prev);

        let next: PortfolioData;
        if (key) {
          next = {
            ...prev,
            [key]: result.data[key] || result.data
          } as PortfolioData;
        } else {
          // Merge top level portfolio settings
          next = {
            ...prev,
            ...result.data
          } as PortfolioData;
        }

        try {
          sessionStorage.setItem("cms-preview-data", JSON.stringify(next));
        } catch (err) {
          console.warn("Failed to sync session storage", err);
        }

        logger.addLog({
          action: "RESTORE_COMMIT",
          status: "success",
          message: `[CRM-ROLLBACK] Restored state from commit SHA ${sha.substring(0, 7)}.`
        });
        toast.success(`Restored preview state from commit ${sha.substring(0, 7)}!`);
        return next;
      });

      return true;
    } catch (err: any) {
      logger.addLog({
        action: "RESTORE_COMMIT",
        status: "error",
        message: `[CRM-ROLLBACK] Failed rollback: ${err.message}`,
        metadata: { sha, filePath }
      });
      toast.error(`GitHub API rollback failed: ${err.message}`);
      return false;
    }
  }, [pushToUndo]);

  // Global Keyboard Shortcuts (Ctrl+Z / Cmd+Z / Ctrl+Y / Cmd+Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;
      
      if (modifier && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if (modifier && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  const stateValue = useMemo(() => ({
    previewMode,
    safeMode,
    liveData,
    previewData,
    activeSection,
    cmsMode,
    forceLocalMode,
    isLocalEnvironment,
    auditLogs,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0
  }), [previewMode, safeMode, liveData, previewData, activeSection, cmsMode, forceLocalMode, isLocalEnvironment, auditLogs, undoStack.length, redoStack.length]);

  const actionsValue = useMemo(() => ({
    setPreviewMode,
    setSafeMode,
    setForceLocalMode,
    updatePreviewSection,
    updateLiveSection,
    updateNestedField,
    setActiveSection,
    refreshData,
    clearLogs: () => logger.clearLogs(),
    undo,
    redo,
    restoreStateFromCommit
  }), [setPreviewMode, setSafeMode, setForceLocalMode, updatePreviewSection, updateLiveSection, updateNestedField, setActiveSection, refreshData, undo, redo, restoreStateFromCommit]);

  return (
    <CMSStateContext.Provider value={stateValue}>
      <CMSActionsContext.Provider value={actionsValue}>
        {children}
        
        {/* UI Indicators */}
        {previewMode && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full shadow-lg backdrop-blur-md animate-pulse">
            Preview Mode Active
          </div>
        )}
        {safeMode && (
          <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[100] bg-amber-500/90 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md backdrop-blur-md">
            Safe Mode (No Commits)
          </div>
        )}
      </CMSActionsContext.Provider>
    </CMSStateContext.Provider>
  );
};

export const useCMSState = () => {
  const ctx = useContext(CMSStateContext);
  if (!ctx) throw new Error("useCMSState must be used within a CMSProvider");
  return ctx;
};

export const useCMSActions = () => {
  const ctx = useContext(CMSActionsContext);
  if (!ctx) throw new Error("useCMSActions must be used within a CMSProvider");
  return ctx;
};

export function useCMSData<T>(selector: (data: PortfolioData) => T): T {
  const { previewMode, previewData, liveData } = useCMSState();
  const data = previewMode ? previewData : liveData;
  
  return useMemo(() => {
    try {
      return selector(data);
    } catch (e) {
      console.warn("CMS Selector failed, returning fallback from initialData", e);
      return selector(initialPortfolioData);
    }
  }, [data, selector]);
}

export const useCMS = () => {
  const state = useCMSState();
  const actions = useCMSActions();
  return { ...state, ...actions };
};
