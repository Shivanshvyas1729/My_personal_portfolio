import React, { useState, useRef, useEffect } from "react";
import { searchKnowledge } from "@/data/knowledge";
import { KnowledgeDefinition, KnowledgeCategory } from "@/data/knowledge/categories";
import { Search, Plus, X } from "lucide-react";

interface KnowledgeAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  allowedCategories?: KnowledgeCategory[];
}

export const KnowledgeAutocomplete: React.FC<KnowledgeAutocompleteProps> = ({ 
  value, 
  onChange, 
  onSelect,
  onBlur,
  placeholder = "Search definitions...",
  allowedCategories
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<KnowledgeDefinition[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.length > 1) {
      const hits = searchKnowledge(value, 5, allowedCategories);
      setResults(hits);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [value, allowedCategories]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        if (isOpen && onBlur) onBlur();
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onBlur]);

  const handleSelect = (term: string) => {
    onSelect(term);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim()) {
      e.preventDefault();
      // If there's an exact match in results, use that. Otherwise use raw value.
      if (results.length > 0) {
        handleSelect(results[0].title);
      } else {
        handleSelect(value.trim());
      }
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={14} className="text-muted-foreground" />
        </div>
        <input
          type="text"
          className="w-full pl-9 pr-4 py-2 bg-background border border-border/50 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-foreground"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            setTimeout(() => {
              if (isOpen && onBlur) onBlur();
              setIsOpen(false);
            }, 150);
          }}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
        />
      </div>

      {isOpen && (
        <div className="absolute z-[100] mt-1 w-full bg-background/95 backdrop-blur-xl border border-border/50 rounded-lg shadow-xl overflow-hidden pointer-events-auto">
          {results.length > 0 ? (
            <ul className="max-h-[300px] overflow-y-auto scrollbar-thin divide-y divide-border/30">
              {results.map((def) => (
                <li key={def.id}>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors flex flex-col gap-1 focus:outline-none focus:bg-muted/80"
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevents input from losing focus
                      handleSelect(def.title);
                    }}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-semibold text-sm text-foreground">{def.title}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary/80 px-2 py-0.5 rounded-full border border-primary/20 bg-primary/10">
                        {def.primary_category}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{def.definition}</p>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
              <Plus size={14} /> Press Enter to add "{value}" (No definition found)
            </div>
          )}
        </div>
      )}
    </div>
  );
};
