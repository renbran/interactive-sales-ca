// OpenAI API integration for Scholarix Interactive Sales Assistant
// This service handles communication with OpenAI for AI-powered features

export interface OpenAIConfig {
  apiKey: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class OpenAIService {
  private config: OpenAIConfig;

  constructor(config: OpenAIConfig) {
    this.config = {
      temperature: 0.7,
      maxTokens: 2048,
      ...config
    };
  }

  async generateCompletion(prompt: string): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'No response generated';
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  async chatCompletion(messages: ChatMessage[]): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages,
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'No response generated';
    } catch (error) {
      console.error('Error calling OpenAI chat API:', error);
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
As a professional sales analyst, generate a concise call summary for a sales call with the following details:

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

Keep it under 200 words and use bullet points for clarity.
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
Based on this sales call outcome, suggest 3 specific follow-up actions for a sales rep:

Prospect: ${callData.prospectInfo.name} from ${callData.prospectInfo.company}
Industry: ${callData.prospectInfo.industry}
Call Outcome: ${callData.outcome}

Qualification:
- Pain Point Identified: ${callData.qualification.painPointIdentified ? 'Yes' : 'No'}
- Value Acknowledged: ${callData.qualification.valueAcknowledged ? 'Yes' : 'No'}

Provide exactly 3 actionable follow-up suggestions, each on a separate line starting with a number (1., 2., 3.).
Keep each suggestion under 50 words and make them specific and actionable.

Format:
1. [First suggestion]
2. [Second suggestion]
3. [Third suggestion]
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

Keep response under 150 words and use a conversational, professional tone.
`;

    return this.generateCompletion(prompt);
  }
}

// Default configuration - update these values for your OpenAI setup
const defaultConfig: OpenAIConfig = {
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 2048,
};

// Export singleton instance
export const aiService = new OpenAIService(defaultConfig);

// Export for custom configurations
export { OpenAIService };

// Health check function
export async function checkAIHealth(): Promise<boolean> {
  try {
    if (!defaultConfig.apiKey) {
      return false;
    }
    
    // Simple test call to verify API key works
    await aiService.generateCompletion('Test');
    return true;
  } catch {
    return false;
  }
}