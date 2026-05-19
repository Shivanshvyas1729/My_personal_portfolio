import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, FileText, Sun, Moon, ChevronDown, ExternalLink, Palette } from "lucide-react";
import { portfolioData as initialData } from "@/data/portfolioData";
import { useCMSData, useCMSActions } from "@/context/CMSContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";

const THEMES = [
  {
    id: "cyberpunk",
    name: "Cyberpunk Neon 🌌",
    isDark: true,
    primary: "#d946ef",
    accent: "#3b82f6",
    background: "#030712",
    font: "Space Grotesk"
  },
  {
    id: "aurora",
    name: "Midnight Aurora 🧪",
    isDark: true,
    primary: "#10b981",
    accent: "#06b6d4",
    background: "#020617",
    font: "Outfit"
  },
  {
    id: "sunset",
    name: "Sunset Mist 🌅",
    isDark: true,
    primary: "#f97316",
    accent: "#f43f5e",
    background: "#0f172a",
    font: "Poppins"
  },
  {
    id: "emerald",
    name: "Forest Emerald 🌲",
    isDark: true,
    primary: "#34d399",
    accent: "#059669",
    background: "#062f22",
    font: "Outfit"
  },
  {
    id: "luxury",
    name: "Royal Gold 👑",
    isDark: true,
    primary: "#f59e0b",
    accent: "#d97706",
    background: "#080705",
    font: "Space Grotesk"
  },
  {
    id: "dracula",
    name: "Dracula Vampire 🧛",
    isDark: true,
    primary: "#ff79c6",
    accent: "#bd93f9",
    background: "#282a36",
    font: "Space Mono"
  },
  {
    id: "nordic",
    name: "Nordic Frost ❄️",
    isDark: true,
    primary: "#88c0d0",
    accent: "#8fbcbb",
    background: "#2e3440",
    font: "Inter"
  },
  {
    id: "ocean",
    name: "Ocean Breeze 🌊",
    isDark: true,
    primary: "#38bdf8",
    accent: "#0284c7",
    background: "#0f172a",
    font: "Poppins"
  },
  {
    id: "terminal",
    name: "Retro Terminal 📟",
    isDark: true,
    primary: "#f59e0b",
    accent: "#10b981",
    background: "#0c0a09",
    font: "Space Mono"
  },
  {
    id: "minimalist",
    name: "Minimalist Light 💎",
    isDark: false,
    primary: "#2563eb",
    accent: "#4f46e5",
    background: "#f8fafc",
    font: "Inter"
  },
  {
    id: "cherry",
    name: "Cherry Blossom 🌸",
    isDark: false,
    primary: "#ec4899",
    accent: "#f43f5e",
    background: "#fff5f7",
    font: "Outfit"
  },
  {
    id: "lavender",
    name: "Lavender Breeze 🪻",
    isDark: false,
    primary: "#8b5cf6",
    accent: "#a78bfa",
    background: "#f5f3ff",
    font: "Outfit"
  },
  {
    id: "rosegold",
    name: "Rose Gold Champagne 🥂",
    isDark: false,
    primary: "#db2777",
    accent: "#fb7185",
    background: "#fff1f2",
    font: "Outfit"
  },
  {
    id: "espresso",
    name: "Espresso Latte ☕",
    isDark: false,
    primary: "#b45309",
    accent: "#d97706",
    background: "#fdf8f6",
    font: "Poppins"
  }
];

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Services", href: "#services" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "#contact" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [resumeDropdownOpen, setResumeDropdownOpen] = useState(false);
  const [mobileResumeOpen, setMobileResumeOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const { updatePreviewSection } = useCMSActions();
  const settings = useCMSData(d => d.settings);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  useEffect(() => {
    if (!themeDropdownOpen) return;
    const handleClose = () => setThemeDropdownOpen(false);
    window.addEventListener("click", handleClose);
    return () => window.removeEventListener("click", handleClose);
  }, [themeDropdownOpen]);

  // Selector-based data consumption
  const personal = useCMSData(d => d.personal) || initialData.personal;
  const resume = useCMSData(d => d.resume) || initialData.resume;
  
  const resumeUrl = resume?.url || "";
  const visibleCategories = (resume?.categories || []).filter((c: any) => c.visible);
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
      const sections = navLinks.map((l) => l.href.replace("#", ""));
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveSection(id);
          break;
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!resumeDropdownOpen) return;
    const handleClose = () => setResumeDropdownOpen(false);
    window.addEventListener("click", handleClose);
    return () => window.removeEventListener("click", handleClose);
  }, [resumeDropdownOpen]);

  const toggleResumeDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setResumeDropdownOpen(!resumeDropdownOpen);
  };

  const handleClick = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith("/")) {
      navigate(href);
      return;
    }
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.getElementById(href.replace("#", ""))?.scrollIntoView({ behavior: "smooth" });
      }, 400);
    } else {
      setTimeout(() => {
        document.getElementById(href.replace("#", ""))?.scrollIntoView({ behavior: "smooth" });
      }, 400);
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-card py-3" : "py-5"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-4">
        <button onClick={() => handleClick("#home")} className="font-heading text-xl font-bold gradient-text">
          {(personal?.name || initialData.personal.name).split(" ")[0]}
          <span className="text-foreground">.</span>
        </button>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleClick(link.href)}
              className={`text-sm font-medium transition-colors duration-200 ${
                activeSection === link.href.replace("#", "")
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </button>
          ))}
          {resumeUrl && (
            <div className="relative">
              {visibleCategories.length > 0 ? (
                <>
                  <button
                    onClick={toggleResumeDropdown}
                    className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-1.5 rounded-lg border border-primary/40 text-primary hover:bg-primary/10 hover:border-primary transition-all duration-200"
                  >
                    <FileText size={14} />
                    Resume
                    <ChevronDown size={13} className={`transition-transform duration-200 ${resumeDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {resumeDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-52 glass-card rounded-xl border border-primary/20 shadow-2xl p-2 bg-background/95 backdrop-blur-3xl z-[999] flex flex-col gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {visibleCategories.map((cat: any) => (
                          <a
                            key={cat.name}
                            href={cat.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setResumeDropdownOpen(false)}
                            className="flex items-center justify-between text-xs px-3 py-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200 font-medium"
                          >
                            <span>{cat.name}</span>
                            <ExternalLink size={11} className="opacity-60" />
                          </a>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-1.5 rounded-lg border border-primary/40 text-primary hover:bg-primary/10 hover:border-primary transition-all duration-200"
                >
                  <FileText size={14} />
                  Resume
                </a>
              )}
            </div>
          )}

          {/* Theme Toggle Desktop */}
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="p-2 ml-2 rounded-full text-foreground/70 hover:text-foreground hover:bg-muted transition-all duration-300 no-text-effect flex items-center justify-center border border-transparent hover:border-border"
            title="Toggle Theme"
          >
            {isDark ? (
              <Sun size={18} className="text-yellow-500 fill-yellow-500/10" />
            ) : (
              <Moon size={18} className="text-slate-700 fill-slate-700/10" />
            )}
          </button>
        </div>

        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="p-2 rounded-full text-foreground/70 hover:text-foreground hover:bg-muted transition-all no-text-effect flex items-center justify-center border border-border/50"
          >
            {isDark ? (
              <Sun size={18} className="text-yellow-500" />
            ) : (
              <Moon size={18} className="text-slate-700" />
            )}
          </button>
          <button
            className="text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-card/95 border border-border/30 mt-2 mx-4 rounded-xl overflow-hidden transform-gpu relative z-10 shadow-2xl backdrop-blur-none"
          >
            <div className="flex flex-col gap-1 p-4">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleClick(link.href)}
                  className={`w-full block cursor-pointer text-left py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === link.href.replace("#", "")
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {link.label}
                </button>
              ))}
              {resumeUrl && (
                <div className="w-full">
                  {visibleCategories.length > 0 ? (
                    <>
                      <button
                        onClick={() => setMobileResumeOpen(!mobileResumeOpen)}
                        className="w-full flex items-center justify-between py-2 px-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <FileText size={14} />
                          Resume
                        </span>
                        <ChevronDown size={14} className={`transition-transform duration-200 ${mobileResumeOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {mobileResumeOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden pl-4 pr-2 flex flex-col gap-1 border-l border-primary/20 ml-5 my-1"
                          >
                            {visibleCategories.map((cat: any) => (
                              <a
                                key={cat.name}
                                href={cat.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center justify-between text-xs py-2 px-3 rounded-lg text-muted-foreground hover:text-primary transition-all font-medium"
                              >
                                <span>{cat.name}</span>
                                <ExternalLink size={12} className="opacity-60" />
                              </a>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <a
                      href={resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 py-2 px-3 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
                    >
                      <FileText size={14} />
                      Resume
                    </a>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
