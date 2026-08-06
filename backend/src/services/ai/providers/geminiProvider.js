class GeminiProvider {
  constructor() {
    this.name = "gemini";
    this.apiKey = process.env.GEMINI_API_KEY;
    if (!this.apiKey) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }
    // import { GoogleGenerativeAI } from "@google/generative-ai";
    // this.genAI = new GoogleGenerativeAI(this.apiKey);
  }

  async generateText(prompt) {
    // const model = this.genAI.getGenerativeModel({ model: "gemini-pro"});
    // const result = await model.generateContent(prompt);
    // const response = await result.response;
    // return response.text();

    throw new Error("GeminiProvider is architected but not installed. Use mock.");
  }
}

export default GeminiProvider;
