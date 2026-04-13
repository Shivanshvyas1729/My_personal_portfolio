import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, FileText, ExternalLink, ShieldAlert, Loader2 } from "lucide-react";
import type { Project } from "@/data/portfolioData";
import { useAuth } from "@/hooks/useAuth";

interface ResourcesModalProps {
  project: Project;
  children?: React.ReactNode;
}

export function ResourcesModal({ project, children }: ResourcesModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, hasAccess } = useAuth();
  const isAuthenticated = hasAccess("secret");
  const [loading, setLoading] = useState(false);

  // Check auth status when modal opens
  useEffect(() => {
    if (isOpen) {
      setPassword("");
      setError("");
    }
  }, [isOpen]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await login("secret", password);
    if (success) {
      setError("");
    } else {
      setError("Incorrect password. Please try again.");
    }
    setLoading(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  // Safe checks: If no resources, we shouldn't really render the button.
  // But defensively, handle it gracefully.
  const hasResources = project.resources && project.resources.length > 0;

  if (!hasResources) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children ? (
          <div onClick={(e) => e.stopPropagation()} className="inline-block">
            {children}
          </div>
        ) : (
          <button 
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group/link mb-0"
            onClick={(e) => e.stopPropagation()}
          >
            <Lock size={14} className="group-hover/link:text-primary transition-colors" /> Resources
          </button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md w-[95vw]" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Project Resources
          </DialogTitle>
          <DialogDescription>
            Access protected resources for {project.title}.
          </DialogDescription>
        </DialogHeader>

        {isAuthenticated ? (
          <div className="space-y-4 mt-2">
            <div className="rounded-md bg-muted/50 p-4">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Available Resources
              </h4>
              
              {hasResources ? (
                <ul className="space-y-2">
                  {project.resources?.map((resource, i) => (
                    <li key={i}>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2 rounded hover:bg-background border border-transparent hover:border-border transition-all text-sm group"
                      >
                        <span className="font-medium text-foreground/80 group-hover:text-foreground line-clamp-1 pr-2">
                          {resource.label}
                        </span>
                        <ExternalLink className="w-4 h-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground italic text-center py-4">No resources available for this project.</p>
              )}
              
            </div>

          </div>
        ) : (
          <form onSubmit={handleAuth} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="password">Access Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter global resources password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                className={error ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {error && (
                <p className="text-sm text-destructive flex items-center gap-1.5 mt-1">
                  <ShieldAlert className="w-4 h-4" /> {error}
                </p>
              )}
            </div>
            
            <Button type="submit" disabled={loading} className="w-full mt-4">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Unlock Resources"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
