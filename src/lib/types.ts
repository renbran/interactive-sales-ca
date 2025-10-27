export type Industry = 'real-estate' | 'retail' | 'trading' | 'logistics' | 'consulting';

export type CallObjective = 'cold-call' | 'follow-up' | 'demo-confirmation';

export type CallOutcome = 'demo-booked' | 'follow-up-scheduled' | 'not-interested' | 'no-answer' | 'in-progress';

export type ResponseType = 'positive' | 'negative' | 'neutral' | 'objection';

export type CallPhase = 'opening' | 'discovery' | 'teaching' | 'demo-offer' | 'objection' | 'close';

export interface ProspectInfo {
  name: string;
  title: string;
  company: string;
  industry: Industry;
  phone: string;
  email?: string;
  whatsapp?: string;
}

export interface ScriptNode {
  id: string;
  phase: CallPhase;
  text: string;
  type: 'question' | 'statement' | 'objection-handler' | 'close';
  responses?: ScriptResponse[];
  qualificationUpdate?: Partial<QualificationStatus>;
  nextNodeId?: string;
  tips?: string;
}

export interface ScriptResponse {
  label: string;
  type: ResponseType;
  nextNodeId: string;
  qualificationUpdate?: Partial<QualificationStatus>;
}

export interface QualificationStatus {
  usesManualProcess: boolean | null;
  painPointIdentified: boolean | null;
  painQuantified: boolean | null;
  valueAcknowledged: boolean | null;
  timeCommitted: boolean | null;
  demoBooked: boolean | null;
}

export interface CallRecord {
  id: string;
  prospectInfo: ProspectInfo;
  objective: CallObjective;
  startTime: number;
  endTime?: number;
  duration?: number;
  outcome: CallOutcome;
  qualification: QualificationStatus;
  notes: string;
  scriptPath: string[];
  recordingUrl?: string;
  recordingDuration?: number;
}

export interface CallMetrics {
  totalCalls: number;
  demosBooked: number;
  conversionRate: number;
  avgCallDuration: number;
  qualificationBreakdown: {
    usesManualProcess: number;
    painPointIdentified: number;
    painQuantified: number;
    valueAcknowledged: number;
  };
}
