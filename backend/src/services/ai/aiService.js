import MockProvider from "./providers/mockProvider.js";
import OpenAIProvider from "./providers/openaiProvider.js";
import GeminiProvider from "./providers/geminiProvider.js";
import { aiQueue } from "../../config/bullmq.js";

class AIService {
  constructor() {
    this.provider = this._initializeProvider();
  }

  _initializeProvider() {
    const requestedProvider = process.env.AI_PROVIDER || "mock";
    try {
      if (requestedProvider === "openai") return new OpenAIProvider();
      if (requestedProvider === "gemini") return new GeminiProvider();
    } catch (error) {
      console.warn(`[AI Service] Failed to initialize ${requestedProvider} provider: ${error.message}. Falling back to MockProvider.`);
    }
    return new MockProvider();
  }

  /**
   * Internal method called by the worker to actually generate text.
   * Controllers NEVER call this.
   */
  async generateText(prompt) {
    const startTime = Date.now();
    try {
      const result = await this.provider.generateText(prompt);
      const processingTime = Date.now() - startTime;
      return { result, provider: this.provider.name, processingTime };
    } catch (error) {
      console.error("[AI Service] Inference failed:", error.message);
      throw error;
    }
  }

  // ---------------------------------------------------------
  // PUBLIC ORCHESTRATION METHODS (Called by Controllers)
  // ---------------------------------------------------------

  /**
   * Enqueue a job to summarize a medical record
   */
  async summarizeMedicalRecord(recordId, userId) {
    const job = await aiQueue.add("SUMMARIZE_MEDICAL_RECORD", {
      recordId,
      requestedBy: userId
    });
    return { jobId: job.id, status: "enqueued" };
  }

  /**
   * Enqueue a job to explain a lab report
   */
  async explainLabReport(reportId, userId) {
    const job = await aiQueue.add("EXPLAIN_LAB_REPORT", {
      reportId,
      requestedBy: userId
    });
    return { jobId: job.id, status: "enqueued" };
  }

  /**
   * Placeholder for future direct text extraction
   */
  async extractTextFromImage(imageUrl) {
    const job = await aiQueue.add("OCR_DOCUMENT", {
      imageUrl
    });
    return { jobId: job.id, status: "enqueued" };
  }
}

export default new AIService();
