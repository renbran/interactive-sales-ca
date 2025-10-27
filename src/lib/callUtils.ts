import { CallRecord, CallMetrics } from './types';

export const calculateMetrics = (calls: CallRecord[]): CallMetrics => {
  const totalCalls = calls.length;
  
  if (totalCalls === 0) {
    return {
      totalCalls: 0,
      demosBooked: 0,
      conversionRate: 0,
      avgCallDuration: 0,
      qualificationBreakdown: {
        rightPerson: 0,
        usingExcel: 0,
        hasAuthority: 0,
        budgetDiscussed: 0,
      },
    };
  }

  const demosBooked = calls.filter(c => c.outcome === 'demo-booked').length;
  const conversionRate = (demosBooked / totalCalls) * 100;
  
  const totalDuration = calls.reduce((sum, call) => sum + (call.duration || 0), 0);
  const avgCallDuration = totalDuration / totalCalls;

  const qualificationBreakdown = {
    rightPerson: calls.filter(c => c.qualification.rightPerson === true).length,
    usingExcel: calls.filter(c => c.qualification.usingExcel === true).length,
    hasAuthority: calls.filter(c => c.qualification.hasAuthority === true).length,
    budgetDiscussed: calls.filter(c => c.qualification.budgetDiscussed === true).length,
  };

  return {
    totalCalls,
    demosBooked,
    conversionRate,
    avgCallDuration,
    qualificationBreakdown,
  };
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export const getQualificationProgress = (qualification: Record<string, boolean | number | null>): number => {
  const checks = Object.values(qualification).filter(v => v !== null);
  const total = Object.keys(qualification).length;
  return (checks.length / total) * 100;
};
