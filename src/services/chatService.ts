import { portfolioData } from "@/data/portfolioData";
import { logger } from "@/utils/logger";
import { logger as auditLogger } from "@/lib/logger";

import { getRAGResponse } from "./ragService";

// ============================================================
// CONTEXT BUILDER (sent to local fallback models as system context)
// ============================================================
export const buildPortfolioContext = (): string => {
  const d = portfolioData;

  const projects = (d.projects || [])
    .map(p => `  - ${p.title}: ${p.description} [Tech: ${p.tech?.join(", ")}]${p.live && p.live !== "#" ? ` [Live: ${p.live}]` : ""}`)
    .join("\n");

  const skills = (d.skills?.categories || [])
    .map(c => `  ${c.title}: ${c.items.join(", ")}`)
    .join("\n");

  const experience = (d.experience || [])
    .map(e => `  ${e.title} @ ${e.company} (${e.duration}): ${e.description}`)
    .join("\n");

  const education = (d.education || [])
    .map(e => `  ${e.degree} — ${e.institution} (${e.year})`)
    .join("\n");

  return `
PORTFOLIO OWNER: ${d.personal?.name} | ${d.personal?.title}
LOCATION: ${d.personal?.location}
EMAIL: ${d.personal?.email}

PROJECTS:
${projects}

SKILLS:
${skills}

EXPERIENCE:
${experience}

EDUCATION:
${education}

ABOUT:
${d.about?.description}
`.trim();
};

// ============================================================
// BACKEND CALL  →  POST to secondary fallback model if configured
// Returns null if the backend is unavailable or errors out.
// ============================================================
const callBackend = async (message: string): Promise<string | null> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    const fullMessage = `System Context:\n${buildPortfolioContext()}\n\nUser: ${message}`;
    
    const res = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullMessage }] }]
      }),
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (typeof text !== "string") {
      return null;
    }

    return text;
  } catch {
    return null;
  }
};

// ============================================================
// MOCK AI  (active when backend is not configured or fails)
// ============================================================
const mockAI = async (message: string): Promise<string> => {
  await new Promise(r => setTimeout(r, 500 + Math.random() * 600));

  const d = portfolioData;
  const msg = message.toLowerCase();

  // ===============================
  // NAME
  // ===============================
  if (msg.match(/your name|who are you|name/)) {
    return `My name is **${d.personal?.name}**.`;
  }

  // ===============================
  // LOCATION
  // ===============================
  if (msg.match(/where.*live|location|from/)) {
    return `I am based in **${d.personal?.location}**.`;
  }

  // ===============================
  // SPECIFIC PROJECT
  // ===============================
  const project = (d.projects || []).find(p =>
    msg.includes(p.title.toLowerCase())
  );

  if (project) {
    return `**${project.title}**

${project.description}

Tech: ${project.tech?.join(", ")}${
      project.live && project.live !== "#"
        ? `

🔗 [Live Demo](${project.live})`
        : ""
    }`;
  }

  // ===============================
  // PROJECTS OVERVIEW
  // ===============================
  if (msg.match(/project|portfolio|work|built|app/)) {
    const list = (d.projects || [])
      .slice(0, 3)
      .map(p => `• **${p.title}** — ${p.description}`)
      .join("\n");
    return `Here are some of my featured projects:\n\n${list}\n\nScroll down to the Projects section to see more!`;
  }

  // ===============================
  // SKILLS
  // ===============================
  if (msg.match(/skill|tech|stack|language|framework|python|react|typescript|node/)) {
    const all = (d.skills?.categories || []).flatMap(c => c.items);
    const top = all.slice(0, 8).join(", ");
    return `My key technical skills include: **${top}**, and more. Check out the Skills section for the full matrix!`;
  }

  // ===============================
  // EXPERIENCE
  // ===============================
  if (msg.match(/experience|job|role|work history|career/)) {
    const latest = d.experience?.[0];
    if (latest) {
      return `My most recent role is **${latest.title}** at **${latest.company}** (${latest.duration}).\n\n${latest.description}`;
    }
  }

  // ===============================
  // EDUCATION
  // ===============================
  if (msg.match(/degree|university|college|education|study|graduat/)) {
    const edu = d.education?.[0];
    if (edu) {
      return `I studied **${edu.degree}** at **${edu.institution}** (${edu.year}).`;
    }
  }

  // ===============================
  // CONTACT
  // ===============================
  if (msg.match(/contact|email|reach|hire|touch|message/)) {
    return `You can reach me at **${d.personal?.email}** or connect via [LinkedIn](${d.personal?.linkedin}) or [GitHub](${d.personal?.github}). Or just fill out the Contact form below!`;
  }

  // ===============================
  // GREETINGS
  // ===============================
  if (msg.match(/^(hi|hello|hey|greetings|namaste|hola)/)) {
    return `Hello! How can I help you today? You can ask about my projects, skills, experience, or how to get in touch.`;
  }

  // ===============================
  // FALLBACK
  // ===============================
  return `Thanks for your question! I'm an AI assistant trained on **${d.personal?.name}**'s portfolio. 

You can ask me about:
• **Projects** — e.g. "What projects have you built?"
• **Skills** — e.g. "What tech stack do you use?"
• **Experience** — e.g. "Tell me about your work experience"
• **Contact** — e.g. "How can I email you?"`;
};

// ============================================================
// MAIN ENTRY POINT  ← UI calls only this, nothing else changes
// Priority: RAG Chatbot (YAML & PDF Context) → Local Chatbot fallback
// ============================================================
export const getChatResponse = async (
  message: string,
  chatbotWorkMode?: 'offline' | 'online' | 'auto',
  chatbotMaxTokens?: number,
  chatbotModel?: string,
  chatbotBaseUrl?: string
): Promise<string> => {
  const mode = chatbotWorkMode || 'auto';

  // 1. Offline Mode: Go straight to local backend/mock
  if (mode === 'offline') {
    logger.info("ChatService", "Offline mode active. Bypassing RAG database.");
    auditLogger.addLog({
      action: "CHATBOT_OFFLINE",
      status: "pending",
      message: `Offline mode query: "${message.substring(0, 60)}${message.length > 60 ? '...' : ''}"`,
      metadata: { query: message }
    });
    const backendResponse = await callBackend(message);
    if (backendResponse !== null) {
      auditLogger.addLog({
        action: "CHATBOT_OFFLINE",
        status: "success",
        message: "Offline local model query successful",
        metadata: { response: backendResponse }
      });
      return backendResponse;
    }
    const mockResponse = await mockAI(message);
    auditLogger.addLog({
      action: "CHATBOT_OFFLINE",
      status: "success",
      message: "Offline rule assistant fallback successful",
      metadata: { response: mockResponse }
    });
    return mockResponse;
  }

  // 2. Online / Auto Modes: Try RAG first
  try {
    const resolvedBaseUrl = (chatbotBaseUrl && chatbotBaseUrl.trim() && chatbotBaseUrl.trim() !== "https://api.openai.com/v1" ? chatbotBaseUrl.trim() : "") || import.meta.env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1';
    const resolvedModel = (chatbotModel && chatbotModel.trim() && chatbotModel.trim() !== "gpt-4o-mini" ? chatbotModel.trim() : "") || import.meta.env.VITE_OPENAI_MODEL || 'gpt-4.1-nano';
    const ragResponse = await getRAGResponse(message, chatbotMaxTokens, chatbotModel, chatbotBaseUrl);
    if (ragResponse !== null) {
      auditLogger.addLog({
        action: "CHATBOT_RAG",
        status: "success",
        message: `RAG search successful. Model: ${resolvedModel}`,
        metadata: { 
          query: message, 
          model: resolvedModel, 
          baseUrl: resolvedBaseUrl,
          response: ragResponse
        }
      });
      return ragResponse;
    }
    // If ragResponse is null, it means the API key is not configured.
    if (mode === 'online') {
      const errMsg = "VITE_OPENAI_API_KEY is not set in environment variables or project secrets.";
      auditLogger.addLog({
        action: "CHATBOT_ERROR",
        status: "error",
        message: `RAG service unavailable: ${errMsg}`,
        metadata: { model: resolvedModel, baseUrl: resolvedBaseUrl }
      });
      return "⚠️ Chatbot is configured to work in Online-Only mode, but the RAG completion service is currently unavailable.\n\n**Error details:** VITE_OPENAI_API_KEY is not set in environment variables or project secrets.";
    }
  } catch (err: any) {
    const resolvedBaseUrl = (chatbotBaseUrl && chatbotBaseUrl.trim() && chatbotBaseUrl.trim() !== "https://api.openai.com/v1" ? chatbotBaseUrl.trim() : "") || import.meta.env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1';
    const resolvedModel = (chatbotModel && chatbotModel.trim() && chatbotModel.trim() !== "gpt-4o-mini" ? chatbotModel.trim() : "") || import.meta.env.VITE_OPENAI_MODEL || 'gpt-4.1-nano';
    auditLogger.addLog({
      action: "CHATBOT_ERROR",
      status: "error",
      message: `RAG pipeline encountered an error: ${err.message || err}`,
      metadata: { 
        query: message, 
        model: resolvedModel, 
        baseUrl: resolvedBaseUrl,
        error: err.stack || err.message || String(err)
      }
    });

    if (err.message && err.message.includes("No FAISS vector database found")) {
      logger.warn("ChatService", "RAG FAISS vector database is missing.");
      if (mode === 'online') {
        return "⚠️ No FAISS vector database found. Please run the `build_knowledge_base.ipynb` Jupyter notebook to compile and embed your portfolio data before using the RAG chatbot.";
      }
    }
    logger.error("ChatService", "RAG pipeline encountered an error.", err);

    // If online-only, do NOT fall back to local model
    if (mode === 'online') {
      return `⚠️ Chatbot is configured to work in Online-Only mode, but the RAG completion service is currently unavailable.\n\n**Error details:** ${err.message || err}`;
    }
  }

  // 3. Auto Mode fallback: call offline rule assistant
  logger.info("ChatService", "Falling back to offline assistant.");
  auditLogger.addLog({
    action: "CHATBOT_FALLBACK",
    status: "pending",
    message: "Falling back to offline rule assistant",
    metadata: { query: message }
  });

  const backendResponse = await callBackend(message);
  if (backendResponse !== null) {
    auditLogger.addLog({
      action: "CHATBOT_FALLBACK",
      status: "success",
      message: "Fallback model query successful",
      metadata: { response: backendResponse }
    });
    return backendResponse;
  }

  const mockResponse = await mockAI(message);
  auditLogger.addLog({
    action: "CHATBOT_FALLBACK",
    status: "success",
    message: "Fallback to offline rule assistant successful",
    metadata: { response: mockResponse }
  });
  return mockResponse;
};
