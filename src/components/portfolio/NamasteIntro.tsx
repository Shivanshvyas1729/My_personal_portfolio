import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface NamasteIntroProps {
  onComplete: () => void;
}

// 🦾 LEFT CYBORG HAND: Rich Copper-Bronze & Ornate Gold Filigree
const LeftCyborgHand = () => (
  <svg 
    width="150" 
    height="250" 
    viewBox="0 0 150 250" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className="filter drop-shadow-[0_0_20px_rgba(217,119,6,0.45)] text-foreground"
  >
    <defs>
      {/* Copper/Gold organic-metallic gradient */}
      <linearGradient id="copper-gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#78350f" />
        <stop offset="25%" stopColor="#d97706" />
        <stop offset="50%" stopColor="#f59e0b" />
        <stop offset="75%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#451a03" />
      </linearGradient>
      
      {/* Detailed circuit overlay glow */}
      <linearGradient id="circuit-glow" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#ea580c" />
        <stop offset="100%" stopColor="#facc15" />
      </linearGradient>
    </defs>

    {/* 1. Forearm Mechanical Slot Channel (Dark Underlayer) */}
    <path 
      d="M10,240 L70,175 L82,185 L22,250 Z" 
      fill="#291305" 
      stroke="#78350f" 
      strokeWidth="1.5" 
    />
    {/* Ornate wire/filigree lines inside the channel */}
    <path 
      d="M15,242 Q30,220 45,210 T75,180" 
      stroke="url(#circuit-glow)" 
      strokeWidth="1.8" 
      strokeLinecap="round" 
    />

    {/* 2. Hanging loop handle under the wrist (Matches image perfectly) */}
    <path 
      d="M48,225 C48,255 78,255 78,225" 
      stroke="url(#copper-gold)" 
      strokeWidth="3" 
      strokeLinecap="round" 
      fill="none" 
    />

    {/* 3. Main Bronze Armor Forearm shell (Segmented layers) */}
    <path 
      d="M5,230 C20,200 40,165 75,160 L85,178 C55,183 30,220 18,245 Z" 
      fill="url(#copper-gold)" 
      stroke="#451a03" 
      strokeWidth="1.2" 
    />
    <path 
      d="M25,235 C38,205 58,180 85,178 L95,195 C70,198 48,220 38,248 Z" 
      fill="url(#copper-gold)" 
      stroke="#451a03" 
      strokeWidth="1" 
      opacity="0.85"
    />

    {/* 4. Ornate forearm mechanical carvings (Filigree/circuit patterns) */}
    <path 
      d="M30,225 Q45,210 50,195 T75,180" 
      stroke="#fef08a" 
      strokeWidth="1" 
      strokeLinecap="round" 
      opacity="0.6" 
    />

    {/* 5. Cyborg Palm base */}
    <path 
      d="M75,160 C70,140 75,115 110,110 L125,125 C95,135 85,155 85,178 Z" 
      fill="url(#copper-gold)" 
      stroke="#451a03" 
      strokeWidth="1.5" 
    />

    {/* 6. Long, sleek robotic fingers (Segmented, arching outward, tip meets at x=150) */}
    {/* Middle Finger (tips at x=148, y=10) */}
    <circle cx="112" cy="110" r="4.5" fill="url(#copper-gold)" stroke="#451a03" />
    <path d="M110,110 L115,110 L125,75 L120,75 Z" fill="url(#copper-gold)" stroke="#451a03" strokeWidth="1" />
    <circle cx="123" cy="75" r="3.5" fill="url(#copper-gold)" />
    <path d="M121,75 L126,75 L138,40 L133,40 Z" fill="url(#copper-gold)" stroke="#451a03" strokeWidth="1" />
    <circle cx="136" cy="40" r="3" fill="url(#copper-gold)" />
    {/* Distal tip sweeps exactly flush to x=150 boundary for Namaste connection */}
    <path d="M134,40 L138,40 C140,30 150,22 150,10 C150,7 148,7 145,10 L133,40 Z" fill="url(#copper-gold)" stroke="#451a03" strokeWidth="1" />

    {/* Index Finger (tip at x=138, y=28) */}
    <circle cx="102" cy="115" r="4.5" fill="url(#copper-gold)" stroke="#451a03" />
    <path d="M100,115 L105,115 L113,82 L108,82 Z" fill="url(#copper-gold)" stroke="#451a03" strokeWidth="1" />
    <circle cx="111" cy="82" r="3.5" fill="url(#copper-gold)" />
    <path d="M109,82 L114,82 L124,50 L119,50 Z" fill="url(#copper-gold)" stroke="#451a03" strokeWidth="1" />
    <circle cx="122" cy="50" r="3" fill="url(#copper-gold)" />
    <path d="M120,50 L124,50 L138,28 C138,25 136,25 133,28 L119,50 Z" fill="url(#copper-gold)" stroke="#451a03" strokeWidth="1" />

    {/* Ring Finger (tip at x=126, y=46) */}
    <circle cx="92" cy="125" r="4" fill="url(#copper-gold)" stroke="#451a03" />
    <path d="M90,125 L95,125 L101,92 L96,92 Z" fill="url(#copper-gold)" stroke="#451a03" strokeWidth="1" />
    <circle cx="99" cy="92" r="3.5" fill="url(#copper-gold)" />
    <path d="M97,92 L102,92 L112,62 L107,62 Z" fill="url(#copper-gold)" stroke="#451a03" strokeWidth="1" />
    <circle cx="110" cy="62" r="3" fill="url(#copper-gold)" />
    <path d="M108,62 L112,62 L126,46 C126,43 124,43 121,46 L107,62 Z" fill="url(#copper-gold)" stroke="#451a03" strokeWidth="1" />

    {/* Pinky Finger (tip at x=112, y=66) */}
    <circle cx="82" cy="135" r="4" fill="url(#copper-gold)" stroke="#451a03" />
    <path d="M80,135 L85,135 L90,105 L85,105 Z" fill="url(#copper-gold)" stroke="#451a03" strokeWidth="1" />
    <circle cx="88" cy="105" r="3.5" fill="url(#copper-gold)" />
    <path d="M86,105 L91,105 L99,78 L94,78 Z" fill="url(#copper-gold)" stroke="#451a03" strokeWidth="1" />
    <circle cx="97" cy="78" r="3" fill="url(#copper-gold)" />
    <path d="M95,78 L99,78 L112,66 C112,63 110,63 107,66 L94,78 Z" fill="url(#copper-gold)" stroke="#451a03" strokeWidth="1" />

    {/* Detailed copper filigree etched lines on the fingers */}
    <path d="M115,108 Q125,75 130,55" stroke="#fcd34d" strokeWidth="0.8" opacity="0.5" />
    <path d="M103,113 Q113,82 118,60" stroke="#fcd34d" strokeWidth="0.8" opacity="0.5" />

    {/* Thumb folding elegantly inside */}
    <circle cx="48" cy="170" r="5" fill="url(#copper-gold)" stroke="#451a03" />
    <path d="M46,170 L51,170 L72,148 L67,148 Z" fill="url(#copper-gold)" stroke="#451a03" strokeWidth="1" />
    <circle cx="70" cy="148" r="4" fill="url(#copper-gold)" />
    <path d="M68,148 L73,148 L88,132 L83,132 Z" fill="url(#copper-gold)" stroke="#451a03" strokeWidth="1" />
    <circle cx="86" cy="132" r="3" fill="url(#copper-gold)" />
    <path d="M84,132 L88,132 L98,124 C100,122 98,120 95,122 L83,132 Z" fill="url(#copper-gold)" stroke="#451a03" strokeWidth="1" />
  </svg>
);

// 🦾 RIGHT CYBORG HAND: High-Gloss Silver-White Ceramic/Steel
const RightCyborgHand = () => (
  <svg 
    width="150" 
    height="250" 
    viewBox="0 0 150 250" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className="filter drop-shadow-[0_0_20px_rgba(6,182,212,0.45)] text-foreground"
  >
    <defs>
      {/* Silver/White Ceramic metallic gradient */}
      <linearGradient id="silver-ceramic" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#475569" />
        <stop offset="25%" stopColor="#94a3b8" />
        <stop offset="50%" stopColor="#cbd5e1" />
        <stop offset="75%" stopColor="#e2e8f0" />
        <stop offset="100%" stopColor="#f8fafc" />
      </linearGradient>
      
      {/* Cyber cyan glow gradient */}
      <linearGradient id="cyber-cyan-glow" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#0891b2" />
        <stop offset="100%" stopColor="#22d3ee" />
      </linearGradient>
    </defs>

    {/* 1. Forearm Mechanical Slot Channel (Dark Underlayer) */}
    <path 
      d="M10,240 L70,175 L82,185 L22,250 Z" 
      fill="#0f172a" 
      stroke="#334155" 
      strokeWidth="1.5" 
    />
    {/* Ornate wire/filigree lines inside the channel */}
    <path 
      d="M15,242 Q30,220 45,210 T75,180" 
      stroke="url(#cyber-cyan-glow)" 
      strokeWidth="1.8" 
      strokeLinecap="round" 
    />

    {/* 2. Hanging loop handle under the wrist (Matches image perfectly) */}
    <path 
      d="M48,225 C48,255 78,255 78,225" 
      stroke="url(#silver-ceramic)" 
      strokeWidth="3" 
      strokeLinecap="round" 
      fill="none" 
    />

    {/* 3. Main Silver Armor Forearm shell (Segmented layers) */}
    <path 
      d="M5,230 C20,200 40,165 75,160 L85,178 C55,183 30,220 18,245 Z" 
      fill="url(#silver-ceramic)" 
      stroke="#1e293b" 
      strokeWidth="1.2" 
    />
    <path 
      d="M25,235 C38,205 58,180 85,178 L95,195 C70,198 48,220 38,248 Z" 
      fill="url(#silver-ceramic)" 
      stroke="#1e293b" 
      strokeWidth="1" 
      opacity="0.85"
    />

    {/* 4. Ornate forearm mechanical carvings (Filigree/circuit patterns) */}
    <path 
      d="M30,225 Q45,210 50,195 T75,180" 
      stroke="#94a3b8" 
      strokeWidth="1" 
      strokeLinecap="round" 
      opacity="0.6" 
    />

    {/* 5. Cyborg Palm base */}
    <path 
      d="M75,160 C70,140 75,115 110,110 L125,125 C95,135 85,155 85,178 Z" 
      fill="url(#silver-ceramic)" 
      stroke="#1e293b" 
      strokeWidth="1.5" 
    />

    {/* 6. Long, sleek robotic fingers (Segmented, arching outward, tip meets at x=150) */}
    {/* Middle Finger (tips at x=148, y=10) */}
    <circle cx="112" cy="110" r="4.5" fill="url(#silver-ceramic)" stroke="#1e293b" />
    <path d="M110,110 L115,110 L125,75 L120,75 Z" fill="url(#silver-ceramic)" stroke="#1e293b" strokeWidth="1" />
    <circle cx="123" cy="75" r="3.5" fill="url(#silver-ceramic)" />
    <path d="M121,75 L126,75 L138,40 L133,40 Z" fill="url(#silver-ceramic)" stroke="#1e293b" strokeWidth="1" />
    <circle cx="136" cy="40" r="3" fill="url(#silver-ceramic)" />
    {/* Distal tip sweeps exactly flush to x=150 boundary for Namaste connection */}
    <path d="M134,40 L138,40 C140,30 150,22 150,10 C150,7 148,7 145,10 L133,40 Z" fill="url(#silver-ceramic)" stroke="#1e293b" strokeWidth="1" />

    {/* Index Finger (tip at x=138, y=28) */}
    <circle cx="102" cy="115" r="4.5" fill="url(#silver-ceramic)" stroke="#1e293b" />
    <path d="M100,115 L105,115 L113,82 L108,82 Z" fill="url(#silver-ceramic)" stroke="#1e293b" strokeWidth="1" />
    <circle cx="111" cy="82" r="3.5" fill="url(#silver-ceramic)" />
    <path d="M109,82 L114,82 L124,50 L119,50 Z" fill="url(#silver-ceramic)" stroke="#1e293b" strokeWidth="1" />
    <circle cx="122" cy="50" r="3" fill="url(#silver-ceramic)" />
    <path d="M120,50 L124,50 L138,28 C138,25 136,25 133,28 L119,50 Z" fill="url(#silver-ceramic)" stroke="#1e293b" strokeWidth="1" />

    {/* Ring Finger (tip at x=126, y=46) */}
    <circle cx="92" cy="125" r="4" fill="url(#silver-ceramic)" stroke="#1e293b" />
    <path d="M90,125 L95,125 L101,92 L96,92 Z" fill="url(#silver-ceramic)" stroke="#1e293b" strokeWidth="1" />
    <circle cx="99" cy="92" r="3.5" fill="url(#silver-ceramic)" />
    <path d="M97,92 L102,92 L112,62 L107,62 Z" fill="url(#silver-ceramic)" stroke="#1e293b" strokeWidth="1" />
    <circle cx="110" cy="62" r="3" fill="url(#silver-ceramic)" />
    <path d="M108,62 L112,62 L126,46 C126,43 124,43 121,46 L107,62 Z" fill="url(#silver-ceramic)" stroke="#1e293b" strokeWidth="1" />

    {/* Pinky Finger (tip at x=112, y=66) */}
    <circle cx="82" cy="135" r="4" fill="url(#silver-ceramic)" stroke="#1e293b" />
    <path d="M80,135 L85,135 L90,105 L85,105 Z" fill="url(#silver-ceramic)" stroke="#1e293b" strokeWidth="1" />
    <circle cx="88" cy="105" r="3.5" fill="url(#silver-ceramic)" />
    <path d="M86,105 L91,105 L99,78 L94,78 Z" fill="url(#silver-ceramic)" stroke="#1e293b" strokeWidth="1" />
    <circle cx="97" cy="78" r="3" fill="url(#silver-ceramic)" />
    <path d="M95,78 L99,78 L112,66 C112,63 110,63 107,66 L94,78 Z" fill="url(#silver-ceramic)" stroke="#1e293b" strokeWidth="1" />

    {/* Detailed filigree etched lines on the fingers */}
    <path d="M115,108 Q125,75 130,55" stroke="#94a3b8" strokeWidth="0.8" opacity="0.5" />
    <path d="M103,113 Q113,82 118,60" stroke="#94a3b8" strokeWidth="0.8" opacity="0.5" />

    {/* Thumb folding elegantly inside */}
    <circle cx="48" cy="170" r="5" fill="url(#silver-ceramic)" stroke="#1e293b" />
    <path d="M46,170 L51,170 L72,148 L67,148 Z" fill="url(#silver-ceramic)" stroke="#1e293b" strokeWidth="1" />
    <circle cx="70" cy="148" r="4" fill="url(#silver-ceramic)" />
    <path d="M68,148 L73,148 L88,132 L83,132 Z" fill="url(#silver-ceramic)" stroke="#1e293b" strokeWidth="1" />
    <circle cx="86" cy="132" r="3" fill="url(#silver-ceramic)" />
    <path d="M84,132 L88,132 L98,124 C100,122 98,120 95,122 L83,132 Z" fill="url(#silver-ceramic)" stroke="#1e293b" strokeWidth="1" />
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
      {/* 🌌 High-Tech Cyber-Spiritual Halo / Mandala (Matching image perfectly) */}
      <div className="absolute flex items-center justify-center pointer-events-none z-0 scale-75 sm:scale-100">
        {/* Glowing Central Cyan Ring */}
        <motion.div 
          animate={{ scale: [1, 1.06, 1], opacity: [0.7, 0.95, 0.7] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-44 h-44 rounded-full border-4 border-cyan-400 bg-cyan-500/10 shadow-[0_0_60px_rgba(6,182,212,0.5)] flex items-center justify-center"
        >
          <div className="w-32 h-32 rounded-full border border-cyan-300/40 shadow-[inner_0_0_20px_rgba(6,182,212,0.3)]" />
        </motion.div>

        {/* Concentric Rotating Turbine Ridges */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute w-[240px] h-[240px] rounded-full border-[10px] border-double border-slate-700/50 border-t-cyan-500/40 border-b-indigo-500/40"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute w-[280px] h-[280px] rounded-full border border-dashed border-slate-600/30"
        />

        {/* Outer Circular Halo of Glowing Golden LEDs */}
        <div className="absolute w-[340px] h-[340px] flex items-center justify-center">
          {[...Array(16)].map((_, i) => {
            const angle = (i * 360) / 16;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0.3 }}
                animate={{ 
                  opacity: [0.3, 0.95, 0.3],
                  scale: [1, 1.25, 1] 
                }}
                transition={{ 
                  duration: 2.2, 
                  repeat: Infinity, 
                  delay: i * 0.125,
                  ease: "easeInOut" 
                }}
                className="absolute w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.85)]"
                style={{
                  transform: `rotate(${angle}deg) translate(170px)`,
                }}
              />
            );
          })}
        </div>

        {/* Inner Circular Halo of Glowing Golden LEDs */}
        <div className="absolute w-[200px] h-[200px] flex items-center justify-center">
          {[...Array(12)].map((_, i) => {
            const angle = (i * 360) / 12;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0.4 }}
                animate={{ 
                  opacity: [0.4, 0.95, 0.4],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 1.8, 
                  repeat: Infinity, 
                  delay: i * 0.15,
                  ease: "easeInOut" 
                }}
                className="absolute w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.85)]"
                style={{
                  transform: `rotate(${angle}deg) translate(100px)`,
                }}
              />
            );
          })}
        </div>
      </div>

      <div className="relative flex flex-col items-center z-10">
        {/* Hands Container - flex gap-0 ensures precise contact of bounding boxes */}
        <div className="relative flex items-center justify-center gap-0 h-64 mb-10">
          {/* Left Hand (Bronze/Copper metallic cyborg hand) */}
          <motion.div
            initial={{ x: -140, y: 20, rotate: -25, opacity: 0 }}
            animate={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.25, 1, 0.5, 1] }}
          >
            <LeftCyborgHand />
          </motion.div>

          {/* Right Hand (Symmetrical Silver Ceramic Mirror hand pointing Left) */}
          <motion.div
            initial={{ x: 140, y: 20, rotate: 25, opacity: 0 }}
            animate={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.25, 1, 0.5, 1] }}
            style={{ scaleX: -1 }}
          >
            <RightCyborgHand />
          </motion.div>
        </div>

        {/* Spiritual Greeting Text */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.65, ease: [0.25, 1, 0.5, 1] }}
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
