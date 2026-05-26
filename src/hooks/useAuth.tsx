import { createContext, useContext, useState, ReactNode } from "react";

type Role = "public" | "blog" | "secret" | "admin" | "editor";

interface AuthContextType {
  roles: Role[];
  isSuperAdmin: boolean;
  login: (type: "blog" | "secret" | "admin" | "editor", password?: string, username?: string) => Promise<boolean>;
  logout: () => void;
  hasAccess: (role: Role) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [roles, setRoles] = useState<Role[]>(["public"]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const login = async (type: "blog" | "secret" | "admin" | "editor", password?: string, username?: string) => {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, username, password }),
      });
      const data = await res.json();
      if (data.success && data.role) {
        setRoles((prev) => {
          if (!prev.includes(data.role)) return [...prev, data.role];
          return prev;
        });
        
        if (data.isSuperAdmin) {
          setIsSuperAdmin(true);
        }
        
        // Store password in session for authorized actions (e.g. save/delete)
        // This avoids hardcoding passwords in the JS bundle.
        if (password) {
          sessionStorage.setItem("sitePassword", password);
        }
        
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setRoles(["public"]);
    setIsSuperAdmin(false);
    sessionStorage.removeItem("sitePassword");
    sessionStorage.removeItem("adminAuth");
  };

  const hasAccess = (requiredRole: Role) => {
    if (roles.includes("admin")) return true;
    return roles.includes(requiredRole);
  };

  return (
    <AuthContext.Provider value={{ roles, isSuperAdmin, login, logout, hasAccess }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
