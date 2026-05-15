import { portfolioData as initialData } from "@/data/portfolioData";
import { useCMSData } from "@/context/CMSContext";

const Footer = () => {
  const personal = useCMSData(d => d.personal) || initialData.personal;
  
  return (
    <footer className="border-t border-border/40 py-10 px-6 bg-background/50">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <p className="text-muted-foreground/60 text-[13px] font-medium tracking-wide">
          © {new Date().getFullYear()} {personal?.name || initialData.personal.name}. All rights reserved.
        </p>
        
        <div className="flex items-center gap-4">
          <span 
            className="opacity-[0.05] hover:opacity-80 text-[11px] transition-all duration-700 cursor-pointer font-mono select-none tracking-tighter"
            title="Shivansh's Workspace"
            onClick={() => {
              const _0x1c = atob('aHR0cHM6Ly93d3cubGlua2VkaW4uY29tL2luL3NoaXZhbnNodnlhcy8=');
              window.open(_0x1c, '_blank');
            }}
          >
            Crafted by Shivansh
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
