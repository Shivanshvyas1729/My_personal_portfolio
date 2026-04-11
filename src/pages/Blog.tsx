import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/portfolio/Navbar";
import Footer from "@/components/portfolio/Footer";
import SEO from "@/components/portfolio/SEO";
import { AddBlogChatbot } from "@/components/blog/AddBlogChatbot";
import { FilterBar } from "@/components/blog/FilterBar";
import { BlogCard } from "@/components/blog/BlogCard";
import { BlogModal } from "@/components/blog/BlogModal";
import { AdminAuth } from "@/components/blog/AdminAuth";
import { AdminPanel } from "@/components/blog/AdminPanel";
import rawBlogData from "@/data/blog.yaml?raw";
import yaml from "yaml";
import { BookOpen, FileWarning, EyeOff } from "lucide-react";

export interface BlogPost {
  id: number;
  title: string;
  slug?: string;
  content: string;
  category: string;
  type?: string[];
  resources?: { label: string; url: string }[];
  date: string;
  featured?: boolean;
  draft?: boolean;
  readingTime?: number;
  isPending?: boolean;
}

const CATEGORIES = ["All", "Thoughts", "Notes", "Books", "Links"];
const POSTS_PER_PAGE = 6;

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // Filters State
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState("latest");
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  
  // View State
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  // Load Data
  useEffect(() => {
    try {
      const parsed = yaml.parse(rawBlogData);
      if (parsed && Array.isArray(parsed.blog)) {
        setPosts(parsed.blog);
      }
    } catch (e) {
      console.error("Failed to parse local blog yaml", e);
    }
  }, []);

  // Compute Tags globally relative to visible items
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    posts.forEach(p => {
      if (p.type && Array.isArray(p.type)) {
        p.type.forEach(t => tagSet.add(t));
      }
    });
    return Array.from(tagSet);
  }, [posts]);

  // SMART SEARCH RANKING AND FILTERING PIPELINE
  const filteredAndSortedPosts = useMemo(() => {
    let result = [...posts];

    // 1. Initial Strict Trims (Drafts / Featured / Category)
    result = result.filter(p => !p.draft || isAdmin);
    
    if (showFeaturedOnly) {
      result = result.filter(p => p.featured);
    }
    
    if (activeCategory !== "All") {
      result = result.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase());
    }

    if (selectedTags.length > 0) {
      result = result.filter(p => p.type?.some(tag => selectedTags.includes(tag)));
    }

    // 2. Smart Search execution
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      result = result.map(post => {
        let score = 0;
        if (post.title.toLowerCase().includes(q)) score += 3; // Title weight
        if (post.type?.some(t => t.toLowerCase().includes(q))) score += 2; // Tag weight
        if (post.content.toLowerCase().includes(q)) score += 1; // Content weight

        // Exact match bounds
        if (post.title.toLowerCase() === q) score += 5;

        return { ...post, _searchScore: score };
      }).filter(post => post._searchScore > 0);
    }

    // 3. Sorting Execution
    result.sort((a, b) => {
      if (sortOption === "relevant" && q) {
        return ((b as any)._searchScore || 0) - ((a as any)._searchScore || 0);
      }
      if (sortOption === "oldest") {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (sortOption === "longest") {
        return (b.readingTime || 0) - (a.readingTime || 0);
      }
      // "latest" default
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return result;
  }, [posts, isAdmin, activeCategory, searchQuery, selectedTags, showFeaturedOnly, sortOption]);

  // Pagination Reset Trigger
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery, selectedTags, showFeaturedOnly, sortOption]);

  // Pagination bounds
  const totalPages = Math.ceil(filteredAndSortedPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = filteredAndSortedPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE, 
    currentPage * POSTS_PER_PAGE
  );

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const resetFilters = () => {
    setActiveCategory("All");
    setSearchQuery("");
    setSelectedTags([]);
    setSortOption("latest");
    setShowFeaturedOnly(false);
  };

  const handleOptimisticInject = (newPost: BlogPost) => {
    const pended = { ...newPost, isPending: true };
    setPosts(prev => [...prev, pended]);
    setTimeout(() => {
      setPosts(prev => prev.map(p => p.id === pended.id ? { ...p, isPending: false } : p));
    }, 4000);
  };

  const handleOptimisticDelete = (deleted: BlogPost) => {
    // Immediately remove from local state — GitHub commit already sent
    setPosts(prev => prev.filter(p => p.id !== deleted.id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      <SEO title="Digital Garden | Blog CMS" description="Thoughts, notes, and technical architectures." />
      <Navbar />

      <AdminAuth isAdmin={isAdmin} setIsAdmin={setIsAdmin} />
      
      <div className="flex-1 section-padding pt-24 pb-20">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-heading font-bold gradient-text pb-2 tracking-tight">System Logs</h1>
            <p className="text-muted-foreground pt-4 text-base md:text-lg max-w-2xl leading-relaxed">
              Technical writes, book notes, and fragmented thoughts directly deployed via the Antigravity CI/CD CMS engine.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              
              <FilterBar 
                categories={CATEGORIES}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                availableTags={availableTags}
                selectedTags={selectedTags}
                toggleTag={toggleTag}
                sortOption={sortOption}
                setSortOption={setSortOption}
                showFeaturedOnly={showFeaturedOnly}
                setShowFeaturedOnly={setShowFeaturedOnly}
                resetFilters={resetFilters}
              />

              {/* Grid Result Output */}
              {paginatedPosts.length === 0 ? (
                <div className="text-center py-32 text-muted-foreground glass-card rounded-2xl border-dashed border-2 border-border/50">
                  <FileWarning className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="font-heading font-medium text-lg">No endpoints matched your criteria.</p>
                  <p className="text-sm mt-2 opacity-60">Try adjusting your filters or search query.</p>
                  <button onClick={resetFilters} className="mt-6 px-6 py-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors text-sm font-medium">Clear Search</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {paginatedPosts.map(post => (
                    <div key={post.id} className="relative group/card h-full flex flex-col">
                      {post.isPending && (
                        <div className="absolute -top-3 -right-3 z-10 bg-blue-500 text-white text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full shadow-lg shadow-blue-500/20 animate-pulse border border-white/20">
                          Publishing...
                        </div>
                      )}
                      
                      {post.draft && !isAdmin && (
                        <div className="absolute inset-0 z-20 backdrop-blur-md bg-background/50 flex flex-col items-center justify-center rounded-2xl border border-border/50">
                          <EyeOff size={24} className="opacity-50 mb-2"/>
                          <p className="text-xs font-semibold tracking-widest uppercase opacity-50">Confidential Draft</p>
                        </div>
                      )}

                      <div className="h-full">
                        <BlogCard post={post} onClick={() => setSelectedPost(post)} isAdmin={isAdmin} onDelete={handleOptimisticDelete} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination Blocks */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-6 mt-14">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-6 py-2.5 rounded-full text-sm font-medium border border-border/50 bg-card hover:bg-muted disabled:opacity-30 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm font-medium text-muted-foreground bg-muted/40 px-4 py-1.5 rounded-full">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-6 py-2.5 rounded-full text-sm font-medium border border-border/50 bg-card hover:bg-muted disabled:opacity-30 transition-colors"
                  >
                    Next Frame
                  </button>
                </div>
              )}

            </div>{/* /flex-1 min-w-0 */}
          </div>{/* /flex flex-col lg:flex-row */}
        </div>{/* /container */}
      </div>{/* /section-padding */}
      
      <Footer />

      {/* Floating Admin Panel (draggable + resizable) */}
      {isAdmin && <AdminPanel onSuccess={handleOptimisticInject} />}

      {/* Floating CMS Chatbot (only active when Admin) */}
      {isAdmin && <AddBlogChatbot onSuccessPayload={handleOptimisticInject} />}

      <BlogModal post={selectedPost} isOpen={!!selectedPost} onClose={() => setSelectedPost(null)} isAdmin={isAdmin} />
    </div>
  );
}
