import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface NamasteIntroProps {
  onComplete: () => void;
}

const LeftHand = () => (
  <svg 
    width="100" 
    height="180" 
    viewBox="0 0 100 200" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className="text-primary filter drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]"
  >
    {/* Symmetrical palm and middle finger curve (palm side sits exactly at x=100) */}
    <path 
      d="M 35,190 C 20,130 20,70 94,10 C 96.5,7 100,9 100,12 C 100,60 94,120 94,190" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    {/* Inner index finger curve */}
    <path 
      d="M 42,190 C 32,145 35,95 88,35 C 90,32 93,33 93,36 C 93,75 88,125 88,190" 
      stroke="currentColor" 
      strokeWidth="1.8" 
      strokeLinecap="round"
      opacity="0.85"
    />
    {/* Inner ring finger curve */}
    <path 
      d="M 48,190 C 42,160 45,115 82,60 C 83.5,57 86,58 86,61 C 86,90 82,130 82,190" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round"
      opacity="0.7"
    />
    {/* Symmetrical thumb */}
    <path 
      d="M 48,135 C 48,115 58,100 70,90 C 72,88 74,90 73,92 C 63,110 60,122 60,135" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round"
    />
    {/* Elegant inner palm creases */}
    <path 
      d="M 68,145 C 68,135 72,128 75,124" 
      stroke="currentColor" 
      strokeWidth="1" 
      strokeLinecap="round"
      opacity="0.5"
    />
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
        <div className="relative flex items-center justify-center gap-0 h-48 mb-10">
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
