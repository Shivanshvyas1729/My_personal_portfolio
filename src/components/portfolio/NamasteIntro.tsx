import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface NamasteIntroProps {
  onComplete: () => void;
}

export default function NamasteIntro({ onComplete }: NamasteIntroProps) {
  const chimePlayed = useRef(false);

  useEffect(() => {
    // 1. Accessibility: Skip intro instantly if user prefers reduced motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      onComplete();
      return;
    }

    // 2. Synthesize Solfeggio sound chime via Web Audio API at the peak of the light trace
    const playChime = () => {
      if (chimePlayed.current) return;
      chimePlayed.current = true;

      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();
        
        // C5 (528 Hz - Solfeggio Transformation freq) and G5 (792 Hz - peaceful interval)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc1.type = "sine";
        osc1.frequency.setValueAtTime(528, ctx.currentTime);
        
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(792, ctx.currentTime);

        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        // Soft bell attack syncing with the light flash
        gainNode.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.1);
        // Long, atmospheric reverb decay
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.start();
        osc2.start();

        osc1.stop(ctx.currentTime + 1.9);
        osc2.stop(ctx.currentTime + 1.9);
      } catch (e) {
        console.warn("Web Audio API Chime skipped due to user interaction state:", e);
      }
    };

    // Play chime at the peak of the S-shape light animation (approx 350ms in)
    const audioTimer = setTimeout(playChime, 350);

    // Auto complete the intro after 1.8 seconds (duration of full sweep + sign glow)
    const exitTimer = setTimeout(onComplete, 1850);

    return () => {
      clearTimeout(audioTimer);
      clearTimeout(exitTimer);
    };
  }, [onComplete]);

  // Cubic Bezier S-Curve: Bottom-Left to Top-Right
  const sCurvePath = "M 100,850 C 100,350 900,650 900,150";

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-black overflow-hidden select-none"
    >
      {/* 🌌 Atmospheric Backdrop Glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: [0.15, 0.4, 0.15], 
          scale: [1, 1.15, 1] 
        }}
        transition={{ duration: 1.8, ease: "easeInOut" }}
        className="absolute w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none z-0"
      />

      {/* ⚡ Fullscreen S-Shape Tracing SVG */}
      <svg
        viewBox="0 0 1000 1000"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full pointer-events-none z-10 p-6 md:p-12 opacity-80"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Neon Gradient mapping for signature light */}
          <linearGradient id="neon-laser" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />    {/* Indigo-Blue */}
            <stop offset="40%" stopColor="#06b6d4" />   {/* Cyber Cyan */}
            <stop offset="75%" stopColor="#ec4899" />   {/* Hot Pink */}
            <stop offset="100%" stopColor="#f59e0b" />  {/* Warm Amber */}
          </linearGradient>

          {/* Deep neon glow filters */}
          <filter id="laser-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="15" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. Underlying Thin Guide Path (Very subtle glow) */}
        <motion.path
          d={sCurvePath}
          stroke="rgba(6, 182, 212, 0.08)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* 2. Beautiful Fading Luminous Trail */}
        <motion.path
          d={sCurvePath}
          stroke="url(#neon-laser)"
          strokeWidth="6"
          strokeLinecap="round"
          filter="url(#laser-glow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ 
            pathLength: [0, 1, 1], 
            opacity: [0, 0.9, 0.2] 
          }}
          transition={{ 
            duration: 1.6, 
            ease: [0.25, 1, 0.5, 1] 
          }}
        />

        {/* 3. The Traveling Laser Beam Head (Creates the sliding light effect) */}
        <motion.path
          d={sCurvePath}
          stroke="url(#neon-laser)"
          strokeWidth="10"
          strokeLinecap="round"
          filter="url(#laser-glow)"
          initial={{ pathLength: 0.15, pathOffset: -0.15 }}
          animate={{ 
            pathOffset: [-0.15, 1.05] 
          }}
          transition={{ 
            duration: 1.5, 
            ease: [0.25, 1, 0.5, 1] 
          }}
        />

        {/* 4. The Final Brilliant "Sign" Flash (Glows once it covers the whole screen) */}
        <motion.path
          d={sCurvePath}
          stroke="#ffffff"
          strokeWidth="8"
          strokeLinecap="round"
          filter="url(#laser-glow)"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, 0, 1, 0] 
          }}
          transition={{ 
            times: [0, 0.7, 0.85, 1],
            duration: 1.8,
            ease: "easeInOut"
          }}
        />
      </svg>

      {/* 🏷️ Cursive Namaste Brand Signature Overlay */}
      <div className="relative flex flex-col items-center z-20 text-center">
        {/* Glow behind the signature text */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: [0.8, 1.2, 1], opacity: [0, 0.7, 0] }}
          transition={{ duration: 1.8, ease: "easeInOut" }}
          className="absolute inset-0 bg-primary/20 rounded-full blur-3xl"
        />

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ 
            opacity: [0, 0.9, 0.9, 0],
            y: [30, 0, 0, -10],
            scale: [0.9, 1, 1, 0.95]
          }}
          transition={{ 
            times: [0, 0.25, 0.8, 1],
            duration: 1.8, 
            ease: "easeInOut" 
          }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-4xl sm:text-5xl font-heading font-extralight tracking-[0.35em] text-cyan-100 drop-shadow-[0_0_20px_rgba(34,211,238,0.6)]">
            नमस्ते
          </span>
          <span className="text-xs font-bold text-primary tracking-[0.5em] uppercase opacity-85 mt-2">
            Namaste
          </span>
        </motion.div>
      </div>

      {/* Skip Button */}
      <button 
        onClick={onComplete}
        className="absolute bottom-10 px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 text-[9px] uppercase font-bold tracking-widest text-slate-300/80 transition-all active:scale-95 z-30"
      >
        Skip
      </button>
    </motion.div>
  );
}
