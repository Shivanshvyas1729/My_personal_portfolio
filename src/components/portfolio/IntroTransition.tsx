import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────────────────
export type IntroStyle = "namaste" | "pulse" | "academic" | "terminal" | "minimal" | "creative";

export interface IntroConfig {
  style?: IntroStyle;
  primaryText?: string;
  subtitle?: string;
  tagline?: string;
  colors?: string[];
  duration?: number;
}

interface IntroTransitionProps extends IntroConfig {
  onComplete: () => void;
}

type Phase = "enter" | "hold" | "exit";

// ─── Default palette per style ───────────────────────────────────────────────
const DEFAULT_PALETTES: Record<IntroStyle, string[]> = {
  namaste:  ["#38bdf8", "#818cf8", "#e879f9", "#f472b6"],
  pulse:    ["#34d399", "#6ee7b7", "#059669", "#10b981"],
  academic: ["#f59e0b", "#fcd34d", "#92400e", "#d97706"],
  terminal: ["#4ade80", "#86efac", "#16a34a", "#22d3ee"],
  minimal:  ["#e2e8f0", "#cbd5e1", "#94a3b8", "#64748b"],
  creative: ["#f97316", "#fb923c", "#a855f7", "#ec4899"],
};

// ─── Floating Particle ───────────────────────────────────────────────────────
const Particle = ({ delay, color }: { delay: number; color: string }) => {
  const angle = Math.random() * 360;
  const dist  = 80 + Math.random() * 240;
  const size  = 1.5 + Math.random() * 3;
  const x = Math.cos((angle * Math.PI) / 180) * dist;
  const y = Math.sin((angle * Math.PI) / 180) * dist;
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ width: size, height: size, backgroundColor: color, boxShadow: `0 0 ${size * 3}px ${color}`, left: "50%", top: "50%", translateX: "-50%", translateY: "-50%" }}
      initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
      animate={{ x: [0, x * 0.4, x], y: [0, y * 0.4, y], opacity: [0, 1, 0], scale: [0, 1.6, 0] }}
      transition={{ duration: 1.8 + Math.random() * 0.8, delay, ease: [0.2, 0.8, 0.4, 1] }}
    />
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ── STYLE: NAMASTE (Spiritual / Wellness / Portfolio) ──────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
const NamasteStyle = ({ primaryText, subtitle, tagline, colors, phase }: {
  primaryText: string; subtitle: string; tagline: string; colors: string[]; phase: Phase;
}) => {
  const letters = primaryText.split("");
  const [showParticles, setShowParticles] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShowParticles(true), 300);
    return () => clearTimeout(t);
  }, []);
  const allColors = [...colors, ...DEFAULT_PALETTES.namaste].slice(0, 8);
  const particles = Array.from({ length: 42 }, (_, i) => ({ id: i, color: allColors[i % allColors.length], delay: i * 0.018 }));

  return (
    <>
      {/* Ambient orbs */}
      <motion.div className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${colors[0]}20 0%, ${colors[1]}10 50%, transparent 70%)`, filter: "blur(40px)" }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute w-[350px] h-[350px] rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${colors[2]}15 0%, transparent 70%)`, filter: "blur(60px)" }}
        animate={{ scale: [1.1, 0.9, 1.1], opacity: [0.3, 0.8, 0.3], x: [-30, 30, -30], y: [20, -20, 20] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />

      {/* S-curve laser */}
      <svg viewBox="0 0 1000 1000" fill="none" className="absolute inset-0 w-full h-full pointer-events-none z-10 p-10 md:p-16" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="ni-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            {colors.map((c, i) => <stop key={i} offset={`${(i / (colors.length - 1)) * 100}%`} stopColor={c} />)}
          </linearGradient>
        </defs>
        <motion.path d="M 100,850 C 100,350 900,650 900,150" stroke={`${colors[0]}12`} strokeWidth="2" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: "easeOut" }} />
        <motion.path d="M 100,850 C 100,350 900,650 900,150" stroke="url(#ni-grad)" strokeWidth="5" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.3))' }}
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: [0, 1, 1, 1], opacity: [0, 0.95, 0.5, 0] }}
          transition={{ times: [0, 0.35, 0.65, 1], duration: 2.4, ease: [0.25, 1, 0.5, 1] }} />
        <motion.path d="M 100,850 C 100,350 900,650 900,150" stroke="white" strokeWidth="14" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.5))' }}
          initial={{ pathLength: 0.12, pathOffset: -0.12, opacity: 0 }}
          animate={{ pathOffset: [-0.12, 1.12], opacity: [0, 1, 1, 0] }}
          transition={{ pathOffset: { duration: 0.85, ease: [0.2, 1, 0.4, 1] }, opacity: { times: [0, 0.05, 0.85, 1], duration: 0.85 } }} />
      </svg>

      {/* Particles */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        <AnimatePresence>{showParticles && particles.map(p => <Particle key={p.id} delay={p.delay} color={p.color} />)}</AnimatePresence>
      </div>

      {/* Text */}
      <div className="relative z-30 flex flex-col items-center gap-4">
        <motion.div className="absolute rounded-full pointer-events-none"
          style={{ width: 300, height: 300, background: `radial-gradient(circle, ${colors[0]}25 0%, transparent 70%)`, filter: "blur(20px)" }}
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1.4, 1.1], opacity: [0, 0.9, phase === "exit" ? 0 : 0.6] }}
          transition={{ duration: 1.0, ease: [0.2, 1, 0.4, 1] }} />
        <div className="flex gap-1">
          {letters.map((letter, i) => (
            <motion.span key={i} className="font-heading font-extralight tracking-wide"
              style={{ fontSize: "clamp(2.6rem, 7vw, 5rem)", color: colors[i % colors.length], textShadow: `0 0 30px ${colors[i % colors.length]}cc, 0 0 60px ${colors[i % colors.length]}66`, display: "inline-block" }}
              initial={{ opacity: 0, y: 32, scale: 0.7, filter: "blur(12px)" }}
              animate={phase === "exit"
                ? { opacity: 0, y: -20, scale: 0.85, filter: "blur(8px)" }
                : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              transition={phase === "exit"
                ? { duration: 0.5, delay: i * 0.04, ease: [0.4, 0, 1, 1] }
                : { duration: 0.7, delay: 0.2 + i * 0.08, ease: [0.2, 1, 0.4, 1] }}>
              {letter}
            </motion.span>
          ))}
        </div>
        <motion.div className="overflow-hidden"
          initial={{ width: 0, opacity: 0 }}
          animate={phase === "exit" ? { width: 0, opacity: 0 } : { width: 160, opacity: 1 }}
          transition={{ duration: 0.7, delay: phase === "exit" ? 0 : 0.65, ease: [0.2, 1, 0.4, 1] }}>
          <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${colors[1]}, ${colors[2]}, transparent)`, width: 160 }} />
        </motion.div>
        <motion.p className="text-xs md:text-sm font-bold tracking-[0.55em] uppercase"
          style={{ background: `linear-gradient(90deg, ${colors[0]}, ${colors[1]}, ${colors[2]})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          initial={{ opacity: 0, letterSpacing: "0.2em" }}
          animate={phase === "exit" ? { opacity: 0, letterSpacing: "0.8em" } : { opacity: 0.9, letterSpacing: "0.55em" }}
          transition={{ duration: 0.8, delay: phase === "exit" ? 0 : 0.75, ease: "easeInOut" }}>
          {subtitle}
        </motion.p>
        <motion.p className="text-[10px] md:text-xs text-slate-400/60 tracking-[0.4em] uppercase font-light"
          initial={{ opacity: 0, y: 8 }}
          animate={phase === "exit" ? { opacity: 0 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: phase === "exit" ? 0 : 0.9 }}>
          {tagline}
        </motion.p>
      </div>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ── STYLE: PULSE (Medical / Healthcare) ────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
const PulseStyle = ({ primaryText, subtitle, tagline, colors, phase }: {
  primaryText: string; subtitle: string; tagline: string; colors: string[]; phase: Phase;
}) => {
  const c0 = colors[0] || "#34d399";
  const c1 = colors[1] || "#6ee7b7";
  return (
    <>
      {/* Clean radial glow */}
      <motion.div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 60%, ${c0}18 0%, transparent 65%)` }}
        animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 2.5, repeat: Infinity }} />

      {/* ECG heartbeat line */}
      <svg viewBox="0 0 800 140" fill="none" className="absolute w-full max-w-3xl mx-auto z-10 opacity-90" style={{ top: "55%", left: "50%", transform: "translateX(-50%)" }}>
        <motion.path
          d="M 0,70 L 120,70 L 145,70 L 160,20 L 175,120 L 190,70 L 210,70 L 225,50 L 240,90 L 255,70 L 380,70 L 395,70 L 410,20 L 425,120 L 440,70 L 460,70 L 475,50 L 490,90 L 505,70 L 800,70"
          stroke={c0} strokeWidth="2.5" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 8px ${c0}80)` }}
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: [0, 1, 1, 1], opacity: [0, 1, 0.7, 0] }}
          transition={{ times: [0, 0.4, 0.7, 1], duration: 2.5, ease: "easeInOut" }} />
        <motion.path d="M 0,70 L 120,70 L 145,70 L 160,20 L 175,120 L 190,70 L 210,70 L 225,50 L 240,90 L 255,70 L 380,70"
          stroke="white" strokeWidth="4" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 10px rgba(255,255,255,0.6))` }}
          initial={{ pathLength: 0.1, pathOffset: -0.1, opacity: 0 }}
          animate={{ pathOffset: [-0.1, 1.1], opacity: [0, 1, 0] }}
          transition={{ pathOffset: { duration: 1.0, ease: [0.3, 1, 0.4, 1] }, opacity: { times: [0, 0.05, 0.9], duration: 1.0 } }} />
      </svg>

      {/* Pulse icon */}
      <motion.div className="absolute z-20" style={{ top: "30%", left: "50%", transform: "translateX(-50%)" }}
        initial={{ scale: 0, opacity: 0 }} animate={phase === "exit" ? { scale: 0, opacity: 0 } : { scale: [0, 1.3, 1], opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.2, 1, 0.4, 1] }}>
        <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
          <circle cx="26" cy="26" r="24" stroke={c0} strokeWidth="2" fill={`${c0}15`} />
          <motion.path d="M 16,26 L 20,20 L 24,32 L 28,22 L 32,26 L 36,26" stroke={c0} strokeWidth="2.5" strokeLinecap="round" fill="none"
            animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.0, repeat: Infinity }} />
        </svg>
      </motion.div>

      {/* Text block */}
      <div className="relative z-30 flex flex-col items-center gap-3 text-center">
        <motion.h1 className="font-heading font-light tracking-wider"
          style={{ fontSize: "clamp(2.5rem, 7vw, 4.5rem)", color: c0, textShadow: `0 0 40px ${c0}80` }}
          initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
          animate={phase === "exit" ? { opacity: 0, y: -16, filter: "blur(8px)" } : { opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.2, 1, 0.4, 1] }}>
          {primaryText}
        </motion.h1>
        <motion.div className="w-16 h-px" style={{ background: `linear-gradient(90deg, transparent, ${c0}, transparent)` }}
          initial={{ scaleX: 0 }} animate={phase === "exit" ? { scaleX: 0 } : { scaleX: 1 }} transition={{ duration: 0.6, delay: 0.55 }} />
        <motion.p className="text-sm font-semibold tracking-[0.4em] uppercase" style={{ color: c1 }}
          initial={{ opacity: 0 }} animate={phase === "exit" ? { opacity: 0 } : { opacity: 0.85 }} transition={{ duration: 0.6, delay: 0.7 }}>
          {subtitle}
        </motion.p>
        <motion.p className="text-xs tracking-[0.3em] uppercase" style={{ color: `${c1}80` }}
          initial={{ opacity: 0 }} animate={phase === "exit" ? { opacity: 0 } : { opacity: 1 }} transition={{ duration: 0.5, delay: 0.9 }}>
          {tagline}
        </motion.p>
      </div>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ── STYLE: ACADEMIC (Education / University) ───────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
const AcademicStyle = ({ primaryText, subtitle, tagline, colors, phase }: {
  primaryText: string; subtitle: string; tagline: string; colors: string[]; phase: Phase;
}) => {
  const c0 = colors[0] || "#f59e0b";
  const c1 = colors[1] || "#fcd34d";
  const words = primaryText.split(" ");
  return (
    <>
      {/* Warm academic glow */}
      <motion.div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 50%, ${c0}15 0%, transparent 65%)` }}
        animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 3, repeat: Infinity }} />

      {/* Book pages opening */}
      <div className="absolute z-10" style={{ top: "28%", left: "50%", transform: "translateX(-50%)" }}>
        <svg width="80" height="60" viewBox="0 0 80 60" fill="none">
          {/* Left page */}
          <motion.rect x="2" y="8" width="34" height="44" rx="3" fill={`${c0}20`} stroke={c0} strokeWidth="1.5"
            initial={{ scaleX: 0, originX: 1 }} animate={phase === "exit" ? { scaleX: 0 } : { scaleX: 1 }}
            transition={{ duration: 0.6, ease: [0.2, 1, 0.4, 1] }} style={{ transformOrigin: "36px 30px" }} />
          {/* Right page */}
          <motion.rect x="44" y="8" width="34" height="44" rx="3" fill={`${c0}20`} stroke={c0} strokeWidth="1.5"
            initial={{ scaleX: 0 }} animate={phase === "exit" ? { scaleX: 0 } : { scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.2, 1, 0.4, 1] }} />
          {/* Spine */}
          <motion.line x1="39" y1="8" x2="39" y2="52" stroke={c0} strokeWidth="2"
            initial={{ scaleY: 0 }} animate={phase === "exit" ? { scaleY: 0 } : { scaleY: 1 }}
            transition={{ duration: 0.4 }} style={{ transformOrigin: "39px 8px" }} />
          {/* Lines on page */}
          {[0, 1, 2, 3].map(n => (
            <motion.line key={n} x1="8" y1={18 + n * 9} x2="32" y2={18 + n * 9} stroke={c0} strokeWidth="1" opacity="0.5"
              initial={{ scaleX: 0 }} animate={phase === "exit" ? { scaleX: 0 } : { scaleX: 1 }}
              transition={{ duration: 0.4, delay: 0.3 + n * 0.07 }} style={{ transformOrigin: "8px center" }} />
          ))}
          {[0, 1, 2, 3].map(n => (
            <motion.line key={n} x1="48" y1={18 + n * 9} x2="72" y2={18 + n * 9} stroke={c0} strokeWidth="1" opacity="0.5"
              initial={{ scaleX: 0 }} animate={phase === "exit" ? { scaleX: 0 } : { scaleX: 1 }}
              transition={{ duration: 0.4, delay: 0.35 + n * 0.07 }} style={{ transformOrigin: "48px center" }} />
          ))}
          {/* Graduation cap on top */}
          <motion.g initial={{ y: -10, opacity: 0 }} animate={phase === "exit" ? { y: -10, opacity: 0 } : { y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}>
            <polygon points="40,1 52,7 40,13 28,7" fill={c0} opacity="0.9" />
            <rect x="46" y="7" width="2" height="8" fill={c0} opacity="0.7" rx="1" />
            <circle cx="47" cy="16" r="2.5" fill={c0} opacity="0.6" />
          </motion.g>
        </svg>
      </div>

      {/* Words reveal staggered */}
      <div className="relative z-30 flex flex-col items-center gap-4 mt-16">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
          {words.map((word, i) => (
            <motion.span key={i} className="font-heading font-bold"
              style={{ fontSize: "clamp(2rem, 6vw, 4rem)", color: i % 2 === 0 ? c0 : c1, textShadow: `0 0 30px ${c0}66` }}
              initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              animate={phase === "exit" ? { opacity: 0, y: -16 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.6, delay: 0.4 + i * 0.12, ease: [0.2, 1, 0.4, 1] }}>
              {word}
            </motion.span>
          ))}
        </div>
        <motion.div className="h-0.5 rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${c0}, ${c1}, transparent)` }}
          initial={{ width: 0 }} animate={phase === "exit" ? { width: 0 } : { width: 200 }}
          transition={{ duration: 0.7, delay: 0.65 }} />
        <motion.p className="text-xs tracking-[0.45em] uppercase font-bold" style={{ color: c1 }}
          initial={{ opacity: 0 }} animate={phase === "exit" ? { opacity: 0 } : { opacity: 0.85 }}
          transition={{ duration: 0.6, delay: 0.8 }}>
          {subtitle}
        </motion.p>
        <motion.p className="text-[10px] tracking-[0.35em] uppercase" style={{ color: `${c1}80` }}
          initial={{ opacity: 0 }} animate={phase === "exit" ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.0 }}>
          {tagline}
        </motion.p>
      </div>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ── STYLE: TERMINAL (Tech / Dev / SaaS) ───────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
const TerminalStyle = ({ primaryText, subtitle, tagline, colors, phase }: {
  primaryText: string; subtitle: string; tagline: string; colors: string[]; phase: Phase;
}) => {
  const c0 = colors[0] || "#4ade80";
  const [displayText, setDisplayText] = useState("");
  const [lineIndex, setLineIndex] = useState(0);
  const lines = [`> initializing...`, `> loading ${subtitle}`, `> ${primaryText}`, `> ${tagline}`];
  useEffect(() => {
    if (phase === "exit") return;
    if (lineIndex >= lines.length) return;
    const line = lines[lineIndex];
    let charIdx = 0;
    setDisplayText("");
    const interval = setInterval(() => {
      setDisplayText(line.slice(0, charIdx + 1));
      charIdx++;
      if (charIdx >= line.length) {
        clearInterval(interval);
        setTimeout(() => setLineIndex(p => p + 1), 180);
      }
    }, 28);
    return () => clearInterval(interval);
  }, [lineIndex, phase]);

  return (
    <>
      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none z-5 opacity-[0.04]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,1) 2px, rgba(0,0,0,1) 4px)" }} />
      {/* Green glow */}
      <motion.div className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${c0}15 0%, transparent 70%)`, filter: "blur(60px)" }}
        animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 2, repeat: Infinity }} />

      {/* Terminal window */}
      <motion.div className="relative z-30 w-full max-w-lg mx-4 rounded-2xl overflow-hidden border"
        style={{ borderColor: `${c0}30`, background: "rgba(0,0,0,0.85)", boxShadow: `0 0 40px ${c0}20` }}
        initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={phase === "exit" ? { opacity: 0, scale: 0.9, y: -20 } : { opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.2, 1, 0.4, 1] }}>
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: `${c0}20`, background: "rgba(0,0,0,0.5)" }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((d, i) => <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: d }} />)}
          <span className="ml-2 text-xs font-mono" style={{ color: `${c0}80` }}>terminal — intro.sh</span>
        </div>
        {/* Content */}
        <div className="p-6 font-mono text-sm min-h-[160px]" style={{ color: c0 }}>
          {lines.slice(0, lineIndex).map((line, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ duration: 0.2 }} className="mb-1.5 text-xs">
              <span style={{ color: `${c0}50` }}>{line}</span>
            </motion.div>
          ))}
          <div className="flex items-center gap-1 text-sm font-bold" style={{ color: c0 }}>
            <span>{displayText}</span>
            <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.6, repeat: Infinity }} className="w-2 h-4 inline-block" style={{ backgroundColor: c0 }} />
          </div>
        </div>
      </motion.div>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ── STYLE: MINIMAL (Universal / Clean) ─────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
const MinimalStyle = ({ primaryText, subtitle, tagline, colors, phase }: {
  primaryText: string; subtitle: string; tagline: string; colors: string[]; phase: Phase;
}) => {
  const c0 = colors[0] || "#e2e8f0";
  return (
    <div className="relative z-30 flex flex-col items-center gap-6 text-center">
      <motion.div className="relative"
        initial={{ opacity: 0 }} animate={phase === "exit" ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}>
        {/* Word-by-word clip reveal */}
        {primaryText.split(" ").map((word, i) => (
          <motion.span key={i} className="font-heading font-extralight tracking-[0.1em] mr-4 inline-block overflow-hidden"
            style={{ fontSize: "clamp(2.8rem, 8vw, 6rem)", color: c0 }}
            initial={{ clipPath: "inset(0 100% 0 0)" }}
            animate={phase === "exit" ? { clipPath: "inset(0 0 0 100%)" } : { clipPath: "inset(0 0% 0 0)" }}
            transition={{ duration: 0.7, delay: i * 0.18, ease: [0.77, 0, 0.175, 1] }}>
            {word}
          </motion.span>
        ))}
      </motion.div>
      <motion.div className="w-12 h-px" style={{ background: c0, opacity: 0.3 }}
        initial={{ scaleX: 0 }} animate={phase === "exit" ? { scaleX: 0 } : { scaleX: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }} />
      <motion.p className="text-sm font-light tracking-[0.5em] uppercase" style={{ color: `${c0}80` }}
        initial={{ opacity: 0 }} animate={phase === "exit" ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.7 }}>
        {subtitle}
      </motion.p>
      <motion.p className="text-xs font-light tracking-[0.3em] uppercase" style={{ color: `${c0}40` }}
        initial={{ opacity: 0 }} animate={phase === "exit" ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.9 }}>
        {tagline}
      </motion.p>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ── STYLE: CREATIVE (Agency / Design Studio) ──────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
const CreativeStyle = ({ primaryText, subtitle, tagline, colors, phase }: {
  primaryText: string; subtitle: string; tagline: string; colors: string[]; phase: Phase;
}) => {
  const c0 = colors[0] || "#f97316";
  const c1 = colors[1] || "#a855f7";
  const [showParticles, setShowParticles] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShowParticles(true), 200); return () => clearTimeout(t); }, []);
  const particles = Array.from({ length: 30 }, (_, i) => ({ id: i, color: i % 2 === 0 ? c0 : c1, delay: i * 0.022 }));
  return (
    <>
      {/* Dual glow orbs */}
      <motion.div className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${c0}18 0%, transparent 70%)`, filter: "blur(50px)", left: "20%", top: "30%" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 2.5, repeat: Infinity }} />
      <motion.div className="absolute w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${c1}15 0%, transparent 70%)`, filter: "blur(50px)", right: "20%", bottom: "30%" }}
        animate={{ scale: [1.1, 0.9, 1.1], opacity: [0.4, 0.85, 0.4] }} transition={{ duration: 3, repeat: Infinity }} />

      {/* Diagonal brush stroke */}
      <svg viewBox="0 0 1000 300" fill="none" className="absolute inset-0 w-full pointer-events-none z-10" style={{ top: "50%", transform: "translateY(-50%)" }}>
        <defs>
          <linearGradient id="cr-brush" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={c0} stopOpacity="0" />
            <stop offset="25%" stopColor={c0} stopOpacity="0.7" />
            <stop offset="75%" stopColor={c1} stopOpacity="0.7" />
            <stop offset="100%" stopColor={c1} stopOpacity="0" />
          </linearGradient>
          <filter id="cr-blur"><feGaussianBlur stdDeviation="6" /></filter>
        </defs>
        <motion.rect x="0" y="120" width="1000" height="60" rx="30" fill="url(#cr-brush)"
          initial={{ scaleX: 0, opacity: 0 }} animate={phase === "exit" ? { scaleX: 0, opacity: 0 } : { scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.2, 1, 0.4, 1] }} style={{ transformOrigin: "0px 150px" }} />
        <motion.rect x="0" y="130" width="1000" height="40" rx="20" fill="url(#cr-brush)" filter="url(#cr-blur)"
          initial={{ scaleX: 0, opacity: 0 }} animate={phase === "exit" ? { scaleX: 0, opacity: 0 } : { scaleX: 1, opacity: 0.5 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.2, 1, 0.4, 1] }} style={{ transformOrigin: "0px 150px" }} />
      </svg>

      {/* Particles */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        <AnimatePresence>{showParticles && particles.map(p => <Particle key={p.id} delay={p.delay} color={p.color} />)}</AnimatePresence>
      </div>

      {/* Text */}
      <div className="relative z-30 flex flex-col items-center gap-4">
        <motion.h1 className="font-heading font-black uppercase tracking-tight text-center leading-none"
          style={{ fontSize: "clamp(3rem, 9vw, 6.5rem)", background: `linear-gradient(135deg, ${c0}, ${c1})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          initial={{ opacity: 0, scale: 1.3, filter: "blur(20px)" }}
          animate={phase === "exit" ? { opacity: 0, scale: 0.8, filter: "blur(12px)" } : { opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.75, ease: [0.2, 1, 0.4, 1] }}>
          {primaryText}
        </motion.h1>
        <motion.p className="text-sm font-bold tracking-[0.4em] uppercase" style={{ color: `${c0}cc` }}
          initial={{ opacity: 0, y: 12 }} animate={phase === "exit" ? { opacity: 0 } : { opacity: 0.85, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}>
          {subtitle}
        </motion.p>
        <motion.p className="text-xs tracking-[0.3em] uppercase" style={{ color: `${c1}80` }}
          initial={{ opacity: 0 }} animate={phase === "exit" ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.75 }}>
          {tagline}
        </motion.p>
      </div>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ── MASTER INTRO TRANSITION COMPONENT ─────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export default function IntroTransition({
  onComplete,
  style       = "namaste",
  primaryText = "नमस्ते",
  subtitle    = "Namaste",
  tagline     = "Welcome to my universe",
  colors: userColors,
  duration    = 3000,
}: IntroTransitionProps) {
  const chimePlayed = useRef(false);
  const [phase, setPhase] = useState<Phase>("enter");

  // Merge user colors with style defaults
  const colors = (userColors && userColors.length >= 2)
    ? userColors
    : DEFAULT_PALETTES[style];

  // Background color per style
  const bgMap: Record<IntroStyle, string> = {
    namaste:  "radial-gradient(ellipse at 50% 50%, #0a0a1a 0%, #000000 100%)",
    pulse:    "radial-gradient(ellipse at 50% 50%, #011a0f 0%, #000000 100%)",
    academic: "radial-gradient(ellipse at 50% 50%, #18100a 0%, #000000 100%)",
    terminal: "#000000",
    minimal:  "radial-gradient(ellipse at 50% 50%, #0a0a10 0%, #000000 100%)",
    creative: "radial-gradient(ellipse at 50% 50%, #100a18 0%, #000000 100%)",
  };

  useEffect(() => {
    setPhase("enter");
    chimePlayed.current = false;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) { onComplete(); return; }

    const playChime = () => {
      if (chimePlayed.current) return;
      chimePlayed.current = true;
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();
        const notes = style === "pulse" ? [440, 528, 660] : style === "academic" ? [396, 528, 660] : [528, 660, 792];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = style === "terminal" ? "square" : "sine";
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.09);
          gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.09);
          gain.gain.linearRampToValueAtTime(0.045, ctx.currentTime + i * 0.09 + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.09 + 1.5);
          osc.connect(gain); gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.09);
          osc.stop(ctx.currentTime + i * 0.09 + 1.7);
        });
      } catch (e) { /* silent */ }
    };

    const holdAt  = Math.max(800, duration * 0.33);
    const exitAt  = Math.max(holdAt + 400, duration * 0.78);
    const doneAt  = duration;

    const t0 = setTimeout(playChime, 400);
    const t1 = setTimeout(() => setPhase("hold"), holdAt);
    const t2 = setTimeout(() => setPhase("exit"), exitAt);
    const t3 = setTimeout(onComplete, doneAt);
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [style, primaryText, subtitle, tagline, duration, colors, onComplete]);

  const styleProps = { primaryText, subtitle, tagline, colors, phase };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === "exit" ? 0 : 1 }}
      transition={{ duration: phase === "exit" ? 0.65 : 0, ease: [0.4, 0, 0.2, 1] }}
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center overflow-hidden select-none"
      style={{ background: bgMap[style] }}
    >
      {/* Corner ornaments (all styles) */}
      {[{ c: "top-5 left-5", r: 0 }, { c: "top-5 right-5", r: 90 }, { c: "bottom-5 right-5", r: 180 }, { c: "bottom-5 left-5", r: 270 }].map(({ c, r }, i) => (
        <motion.div key={i} className={`absolute ${c} pointer-events-none`}
          initial={{ opacity: 0, scale: 0 }}
          animate={phase === "exit" ? { opacity: 0, scale: 0 } : { opacity: 0.45, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 + i * 0.07 }}
          style={{ transform: `rotate(${r}deg)` }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M2 2 L11 2 L2 11" stroke={colors[i % colors.length]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      ))}

      {/* The selected style */}
      {style === "namaste"  && <NamasteStyle  {...styleProps} />}
      {style === "pulse"    && <PulseStyle    {...styleProps} />}
      {style === "academic" && <AcademicStyle {...styleProps} />}
      {style === "terminal" && <TerminalStyle {...styleProps} />}
      {style === "minimal"  && <MinimalStyle  {...styleProps} />}
      {style === "creative" && <CreativeStyle {...styleProps} />}

      {/* Skip button */}
      <motion.button
        onClick={onComplete}
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 0.55, y: 0 }}
        whileHover={{ opacity: 1, scale: 1.05 }} whileTap={{ scale: 0.95 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="absolute bottom-10 px-5 py-1.5 rounded-full border border-white/10 text-[9px] uppercase font-bold tracking-widest text-slate-300/70 backdrop-blur-sm bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/25 transition-colors z-40"
      >
        Skip
      </motion.button>
    </motion.div>
  );
}
