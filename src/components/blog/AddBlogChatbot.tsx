import { useState, useRef, useEffect } from "react";
import { Send, Lock, Loader2, Bot, CheckCircle2, ShieldAlert, X, MessageSquarePlus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { apiFetch, API_ROUTES } from "@/lib/apiClient";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  type?: "password" | "category" | "title" | "content" | "link" | "success" | "error" | "confirm";
  options?: string[];
}

interface ChatbotProps {
  onSuccessPayload?: (payload: any) => void;
}

export function AddBlogChatbot({ onSuccessPayload }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      sender: "bot",
      text: "Welcome to the Antigravity CMS! Please enter the global Admin Password to authenticate.",
      type: "password"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Collected CMS Payload State
  const [password, setPassword] = useState("");
  const [blogData, setBlogData] = useState({ title: "", content: "", category: "", link: "" });

  const currentExpectedType = messages[messages.length - 1]?.sender === "bot" 
    ? messages[messages.length - 1].type 
    : undefined;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const addBotMessage = (text: string, type?: Message["type"], options?: string[]) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Math.random().toString(), sender: "bot", text, type, options }]);
      setIsTyping(false);
    }, 600);
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    // Display user message
    setMessages(prev => [
      ...prev, 
      { id: Math.random().toString(), sender: "user", text: currentExpectedType === "password" ? "••••••••" : text }
    ]);
    setInputValue("");

    // Process State Machine Response
    switch (currentExpectedType) {
      case "password":
        setIsSubmitting(true);
        try {
          const checkRes = await fetch(API_ROUTES.saveBlog, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ password: text.trim(), blogData: null }),
          });
          setIsSubmitting(false);

          if (checkRes.ok || checkRes.status === 400) {
            setPassword(text.trim());
            addBotMessage("Authentication provisionally accepted. What type of post are you adding?", "category", ["Notes", "Thoughts", "Books", "Links"]);
          } else if (checkRes.status === 401) {
            addBotMessage("Invalid Password. Access denied.", "error");
          } else {
            addBotMessage("API Error. Ensure the dev server is running (npm run dev).", "error");
          }
        } catch (err) {
          setIsSubmitting(false);
          addBotMessage("Network Error: Could not reach the authentication server.", "error");
        }
        break;

      case "category":
        setBlogData(prev => ({ ...prev, category: text.trim() }));
        addBotMessage(`Selected ${text}. What is the title of the post?`, "title");
        break;

      case "title":
        setBlogData(prev => ({ ...prev, title: text.trim() }));
        addBotMessage("Great title. Please enter the main content/text for this post.", "content");
        break;

      case "content":
        setBlogData(prev => ({ ...prev, content: text }));
        addBotMessage("Content formatted. Finally, do you have an optional URL link to attach? (If no, type 'none')", "link");
        break;

      case "link":
        const linkVal = text.toLowerCase() === "none" ? "" : text.trim();
        const payloadPost = { ...blogData, link: linkVal };
        setBlogData(payloadPost);
        addBotMessage("Payload ready! Please confirm submission to push these changes to GitHub.", "confirm", ["Confirm & Push", "Reset"]);
        break;

      case "confirm":
        if (text === "Confirm & Push") {
          await triggerPipelineUpload(password, blogData);
        } else {
          setMessages([{ id: Math.random().toString(), sender: "bot", text: "Process aborted. Starting over. What type of post are you adding?", type: "category", options: ["Notes", "Thoughts", "Books", "Links"] }]);
          setBlogData({ title: "", content: "", category: "", link: "" });
        }
        break;

      default:
        break;
    }
  };

  const triggerPipelineUpload = async (authPass: string, finalData: any) => {
    setIsSubmitting(true);
    setMessages(prev => [...prev, {
      id: "loading",
      sender: "bot",
      text: "Initiating Antigravity Pipeline... Committing to GitHub."
    }]);

    try {
      const { ok, status, data } = await apiFetch(API_ROUTES.saveBlog, { password: authPass, blogData: finalData });

      setMessages(prev => prev.filter(m => m.id !== "loading"));

      if (ok) {
        setMessages(prev => [...prev, { id: "success", sender: "bot", text: "Success! Post committed to GitHub. Deployment is batched — no rebuild spam.", type: "success" }]);
        if (onSuccessPayload) onSuccessPayload({ ...finalData, id: Date.now(), date: new Date().toISOString() });
      } else if (status === 429) {
        const retryAfter = (data as any).retryAfter || 30;
        setMessages(prev => [...prev, { id: "ratelimit", sender: "bot", text: `⏳ Rate limited — wait ${retryAfter}s before submitting again.`, type: "error" }]);
      } else {
        setMessages(prev => [...prev, { id: "fail", sender: "bot", text: `Upload Failed: ${(data as any).error}`, type: "error" }]);
      }
    } catch (err: any) {
      setMessages(prev => prev.filter(m => m.id !== "loading"));
      setMessages(prev => [...prev, { id: "fail", sender: "bot", text: `Network Error: ${err.message}`, type: "error" }]);
    }

    setIsSubmitting(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputValue);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 sm:right-10 flex flex-col w-[calc(100vw-3rem)] sm:w-[400px] h-[550px] border border-border/50 bg-background/95 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl z-50 pointer-events-auto"
          >
            {/* Header */}
            <div className="bg-muted/30 border-b border-border/50 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="text-primary w-5 h-5" />
                <h3 className="font-heading font-medium text-sm">CMS Antigravity Engine</h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground bg-primary/10 px-2 py-1 rounded-full">
                  <Lock className="w-3 h-3 text-primary" /> Node
                </div>
                <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-muted text-muted-foreground transition-colors hidden sm:block">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                    msg.sender === "user" 
                      ? "bg-primary text-primary-foreground rounded-tr-sm" 
                      : "bg-muted/60 text-foreground rounded-tl-sm border border-border/50"
                  }`}>
                    
                    {msg.type === "success" && <CheckCircle2 className="w-4 h-4 mb-2 text-green-500" />}
                    {msg.type === "error" && <ShieldAlert className="w-4 h-4 mb-2 text-destructive" />}

                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    
                    {/* Render quick options if bot provides them */}
                    {msg.options && msg.sender === "bot" && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {msg.options.map(opt => (
                          <button 
                            key={opt}
                            onClick={() => handleSend(opt)}
                            className="text-xs px-3 py-1.5 rounded-full border border-primary/40 text-primary hover:bg-primary/10 transition-colors font-medium bg-background"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted text-foreground rounded-2xl rounded-tl-sm px-4 py-3 border border-border/50">
                     <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border/50 bg-background">
              <div className="flex items-end gap-2 px-3 py-2 bg-muted/30 border border-border/50 rounded-xl focus-within:border-primary/50 transition-colors">
                {currentExpectedType === "content" ? (
                   <textarea
                    className="flex-1 bg-transparent border-none text-sm focus:outline-none resize-none max-h-[120px]"
                    rows={4}
                    placeholder="Type markdown or text..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isSubmitting || isTyping}
                   />
                ) : (
                   <input
                    type={currentExpectedType === "password" ? "password" : "text"}
                    className="flex-1 bg-transparent border-none text-sm focus:outline-none min-h-[40px]"
                    placeholder={currentExpectedType === "confirm" ? "Confirm or Reset..." : "Type your response..."}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isSubmitting || isTyping}
                  />
                )}
                
                <button 
                  onClick={() => handleSend(inputValue)}
                  disabled={!inputValue.trim() || isSubmitting || isTyping}
                  className="p-2 mb-1 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors shadow-md"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <div className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 z-50 pointer-events-auto">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 ${
            isOpen ? "bg-muted border border-border/50 text-foreground rotate-90" : "bg-primary text-primary-foreground hover:scale-105"
          }`}
        >
          {isOpen ? <X size={24} /> : <MessageSquarePlus size={24} />}
        </button>
      </div>
    </>
  );
}
