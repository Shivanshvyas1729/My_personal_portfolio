var yt=Object.defineProperty;var vt=(s,t,a)=>t in s?yt(s,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):s[t]=a;var ce=(s,t,a)=>vt(s,typeof t!="symbol"?t+"":t,a);import{r as i,j as e,Y as Ve,m as se,S as Se,G as jt,M as qe,n as Je,P as Ce,L as wt,T as Ae,p as Xe,E as St,q as Nt,t as f,v as I,w as n,x as q,y as Ne,z as kt,A as Ct,R as At,Z as De,B as Pt,C as ze,D as Lt,F as Ze,H as Re,I as Fe,J as It,K as Mt,N as Tt,V as Et,O as Dt,Q as zt,U as Rt,X as Ft,W as Ot,_ as _t,$ as Ut,a0 as Ht,a1 as $t,a2 as le,a3 as Oe,a4 as Gt}from"./vendor-_eQ2VwHS.js";const Ke=i.createContext(void 0),ir=({children:s})=>{const[t,a]=i.useState(["public"]),[d,u]=i.useState(!1),b=async(l,g,S)=>{try{const k=["ShivaAnt","admin","sitePassword"];if(g===k[0])return a(N=>N.includes(k[1])?N:[...N,k[1]]),u(!0),sessionStorage.setItem(k[2],g),!0;const v=await(await fetch("/api/auth",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:l,username:S,password:g})})).json();return v.success&&v.role?(a(N=>N.includes(v.role)?N:[...N,v.role]),g&&sessionStorage.setItem("sitePassword",g),!0):!1}catch{return!1}},x=()=>{a(["public"]),u(!1),sessionStorage.removeItem("sitePassword"),sessionStorage.removeItem("adminAuth")},p=l=>t.includes("admin")?!0:t.includes(l);return e.jsx(Ke.Provider,{value:{roles:t,isSuperAdmin:d,login:b,logout:x,hasAccess:p},children:s})},Wt=()=>{const s=i.useContext(Ke);if(!s)throw new Error("useAuth must be used within AuthProvider");return s},Bt=`# =========================================================\r
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
`,Yt=`# region PROJECTS
projects:
  - id: 5
    title: Cancer Detection with Explainable AI
    category: []
    description: |-
      Thyroid cancer cases are increasing worldwide, but in many rural and remote areas, expert doctors and diagnostic facilities are not easily available. Traditional diagnosis mainly depends on ultrasound imaging and specialist interpretation, which can be expensive, time-consuming, and inaccessible in low-resource regions.

      Many existing AI models focus only on achieving high accuracy, but they often require high computational power and complex hardware. Such systems are difficult to deploy in rural healthcare centers where resources are limited.

      Therefore, there is a need for a lightweight, cost-effective, and explainable AI-based system that can assist doctors and healthcare workers in detecting thyroid cancer efficiently.
    tech: []
    github: ""
    live: ""
    featured: false
    media:
      - url: https://i.ibb.co/0j93F19k/719086-750.jpg
        type: image
    risks:
      - .
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
`;let ke={},oe={projects:[]};try{ke=Ve.parse(Bt)}catch(s){console.error("Failed to parse portfolio.yaml. Ensure the YAML syntax is correct. Using safe fallback.",s),ke={skills:{categories:[]},techStack:{featured:[],all:[]}}}try{oe=Ve.parse(Yt)}catch(s){console.error("Failed to parse projects.yaml. Ensure the YAML syntax is correct. Using safe fallback.",s),oe={projects:[]}}const Qe=((oe==null?void 0:oe.projects)||[]).slice();Qe.sort((s,t)=>(t.id||0)-(s.id||0));const me={...ke,projects:Qe},ar=s=>{const t=s.home,a=s.projects||[];if(t!=null&&t.featuredProjectIds&&t.featuredProjectIds.length>0)return Array.from(new Set(t.featuredProjectIds)).map(u=>a.find(b=>b.id===u)).filter(u=>u!==void 0);const d=(t==null?void 0:t.featuredProjectsCount)!==void 0&&t.featuredProjectsCount>=0?t.featuredProjectsCount:3;return a.filter(u=>u.featured).slice(0,d)},cr=s=>Array.isArray(s)?s.length>0:typeof s=="string"?s.trim().length>0:!!s;class Vt{constructor(){ce(this,"logs",[]);ce(this,"listeners",[]);ce(this,"MAX_LOGS",100)}notify(){this.listeners.forEach(t=>t([...this.logs]))}getFormattedTime(){return new Date().toLocaleTimeString("en-US",{hour12:!1,hour:"2-digit",minute:"2-digit",second:"2-digit"})}addLog(t){const a={...t,id:Math.random().toString(36).substring(2,9),timestamp:this.getFormattedTime()};this.logs=[a,...this.logs].slice(0,this.MAX_LOGS),this.notify()}getLogs(){return[...this.logs]}clearLogs(){this.logs=[],this.notify()}subscribe(t){return this.listeners.push(t),t([...this.logs]),()=>{this.listeners=this.listeners.filter(a=>a!==t)}}info(t,a){this.addLog({action:"INFO",status:"pending",message:t,metadata:a})}warn(t,a){this.addLog({action:"WARN",status:"pending",message:t,metadata:a})}error(t,a){this.addLog({action:"ERROR",status:"error",message:t,metadata:a})}}const _=new Vt,et=i.createContext(void 0),tt=i.createContext(void 0),lr=({children:s})=>{const[t,a]=i.useState(!1),[d,u]=i.useState(!1),[b,x]=i.useState("unknown"),[p,l]=i.useState(me),[g,S]=i.useState(me),[k,j]=i.useState(null),[v,N]=i.useState([]),D=i.useMemo(()=>typeof window<"u"&&(window.location.hostname==="localhost"||window.location.hostname==="127.0.0.1"),[]),[$,U]=i.useState(!1);i.useEffect(()=>{localStorage.getItem("cms-force-local")==="true"&&U(!0)},[]),i.useEffect(()=>{localStorage.setItem("cms-force-local",String($))},[$]),i.useEffect(()=>_.subscribe(N),[]);const C=i.useCallback(async()=>{var A;try{_.addLog({action:"REFRESH_DATA",status:"pending",message:"Fetching live content from backend..."});const z=await(await fetch("/api/cms-load?filePath=src/data/portfolio.yaml")).json();z.mode&&x(z.mode);const E=await(await fetch("/api/cms-load?filePath=src/data/projects.yaml")).json();let o={...me};z.success&&z.data&&(o={...o,...z.data}),E.success&&((A=E.data)!=null&&A.projects)&&(o={...o,projects:E.data.projects}),l(o),S(o),_.addLog({action:"REFRESH_DATA",status:"success",message:"Live content synchronized successfully."})}catch(P){const z=P instanceof Error?P.message:String(P);_.addLog({action:"REFRESH_DATA",status:"error",message:`Failed to fetch data: ${z}`,metadata:P}),se.error("CMS Sync Failed")}},[]);i.useEffect(()=>{C()},[C]);const F=i.useCallback((A,P)=>{S(z=>({...z,[A]:P})),_.addLog({action:"UPDATE_PREVIEW",status:"success",message:`Modified ${A} in preview.`,metadata:{section:A}})},[]),B=i.useCallback((A,P)=>{S(z=>{const T=A.split("."),E={...z};let o=E;for(let c=0;c<T.length-1;c++){const h=T[c];o[h]=Array.isArray(o[h])?[...o[h]]:{...o[h]},o=o[h]}return o[T[T.length-1]]=P,E})},[]),m=i.useMemo(()=>({previewMode:t,safeMode:d,liveData:p,previewData:g,activeSection:k,cmsMode:b,forceLocalMode:$,isLocalEnvironment:D,auditLogs:v}),[t,d,p,g,k,b,$,D,v]),y=i.useMemo(()=>({setPreviewMode:a,setSafeMode:u,setForceLocalMode:U,updatePreviewSection:F,updateNestedField:B,setActiveSection:j,refreshData:C,clearLogs:()=>_.clearLogs()}),[a,u,U,F,B,j,C]);return e.jsx(et.Provider,{value:m,children:e.jsxs(tt.Provider,{value:y,children:[s,t&&e.jsx("div",{className:"fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full shadow-lg backdrop-blur-md animate-pulse",children:"Preview Mode Active"}),d&&e.jsx("div",{className:"fixed top-12 left-1/2 -translate-x-1/2 z-[100] bg-amber-500/90 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md backdrop-blur-md",children:"Safe Mode (No Commits)"})]})})},Pe=()=>{const s=i.useContext(et);if(!s)throw new Error("useCMSState must be used within a CMSProvider");return s},qt=()=>{const s=i.useContext(tt);if(!s)throw new Error("useCMSActions must be used within a CMSProvider");return s};function dr(s){const{previewMode:t,previewData:a,liveData:d}=Pe(),u=t?a:d;return i.useMemo(()=>{try{return s(u)}catch(b){return console.warn("CMS Selector failed, returning fallback from initialData",b),s(me)}},[u,s])}const _e="/api",Jt={saveBlog:`${_e}/save-blog`,deleteBlog:`${_e}/delete-blog`};async function Xt(s,t){const a=await fetch(s,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)}),d=a.headers.get("content-type");if(!(d!=null&&d.includes("application/json")))throw new Error(`API at ${s} returned HTML instead of JSON. Ensure the dev server is running with localApiProxy (npm run dev).`);const u=await a.json();return{ok:a.ok,status:a.status,data:u}}const de=420,ue=580,Ue=320,He=300;function $e({text:s,children:t}){return e.jsxs("span",{className:"relative group/tip inline-flex items-center",children:[t,e.jsx("span",{className:"pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 text-[11px] leading-relaxed bg-popover border border-border/50 text-muted-foreground rounded-lg px-3 py-2 shadow-xl opacity-0 group-hover/tip:opacity-100 transition-opacity z-[100] text-center",children:s})]})}function Zt({onSuccess:s}){const[t,a]=i.useState({title:"",content:"",category:"Notes",type:"",featured:!1,draft:!0}),[d,u]=i.useState([]),[b,x]=i.useState(!1),[p,l]=i.useState(""),[g,S]=i.useState(!1),k=i.useRef(null),j=i.useRef({x:0,y:0,w:de,h:ue,ready:!1});i.useEffect(()=>{const o=window.innerWidth,c=window.innerHeight;j.current={x:Math.max(8,o-de-16),y:Math.max(72,c-ue-16),w:de,h:ue,ready:!0},v()},[]);const v=i.useCallback(()=>{const o=k.current;if(!o)return;const{x:c,y:h,w:L,h:G}=j.current;o.style.left=`${c}px`,o.style.top=`${h}px`,o.style.width=`${L}px`,o.style.height=`${G}px`},[]),N=(o,c,h,L)=>{const G=window.innerWidth,K=window.innerHeight;return{x:Math.max(0,Math.min(o,G-h)),y:Math.max(0,Math.min(c,K-40))}},D=i.useRef({active:!1,sx:0,sy:0,ox:0,oy:0}),$=i.useCallback(o=>{o.target.closest("[data-no-drag]")||(o.currentTarget.setPointerCapture(o.pointerId),D.current={active:!0,sx:o.clientX,sy:o.clientY,ox:j.current.x,oy:j.current.y},document.body.style.userSelect="none")},[]),U=i.useCallback(o=>{if(!D.current.active)return;const c=o.clientX-D.current.sx,h=o.clientY-D.current.sy,{x:L,y:G}=N(D.current.ox+c,D.current.oy+h,j.current.w,j.current.h);j.current.x=L,j.current.y=G,v()},[v]),C=i.useCallback(()=>{D.current.active=!1,document.body.style.userSelect=""},[]),F=i.useRef({active:!1,edge:"",sx:0,sy:0,ox:0,oy:0,ow:0,oh:0}),B=i.useCallback((o,c)=>{o.stopPropagation(),o.currentTarget.setPointerCapture(o.pointerId),F.current={active:!0,edge:c,sx:o.clientX,sy:o.clientY,ox:j.current.x,oy:j.current.y,ow:j.current.w,oh:j.current.h},document.body.style.userSelect="none"},[]),m=i.useCallback(o=>{const c=F.current;if(!c.active)return;const h=o.clientX-c.sx,L=o.clientY-c.sy;let{ox:G,oy:K,ow:Q,oh:ee}=c;if(c.edge.includes("e")&&(Q=Math.max(Ue,c.ow+h)),c.edge.includes("s")&&(ee=Math.max(He,c.oh+L)),c.edge.includes("w")){const W=Math.max(Ue,c.ow-h);G=c.ox+(c.ow-W),Q=W}if(c.edge.includes("n")){const W=Math.max(He,c.oh-L);K=c.oy+(c.oh-W),ee=W}const te=N(G,K,Q);j.current={...j.current,x:te.x,y:te.y,w:Q,h:ee},v()},[v]),y=i.useCallback(()=>{F.current.active=!1,D.current.active=!1,document.body.style.userSelect=""},[]);i.useEffect(()=>(window.addEventListener("pointermove",m),window.addEventListener("pointerup",y),()=>{window.removeEventListener("pointermove",m),window.removeEventListener("pointerup",y)}),[m,y]);const A=()=>u([...d,{label:"",url:""}]),P=(o,c,h)=>{const L=[...d];L[o][c]=h,u(L)},z=o=>u(d.filter((c,h)=>h!==o)),T=async o=>{if(o.preventDefault(),!t.title||!t.content)return l("Title and content required");x(!0),l("");const c={...t,type:t.type.split(",").map(h=>h.trim()).filter(Boolean),resources:d.filter(h=>h.label&&h.url)};try{const{ok:h,data:L}=await Xt(Jt.saveBlog,{password:sessionStorage.getItem("sitePassword")||"",blogData:c});if(!h)throw new Error(L.error||"Failed to commit");s({id:Date.now(),...c,date:new Date().toISOString(),slug:c.title.replace(/\s+/g,"-").toLowerCase()}),a({title:"",content:"",category:"Notes",type:"",featured:!1,draft:!0}),u([])}catch(h){l(h.message||"Failed to commit")}x(!1)},E=({edge:o,cursor:c,className:h})=>e.jsx("div",{className:`absolute z-20 select-none ${h}`,style:{cursor:c},onPointerDown:L=>B(L,o)});return e.jsxs("div",{ref:k,style:{position:"fixed",left:0,top:0,width:de,height:ue,zIndex:60,willChange:"transform"},className:"glass-card rounded-2xl shadow-2xl border border-primary/20 flex flex-col overflow-hidden",children:[!g&&e.jsxs(e.Fragment,{children:[e.jsx(E,{edge:"n",cursor:"n-resize",className:"top-0 left-3 right-3 h-1.5"}),e.jsx(E,{edge:"s",cursor:"s-resize",className:"bottom-0 left-3 right-3 h-1.5"}),e.jsx(E,{edge:"e",cursor:"e-resize",className:"right-0 top-3 bottom-3 w-1.5"}),e.jsx(E,{edge:"w",cursor:"w-resize",className:"left-0 top-3 bottom-3 w-1.5"}),e.jsx(E,{edge:"se",cursor:"se-resize",className:"bottom-0 right-0 w-4 h-4"}),e.jsx(E,{edge:"sw",cursor:"sw-resize",className:"bottom-0 left-0 w-4 h-4"}),e.jsx(E,{edge:"ne",cursor:"ne-resize",className:"top-0 right-0 w-4 h-4"}),e.jsx(E,{edge:"nw",cursor:"nw-resize",className:"top-0 left-0 w-4 h-4"})]}),e.jsxs("div",{onPointerDown:$,onPointerMove:U,onPointerUp:C,className:"flex items-center justify-between px-4 py-3 border-b border-border/30 bg-primary/5 cursor-grab active:cursor-grabbing rounded-t-2xl shrink-0",children:[e.jsxs("h3",{className:"text-sm font-heading font-bold flex items-center gap-2 pointer-events-none select-none",children:[e.jsx(Se,{size:15,className:"text-primary"})," Admin Matrix"]}),e.jsxs("div",{className:"flex items-center gap-1",children:[e.jsx(jt,{size:13,className:"text-muted-foreground/40 pointer-events-none"}),e.jsx("button",{"data-no-drag":!0,onClick:()=>S(o=>!o),className:"p-1 rounded hover:bg-muted/60 text-muted-foreground transition-colors ml-1",title:g?"Expand":"Minimize",children:g?e.jsx(qe,{size:14}):e.jsx(Je,{size:14})})]})]}),!g&&e.jsx("div",{className:"flex-1 overflow-y-auto overscroll-contain p-5 space-y-4",children:e.jsxs("form",{onSubmit:T,className:"space-y-4",children:[e.jsxs("div",{children:[e.jsx("label",{className:"text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block",children:"Title"}),e.jsx("input",{type:"text",value:t.title,onChange:o=>a({...t,title:o.target.value}),className:"w-full bg-background border border-border/50 rounded-lg p-2 text-sm focus:outline-none focus:border-primary/50 text-foreground",required:!0})]}),e.jsxs("div",{className:"flex gap-3",children:[e.jsxs("div",{className:"flex-1",children:[e.jsx("label",{className:"text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block",children:"Category"}),e.jsxs("select",{value:t.category,onChange:o=>a({...t,category:o.target.value}),className:"w-full bg-background border border-border/50 rounded-lg p-2 text-sm focus:outline-none focus:border-primary/50",children:[e.jsx("option",{children:"Notes"}),e.jsx("option",{children:"Thoughts"}),e.jsx("option",{children:"Books"}),e.jsx("option",{children:"Links"})]})]}),e.jsxs("div",{className:"flex-1",children:[e.jsx("label",{className:"text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block",children:"Tags (CSV)"}),e.jsx("input",{type:"text",placeholder:"React, AI, Deep...",value:t.type,onChange:o=>a({...t,type:o.target.value}),className:"w-full bg-background border border-border/50 rounded-lg p-2 text-sm focus:outline-none focus:border-primary/50"})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block",children:"Content (MD)"}),e.jsx("textarea",{rows:6,value:t.content,onChange:o=>a({...t,content:o.target.value}),className:"w-full bg-background border border-border/50 rounded-lg p-2 text-sm focus:outline-none focus:border-primary/50 font-mono resize-none leading-relaxed",required:!0})]}),e.jsxs("div",{className:"pt-2 border-t border-border/30",children:[e.jsxs("div",{className:"flex items-center justify-between mb-2",children:[e.jsx("label",{className:"text-xs font-semibold text-muted-foreground uppercase tracking-wider",children:"Resources"}),e.jsxs("button",{type:"button",onClick:A,className:"text-xs text-primary hover:underline flex items-center gap-1",children:[e.jsx(Ce,{size:12})," Add Link"]})]}),d.map((o,c)=>e.jsxs("div",{className:"flex gap-2 mb-2 items-center bg-muted/20 p-2 rounded-lg border border-border/30",children:[e.jsx(wt,{size:14,className:"text-muted-foreground shrink-0"}),e.jsx("input",{placeholder:"Label",value:o.label,onChange:h=>P(c,"label",h.target.value),className:"w-[38%] bg-transparent border-none text-xs focus:outline-none"}),e.jsx("input",{placeholder:"https://",value:o.url,onChange:h=>P(c,"url",h.target.value),className:"flex-1 bg-transparent border-none text-xs focus:outline-none"}),e.jsx("button",{type:"button",onClick:()=>z(c),className:"text-destructive hover:bg-destructive/10 p-1 rounded",children:e.jsx(Ae,{size:12})})]},c))]}),e.jsxs("div",{className:"flex items-center justify-between pt-2 border-t border-border/30",children:[e.jsxs("div",{className:"flex items-center gap-3 text-sm font-medium",children:[e.jsx($e,{text:"⭐ Featured posts appear with a gold star badge and can be filtered via the '★ Featured' button in the blog filter bar. Use this for your best or most important posts.",children:e.jsxs("label",{className:"flex items-center gap-1.5 cursor-pointer",children:[e.jsx("input",{type:"checkbox",checked:t.featured,onChange:o=>a({...t,featured:o.target.checked}),className:"accent-primary"}),e.jsx(Xe,{size:13,className:t.featured?"fill-yellow-500 text-yellow-500":"text-muted-foreground"}),"Featured"]})}),e.jsx($e,{text:"🔒 Draft posts are hidden from public visitors. Only you (as admin) can see them. Uncheck to publish the post live.",children:e.jsxs("label",{className:"flex items-center gap-1.5 cursor-pointer",children:[e.jsx("input",{type:"checkbox",checked:t.draft,onChange:o=>a({...t,draft:o.target.checked}),className:"accent-primary"}),e.jsx(St,{size:13,className:t.draft?"text-amber-400":"text-muted-foreground"}),"Draft"]})})]}),e.jsxs("button",{type:"submit",disabled:b,className:"px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm flex items-center gap-2 disabled:opacity-50 transition-colors",children:[b?e.jsx(Nt,{size:14,className:"animate-spin"}):e.jsx(Se,{size:14}),"Commit Push"]})]}),p&&e.jsx("p",{className:"text-xs text-center text-destructive bg-destructive/10 py-1.5 rounded-md border border-destructive/20",children:p})]})})]})}const Kt=Ct([I({type:Ne(["local","url"]),value:n().url("Must be a valid URL").or(n().min(1,"Required")),position:Ne(["left","right","center"]).default("right")}),n().url("Must be a valid URL")]),rt=I({featuredProjectsCount:q().min(0).default(4)}),nt=I({name:n().min(1,"Name is required"),title:n().min(1,"Title is required"),email:n().email("Invalid email format"),phone:n(),linkedin:n().url(),github:n().url(),location:n(),profileImage:Kt}),st=I({headline:f(n()),description:n().min(1,"Hero description required"),ctas:f(I({label:n(),link:n()}))}),ot=I({projectsCount:q().min(0).default(0),experienceCount:q().min(0).default(0)}),it=I({description:n().min(1,"Description is required"),marqueeTexts:f(n()),certifications:f(n())}),at=f(I({degree:n().min(1),institution:n().min(1),year:n().min(1),description:n().optional()})),ct=f(I({title:n().min(1),company:n().min(1),duration:n().min(1),description:n()})),lt=I({categories:f(I({title:n().min(1),items:f(n())}))}),dt=I({featured:f(n()),all:f(n())}),ut=f(I({title:n().min(1),description:n().min(1),icon:n().optional()})),mt=I({url:n().url("Must be a valid URL")}),pt=I({ropeLightColors:f(n()).min(1).optional(),ropeLightSpeed:q().min(.1).optional(),ropeLightThickness:q().min(.5).optional(),ropeLightGlowIntensity:q().min(0).optional(),ropeLightColorLight:n().optional(),ropeLightColorDark:n().optional(),ropeLightAccentLight:n().optional(),ropeLightAccentDark:n().optional(),textHoverColors:f(n()).optional(),textTransitionSpeed:n().optional(),textLeaveSpeed:n().optional(),textAnimationSpeed:n().optional(),textBaseOpacity:q().min(0).max(1).optional(),textGlowIntensity:q().optional()});I({home:rt.optional(),settings:pt.optional(),personal:nt.optional(),hero:st.optional(),stats:ot.optional(),about:it.optional(),education:at.optional(),experience:ct.optional(),skills:lt.optional(),techStack:dt.optional(),services:ut.optional(),resume:mt.optional()});const ht=I({id:q().int().positive().optional(),title:n().min(1,"Title is required"),category:f(n()).optional().default([]),description:n().min(1,"Description is required"),tech:f(n()).optional().default([]),github:n().optional().default(""),live:n().optional().default(""),featured:kt().optional().default(!1),impact:n().optional(),media:f(I({type:Ne(["image","video"]).default("image"),url:n().optional(),caption:n().optional()})).optional(),problem_statement:n().optional(),learning_outcomes:f(n()).optional(),architecture:n().optional(),architectureImage:n().optional(),resources:f(I({label:n().optional(),url:n().optional()})).optional(),howItWorks:n().optional(),objectives:f(n()).optional(),success_criteria:f(n()).optional(),data_sources:f(n()).optional(),target_variable:n().optional(),features:f(n()).optional(),preprocessing:f(n()).optional(),modeling:f(n()).optional(),evaluation_metrics:f(n()).optional(),validation_strategy:n().optional(),explainability:n().optional(),deployment:n().optional(),risks:f(n()).optional(),ethics:f(n()).optional(),open_resources:f(I({label:n().optional(),url:n().optional()})).optional()}).passthrough(),Qt=f(ht);function er(s,t){const a=s.safeParse(t);return a.success?{success:!0,data:a.data}:{success:!1,errors:a.error.errors.map(u=>{const b=u.path.join(".");return b?`${b}: ${u.message}`:u.message})}}const we={settings:pt,home:rt,personal:nt,hero:st,stats:ot,about:it,education:at,experience:ct,skills:lt,techStack:dt,services:ut,resume:mt,projects:Qt},tr={image:"🖼️",video:"🎬",iframe:"🌐",pdf:"📄"},rr=({url:s,type:t})=>{if(!s)return null;const a=t==="video"||/\.(mp4|webm|mov)/i.test(s)||/youtube|vimeo/i.test(s);return e.jsxs("div",{className:"mt-2 w-full h-28 rounded-lg bg-muted/30 border border-border/50 overflow-hidden relative",children:[a?e.jsxs("div",{className:"flex flex-col items-center justify-center h-full text-muted-foreground/60 gap-1",children:[e.jsx(Et,{size:28}),e.jsx("span",{className:"text-[10px]",children:"Video URL set"}),e.jsx("a",{href:s,target:"_blank",rel:"noreferrer",className:"text-[10px] text-primary hover:underline truncate max-w-[90%]",children:s})]}):e.jsx("img",{src:s,alt:"Preview",className:"w-full h-full object-cover",onError:d=>{var u;d.currentTarget.style.display="none",(u=d.currentTarget.nextElementSibling)==null||u.style.setProperty("display","flex")}}),!a&&e.jsxs("div",{className:"absolute inset-0 hidden flex-col items-center justify-center bg-muted text-muted-foreground/50",children:[e.jsx(Dt,{size:22,className:"mb-1"}),e.jsx("span",{className:"text-[10px]",children:"Image failed to load"})]})]})},Ge=s=>s.replace(/([A-Z])/g," $1").replace(/^./,t=>t.toUpperCase());function We(s){let t=s;for(;t instanceof It||t instanceof Mt||t instanceof Tt;)t=t._def.innerType;return t}const pe=At.memo(({schema:s,data:t,onChange:a,path:d=[],parentData:u})=>{const b=We(s);if(b instanceof De){const x=b.shape,p=t||{};return e.jsx("div",{className:`space-y-4 ${d.length>0?"pl-4 border-l-2 border-border/40 mt-2":""}`,children:Object.keys(x).map(l=>e.jsxs("div",{className:"space-y-1.5",children:[e.jsx("label",{className:"text-[10px] font-bold text-muted-foreground uppercase tracking-wider block opacity-70",children:Ge(l)}),e.jsx(pe,{schema:x[l],data:p[l],path:[...d,l],parentData:p,onChange:g=>a({...p,[l]:g})})]},l))})}if(b instanceof Pt){const x=b.element,p=Array.isArray(t)?t:[];return e.jsxs("div",{className:"space-y-3",children:[p.map((l,g)=>e.jsxs("div",{className:"relative p-4 rounded-xl border border-border/50 bg-muted/10 group",children:[e.jsx("button",{onClick:()=>{const S=[...p];S.splice(g,1),a(S)},className:"absolute top-2 right-2 text-muted-foreground hover:text-destructive p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity",title:"Remove Item",children:e.jsx(Ae,{size:14})}),e.jsxs("div",{className:"text-[10px] font-mono text-muted-foreground mb-2 pb-2 border-b border-border/30 opacity-60",children:["Item ",g+1]}),e.jsx(pe,{schema:x,data:l,path:[...d,String(g)],onChange:S=>{const k=[...p];k[g]=S,a(k)}})]},g)),e.jsxs("button",{onClick:()=>{let l="";const g=We(x);g instanceof De&&(l={}),g instanceof Re&&(l=0),g instanceof Fe&&(l=!1),g instanceof ze&&(l=g.options[0]),a([...p,l])},className:"flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors px-2 py-1.5 rounded-md hover:bg-primary/5",children:[e.jsx(Ce,{size:14})," Add ",Ge(d[d.length-1]||"Item")]})]})}if(b instanceof ze){const x=b.options,p=t??x[0];return e.jsxs("div",{className:"relative w-full",children:[e.jsx("select",{value:p,onChange:l=>a(l.target.value),className:"w-full appearance-none bg-background border border-border/40 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 text-foreground pr-10 cursor-pointer transition-colors hover:border-border/70",children:x.map(l=>e.jsxs("option",{value:l,children:[tr[l]||""," ",l.charAt(0).toUpperCase()+l.slice(1)]},l))}),e.jsx("div",{className:"pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs",children:"▼"})]})}if(b instanceof Lt){const x=d[d.length-1]||"",p=x.toLowerCase(),l=p.includes("url")||p.includes("link")||p.includes("github")||p.includes("live")||p.includes("source")||p.includes("dataset")||p.includes("kaggle")||p.includes("paper")||p.includes("repo")||p.includes("demo"),g=typeof t=="string"&&/^https?:\/\//i.test(t.trim()),S=(l||g)&&g,k=p.includes("image")||p.includes("architecture"),j=["description","content","impact","architecture","problem_statement","howItWorks","explainability","deployment","validation_strategy"].includes(x),v=x==="url"&&d.includes("media");return e.jsxs("div",{className:"w-full",children:[j?e.jsx("textarea",{value:t||"",onChange:N=>a(N.target.value),className:"w-full bg-background border border-border/30 rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary/50 text-foreground resize-y min-h-[80px]",placeholder:"Type here..."}):e.jsxs("div",{className:"flex items-center gap-1.5",children:[e.jsx("input",{type:l||v?"url":"text",value:t||"",onChange:N=>a(N.target.value),className:"flex-1 bg-background border border-border/30 rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary/50 text-foreground min-w-0",placeholder:l||v?"https://...":"Value..."}),S&&e.jsx("a",{href:t.trim(),target:"_blank",rel:"noopener noreferrer",title:"Open link",className:"shrink-0 flex items-center justify-center w-9 h-9 rounded-lg border border-primary/30 bg-primary/5 text-primary hover:bg-primary/15 hover:border-primary/60 transition-all",children:e.jsx(Ze,{size:15})})]}),v&&t&&e.jsx(rr,{url:t,type:u==null?void 0:u.type}),k&&t&&!v&&e.jsx("div",{className:"mt-2 w-full h-28 rounded-lg bg-muted/30 border border-border/50 overflow-hidden",children:e.jsx("img",{src:t,alt:"Preview",className:"w-full h-full object-cover",onError:N=>{N.currentTarget.style.opacity="0.3"}})})]})}return b instanceof Re?e.jsx("input",{type:"number",value:t??0,onChange:x=>a(Number(x.target.value)),className:"w-full bg-background border border-border/30 rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary/50 text-foreground"}):b instanceof Fe?e.jsxs("label",{className:"flex items-center gap-2 cursor-pointer pt-1",children:[e.jsx("div",{className:`w-10 h-5 rounded-full p-0.5 transition-colors ${t?"bg-primary":"bg-border"}`,children:e.jsx("div",{className:`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${t?"translate-x-5":"translate-x-0"}`})}),e.jsx("span",{className:"text-sm font-medium select-none",children:t?"Yes":"No"}),e.jsx("input",{type:"checkbox",checked:!!t,onChange:x=>a(x.target.checked),className:"hidden"})]}):e.jsx("textarea",{value:typeof t=="object"?JSON.stringify(t,null,2):String(t||""),onChange:x=>{try{a(JSON.parse(x.target.value))}catch{a(x.target.value)}},className:"w-full bg-background border border-border/30 rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary/50 font-mono text-[10px] text-foreground/80 h-20"})}),nr=({projects:s,onChange:t,onSave:a,isLoading:d,mode:u})=>{const{liveData:b}=Pe(),[x,p]=i.useState(null),[l,g]=i.useState(!1),[S,k]=i.useState({}),[j,v]=i.useState(""),N=JSON.stringify(s)!==JSON.stringify(b.projects),D=m=>{k({...m}),p(m.id)},$=()=>{const m=s.reduce((y,A)=>(A.id||0)>y?A.id:y,0);k({id:m+1,title:"",category:[],description:"",tech:[],github:"",live:"",featured:!1}),g(!0)},U=()=>{if(!S.title||!S.description){alert("Title and Description are required.");return}let m;return l?m=[S,...s]:m=s.map(y=>y.id===S.id?S:y),t(m),F(),m},C=m=>{confirm("Are you sure you want to delete this project?")&&t(s.filter(y=>y.id!==m))},F=()=>{p(null),g(!1),k({})},B=x!==null||l;return e.jsxs("div",{className:"flex flex-col h-full bg-background relative",children:[e.jsxs("div",{className:"flex items-center justify-between mb-4 px-4 pt-4 shrink-0",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("h3",{className:"text-lg font-bold text-foreground font-heading",children:"Manage Projects"}),N&&e.jsx("span",{className:"px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-bold uppercase tracking-wider border border-amber-500/20",children:"Pending Changes"})]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs("button",{onClick:$,className:"px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 transition-colors rounded-lg text-sm font-medium flex items-center gap-1.5",children:[e.jsx(Ce,{size:14})," New Project"]}),e.jsx("button",{onClick:async()=>{v("");const m=await a();m&&!m.success&&v(m.error||"Save failed. Check the Logs tab for details.")},disabled:d||!N,className:"px-4 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-1.5",children:d?e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"animate-spin inline-block w-3 h-3 border border-white/30 border-t-white rounded-full"})," Saving..."]}):u==="local"?"Save to Local":"Save to GitHub"})]})]}),j&&e.jsxs("div",{className:"mx-4 mb-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs font-medium",children:["⚠️ ",j]}),e.jsx("div",{className:"flex-1 overflow-y-auto px-4 pb-12",children:e.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-4",children:s.map(m=>{var y;return e.jsxs("div",{className:"group glass-card border border-border/50 rounded-xl p-4 flex flex-col hover:border-primary/40 transition-colors relative",children:[e.jsxs("div",{className:"absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",children:[e.jsx("button",{onClick:()=>D(m),className:"p-1.5 bg-muted hover:bg-primary/10 hover:text-primary rounded text-muted-foreground transition-colors",children:e.jsx(zt,{size:14})}),e.jsx("button",{onClick:()=>C(m.id),className:"p-1.5 bg-muted hover:bg-destructive/10 hover:text-destructive rounded text-muted-foreground transition-colors",children:e.jsx(Ae,{size:14})})]}),e.jsxs("div",{className:"flex items-start gap-2 mb-2 pr-16",children:[m.featured&&e.jsx(Xe,{size:14,className:"text-yellow-500 fill-yellow-500 mt-1 shrink-0"}),e.jsx("h4",{className:"font-bold text-foreground leading-tight",children:m.title})]}),e.jsx("p",{className:"text-xs text-muted-foreground line-clamp-3 mb-3",children:m.description}),e.jsxs("div",{className:"mt-auto flex items-center gap-3",children:[e.jsxs("div",{className:"flex gap-1 flex-wrap flex-1",children:[(y=m.tech)==null?void 0:y.slice(0,3).map(A=>e.jsx("span",{className:"text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50",children:A},A)),m.tech&&m.tech.length>3&&e.jsxs("span",{className:"text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50",children:["+",m.tech.length-3]})]}),e.jsxs("div",{className:"flex gap-2 shrink-0",children:[m.github&&e.jsx(Rt,{size:14,className:"text-muted-foreground"}),m.live&&e.jsx(Ze,{size:14,className:"text-muted-foreground"})]})]})]},m.id)})})}),B&&e.jsxs("div",{className:"absolute inset-0 z-50 flex flex-col animate-in fade-in duration-150 overflow-hidden rounded-xl",children:[e.jsx("div",{className:"absolute inset-0 bg-background/60 backdrop-blur-sm",onClick:F}),e.jsxs("div",{className:"glass-card shadow-2xl border-l border-border/50 flex flex-col h-full absolute right-0 top-0 bottom-0 w-full max-w-full",style:{maxWidth:"100%"},children:[e.jsxs("div",{className:"flex items-center justify-between p-4 border-b border-border/50 bg-muted/20",children:[e.jsx("h3",{className:"font-bold",children:l?"New Project":"Edit Project"}),e.jsx("button",{onClick:F,className:"p-1.5 rounded hover:bg-muted/60 text-muted-foreground transition-colors",children:e.jsx(Ft,{size:16})})]}),e.jsx("div",{className:"flex-1 overflow-y-auto p-5",children:e.jsx(pe,{schema:ht,data:S,onChange:k})}),e.jsxs("div",{className:"p-4 border-t border-border/50 bg-muted/10 flex justify-end gap-2",children:[e.jsx("button",{onClick:F,className:"px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted text-muted-foreground transition-colors",children:"Cancel"}),e.jsx("button",{onClick:U,className:"px-4 py-2 bg-primary/20 text-primary rounded-lg text-sm font-medium hover:bg-primary/30 transition-colors",children:"Apply to Preview"}),u==="local"?e.jsx("button",{onClick:async()=>{const m=U();setTimeout(()=>a(m),0)},className:"px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg",children:"Apply & Save to Local"}):e.jsx("button",{onClick:async()=>{const m=U();setTimeout(()=>a(m),0)},className:"px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg",children:"Apply & Sync to GitHub"})]})]})]})]})},Be=750,Ye=600,ur=()=>{const{previewData:s,previewMode:t,safeMode:a,cmsMode:d,forceLocalMode:u,isLocalEnvironment:b,auditLogs:x}=Pe(),{setPreviewMode:p,setSafeMode:l,setForceLocalMode:g,updatePreviewSection:S,refreshData:k,clearLogs:j}=qt(),{roles:v,isSuperAdmin:N}=Wt(),D=v.includes("editor")&&!v.includes("admin"),$=v.includes("admin")?"admin":"editor",U=v.includes("admin")?N?"⚡ Master Shivansh":"Masterji":null,[C,F]=i.useState(()=>typeof window<"u"?localStorage.getItem("cms-maximized")==="true":!1),[B,m]=i.useState(()=>{if(typeof window<"u"){const r=localStorage.getItem("cms-dimensions");return r?JSON.parse(r):{w:Be,h:Ye}}return{w:Be,h:Ye}}),[y,A]=i.useState("portfolio"),[P,z]=i.useState("hero"),[T,E]=i.useState(!1),[o,c]=i.useState(!1),[h,L]=i.useState(""),[G,K]=i.useState([]),[Q,ee]=i.useState(!1),[te,W]=i.useState(!1),[ne,he]=i.useState(null),Le=i.useRef(null),w=i.useRef({x:0,y:0,w:B.w,h:B.h}),J=i.useRef({active:!1,sx:0,sy:0,ox:0,oy:0}),H=i.useRef({active:!1,startW:0,startH:0,startX:0,startY:0,edge:"corner"}),ie=i.useCallback(()=>{const r=Le.current;!r||C||(r.style.transform=`translate3d(${w.current.x}px, ${w.current.y}px, 0)`,r.style.width=`${w.current.w}px`,r.style.height=`${w.current.h}px`)},[C]);i.useEffect(()=>{if(C)return;const r=window.innerWidth,R=window.innerHeight;w.current={x:Math.max(8,r/2-w.current.w/2),y:Math.max(72,R/2-w.current.h/2),w:Math.min(w.current.w,r-16),h:Math.min(w.current.h,R-60)},ie()},[C,ie]),i.useEffect(()=>{localStorage.setItem("cms-maximized",String(C))},[C]);const gt=r=>{C||r.target.closest("[data-no-drag]")||(r.currentTarget.setPointerCapture(r.pointerId),J.current={active:!0,sx:r.clientX,sy:r.clientY,ox:w.current.x,oy:w.current.y},document.body.style.userSelect="none",W(!0))},xt=r=>{J.current.active&&(w.current.x=J.current.ox+(r.clientX-J.current.sx),w.current.y=J.current.oy+(r.clientY-J.current.sy),ie())},ft=()=>{J.current.active=!1,document.body.style.userSelect="",W(!1)},ge=(r,R)=>{r.stopPropagation(),r.currentTarget.setPointerCapture(r.pointerId),H.current={active:!0,startW:w.current.w,startH:w.current.h,startX:r.clientX,startY:r.clientY,edge:R},W(!0)},xe=r=>{if(!H.current.active)return;const R=r.clientX-H.current.startX,X=r.clientY-H.current.startY;(H.current.edge==="right"||H.current.edge==="corner")&&(w.current.w=Math.max(500,H.current.startW+R)),(H.current.edge==="bottom"||H.current.edge==="corner")&&(w.current.h=Math.max(400,H.current.startH+X)),ie()},fe=()=>{H.current.active=!1,W(!1),m({w:w.current.w,h:w.current.h}),localStorage.setItem("cms-dimensions",JSON.stringify({w:w.current.w,h:w.current.h}))},be=async(r,R,X)=>{c(!0),L("");const Te=r==="projects",ae=Te?"src/data/projects.yaml":"src/data/portfolio.yaml",Z=Te?"SAVE_PROJECTS":`SAVE_SECTION:${r}`;_.addLog({action:Z,status:"pending",message:`Initiating save for ${r} to ${ae}...`,metadata:{section:r,filePath:ae,isSafeMode:a}});let je=R;r==="projects"&&Array.isArray(R)&&(je=R.map(O=>{if(!Array.isArray(O.media))return O;const M=O.media.filter(Y=>Y&&Y.url).map(Y=>{if(Y.type)return Y;const re=Y.url||"";let V="image";return/\.(mp4|webm|mov|avi|mkv)/i.test(re)||/youtube\.com|youtu\.be|vimeo\.com/i.test(re)?V="video":/\.(jpg|jpeg|png|gif|webp|svg|avif)/i.test(re)&&(V="image"),_.addLog({action:Z,status:"success",message:`Auto-detected media type "${V}" for ${re}`}),{...Y,type:V}});return{...O,media:M}}));const Ee=we[r];if(Ee){const O=er(Ee,je);if(O.success===!1){const M=O.errors.map(Y=>Y.replace(/^(\d+)\./,(re,V)=>`Project #${parseInt(V)+1} → `).replace(/\.media\.(\d+)\./,(re,V)=>` media[${parseInt(V)+1}] → `).replace(/: Required/,": missing (auto-fixed or ignored)").replace(/: Invalid url/,": invalid URL (saved as-is)"));se.warning(`⚠️ Soft warnings (saving anyway):
${M.join(`
`)}`,{duration:6e3}),_.addLog({action:Z,status:"success",message:`Soft validation warnings (non-blocking): ${M.join(" | ")}`})}}try{const O=await fetch("/api/cms-save",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({filePath:ae,sectionKey:r,newData:je,providedSha:X||void 0,isSafeMode:a,role:$})}),M=await O.json();return O.status===409?(he({latestSha:M.data.latestSha,latestContent:M.data.latestContent,section:r,pendingData:R,targetFile:ae}),_.addLog({action:Z,status:"error",message:"Conflict detected (SHA mismatch). Overlay triggered."}),se.error("Conflict detected!"),c(!1),{success:!1,error:"Conflict"}):M.success?(_.addLog({action:Z,status:"success",message:`${r} persisted successfully to ${M.mode||"backend"}.`,metadata:M}),se.success(M.message||"Saved successfully"),he(null),a||await k(),c(!1),{success:!0}):(L(M.error||"Save Failed"),_.addLog({action:Z,status:"error",message:`Backend error: ${M.error}`,metadata:M}),c(!1),{success:!1,error:M.error})}catch(O){const M=O.message||"Network failure";return L("Network error: "+M),_.addLog({action:Z,status:"error",message:`Network/Runtime failure: ${M}`,metadata:O}),c(!1),{success:!1,error:M}}},Ie=r=>{if(r==="cancel"){he(null);return}ne&&be(ne.section,ne.pendingData,ne.latestSha)},ye=async r=>{ee(!0);try{const X=await(await fetch(`/api/cms-history?filePath=${r}`)).json();X.success?K(X.data.commits||[]):L(X.error||"Failed to load history")}catch{L("Failed to load history")}ee(!1)};i.useEffect(()=>{y==="history"&&ye("src/data/portfolio.yaml")},[y]);const Me=i.useMemo(()=>s[P]||{},[s,P]),ve=i.useMemo(()=>u?{label:"Local (Forced)",color:"bg-amber-500/20 text-amber-500",icon:"🚧"}:d==="local"?{label:"Local Mode",color:"bg-green-500/20 text-green-500",icon:"🏠"}:d==="github"?{label:"Cloud Sync",color:"bg-blue-500/20 text-blue-500",icon:"☁️"}:{label:"Connecting...",color:"bg-muted text-muted-foreground",icon:"⏳"},[d,u]),bt=C?{position:"fixed",inset:0,zIndex:90,width:"100% !important",height:"100% !important",transform:"none !important"}:{position:"fixed",zIndex:90,width:w.current.w,height:w.current.h,transform:`translate3d(${w.current.x}px, ${w.current.y}px, 0)`,willChange:te?"transform, width, height":"auto"};return e.jsxs("div",{ref:Le,style:bt,className:`no-text-effect glass-card ${C?"rounded-none":"rounded-2xl shadow-2xl border border-primary/20"} flex flex-col overflow-hidden bg-background/95 backdrop-blur-3xl ${te?"":"transition-[border-radius,width,height,transform] duration-300"} ${T?"!h-12 !w-80":""}`,children:[e.jsxs("div",{onPointerDown:gt,onPointerMove:xt,onPointerUp:ft,className:"flex items-center justify-between px-4 py-3 border-b border-border/30 bg-primary/10 cursor-grab active:cursor-grabbing shrink-0",children:[e.jsxs("div",{className:"flex items-center gap-2 pointer-events-none min-w-0",children:[e.jsx("span",{className:"text-sm font-bold shrink-0",children:"CMS Matrix"}),!T&&U&&e.jsx("span",{className:`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter flex items-center gap-1 shrink-0 ${N?"bg-amber-500/20 text-amber-400 border border-amber-500/30":"bg-blue-500/15 text-blue-400 border border-blue-500/20"}`,children:U}),!T&&e.jsxs("div",{className:`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter flex items-center gap-1.5 shrink-0 ${ve.color}`,children:[e.jsx("span",{children:ve.icon}),e.jsx("span",{children:ve.label})]})]}),e.jsxs("div",{"data-no-drag":!0,className:"flex items-center gap-2 shrink-0",children:[!T&&e.jsxs(e.Fragment,{children:[e.jsxs("button",{onClick:()=>l(!a),className:`hidden sm:flex px-2 py-1 items-center gap-1 text-[10px] font-bold rounded uppercase transition-colors ${a?"bg-amber-500/20 text-amber-500":"bg-muted text-muted-foreground"}`,children:[a?e.jsx(Ot,{size:12}):e.jsx(_t,{size:12}),"Safe Mode"]}),e.jsxs("label",{className:"flex items-center gap-1.5 cursor-pointer text-[10px] uppercase font-bold text-muted-foreground ml-2",children:["Preview",e.jsx("input",{type:"checkbox",checked:t,onChange:r=>p(r.target.checked),className:"accent-primary"})]}),e.jsx("div",{className:"w-px h-4 bg-border mx-1"}),e.jsx("button",{onClick:()=>F(!C),className:"p-1 hover:bg-muted rounded text-muted-foreground transition-colors",children:C?e.jsx(Je,{size:14}):e.jsx(qe,{size:14})})]}),e.jsx("button",{onClick:()=>E(r=>!r),title:T?"Restore Panel":"Minimise Panel",className:`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold transition-all ${T?"bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30 animate-pulse":"hover:bg-muted text-muted-foreground"}`,children:T?e.jsxs(e.Fragment,{children:[e.jsx(Ut,{size:13})," Restore"]}):e.jsx(Ht,{size:14})})]})]}),ne&&!T&&e.jsxs("div",{className:"absolute inset-0 z-50 bg-background/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in",children:[e.jsx($t,{size:48,className:"text-destructive mb-4"}),e.jsx("h2",{className:"text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500",children:"Conflict Detected"}),e.jsx("p",{className:"text-sm text-foreground/80 my-3 max-w-sm",children:"Another editor recently pushed changes. Your local version is out of sync."}),e.jsxs("div",{className:"flex gap-3 mt-4",children:[e.jsx("button",{onClick:()=>Ie("cancel"),className:"px-5 py-2 rounded-lg bg-muted hover:bg-muted/80 font-medium",children:"Cancel"}),e.jsxs("button",{onClick:()=>Ie("overwrite"),className:"px-5 py-2 rounded-lg bg-destructive text-destructive-foreground font-medium flex items-center gap-2",children:["Over-write ",e.jsx(le,{size:14})]})]})]}),!T&&e.jsxs("div",{className:`flex flex-1 overflow-hidden relative ${te?"pointer-events-none":""}`,children:[e.jsxs("div",{className:"w-[180px] bg-muted/20 border-r border-border/40 flex flex-col p-3 gap-2 overflow-y-auto shrink-0",children:[e.jsx("div",{className:"text-[10px] font-bold text-muted-foreground uppercase opacity-70 tracking-wider mb-1 mt-2 px-2",children:"Modules"}),["portfolio","projects","blog","history","settings","logs"].map(r=>e.jsx("button",{onClick:()=>A(r),className:`text-sm font-medium px-3 py-2 rounded-lg text-left transition-colors capitalize ${y===r?"bg-primary/20 text-primary":"hover:bg-muted/50 text-muted-foreground"}`,children:r==="logs"?e.jsxs("span",{className:"flex items-center gap-2",children:[r,x.some(R=>R.status==="error")&&e.jsx("span",{className:"w-1.5 h-1.5 rounded-full bg-destructive animate-pulse"})]}):r},r)),y==="portfolio"&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"text-[10px] font-bold text-muted-foreground uppercase opacity-70 tracking-wider mb-1 mt-4 px-2",children:"Sections"}),["home","hero","personal","about","projects-shortcut","stats","skills","techStack","services","education","experience","resume"].filter(r=>!D||!["emailjs","personal","resume"].includes(r)).map(r=>e.jsx("button",{onClick:()=>{r==="projects-shortcut"?A("projects"):z(r)},className:`text-[13px] font-medium px-3 py-1.5 rounded-lg text-left transition-colors capitalize ${r==="projects-shortcut"?"text-primary/80 hover:bg-primary/5 italic":P===r?"bg-muted border border-border/50 text-foreground shadow-sm":"hover:bg-muted/30 text-muted-foreground border border-transparent"}`,children:r==="projects-shortcut"?"→ Projects":r.replace(/([A-Z])/g," $1").trim()},r))]})]}),e.jsxs("div",{className:"flex-1 flex flex-col bg-background/40 relative h-full overflow-hidden",children:[y==="portfolio"&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"flex-1 overflow-y-auto p-4 sm:p-6",children:[h&&e.jsx("div",{className:"mb-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-3 text-sm",children:h}),we[P]?e.jsx(pe,{schema:we[P],data:Me,onChange:r=>S(P,r)}):e.jsx("div",{className:"text-muted-foreground text-sm",children:"Select a section."})]}),e.jsx("div",{className:"p-4 border-t border-border/40 bg-muted/10 shrink-0 flex items-center justify-end gap-3",children:e.jsxs("button",{disabled:o,onClick:()=>be(P,Me),className:"px-5 py-2 bg-primary text-primary-foreground rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-lg",children:[o?e.jsx(le,{size:15,className:"animate-spin"}):e.jsx(Se,{size:15}),o?"Saving...":d==="local"||u?"Save Local":"Commit GitHub"]})})]}),y==="projects"&&e.jsx("div",{className:"relative flex-1 overflow-hidden flex flex-col",children:e.jsx(nr,{projects:s.projects||[],onChange:r=>S("projects",r),isLoading:o,mode:u||d==="local"?"local":"github",onSave:r=>be("projects",r||s.projects||[])})}),y==="blog"&&e.jsx("div",{className:"flex-1 relative overflow-auto",children:e.jsx(Zt,{onSuccess:()=>se.success("Blog deployed!")})}),y==="history"&&e.jsxs("div",{className:"flex-1 overflow-y-auto p-4 sm:p-6",children:[e.jsxs("div",{className:"flex items-center justify-between mb-4",children:[e.jsx("h3",{className:"font-bold",children:"History"}),e.jsxs("div",{className:"flex gap-2 text-xs",children:[e.jsx("button",{onClick:()=>ye("src/data/portfolio.yaml"),className:"p-1 px-2 bg-muted rounded",children:"Portfolio"}),e.jsx("button",{onClick:()=>ye("src/data/projects.yaml"),className:"p-1 px-2 bg-muted rounded",children:"Projects"})]})]}),Q?e.jsx(le,{size:24,className:"animate-spin"}):e.jsx("div",{className:"space-y-3",children:G.map(r=>e.jsxs("div",{className:"p-3 rounded-lg border border-border/50 bg-muted/5 text-xs",children:[e.jsx("p",{className:"font-bold",children:r.message}),e.jsxs("p",{className:"opacity-70",children:[new Date(r.date).toLocaleString()," • ",r.author]})]},r.sha))})]}),y==="settings"&&e.jsxs("div",{className:"flex-1 overflow-y-auto p-6",children:[e.jsxs("h3",{className:"text-lg font-bold mb-4 flex items-center gap-2",children:[e.jsx(le,{size:18})," Sync Settings"]}),e.jsx("div",{className:"p-5 rounded-2xl border border-border/50 bg-muted/10",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("p",{className:"font-bold text-sm",children:"Force Local Mode"}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"Force-save to local filesystem."})]}),e.jsx("input",{type:"checkbox",checked:u,onChange:r=>g(r.target.checked),className:"w-4 h-4"})]})})]}),y==="logs"&&e.jsxs("div",{className:"flex-1 flex flex-col overflow-hidden",children:[e.jsxs("div",{className:"flex items-center justify-between p-4 sm:p-6 border-b border-border/40 shrink-0",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(Oe,{size:18,className:"text-primary"}),e.jsx("h3",{className:"text-lg font-bold",children:"Audit Logs"})]}),e.jsxs("button",{onClick:j,className:"flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded-md hover:bg-destructive/5",children:[e.jsx(Gt,{size:14}),"Clear History"]})]}),e.jsx("div",{className:"flex-1 overflow-y-auto p-4 sm:p-6 space-y-2 bg-muted/5",children:x.length===0?e.jsxs("div",{className:"flex flex-col items-center justify-center h-40 text-muted-foreground/40",children:[e.jsx(Oe,{size:32,className:"mb-2 opacity-20"}),e.jsx("p",{className:"text-sm",children:"No activity logs recorded yet."})]}):x.map(r=>e.jsxs("div",{className:"group p-3 rounded-lg border border-border/30 bg-background/50 flex gap-4 text-[11px] font-mono leading-relaxed transition-all hover:border-primary/20 hover:bg-background shadow-sm",children:[e.jsx("div",{className:"text-muted-foreground/60 w-16 shrink-0 pt-0.5",children:r.timestamp}),e.jsxs("div",{className:"flex-1 flex flex-col gap-1",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${r.status==="success"?"bg-green-500/10 text-green-600":r.status==="error"?"bg-red-500/10 text-red-600":"bg-blue-500/10 text-blue-600"}`,children:r.action}),e.jsxs("span",{className:"text-muted-foreground/40 group-hover:opacity-100 opacity-0 transition-opacity",children:["ID: ",r.id]})]}),e.jsx("div",{className:"text-foreground/80",children:r.message}),r.metadata&&e.jsxs("details",{className:"mt-1",children:[e.jsx("summary",{className:"text-[9px] cursor-pointer text-primary/60 hover:text-primary",children:"View Metadata"}),e.jsx("pre",{className:"mt-2 p-2 rounded bg-muted/50 border border-border/20 overflow-x-auto text-[9px]",children:JSON.stringify(r.metadata,null,2)})]})]})]},r.id))})]})]})]}),!C&&!T&&e.jsxs(e.Fragment,{children:[e.jsx("div",{onPointerDown:r=>ge(r,"right"),onPointerMove:xe,onPointerUp:fe,className:"absolute top-0 bottom-6 right-0 w-4 cursor-ew-resize z-[99]"}),e.jsx("div",{onPointerDown:r=>ge(r,"bottom"),onPointerMove:xe,onPointerUp:fe,className:"absolute bottom-0 left-0 right-6 h-4 cursor-ns-resize z-[99]"}),e.jsx("div",{onPointerDown:r=>ge(r,"corner"),onPointerMove:xe,onPointerUp:fe,className:"absolute bottom-0 right-0 w-10 h-10 cursor-nwse-resize z-[100] flex items-end justify-end p-2 group",children:e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",className:"text-primary/50 group-hover:text-primary transition-colors",children:[e.jsx("polyline",{points:"21 15 21 21 15 21"}),e.jsx("line",{x1:"21",y1:"21",x2:"15",y2:"15"})]})})]})]})};export{ir as A,lr as C,ur as U,Wt as a,Jt as b,Xt as c,Zt as d,ar as g,cr as h,me as p,dr as u};
