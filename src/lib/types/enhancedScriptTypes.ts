// Enhanced Script Types for Comprehensive Sales Script Integration
// These types support embedded objections, cultural adaptations, and real-time responses

export type CallPhase = 
  | 'opening' 
  | 'authority-qualification' 
  | 'discovery' 
  | 'soft-pitch' 
  | 'meeting-lock' 
  | 'demo-meeting' 
  | 'close' 
  | 'contract-close' 
  | 'post-meeting' 
  | 'follow-up';

export type ClientResponseType = 'positive' | 'neutral' | 'objection' | 'question';
export type ObjectionPriority = 'high' | 'medium' | 'low';
export type TipType = 'success' | 'warning' | 'critical' | 'calculation' | 'insight';
export type CultureType = 'arab' | 'indian' | 'western';
export type OutcomeType = 'success' | 'failure' | 'pending';

// =====================================================
// SCRIPT SECTION TYPES
// =====================================================

export interface ScriptSection {
  id: string;
  sectionNumber: number;
  sectionName: string;
  duration: string;
  goal: string;
  phase: CallPhase;
  mainScript: MainScript;
  embeddedObjections: EmbeddedObjection[];
  tips: ScriptTip[];
  culturalVariations?: Record<CultureType, CulturalVariation>;
  roiCalculation?: ROICalculation;
  responses: ScriptResponse[];
  checklistItems?: string[];
  warnings?: string[];
}

// =====================================================
// MAIN SCRIPT CONVERSATION FLOW
// =====================================================

export interface MainScript {
  agent: string;
  expectedClientResponses: ClientResponse[];
  continueScript?: string;
  pauseInstructions?: string;
  followUpScript?: string;
  notes?: string[];
}

export interface ClientResponse {
  response: string;
  type: ClientResponseType;
  nextStep: string;
  probability?: number; // Percentage likelihood (0-100)
  handleWith?: string; // Reference to objection ID or next script
}

export interface ScriptResponse {
  label: string;
  type: ClientResponseType;
  nextNodeId: string;
  qualificationUpdate?: {
    status?: string;
    score?: number;
    notes?: string;
  };
}

// =====================================================
// EMBEDDED OBJECTION HANDLING
// =====================================================

export interface EmbeddedObjection {
  id: string;
  trigger: string;
  priority: ObjectionPriority;
  responseOptions: ObjectionResponse[];
  statistics?: ObjectionStatistics;
  category?: ObjectionCategory;
  tags?: string[];
}

export interface ObjectionResponse {
  approach: string;
  whenToUse: string;
  script: string;
  successPath: string;
  failurePath: string;
  tips?: string[];
  warnings?: string[];
  successRate?: number; // Percentage (0-100)
  examples?: string[];
}

export interface ObjectionStatistics {
  frequency: string; // e.g., "40% of calls"
  conversionRate: string; // e.g., "65% overcome rate"
  averageTimeToHandle: string; // e.g., "2-3 minutes"
  bestResponseApproach: string;
}

export type ObjectionCategory = 
  | 'time-based' 
  | 'price-based' 
  | 'authority-based' 
  | 'trust-based' 
  | 'need-based' 
  | 'timing-based';

// =====================================================
// TIPS AND GUIDANCE
// =====================================================

export interface ScriptTip {
  type: TipType;
  icon: string;
  title: string;
  text: string;
  highlight?: boolean;
  actionable?: boolean;
  relatedObjections?: string[]; // IDs of related objections
}

// =====================================================
// CULTURAL ADAPTATIONS
// =====================================================

export interface CulturalVariation {
  culture: CultureType;
  greeting: string;
  tone: string;
  keyPhrases: string[];
  avoidPhrases: string[];
  expectations: string[];
  closingStyle: string;
  decisionMakingStyle: string;
  negotiationApproach: string;
}

// =====================================================
// ROI CALCULATIONS
// =====================================================

export interface ROICalculation {
  template: string;
  variables: ROIVariable[];
  displayFormat: 'inline-calculator' | 'popup' | 'sidebar';
  exampleValues: Record<string, number>;
  calculationSteps: string[];
}

export interface ROIVariable {
  name: string;
  label: string;
  type: 'number' | 'currency' | 'percentage';
  defaultValue?: number;
  min?: number;
  max?: number;
  unit?: string;
}

export interface ROIResult {
  monthlySavings: number;
  yearlySavings: number;
  roi: number;
  paybackPeriod: number;
  calculations: Record<string, number>;
  displayText: string;
}

// =====================================================
// CALL ANALYTICS & TRACKING
// =====================================================

export interface CallAnalytics {
  callId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  sectionsCompleted: string[];
  objectionsEncountered: ObjectionEncounter[];
  timeInEachSection: Record<string, number>;
  culturalAdaptationUsed?: CultureType;
  roiCalculationsPerformed: number;
  conversionFunnelStage: string;
  dealProbability: number;
  outcome?: CallOutcome;
}

export interface ObjectionEncounter {
  id: string;
  objectionId: string;
  trigger: string;
  responseUsed: string;
  responseApproach: string;
  outcome: OutcomeType;
  timeSpent: number;
  notes?: string;
  timestamp: string;
}

export interface CallOutcome {
  result: 'meeting-booked' | 'callback-scheduled' | 'not-interested' | 'no-answer' | 'closed-deal' | 'follow-up-needed';
  nextSteps: string[];
  scheduledFollowUp?: string;
  dealValue?: number;
  confidence: number; // Percentage (0-100)
  notes: string;
}

// =====================================================
// CALL FLOW STATE MANAGEMENT
// =====================================================

export interface CallFlowState {
  currentSection: string;
  currentNode: string;
  sectionsCompleted: string[];
  objectionsEncountered: ObjectionEncounter[];
  roiData?: ROIResult;
  culturalPreference?: CultureType;
  prospectInfo: ProspectInfo;
  callOutcome?: CallOutcome;
  analytics: CallAnalytics;
  navigationHistory: string[]; // For back button functionality
}

export interface ProspectInfo {
  name: string;
  company: string;
  industry?: string;
  role?: string;
  decisionMaker: boolean;
  painPoints: string[];
  currentProcess: string;
  estimatedValue?: number;
  urgency?: 'low' | 'medium' | 'high';
  culture?: CultureType;
}

// =====================================================
// PERFORMANCE METRICS
// =====================================================

export interface PerformanceMetrics {
  totalCalls: number;
  successfulConnections: number;
  qualifiedLeads: number;
  meetingsBooked: number;
  dealsWon: number;
  conversionRates: {
    callToConnection: number;
    connectionToQualified: number;
    qualifiedToMeeting: number;
    meetingToClose: number;
  };
  averageCallDuration: number;
  mostCommonObjections: Array<{
    objectionId: string;
    count: number;
    successRate: number;
  }>;
  bestPerformingResponses: Array<{
    objectionId: string;
    responseApproach: string;
    successRate: number;
  }>;
  culturalPerformance: Record<CultureType, {
    callsAttempted: number;
    successRate: number;
    averageDealSize: number;
  }>;
}

// =====================================================
// UI COMPONENT PROPS
// =====================================================

export interface SectionHeaderProps {
  number: number;
  title: string;
  duration: string;
  goal: string;
  phase: CallPhase;
  completed?: boolean;
}

export interface EmbeddedObjectionHandlerProps {
  objection: EmbeddedObjection;
  onSelect: (response: ObjectionResponse) => void;
  onDismiss: () => void;
  compactMode?: boolean;
}

export interface ClientResponsePredictorProps {
  expectedResponses: ClientResponse[];
  onSelect: (response: ClientResponse) => void;
  showProbabilities?: boolean;
}

export interface InlineTipProps {
  tip: ScriptTip;
  onClose?: () => void;
}

export interface ROICalculatorProps {
  calculation: ROICalculation;
  onCalculate: (result: ROIResult) => void;
  prospectData?: Partial<Record<string, number>>;
}

export interface CulturalAdaptationProps {
  current: CultureType;
  options: CultureType[];
  onChange: (culture: CultureType) => void;
  showDetails?: boolean;
}

// =====================================================
// OBJECTION DATABASE TYPES
// =====================================================

export interface ObjectionDatabase {
  [phase: string]: EmbeddedObjection[];
}

export interface ObjectionSearchResult {
  objection: EmbeddedObjection;
  relevanceScore: number;
  matchedKeywords: string[];
}

// =====================================================
// SCRIPT NAVIGATION
// =====================================================

export interface ScriptNavigationItem {
  sectionId: string;
  sectionName: string;
  phase: CallPhase;
  completed: boolean;
  current: boolean;
  duration: string;
  goal: string;
}

// =====================================================
// TRAINING AND GUIDANCE
// =====================================================

export interface TrainingModule {
  id: string;
  title: string;
  phase: CallPhase;
  objectives: string[];
  keyTakeaways: string[];
  practiceScenarios: PracticeScenario[];
  successCriteria: string[];
}

export interface PracticeScenario {
  id: string;
  description: string;
  prospectProfile: ProspectInfo;
  expectedObjections: string[];
  successfulOutcomes: string[];
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
}
