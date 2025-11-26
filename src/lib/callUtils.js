export const calculateMetrics = (calls) => {
    const totalCalls = calls.length;
    if (totalCalls === 0) {
        return {
            totalCalls: 0,
            demosBooked: 0,
            conversionRate: 0,
            avgCallDuration: 0,
            qualificationBreakdown: {
                usesManualProcess: 0,
                painPointIdentified: 0,
                painQuantified: 0,
                valueAcknowledged: 0,
            },
        };
    }
    const demosBooked = calls.filter(c => c.outcome === 'demo-booked').length;
    const conversionRate = (demosBooked / totalCalls) * 100;
    const totalDuration = calls.reduce((sum, call) => sum + (call.duration || 0), 0);
    const avgCallDuration = totalDuration / totalCalls;
    const qualificationBreakdown = {
        usesManualProcess: calls.filter(c => c.qualification.usesManualProcess === true).length,
        painPointIdentified: calls.filter(c => c.qualification.painPointIdentified === true).length,
        painQuantified: calls.filter(c => c.qualification.painQuantified === true).length,
        valueAcknowledged: calls.filter(c => c.qualification.valueAcknowledged === true).length,
    };
    return {
        totalCalls,
        demosBooked,
        conversionRate,
        avgCallDuration,
        qualificationBreakdown,
    };
};
export const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
};
export const getQualificationProgress = (qualification) => {
    const checks = Object.values(qualification).filter(v => v !== null);
    const total = Object.keys(qualification).length;
    return (checks.length / total) * 100;
};
