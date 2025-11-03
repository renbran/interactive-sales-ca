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
    name: 'Ahmed Al Mansouri',
    age: 35,
    background: 'Growing retail business owner in Dubai looking to automate operations',
    goals: ['Automate business processes', 'Scale operations efficiently', 'Reduce manual work'],
    concerns: ['Implementation time', 'Cost vs ROI', 'Staff training', 'System integration'],
    budget: 'Moderate - Willing to invest AED 50-80k for proven solution',
    personality: {
      talkative: 7,
      technical: 5,
      emotional: 6,
      skeptical: 4,
      decisive: 8
    },
    preferredDestinations: ['Odoo ERP', 'AI Automation', 'CRM Solutions'],
    objectionLikelihood: {
      cost: 0.3,
      quality: 0.2,
      timeline: 0.5,
      visa: 0.1,
      competition: 0.3
    },
    responseStyle: 'Enthusiastic entrepreneur. Quick to see value but wants practical details.',
    difficulty: 'easy'
  },
  'skeptical-parent': {
    id: 'skeptical-1',
    type: 'skeptical-parent',
    name: 'Rajesh Sharma',
    age: 52,
    background: 'CFO of trading company, burned by previous ERP implementation failure',
    goals: ['Proven ROI', 'Minimal disruption', 'Reliable vendor', 'Clear implementation plan'],
    concerns: ['High upfront costs', 'Implementation delays', 'System reliability', 'Hidden fees', 'Staff resistance'],
    budget: 'Conservative - Needs strong business case and guarantees',
    personality: {
      talkative: 6,
      technical: 8,
      emotional: 4,
      skeptical: 9,
      decisive: 4
    },
    preferredDestinations: ['Proven solutions', 'Case studies', 'References'],
    objectionLikelihood: {
      cost: 0.9,
      quality: 0.7,
      timeline: 0.6,
      visa: 0.1,
      competition: 0.8
    },
    responseStyle: 'Highly analytical and skeptical. Demands data, proof, and case studies. Cautious decision-maker.',
    difficulty: 'hard'
  },
  'budget-conscious': {
    id: 'budget-1',
    type: 'budget-conscious',
    name: 'Fatima Al Kaabi',
    age: 29,
    background: 'SME owner running a consulting firm, very cost-sensitive',
    goals: ['Maximize ROI', 'Find most affordable solution', 'Avoid unnecessary features', 'Flexible payment terms'],
    concerns: ['Total costs', 'Hidden fees', 'Maintenance costs', 'Training expenses', 'Long-term value'],
    budget: 'Tight - Looking for best value, not premium solutions',
    personality: {
      talkative: 5,
      technical: 7,
      emotional: 4,
      skeptical: 8,
      decisive: 6
    },
    preferredDestinations: ['Budget-friendly solutions', 'Phased implementation', 'Flexible pricing'],
    objectionLikelihood: {
      cost: 1.0,
      quality: 0.5,
      timeline: 0.3,
      visa: 0.1,
      competition: 0.7
    },
    responseStyle: 'Direct and focused on pricing. Asks about costs repeatedly and compares with competitors.',
    difficulty: 'medium'
  },
  'indecisive': {
    id: 'indecisive-1',
    type: 'indecisive',
    name: 'Mohammed Hassan',
    age: 38,
    background: 'Operations Manager comparing multiple ERP vendors, can\'t decide',
    goals: ['Find perfect solution', 'Avoid mistakes', 'Get management buy-in', 'Compare all options'],
    concerns: ['Choosing wrong vendor', 'Missing better alternatives', 'Implementation risks', 'Budget approval'],
    budget: 'Flexible - But needs strong justification for management',
    personality: {
      talkative: 8,
      technical: 6,
      emotional: 6,
      skeptical: 6,
      decisive: 2
    },
    preferredDestinations: ['Industry leaders', 'Best practices', 'Proven vendors'],
    objectionLikelihood: {
      cost: 0.6,
      quality: 0.6,
      timeline: 0.7,
      visa: 0.1,
      competition: 0.8
    },
    responseStyle: 'Asks many questions, circles back to same topics. Compares everything. Needs constant reassurance.',
    difficulty: 'medium'
  },
  'experienced-researcher': {
    id: 'experienced-1',
    type: 'experienced-researcher',
    name: 'Sarah Mitchell',
    age: 42,
    background: 'IT Director with deep technical knowledge, evaluating ERP systems',
    goals: ['Find technically superior solution', 'Ensure scalability', 'Validate architecture', 'Test security'],
    concerns: ['System architecture', 'Integration capabilities', 'Data security', 'API quality', 'Technical debt'],
    budget: 'Well-funded - Technology excellence is priority',
    personality: {
      talkative: 6,
      technical: 10,
      emotional: 3,
      skeptical: 8,
      decisive: 7
    },
    preferredDestinations: ['Enterprise-grade', 'Cloud-native', 'API-first solutions'],
    objectionLikelihood: {
      cost: 0.3,
      quality: 0.9,
      timeline: 0.5,
      visa: 0.1,
      competition: 0.7
    },
    responseStyle: 'Highly technical questions. Wants architecture diagrams, API docs, security protocols. Tests your knowledge.',
    difficulty: 'expert'
  },
  'competitive-shopper': {
    id: 'competitive-1',
    type: 'competitive-shopper',
    name: 'Khalid Ibrahim',
    age: 33,
    background: 'Procurement manager actively comparing multiple ERP vendors',
    goals: ['Get best deal', 'Find most features', 'Negotiate aggressively', 'Benchmark prices'],
    concerns: ['Overpaying', 'Missing better offers', 'Vendor lock-in', 'Better alternatives'],
    budget: 'Flexible - But wants maximum value and discounts',
    personality: {
      talkative: 7,
      technical: 6,
      emotional: 4,
      skeptical: 9,
      decisive: 5
    },
    preferredDestinations: ['Best ROI', 'Competitive pricing', 'Value leaders'],
    objectionLikelihood: {
      cost: 0.8,
      quality: 0.6,
      timeline: 0.4,
      visa: 0.1,
      competition: 1.0
    },
    responseStyle: 'Constantly mentions competitors. Asks "what makes you different?" and seeks discounts. Negotiates hard.',
    difficulty: 'hard'
  },
  'career-focused': {
    id: 'career-1',
    type: 'career-focused',
    name: 'Yusuf Al Hashemi',
    age: 34,
    background: 'Real estate company CEO focused on business growth and efficiency',
    goals: ['Achieve business outcomes', 'Increase profitability', 'Scale operations', 'Competitive advantage'],
    concerns: ['ROI timeline', 'Business disruption', 'Team productivity', 'Market advantage'],
    budget: 'High - Willing to invest for measurable returns',
    personality: {
      talkative: 6,
      technical: 7,
      emotional: 5,
      skeptical: 7,
      decisive: 8
    },
    preferredDestinations: ['UAE market leaders', 'Proven results', 'Fast deployment'],
    objectionLikelihood: {
      cost: 0.4,
      quality: 0.8,
      timeline: 0.6,
      visa: 0.1,
      competition: 0.6
    },
    responseStyle: 'Business-focused and results-driven. Wants data, ROI calculations, case studies, and success metrics.',
    difficulty: 'hard'
  },
  'visa-worried': {
    id: 'visa-1',
    type: 'visa-worried',
    name: 'Mariam Abdullah',
    age: 31,
    background: 'Logistics company manager worried about implementation risks after failed project',
    goals: ['Risk-free implementation', 'Avoid business disruption', 'Ensure support', 'Get guarantees'],
    concerns: ['Implementation failure', 'Data migration risks', 'System downtime', 'Support quality', 'Past bad experience'],
    budget: 'Moderate - But needs strong guarantees and support',
    personality: {
      talkative: 6,
      technical: 5,
      emotional: 7,
      skeptical: 8,
      decisive: 5
    },
    preferredDestinations: ['Proven vendors', 'Strong support', 'UAE references'],
    objectionLikelihood: {
      cost: 0.5,
      quality: 0.7,
      timeline: 0.6,
      visa: 0.1,
      competition: 0.5
    },
    responseStyle: 'Cautious and risk-averse. Asks many implementation and support questions. Needs constant reassurance about guarantees.',
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

CONTEXT - SCHOLARIX GLOBAL:
You are a potential client talking to a sales consultant from Scholarix Global, an AI + Odoo ERP consultancy based in Dubai, UAE. They offer:
- Odoo ERP deployment (14-day implementation)
- AI automation integration
- Business process automation
- CRM & sales intelligence systems
- Consulting for UAE businesses
- Pricing: 40% below market rate
- Target: SMEs and enterprises in UAE (Real Estate, Retail, Trading, Consulting, Logistics)

REALISTIC BEHAVIORS:
- Don't agree too quickly - real business people need convincing
- Ask about competitors: "I'm talking to SAP, Microsoft Dynamics, other Odoo partners..."
- Mention time constraints: "I'm in a meeting soon, can this be quick?"
- Request written information: "Can you send me a proposal?"
- Show price sensitivity: "What's included in that price? Any hidden costs?"
- Question claims: "14 days sounds too fast. Is that realistic?"
- Bring up real concerns: "We tried ERP before and it failed", "Our team won't adopt new systems"
- Reference UAE context: "Does it work with UAE VAT?", "What about Zatca compliance?"

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
        "Hi! I heard about Scholarix from a business partner. I'm looking to automate our operations with Odoo and AI.",
        "Hello! We're a growing retail business in Dubai and need better systems. Can you tell me about your services?"
      ],
      'skeptical-parent': [
        "Hello. I'm the CFO here. We've had bad experiences with ERP implementations before. I have a lot of questions.",
        "Good morning. I need information about Odoo and AI automation, but I'm quite skeptical. Can you convince me?"
      ],
      'budget-conscious': [
        "Hi, our consulting firm needs automation but we have a tight budget. Can you help?",
        "Hello. I want to know about your Odoo services but need to keep costs down. What are the most affordable options?"
      ],
      'indecisive': [
        "Hi... We're looking at several ERP systems but haven't decided yet. Can we discuss Odoo?",
        "Hello. I'm comparing Odoo with SAP and Microsoft Dynamics. Not sure which way to go. Can you help?"
      ],
      'experienced-researcher': [
        "Good day. I'm our IT Director. I need detailed technical information about your Odoo architecture and AI integration.",
        "Hello. I have technical questions about your implementation methodology, APIs, and system security. Do you have someone technical?"
      ],
      'competitive-shopper': [
        "Hi. I'm comparing several Odoo partners and consultancies. What makes Scholarix different from others?",
        "Hello. I've been talking to other ERP vendors. Your prices seem lower. Why should I trust your quality?"
      ],
      'career-focused': [
        "Hello. I'm the CEO of a real estate company. We need systems that will help us scale and beat competition. What can you offer?",
        "Hi. I need solutions that deliver real business results - increased revenue, reduced costs. Can we discuss your ROI metrics?"
      ],
      'visa-worried': [
        "Hi. We had a failed ERP implementation last year that was a disaster. I'm very worried about going through that again. Can you help?",
        "Hello. My main concern is implementation risk. We can't afford downtime or project failure. What guarantees do you offer?"
      ]
    };

    const options = greetings[persona.type] || ['Hi, I want to know about your Odoo and AI services.'];
    return options[Math.floor(Math.random() * options.length)];
  }
}

export const aiRolePlayService = AIRolePlayService.getInstance();
