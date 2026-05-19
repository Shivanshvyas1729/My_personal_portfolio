import React from 'react';
import { z } from 'zod';
import { useTheme } from '../../hooks/useTheme';
import { formatLabel } from './FormHelpers';

interface SettingsAccordionContainerProps {
  groups: { id: string; title: string; desc: string; keys: string[] }[];
  shape: Record<string, z.ZodTypeAny>;
  currentData: any;
  path: string[];
  onChange: (newVal: any) => void;
  renderField: (key: string) => React.ReactNode;
}

export const SettingsAccordionContainer: React.FC<SettingsAccordionContainerProps> = ({
  groups,
  shape,
  currentData,
  path,
  onChange,
  renderField
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  // Track each category group's open state independently so that opening one does NOT close another
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>(() => {
    try {
      const storageKey = `active_accordion_groups_${path.join('_')}`;
      const saved = sessionStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleToggleGroup = (groupId: string) => {
    setOpenGroups(prev => {
      const updated = { ...prev, [groupId]: !prev[groupId] };
      try {
        const storageKey = `active_accordion_groups_${path.join('_')}`;
        sessionStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  return (
    <div className="space-y-3">
      {groups.map(group => {
        // Filter out keys that don't exist in the current Zod shape to prevent rendering errors
        const activeKeys = group.keys.filter((k: string) => shape[k]);
        if (activeKeys.length === 0) return null;

        const isOpen = !!openGroups[group.id];

        return (
          <div 
            key={group.id} 
            className={`rounded-xl border transition-all duration-250 ${
              isOpen 
                ? `border-primary/45 ${isDark ? 'bg-slate-900/35' : 'bg-primary/5'} shadow-[0_0_20px_-5px_rgba(99,102,241,0.08)]` 
                : `border-border/20 overflow-hidden ${isDark ? 'bg-muted/5' : 'bg-slate-100/30'} hover:border-border/40 hover:bg-muted/10`
            }`}
          >
            {/* Header Accordion */}
            <div
              onClick={() => handleToggleGroup(group.id)}
              className={`flex items-center justify-between p-4 cursor-pointer select-none transition-all ${
                isOpen 
                  ? 'bg-primary/5 border-l-4 border-primary/70 pl-3' 
                  : 'bg-muted/5 hover:bg-muted/10 pl-4'
              }`}
            >
              <div>
                <h4 className={`text-xs font-bold tracking-wide uppercase transition-colors ${
                  isOpen ? 'text-primary font-extrabold' : 'text-foreground/90'
                }`}>
                  {group.title}
                </h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">{group.desc}</p>
              </div>
              <span className={`text-xs transform transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-primary font-bold animate-pulse' : 'text-muted-foreground/75'
              }`}>
                ▼
              </span>
            </div>

            {/* Accordion Content */}
            {isOpen && (
              <div className={`p-5 space-y-5 border-t border-border/15 animate-in fade-in duration-200 ${isDark ? 'bg-black/40' : 'bg-slate-50/70'}`}>
                {activeKeys.map((key: string) => (
                  <div key={key} className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider block">
                      {formatLabel(key)}
                    </label>
                    {renderField(key)}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
