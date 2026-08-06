class MockProvider {
  constructor() {
    this.name = "mock";
  }

  async generateText(prompt) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    return `[Mock AI Response]\nThis is a mocked AI response generated for the following prompt length: ${prompt.length} characters.\nIf this were a real integration, the AI would return meaningful insights here.`;
  }
}

export default MockProvider;
