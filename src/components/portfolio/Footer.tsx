import { portfolioData as initialData } from "@/data/portfolioData";
import { useCMSData } from "@/context/CMSContext";
import { Github, Linkedin, Mail, ArrowUp } from "lucide-react";
import Magnetic from "@/components/ui/Magnetic";

const Footer = () => {
  const personal = useCMSData(d => d.personal) || initialData.personal;
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative border-t border-border/10 pt-8 pb-10 px-6 bg-background overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-32 bg-primary/5 blur-[100px] -z-10 pointer-events-none" />

      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-4">
          <div className="flex flex-col items-center md:items-start gap-4">
            <h3 className="font-heading text-xl font-bold gradient-text inline-block no-reveal">
              {personal?.name || initialData.personal.name}
              <span className="text-foreground">.</span>
            </h3>
            <div className="flex flex-col md:flex-row items-center gap-2 text-[12px] font-medium tracking-tight text-muted-foreground/40">
              <span>© {new Date().getFullYear()} All rights reserved.</span>
            </div>
          </div>

          <div className="flex items-center gap-6 relative">
            <Magnetic strength={0.2}>
              <button
                onClick={scrollToTop}
                className="p-3 rounded-xl glass-card text-muted-foreground hover:text-primary hover:border-primary/50 transition-all duration-300 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest"
              >
                Back to top <ArrowUp size={14} />
              </button>
            </Magnetic>
          </div>
        </div>

      </div>

      {/* Subtle Developer Signature Easter Egg */}
      <div className="absolute bottom-2 left-4 pointer-events-none md:pointer-events-auto">
        <span 
          className="text-[10px] font-mono tracking-tighter text-foreground/10 hover:text-primary hover:opacity-100 transition-all duration-700 cursor-help select-none no-reveal block px-2 py-1"
          onClick={() => {
            const _0x1c = atob('aHR0cHM6Ly93d3cubGlua2VkaW4uY29tL2luL3NoaXZhbnNodnlhcy8=');
            window.open(_0x1c, '_blank');
          }}
        >
          :: crafted_by_shivansh
        </span>
      </div>
    </footer>
  );
};

export default Footer;
