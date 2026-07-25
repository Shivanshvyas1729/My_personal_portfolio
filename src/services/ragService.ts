import { logger } from "@/utils/logger";

let vectorDbCache: any[] | null = null;

/**
 * Fetch and load the vector database JSON file from the assets folder.
 * Throws a descriptive error if the database file is missing or unreadable.
 */
async function getVectorDb(): Promise<any[]> {
  if (vectorDbCache) return vectorDbCache;

  try {
    const res = await fetch("/data/knowledge/faiss_index.json");
    if (!res.ok) {
      throw new Error("No FAISS vector database found. Please run `build_knowledge_base.ipynb` to create the embeddings before using the RAG chatbot.");
    }
    const data = await res.json();
    if (!Array.isArray(data)) {
      throw new Error("FAISS vector database format invalid. Expected array of chunk embeddings.");
    }
    vectorDbCache = data;
    return vectorDbCache;
  } catch (err: any) {
    if (err.message && err.message.includes("build_knowledge_base.ipynb")) {
      throw err;
    }
    throw new Error("No FAISS vector database found. Please run `build_knowledge_base.ipynb` to create the embeddings before using the RAG chatbot.");
  }
}

/**
 * Generate a dense vector embedding for the query using OpenAI-compatible API.
 */
async function embedQuery(text: string, apiKey: string, baseUrl: string): Promise<number[]> {
  const res = await fetch("/api/proxy-openai", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      endpoint: "embeddings",
      payload: {
        model: "text-embedding-3-small",
        input: text
      },
      customBaseUrl: baseUrl
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    throw new Error(`Embedding API call returned HTTP ${res.status}`);
  }

  const data = await res.json();
  if (!data.data?.[0]?.embedding) {
    throw new Error("Invalid embedding response format from API provider");
  }
  return data.data[0].embedding;
}

/**
 * Calculates dot product similarity between two dense vectors.
 */
function cosineSimilarity(a: number[], b: number[]): number {
  let sum = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    sum += a[i] * b[i];
  }
  return sum;
}

/**
 * Retrieve the top-K relevant chunks from vector database based on similarity vector.
 */
async function retrieveContext(queryVector: number[]): Promise<string> {
  const db = await getVectorDb();
  
  const scored = db.map(item => ({
    text: item.text,
    score: cosineSimilarity(queryVector, item.embedding),
    source: item.metadata?.source || "unknown"
  }));

  scored.sort((a, b) => b.score - a.score);
  const topK = scored.slice(0, 4);
  logger.info("RAGService", `Retrieved vector chunks with similarity scores: ${topK.map(t => `${t.source}(${t.score.toFixed(3)})`).join(", ")}`);
  
  return topK.map(item => item.text).join("\n\n---\n\n");
}

/**
 * Fallback similarity retrieval using term-frequency / keyword overlap
 * when vector embedding endpoints are unhosted or unsupported by a custom provider.
 */
async function retrieveContextByKeyword(query: string): Promise<string> {
  const db = await getVectorDb();
  const terms = query.toLowerCase().split(/\W+/).filter(t => t.length > 2);
  
  const scored = db.map(item => {
    const textLower = (item.text || "").toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (textLower.includes(term)) {
        score += 1;
      }
    }
    return {
      text: item.text,
      score,
      source: item.metadata?.source || "unknown"
    };
  });

  scored.sort((a, b) => b.score - a.score);
  const topK = scored.slice(0, 4);
  logger.info("RAGService", `Retrieved keyword fallback chunks: ${topK.map(t => `${t.source}(score:${t.score})`).join(", ")}`);
  return topK.map(item => item.text).join("\n\n---\n\n");
}

/**
 * Request text generation supporting ANY model provider (OpenAI, Anthropic, DeepSeek, Gemini, Groq, Ollama, OpenRouter, Together AI, etc.)
 */
async function generateRAGAnswer(
  message: string,
  context: string,
  apiKey: string,
  baseUrl: string,
  maxTokens?: number,
  model?: string
): Promise<string> {
  const activeModel = model || "gpt-4.1-nano";
  const lowerModel = activeModel.toLowerCase();
  const isReasoningModel = lowerModel.startsWith("o1") || lowerModel.startsWith("o3") || lowerModel.includes("reasoner");

  const prompt = `You are a helpful, professional AI assistant for a portfolio website. Answer the user's question using the retrieved context from the owner's projects, experience, skills, and resume , we someone asked bad ,vulger question or question data harm me make the same more powerful reply from them .

Context:
${context}

User Question: ${message}

Instructions:
- Provide a precise, accurate, and concise answer using the provided context.
- If the context doesn't contain the answer, say "I don't have that specific information in my database, but here is what I know:" and then answer as best as you can or guide them on how to contact the owner.
- Maintain a friendly, direct tone. Use markdown formatting.`;

  const payload: any = {
    model: activeModel,
    messages: [
      {
        role: "user",
        content: prompt
      }
    ]
  };

  if (!isReasoningModel) {
    payload.temperature = 0.2;
  }

  if (maxTokens) {
    if (isReasoningModel) {
      payload.max_completion_tokens = maxTokens;
    } else {
      payload.max_tokens = maxTokens;
    }
  }

  const res = await fetch("/api/proxy-openai", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      endpoint: "chat/completions",
      payload,
      customBaseUrl: baseUrl
    }),
    signal: AbortSignal.timeout(25000), // 25-second timeout
  });

  if (!res.ok) {
    let errorDetail = "";
    try {
      errorDetail = await res.text();
    } catch {}
    throw new Error(`Chat completions returned HTTP ${res.status}: ${errorDetail}`);
  }

  const data = await res.json();
  const answer = 
    data.choices?.[0]?.message?.content || 
    data.choices?.[0]?.text || 
    data.response || 
    data.output ||
    (typeof data.result === 'string' ? data.result : null);

  if (typeof answer !== "string") {
    throw new Error(`Unexpected completion format from model provider (${activeModel})`);
  }
  return answer;
}

/**
 * Main retrieval-augmented generation response generator.
 * Universally supports all model providers and base URLs.
 */
export async function getRAGResponse(
  message: string,
  maxTokens?: number,
  chatbotModel?: string,
  chatbotBaseUrl?: string
): Promise<string | null> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const baseUrl = (chatbotBaseUrl && chatbotBaseUrl.trim() && chatbotBaseUrl.trim() !== "https://api.openai.com/v1" ? chatbotBaseUrl.trim() : "") || import.meta.env.VITE_OPENAI_BASE_URL || "https://api.openai.com/v1";

  if (!apiKey) {
    logger.warn("RAGService", "No VITE_OPENAI_API_KEY found in environment variables or secrets. Falling back to local chatbot.");
    return null;
  }

  logger.info("RAGService", `Initiating RAG pipeline for query: "${message}"`);
  
  try {
    // 1. Context retrieval (Vector embeddings with keyword fallback)
    let context = "";
    try {
      logger.info("RAGService", `Generating embedding for query at base URL: ${baseUrl}...`);
      const queryVector = await embedQuery(message, apiKey, baseUrl);
      context = await retrieveContext(queryVector);
    } catch (embedErr: any) {
      logger.warn("RAGService", `Embedding API call failed (${embedErr.message}), using keyword-based similarity search fallback.`);
      context = await retrieveContextByKeyword(message);
    }

    // 2. Generate RAG answer using user's active LLM model
    const activeModel = (chatbotModel && chatbotModel.trim() && chatbotModel.trim() !== "gpt-4o-mini" ? chatbotModel.trim() : "") || import.meta.env.VITE_OPENAI_MODEL || "gpt-4.1-nano";
    logger.info("RAGService", `Requesting LLM generation with context using model: ${activeModel}...`);
    const response = await generateRAGAnswer(message, context, apiKey, baseUrl, maxTokens, activeModel);
    
    logger.info("RAGService", "RAG pipeline executed successfully.");
    return response;
  } catch (err: any) {
    logger.error("RAGService", "RAG pipeline failed.", err);
    throw err; // Bubbled up to trigger fallback handling in chatService
  }
}
