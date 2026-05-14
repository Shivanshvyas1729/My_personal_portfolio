var ht=Object.defineProperty;var xt=(o,t,i)=>t in o?ht(o,t,{enumerable:!0,configurable:!0,writable:!0,value:i}):o[t]=i;var ne=(o,t,i)=>xt(o,typeof t!="symbol"?t+"":t,i);import{r as a,j as e,R as ft}from"./vendor-react-D0O_4nJK.js";import{Y as $e,J as ie,S as ve,K as bt,M as We,L as Be,P as we,N as yt,T as Se,O as Ye,Q as vt,R as jt,U as x,W as k,X as n,Z as B,$ as wt,a0 as St,a1 as Me,a2 as Ie,a3 as xe,a4 as Te,a5 as Nt,a6 as Ee,a7 as fe,a8 as be,a9 as kt,aa as De,ab as Ct,ac as At,ad as Lt,ae as Ve,af as Pt,ag as Mt,ah as It,ai as se,aj as ze,ak as Tt}from"./vendor-DoPIYf1i.js";const qe=a.createContext(void 0),Xt=({children:o})=>{const[t,i]=a.useState(["public"]),d=async(L,P,T)=>{try{const v=await(await fetch("/api/auth",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:L,username:T,password:P})})).json();return v.success&&v.role?(i(m=>m.includes(v.role)?m:[...m,v.role]),P&&sessionStorage.setItem("sitePassword",P),!0):!1}catch{return!1}},c=()=>{i(["public"]),sessionStorage.removeItem("sitePassword"),sessionStorage.removeItem("adminAuth")},S=L=>t.includes("admin")?!0:t.includes(L);return e.jsx(qe.Provider,{value:{roles:t,login:d,logout:c,hasAccess:S},children:o})},Et=()=>{const o=a.useContext(qe);if(!o)throw new Error("useAuth must be used within AuthProvider");return o},Dt=`# =========================================================\r
# 📌 PORTFOLIO DATA CONFIGURATION FILE\r
# =========================================================\r
# This YAML file controls the entire portfolio dynamically.\r
# You only need to edit this file to update content.\r
#\r
# =========================================================\r
# 📚 TABLE OF CONTENTS\r
# =========================================================\r
# 1. home        → Homepage settings\r
# 2. personal    → Basic personal info\r
# 3. hero        → Landing section content\r
# 4. stats       → Quick stats display\r
# 5. about       → About section\r
# 6. education   → Academic details\r
# 7. experience  → Work experience\r
# 8. skills      → Skill categories\r
# 9. techStack   → Tools & technologies\r
# 10. services   → What you offer\r
# 11. projects   → Portfolio projects\r
# 12. emailjs    → Contact form config\r
# 13. resume     → Resume button config\r
#\r
# =========================================================\r
# 🧠 USE CASE\r
# =========================================================\r
# 👉 Edit this file → Portfolio updates automatically\r
# 👉 Used by chatbot (RAG context)\r
# 👉 Used by UI (cards, sections, filters)\r
# =========================================================\r
# =========================================================\r
# 📌 PORTFOLIO CONFIG (COLLAPSIBLE VERSION)\r
# =========================================================\r
\r
# region HOME \r
home:\r
  featuredProjectsCount: 4\r
# endregion\r
\r
# region GLOBAL SETTINGS\r
\r
# 🌟 4. Soft Premium Gold (muted, classy)\r
\r
# Less neon, more “premium UI” look.\r
# settings:\r
  ropeLightColors:\r
    - "#facc15" # warm gold\r
    - "#f59e0b" # amber glow\r
    - "#eab308" # rich yellow\r
    - "#22d3ee" # cyan pop\r
    - "#818cf8" # soft indigo\r
    - "#c084fc" # violet accent\r
\r
  sharpLightColorsDark:\r
  - "#fef9c3" # soft gold (main glow)\r
  - "#fde047" # brighter highlight\r
  - "#facc15" # controlled gold pop\r
  - "#93c5fd" # soft blue (matches heading)\r
  - "#67e8f9" # cyan glow\r
  - "#ffffff" # clean highlight\r
\r
  sharpLightThickness: 2\r
  ropeLightSpeed: 10\r
  ropeLightThickness: 2\r
  ropeLightGlowIntensity: 700\r
\r
  # Global Text Hover Interaction\r
  textHoverColors: ["#22d3ee", "#fbbf24", "#6366f1", "#8b5cf6"]\r
  textTransitionSpeed: "0.8s"\r
  textAnimationSpeed: "4s"\r
  textGlowIntensity: 1.3\r
# endregion\r
\r
# Less neon, more “premium UI” look.\r
settings:\r
  ropeLightColors: ["#eab308", "#67e8f9", "#6366f1", "#a855f7"]\r
  ropeLightSpeed: 10\r
  ropeLightThickness: 2\r
  ropeLightGlowIntensity: 6\r
\r
  ropeLightColorLight: "#fde68a"\r
  ropeLightColorDark: "#a16207"\r
\r
  # Global Text Hover Interaction\r
  textHoverColors: ["#22d3ee", "#fbbf24", "#6366f1", "#8b5cf6"]\r
  textTransitionSpeed: "0.8s"\r
  textAnimationSpeed: "4s"\r
  textGlowIntensity: 1.3\r
# endregion\r
# region PERSONAL\r
personal:\r
  name: "Shivansh Vyas"\r
  title: "Data Scientist | AI Engineer"\r
  email: "shivanshvyas1729@gmail.com"\r
  phone: "+91 6377099494"\r
  linkedin: "https://linkedin.com/in/shivanshvyas"\r
  github: "https://github.com/Shivanshvyas1729"\r
  location: "Bhilwara, Rajasthan, India"\r
  profileImage:\r
    type: "url"\r
    value: "https://i.ibb.co/rKBnjv95/shivansh.jpg"\r
    position: "right"\r
# endregion\r
\r
# region HERO\r
hero:\r
  headline:\r
    - Building Scalable\r
    - AI Systems\r
    - That Create\r
    - Real Impact...\r
  description: "I specialize in designing and deploying intelligent systems..."\r
  ctas:\r
    - label: View Projects\r
      link: "#projects"\r
    - label: Contact Me\r
      link: "#contact"\r
# endregion\r
\r
# region STATS\r
stats:\r
  projectsCount: 6\r
  experienceCount: 1\r
# endregion\r
\r
# region ABOUT\r
about:\r
  description: "Final-year B.Tech CS (IoT) student at MLVIT, focused on developing impactful end-to-end solutions. Associated with TILS Edu, currently advancing in AI/ML through PW Skills Data Science and mentorship from Krish Naik. Continuously learning and open to constructive feedback"\r
  # it is the light rotating part \r
  marqueeTexts:\r
    - "WE BUILD AI SYSTEMS"\r
    - "WE CREATE INTELLIGENT PRODUCTS"\r
    - "WE AUTOMATE REAL WORLD PROBLEMS"\r
\r
  certifications:\r
    - "Data Science with Generative AI – PW Skills"\r
    - "Advanced Data Science Programs – Krish Naik"\r
    - "Machine Learning Learning Plan Certification – Amazon Web Services"\r
    - "Open Source Conference (OSSC 2025) Participation – The Linux Foundation"\r
    - "Bharatiya Antariksh Hackathon 2025 – Certificate of Acknowledgement by Indian Space Research Organisation"\r
# endregion\r
\r
# region EDUCATION\r
education:\r
  - degree: "B.Tech in Computer Science (iot)"\r
    institution: "MLV Textile & Engineering College, Bhilwara"\r
    year: "2023 – 2027"\r
    description: "Specializing in Data Science & AI Engineering"\r
\r
  - degree: "Data Science with Generative AI"\r
    institution: "PW Skills (Online)"\r
    year: "Oct 2024 – Jan 2026"\r
    description: "Focused on ML & GenAI"\r
# endregion\r
\r
# region EXPERIENCE\r
# experience:\r
#   - title: "AI Engineering Intern"\r
#     company: "Company Name"\r
#     duration: "2025"\r
#     description: "Building ML pipelines..."\r
# endregion\r
\r
# region SKILLS\r
skills:\r
  categories:\r
    - title: "Core AI/ML"\r
      items:\r
        - "Machine Learning"\r
        - "Deep Learning"\r
        - "NLP"\r
        - "Computer Vision"\r
\r
        - "Data Analysis"\r
\r
    - title: "Advanced AI"\r
      items:\r
        - "Generative AI"\r
        - "Agentic AI"\r
        - "RAG"\r
\r
    - title: "Tools & Infra"\r
      items:\r
        - "Docker"\r
        - "Flask"\r
\r
        - "FastAPI"\r
        - "Git"\r
        - "Github"\r
# endregion\r
\r
# region TECH STACK\r
techStack:\r
  featured:\r
    - "Python"\r
    - "Scikit-learn"\r
    - "TensorFlow"\r
    - "PyTorch"\r
    - "LangChain"\r
    - "Docker"\r
    - "FastAPI"\r
    - "Streamlit"\r
    - "Mlflow"\r
    - "RAG"\r
\r
  all:\r
    - "Python"\r
    - "Pandas"\r
    - "NumPy"\r
    - "Scikit-learn"\r
    - "TensorFlow"\r
    - "PyTorch"\r
\r
    - "LangChain"\r
    - "MLflow"\r
\r
    - "FastAPI"\r
    - "Streamlit"\r
\r
    - "Docker"\r
\r
    - "MySQL"\r
    - "MongoDB"\r
\r
    - "Git"\r
    - "GitHub"\r
\r
    - "AWS"\r
\r
# endregion\r
\r
# region SERVICES\r
services:\r
  - title: "AI & ML Solutions"\r
    description: "End-to-end intelligent systems"\r
    icon: "Brain"\r
\r
  - title: "Data Science Projects"\r
    description: "Analysis, modeling, visualization"\r
    icon: "BarChart3"\r
\r
  - title: "Generative AI Apps"\r
    description: "RAG, chatbots, LLM apps"\r
    icon: "Sparkles"\r
\r
  - title: "Intelligent Automation"\r
    description: "AI-driven workflows"\r
    icon: "Zap"\r
# endregion\r
\r
\r
\r
\r
# region RESUME\r
resume:\r
  url: "https://shorturl.at/rlKAY"\r
`,zt=`# region PROJECTS
projects:
  - id: 4
    title: ☀️ Solar Panel Defect Detection System
    category:
      - Deep Learning
      - Computer Vision
    description: An AI-powered solar panel defect detection system using transfer learning with EfficientNet-B0. The model leverages pretrained weights to achieve high accuracy with limited data, enabling fast and reliable classification of defects like dust, bird drops, and physical damage through an interactive Streamlit web app.
    media:
      - type: image
        url: https://i.ibb.co/fdj291HQ/Gemini-Generated-Image-14r8ms14r8ms14r8.png
    tech:
      - Python
      - PyTorch
      - Torchvision
      - Streamlit
      - NumPy
      - PIL
      - Transfer Learning
    github: https://github.com/Shivanshvyas1729/solar_panel_defect_detection
    live: https://solarpaneldefectdetection.streamlit.app/
    featured: true
    impact: Improves efficiency of solar panel maintenance by enabling quick and automated defect detection, reducing manual inspection effort and supporting scalable renewable energy operations.
    resources:
      - label: Architecture PDF
        url: https://drive.google.com/drive/folders/1zYdh2-eu6yUfUA4IYokQsziallVQXCGr
    architectureImage: https://backend.krishnaik.in/media/project_architecture_diagrams/Gemini_Generated_Image_vwro75vwro75vwro_UvMo1qV.jpg
  - id: 3
    title: 🌦 Thunderstorm Forecasting System
    category:
      - Machine Learning
      - Python
    description: Machine learning-based system for real-time thunderstorm prediction using atmospheric indices, featuring a FastAPI backend and interactive Streamlit interface.
    media:
      - type: image
        url: https://www.reconnectwithnature.org/getContentAsset/a2de823c-a1ae-491e-a47b-f373af403d4e/dfc3d011-8f63-43f6-9ed8-4b444333a1d0/Thunderstorm-lightning-strike-shutterstock-1.jpg?language=en-US
    tech:
      - Weather Prediction
      - Python
      - Scikit-learn
      - FastAPI
      - Streamlit
      - Pandas
      - NumPy
      - Imbalanced-learn
    github: https://github.com/Shivanshvyas1729/Thunderstrom_forcast
    live: https://thunderstromforcast.streamlit.app/
    featured: true
    impact: Real-time thunderstorm prediction with optimized ML model and interactive UI
  - id: 2
    title: 🥤 Drink Quality Prediction System
    category:
      - Machine Learning
      - MLOps
      - Python
    description: End-to-end machine learning pipeline for predicting drink quality with automated CI/CD deployment using Docker and AWS.
    media:
      - type: image
        url: https://labelyourdata.com/cms/wp-content/uploads/2023/10/machine-learning-for-wine-quality-prediction_1.jpg
    tech:
      - Python
      - Scikit-learn
      - Docker
      - AWS EC2
      - AWS ECR
      - GitHub Actions
      - Streamlit
      - Pandas
      - YAML
    github: https://github.com/Shivanshvyas1729/drink_quality_prediction
    live: https://drinkqualityprediction.streamlit.app/
    featured: true
    impact: Automated ML pipeline with production-ready CI/CD deployment
  - id: 1
    title: 🎧 Automated YouTube Mixtape Creation
    category:
      - Python
    description: Automated system that creates mixtapes...
    media:
      - type: image
        url: https://images.unsplash.com/photo-1620712943543-bcc4688e7485
    tech:
      - Python
      - Streamlit
      - NLP
      - Pydub
      - MoviePy
      - FFmpeg
    github: https://github.com/Shivanshvyas1729/Automated-YouTube-Mixtape-Creation1/tree/main
    live: https://automated-youtube-mixtape-creation.streamlit.app/
    featured: true
    impact: Zero manual editing
    resources:
      - label: Architecture PDF
        url: https://drive.google.com/drive/folders/1zYdh2-eu6yUfUA4IYokQsziallVQXCGr
      - label: System Design Spec
        url: https://example.com/design.pdf
    problem_statement: Content creators spend hours manually compiling, trimming, and producing mixtapes for YouTube. There exists a need for an automated solution capable of digesting input criteria, extracting audio sources, and exporting a polished output with zero manual editing.
    learning_outcomes:
      - Integrate third-party multimedia APIs securely
      - Orchestrate FFmpeg sub-processes for scalable audio processing
      - Design and deploy interactive interfaces with Streamlit
    architecture: A user visits the Streamlit frontend to define audio parameters. A Python orchestration layer coordinates NLP analysis to detect timestamps, passes data to Pydub and FFmpeg for editing, and returns a processed video and audio file directly to the browser for download.
    architectureImage: ""
    objectives:
      - Reduce video production time from hours to minutes
      - Implement an error-free timeline alignment algorithm
    success_criteria:
      - Successfully render a 15-minute mixtape in under 2 minutes
      - Maintain HD audio quality with zero clipping during transitions
    data_sources:
      - YouTube Data API v3
      - Spotify Web API
    target_variable: Not applicable (Rule-based automation)
    features:
      - Auto-timestamp extraction
      - Audio cross-fading
      - Dynamic video rendering
    preprocessing:
      - Sanitize user prompt inputs
      - Normalize retrieved audio levels
      - Transcode all media to a standard format prior to editing
    modeling:
      - Spacy for NLP entity extraction in music titles
    evaluation_metrics:
      - Processing pipeline time
      - API response latency
    validation_strategy: Extensive manual QA across 50 different genres of music
    explainability: All steps in the timeline creation are printed to screen for debugging and human verification.
    deployment: Deployed as a containerized Streamlit Web App on Streamlit Community Cloud.
    risks:
      - Rate-limiting by YouTube API
      - High memory consumption during render
    ethics:
      - Strict filtering to ignore copyrighted material not licensed for remixing
    open_resources:
      - label: FFmpeg Documentation
        url: https://ffmpeg.org/documentation.html
      - label: Pydub GitHub
        url: https://github.com/jiaaro/pydub

# endregion
`;let je={},ee={projects:[]};try{je=$e.parse(Dt)}catch(o){console.error("Failed to parse portfolio.yaml. Ensure the YAML syntax is correct. Using safe fallback.",o),je={skills:{categories:[]},techStack:{featured:[],all:[]}}}try{ee=$e.parse(zt)}catch(o){console.error("Failed to parse projects.yaml. Ensure the YAML syntax is correct. Using safe fallback.",o),ee={projects:[]}}const Xe=((ee==null?void 0:ee.projects)||[]).slice();Xe.sort((o,t)=>(t.id||0)-(o.id||0));const ce={...je,projects:Xe},Jt=o=>{const t=o.home,i=o.projects||[];if(t!=null&&t.featuredProjectIds&&t.featuredProjectIds.length>0)return Array.from(new Set(t.featuredProjectIds)).map(c=>i.find(S=>S.id===c)).filter(c=>c!==void 0);const d=(t==null?void 0:t.featuredProjectsCount)!==void 0&&t.featuredProjectsCount>=0?t.featuredProjectsCount:3;return i.filter(c=>c.featured).slice(0,d)},Zt=o=>Array.isArray(o)?o.length>0:typeof o=="string"?o.trim().length>0:!!o;class Rt{constructor(){ne(this,"logs",[]);ne(this,"listeners",[]);ne(this,"MAX_LOGS",100)}notify(){this.listeners.forEach(t=>t([...this.logs]))}getFormattedTime(){return new Date().toLocaleTimeString("en-US",{hour12:!1,hour:"2-digit",minute:"2-digit",second:"2-digit"})}addLog(t){const i={...t,id:Math.random().toString(36).substring(2,9),timestamp:this.getFormattedTime()};this.logs=[i,...this.logs].slice(0,this.MAX_LOGS),this.notify()}getLogs(){return[...this.logs]}clearLogs(){this.logs=[],this.notify()}subscribe(t){return this.listeners.push(t),t([...this.logs]),()=>{this.listeners=this.listeners.filter(i=>i!==t)}}info(t,i){this.addLog({action:"INFO",status:"pending",message:t,metadata:i})}warn(t,i){this.addLog({action:"WARN",status:"pending",message:t,metadata:i})}error(t,i){this.addLog({action:"ERROR",status:"error",message:t,metadata:i})}}const H=new Rt,Je=a.createContext(void 0),Ze=a.createContext(void 0),Qt=({children:o})=>{const[t,i]=a.useState(!1),[d,c]=a.useState(!1),[S,L]=a.useState("unknown"),[P,T]=a.useState(ce),[E,v]=a.useState(ce),[m,g]=a.useState(null),[h,w]=a.useState([]),N=a.useMemo(()=>typeof window<"u"&&(window.location.hostname==="localhost"||window.location.hostname==="127.0.0.1"),[]),[b,_]=a.useState(!1);a.useEffect(()=>{localStorage.getItem("cms-force-local")==="true"&&_(!0)},[]),a.useEffect(()=>{localStorage.setItem("cms-force-local",String(b))},[b]),a.useEffect(()=>H.subscribe(w),[]);const U=a.useCallback(async()=>{var C;try{H.addLog({action:"REFRESH_DATA",status:"pending",message:"Fetching live content from backend..."});const z=await(await fetch("/api/cms-load?filePath=src/data/portfolio.yaml")).json();z.mode&&L(z.mode);const j=await(await fetch("/api/cms-load?filePath=src/data/projects.yaml")).json();let s={...ce};z.success&&z.data&&(s={...s,...z.data}),j.success&&((C=j.data)!=null&&C.projects)&&(s={...s,projects:j.data.projects}),T(s),v(s),H.addLog({action:"REFRESH_DATA",status:"success",message:"Live content synchronized successfully."})}catch(I){const z=I instanceof Error?I.message:String(I);H.addLog({action:"REFRESH_DATA",status:"error",message:`Failed to fetch data: ${z}`,metadata:I}),ie.error("CMS Sync Failed")}},[]);a.useEffect(()=>{U()},[U]);const F=a.useCallback((C,I)=>{v(z=>({...z,[C]:I})),H.addLog({action:"UPDATE_PREVIEW",status:"success",message:`Modified ${C} in preview.`,metadata:{section:C}})},[]),M=a.useCallback((C,I)=>{v(z=>{const O=C.split("."),j={...z};let s=j;for(let l=0;l<O.length-1;l++){const p=O[l];s[p]=Array.isArray(s[p])?[...s[p]]:{...s[p]},s=s[p]}return s[O[O.length-1]]=I,j})},[]),u=a.useMemo(()=>({previewMode:t,safeMode:d,liveData:P,previewData:E,activeSection:m,cmsMode:S,forceLocalMode:b,isLocalEnvironment:N,auditLogs:h}),[t,d,P,E,m,S,b,N,h]),y=a.useMemo(()=>({setPreviewMode:i,setSafeMode:c,setForceLocalMode:_,updatePreviewSection:F,updateNestedField:M,setActiveSection:g,refreshData:U,clearLogs:()=>H.clearLogs()}),[i,c,_,F,M,g,U]);return e.jsx(Je.Provider,{value:u,children:e.jsxs(Ze.Provider,{value:y,children:[o,t&&e.jsx("div",{className:"fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full shadow-lg backdrop-blur-md animate-pulse",children:"Preview Mode Active"}),d&&e.jsx("div",{className:"fixed top-12 left-1/2 -translate-x-1/2 z-[100] bg-amber-500/90 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md backdrop-blur-md",children:"Safe Mode (No Commits)"})]})})},Ne=()=>{const o=a.useContext(Je);if(!o)throw new Error("useCMSState must be used within a CMSProvider");return o},Ft=()=>{const o=a.useContext(Ze);if(!o)throw new Error("useCMSActions must be used within a CMSProvider");return o};function Kt(o){const{previewMode:t,previewData:i,liveData:d}=Ne(),c=t?i:d;return a.useMemo(()=>{try{return o(c)}catch(S){return console.warn("CMS Selector failed, returning fallback from initialData",S),o(ce)}},[c,o])}const Re="/api",Ot={saveBlog:`${Re}/save-blog`,deleteBlog:`${Re}/delete-blog`};async function Ht(o,t){const i=await fetch(o,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)}),d=i.headers.get("content-type");if(!(d!=null&&d.includes("application/json")))throw new Error(`API at ${o} returned HTML instead of JSON. Ensure the dev server is running with localApiProxy (npm run dev).`);const c=await i.json();return{ok:i.ok,status:i.status,data:c}}const oe=420,ae=580,Fe=320,Oe=300;function He({text:o,children:t}){return e.jsxs("span",{className:"relative group/tip inline-flex items-center",children:[t,e.jsx("span",{className:"pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 text-[11px] leading-relaxed bg-popover border border-border/50 text-muted-foreground rounded-lg px-3 py-2 shadow-xl opacity-0 group-hover/tip:opacity-100 transition-opacity z-[100] text-center",children:o})]})}function _t({onSuccess:o}){const[t,i]=a.useState({title:"",content:"",category:"Notes",type:"",featured:!1,draft:!0}),[d,c]=a.useState([]),[S,L]=a.useState(!1),[P,T]=a.useState(""),[E,v]=a.useState(!1),m=a.useRef(null),g=a.useRef({x:0,y:0,w:oe,h:ae,ready:!1});a.useEffect(()=>{const s=window.innerWidth,l=window.innerHeight;g.current={x:Math.max(8,s-oe-16),y:Math.max(72,l-ae-16),w:oe,h:ae,ready:!0},h()},[]);const h=a.useCallback(()=>{const s=m.current;if(!s)return;const{x:l,y:p,w:D,h:$}=g.current;s.style.left=`${l}px`,s.style.top=`${p}px`,s.style.width=`${D}px`,s.style.height=`${$}px`},[]),w=(s,l,p,D)=>{const $=window.innerWidth,J=window.innerHeight;return{x:Math.max(0,Math.min(s,$-p)),y:Math.max(0,Math.min(l,J-40))}},N=a.useRef({active:!1,sx:0,sy:0,ox:0,oy:0}),b=a.useCallback(s=>{s.target.closest("[data-no-drag]")||(s.currentTarget.setPointerCapture(s.pointerId),N.current={active:!0,sx:s.clientX,sy:s.clientY,ox:g.current.x,oy:g.current.y},document.body.style.userSelect="none")},[]),_=a.useCallback(s=>{if(!N.current.active)return;const l=s.clientX-N.current.sx,p=s.clientY-N.current.sy,{x:D,y:$}=w(N.current.ox+l,N.current.oy+p,g.current.w,g.current.h);g.current.x=D,g.current.y=$,h()},[h]),U=a.useCallback(()=>{N.current.active=!1,document.body.style.userSelect=""},[]),F=a.useRef({active:!1,edge:"",sx:0,sy:0,ox:0,oy:0,ow:0,oh:0}),M=a.useCallback((s,l)=>{s.stopPropagation(),s.currentTarget.setPointerCapture(s.pointerId),F.current={active:!0,edge:l,sx:s.clientX,sy:s.clientY,ox:g.current.x,oy:g.current.y,ow:g.current.w,oh:g.current.h},document.body.style.userSelect="none"},[]),u=a.useCallback(s=>{const l=F.current;if(!l.active)return;const p=s.clientX-l.sx,D=s.clientY-l.sy;let{ox:$,oy:J,ow:Y,oh:V}=l;if(l.edge.includes("e")&&(Y=Math.max(Fe,l.ow+p)),l.edge.includes("s")&&(V=Math.max(Oe,l.oh+D)),l.edge.includes("w")){const W=Math.max(Fe,l.ow-p);$=l.ox+(l.ow-W),Y=W}if(l.edge.includes("n")){const W=Math.max(Oe,l.oh-D);J=l.oy+(l.oh-W),V=W}const q=w($,J,Y);g.current={...g.current,x:q.x,y:q.y,w:Y,h:V},h()},[h]),y=a.useCallback(()=>{F.current.active=!1,N.current.active=!1,document.body.style.userSelect=""},[]);a.useEffect(()=>(window.addEventListener("pointermove",u),window.addEventListener("pointerup",y),()=>{window.removeEventListener("pointermove",u),window.removeEventListener("pointerup",y)}),[u,y]);const C=()=>c([...d,{label:"",url:""}]),I=(s,l,p)=>{const D=[...d];D[s][l]=p,c(D)},z=s=>c(d.filter((l,p)=>p!==s)),O=async s=>{if(s.preventDefault(),!t.title||!t.content)return T("Title and content required");L(!0),T("");const l={...t,type:t.type.split(",").map(p=>p.trim()).filter(Boolean),resources:d.filter(p=>p.label&&p.url)};try{const{ok:p,data:D}=await Ht(Ot.saveBlog,{password:sessionStorage.getItem("sitePassword")||"",blogData:l});if(!p)throw new Error(D.error||"Failed to commit");o({id:Date.now(),...l,date:new Date().toISOString(),slug:l.title.replace(/\s+/g,"-").toLowerCase()}),i({title:"",content:"",category:"Notes",type:"",featured:!1,draft:!0}),c([])}catch(p){T(p.message||"Failed to commit")}L(!1)},j=({edge:s,cursor:l,className:p})=>e.jsx("div",{className:`absolute z-20 select-none ${p}`,style:{cursor:l},onPointerDown:D=>M(D,s)});return e.jsxs("div",{ref:m,style:{position:"fixed",left:0,top:0,width:oe,height:ae,zIndex:60,willChange:"transform"},className:"glass-card rounded-2xl shadow-2xl border border-primary/20 flex flex-col overflow-hidden",children:[!E&&e.jsxs(e.Fragment,{children:[e.jsx(j,{edge:"n",cursor:"n-resize",className:"top-0 left-3 right-3 h-1.5"}),e.jsx(j,{edge:"s",cursor:"s-resize",className:"bottom-0 left-3 right-3 h-1.5"}),e.jsx(j,{edge:"e",cursor:"e-resize",className:"right-0 top-3 bottom-3 w-1.5"}),e.jsx(j,{edge:"w",cursor:"w-resize",className:"left-0 top-3 bottom-3 w-1.5"}),e.jsx(j,{edge:"se",cursor:"se-resize",className:"bottom-0 right-0 w-4 h-4"}),e.jsx(j,{edge:"sw",cursor:"sw-resize",className:"bottom-0 left-0 w-4 h-4"}),e.jsx(j,{edge:"ne",cursor:"ne-resize",className:"top-0 right-0 w-4 h-4"}),e.jsx(j,{edge:"nw",cursor:"nw-resize",className:"top-0 left-0 w-4 h-4"})]}),e.jsxs("div",{onPointerDown:b,onPointerMove:_,onPointerUp:U,className:"flex items-center justify-between px-4 py-3 border-b border-border/30 bg-primary/5 cursor-grab active:cursor-grabbing rounded-t-2xl shrink-0",children:[e.jsxs("h3",{className:"text-sm font-heading font-bold flex items-center gap-2 pointer-events-none select-none",children:[e.jsx(ve,{size:15,className:"text-primary"})," Admin Matrix"]}),e.jsxs("div",{className:"flex items-center gap-1",children:[e.jsx(bt,{size:13,className:"text-muted-foreground/40 pointer-events-none"}),e.jsx("button",{"data-no-drag":!0,onClick:()=>v(s=>!s),className:"p-1 rounded hover:bg-muted/60 text-muted-foreground transition-colors ml-1",title:E?"Expand":"Minimize",children:E?e.jsx(We,{size:14}):e.jsx(Be,{size:14})})]})]}),!E&&e.jsx("div",{className:"flex-1 overflow-y-auto overscroll-contain p-5 space-y-4",children:e.jsxs("form",{onSubmit:O,className:"space-y-4",children:[e.jsxs("div",{children:[e.jsx("label",{className:"text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block",children:"Title"}),e.jsx("input",{type:"text",value:t.title,onChange:s=>i({...t,title:s.target.value}),className:"w-full bg-background border border-border/50 rounded-lg p-2 text-sm focus:outline-none focus:border-primary/50 text-foreground",required:!0})]}),e.jsxs("div",{className:"flex gap-3",children:[e.jsxs("div",{className:"flex-1",children:[e.jsx("label",{className:"text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block",children:"Category"}),e.jsxs("select",{value:t.category,onChange:s=>i({...t,category:s.target.value}),className:"w-full bg-background border border-border/50 rounded-lg p-2 text-sm focus:outline-none focus:border-primary/50",children:[e.jsx("option",{children:"Notes"}),e.jsx("option",{children:"Thoughts"}),e.jsx("option",{children:"Books"}),e.jsx("option",{children:"Links"})]})]}),e.jsxs("div",{className:"flex-1",children:[e.jsx("label",{className:"text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block",children:"Tags (CSV)"}),e.jsx("input",{type:"text",placeholder:"React, AI, Deep...",value:t.type,onChange:s=>i({...t,type:s.target.value}),className:"w-full bg-background border border-border/50 rounded-lg p-2 text-sm focus:outline-none focus:border-primary/50"})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block",children:"Content (MD)"}),e.jsx("textarea",{rows:6,value:t.content,onChange:s=>i({...t,content:s.target.value}),className:"w-full bg-background border border-border/50 rounded-lg p-2 text-sm focus:outline-none focus:border-primary/50 font-mono resize-none leading-relaxed",required:!0})]}),e.jsxs("div",{className:"pt-2 border-t border-border/30",children:[e.jsxs("div",{className:"flex items-center justify-between mb-2",children:[e.jsx("label",{className:"text-xs font-semibold text-muted-foreground uppercase tracking-wider",children:"Resources"}),e.jsxs("button",{type:"button",onClick:C,className:"text-xs text-primary hover:underline flex items-center gap-1",children:[e.jsx(we,{size:12})," Add Link"]})]}),d.map((s,l)=>e.jsxs("div",{className:"flex gap-2 mb-2 items-center bg-muted/20 p-2 rounded-lg border border-border/30",children:[e.jsx(yt,{size:14,className:"text-muted-foreground shrink-0"}),e.jsx("input",{placeholder:"Label",value:s.label,onChange:p=>I(l,"label",p.target.value),className:"w-[38%] bg-transparent border-none text-xs focus:outline-none"}),e.jsx("input",{placeholder:"https://",value:s.url,onChange:p=>I(l,"url",p.target.value),className:"flex-1 bg-transparent border-none text-xs focus:outline-none"}),e.jsx("button",{type:"button",onClick:()=>z(l),className:"text-destructive hover:bg-destructive/10 p-1 rounded",children:e.jsx(Se,{size:12})})]},l))]}),e.jsxs("div",{className:"flex items-center justify-between pt-2 border-t border-border/30",children:[e.jsxs("div",{className:"flex items-center gap-3 text-sm font-medium",children:[e.jsx(He,{text:"⭐ Featured posts appear with a gold star badge and can be filtered via the '★ Featured' button in the blog filter bar. Use this for your best or most important posts.",children:e.jsxs("label",{className:"flex items-center gap-1.5 cursor-pointer",children:[e.jsx("input",{type:"checkbox",checked:t.featured,onChange:s=>i({...t,featured:s.target.checked}),className:"accent-primary"}),e.jsx(Ye,{size:13,className:t.featured?"fill-yellow-500 text-yellow-500":"text-muted-foreground"}),"Featured"]})}),e.jsx(He,{text:"🔒 Draft posts are hidden from public visitors. Only you (as admin) can see them. Uncheck to publish the post live.",children:e.jsxs("label",{className:"flex items-center gap-1.5 cursor-pointer",children:[e.jsx("input",{type:"checkbox",checked:t.draft,onChange:s=>i({...t,draft:s.target.checked}),className:"accent-primary"}),e.jsx(vt,{size:13,className:t.draft?"text-amber-400":"text-muted-foreground"}),"Draft"]})})]}),e.jsxs("button",{type:"submit",disabled:S,className:"px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm flex items-center gap-2 disabled:opacity-50 transition-colors",children:[S?e.jsx(jt,{size:14,className:"animate-spin"}):e.jsx(ve,{size:14}),"Commit Push"]})]}),P&&e.jsx("p",{className:"text-xs text-center text-destructive bg-destructive/10 py-1.5 rounded-md border border-destructive/20",children:P})]})})]})}const Ut=St([k({type:Me(["local","url"]),value:n().url("Must be a valid URL").or(n().min(1,"Required")),position:Me(["left","right","center"]).default("right")}),n().url("Must be a valid URL")]),Qe=k({featuredProjectsCount:B().min(0).default(4)}),Ke=k({name:n().min(1,"Name is required"),title:n().min(1,"Title is required"),email:n().email("Invalid email format"),phone:n(),linkedin:n().url(),github:n().url(),location:n(),profileImage:Ut}),et=k({headline:x(n()),description:n().min(1,"Hero description required"),ctas:x(k({label:n(),link:n()}))}),tt=k({projectsCount:B().min(0).default(0),experienceCount:B().min(0).default(0)}),rt=k({description:n().min(1,"Description is required"),marqueeTexts:x(n()),certifications:x(n())}),nt=x(k({degree:n().min(1),institution:n().min(1),year:n().min(1),description:n().optional()})),st=x(k({title:n().min(1),company:n().min(1),duration:n().min(1),description:n()})),ot=k({categories:x(k({title:n().min(1),items:x(n())}))}),at=k({featured:x(n()),all:x(n())}),it=x(k({title:n().min(1),description:n().min(1),icon:n().optional()})),ct=k({url:n().url("Must be a valid URL")}),lt=k({ropeLightColors:x(n()).min(1).optional(),ropeLightSpeed:B().min(.1).optional(),ropeLightThickness:B().min(.5).optional(),ropeLightGlowIntensity:B().min(0).optional(),ropeLightColorLight:n().optional(),ropeLightColorDark:n().optional(),ropeLightAccentLight:n().optional(),ropeLightAccentDark:n().optional(),textHoverColors:x(n()).optional(),textTransitionSpeed:n().optional(),textLeaveSpeed:n().optional(),textAnimationSpeed:n().optional(),textBaseOpacity:B().min(0).max(1).optional(),textGlowIntensity:B().optional()});k({home:Qe.optional(),settings:lt.optional(),personal:Ke.optional(),hero:et.optional(),stats:tt.optional(),about:rt.optional(),education:nt.optional(),experience:st.optional(),skills:ot.optional(),techStack:at.optional(),services:it.optional(),resume:ct.optional()});const dt=k({id:B().int().positive().optional(),title:n().min(1,"Title is required"),category:x(n()).optional().default([]),description:n().min(1,"Description is required"),tech:x(n()).optional().default([]),github:n().optional().default(""),live:n().optional().default(""),featured:wt().optional().default(!1),impact:n().optional(),media:x(k({type:n().optional(),url:n().optional(),caption:n().optional()})).optional(),problem_statement:n().optional(),learning_outcomes:x(n()).optional(),architecture:n().optional(),architectureImage:n().optional(),resources:x(k({label:n().optional(),url:n().optional()})).optional(),howItWorks:n().optional(),objectives:x(n()).optional(),success_criteria:x(n()).optional(),data_sources:x(n()).optional(),target_variable:n().optional(),features:x(n()).optional(),preprocessing:x(n()).optional(),modeling:x(n()).optional(),evaluation_metrics:x(n()).optional(),validation_strategy:n().optional(),explainability:n().optional(),deployment:n().optional(),risks:x(n()).optional(),ethics:x(n()).optional(),open_resources:x(k({label:n().optional(),url:n().optional()})).optional()}).passthrough(),Gt=x(dt);function $t(o,t){const i=o.safeParse(t);return i.success?{success:!0,data:i.data}:{success:!1,errors:i.error.errors.map(c=>{const S=c.path.join(".");return S?`${S}: ${c.message}`:c.message})}}const ye={settings:lt,home:Qe,personal:Ke,hero:et,stats:tt,about:rt,education:nt,experience:st,skills:ot,techStack:at,services:it,resume:ct,projects:Gt},Wt=({url:o})=>e.jsxs("div",{className:"mt-2 w-full h-32 rounded-lg bg-muted/30 border border-border/50 flex flex-col items-center justify-center overflow-hidden relative",children:[o?e.jsx("img",{src:o,alt:"Preview",className:"w-full h-full object-cover",onError:t=>{var i;t.currentTarget.style.display="none",(i=t.currentTarget.parentElement)==null||i.classList.add("broken-image")}}):e.jsxs("div",{className:"flex flex-col items-center text-muted-foreground/50",children:[e.jsx(De,{size:24,className:"mb-1"}),e.jsx("span",{className:"text-xs",children:"No image provided"})]}),e.jsxs("div",{className:"broken-image-fallback absolute inset-0 hidden items-center justify-center bg-muted flex-col text-muted-foreground/50",children:[e.jsx(De,{size:24,className:"mb-1"}),e.jsx("span",{className:"text-xs",children:"Failed to load image"})]})]}),_e=o=>o.replace(/([A-Z])/g," $1").replace(/^./,t=>t.toUpperCase()),le=ft.memo(({schema:o,data:t,onChange:i,path:d=[]})=>{var S,L,P,T,E,v;const c=o instanceof Ie||o instanceof xe?o._def.innerType:o;if(c instanceof Te){const m=c.shape,g=t||{};return e.jsx("div",{className:`space-y-4 ${d.length>0?"pl-4 border-l-2 border-border/40 mt-2":""}`,children:Object.keys(m).map(h=>e.jsxs("div",{className:"space-y-1.5",children:[e.jsx("label",{className:"text-[10px] font-bold text-muted-foreground uppercase tracking-wider block opacity-70",children:_e(h)}),e.jsx(le,{schema:m[h],data:g[h],path:[...d,h],onChange:w=>i({...g,[h]:w})})]},h))})}if(c instanceof Nt){const m=c.element,g=Array.isArray(t)?t:[];return e.jsxs("div",{className:"space-y-3",children:[g.map((h,w)=>e.jsxs("div",{className:"relative p-4 rounded-xl border border-border/50 bg-muted/10 group",children:[e.jsx("button",{onClick:()=>{const N=[...g];N.splice(w,1),i(N)},className:"absolute top-2 right-2 text-muted-foreground hover:text-destructive p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity",title:"Remove Item",children:e.jsx(Se,{size:14})}),e.jsxs("div",{className:"text-[10px] font-mono text-muted-foreground mb-2 pb-2 border-b border-border/30 opacity-60",children:["Item ",w+1]}),e.jsx(le,{schema:m,data:h,path:[...d,String(w)],onChange:N=>{const b=[...g];b[w]=N,i(b)}})]},w)),e.jsxs("button",{onClick:()=>{let h="";m instanceof Te&&(h={}),m instanceof fe&&(h=0),m instanceof be&&(h=!1),i([...g,h])},className:"flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors px-2 py-1.5 rounded-md hover:bg-primary/5",children:[e.jsx(we,{size:14})," Add ",_e(d[d.length-1]||"Item")]})]})}if(c instanceof Ee||c instanceof Ie&&c._def.innerType instanceof Ee){const m=((S=c.description)==null?void 0:S.includes("URL"))||((L=d[d.length-1])==null?void 0:L.toLowerCase().includes("url"))||((P=d[d.length-1])==null?void 0:P.toLowerCase().includes("link")),g=(T=d[d.length-1])==null?void 0:T.toLowerCase().includes("image"),h=((E=d[d.length-1])==null?void 0:E.includes("description"))||((v=d[d.length-1])==null?void 0:v.includes("content"));return e.jsxs("div",{className:"w-full",children:[h?e.jsx("textarea",{value:t||"",onChange:w=>i(w.target.value),className:"w-full bg-background border border-border/30 rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary/50 text-foreground resize-y min-h-[80px]",placeholder:"Type here..."}):e.jsx("input",{type:m?"url":"text",value:t||"",onChange:w=>i(w.target.value),className:"w-full bg-background border border-border/30 rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary/50 text-foreground",placeholder:m?"https://":"Value..."}),g&&e.jsx(Wt,{url:t})]})}return c instanceof fe||c instanceof xe&&c._def.innerType instanceof fe?e.jsx("input",{type:"number",value:t??0,onChange:m=>i(Number(m.target.value)),className:"w-full bg-background border border-border/30 rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary/50 text-foreground"}):c instanceof be||c instanceof xe&&c._def.innerType instanceof be?e.jsxs("label",{className:"flex items-center gap-2 cursor-pointer pt-1",children:[e.jsx("div",{className:`w-10 h-5 rounded-full p-0.5 transition-colors ${t?"bg-primary":"bg-border"}`,children:e.jsx("div",{className:`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${t?"translate-x-5":"translate-x-0"}`})}),e.jsx("span",{className:"text-sm font-medium select-none",children:t?"Enabled":"Disabled"}),e.jsx("input",{type:"checkbox",checked:!!t,onChange:m=>i(m.target.checked),className:"hidden","aria-hidden":"true"})]}):c instanceof kt?e.jsx("select",{value:t||c.options[0],onChange:m=>i(m.target.value),className:"w-full bg-background border border-border/30 rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary/50 text-foreground",children:c.options.map(m=>e.jsx("option",{value:m,children:m},m))}):e.jsx("textarea",{value:typeof t=="object"?JSON.stringify(t,null,2):String(t||""),onChange:m=>{try{i(JSON.parse(m.target.value))}catch{i(m.target.value)}},className:"w-full bg-background border border-border/30 rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary/50 font-mono text-[10px] text-foreground/80 h-20"})}),Bt=({projects:o,onChange:t,onSave:i,isLoading:d,mode:c})=>{const{liveData:S}=Ne(),[L,P]=a.useState(null),[T,E]=a.useState(!1),[v,m]=a.useState({}),[g,h]=a.useState(""),w=JSON.stringify(o)!==JSON.stringify(S.projects),N=u=>{m({...u}),P(u.id)},b=()=>{const u=o.reduce((y,C)=>(C.id||0)>y?C.id:y,0);m({id:u+1,title:"",category:[],description:"",tech:[],github:"",live:"",featured:!1}),E(!0)},_=()=>{if(!v.title||!v.description){alert("Title and Description are required.");return}let u;return T?u=[v,...o]:u=o.map(y=>y.id===v.id?v:y),t(u),F(),u},U=u=>{confirm("Are you sure you want to delete this project?")&&t(o.filter(y=>y.id!==u))},F=()=>{P(null),E(!1),m({})},M=L!==null||T;return e.jsxs("div",{className:"flex flex-col h-full bg-background relative",children:[e.jsxs("div",{className:"flex items-center justify-between mb-4 px-4 pt-4 shrink-0",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("h3",{className:"text-lg font-bold text-foreground font-heading",children:"Manage Projects"}),w&&e.jsx("span",{className:"px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-bold uppercase tracking-wider border border-amber-500/20",children:"Pending Changes"})]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs("button",{onClick:b,className:"px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 transition-colors rounded-lg text-sm font-medium flex items-center gap-1.5",children:[e.jsx(we,{size:14})," New Project"]}),e.jsx("button",{onClick:async()=>{h("");const u=await i();u&&!u.success&&h(u.error||"Save failed. Check the Logs tab for details.")},disabled:d||!w,className:"px-4 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-1.5",children:d?e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"animate-spin inline-block w-3 h-3 border border-white/30 border-t-white rounded-full"})," Saving..."]}):c==="local"?"Save to Local":"Save to GitHub"})]})]}),g&&e.jsxs("div",{className:"mx-4 mb-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs font-medium",children:["⚠️ ",g]}),e.jsx("div",{className:"flex-1 overflow-y-auto px-4 pb-12",children:e.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-4",children:o.map(u=>{var y;return e.jsxs("div",{className:"group glass-card border border-border/50 rounded-xl p-4 flex flex-col hover:border-primary/40 transition-colors relative",children:[e.jsxs("div",{className:"absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",children:[e.jsx("button",{onClick:()=>N(u),className:"p-1.5 bg-muted hover:bg-primary/10 hover:text-primary rounded text-muted-foreground transition-colors",children:e.jsx(Ct,{size:14})}),e.jsx("button",{onClick:()=>U(u.id),className:"p-1.5 bg-muted hover:bg-destructive/10 hover:text-destructive rounded text-muted-foreground transition-colors",children:e.jsx(Se,{size:14})})]}),e.jsxs("div",{className:"flex items-start gap-2 mb-2 pr-16",children:[u.featured&&e.jsx(Ye,{size:14,className:"text-yellow-500 fill-yellow-500 mt-1 shrink-0"}),e.jsx("h4",{className:"font-bold text-foreground leading-tight",children:u.title})]}),e.jsx("p",{className:"text-xs text-muted-foreground line-clamp-3 mb-3",children:u.description}),e.jsxs("div",{className:"mt-auto flex items-center gap-3",children:[e.jsxs("div",{className:"flex gap-1 flex-wrap flex-1",children:[(y=u.tech)==null?void 0:y.slice(0,3).map(C=>e.jsx("span",{className:"text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50",children:C},C)),u.tech&&u.tech.length>3&&e.jsxs("span",{className:"text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50",children:["+",u.tech.length-3]})]}),e.jsxs("div",{className:"flex gap-2 shrink-0",children:[u.github&&e.jsx(At,{size:14,className:"text-muted-foreground"}),u.live&&e.jsx(Lt,{size:14,className:"text-muted-foreground"})]})]})]},u.id)})})}),M&&e.jsx("div",{className:"absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col animate-in fade-in zoom-in-95 duration-200",children:e.jsxs("div",{className:"glass-card shadow-2xl border-l border-border/50 flex flex-col h-full absolute right-0 w-full sm:w-[500px]",children:[e.jsxs("div",{className:"flex items-center justify-between p-4 border-b border-border/50 bg-muted/20",children:[e.jsx("h3",{className:"font-bold",children:T?"New Project":"Edit Project"}),e.jsx("button",{onClick:F,className:"p-1.5 rounded hover:bg-muted/60 text-muted-foreground transition-colors",children:e.jsx(Ve,{size:16})})]}),e.jsx("div",{className:"flex-1 overflow-y-auto p-5",children:e.jsx(le,{schema:dt,data:v,onChange:m})}),e.jsxs("div",{className:"p-4 border-t border-border/50 bg-muted/10 flex justify-end gap-2",children:[e.jsx("button",{onClick:F,className:"px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted text-muted-foreground transition-colors",children:"Cancel"}),e.jsx("button",{onClick:_,className:"px-4 py-2 bg-primary/20 text-primary rounded-lg text-sm font-medium hover:bg-primary/30 transition-colors",children:"Apply to Preview"}),c==="local"?e.jsx("button",{onClick:async()=>{const u=_();setTimeout(()=>i(u),0)},className:"px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg",children:"Apply & Save to Local"}):e.jsx("button",{onClick:async()=>{const u=_();setTimeout(()=>i(u),0)},className:"px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg",children:"Apply & Sync to GitHub"})]})]})})]})},Ue=750,Ge=600,er=()=>{const{previewData:o,previewMode:t,safeMode:i,cmsMode:d,forceLocalMode:c,isLocalEnvironment:S,auditLogs:L}=Ne(),{setPreviewMode:P,setSafeMode:T,setForceLocalMode:E,updatePreviewSection:v,refreshData:m,clearLogs:g}=Ft(),{roles:h}=Et(),w=h.includes("editor")&&!h.includes("admin"),N=h.includes("admin")?"admin":"editor",[b,_]=a.useState(()=>typeof window<"u"?localStorage.getItem("cms-maximized")==="true":!1),[U,F]=a.useState(()=>{if(typeof window<"u"){const r=localStorage.getItem("cms-dimensions");return r?JSON.parse(r):{w:Ue,h:Ge}}return{w:Ue,h:Ge}}),[M,u]=a.useState("portfolio"),[y,C]=a.useState("hero"),[I,z]=a.useState(!1),[O,j]=a.useState(!1),[s,l]=a.useState(""),[p,D]=a.useState([]),[$,J]=a.useState(!1),[Y,V]=a.useState(!1),[q,W]=a.useState(null),ke=a.useRef(null),f=a.useRef({x:0,y:0,w:U.w,h:U.h}),Z=a.useRef({active:!1,sx:0,sy:0,ox:0,oy:0}),G=a.useRef({active:!1,startW:0,startH:0,startX:0,startY:0,edge:"corner"}),te=a.useCallback(()=>{const r=ke.current;!r||b||(r.style.transform=`translate3d(${f.current.x}px, ${f.current.y}px, 0)`,r.style.width=`${f.current.w}px`,r.style.height=`${f.current.h}px`)},[b]);a.useEffect(()=>{if(b)return;const r=window.innerWidth,R=window.innerHeight;f.current={x:Math.max(8,r/2-f.current.w/2),y:Math.max(72,R/2-f.current.h/2),w:Math.min(f.current.w,r-16),h:Math.min(f.current.h,R-60)},te()},[b,te]),a.useEffect(()=>{localStorage.setItem("cms-maximized",String(b))},[b]);const ut=r=>{b||r.target.closest("[data-no-drag]")||(r.currentTarget.setPointerCapture(r.pointerId),Z.current={active:!0,sx:r.clientX,sy:r.clientY,ox:f.current.x,oy:f.current.y},document.body.style.userSelect="none",V(!0))},mt=r=>{Z.current.active&&(f.current.x=Z.current.ox+(r.clientX-Z.current.sx),f.current.y=Z.current.oy+(r.clientY-Z.current.sy),te())},pt=()=>{Z.current.active=!1,document.body.style.userSelect="",V(!1)},de=(r,R)=>{r.stopPropagation(),r.currentTarget.setPointerCapture(r.pointerId),G.current={active:!0,startW:f.current.w,startH:f.current.h,startX:r.clientX,startY:r.clientY,edge:R},V(!0)},ue=r=>{if(!G.current.active)return;const R=r.clientX-G.current.startX,Q=r.clientY-G.current.startY;(G.current.edge==="right"||G.current.edge==="corner")&&(f.current.w=Math.max(500,G.current.startW+R)),(G.current.edge==="bottom"||G.current.edge==="corner")&&(f.current.h=Math.max(400,G.current.startH+Q)),te()},me=()=>{G.current.active=!1,V(!1),F({w:f.current.w,h:f.current.h}),localStorage.setItem("cms-dimensions",JSON.stringify({w:f.current.w,h:f.current.h}))},pe=async(r,R,Q)=>{j(!0),l("");const Le=r==="projects",re=Le?"src/data/projects.yaml":"src/data/portfolio.yaml",K=Le?"SAVE_PROJECTS":`SAVE_SECTION:${r}`;H.addLog({action:K,status:"pending",message:`Initiating save for ${r} to ${re}...`,metadata:{section:r,filePath:re,isSafeMode:i}});const Pe=ye[r];if(Pe){const X=$t(Pe,R);if(X.success===!1){const A=X.errors.join(", ");return l("Validation Failed: "+A),H.addLog({action:K,status:"error",message:`Validation failed: ${A}`}),j(!1),{success:!1,error:A}}}try{const X=await fetch("/api/cms-save",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({filePath:re,sectionKey:r,newData:R,providedSha:Q||void 0,isSafeMode:i,role:N})}),A=await X.json();return X.status===409?(W({latestSha:A.data.latestSha,latestContent:A.data.latestContent,section:r,pendingData:R,targetFile:re}),H.addLog({action:K,status:"error",message:"Conflict detected (SHA mismatch). Overlay triggered."}),ie.error("Conflict detected!"),j(!1),{success:!1,error:"Conflict"}):A.success?(H.addLog({action:K,status:"success",message:`${r} persisted successfully to ${A.mode||"backend"}.`,metadata:A}),ie.success(A.message||"Saved successfully"),W(null),i||await m(),j(!1),{success:!0}):(l(A.error||"Save Failed"),H.addLog({action:K,status:"error",message:`Backend error: ${A.error}`,metadata:A}),j(!1),{success:!1,error:A.error})}catch(X){const A=X.message||"Network failure";return l("Network error: "+A),H.addLog({action:K,status:"error",message:`Network/Runtime failure: ${A}`,metadata:X}),j(!1),{success:!1,error:A}}},Ce=r=>{if(r==="cancel"){W(null);return}q&&pe(q.section,q.pendingData,q.latestSha)},ge=async r=>{J(!0);try{const Q=await(await fetch(`/api/cms-history?filePath=${r}`)).json();Q.success?D(Q.data.commits||[]):l(Q.error||"Failed to load history")}catch{l("Failed to load history")}J(!1)};a.useEffect(()=>{M==="history"&&ge("src/data/portfolio.yaml")},[M]);const Ae=a.useMemo(()=>o[y]||{},[o,y]),he=a.useMemo(()=>c?{label:"Local (Forced)",color:"bg-amber-500/20 text-amber-500",icon:"🚧"}:d==="local"?{label:"Local Mode",color:"bg-green-500/20 text-green-500",icon:"🏠"}:d==="github"?{label:"Cloud Sync",color:"bg-blue-500/20 text-blue-500",icon:"☁️"}:{label:"Connecting...",color:"bg-muted text-muted-foreground",icon:"⏳"},[d,c]),gt=b?{position:"fixed",inset:0,zIndex:90,width:"100% !important",height:"100% !important",transform:"none !important"}:{position:"fixed",zIndex:90,width:f.current.w,height:f.current.h,transform:`translate3d(${f.current.x}px, ${f.current.y}px, 0)`,willChange:Y?"transform, width, height":"auto"};return e.jsxs("div",{ref:ke,style:gt,className:`glass-card ${b?"rounded-none":"rounded-2xl shadow-2xl border border-primary/20"} flex flex-col overflow-hidden bg-background/95 backdrop-blur-3xl ${Y?"":"transition-[border-radius,width,height,transform] duration-300"} ${I?"!h-12 !w-80":""}`,children:[e.jsxs("div",{onPointerDown:ut,onPointerMove:mt,onPointerUp:pt,className:"flex items-center justify-between px-4 py-3 border-b border-border/30 bg-primary/10 cursor-grab active:cursor-grabbing shrink-0",children:[e.jsxs("div",{className:"flex items-center gap-2 pointer-events-none",children:[e.jsx("span",{className:"text-sm font-bold truncate max-w-[100px] sm:max-w-none",children:"CMS Matrix"}),e.jsxs("div",{className:`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter flex items-center gap-1.5 ${he.color}`,children:[e.jsx("span",{children:he.icon}),e.jsx("span",{children:he.label})]})]}),e.jsxs("div",{"data-no-drag":!0,className:"flex items-center gap-2",children:[e.jsxs("button",{onClick:()=>T(!i),className:`hidden sm:flex px-2 py-1 items-center gap-1 text-[10px] font-bold rounded uppercase transition-colors ${i?"bg-amber-500/20 text-amber-500":"bg-muted text-muted-foreground"}`,children:[i?e.jsx(Pt,{size:12}):e.jsx(Mt,{size:12}),"Safe Mode"]}),e.jsxs("label",{className:"flex items-center gap-1.5 cursor-pointer text-[10px] uppercase font-bold text-muted-foreground ml-2",children:["Preview",e.jsx("input",{type:"checkbox",checked:t,onChange:r=>P(r.target.checked),className:"accent-primary"})]}),e.jsx("div",{className:"w-px h-4 bg-border mx-1"}),e.jsx("button",{onClick:()=>_(!b),className:"p-1 hover:bg-muted rounded text-muted-foreground transition-colors",children:b?e.jsx(Be,{size:14}):e.jsx(We,{size:14})}),e.jsx("button",{onClick:()=>z(r=>!r),className:"p-1 hover:bg-muted rounded text-muted-foreground transition-colors",children:e.jsx(Ve,{size:14})})]})]}),q&&!I&&e.jsxs("div",{className:"absolute inset-0 z-50 bg-background/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in",children:[e.jsx(It,{size:48,className:"text-destructive mb-4"}),e.jsx("h2",{className:"text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500",children:"Conflict Detected"}),e.jsx("p",{className:"text-sm text-foreground/80 my-3 max-w-sm",children:"Another editor recently pushed changes. Your local version is out of sync."}),e.jsxs("div",{className:"flex gap-3 mt-4",children:[e.jsx("button",{onClick:()=>Ce("cancel"),className:"px-5 py-2 rounded-lg bg-muted hover:bg-muted/80 font-medium",children:"Cancel"}),e.jsxs("button",{onClick:()=>Ce("overwrite"),className:"px-5 py-2 rounded-lg bg-destructive text-destructive-foreground font-medium flex items-center gap-2",children:["Over-write ",e.jsx(se,{size:14})]})]})]}),!I&&e.jsxs("div",{className:`flex flex-1 overflow-hidden relative ${Y?"pointer-events-none":""}`,children:[e.jsxs("div",{className:"w-[180px] bg-muted/20 border-r border-border/40 flex flex-col p-3 gap-2 overflow-y-auto shrink-0",children:[e.jsx("div",{className:"text-[10px] font-bold text-muted-foreground uppercase opacity-70 tracking-wider mb-1 mt-2 px-2",children:"Modules"}),["portfolio","projects","blog","history","settings","logs"].map(r=>e.jsx("button",{onClick:()=>u(r),className:`text-sm font-medium px-3 py-2 rounded-lg text-left transition-colors capitalize ${M===r?"bg-primary/20 text-primary":"hover:bg-muted/50 text-muted-foreground"}`,children:r==="logs"?e.jsxs("span",{className:"flex items-center gap-2",children:[r,L.some(R=>R.status==="error")&&e.jsx("span",{className:"w-1.5 h-1.5 rounded-full bg-destructive animate-pulse"})]}):r},r)),M==="portfolio"&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"text-[10px] font-bold text-muted-foreground uppercase opacity-70 tracking-wider mb-1 mt-4 px-2",children:"Sections"}),["home","hero","personal","about","projects-shortcut","stats","skills","techStack","services","education","experience","resume"].filter(r=>!w||!["emailjs","personal","resume"].includes(r)).map(r=>e.jsx("button",{onClick:()=>{r==="projects-shortcut"?u("projects"):C(r)},className:`text-[13px] font-medium px-3 py-1.5 rounded-lg text-left transition-colors capitalize ${r==="projects-shortcut"?"text-primary/80 hover:bg-primary/5 italic":y===r?"bg-muted border border-border/50 text-foreground shadow-sm":"hover:bg-muted/30 text-muted-foreground border border-transparent"}`,children:r==="projects-shortcut"?"→ Projects":r.replace(/([A-Z])/g," $1").trim()},r))]})]}),e.jsxs("div",{className:"flex-1 flex flex-col bg-background/40 relative h-full overflow-hidden",children:[M==="portfolio"&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"flex-1 overflow-y-auto p-4 sm:p-6",children:[s&&e.jsx("div",{className:"mb-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-3 text-sm",children:s}),ye[y]?e.jsx(le,{schema:ye[y],data:Ae,onChange:r=>v(y,r)}):e.jsx("div",{className:"text-muted-foreground text-sm",children:"Select a section."})]}),e.jsx("div",{className:"p-4 border-t border-border/40 bg-muted/10 shrink-0 flex items-center justify-end gap-3",children:e.jsxs("button",{disabled:O,onClick:()=>pe(y,Ae),className:"px-5 py-2 bg-primary text-primary-foreground rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-lg",children:[O?e.jsx(se,{size:15,className:"animate-spin"}):e.jsx(ve,{size:15}),O?"Saving...":d==="local"||c?"Save Local":"Commit GitHub"]})})]}),M==="projects"&&e.jsx(Bt,{projects:o.projects||[],onChange:r=>v("projects",r),isLoading:O,mode:c||d==="local"?"local":"github",onSave:r=>pe("projects",r||o.projects||[])}),M==="blog"&&e.jsx("div",{className:"flex-1 relative overflow-auto",children:e.jsx(_t,{onSuccess:()=>ie.success("Blog deployed!")})}),M==="history"&&e.jsxs("div",{className:"flex-1 overflow-y-auto p-4 sm:p-6",children:[e.jsxs("div",{className:"flex items-center justify-between mb-4",children:[e.jsx("h3",{className:"font-bold",children:"History"}),e.jsxs("div",{className:"flex gap-2 text-xs",children:[e.jsx("button",{onClick:()=>ge("src/data/portfolio.yaml"),className:"p-1 px-2 bg-muted rounded",children:"Portfolio"}),e.jsx("button",{onClick:()=>ge("src/data/projects.yaml"),className:"p-1 px-2 bg-muted rounded",children:"Projects"})]})]}),$?e.jsx(se,{size:24,className:"animate-spin"}):e.jsx("div",{className:"space-y-3",children:p.map(r=>e.jsxs("div",{className:"p-3 rounded-lg border border-border/50 bg-muted/5 text-xs",children:[e.jsx("p",{className:"font-bold",children:r.message}),e.jsxs("p",{className:"opacity-70",children:[new Date(r.date).toLocaleString()," • ",r.author]})]},r.sha))})]}),M==="settings"&&e.jsxs("div",{className:"flex-1 overflow-y-auto p-6",children:[e.jsxs("h3",{className:"text-lg font-bold mb-4 flex items-center gap-2",children:[e.jsx(se,{size:18})," Sync Settings"]}),e.jsx("div",{className:"p-5 rounded-2xl border border-border/50 bg-muted/10",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("p",{className:"font-bold text-sm",children:"Force Local Mode"}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"Force-save to local filesystem."})]}),e.jsx("input",{type:"checkbox",checked:c,onChange:r=>E(r.target.checked),className:"w-4 h-4"})]})})]}),M==="logs"&&e.jsxs("div",{className:"flex-1 flex flex-col overflow-hidden",children:[e.jsxs("div",{className:"flex items-center justify-between p-4 sm:p-6 border-b border-border/40 shrink-0",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(ze,{size:18,className:"text-primary"}),e.jsx("h3",{className:"text-lg font-bold",children:"Audit Logs"})]}),e.jsxs("button",{onClick:g,className:"flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded-md hover:bg-destructive/5",children:[e.jsx(Tt,{size:14}),"Clear History"]})]}),e.jsx("div",{className:"flex-1 overflow-y-auto p-4 sm:p-6 space-y-2 bg-muted/5",children:L.length===0?e.jsxs("div",{className:"flex flex-col items-center justify-center h-40 text-muted-foreground/40",children:[e.jsx(ze,{size:32,className:"mb-2 opacity-20"}),e.jsx("p",{className:"text-sm",children:"No activity logs recorded yet."})]}):L.map(r=>e.jsxs("div",{className:"group p-3 rounded-lg border border-border/30 bg-background/50 flex gap-4 text-[11px] font-mono leading-relaxed transition-all hover:border-primary/20 hover:bg-background shadow-sm",children:[e.jsx("div",{className:"text-muted-foreground/60 w-16 shrink-0 pt-0.5",children:r.timestamp}),e.jsxs("div",{className:"flex-1 flex flex-col gap-1",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${r.status==="success"?"bg-green-500/10 text-green-600":r.status==="error"?"bg-red-500/10 text-red-600":"bg-blue-500/10 text-blue-600"}`,children:r.action}),e.jsxs("span",{className:"text-muted-foreground/40 group-hover:opacity-100 opacity-0 transition-opacity",children:["ID: ",r.id]})]}),e.jsx("div",{className:"text-foreground/80",children:r.message}),r.metadata&&e.jsxs("details",{className:"mt-1",children:[e.jsx("summary",{className:"text-[9px] cursor-pointer text-primary/60 hover:text-primary",children:"View Metadata"}),e.jsx("pre",{className:"mt-2 p-2 rounded bg-muted/50 border border-border/20 overflow-x-auto text-[9px]",children:JSON.stringify(r.metadata,null,2)})]})]})]},r.id))})]})]})]}),!b&&!I&&e.jsxs(e.Fragment,{children:[e.jsx("div",{onPointerDown:r=>de(r,"right"),onPointerMove:ue,onPointerUp:me,className:"absolute top-0 bottom-6 right-0 w-4 cursor-ew-resize z-[99]"}),e.jsx("div",{onPointerDown:r=>de(r,"bottom"),onPointerMove:ue,onPointerUp:me,className:"absolute bottom-0 left-0 right-6 h-4 cursor-ns-resize z-[99]"}),e.jsx("div",{onPointerDown:r=>de(r,"corner"),onPointerMove:ue,onPointerUp:me,className:"absolute bottom-0 right-0 w-10 h-10 cursor-nwse-resize z-[100] flex items-end justify-end p-2 group",children:e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",className:"text-primary/50 group-hover:text-primary transition-colors",children:[e.jsx("polyline",{points:"21 15 21 21 15 21"}),e.jsx("line",{x1:"21",y1:"21",x2:"15",y2:"15"})]})})]})]})};export{Xt as A,Qt as C,er as U,Et as a,Ot as b,Ht as c,_t as d,Jt as g,Zt as h,ce as p,Kt as u};
