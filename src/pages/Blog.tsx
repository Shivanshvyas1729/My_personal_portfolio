import { useState, useEffect } from "react";
import Navbar from "@/components/portfolio/Navbar";
import Footer from "@/components/portfolio/Footer";
import SEO from "@/components/portfolio/SEO";
import { AddBlogChatbot } from "@/components/blog/AddBlogChatbot";
import rawBlogData from "@/data/blog.yaml?raw";
import yaml from "yaml";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, ExternalLink } from "lucide-react";

interface BlogPost {
  id: number;
  title: string;
  content: string;
  category: string;
  link?: string;
  date: string;
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  // Load the YAML natively
  useEffect(() => {
    try {
      const parsed = yaml.parse(rawBlogData);
      if (parsed && Array.isArray(parsed.blog)) {
        // Reverse so newest ID is first
        setPosts(parsed.blog.reverse());
      }
    } catch (e) {
      console.error("Failed to parse local blog yaml", e);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title="Blog & Thoughts" description="Personal insights, notes, and resources." />
      <Navbar />
      
      <div className="flex-1 section-padding pt-28">
        <div className="container mx-auto max-w-6xl">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft size={16} /> Back to Home
          </Link>

          <div className="flex flex-col md:flex-row gap-12">
            {/* Left side: Blog entries */}
            <div className="flex-1 space-y-6">
              <div className="mb-8">
                <h1 className="text-3xl md:text-5xl font-heading font-bold gradient-text pb-2">Digital Garden</h1>
                <p className="text-muted-foreground pt-4 max-w-2xl">Thoughts, resources, and notes directly hooked up to my Antigravity CMS pipeline!</p>
              </div>

              {posts.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground glass-card rounded-2xl">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  No posts discovered yet.
                </div>
              ) : (
                posts.map(post => (
                  <article key={post.id} className="glass-card p-6 md:p-8 rounded-2xl hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xs font-medium px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20">
                        {post.category}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(post.date).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h2 className="text-2xl font-bold font-heading mb-4 text-foreground">{post.title}</h2>
                    <div className="prose prose-invert max-w-none text-muted-foreground text-sm md:text-base whitespace-pre-wrap leading-relaxed mb-6">
                      {post.content}
                    </div>

                    {post.link && post.link !== "none" && (
                      <a href={post.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium mt-2 p-2 px-4 rounded-xl glass-card-hover border border-primary/20 bg-primary/5">
                        <ExternalLink size={14} /> Open Attached Resource
                      </a>
                    )}
                  </article>
                ))
              )}
            </div>

            {/* Right side: CMS Chatbot Widget */}
            <div className="w-full md:w-[450px]">
              <div className="sticky top-28">
                <div className="mb-4">
                  <h3 className="font-heading font-semibold text-xl">Admin Access</h3>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">Inject live Git commits dynamically.</p>
                </div>
                <AddBlogChatbot />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Blog;
