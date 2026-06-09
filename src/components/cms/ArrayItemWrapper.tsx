import React from 'react';
import { ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { getItemPreview } from './FormHelpers';
import { useTheme } from '../../hooks/useTheme';

interface ArrayItemWrapperProps {
  item: any;
  index: number;
  total: number;
  itemSchema: z.ZodTypeAny;
  path: string[];
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRemove: () => void;
  onChange: (newVal: any) => void;
  children: React.ReactNode;
}

export const ArrayItemWrapper: React.FC<ArrayItemWrapperProps> = ({
  item,
  index,
  total,
  itemSchema,
  path,
  onMoveUp,
  onMoveDown,
  onRemove,
  onChange,
  children
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const previewText = getItemPreview(item);
  const [isExpanded, setIsExpanded] = React.useState(() => !previewText);

  return (
    <div className={`relative rounded-xl border transition-all duration-150 ${
      isExpanded 
        ? `border-accent/40 ${isDark ? 'bg-slate-900/30' : 'bg-accent/5'}` 
        : `border-border/30 overflow-hidden ${isDark ? 'bg-muted/10' : 'bg-slate-100/30'} hover:border-border/50 hover:bg-muted/15`
    }`}>
      {/* Accordion Header */}
      <div 
        onClick={() => setIsExpanded(prev => !prev)}
        className={`flex items-center justify-between py-3.5 px-4.5 cursor-pointer select-none transition-all ${
          isExpanded 
            ? 'bg-accent/5 border-l-4 border-accent/70 pl-3.5' 
            : 'bg-muted/15 hover:bg-muted/25 pl-4.5'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0 pr-12">
          <span className={`text-[10.5px] font-mono font-black tracking-wide uppercase shrink-0 ${
            isExpanded ? 'text-accent' : 'text-muted-foreground/90'
          }`}>
            Item {index + 1}
          </span>
          {!isExpanded && previewText && (
            <span className="text-xs text-muted-foreground font-medium truncate italic opacity-90">
              — {previewText.length > 75 ? `${previewText.slice(0, 75)}...` : previewText}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
          {onMoveUp && (
            <button
              type="button"
              onClick={onMoveUp}
              className="text-muted-foreground hover:text-foreground p-1.5 rounded hover:bg-muted/40 transition-colors cursor-pointer"
              title="Move Up"
            >
              <ArrowUp size={14} />
            </button>
          )}
          {onMoveDown && (
            <button
              type="button"
              onClick={onMoveDown}
              className="text-muted-foreground hover:text-foreground p-1.5 rounded hover:bg-muted/40 transition-colors cursor-pointer"
              title="Move Down"
            >
              <ArrowDown size={14} />
            </button>
          )}
          <button
            type="button"
            onClick={onRemove}
            className="text-muted-foreground hover:text-destructive p-1.5 rounded hover:bg-muted/40 transition-colors cursor-pointer"
            title="Remove Item"
          >
            <Trash2 size={14} />
          </button>
          
          <div className="w-5 h-5 flex items-center justify-center text-muted-foreground/60 ml-1.5">
            <span className={`text-[10px] transform transition-transform duration-200 ${isExpanded ? 'rotate-180 text-accent font-bold' : ''}`}>
              ▼
            </span>
          </div>
        </div>
      </div>

      {/* Accordion Content */}
      {isExpanded && (
        <div className={`p-4 md:p-5 border-t border-border/15 animate-in fade-in duration-200 ${isDark ? 'bg-black/35' : 'bg-slate-50/70'}`}>
          {children}
        </div>
      )}
    </div>
  );
};
