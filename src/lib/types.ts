export type CallObjective = 'cold-call' | 'follow-up' | 'demo-booking';

export type CallOutcome = 'demo-booked' | 'follow-up' | 'disqualified' | 'no-answer' | 'in-progress';

export type ResponseType = 'positive' | 'negative' | 'neutral' | 'objection';

export interface ProspectInfo {
  name: string;
  company: string;
  industry: string;
  phone: string;
}

export interface ScriptNode {
  id: string;
  text: string;
  type: 'question' | 'statement' | 'objection' | 'close';
  responses?: ScriptResponse[];
  qualificationUpdate?: Partial<QualificationStatus>;
  nextNodeId?: string;
}

export interface ScriptResponse {
  label: string;
  type: ResponseType;
  nextNodeId: string;
  qualificationUpdate?: Partial<QualificationStatus>;
}

export interface QualificationStatus {
  rightPerson: boolean | null;
  usingExcel: boolean | null;
  painLevel: number | null;
  hasAuthority: boolean | null;
  budgetDiscussed: boolean | null;
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
  recordingData?: string;
}

export interface CallMetrics {
  totalCalls: number;
  demosBooked: number;
  conversionRate: number;
  avgCallDuration: number;
  qualificationBreakdown: {
    rightPerson: number;
    usingExcel: number;
    hasAuthority: number;
    budgetDiscussed: number;
  };
}
