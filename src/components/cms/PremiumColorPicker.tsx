import React from 'react';
import { createPortal } from 'react-dom';
import { Palette, Plus } from 'lucide-react';
import { toast } from 'sonner';

// Helper Color Utilities
const hexToRgb = (hex: string) => {
  const clean = (hex || '').replace('#', '').trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return { r: isNaN(r) ? 0 : r, g: isNaN(g) ? 0 : g, b: isNaN(b) ? 0 : b };
  }
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return { r: isNaN(r) ? 0 : r, g: isNaN(g) ? 0 : g, b: isNaN(b) ? 0 : b };
};

const rgbToHex = (r: number, g: number, b: number) => {
  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)));
  const rh = clamp(r).toString(16).padStart(2, '0');
  const gh = clamp(g).toString(16).padStart(2, '0');
  const bh = clamp(b).toString(16).padStart(2, '0');
  return `#${rh}${gh}${bh}`;
};

const BASIC_COLORS = [
  // Soft Pastels
  '#fca5a5', '#fdba74', '#fde047', '#86efac', '#67e8f9', '#93c5fd', '#a5b4fc', '#c084fc',
  '#f472b6', '#cbd5e1', '#f87171', '#fb923c', '#facc15', '#4ade80', '#22d3ee', '#60a5fa',
  // Vibrant Primary/Secondary
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#4f46e5', '#8b5cf6',
  '#ec4899', '#64748b', '#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#0891b2', '#2563eb',
  // Dark Rich Tones & Deep Grays
  '#b91c1c', '#c2410c', '#a16207', '#15803d', '#0e7490', '#1d4ed8', '#4338ca', '#6d28d9',
  '#be185d', '#334155', '#ffffff', '#cbd5e1', '#94a3b8', '#475569', '#1e293b', '#000000'
];

interface PremiumColorPickerProps {
  value: string;
  onChange: (val: string) => void;
  isDark: boolean;
}

export const PremiumColorPicker: React.FC<PremiumColorPickerProps> = ({ value, onChange, isDark }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [hexInput, setHexInput] = React.useState(value || '');
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  // Custom colors preset load/save using localStorage
  const [customColors, setCustomColors] = React.useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('cms_custom_color_presets');
      return saved ? JSON.parse(saved) : Array(16).fill('');
    } catch {
      return Array(16).fill('');
    }
  });

  React.useEffect(() => {
    setHexInput(value || '');
  }, [value]);

  const { r, g, b } = hexToRgb(value);

  const handleHexChange = (val: string) => {
    setHexInput(val);
    if (/^#[0-9A-F]{3}$/i.test(val) || /^#[0-9A-F]{6}$/i.test(val) || /^#[0-9A-F]{8}$/i.test(val)) {
      onChange(val);
    }
  };

  const handleRgbChange = (channel: 'r' | 'g' | 'b', val: number) => {
    const bounded = Math.max(0, Math.min(255, val));
    const nextR = channel === 'r' ? bounded : r;
    const nextG = channel === 'g' ? bounded : g;
    const nextB = channel === 'b' ? bounded : b;
    const hex = rgbToHex(nextR, nextG, nextB);
    onChange(hex);
    setHexInput(hex);
  };

  const handleAddCustomColor = () => {
    const nextColors = [...customColors];
    const emptyIndex = nextColors.findIndex(c => c === '' || !c);
    if (emptyIndex !== -1) {
      nextColors[emptyIndex] = value || '#000000';
    } else {
      nextColors.shift();
      nextColors.push(value || '#000000');
    }
    setCustomColors(nextColors);
    localStorage.setItem('cms_custom_color_presets', JSON.stringify(nextColors));
    toast.success("Color saved to custom presets!");
  };

  return (
    <div ref={containerRef} className="relative inline-block w-full max-w-[280px]">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          style={{ backgroundColor: value || '#6366f1' }}
          className="w-9 h-9 rounded-lg border border-border/60 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-md shrink-0 flex items-center justify-center text-white"
          title="Click to choose color"
        >
          <Palette size={16} className="mix-blend-difference drop-shadow" />
        </button>
        <input
          type="text"
          value={hexInput}
          onChange={(e) => handleHexChange(e.target.value)}
          className={`flex-1 min-w-0 font-mono text-xs font-bold uppercase p-2.5 rounded-lg border focus:outline-none focus:border-primary/50 shadow-inner ${
            isDark ? 'bg-slate-900 border-border/30 text-foreground font-semibold' : 'bg-white border-slate-350 text-slate-800 font-semibold'
          }`}
          placeholder="#ffffff"
        />
      </div>

      {isOpen && createPortal(
        <div 
          className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200 select-none"
          onClick={() => setIsOpen(false)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-[420px] p-6 rounded-2xl border shadow-2xl animate-in zoom-in-95 duration-200 ${
              isDark ? 'bg-slate-950 border-border/80 text-foreground shadow-black/90' : 'bg-white border-slate-250 text-slate-850 shadow-slate-400/35'
            }`}
          >
            {/* Header Area */}
            <div className="flex items-center justify-between border-b pb-3.5 mb-5 border-border/30">
              <div className="flex items-center gap-2.5">
                <div 
                  style={{ backgroundColor: value || '#6366f1' }}
                  className="w-7 h-7 rounded-lg border border-white/20 shadow-inner shrink-0" 
                />
                <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1 text-foreground/90">
                  🎨 PREMIUM COLOR PALETTE
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground text-xs uppercase font-extrabold cursor-pointer hover:scale-105 transition-all"
              >
                Close
              </button>
            </div>

            {/* Visual Color Spectrum (Double Height) */}
            <div className="mb-5">
              <div 
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const percentage = Math.max(0, Math.min(1, x / rect.width));
                  const colorsList = ['#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', '#ff0000'];
                  const segmentCount = colorsList.length - 1;
                  const rawIdx = percentage * segmentCount;
                  const baseIdx = Math.floor(rawIdx);
                  const fract = rawIdx - baseIdx;
                  const c1 = hexToRgb(colorsList[baseIdx]);
                  const c2 = hexToRgb(colorsList[baseIdx + 1] || '#ff0000');
                  const nr = Math.round(c1.r + (c2.r - c1.r) * fract);
                  const ng = Math.round(c1.g + (c2.g - c1.g) * fract);
                  const nb = Math.round(c1.b + (c2.b - c1.b) * fract);
                  const hex = rgbToHex(nr, ng, nb);
                  onChange(hex);
                  setHexInput(hex);
                }}
                className="h-20 w-full rounded-xl cursor-pointer border border-border/40 shadow-inner relative overflow-hidden active:scale-[0.99] transition-transform duration-100"
                style={{
                  background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
                }}
              />
              <p className="text-[10px] text-muted-foreground mt-1.5 text-center font-bold">💡 Touch, drag, or click anywhere on the spectrum above</p>
            </div>

            {/* Standard Presets Section (Large spheres) */}
            <div className="space-y-2 mb-5">
              <h5 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Standard Presets</h5>
              <div className="grid grid-cols-8 gap-2">
                {BASIC_COLORS.map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      onChange(c);
                      setHexInput(c);
                    }}
                    style={{ backgroundColor: c }}
                    className={`w-8 h-8 rounded-full border hover:scale-115 active:scale-90 transition-all cursor-pointer ${
                      (value || '').toLowerCase() === c.toLowerCase() 
                        ? 'border-primary ring-2 ring-primary/40 scale-105 shadow-md' 
                        : 'border-border/30'
                    }`}
                    title={c}
                  />
                ))}
              </div>
            </div>

            {/* Custom Saved Colors Section */}
            <div className="space-y-2 mb-5 border-t border-border/15 pt-4">
              <div className="flex items-center justify-between">
                <h5 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">My Saved Colors</h5>
                <button
                  type="button"
                  onClick={handleAddCustomColor}
                  className="p-1 rounded bg-primary/10 hover:bg-primary/20 text-primary transition-colors flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95"
                  title="Save current color to slot"
                >
                  <Plus size={13} className="font-bold stroke-[3]" />
                </button>
              </div>
              <div className="grid grid-cols-8 gap-2">
                {customColors.map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      if (c) {
                        onChange(c);
                        setHexInput(c);
                      }
                    }}
                    style={{ backgroundColor: c || 'transparent' }}
                    className={`w-8 h-8 rounded-full border hover:scale-115 active:scale-90 transition-all cursor-pointer ${
                      c ? ((value || '').toLowerCase() === c.toLowerCase() ? 'border-primary ring-2 ring-primary/40' : 'border-border/30') : 'border-dashed border-border/35 bg-muted/5'
                    }`}
                    title={c || 'Empty slot'}
                  />
                ))}
              </div>
            </div>

            {/* RGB Numeric Fields Input */}
            <div className="grid grid-cols-3 gap-3 border-t border-border/15 pt-4 text-[10px] font-mono font-bold">
              <div>
                <span className="text-[9px] text-muted-foreground block uppercase mb-1">Red</span>
                <input
                  type="number"
                  min={0}
                  max={255}
                  value={r}
                  onChange={(e) => handleRgbChange('r', Number(e.target.value))}
                  className={`w-full p-2 text-center rounded-lg border focus:outline-none text-xs font-semibold ${
                    isDark ? 'bg-slate-900 border-border/30 text-foreground' : 'bg-slate-50 border-slate-350 text-slate-800'
                  }`}
                />
              </div>
              <div>
                <span className="text-[9px] text-muted-foreground block uppercase mb-1">Green</span>
                <input
                  type="number"
                  min={0}
                  max={255}
                  value={g}
                  onChange={(e) => handleRgbChange('g', Number(e.target.value))}
                  className={`w-full p-2 text-center rounded-lg border focus:outline-none text-xs font-semibold ${
                    isDark ? 'bg-slate-900 border-border/30 text-foreground' : 'bg-slate-50 border-slate-350 text-slate-800'
                  }`}
                />
              </div>
              <div>
                <span className="text-[9px] text-muted-foreground block uppercase mb-1">Blue</span>
                <input
                  type="number"
                  min={0}
                  max={255}
                  value={b}
                  onChange={(e) => handleRgbChange('b', Number(e.target.value))}
                  className={`w-full p-2 text-center rounded-lg border focus:outline-none text-xs font-semibold ${
                    isDark ? 'bg-slate-900 border-border/30 text-foreground' : 'bg-slate-50 border-slate-350 text-slate-800'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
