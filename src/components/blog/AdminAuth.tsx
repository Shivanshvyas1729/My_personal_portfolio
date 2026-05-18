import { useState, useEffect, useRef } from "react";
import { Lock, Unlock, Loader2, ShieldCheck, Key } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { UnifiedAdminDashboard } from "../cms/UnifiedAdminDashboard";
import { motion, AnimatePresence } from "framer-motion";

interface AdminAuthProps {
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
}

export function AdminAuth({ isAdmin, setIsAdmin }: AdminAuthProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { login, logout, hasAccess } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync isAdmin with Context state
  useEffect(() => {
    setIsAdmin(hasAccess("admin") || hasAccess("editor"));
  }, [hasAccess, setIsAdmin]);

  // Global Ctrl + L Keyboard Shortcut to Open Lock Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
        if (!isAdmin) {
          e.preventDefault();
          setIsOpen(true);
          setError("");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAdmin]);

  // Auto-focus and select password input when modal opens
  useEffect(() => {
    if (isOpen && !isAdmin) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50); // small delay to allow transition mount
      return () => clearTimeout(timer);
    }
  }, [isOpen, isAdmin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Pass empty string as username so server uses password-only check. 
    // We try admin first, if it fails backend doesn't care if we just fall back, but ideally we check editor too.
    // For simplicity, we just send "editor" or "admin" based on the password if they match.
    // Since our backend checks if type === 'admin', we can just fire two requests or let the backend do it.
    // Actually, we'll try admin login. If failed, try editor.
    let successLogin = await login("admin", password, "");
    if (!successLogin) {
      successLogin = await login("editor", password, "");
    }
    
    if (successLogin) {
      setSuccess(true);
      setPassword("");
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
      }, 1200);
    } else {
      setError("Incorrect password. Try again.");
    }
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <>
      {/* Discreet bottom-left anchor */}
      <div className="fixed bottom-6 left-6 sm:bottom-10 sm:left-10 z-50">
        {isAdmin ? (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/90 text-destructive-foreground text-sm font-medium shadow-lg hover:scale-105 transition-all backdrop-blur-md"
          >
            <Unlock size={14} /> Logout
          </button>
        ) : (
          <button
            onClick={() => { setIsOpen(!isOpen); setError(""); }}
            className={`p-3 rounded-full border shadow-md transition-all duration-300 backdrop-blur-md
              ${isOpen
                ? "opacity-100 text-primary bg-primary/10 border-primary/30"
                : "opacity-50 hover:opacity-100 text-muted-foreground bg-muted/50 border-border/50 hover:text-primary"
              }`}
            title="Global Site Unlock"
          >
            <Lock size={16} />
          </button>
        )}
      </div>

      {/* Login Popup */}
      <AnimatePresence>
        {isOpen && !isAdmin && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="fixed bottom-20 left-6 sm:bottom-24 sm:left-10 z-[60] w-[260px] p-4 bg-background border border-border/50 rounded-2xl shadow-2xl glass-card"
          >
            <div className="flex items-center gap-2 mb-1 text-foreground font-heading font-medium text-sm">
              <Key size={14} className="text-primary" /> Site Unlock
            </div>
            <p className="text-xs text-muted-foreground mb-3">Enter password to unlock Secret Resources & Blog CMS.</p>

            {success ? (
              <div className="flex items-center justify-center gap-2 py-3 text-green-500 font-medium text-sm animate-in fade-in">
                <ShieldCheck size={16} /> Access Granted!
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-3">
                <input
                  ref={inputRef}
                  type="password"
                  placeholder="Enter site password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-muted/50 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                />

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
                    className="flex-1 px-3 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex justify-center items-center gap-1.5"
                  >
                    {loading ? <Loader2 size={12} className="animate-spin" /> : "Unlock"}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Unified Dashboard Overlay for Authorized Users */}
      {isAdmin && <UnifiedAdminDashboard />}
    </>
  );
}
