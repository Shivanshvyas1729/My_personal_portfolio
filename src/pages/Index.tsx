import { Suspense, lazy } from "react";
import Navbar from "@/components/portfolio/Navbar";
import Hero from "@/components/portfolio/Hero";
import About from "@/components/portfolio/About";
import SEO from "@/components/portfolio/SEO";
import Education from "@/components/portfolio/Education";
import Experience from "@/components/portfolio/Experience";
import Skills from "@/components/portfolio/Skills";
import Services from "@/components/portfolio/Services";
import Projects from "@/components/portfolio/Projects";
import Contact from "@/components/portfolio/Contact";
import Footer from "@/components/portfolio/Footer";

const TechSphere = lazy(() => import("@/components/portfolio/TechSphere"));

const Index = () => (
  <div className="min-h-screen bg-background w-full overflow-x-hidden flex flex-col relative">
    <SEO />
    <Navbar />
    <Hero />
    <About />
    <Education />
    <Experience />
    <Skills />
    <Suspense fallback={<div className="h-[400px] w-full flex items-center justify-center bg-transparent"><div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" /></div>}>
      <TechSphere />
    </Suspense>
    <Services />
    <Projects />
    <Contact />
    <Footer />
  </div>
);

export default Index;
