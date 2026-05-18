import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface NamasteIntroProps {
  onComplete: () => void;
}

const LeftHand = () => (
  <svg 
    width="130" 
    height="220" 
    viewBox="0 0 130 220" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className="filter drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] text-foreground"
  >
    <defs>
      {/* 3D brushed-metal plate gradient */}
      <linearGradient id="robo-plate" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#64748b" />
        <stop offset="30%" stopColor="#94a3b8" />
        <stop offset="70%" stopColor="#334155" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>
      {/* Carbon fiber grid pattern fill */}
      <pattern id="carbon-pattern" width="6" height="6" patternUnits="userSpaceOnUse">
        <path d="M0 3 L6 3 M3 0 L3 6" stroke="#475569" strokeWidth="0.8" opacity="0.35"/>
        <rect width="3" height="3" fill="#1e293b" opacity="0.4"/>
      </pattern>
      {/* Neon cyber cyan glow gradient */}
      <linearGradient id="cyber-glow" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#06b6d4" />
        <stop offset="50%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#6366f1" />
      </linearGradient>
      {/* Deep inner cavity shadow */}
      <linearGradient id="dark-metal" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#0f172a" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>
    </defs>

    {/* ─── 1. BASE MECHANICAL CHASSIS (Inner dark frame) ─── */}
    <path 
      d="M32,215 C22,145 18,90 123,10 L125,12 C125,75 120,135 120,215 Z" 
      fill="url(#dark-metal)" 
      stroke="#334155"
      strokeWidth="1.5"
    />

    {/* ─── 2. FOREARM CHASSIS & HYDRAULIC CYLINDERS ─── */}
    {/* Base plate with rivets */}
    <path 
      d="M25,215 L125,215 L120,190 L30,190 Z" 
      fill="url(#robo-plate)" 
      stroke="#1e293b" 
      strokeWidth="1.5"
    />
    <circle cx="35" cy="202" r="2.5" fill="#475569" />
    <circle cx="115" cy="202" r="2.5" fill="#475569" />
    
    {/* Hydraulic pistons */}
    <rect x="42" y="172" width="6" height="18" rx="2" fill="#94a3b8" stroke="#1e293b" />
    <line x1="45" y1="190" x2="45" y2="165" stroke="#e2e8f0" strokeWidth="2.5" />
    
    <rect x="102" y="172" width="6" height="18" rx="2" fill="#94a3b8" stroke="#1e293b" />
    <line x1="105" y1="190" x2="105" y2="165" stroke="#e2e8f0" strokeWidth="2.5" />

    {/* ─── 3. PALM CORE & ARMOR PLATES (Segmented 3D layers) ─── */}
    {/* Large main carbon-fiber back-plate */}
    <path 
      d="M32,170 C22,120 20,95 85,95 L118,95 L120,170 Z" 
      fill="url(#carbon-pattern)" 
      stroke="#475569" 
      strokeWidth="1.5"
    />
    {/* Segmented steel armor shell overlays */}
    <path 
      d="M32,170 C26,140 28,115 55,115 L62,168 Z" 
      fill="url(#robo-plate)" 
      stroke="#1e293b" 
      strokeWidth="1.2"
    />
    <path 
      d="M68,168 L60,115 L95,115 L93,168 Z" 
      fill="url(#robo-plate)" 
      stroke="#1e293b" 
      strokeWidth="1.2"
    />
    <path 
      d="M98,168 L100,115 L118,115 L120,168 Z" 
      fill="url(#robo-plate)" 
      stroke="#1e293b" 
      strokeWidth="1.2"
    />

    {/* Glowing circuit track tracing across the palm */}
    <path 
      d="M50,160 L50,135 L85,135 L85,108" 
      stroke="url(#cyber-glow)" 
      strokeWidth="2.5" 
      strokeLinecap="round"
      opacity="0.9"
    />
    <circle cx="85" cy="108" r="3.5" fill="#22d3ee" />

    {/* ─── 4. SEGMENTED ROBOTIC FINGERS (With pivot joints) ─── */}

    {/* 🖐️ MIDDLE FINGER (Flush at x=130 for perfect gapless contact) */}
    {/* Knuckle Joint */}
    <circle cx="118" cy="95" r="5" fill="url(#robo-plate)" stroke="#1e293b" />
    <circle cx="118" cy="95" r="2" fill="#06b6d4" />
    {/* Proximal segment */}
    <path d="M 115,95 L 121,95 L 123,65 L 117,65 Z" fill="url(#robo-plate)" stroke="#1e293b" strokeWidth="1.2" />
    <line x1="119" y1="92" x2="121" y2="68" stroke="url(#cyber-glow)" strokeWidth="1" />
    {/* Middle Joint */}
    <circle cx="120" cy="65" r="4.5" fill="url(#robo-plate)" stroke="#1e293b" />
    <circle cx="120" cy="65" r="1.8" fill="#06b6d4" />
    {/* Intermediate segment */}
    <path d="M 117,65 L 123,65 L 125,35 L 119,35 Z" fill="url(#robo-plate)" stroke="#1e293b" strokeWidth="1.2" />
    {/* Distal Joint */}
    <circle cx="122" cy="35" r="4" fill="url(#robo-plate)" stroke="#1e293b" />
    <circle cx="122" cy="35" r="1.5" fill="#06b6d4" />
    {/* Distal Segment (reaches x=130 tip boundary) */}
    <path d="M 120,35 L 124,35 L 130,8 C 130,5 128,5 125,8 L 118,35 Z" fill="url(#robo-plate)" stroke="#1e293b" strokeWidth="1.2" />

    {/* 🖐️ INDEX FINGER (Tip at x=119, y=25) */}
    <circle cx="104" cy="98" r="5" fill="url(#robo-plate)" stroke="#1e293b" />
    <circle cx="104" cy="98" r="2" fill="#06b6d4" />
    <path d="M 101,98 L 107,98 L 111,70 L 105,70 Z" fill="url(#robo-plate)" stroke="#1e293b" strokeWidth="1.2" />
    <circle cx="108" cy="70" r="4.5" fill="url(#robo-plate)" stroke="#1e293b" />
    <path d="M 105,70 L 111,70 L 115,42 L 109,42 Z" fill="url(#robo-plate)" stroke="#1e293b" strokeWidth="1.2" />
    <circle cx="112" cy="42" r="4" fill="url(#robo-plate)" stroke="#1e293b" />
    <path d="M 109,42 L 115,42 L 119,25 C 119,22 117,22 114,25 L 107,42 Z" fill="url(#robo-plate)" stroke="#1e293b" strokeWidth="1.2" />

    {/* 🖐️ RING FINGER (Tip at x=108, y=38) */}
    <circle cx="90" cy="108" r="5" fill="url(#robo-plate)" stroke="#1e293b" />
    <circle cx="90" cy="108" r="2" fill="#06b6d4" />
    <path d="M 87,108 L 93,108 L 97,80 L 91,80 Z" fill="url(#robo-plate)" stroke="#1e293b" strokeWidth="1.2" />
    <circle cx="94" cy="80" r="4.5" fill="url(#robo-plate)" stroke="#1e293b" />
    <path d="M 91,80 L 97,80 L 101,54 L 95,54 Z" fill="url(#robo-plate)" stroke="#1e293b" strokeWidth="1.2" />
    <circle cx="98" cy="54" r="4" fill="url(#robo-plate)" stroke="#1e293b" />
    <path d="M 95,54 L 101,54 L 108,38 C 108,35 106,35 103,38 L 92,54 Z" fill="url(#robo-plate)" stroke="#1e293b" strokeWidth="1.2" />

    {/* 🖐️ PINKY FINGER (Tip at x=96, y=56) */}
    <circle cx="76" cy="120" r="5" fill="url(#robo-plate)" stroke="#1e293b" />
    <circle cx="76" cy="120" r="2" fill="#06b6d4" />
    <path d="M 73,120 L 79,120 L 83,94 L 77,94 Z" fill="url(#robo-plate)" stroke="#1e293b" strokeWidth="1.2" />
    <circle cx="80" cy="94" r="4.5" fill="url(#robo-plate)" stroke="#1e293b" />
    <path d="M 77,94 L 83,94 L 87,70 L 81,70 Z" fill="url(#robo-plate)" stroke="#1e293b" strokeWidth="1.2" />
    <circle cx="84" cy="70" r="4" fill="url(#robo-plate)" stroke="#1e293b" />
    <path d="M 81,70 L 87,70 L 96,56 C 96,53 94,53 91,56 L 81,70 Z" fill="url(#robo-plate)" stroke="#1e293b" strokeWidth="1.2" />

    {/* 🖐️ ROBOTIC THUMB (Folding elegantly on the left, tip at x=78, y=118) */}
    <circle cx="34" cy="158" r="6" fill="url(#robo-plate)" stroke="#1e293b" />
    <circle cx="34" cy="158" r="2.5" fill="#06b6d4" />
    <path d="M 31,158 L 37,158 L 52,138 L 46,138 Z" fill="url(#robo-plate)" stroke="#1e293b" strokeWidth="1.5" />
    <circle cx="49" cy="138" r="5" fill="url(#robo-plate)" stroke="#1e293b" />
    <path d="M 46,138 L 52,138 L 68,124 L 62,124 Z" fill="url(#robo-plate)" stroke="#1e293b" strokeWidth="1.2" />
    <circle cx="65" cy="124" r="4" fill="url(#robo-plate)" stroke="#1e293b" />
    <path d="M 62,124 L 68,124 L 78,118 C 80,116 79,114 76,116 L 59,124 Z" fill="url(#robo-plate)" stroke="#1e293b" strokeWidth="1.2" />
  </svg>
);

export default function NamasteIntro({ onComplete }: NamasteIntroProps) {
  const chimePlayed = useRef(false);

  useEffect(() => {
    // 1. Accessibility: Skip intro instantly if user prefers reduced motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      onComplete();
      return;
    }

    // 2. Synthesize Solfeggio sound chime via Web Audio API when hands connect
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
        // Soft bell attack
        gainNode.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.15);
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

    // Play chime right when the hands touch (approx 200ms in)
    const audioTimer = setTimeout(playChime, 200);

    // Auto complete the intro after 1.5 seconds
    const exitTimer = setTimeout(onComplete, 1600);

    return () => {
      clearTimeout(audioTimer);
      clearTimeout(exitTimer);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-background text-foreground overflow-hidden select-none"
    >
      {/* Glow particle behind the hands */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: [0.3, 0.6, 0.4], scale: [1, 1.2, 1.1] }}
        transition={{ duration: 1.5, ease: "easeInOut", repeat: 0 }}
        className="absolute w-[350px] h-[350px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"
      />

      <div className="relative flex flex-col items-center z-10">
        {/* Hands Container - flex gap-0 ensures precise contact of bounding boxes */}
        <div className="relative flex items-center justify-center gap-0 h-56 mb-10">
          {/* Left Hand */}
          <motion.div
            initial={{ x: -120, y: 15, rotate: -35, opacity: 0 }}
            animate={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
            transition={{ duration: 0.85, ease: [0.25, 1, 0.5, 1] }}
          >
            <LeftHand />
          </motion.div>

          {/* Right Hand (Perfect Symmetrical Mirror) */}
          <motion.div
            initial={{ x: 120, y: 15, rotate: 35, opacity: 0 }}
            animate={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
            transition={{ duration: 0.85, ease: [0.25, 1, 0.5, 1] }}
            style={{ scaleX: -1 }}
          >
            <LeftHand />
          </motion.div>
        </div>

        {/* Spiritual Greeting Text */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
          className="flex flex-col items-center gap-1.5 text-center"
        >
          <span className="text-3xl sm:text-4xl font-heading font-light tracking-[0.3em] text-foreground/90">
            नमस्ते
          </span>
          <span className="text-[10px] font-bold text-primary tracking-[0.45em] uppercase opacity-75 mt-1">
            Namaste
          </span>
        </motion.div>
      </div>

      {/* Skip Button */}
      <button 
        onClick={onComplete}
        className="absolute bottom-10 px-4 py-1.5 rounded-full bg-primary/5 hover:bg-primary/10 border border-primary/20 hover:border-primary/40 text-[9px] uppercase font-bold tracking-widest text-primary/80 transition-all active:scale-95 z-20"
      >
        Skip Intro
      </button>
    </motion.div>
  );
}
