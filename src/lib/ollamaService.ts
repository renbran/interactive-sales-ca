// Ollama API integration for Scholarix Interactive Sales Assistant
// This service handles communication with Ollama for AI-powered features

export interface OllamaConfig {
  baseUrl: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface OllamaResponse {
  response: string;
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class OllamaService {
  private config: OllamaConfig;

  constructor(config: OllamaConfig) {
    this.config = {
      temperature: 0.7,
      maxTokens: 2048,
      ...config
    };
  }

  async generateCompletion(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          prompt,
          temperature: this.config.temperature,
          stream: false,
          options: {
            num_predict: this.config.maxTokens,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data: OllamaResponse = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error calling Ollama API:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  async chatCompletion(messages: ChatMessage[]): Promise<string> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          messages,
          temperature: this.config.temperature,
          stream: false,
          options: {
            num_predict: this.config.maxTokens,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data: { message: { content: string } } = await response.json();
      return data.message.content;
    } catch (error) {
      console.error('Error calling Ollama chat API:', error);
      throw new Error('Failed to generate AI chat response');
    }
  }

  // Generate call summary using AI
  async generateCallSummary(callData: {
    prospectInfo: any;
    duration: number;
    outcome: string;
    qualification: any;
    scriptPath: string[];
  }): Promise<string> {
    const prompt = `
Generate a professional call summary for a sales call with the following details:

Prospect: ${callData.prospectInfo.name}
Company: ${callData.prospectInfo.company}
Industry: ${callData.prospectInfo.industry}
Call Duration: ${Math.round(callData.duration / 60)} minutes
Outcome: ${callData.outcome}
Call Path: ${callData.scriptPath.join(' → ')}

Qualification Status:
- Uses Manual Process: ${callData.qualification.usesManualProcess ? 'Yes' : 'No'}
- Pain Point Identified: ${callData.qualification.painPointIdentified ? 'Yes' : 'No'}
- Pain Quantified: ${callData.qualification.painQuantified ? 'Yes' : 'No'}
- Value Acknowledged: ${callData.qualification.valueAcknowledged ? 'Yes' : 'No'}
- Time Committed: ${callData.qualification.timeCommitted ? 'Yes' : 'No'}

Please provide a concise, professional summary including:
1. Key discussion points
2. Prospect's main pain points
3. Next steps
4. Overall call assessment

Keep it under 200 words.
`;

    return this.generateCompletion(prompt);
  }

  // Generate personalized follow-up suggestions
  async generateFollowUpSuggestions(callData: {
    prospectInfo: any;
    outcome: string;
    qualification: any;
  }): Promise<string[]> {
    const prompt = `
Based on this sales call outcome, suggest 3 specific follow-up actions:

Prospect: ${callData.prospectInfo.name} from ${callData.prospectInfo.company}
Industry: ${callData.prospectInfo.industry}
Call Outcome: ${callData.outcome}

Qualification:
- Pain Point Identified: ${callData.qualification.painPointIdentified ? 'Yes' : 'No'}
- Value Acknowledged: ${callData.qualification.valueAcknowledged ? 'Yes' : 'No'}

Provide 3 actionable follow-up suggestions, each on a separate line starting with a number.
Keep each suggestion under 50 words.
`;

    const response = await this.generateCompletion(prompt);
    return response.split('\n').filter(line => line.trim().match(/^\d+\./)).slice(0, 3);
  }

  // Generate objection handling suggestions
  async generateObjectionResponse(objection: string, context: {
    industry: string;
    painPoint?: string;
  }): Promise<string> {
    const prompt = `
As a sales expert for Odoo ERP solutions targeting ${context.industry} businesses, provide a professional response to this objection:

Objection: "${objection}"

Context:
- Industry: ${context.industry}
- Pain Point: ${context.painPoint || 'Manual processes and inefficiencies'}

Provide a respectful, persuasive response that:
1. Acknowledges their concern
2. Addresses the objection directly
3. Redirects to value proposition
4. Ends with a soft close question

Keep response under 150 words and conversational in tone.
`;

    return this.generateCompletion(prompt);
  }
}

// Default configuration - update these values for your Ollama setup
const defaultConfig: OllamaConfig = {
  baseUrl: import.meta.env.VITE_OLLAMA_BASE_URL || 'http://localhost:11434',
  model: import.meta.env.VITE_OLLAMA_MODEL || 'llama3.1:8b',
  temperature: 0.7,
  maxTokens: 2048,
};

// Export singleton instance
export const ollamaService = new OllamaService(defaultConfig);

// Export for custom configurations
export { OllamaService };

// Health check function
export async function checkOllamaHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${defaultConfig.baseUrl}/api/tags`);
    return response.ok;
  } catch {
    return false;
  }
}