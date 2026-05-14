import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Suspense, lazy, useState } from "react";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "./hooks/useAuth";
import { CMSProvider } from "./context/CMSContext";
import EdgeRopeLight from "./components/portfolio/EdgeRopeLight";
import GlobalTextEffector from "./components/portfolio/GlobalTextEffector";
import GlobalScrollReveal from "./components/portfolio/GlobalScrollReveal";
import CursorGlow from "./components/ui/CursorGlow";

// Eager — homepage loads instantly
import Index from "./pages/Index.tsx";

// Lazy — only load when navigated to (reduces initial bundle ~40%)
const AllProjects  = lazy(() => import("./pages/AllProjects.tsx"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail.tsx"));
const Blog          = lazy(() => import("./pages/Blog.tsx"));
const NotFound      = lazy(() => import("./pages/NotFound.tsx"));
const ChatAssistant = lazy(() => import("./components/portfolio/ChatAssistant.tsx"));
const AdminAuth     = lazy(() => import("./components/blog/AdminAuth.tsx").then(m => ({ default: m.AdminAuth })));

const queryClient = new QueryClient();

// Page loader fallback
const PageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background">
    <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
  </div>
);

// Global wrapper that provides the auth lock button available on every page
function AppShell() {
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <BrowserRouter>
      {/* Global Cursor Ambient Glow */}
      <CursorGlow />

      {/* Global Dynamic Text Interaction */}
      <GlobalTextEffector />

      {/* Global Scroll Reveal Animation */}
      <GlobalScrollReveal />

      {/* Global Seamless Rope Light Layer */}
      <EdgeRopeLight />

      {/* Global floating lock — visible on every page */}
      <Suspense fallback={null}>
        <AdminAuth isAdmin={isAdmin} setIsAdmin={setIsAdmin} />
      </Suspense>

      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/"           element={<Index />} />
          <Route path="/projects"   element={<AllProjects />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/blog"       element={<Blog />} />
          <Route path="*"           element={<NotFound />} />
        </Routes>
      </Suspense>

      <Suspense fallback={null}>
        <ChatAssistant />
      </Suspense>
    </BrowserRouter>
  );
}

const App = () => (
  <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <AuthProvider>
      <CMSProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppShell />
          </TooltipProvider>
        </QueryClientProvider>
      </CMSProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
