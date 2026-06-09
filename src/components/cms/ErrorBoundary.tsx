import React, { Component, ErrorInfo, ReactNode } from "react";
import { logger } from "../../lib/logger";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error inside ErrorBoundary:", error, errorInfo);
    
    // Add structured REACT_CRASH log entry with stack traces
    logger.addLog({
      action: "REACT_CRASH",
      status: "error",
      message: `React render crash: ${error.message}`,
      metadata: {
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack,
        componentStack: errorInfo.componentStack
      }
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 my-4 rounded-xl border border-destructive/30 bg-destructive/5 flex flex-col gap-4 text-left shadow-lg select-none max-w-2xl mx-auto animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/15 text-destructive shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                {this.props.fallbackTitle || "Something went wrong rendering this component"}
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                The crash was intercepted and logged in the Matrix Audit Logs. You can review the details below.
              </p>
            </div>
          </div>

          <div className="bg-black/40 rounded-lg p-3.5 border border-border/20 space-y-2">
            <span className="text-[10px] font-bold text-destructive uppercase tracking-wider block">Error Log Details:</span>
            <div className="font-mono text-[9px] text-muted-foreground leading-relaxed overflow-x-auto max-h-48 whitespace-pre-wrap select-text pr-1 scrollbar-thin">
              {this.state.error?.toString()}
              {this.state.error?.stack && `\n\nStack:\n${this.state.error.stack}`}
            </div>
          </div>

          <button
            type="button"
            onClick={this.handleReset}
            className="w-full py-2.5 bg-destructive/15 hover:bg-destructive/25 border border-destructive/30 rounded-lg text-xs font-bold text-destructive hover:text-destructive-foreground transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <RefreshCw size={13} /> Recover View & Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
