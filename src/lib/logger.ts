export type AuditStatus = "pending" | "success" | "error";

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  status: AuditStatus;
  message: string;
  metadata?: any;
}

type LogListener = (logs: AuditEntry[]) => void;

class AuditLogger {
  private logs: AuditEntry[] = [];
  private listeners: LogListener[] = [];
  private readonly MAX_LOGS = 100;

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("error", (event) => {
        if (event.message?.includes("ResizeObserver loop")) return;
        this.addLog({
          action: "UNCAUGHT_ERROR",
          status: "error",
          message: event.message || "Uncaught runtime exception occurred.",
          metadata: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            errorStack: event.error?.stack || null,
            errorMessage: event.error?.message || event.message
          }
        });
      });

      window.addEventListener("unhandledrejection", (event) => {
        const error = event.reason;
        this.addLog({
          action: "UNHANDLED_REJECTION",
          status: "error",
          message: error?.message || "Unhandled Promise rejection occurred.",
          metadata: {
            errorStack: error?.stack || null,
            errorMessage: error?.message || String(error)
          }
        });
      });
    }
  }

  private notify() {
    this.listeners.forEach(l => l([...this.logs]));
  }

  private getFormattedTime() {
    return new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  }

  addLog(entry: Omit<AuditEntry, "id" | "timestamp">) {
    const newLog: AuditEntry = {
      ...entry,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: this.getFormattedTime()
    };

    this.logs = [newLog, ...this.logs].slice(0, this.MAX_LOGS);
    
    // Console output for development
    if (import.meta.env.DEV) {
      const color = entry.status === 'success' ? '#10b981' : entry.status === 'error' ? '#ef4444' : '#3b82f6';
      console.log(
        `%c[CMS:${entry.status.toUpperCase()}] %c${entry.action}: ${entry.message}`,
        `color: ${color}; font-weight: bold;`,
        'color: inherit;',
        entry.metadata || ''
      );
    }

    this.notify();
  }

  getLogs() {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
    this.notify();
  }

  subscribe(listener: LogListener) {
    this.listeners.push(listener);
    listener([...this.logs]);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Legacy compatibility / Convenience methods
  info(message: string, metadata?: any) {
    this.addLog({ action: "INFO", status: "pending", message, metadata });
  }

  warn(message: string, metadata?: any) {
    this.addLog({ action: "WARN", status: "pending", message, metadata });
  }

  error(message: string, metadata?: any) {
    this.addLog({ action: "ERROR", status: "error", message, metadata });
  }
}

export const logger = new AuditLogger();
