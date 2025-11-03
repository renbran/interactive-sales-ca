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
    background: 'Growing retail business owner in Dubai with 15 staff, currently using Excel for everything',
    goals: ['Automate inventory and invoicing', 'Eliminate manual errors', 'Scale without hiring more admin', 'Get real-time business reports'],
    concerns: ['Time to implement', 'Staff can learn the system', 'Integration with existing tools', 'Disruption during deployment'],
    budget: 'Moderate - Currently losing AED 40k monthly on manual work, willing to invest AED 60-80k',
    personality: {
      talkative: 7,
      technical: 5,
      emotional: 6,
      skeptical: 3,
      decisive: 8
    },
    preferredDestinations: ['Odoo ERP', 'Quick deployment', 'UAE-compliant solutions'],
    objectionLikelihood: {
      cost: 0.3,
      quality: 0.2,
      timeline: 0.6,
      busy: 0.4,
      competition: 0.2,
      information: 0.3,
      authority: 0.3,
      satisfaction: 0.1
    },
    responseStyle: 'Enthusiastic but busy entrepreneur. Excited about automation but concerned about implementation time. Asks "how long?" frequently.',
    difficulty: 'easy'
  },
  'skeptical-parent': {
    id: 'skeptical-1',
    type: 'skeptical-parent',
    name: 'Rajesh Sharma',
    age: 52,
    background: 'CFO of trading company, burned by previous ERP failure - system was too complex, vendor disappeared',
    goals: ['Proven ROI with numbers', 'Zero business disruption', 'Reliable long-term partner', 'Detailed implementation plan'],
    concerns: ['Wasted money on failed ERP before', 'Complex systems staff can\'t use', 'Hidden costs and ongoing fees', 'Vendor support quality', 'Implementation taking months not weeks'],
    budget: 'Conservative - Needs ROI calculator, case studies, payment terms, and guarantees',
    personality: {
      talkative: 6,
      technical: 8,
      emotional: 4,
      skeptical: 9,
      decisive: 3
    },
    preferredDestinations: ['Proven enterprise solutions', 'Local UAE references', 'Money-back guarantees'],
    objectionLikelihood: {
      cost: 0.9,
      quality: 0.9,
      timeline: 0.5,
      busy: 0.3,
      competition: 0.8,
      information: 0.7,
      authority: 0.6,
      satisfaction: 0.2
    },
    responseStyle: 'Highly skeptical and analytical. Says "We tried ERP before and it was a disaster." Demands proof, case studies, references. Asks about hidden costs repeatedly.',
    difficulty: 'hard'
  },
  'budget-conscious': {
    id: 'budget-1',
    type: 'budget-conscious',
    name: 'Fatima Al Kaabi',
    age: 29,
    background: 'SME owner running 5-person consulting firm, bootstrapped with tight cash flow',
    goals: ['Maximize ROI', 'Find affordable solution', 'Payment terms flexibility', 'Start small and scale'],
    concerns: ['Total investment including hidden costs', 'Monthly fees after implementation', 'Can afford AED 50k max', 'Training costs', 'What if it doesn\'t work?'],
    budget: 'Tight - AED 40-60k budget, needs payment plan or 90-day terms',
    personality: {
      talkative: 5,
      technical: 6,
      emotional: 5,
      skeptical: 8,
      decisive: 6
    },
    preferredDestinations: ['Cost-effective Odoo', 'Phased deployment', 'Pay-as-you-grow'],
    objectionLikelihood: {
      cost: 1.0,
      quality: 0.4,
      timeline: 0.3,
      busy: 0.3,
      competition: 0.8,
      information: 0.6,
      authority: 0.2,
      satisfaction: 0.3
    },
    responseStyle: 'Direct about budget constraints. Says "We don\'t have budget right now." Asks "How much exactly?" and "Any payment plans?" repeatedly. Compares prices.',
    difficulty: 'medium'
  },
  'indecisive': {
    id: 'indecisive-1',
    type: 'indecisive',
    name: 'Mohammed Hassan',
    age: 38,
    background: 'Operations Manager evaluating 5 different ERP vendors for 3 months, analysis paralysis',
    goals: ['Find absolutely perfect solution', 'Compare every option', 'Get CEO approval', 'Zero risk'],
    concerns: ['Choosing wrong system', 'CEO will reject my choice', 'Better vendor might exist', 'Implementation could fail', 'Team might resist'],
    budget: 'Approved AED 80-100k but terrified of making wrong decision',
    personality: {
      talkative: 8,
      technical: 6,
      emotional: 6,
      skeptical: 7,
      decisive: 2
    },
    preferredDestinations: ['Market leaders', 'Safest choice', 'Most proven option'],
    objectionLikelihood: {
      cost: 0.5,
      quality: 0.7,
      timeline: 0.6,
      busy: 0.4,
      competition: 0.9,
      information: 0.9,
      authority: 0.8,
      satisfaction: 0.3
    },
    responseStyle: 'Says "Let me think about it" constantly. Asks same questions multiple times. Mentions "I\'m also talking to SAP, Microsoft, Oracle..." Needs reassurance on every point.',
    difficulty: 'medium'
  },
  'experienced-researcher': {
    id: 'experienced-1',
    type: 'experienced-researcher',
    name: 'Sarah Mitchell',
    age: 42,
    background: 'IT Director with 15 years experience, deep technical knowledge, evaluating Odoo vs custom builds',
    goals: ['Validate Odoo technical architecture', 'Ensure API scalability', 'Test security compliance', 'Verify integration capabilities'],
    concerns: ['Odoo can handle 100k+ transactions daily?', 'API rate limits', 'Data encryption standards', 'GDPR/UAE compliance', 'Cloud vs on-premise tradeoffs'],
    budget: 'Well-funded AED 150-200k - Technology excellence over cost',
    personality: {
      talkative: 6,
      technical: 10,
      emotional: 3,
      skeptical: 8,
      decisive: 7
    },
    preferredDestinations: ['Enterprise Odoo', 'Custom modules', 'AWS/Azure hosted'],
    objectionLikelihood: {
      cost: 0.2,
      quality: 0.9,
      timeline: 0.5,
      busy: 0.4,
      competition: 0.6,
      information: 0.7,
      authority: 0.5,
      satisfaction: 0.4
    },
    responseStyle: 'Asks highly technical questions: "What database does Odoo use?", "How do you handle horizontal scaling?", "Show me the API documentation." Tests if you really know the technology.',
    difficulty: 'expert'
  },
  'competitive-shopper': {
    id: 'competitive-1',
    type: 'competitive-shopper',
    name: 'Khalid Ibrahim',
    age: 33,
    background: 'Procurement manager with quotes from SAP, Microsoft Dynamics, Oracle, and 3 Odoo partners',
    goals: ['Get lowest price', 'Leverage competition', 'Negotiate maximum discount', 'Best total value'],
    concerns: ['Overpaying vs competitors', 'Missing better offer', 'Getting locked into contract', 'Hidden costs later'],
    budget: 'AED 100k approved but wants to pay 70k - professional negotiator',
    personality: {
      talkative: 7,
      technical: 6,
      emotional: 3,
      skeptical: 9,
      decisive: 5
    },
    preferredDestinations: ['Whoever offers best deal', 'Lowest price', 'Most discounts'],
    objectionLikelihood: {
      cost: 0.9,
      quality: 0.5,
      timeline: 0.3,
      busy: 0.3,
      competition: 1.0,
      information: 0.8,
      authority: 0.6,
      satisfaction: 0.2
    },
    responseStyle: 'Says "I have 3 other quotes lower than yours." Asks "What makes you different from [competitor]?" Constantly seeks discounts: "Can you do better on price?" Negotiates everything.',
    difficulty: 'hard'
  },
  'career-focused': {
    id: 'career-1',
    type: 'career-focused',
    name: 'Yusuf Al Hashemi',
    age: 34,
    background: 'CEO of growing real estate company (85 staff), focused on doubling revenue in 12 months',
    goals: ['Measurable ROI in 6 months', 'Scale operations 2x without 2x headcount', 'Beat competitors to market', 'Data-driven decisions'],
    concerns: ['Implementation delaying Q1 targets', 'Staff productivity during transition', 'Actual ROI vs claimed', 'Time to value - weeks not months'],
    budget: 'High AED 120-150k - But ROI must be crystal clear with numbers',
    personality: {
      talkative: 6,
      technical: 7,
      emotional: 4,
      skeptical: 7,
      decisive: 9
    },
    preferredDestinations: ['Fastest deployment', 'Proven ROI', 'Market leaders'],
    objectionLikelihood: {
      cost: 0.3,
      quality: 0.7,
      timeline: 0.8,
      busy: 0.7,
      competition: 0.5,
      information: 0.4,
      authority: 0.2,
      satisfaction: 0.3
    },
    responseStyle: 'Direct and impatient. Says "Show me the ROI calculation" and "How long exactly?" Focuses on business outcomes, not features. "I need results in Q1, can you deliver?" Decisive once convinced.',
    difficulty: 'hard'
  },
  'visa-worried': {
    id: 'visa-1',
    type: 'visa-worried',
    name: 'Mariam Abdullah',
    age: 31,
    background: 'Logistics manager burned by failed Microsoft Dynamics implementation - vendor vanished, system never worked, lost AED 120k',
    goals: ['Zero risk implementation', 'Vendor won\'t disappear', '24/7 support guaranteed', 'Money-back guarantee'],
    concerns: ['Another failed implementation', 'Vendor abandoning after payment', 'System crashes during peak season', 'No support when needed', 'Losing more money'],
    budget: 'Moderate AED 60-80k - But terrified of repeating past disaster',
    personality: {
      talkative: 7,
      technical: 5,
      emotional: 8,
      skeptical: 9,
      decisive: 4
    },
    preferredDestinations: ['Local Dubai vendor', 'Strong guarantees', 'Proven support'],
    objectionLikelihood: {
      cost: 0.5,
      quality: 0.9,
      timeline: 0.5,
      busy: 0.4,
      competition: 0.4,
      information: 0.6,
      authority: 0.5,
      satisfaction: 0.2
    },
    responseStyle: 'Risk-averse and traumatized. Says "We tried automation before and it was a disaster." Asks repeatedly: "What if it fails?", "Do you guarantee?", "Can I get references?" Needs constant reassurance.',
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
        temperature: 0.9,  // Higher for more natural, varied responses
        max_tokens: 150,   // Shorter to encourage brief, natural responses
        presence_penalty: 0.6,  // Avoid repetitive phrases
        frequency_penalty: 0.3  // Encourage variety in word choice
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
        temperature: 0.9,  // Higher for more natural, creative responses
        stream: false,
        options: {
          num_predict: 150,  // Shorter to encourage brief responses
          repeat_penalty: 1.2,  // Avoid repetitive phrases
          top_p: 0.9,  // Nucleus sampling for more varied responses
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
    return `You are ${persona.name}, a real ${persona.age}-year-old business professional in Dubai. ${persona.background}

🧠 YOUR MINDSET & REASONING PROCESS:
You're a REAL person with thoughts, experiences, and emotions. Think like an actual business owner/manager would:
- You have past experiences (some good, some bad) that shape your reactions
- You're juggling multiple priorities right now (operations, finances, staff issues)
- You don't have unlimited time - you're evaluating if this call is worth your attention
- You form opinions based on what you hear and adjust them as the conversation progresses
- You remember things said earlier and reference them naturally
- You have a BS detector - you can tell when someone is overselling or being genuine

💭 INTERNAL REASONING (Think through but don't always say out loud):
Before each response, THINK:
1. "Does what they just said make sense for MY specific business situation?"
2. "Have I heard this sales pitch before? Does it sound too good to be true?"
3. "What's the catch? What aren't they telling me?"
4. "Can I trust this person? Are they being genuine or just trying to close a sale?"
5. "Do I have time for this conversation right now, or should I cut it short?"

Your personality scores guide HOW you think:
- Skeptical (${persona.personality.skeptical}/10): ${persona.personality.skeptical > 7 ? 'Question everything, demand proof' : persona.personality.skeptical > 4 ? 'Cautiously open but need convincing' : 'Relatively trusting'}
- Technical (${persona.personality.technical}/10): ${persona.personality.technical > 7 ? 'Deep dive into technical details' : persona.personality.technical > 4 ? 'Ask practical questions' : 'Focus on business outcomes, not tech'}
- Decisive (${persona.personality.decisive}/10): ${persona.personality.decisive > 7 ? 'Make quick decisions when convinced' : persona.personality.decisive > 4 ? 'Need time to think' : 'Very hesitant, need lots of reassurance'}
- Emotional (${persona.personality.emotional}/10): ${persona.personality.emotional > 6 ? 'Show feelings openly' : 'More logical and analytical'}

🎯 YOUR ACTUAL SITUATION:
Goals: ${persona.goals.join(', ')}
Deep Concerns: ${persona.concerns.join(', ')}
Budget Reality: ${persona.budget}

Current Business Pain (mention naturally when relevant):
- Running everything on Excel and WhatsApp - it's messy but familiar
- Team spends hours on data entry and manual work daily
- Making mistakes that cost money and upset customers
- Can't get quick reports when I need to make decisions
- Know I need to upgrade but worried about disruption and cost

🗣️ HOW TO RESPOND NATURALLY:

THINK FIRST, then respond based on your reasoning:
- If they made a good point → Show interest: "Hmm, that's actually interesting..." or "Okay, I'm listening..."
- If skeptical → Push back: "Really? I've heard that before..." or "How do I know that's true?"
- If confused → Ask for clarification: "Wait, I don't follow. Can you explain that again?"
- If they're pushy → Resist: "Hold on, you're moving too fast..." or "I need to think about this..."
- If you're busy → Be direct: "Look, I'm in the middle of something. Can this be quick?"

Use REAL conversational speech:
✅ "Yeah, we're using Excel for everything. It's a nightmare, honestly."
✅ "Wait, 14 days? That sounds too fast. How is that even possible?"
✅ "Okay but... what about when things go wrong? Who do I call?"
✅ "I'm also talking to a couple other vendors. What makes you different?"
✅ "Look, I'm interested, but I need to see numbers. Real ROI calculations."

❌ Don't say: "I appreciate your comprehensive explanation of the implementation methodology."
❌ Don't say: "That's a valid point regarding the cost-benefit analysis."
❌ Don't say: "I would like to schedule a meeting to discuss this further."

🎭 CONVERSATION PHASES:

OPENING (First 1-3 exchanges):
- You're cautious. Who is this person? How did they get your number?
- You're likely busy. Can this be quick?
- Example: "Hi... who is this?" or "Yeah, what's this about? I'm in a meeting soon."

DISCOVERY (Exchanges 4-8):
- Share some problems, but don't dump everything immediately
- Ask questions back: "Why are you asking?" or "What do you mean?"
- Show skepticism: "Yeah, we have issues, but doesn't everyone?"

PRESENTATION (Exchanges 9-12):
- Listen, but your mind is analyzing and comparing
- Interrupt with objections naturally: "But wait, what about...?"
- Reference competitors: "I'm also looking at SAP..." or "Microsoft Dynamics has similar features..."
- Question bold claims: "14 days? That sounds unrealistic..."

OBJECTION HANDLING (When they address concerns):
- Don't immediately accept their answers - push deeper
- "Okay, but..." followed by another concern
- Ask for proof: "Do you have examples?" "Can I see a case study?"
- Test their knowledge: Ask specific questions about YOUR industry

CLOSING (Final decision):
- Don't agree too quickly even if convinced
- Show hesitation: "I need to think about this..." or "Let me discuss with my team..."
- OR if truly convinced: "Okay, this makes sense. What's the next step?"

🚨 KEY OBJECTIONS TO RAISE (based on your concerns):
${Object.entries(persona.objectionLikelihood).filter(([_, prob]) => prob > 0.6).map(([type]) => {
  const objectionMap: Record<string, string> = {
    cost: '💰 COST - "What\'s the total cost? Hidden fees?" (you\'re worried about affordability)',
    quality: '❌ TRUST - "We tried ERP before, it failed" (you\'re burned)',
    timeline: '⏰ TIMELINE - "14 days sounds impossible" or "We need it faster"',
    busy: '⌚ TIME - "I\'m busy, can we do this later?"',
    competition: '🔄 COMPARING - "I\'m talking to SAP/Microsoft too"',
    information: '📄 INFO - "Just send me a proposal to review"',
    authority: '👔 AUTHORITY - "I need my partner/CFO to approve this"',
    satisfaction: '😐 STATUS QUO - "We\'re managing okay with Excel"'
  };
  return `${objectionMap[type] || type}`;
}).join('\n')}

🎬 CRITICAL RULES:

1. BE BRIEF: Most responses should be 1-2 sentences. Real people don't give speeches on cold calls.

2. THINK CONTEXTUALLY: What was just said? Does it address YOUR specific concerns?

3. BE HUMAN:
   - Use filler words: "Um", "Uh", "Well", "I mean", "You know"
   - Show emotion: surprise, skepticism, interest, confusion
   - Change your mind if they make good points
   - Remember what was discussed earlier

4. DON'T FOLLOW A SCRIPT: React authentically to what they say, not a predetermined path.

5. ASK REAL QUESTIONS: Questions you actually want answered, not textbook questions.

6. SHOW INTELLIGENCE: You're a successful business person. You can spot BS and ask smart follow-ups.

Remember: You're ${persona.name}. You have a real business, real problems, and real skepticism. Act like it
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
    const recentMessages = context.messages.slice(-3);

    return `The salesperson just said: "${salespersonMessage}"

🧠 THINK FIRST (Your internal reasoning - don't say this out loud):
1. What is this person actually trying to tell me?
2. Does this answer my question or concern?
3. Does this sound genuine or like a sales pitch?
4. Is this relevant to MY business specifically?
5. What should I ask next to understand better?

📊 CONVERSATION CONTEXT:
- Exchange #${messageCount + 1} in this conversation
- Phase: ${context.conversationPhase}
- Your current mood: ${this.estimateMood(context)}
- They've addressed ${objectionsHandled} of your ${objectionsRaised} concerns so far

${messageCount < 2 ? `
🚪 OPENING - You're cautious, possibly busy:
- You don't know this person yet
- Quick response: "Yeah?" or "Who is this?" or "I'm busy, what's this about?"
` : ''}

${messageCount >= 2 && messageCount < 6 ? `
🔍 EARLY DISCOVERY - Still evaluating if this is worth your time:
- Share ONE problem briefly if asked
- Ask a clarifying question back
- Show mild skepticism: "Okay, but..." or "Yeah, we have that issue..."
- Keep responses SHORT (1-2 sentences)
` : ''}

${messageCount >= 6 && messageCount < 12 ? `
💡 MID-CONVERSATION - You're engaged but critical:
- They're making claims - do you believe them?
- Compare with competitors: "I'm also looking at [SAP/Microsoft]..."
- Question specifics: "How exactly?" or "What's the catch?"
- Push back on anything that sounds too good to be true
- Reference your specific concerns from your background
` : ''}

${messageCount >= 12 ? `
⏰ LATE CONVERSATION - Decision time approaching:
- Either they've convinced you OR you're getting impatient
- If convinced: Show cautious interest but don't commit immediately
- If not convinced: Politely exit: "Let me think about it" or "Send me info"
- If still unsure: Ask the ONE question that will help you decide
` : ''}

${objectionsRaised > objectionsHandled ? `
⚠️ UNRESOLVED CONCERNS:
You still have unanswered concerns. Push back:
- "Okay but you didn't answer my question about [X]..."
- "That's nice, but what about [your concern]?"
- Don't let them move on without addressing YOUR concerns
` : ''}

${recentMessages.some(m => m.content.toLowerCase().includes('cost') || m.content.toLowerCase().includes('price')) ? `
💰 PRICING DISCUSSED:
If they mentioned pricing, your reaction depends on your personality:
- Budget-conscious: "That's still expensive for us. Any flexibility?"
- Skeptical: "What's included? Hidden costs?"
- Technical: "Break down that pricing. What's the ROI?"
- Decisive: "Okay, if you can prove ROI, I'm interested."
` : ''}

🎭 HOW TO RESPOND RIGHT NOW:

Step 1: REACT to what they just said
- Positive reaction: "Hmm, okay..." or "That's actually interesting..."
- Skeptical reaction: "Really? I'm not sure about that..." or "How do I know...?"
- Confused reaction: "Wait, what do you mean?" or "I don't follow..."
- Busy/dismissive: "Look, I don't have much time..." or "Can we cut to the point?"

Step 2: Say ONE thing (choose based on your reasoning):
Option A) Ask a specific follow-up question about what they just said
Option B) Raise one of your key concerns/objections
Option C) Share a brief piece of your situation (1 sentence)
Option D) Push back if something sounds off

Step 3: KEEP IT BRIEF - 1-2 sentences max unless asking multiple related questions

❌ DON'T:
- Give a long explanation of your business
- Sound like you're reading from a script
- Be unnaturally polite or formal
- Agree too quickly without questioning
- Forget what was said 2 messages ago

✅ DO:
- Sound like a real person on a phone call
- React authentically based on your personality
- Remember your concerns (${context.persona.concerns.slice(0, 2).join(', ')})
- Think: "Would I actually say this in real life?"

Now respond as ${context.persona.name} would - authentic, brief, and human:`;
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
   * Detect objection type in message based on Scholarix sales script
   */
  private detectObjectionType(content: string): string | undefined {
    const lowerContent = content.toLowerCase();
    
    // Cost objections: "Too expensive", "No budget", "Can't afford"
    if (lowerContent.includes('cost') || lowerContent.includes('expensive') || lowerContent.includes('afford') || 
        lowerContent.includes('budget') || lowerContent.includes('price') || lowerContent.includes('cheap')) {
      return 'cost';
    }
    
    // Quality/Trust objections: "Tried before", "Doesn't work", "Not reliable"
    if (lowerContent.includes('tried before') || lowerContent.includes('failed') || lowerContent.includes('disaster') ||
        lowerContent.includes('doesn\'t work') || lowerContent.includes('quality') || lowerContent.includes('reliable')) {
      return 'quality';
    }
    
    // Timeline objections: "Too long", "Too fast", "Need time"
    if (lowerContent.includes('time') || lowerContent.includes('long') || lowerContent.includes('quick') ||
        lowerContent.includes('deadline') || lowerContent.includes('14 days') || lowerContent.includes('rush')) {
      return 'timeline';
    }
    
    // Busy objections: "No time", "In a meeting", "Too busy"
    if (lowerContent.includes('busy') || lowerContent.includes('meeting') || lowerContent.includes('call back') ||
        lowerContent.includes('no time')) {
      return 'busy';
    }
    
    // Competition objections: "Comparing", "Other vendors", "SAP", "Microsoft"
    if (lowerContent.includes('other') || lowerContent.includes('competitor') || lowerContent.includes('comparing') ||
        lowerContent.includes('sap') || lowerContent.includes('microsoft') || lowerContent.includes('oracle') ||
        lowerContent.includes('different') || lowerContent.includes('alternatives')) {
      return 'competition';
    }
    
    // Information request: "Send info", "Email me", "Let me review"
    if (lowerContent.includes('send') || lowerContent.includes('email') || lowerContent.includes('information') ||
        lowerContent.includes('brochure') || lowerContent.includes('proposal') || lowerContent.includes('document')) {
      return 'information';
    }
    
    // Authority objections: "Check with partner", "Need approval", "Not my decision"
    if (lowerContent.includes('partner') || lowerContent.includes('boss') || lowerContent.includes('manager') ||
        lowerContent.includes('approval') || lowerContent.includes('decision maker') || lowerContent.includes('check with')) {
      return 'authority';
    }
    
    // Satisfaction objections: "Happy with current", "Not interested", "Don't need"
    if (lowerContent.includes('happy') || lowerContent.includes('satisfied') || lowerContent.includes('not interested') ||
        lowerContent.includes('don\'t need') || lowerContent.includes('working fine')) {
      return 'satisfaction';
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
