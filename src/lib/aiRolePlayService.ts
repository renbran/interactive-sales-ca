// AI Role-Play Service - Generates realistic prospect responses for sales training

import {
  ProspectPersona,
  ProspectPersonaType,
  ConversationContext,
  AIMessage,
  AIResponse,
  PerformanceMetrics,
  CoachingHint,
  ConversationDifficulty
} from './types/aiRolePlayTypes';

// Predefined prospect personas for different training scenarios
export const PROSPECT_PERSONAS: Record<ProspectPersonaType, ProspectPersona> = {
  'eager-student': {
    id: 'eager-1',
    type: 'eager-student',
    name: 'Sarah Johnson',
    age: 22,
    background: 'Recent graduate looking to pursue Masters abroad',
    goals: ['Study in top university', 'Build international career', 'Experience new culture'],
    concerns: ['Application timeline', 'Visa process', 'Accommodation'],
    budget: 'Moderate - Can invest $30-50k',
    personality: {
      talkative: 7,
      technical: 5,
      emotional: 7,
      skeptical: 3,
      decisive: 8
    },
    preferredDestinations: ['Canada', 'Australia', 'UK'],
    objectionLikelihood: {
      cost: 0.3,
      quality: 0.2,
      timeline: 0.5,
      visa: 0.4,
      competition: 0.1
    },
    responseStyle: 'Enthusiastic and quick to respond. Asks practical questions.',
    difficulty: 'easy'
  },
  'skeptical-parent': {
    id: 'skeptical-1',
    type: 'skeptical-parent',
    name: 'Mr. Rajesh Patel',
    age: 48,
    background: 'Father concerned about daughter\'s overseas education',
    goals: ['Ensure daughter\'s safety', 'Get value for money', 'Secure good career'],
    concerns: ['High costs', 'Safety abroad', 'Quality of education', 'Return on investment'],
    budget: 'Limited - Needs to see clear value',
    personality: {
      talkative: 6,
      technical: 7,
      emotional: 5,
      skeptical: 9,
      decisive: 4
    },
    preferredDestinations: ['Canada', 'Germany', 'Ireland'],
    objectionLikelihood: {
      cost: 0.9,
      quality: 0.7,
      timeline: 0.4,
      visa: 0.6,
      competition: 0.8
    },
    responseStyle: 'Cautious, asks probing questions. Wants proof and guarantees.',
    difficulty: 'hard'
  },
  'budget-conscious': {
    id: 'budget-1',
    type: 'budget-conscious',
    name: 'Priya Sharma',
    age: 24,
    background: 'Working professional seeking affordable study options',
    goals: ['Study abroad affordably', 'Get scholarships', 'Work while studying'],
    concerns: ['Total costs', 'Hidden fees', 'Scholarship availability', 'Part-time work'],
    budget: 'Tight - Looking for most affordable options',
    personality: {
      talkative: 5,
      technical: 8,
      emotional: 4,
      skeptical: 7,
      decisive: 6
    },
    preferredDestinations: ['Germany', 'Poland', 'Malta', 'Cyprus'],
    objectionLikelihood: {
      cost: 1.0,
      quality: 0.5,
      timeline: 0.3,
      visa: 0.4,
      competition: 0.7
    },
    responseStyle: 'Direct and focused on numbers. Asks about costs repeatedly.',
    difficulty: 'medium'
  },
  'indecisive': {
    id: 'indecisive-1',
    type: 'indecisive',
    name: 'Amit Kumar',
    age: 21,
    background: 'Student unsure about study abroad vs local options',
    goals: ['Explore options', 'Understand benefits', 'Make right decision'],
    concerns: ['Making wrong choice', 'Missing out on opportunities', 'Family expectations'],
    budget: 'Flexible - But needs convincing',
    personality: {
      talkative: 8,
      technical: 5,
      emotional: 6,
      skeptical: 6,
      decisive: 2
    },
    preferredDestinations: ['Not sure', 'USA', 'UK', 'Canada'],
    objectionLikelihood: {
      cost: 0.6,
      quality: 0.5,
      timeline: 0.7,
      visa: 0.5,
      competition: 0.6
    },
    responseStyle: 'Asks many questions, circles back to same topics. Needs reassurance.',
    difficulty: 'medium'
  },
  'experienced-researcher': {
    id: 'experienced-1',
    type: 'experienced-researcher',
    name: 'Dr. Meera Reddy',
    age: 29,
    background: 'PhD holder looking for post-doctoral opportunities',
    goals: ['Find best research programs', 'Maximize career growth', 'Network internationally'],
    concerns: ['Program quality', 'Research funding', 'Visa for dependents'],
    budget: 'Well-funded - Quality matters most',
    personality: {
      talkative: 6,
      technical: 10,
      emotional: 3,
      skeptical: 8,
      decisive: 7
    },
    preferredDestinations: ['USA', 'UK', 'Germany', 'Switzerland'],
    objectionLikelihood: {
      cost: 0.3,
      quality: 0.9,
      timeline: 0.5,
      visa: 0.6,
      competition: 0.7
    },
    responseStyle: 'Very detailed questions. Wants specifics, rankings, and research data.',
    difficulty: 'expert'
  },
  'competitive-shopper': {
    id: 'competitive-1',
    type: 'competitive-shopper',
    name: 'Vikram Singh',
    age: 26,
    background: 'Comparing multiple study abroad consultants',
    goals: ['Get best deal', 'Find most services', 'Negotiate price'],
    concerns: ['Overpaying', 'Missing better offers', 'Service quality vs cost'],
    budget: 'Flexible - But wants maximum value',
    personality: {
      talkative: 7,
      technical: 6,
      emotional: 4,
      skeptical: 9,
      decisive: 5
    },
    preferredDestinations: ['Wherever best value', 'Canada', 'Australia'],
    objectionLikelihood: {
      cost: 0.8,
      quality: 0.6,
      timeline: 0.4,
      visa: 0.3,
      competition: 1.0
    },
    responseStyle: 'Mentions competitors. Asks "what makes you different?" repeatedly.',
    difficulty: 'hard'
  },
  'career-focused': {
    id: 'career-1',
    type: 'career-focused',
    name: 'Rohan Desai',
    age: 25,
    background: 'MBA aspirant focused on career outcomes',
    goals: ['Top MBA program', 'High-paying job', 'Build executive career'],
    concerns: ['ROI', 'Placement rates', 'Career services', 'Alumni network'],
    budget: 'High - Willing to invest for returns',
    personality: {
      talkative: 6,
      technical: 8,
      emotional: 4,
      skeptical: 7,
      decisive: 8
    },
    preferredDestinations: ['USA', 'UK', 'Singapore'],
    objectionLikelihood: {
      cost: 0.4,
      quality: 0.8,
      timeline: 0.5,
      visa: 0.4,
      competition: 0.6
    },
    responseStyle: 'Business-like. Wants data, ROI calculations, and success metrics.',
    difficulty: 'hard'
  },
  'visa-worried': {
    id: 'visa-1',
    type: 'visa-worried',
    name: 'Ananya Gupta',
    age: 23,
    background: 'Had previous visa rejection, now cautious',
    goals: ['Study abroad successfully', 'Get visa approved', 'Avoid rejection'],
    concerns: ['Visa rejection', 'Documentation', 'Interview', 'Past rejection impact'],
    budget: 'Moderate - But visa is priority',
    personality: {
      talkative: 6,
      technical: 5,
      emotional: 8,
      skeptical: 8,
      decisive: 5
    },
    preferredDestinations: ['Countries with high visa success', 'Ireland', 'Malta'],
    objectionLikelihood: {
      cost: 0.5,
      quality: 0.4,
      timeline: 0.4,
      visa: 1.0,
      competition: 0.3
    },
    responseStyle: 'Anxious tone. Asks many visa-related questions. Needs reassurance.',
    difficulty: 'medium'
  }
};

export type AIProvider = 'openai' | 'ollama';

export interface AIConfig {
  provider: AIProvider;
  apiKey?: string; // For OpenAI
  ollamaUrl?: string; // For Ollama (can be ngrok URL)
  model?: string;
}

class AIRolePlayService {
  private static instance: AIRolePlayService;
  private config: AIConfig = {
    provider: 'openai',
    apiKey: '',
    model: 'gpt-4'
  };

  static getInstance(): AIRolePlayService {
    if (!AIRolePlayService.instance) {
      AIRolePlayService.instance = new AIRolePlayService();
    }
    return AIRolePlayService.instance;
  }

  setConfig(config: Partial<AIConfig>) {
    this.config = { ...this.config, ...config };
  }

  // Legacy method for backward compatibility
  setApiKey(key: string) {
    this.config.apiKey = key;
  }

  getConfig(): AIConfig {
    return { ...this.config };
  }

  /**
   * Generate AI prospect response based on conversation context
   */
  async generateProspectResponse(
    context: ConversationContext,
    salespersonMessage: string
  ): Promise<AIResponse> {
    const persona = context.persona;
    const conversationHistory = this.formatConversationHistory(context.messages);

    const systemPrompt = this.buildSystemPrompt(persona, context);
    const userPrompt = this.buildUserPrompt(salespersonMessage, context);

    try {
      let aiContent: string;

      if (this.config.provider === 'ollama') {
        // Call Ollama API (local or via ngrok)
        aiContent = await this.callOllamaAPI(systemPrompt, conversationHistory, userPrompt);
      } else {
        // Call OpenAI API
        aiContent = await this.callOpenAIAPI(systemPrompt, conversationHistory, userPrompt);
      }

      // Parse response and extract metadata
      return this.parseAIResponse(aiContent, context);
    } catch (error) {
      console.error('Failed to generate AI response:', error);
      // Return fallback response
      return this.getFallbackResponse(persona, context);
    }
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAIAPI(
    systemPrompt: string,
    conversationHistory: Array<{role: string, content: string}>,
    userPrompt: string
  ): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory,
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * Call Ollama API (local or ngrok)
   */
  private async callOllamaAPI(
    systemPrompt: string,
    conversationHistory: Array<{role: string, content: string}>,
    userPrompt: string
  ): Promise<string> {
    const ollamaUrl = this.config.ollamaUrl || 'http://localhost:11434';
    
    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model || 'llama3.1:8b',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory,
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        stream: false,
        options: {
          num_predict: 300,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.message.content;
  }

  /**
   * Build system prompt based on persona
   */
  private buildSystemPrompt(persona: ProspectPersona, context: ConversationContext): string {
    return `You are role-playing as ${persona.name}, a ${persona.age}-year-old ${persona.background}.

PERSONALITY TRAITS:
- Talkativeness: ${persona.personality.talkative}/10
- Technical: ${persona.personality.technical}/10
- Emotional: ${persona.personality.emotional}/10
- Skeptical: ${persona.personality.skeptical}/10
- Decisive: ${persona.personality.decisive}/10

YOUR GOALS: ${persona.goals.join(', ')}
YOUR CONCERNS: ${persona.concerns.join(', ')}
YOUR BUDGET: ${persona.budget}

RESPONSE STYLE: ${persona.responseStyle}

REALISTIC CONVERSATION RULES:
1. Respond naturally like a REAL person having a phone conversation
2. Use casual, conversational language (e.g., "yeah", "hmm", "I see", "okay")
3. Sometimes interrupt with questions before the salesperson finishes their point
4. Show natural hesitations: "Well...", "I'm not sure about...", "That's interesting, but..."
5. Reference real-world situations: "My friend studied in Canada and said...", "I read online that..."
6. Ask practical questions: "How long will this take?", "What's the next step?", "Can I think about it?"
7. Be skeptical of claims without proof: "How do I know that?", "Do you have examples?"
8. Show emotions naturally: excitement, worry, confusion, relief
9. Change topic occasionally if you're interested in something else
10. Remember previous points mentioned and reference them

OBJECTION PATTERNS (raise these naturally based on your concerns):
${Object.entries(persona.objectionLikelihood).filter(([_, prob]) => prob > 0.6).map(([type]) => `- ${type.charAt(0).toUpperCase() + type.slice(1)}`).join('\n')}

CONVERSATION PROGRESSION:
- Phase: ${context.conversationPhase}
- If Opening: Be polite but guarded, ask "Who is this?" or "How did you get my number?"
- If Discovery: Share some info but ask questions back, don't reveal everything at once
- If Presentation: Listen but interrupt with concerns, ask "But what about..."
- If Objection-Handling: Test their answers, ask follow-up questions
- If Closing: Show hesitation, ask for time to think, or commit if truly convinced

REALISTIC BEHAVIORS:
- Don't agree too quickly - real people need convincing
- Ask about competitors: "I'm talking to other consultants too"
- Mention time constraints: "I'm at work, can this be quick?"
- Request written information: "Can you email me the details?"
- Show price sensitivity even if you can afford it
- Question hidden costs: "Is that the final price? Any extra fees?"

DO NOT:
- Sound like a robot or textbook response
- Give long speeches (keep to 1-3 sentences mostly)
- Be unrealistically agreeable
- Forget your concerns and personality
- Use overly formal language unless that's your personality`;
  }

  /**
   * Build user prompt for current turn
   */
  private buildUserPrompt(salespersonMessage: string, context: ConversationContext): string {
    const objectionsRaised = context.objectionsRaised.length;
    const objectionsHandled = context.objectionsHandled.length;
    const messageCount = context.messages.length;

    return `The salesperson just said: "${salespersonMessage}"

CURRENT SITUATION:
- Phase: ${context.conversationPhase}
- Your mood: ${this.estimateMood(context)}
- Objections raised: ${objectionsRaised}, handled: ${objectionsHandled}
- Exchange count: ${messageCount} messages

RESPOND AS A REAL PERSON:
1. React naturally to what they just said - does it answer YOUR questions?
2. Use conversational fillers: "Hmm...", "Okay...", "I see...", "Right..."
3. If confused, say so: "Wait, I don't understand", "Can you explain that again?"
4. If interested, show it: "Oh that sounds good!", "Really? Tell me more"
5. If skeptical, push back: "I'm not convinced", "How do I know that's true?"
6. Ask practical follow-ups: "How much?", "How long?", "What if...?"
7. Reference real concerns: "My parents are worried about...", "I heard that..."
8. Be brief (1-2 sentences) unless asking multiple related questions

WHAT TO DO NOW:
${messageCount < 3 ? '- Still getting to know them, be cautious and ask who they are' : ''}
${objectionsRaised > objectionsHandled ? '- They haven\'t fully addressed your concerns yet, push harder' : ''}
${objectionsHandled > objectionsRaised ? '- They\'re handling things well, but stay slightly skeptical' : ''}
${messageCount > 15 ? '- Conversation is long, either commit or politely exit: "Let me think about it"' : ''}

Respond now as ${context.persona.name} would in a REAL phone conversation:`;
  }

  /**
   * Format conversation history for API
   */
  private formatConversationHistory(messages: AIMessage[]): Array<{role: string, content: string}> {
    return messages.slice(-10).map(msg => ({
      role: msg.role === 'salesperson' ? 'user' : 'assistant',
      content: msg.content
    }));
  }

  /**
   * Parse AI response and extract metadata
   */
  private parseAIResponse(content: string, context: ConversationContext): AIResponse {
    // Analyze sentiment
    const sentiment = this.analyzeSentiment(content);
    
    // Detect objection type
    const objectionType = this.detectObjectionType(content);
    
    // Check if conversation should end
    const shouldEndConversation = this.shouldEndConversation(content, context);

    // Generate coaching hints
    const coachingHints = this.generateCoachingHints(content, context);

    return {
      content,
      sentiment,
      objectionType,
      shouldEndConversation,
      nextExpectedAction: this.getNextExpectedAction(context),
      coachingHints
    };
  }

  /**
   * Analyze sentiment of message
   */
  private analyzeSentiment(content: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['great', 'excellent', 'perfect', 'sounds good', 'interested', 'excited', 'yes'];
    const negativeWords = ['no', 'expensive', 'concerned', 'worried', 'doubt', 'but', 'however'];

    const lowerContent = content.toLowerCase();
    const positiveCount = positiveWords.filter(w => lowerContent.includes(w)).length;
    const negativeCount = negativeWords.filter(w => lowerContent.includes(w)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  /**
   * Detect objection type in message
   */
  private detectObjectionType(content: string): string | undefined {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('cost') || lowerContent.includes('expensive') || lowerContent.includes('afford')) {
      return 'cost';
    }
    if (lowerContent.includes('quality') || lowerContent.includes('reputation')) {
      return 'quality';
    }
    if (lowerContent.includes('time') || lowerContent.includes('deadline') || lowerContent.includes('late')) {
      return 'timeline';
    }
    if (lowerContent.includes('visa') || lowerContent.includes('rejection')) {
      return 'visa';
    }
    if (lowerContent.includes('other') || lowerContent.includes('competitor') || lowerContent.includes('comparing')) {
      return 'competition';
    }
    
    return undefined;
  }

  /**
   * Check if conversation should end
   */
  private shouldEndConversation(content: string, context: ConversationContext): boolean {
    const lowerContent = content.toLowerCase();
    const endPhrases = ['let me think', 'call you back', 'not interested', 'proceed', 'sign up'];
    
    return endPhrases.some(phrase => lowerContent.includes(phrase)) || 
           context.messages.length > 30;
  }

  /**
   * Estimate current mood based on context
   */
  private estimateMood(context: ConversationContext): string {
    const recentMessages = context.messages.slice(-5);
    const positiveCount = recentMessages.filter(m => m.sentiment === 'positive').length;
    const negativeCount = recentMessages.filter(m => m.sentiment === 'negative').length;

    if (positiveCount > negativeCount + 1) return 'Positive and engaged';
    if (negativeCount > positiveCount + 1) return 'Skeptical and concerned';
    return 'Neutral, listening';
  }

  /**
   * Get next expected action
   */
  private getNextExpectedAction(context: ConversationContext): string {
    switch (context.conversationPhase) {
      case 'opening':
        return 'Build rapport and qualify prospect';
      case 'discovery':
        return 'Uncover needs and goals';
      case 'presentation':
        return 'Present value proposition';
      case 'objection-handling':
        return 'Address concerns effectively';
      case 'closing':
        return 'Request commitment or next step';
      default:
        return 'Continue conversation';
    }
  }

  /**
   * Generate coaching hints
   */
  private generateCoachingHints(content: string, context: ConversationContext): CoachingHint[] {
    const hints: CoachingHint[] = [];
    const lowerContent = content.toLowerCase();

    // Check for objections
    if (this.detectObjectionType(content)) {
      hints.push({
        id: `hint-${Date.now()}-1`,
        timestamp: Date.now(),
        type: 'warning',
        message: 'Objection detected! Use the Feel-Felt-Found technique.',
        priority: 'high'
      });
    }

    // Check for buying signals
    if (lowerContent.includes('how') || lowerContent.includes('when') || lowerContent.includes('next step')) {
      hints.push({
        id: `hint-${Date.now()}-2`,
        timestamp: Date.now(),
        type: 'positive',
        message: '✓ Buying signal detected! Move towards closing.',
        priority: 'high'
      });
    }

    // Check for disengagement
    if (lowerContent.includes('maybe') || lowerContent.includes('not sure') || lowerContent.includes('think about')) {
      hints.push({
        id: `hint-${Date.now()}-3`,
        timestamp: Date.now(),
        type: 'warning',
        message: 'Prospect seems hesitant. Ask discovery questions.',
        priority: 'medium'
      });
    }

    return hints;
  }

  /**
   * Get fallback response when API fails
   */
  private getFallbackResponse(persona: ProspectPersona, context: ConversationContext): AIResponse {
    const fallbackMessages = [
      "That's interesting. Tell me more about that.",
      "I see. What makes your service different from others?",
      "Can you explain that in more detail?",
      "I'm not sure I understand. Could you clarify?"
    ];

    return {
      content: fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)],
      sentiment: 'neutral',
      coachingHints: []
    };
  }

  /**
   * Calculate performance metrics for the session
   */
  calculatePerformanceMetrics(context: ConversationContext): PerformanceMetrics {
    const duration = (Date.now() - context.startTime) / 1000;
    
    // Calculate various scores
    const scriptAdherence = this.calculateScriptAdherence(context);
    const objectionHandling = this.calculateObjectionHandling(context);
    const rapport = this.calculateRapport(context);
    const closing = this.calculateClosing(context);
    
    const overallScore = (scriptAdherence + objectionHandling + rapport + closing) / 4;

    return {
      sessionId: context.sessionId,
      duration,
      scriptAdherence,
      objectionHandling,
      rapport,
      closing,
      overallScore,
      strengths: this.identifyStrengths(context),
      improvements: this.identifyImprovements(context),
      keyMoments: this.identifyKeyMoments(context),
      objectionsEncountered: this.analyzeObjections(context),
      recommendedTraining: this.recommendTraining(overallScore)
    };
  }

  private calculateScriptAdherence(context: ConversationContext): number {
    // Simple heuristic - in production, use more sophisticated analysis
    const totalMessages = context.messages.filter(m => m.role === 'salesperson').length;
    const scriptReferences = context.messages.filter(m => m.scriptSectionId).length;
    return Math.min(100, (scriptReferences / totalMessages) * 100);
  }

  private calculateObjectionHandling(context: ConversationContext): number {
    if (context.objectionsRaised.length === 0) return 100;
    return (context.objectionsHandled.length / context.objectionsRaised.length) * 100;
  }

  private calculateRapport(context: ConversationContext): number {
    const positiveResponses = context.messages.filter(m => 
      m.role === 'agent' && m.sentiment === 'positive'
    ).length;
    const totalAgentMessages = context.messages.filter(m => m.role === 'agent').length;
    return (positiveResponses / totalAgentMessages) * 100;
  }

  private calculateClosing(context: ConversationContext): number {
    // Check if conversation reached closing phase and had positive outcome
    if (context.conversationPhase === 'closing') {
      const lastMessages = context.messages.slice(-3);
      const positiveClose = lastMessages.some(m => 
        m.sentiment === 'positive' && m.role === 'agent'
      );
      return positiveClose ? 90 : 60;
    }
    return 40;
  }

  private identifyStrengths(context: ConversationContext): string[] {
    const strengths: string[] = [];
    
    if (this.calculateRapport(context) > 70) {
      strengths.push('Excellent rapport building');
    }
    if (this.calculateObjectionHandling(context) > 80) {
      strengths.push('Strong objection handling');
    }
    
    return strengths;
  }

  private identifyImprovements(context: ConversationContext): string[] {
    const improvements: string[] = [];
    
    if (this.calculateScriptAdherence(context) < 50) {
      improvements.push('Follow the script more closely');
    }
    if (this.calculateRapport(context) < 50) {
      improvements.push('Work on building rapport and trust');
    }
    
    return improvements;
  }

  private identifyKeyMoments(context: ConversationContext): PerformanceMetrics['keyMoments'] {
    return context.messages
      .filter(m => m.objectionType || m.sentiment === 'positive')
      .map(m => ({
        timestamp: m.timestamp,
        description: m.objectionType 
          ? `Objection raised: ${m.objectionType}` 
          : 'Positive response',
        type: m.sentiment || 'neutral'
      }));
  }

  private analyzeObjections(context: ConversationContext): PerformanceMetrics['objectionsEncountered'] {
    return context.objectionsRaised.map(objType => ({
      type: objType,
      handled: context.objectionsHandled.includes(objType),
      quality: 'good' as const // Simplified - would need more analysis
    }));
  }

  private recommendTraining(score: number): string[] {
    if (score < 50) {
      return ['Script fundamentals', 'Objection handling basics', 'Rapport building'];
    }
    if (score < 70) {
      return ['Advanced objection handling', 'Closing techniques'];
    }
    return ['Advanced closing strategies', 'Complex scenarios'];
  }

  /**
   * Generate initial greeting from prospect
   */
  generateInitialGreeting(persona: ProspectPersona): string {
    const greetings: Record<ProspectPersonaType, string[]> = {
      'eager-student': [
        "Hi! I'm really excited about studying abroad and wanted to learn more about your services.",
        "Hello! I've been researching study abroad options and came across your agency. Can you help me?"
      ],
      'skeptical-parent': [
        "Hello. I'm calling about study abroad options for my daughter. I have many questions.",
        "Good morning. I need information about sending my child abroad for studies. What can you offer?"
      ],
      'budget-conscious': [
        "Hi, I'm interested in studying abroad but have a limited budget. Can you help?",
        "Hello. I want to know about affordable study abroad options and any scholarships available."
      ],
      'indecisive': [
        "Hi... I'm not sure if studying abroad is right for me. Can we discuss the options?",
        "Hello. I'm considering studying abroad but haven't decided yet. Can you tell me more?"
      ],
      'experienced-researcher': [
        "Good day. I'm looking for research opportunities abroad. I'd like to know about your services.",
        "Hello. I need detailed information about post-doctoral programs. Do you specialize in research placements?"
      ],
      'competitive-shopper': [
        "Hi. I'm comparing several study abroad consultants. What makes your services different?",
        "Hello. I've been talking to other agencies. Why should I choose you?"
      ],
      'career-focused': [
        "Hello. I'm looking for MBA programs with strong career outcomes. What can you offer?",
        "Hi. I want to know about programs that offer the best ROI. Can we discuss this?"
      ],
      'visa-worried': [
        "Hi. I had a visa rejection before and I'm worried about applying again. Can you help?",
        "Hello. I need help with visa guidance. My main concern is getting the visa approved."
      ]
    };

    const options = greetings[persona.type] || ['Hi, I want to know about studying abroad.'];
    return options[Math.floor(Math.random() * options.length)];
  }
}

export const aiRolePlayService = AIRolePlayService.getInstance();
