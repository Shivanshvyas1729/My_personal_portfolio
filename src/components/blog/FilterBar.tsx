import { Search, X, SlidersHorizontal, Star } from "lucide-react";
import { useEffect, useState } from "react";

interface FilterBarProps {
  categories: string[];
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  availableTags: string[];
  selectedTags: string[];
  toggleTag: (tag: string) => void;
  
  sortOption: string;
  setSortOption: (sort: string) => void;
  
  showFeaturedOnly: boolean;
  setShowFeaturedOnly: (show: boolean) => void;
  
  resetFilters: () => void;
}

export function FilterBar({
  categories,
  activeCategory,
  setActiveCategory,
  searchQuery,
  setSearchQuery,
  availableTags,
  selectedTags,
  toggleTag,
  sortOption,
  setSortOption,
  showFeaturedOnly,
  setShowFeaturedOnly,
  resetFilters
}: FilterBarProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(localSearch);
    }, 300);
    return () => clearTimeout(handler);
  }, [localSearch, setSearchQuery]);

  // Sync if reset happens externally
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const activeFilterCount = (activeCategory !== "All" ? 1 : 0) + selectedTags.length + (showFeaturedOnly ? 1 : 0) + (searchQuery ? 1 : 0);

  return (
    <div className="sticky top-20 z-40 bg-background/80 backdrop-blur-md pb-4 pt-2 -mx-4 px-4 md:mx-0 md:px-0 lg:rounded-b-2xl border-b border-border/40 shadow-sm mb-6">
      <div className="flex flex-col gap-4">
        
        {/* Top Row: Search & Category Scroll */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar fade-edge-right">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat 
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary border border-border/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search & Sort */}
          <div className="flex w-full md:w-auto gap-2 items-center">
            <div className="relative flex-1 md:w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search posts..." 
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full bg-muted/50 border border-border/50 rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors"
               />
               {localSearch && (
                 <button onClick={() => setLocalSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                   <X size={14} />
                 </button>
               )}
            </div>
            
            <div className="relative">
               <select 
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="appearance-none bg-muted/50 border border-border/50 rounded-full pl-8 pr-8 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors cursor-pointer"
               >
                 <option value="latest">Latest</option>
                 <option value="oldest">Oldest</option>
                 <option value="relevant">Relevant</option>
                 <option value="longest">Longest</option>
               </select>
               <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Bottom Row: Tags & Toggles */}
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showFeaturedOnly 
                ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/30" 
                : "bg-muted text-muted-foreground border-border/50 hover:bg-muted/80"
            }`}
          >
            <Star size={14} className={showFeaturedOnly ? "fill-yellow-500" : ""} /> Featured
          </button>

          <div className="h-4 w-px bg-border/50 mx-1 hidden md:block"></div>

          <div className="flex flex-wrap gap-2 flex-1">
            {availableTags.slice(0, 8).map(tag => (
              <button 
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`text-[11px] px-2.5 py-1 rounded-full uppercase tracking-wider transition-colors border ${
                  selectedTags.includes(tag) 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "bg-transparent text-muted-foreground border-border/50 hover:border-primary/40 focus:bg-primary/5"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Active Constraints Readout */}
          {activeFilterCount > 0 && (
            <button 
              onClick={resetFilters}
              className="ml-auto text-xs text-destructive hover:underline flex items-center gap-1 px-2"
            >
              Clear Filters ({activeFilterCount})
            </button>
          )}

        </div>

      </div>
    </div>
  );
}
