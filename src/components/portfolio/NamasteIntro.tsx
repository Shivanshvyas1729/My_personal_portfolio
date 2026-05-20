import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NamasteIntroProps {
  onComplete: () => void;
}

// ─── Floating Particle ───────────────────────────────────────────────────────
const Particle = ({ delay, color }: { delay: number; color: string }) => {
  const angle = Math.random() * 360;
  const dist = 80 + Math.random() * 220;
  const size = 1.5 + Math.random() * 3;
  const x = Math.cos((angle * Math.PI) / 180) * dist;
  const y = Math.sin((angle * Math.PI) / 180) * dist;

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        boxShadow: `0 0 ${size * 3}px ${color}`,
        left: "50%",
        top: "50%",
        translateX: "-50%",
        translateY: "-50%",
      }}
      initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
      animate={{
        x: [0, x * 0.5, x],
        y: [0, y * 0.5, y],
        opacity: [0, 1, 0],
        scale: [0, 1.5, 0],
      }}
      transition={{
        duration: 1.8 + Math.random() * 0.8,
        delay,
        ease: [0.2, 0.8, 0.4, 1],
      }}
    />
  );
};

// ─── Sanskrit letter stagger ─────────────────────────────────────────────────
const letters = ["न", "म", "स्", "ते"];
const colors = ["#38bdf8", "#818cf8", "#e879f9", "#f472b6"];

export default function NamasteIntro({ onComplete }: NamasteIntroProps) {
  const chimePlayed = useRef(false);
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      onComplete();
      return;
    }

    // Chime at peak visual impact
    const playChime = () => {
      if (chimePlayed.current) return;
      chimePlayed.current = true;
      try {
        const AudioContextClass =
          window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();

        const notes = [528, 660, 792];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
          gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.08);
          gain.gain.linearRampToValueAtTime(0.055, ctx.currentTime + i * 0.08 + 0.06);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.08 + 1.6);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.08);
          osc.stop(ctx.currentTime + i * 0.08 + 1.8);
        });
      } catch (e) {
        console.warn("Chime skipped:", e);
      }
    };

    // Phase timeline
    const t1 = setTimeout(() => setShowParticles(true), 300);
    const t2 = setTimeout(playChime, 500);
    const t3 = setTimeout(() => setPhase("hold"), 1000);
    const t4 = setTimeout(() => setPhase("exit"), 2400);
    const t5 = setTimeout(onComplete, 3000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onComplete]);

  const particleColors = [
    "#38bdf8", "#818cf8", "#e879f9", "#f472b6",
    "#34d399", "#fbbf24", "#c084fc", "#67e8f9",
  ];

  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    color: particleColors[i % particleColors.length],
    delay: i * 0.018,
  }));

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === "exit" ? 0 : 1 }}
      transition={{
        duration: phase === "exit" ? 0.6 : 0,
        ease: [0.4, 0, 0.2, 1],
      }}
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center overflow-hidden select-none"
      style={{
        background:
          "radial-gradient(ellipse at 50% 50%, #0a0a1a 0%, #000000 100%)",
      }}
    >
      {/* ── Ambient breathing orbs ── */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(99,102,241,0.12) 0%, rgba(168,85,247,0.06) 50%, transparent 70%)",
          filter: "blur(40px)",
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(34,211,238,0.1) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{
          scale: [1.1, 0.95, 1.1],
          opacity: [0.3, 0.8, 0.3],
          x: [-30, 30, -30],
          y: [20, -20, 20],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── S-curve Laser trace ── */}
      <svg
        viewBox="0 0 1000 1000"
        fill="none"
        className="absolute inset-0 w-full h-full pointer-events-none z-10 p-8 md:p-16"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="neon-laser" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="35%" stopColor="#06b6d4" />
            <stop offset="70%" stopColor="#e879f9" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <filter id="laser-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="10" result="blur1" />
            <feGaussianBlur stdDeviation="25" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="soft-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ghost trail */}
        <motion.path
          d="M 100,850 C 100,350 900,650 900,150"
          stroke="rgba(99,102,241,0.06)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />

        {/* Main luminous trace */}
        <motion.path
          d="M 100,850 C 100,350 900,650 900,150"
          stroke="url(#neon-laser)"
          strokeWidth="5"
          strokeLinecap="round"
          filter="url(#laser-glow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: [0, 1, 1, 1],
            opacity: [0, 0.95, 0.6, 0],
          }}
          transition={{
            times: [0, 0.35, 0.65, 1],
            duration: 2.4,
            ease: [0.25, 1, 0.5, 1],
          }}
        />

        {/* Traveling bright head */}
        <motion.path
          d="M 100,850 C 100,350 900,650 900,150"
          stroke="white"
          strokeWidth="14"
          strokeLinecap="round"
          filter="url(#laser-glow)"
          initial={{ pathLength: 0.12, pathOffset: -0.12, opacity: 0 }}
          animate={{
            pathOffset: [-0.12, 1.12],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            pathOffset: { duration: 0.85, ease: [0.2, 1, 0.4, 1] },
            opacity: {
              times: [0, 0.05, 0.85, 1],
              duration: 0.85,
            },
          }}
        />

        {/* Flash burst at end */}
        <motion.path
          d="M 100,850 C 100,350 900,650 900,150"
          stroke="rgba(255,255,255,0.95)"
          strokeWidth="3"
          strokeLinecap="round"
          filter="url(#soft-glow)"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0, 0, 1, 0] }}
          transition={{
            times: [0, 0.3, 0.7, 0.85, 1],
            duration: 2.4,
          }}
        />
      </svg>

      {/* ── Particle burst ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        <AnimatePresence>
          {showParticles &&
            particles.map((p) => (
              <Particle key={p.id} delay={p.delay} color={p.color} />
            ))}
        </AnimatePresence>
      </div>

      {/* ── Main text block ── */}
      <div className="relative z-30 flex flex-col items-center gap-5">
        {/* Halo ring behind text */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 280,
            height: 280,
            background:
              "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
            filter: "blur(20px)",
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1.4, 1.1],
            opacity: [0, 0.9, phase === "exit" ? 0 : 0.6],
          }}
          transition={{ duration: 1.0, ease: [0.2, 1, 0.4, 1] }}
        />

        {/* Staggered Sanskrit letters */}
        <div className="flex gap-1 md:gap-2">
          {letters.map((letter, i) => (
            <motion.span
              key={i}
              className="font-heading font-extralight tracking-wider"
              style={{
                fontSize: "clamp(2.8rem, 8vw, 5.5rem)",
                color: colors[i],
                textShadow: `0 0 30px ${colors[i]}cc, 0 0 60px ${colors[i]}66`,
                display: "inline-block",
              }}
              initial={{ opacity: 0, y: 32, scale: 0.7, filter: "blur(12px)" }}
              animate={
                phase === "exit"
                  ? { opacity: 0, y: -20, scale: 0.85, filter: "blur(8px)" }
                  : {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      filter: "blur(0px)",
                    }
              }
              transition={
                phase === "exit"
                  ? {
                      duration: 0.5,
                      delay: i * 0.04,
                      ease: [0.4, 0, 1, 1],
                    }
                  : {
                      duration: 0.7,
                      delay: 0.2 + i * 0.1,
                      ease: [0.2, 1, 0.4, 1],
                    }
              }
            >
              {letter}
            </motion.span>
          ))}
        </div>

        {/* Divider line */}
        <motion.div
          className="overflow-hidden"
          initial={{ width: 0, opacity: 0 }}
          animate={
            phase === "exit"
              ? { width: 0, opacity: 0 }
              : { width: 160, opacity: 1 }
          }
          transition={{
            duration: phase === "exit" ? 0.4 : 0.7,
            delay: phase === "exit" ? 0 : 0.65,
            ease: [0.2, 1, 0.4, 1],
          }}
        >
          <div
            className="h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, #818cf8, #e879f9, transparent)",
              width: 160,
            }}
          />
        </motion.div>

        {/* Romanized subtitle */}
        <motion.p
          className="text-xs md:text-sm font-bold tracking-[0.55em] uppercase"
          style={{
            background:
              "linear-gradient(90deg, #38bdf8, #818cf8, #e879f9)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
          initial={{ opacity: 0, letterSpacing: "0.2em" }}
          animate={
            phase === "exit"
              ? { opacity: 0, letterSpacing: "0.8em" }
              : { opacity: 0.9, letterSpacing: "0.55em" }
          }
          transition={{
            duration: phase === "exit" ? 0.5 : 0.8,
            delay: phase === "exit" ? 0 : 0.75,
            ease: "easeInOut",
          }}
        >
          Namaste
        </motion.p>

        {/* Sub-tagline */}
        <motion.p
          className="text-[10px] md:text-xs text-slate-400/60 tracking-[0.4em] uppercase font-light"
          initial={{ opacity: 0, y: 8 }}
          animate={
            phase === "exit"
              ? { opacity: 0 }
              : { opacity: 1, y: 0 }
          }
          transition={{
            duration: 0.6,
            delay: phase === "exit" ? 0 : 0.95,
          }}
        >
          Welcome to my universe
        </motion.p>
      </div>

      {/* ── Lotus-style corner ornaments ── */}
      {[
        { corner: "top-6 left-6", rotate: 0 },
        { corner: "top-6 right-6", rotate: 90 },
        { corner: "bottom-6 right-6", rotate: 180 },
        { corner: "bottom-6 left-6", rotate: 270 },
      ].map(({ corner, rotate }, i) => (
        <motion.div
          key={i}
          className={`absolute ${corner} pointer-events-none`}
          initial={{ opacity: 0, scale: 0 }}
          animate={
            phase === "exit" ? { opacity: 0, scale: 0 } : { opacity: 0.5, scale: 1 }
          }
          transition={{
            duration: 0.6,
            delay: phase === "exit" ? 0 : 0.4 + i * 0.08,
            ease: [0.2, 1, 0.4, 1],
          }}
          style={{ transform: `rotate(${rotate}deg)` }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path
              d="M2 2 L12 2 L2 12"
              stroke="url(#corner-grad)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="corner-grad" x1="0" y1="0" x2="12" y2="12">
                <stop stopColor="#818cf8" />
                <stop offset="1" stopColor="#e879f9" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
      ))}

      {/* ── Skip button ── */}
      <motion.button
        onClick={onComplete}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 0.6, y: 0 }}
        whileHover={{ opacity: 1, scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="absolute bottom-10 px-5 py-1.5 rounded-full border border-white/10 text-[9px] uppercase font-bold tracking-widest text-slate-300/70 backdrop-blur-sm bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/25 transition-colors z-40"
      >
        Skip
      </motion.button>
    </motion.div>
  );
}
