// OpenAI API integration for Scholarix Interactive Sales Assistant
// This service handles communication with OpenAI for AI-powered features

import {
  CallObjective,
  ProspectInfo,
  LiveCoachingInsight,
  AdaptiveScriptSuggestion,
  PerformanceCoaching
} from './types';
import { mockAIService } from './mockAIService';

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
    try {
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

      return await this.generateCompletion(prompt);
    } catch (error) {
      console.warn('OpenAI API unavailable, using fallback AI service');
      return await mockAIService.generateCallSummary(callData);
    }
  }

  // Generate personalized follow-up suggestions
  async generateFollowUpSuggestions(callData: {
    prospectInfo: any;
    outcome: string;
    qualification: any;
  }): Promise<string[]> {
    try {
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
    } catch (error) {
      console.warn('OpenAI API unavailable, using fallback AI service');
      return await mockAIService.generateFollowUpSuggestions(callData);
    }
  }

  // Generate objection handling suggestions
  async generateObjectionResponse(objection: string, context: {
    industry: string;
    painPoint?: string;
  }): Promise<string> {
    try {
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

      return await this.generateCompletion(prompt);
    } catch (error) {
      console.warn('OpenAI API unavailable, using fallback AI service');
      return await mockAIService.generateObjectionResponse(objection, context);
    }
  }

  // Live coaching: Analyze prospect response and provide real-time coaching
  async analyzeLiveResponse(responseData: {
    prospectResponse: string;
    callPhase: string;
    scriptContent: string;
    prospectInfo: any;
    conversationHistory?: string[];
  }): Promise<LiveCoachingInsight> {
    const prompt = `
As an expert sales coach for Odoo ERP solutions, analyze this live prospect response and provide immediate coaching:

CALL CONTEXT:
- Phase: ${responseData.callPhase}
- Prospect: ${responseData.prospectInfo.name} (${responseData.prospectInfo.company})
- Industry: ${responseData.prospectInfo.industry}
- Current Script: ${responseData.scriptContent.substring(0, 200)}...

PROSPECT'S RESPONSE: "${responseData.prospectResponse}"

PREVIOUS CONVERSATION:
${responseData.conversationHistory ? responseData.conversationHistory.slice(-3).join('\n') : 'None'}

Provide coaching in JSON format:
{
  "responseType": "positive|negative|neutral|objection|buying_signal|concern",
  "sentiment": "enthusiastic|interested|skeptical|resistant|confused",
  "coachingTip": "Specific actionable advice for the salesperson (max 60 words)",
  "nextBestAction": "What to do next (max 40 words)",
  "detectedSignals": ["buying_signal1", "concern1", "objection1"],
  "suggestedFollow up": "Specific follow-up question or statement",
  "urgencyLevel": "low|medium|high",
  "confidence": 0.95
}

Focus on actionable, specific coaching that helps close the deal.
`;

    try {
      const response = await this.generateCompletion(prompt);
      const parsed = JSON.parse(response);
      return parsed as LiveCoachingInsight;
    } catch (error) {
      console.error('Error parsing live coaching response:', error);
      // Return fallback coaching
      return {
        responseType: 'neutral',
        sentiment: 'skeptical',
        coachingTip: 'Listen actively and ask clarifying questions to better understand their needs.',
        nextBestAction: 'Continue with the next part of your script.',
        detectedSignals: [],
        suggestedFollowUp: 'What questions do you have about this?',
        urgencyLevel: 'medium',
        confidence: 0.5
      };
    }
  }

  // Generate adaptive script suggestions based on prospect responses
  async generateAdaptiveScript(context: {
    currentPhase: string;
    prospectResponse: string;
    prospectInfo: any;
    detectedSignals: string[];
  }): Promise<AdaptiveScriptSuggestion> {
    const prompt = `
As a sales script expert, adapt the conversation flow based on this prospect response:

CONTEXT:
- Current Phase: ${context.currentPhase}
- Prospect Response: "${context.prospectResponse}"
- Company: ${context.prospectInfo.company}
- Industry: ${context.prospectInfo.industry}
- Detected Signals: ${context.detectedSignals.join(', ')}

Generate an adaptive script suggestion in JSON format:
{
  "suggestedScript": "Personalized script text with [NAME] placeholders",
  "reasoning": "Why this approach is recommended",
  "alternativeApproach": "Backup approach if the main one doesn't work",
  "keyPoints": ["point1", "point2", "point3"],
  "transitionPhase": "next_phase_if_successful",
  "timeToSpend": "30-60 seconds",
  "successMetrics": "What to listen for to know it's working"
}

Make it conversational, industry-specific, and focused on moving toward a demo.
`;

    try {
      const response = await this.generateCompletion(prompt);
      return JSON.parse(response) as AdaptiveScriptSuggestion;
    } catch (error) {
      console.error('Error generating adaptive script:', error);
      return {
        suggestedScript: "That's a great point, [NAME]. Let me ask you this - what would it mean for [COMPANY] if we could solve that challenge for you?",
        reasoning: "Generic follow-up question to maintain conversation flow",
        alternativeApproach: "Ask about their current process and pain points",
        keyPoints: ["Listen actively", "Ask clarifying questions", "Connect to value proposition"],
        transitionPhase: "discovery",
        timeToSpend: "30-60 seconds",
        successMetrics: "Prospect shares more details about their challenges"
      };
    }
  }

  // Real-time performance coaching during the call
  async generatePerformanceCoaching(callMetrics: {
    talkTimeRatio: number; // 0.0 to 1.0 (1.0 = rep talked 100% of time)
    questionsAsked: number;
    objectionCount: number;
    callDuration: number; // in seconds
    currentPhase: string;
    prospectEngagement: 'low' | 'medium' | 'high';
  }): Promise<PerformanceCoaching> {
    const prompt = `
As a sales performance coach, analyze these real-time call metrics and provide coaching:

CALL METRICS:
- Talk Time Ratio: ${(callMetrics.talkTimeRatio * 100).toFixed(1)}% (rep speaking)
- Questions Asked: ${callMetrics.questionsAsked}
- Objections Raised: ${callMetrics.objectionCount}
- Call Duration: ${Math.floor(callMetrics.callDuration / 60)} minutes
- Current Phase: ${callMetrics.currentPhase}
- Prospect Engagement: ${callMetrics.prospectEngagement}

Provide performance coaching in JSON format:
{
  "overallScore": 8.5,
  "primaryFeedback": "Main coaching point (max 50 words)",
  "specificImprovements": ["improvement1", "improvement2"],
  "strengths": ["strength1", "strength2"],
  "nextFocusArea": "What to focus on next",
  "adjustmentNeeded": "immediate|minor|none",
  "suggestedTechnique": "Specific technique to try",
  "warningFlag": "Any red flags to address immediately"
}

Focus on actionable, real-time adjustments.
`;

    try {
      const response = await this.generateCompletion(prompt);
      return JSON.parse(response) as PerformanceCoaching;
    } catch (error) {
      console.error('Error generating performance coaching:', error);
      return {
        overallScore: 7.0,
        primaryFeedback: "Focus on asking more questions to engage the prospect better.",
        specificImprovements: ["Ask more open-ended questions", "Listen more actively"],
        strengths: ["Good call structure", "Professional tone"],
        nextFocusArea: "Increase prospect engagement",
        adjustmentNeeded: "minor",
        suggestedTechnique: "Use the SPIN questioning technique",
        warningFlag: callMetrics.talkTimeRatio > 0.7 ? "Talking too much - let prospect speak more" : ""
      };
    }
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
    if (!defaultConfig.apiKey || 
        defaultConfig.apiKey === 'your_openai_api_key_here' ||
        defaultConfig.apiKey === 'sk-your-openai-api-key-here') {
      // In production, environment variables might be set via secrets
      // Return true to allow trying the API call
      return import.meta.env.PROD;
    }
    
    // Simple test call to verify API key works
    const testResponse = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${defaultConfig.apiKey}`,
      },
    });
    
    return testResponse.ok;
  } catch (error) {
    console.warn('AI health check failed:', error);
    // In production, still return true to allow trying
    return import.meta.env.PROD;
  }
}