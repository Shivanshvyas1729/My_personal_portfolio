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
 * Generate a dense vector embedding for the query using the OpenAI API.
 */
async function embedQuery(text: string, apiKey: string, baseUrl: string): Promise<number[]> {
  const url = `${baseUrl}/embeddings`;
  
  const res = await fetch(url, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: text
    }),
    signal: AbortSignal.timeout(5000), // 5-second timeout
  });

  if (!res.ok) {
    throw new Error(`OpenAI embedding failed with HTTP ${res.status}`);
  }

  const data = await res.json();
  if (!data.data?.[0]?.embedding) {
    throw new Error("Invalid response format from OpenAI embeddings API");
  }
  return data.data[0].embedding;
}

/**
 * Calculates dot product similarity between two dense vectors.
 * OpenAI embeddings are unit-normalized, so dot product equals cosine similarity.
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
 * Retrieve the top-K relevant chunks from the loaded database based on similarity.
 */
async function retrieveContext(queryVector: number[]): Promise<string> {
  const db = await getVectorDb();
  
  const scored = db.map(item => ({
    text: item.text,
    score: cosineSimilarity(queryVector, item.embedding),
    source: item.metadata?.source || "unknown"
  }));

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  // Take top 4 most relevant chunks
  const topK = scored.slice(0, 4);
  logger.info("RAGService", `Retrieved top chunks with similarity scores: ${topK.map(t => `${t.source}(${t.score.toFixed(3)})`).join(", ")}`);
  
  return topK.map(item => item.text).join("\n\n---\n\n");
}

/**
 * Request text generation from OpenAI gpt-4o-mini with context injected into the prompt.
 */
async function generateRAGAnswer(message: string, context: string, apiKey: string, baseUrl: string, maxTokens?: number): Promise<string> {
  const prompt = `You are a helpful, professional AI assistant for a portfolio website. Answer the user's question using the retrieved context from the owner's projects, experience, skills, and resume.

Context:
${context}

User Question: ${message}

Instructions:
- Provide a precise, accurate, and concise answer using the provided context.
- If the context doesn't contain the answer, say "I don't have that specific information in my database, but here is what I know:" and then answer as best as you can or guide them on how to contact the owner.
- Maintain a friendly, direct tone. Use markdown formatting.`;

  const url = `${baseUrl}/chat/completions`;
  const res = await fetch(url, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      ...(maxTokens ? { max_completion_tokens: maxTokens } : {})
    }),
    signal: AbortSignal.timeout(10000), // 10-second timeout
  });

  if (!res.ok) {
    throw new Error(`OpenAI chat completions returned HTTP ${res.status}`);
  }

  const data = await res.json();
  const answer = data.choices?.[0]?.message?.content;
  if (typeof answer !== "string") {
    throw new Error("Invalid response candidate format from OpenAI");
  }
  return answer;
}

/**
 * Main retrieval-augmented generation response generator.
 * Automatically throws descriptive errors on failure to allow seamless fallback.
 */
export async function getRAGResponse(message: string, maxTokens?: number): Promise<string | null> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const baseUrl = import.meta.env.VITE_OPENAI_BASE_URL || "https://api.openai.com/v1";

  if (!apiKey) {
    logger.warn("RAGService", "No VITE_OPENAI_API_KEY found in environment variables. Falling back to local chatbot.");
    return null;
  }

  logger.info("RAGService", `Initiating RAG pipeline for query: "${message}"`);
  
  try {
    // 1. Fetch vector db
    const db = await getVectorDb();
    logger.info("RAGService", `Loaded vector database containing ${db.length} entries.`);

    // 2. Generate embedding for query
    logger.info("RAGService", "Generating embedding for query...");
    const queryVector = await embedQuery(message, apiKey, baseUrl);

    // 3. Retrieve most relevant context
    logger.info("RAGService", "Retrieving context chunks via similarity search...");
    const context = await retrieveContext(queryVector);

    // 4. Generate RAG response
    logger.info("RAGService", "Requesting LLM generation with context...");
    const response = await generateRAGAnswer(message, context, apiKey, baseUrl, maxTokens);
    
    logger.info("RAGService", "RAG pipeline executed successfully.");
    return response;
  } catch (err: any) {
    logger.error("RAGService", "RAG pipeline failed.", err);
    throw err; // Bubbled up to trigger fallback handling in chatService
  }
}
