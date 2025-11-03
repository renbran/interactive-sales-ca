// AI Role-Play System Types for Sales Training

export type ProspectPersonaType = 
  | 'eager-student'           // Excited, ready to go, asks logistics questions
  | 'skeptical-parent'        // Concerned about costs, safety, quality
  | 'budget-conscious'        // Focused on affordability, scholarships
  | 'indecisive'             // Unsure, needs guidance, asks many questions
  | 'experienced-researcher'  // Well-informed, asks detailed questions
  | 'competitive-shopper'     // Comparing multiple agencies
  | 'career-focused'         // Interested in ROI, career outcomes
  | 'visa-worried'           // Concerned about visa process, rejection rates;

export type ConversationDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface ProspectPersona {
  id: string;
  type: ProspectPersonaType;
  name: string;
  age: number;
  background: string;
  goals: string[];
  concerns: string[];
  budget: string;
  personality: {
    talkative: number;        // 1-10 scale
    technical: number;        // How technical/detail-oriented
    emotional: number;        // How emotional in responses
    skeptical: number;        // How skeptical/resistant
    decisive: number;         // How quickly they make decisions
  };
  preferredDestinations: string[];
  objectionLikelihood: {
    cost: number;            // 0-1 probability - "Too expensive", "No budget"
    quality: number;         // "Tried automation before", "Does it really work?"
    timeline: number;        // "Too long", "Need it faster", "Can we start later?"
    busy: number;            // "No time", "In a meeting", "Call me back"
    competition: number;     // "Comparing with SAP/Microsoft/Others"
    information: number;     // "Send me info first", "Let me think about it"
    authority: number;       // "Need to check with partner/boss"
    satisfaction: number;    // "Happy with current system", "Not interested"
  };
  responseStyle: string;      // Short description of how they talk
  difficulty: ConversationDifficulty;
}

export interface AIMessage {
  id: string;
  role: 'agent' | 'salesperson' | 'system';
  content: string;
  timestamp: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
  objectionType?: string;
  scriptSectionId?: string;
  audioUrl?: string;
}

export interface ConversationContext {
  sessionId: string;
  persona: ProspectPersona;
  messages: AIMessage[];
  currentScriptSection: string;
  objectionsRaised: string[];
  objectionsHandled: string[];
  conversationPhase: 'opening' | 'discovery' | 'presentation' | 'objection-handling' | 'closing';
  startTime: number;
  salespersonInfo?: {
    name: string;
    experience: string;
  };
}

export interface PerformanceMetrics {
  sessionId: string;
  duration: number;
  scriptAdherence: number;        // 0-100 score
  objectionHandling: number;      // 0-100 score
  rapport: number;                // 0-100 score
  closing: number;                // 0-100 score
  overallScore: number;           // 0-100 score
  strengths: string[];
  improvements: string[];
  keyMoments: {
    timestamp: number;
    description: string;
    type: 'positive' | 'negative' | 'neutral';
  }[];
  objectionsEncountered: {
    type: string;
    handled: boolean;
    quality: 'poor' | 'fair' | 'good' | 'excellent';
  }[];
  recommendedTraining: string[];
}

export interface AIRolePlayConfig {
  persona: ProspectPersona;
  difficulty: ConversationDifficulty;
  enableVoice: boolean;
  enableRealTimeCoaching: boolean;
  recordSession: boolean;
  autoGenerateObjections: boolean;
  maxDuration?: number;           // in minutes
  targetOutcome?: 'appointment' | 'sale' | 'follow-up' | 'any';
}

export interface CoachingHint {
  id: string;
  timestamp: number;
  type: 'warning' | 'suggestion' | 'positive';
  message: string;
  scriptReference?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface AIResponse {
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  objectionType?: string;
  shouldEndConversation?: boolean;
  nextExpectedAction?: string;
  coachingHints?: CoachingHint[];
}
