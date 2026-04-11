import { useState, useEffect } from "react";
import { Lock, Unlock, Loader2, Key } from "lucide-react";
import { API_ROUTES } from "@/lib/apiClient";

interface AdminAuthProps {
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
}

export function AdminAuth({ isAdmin, setIsAdmin }: AdminAuthProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check existing session on mount
  useEffect(() => {
    const session = sessionStorage.getItem("adminAuth");
    const loginTime = sessionStorage.getItem("adminLoginTime");
    
    if (session === "true" && loginTime) {
      const elapsedMinutes = (Date.now() - parseInt(loginTime)) / (1000 * 60);
      if (elapsedMinutes > 60) {
        // Session expired (60 minute timeout)
        handleLogout();
      } else {
        setIsAdmin(true);
      }
    }
  }, [setIsAdmin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Ping the save-blog endpoint with null blogData to hit the 401 gate only
      const checkRes = await fetch(API_ROUTES.saveBlog, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ password: password.trim(), blogData: null }),
      });

      if (checkRes.ok || checkRes.status === 400) {
        sessionStorage.setItem("adminAuth", "true");
        sessionStorage.setItem("adminLoginTime", Date.now().toString());
        setIsAdmin(true);
        setIsOpen(false);
        setPassword("");
      } else if (checkRes.status === 401) {
        setError("Invalid credentials.");
      } else {
        setError("API error. Ensure the dev server is running (npm run dev).");
      }
    } catch (err) {
      setError("Network fault connecting to Auth Gateway.");
    }

    setLoading(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuth");
    sessionStorage.removeItem("adminLoginTime");
    setIsAdmin(false);
    setIsOpen(false);
  };

  return (
    <>
      {/* Discreet bottom-left anchor */}
      <div className="fixed bottom-6 left-6 sm:bottom-10 sm:left-10 z-50">
        {isAdmin ? (
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-destructive text-destructive-foreground text-sm font-medium shadow-lg hover:scale-105 transition-all"
          >
            <Unlock size={16} /> Admin Logout
          </button>
        ) : (
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`p-3 rounded-full text-muted-foreground bg-muted/50 border border-border/50 shadow-md transition-all duration-300 ${isOpen ? 'opacity-100 text-primary' : 'opacity-60 hover:opacity-100 hover:text-primary'} backdrop-blur-md`}
            title="Authenticate Admin"
          >
            <Lock size={18} />
          </button>
        )}
      </div>

      {/* Login Popup */}
      {isOpen && !isAdmin && (
        <div className="fixed bottom-20 left-6 sm:bottom-24 sm:left-10 z-[60] w-[280px] p-4 bg-background border border-border/50 rounded-2xl shadow-2xl glass-card animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2 mb-4 text-foreground font-heading font-medium">
            <Key size={16} className="text-primary" /> Admin Authentication
          </div>
          
          <form onSubmit={handleLogin} className="space-y-3">
            <div className="space-y-2">
              <input
                type="password"
                placeholder="Enter passphrase..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-muted/50 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                autoFocus
              />
            </div>
            
            {error && <p className="text-xs text-destructive">{error}</p>}
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 px-3 py-2 rounded-lg text-xs font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!password || loading}
                className="flex-1 px-3 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex justify-center items-center"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : "Unlock"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
