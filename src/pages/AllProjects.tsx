import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { portfolioData as initialData } from "@/data/portfolioData";
import { useProjectFilter } from "@/hooks/useProjectFilter";
import ProjectCard from "@/components/portfolio/ProjectCard";
import Navbar from "@/components/portfolio/Navbar";
import Footer from "@/components/portfolio/Footer";
import SEO from "@/components/portfolio/SEO";
import { motion, AnimatePresence } from "framer-motion";
import { useCMSData } from "@/context/CMSContext";

const AllProjects = () => {
  const cmsProjects = useCMSData(d => d.projects) || initialData.projects;
  const {
    categories, domains,
    selectedCategory, selectedDomain,
    setSelectedCategory, setSelectedDomain,
    filteredProjects,
    counts, domainCounts,
  } = useProjectFilter(cmsProjects);
  const [searchQuery, setSearchQuery] = useState("");

  const finalFilteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return filteredProjects;
    const query = searchQuery.toLowerCase().trim();
    return filteredProjects.filter(p => {
      const titleMatch = p.title?.toLowerCase().includes(query);
      const descMatch = p.description?.toLowerCase().includes(query);
      const techMatch = Array.isArray(p.tech) && p.tech.some((t: string) => t.toLowerCase().includes(query));
      const categoryMatch = Array.isArray(p.category) && p.category.some((c: string) => c.toLowerCase().includes(query));
      const domainMatch = typeof p.domain === "string" && p.domain.toLowerCase().includes(query);
      return titleMatch || descMatch || techMatch || categoryMatch || domainMatch;
    });
  }, [filteredProjects, searchQuery]);

  return (
    <div className="min-h-screen bg-background w-full overflow-x-hidden flex flex-col relative">
      <SEO title="All Projects" />
      <Navbar />
      <div className="flex-1 section-padding pt-28">
        <div className="container mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              All <span className="gradient-text">Projects</span>
            </h1>
            <p className="text-muted-foreground">Browse all my work by category or domain.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
            {/* Sidebar Filter */}
            <aside className="w-full md:w-64 lg:w-72 shrink-0">
              <div className="sticky top-28 glass-card p-5 rounded-xl border border-border/50">
                {/* Search Bar */}
                <div className="relative mb-6">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60">
                    <Search size={15} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 rounded-lg border border-border/40 bg-secondary/10 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all text-foreground"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-[10px] font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* ── Category Filter ── */}
                <h3 className="text-sm font-heading font-semibold mb-3 text-foreground uppercase tracking-wider">Categories</h3>
                <div className="flex flex-col gap-1.5 mb-6">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`flex items-center justify-between w-full px-4 py-2.5 rounded-lg text-sm transition-all duration-300 border ${
                        selectedCategory === cat && selectedDomain === "All"
                          ? "bg-primary/15 text-primary border-primary/30 shadow-sm shadow-primary/20 font-semibold"
                          : "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:border-border/30"
                      }`}
                    >
                      <span className="font-medium">{cat}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        selectedCategory === cat && selectedDomain === "All"
                          ? "bg-primary/20 text-primary"
                          : "bg-secondary/20 text-secondary-foreground"
                      }`}>
                        {counts[cat] || 0}
                      </span>
                    </button>
                  ))}
                </div>

                {/* ── Domain Filter (only shown when ≥1 project has a domain) ── */}
                {domains.length > 0 && (
                  <>
                    <h3 className="text-sm font-heading font-semibold mb-3 text-foreground uppercase tracking-wider">Domain</h3>
                    <div className="flex flex-col gap-1.5">
                      {domains.map((dom) => (
                        <button
                          key={dom}
                          onClick={() => setSelectedDomain(dom)}
                          className={`flex items-center justify-between w-full px-4 py-2.5 rounded-lg text-sm transition-all duration-300 border ${
                            selectedDomain === dom
                              ? "bg-amber-500/15 text-amber-500 border-amber-500/30 shadow-sm shadow-amber-500/10 font-semibold"
                              : "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:border-border/30"
                          }`}
                        >
                          <span className="font-medium">{dom}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            selectedDomain === dom
                              ? "bg-amber-500/20 text-amber-500"
                              : "bg-secondary/20 text-secondary-foreground"
                          }`}>
                            {domainCounts[dom] || 0}
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </aside>

            {/* Project Grid */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-heading font-semibold text-foreground">
                  {selectedDomain !== "All"
                    ? `${selectedDomain} Projects`
                    : selectedCategory === "All"
                      ? "All Projects"
                      : `${selectedCategory} Projects`}
                </h2>
                <span className="text-sm font-medium text-secondary-foreground bg-secondary px-3 py-1 rounded-full border border-border/50">
                  Showing {finalFilteredProjects.length} result{finalFilteredProjects.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <motion.div 
                layout
                className="grid gap-6 md:gap-8"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))" }}
              >
                <AnimatePresence mode="popLayout">
                  {finalFilteredProjects.map((p, i) => (
                    <motion.div
                      key={p.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ProjectCard project={p} index={i} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {finalFilteredProjects.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="glass-card p-12 text-center rounded-xl border border-border/50 mt-4"
                >
                  <p className="text-lg font-medium text-foreground mb-2">No projects found</p>
                  <p className="text-muted-foreground mb-6">Try selecting a different category or clearing the search query.</p>
                  <div className="flex justify-center gap-2">
                    <button 
                      onClick={() => setSelectedCategory("All")}
                      className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors text-xs"
                    >
                      Reset Category
                    </button>
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors text-xs"
                    >
                      Clear Search
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AllProjects;
