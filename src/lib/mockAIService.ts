// Mock AI service for when OpenAI is unavailable
// Provides helpful fallback responses for objections and call summaries

export interface MockAIService {
  generateObjectionResponse(objection: string, context: { industry: string; painPoint?: string }): Promise<string>;
  generateCallSummary(callData: any): Promise<string>;
  generateFollowUpSuggestions(callData: any): Promise<string[]>;
}

export const mockAIService: MockAIService = {
  async generateObjectionResponse(objection: string, context: { industry: string; painPoint?: string }): Promise<string> {
    const lowerObjection = objection.toLowerCase();
    
    // Price objections
    if (lowerObjection.includes('expensive') || lowerObjection.includes('cost') || lowerObjection.includes('price')) {
      return `I understand cost is always a consideration for ${context.industry} businesses. What I've found is that most companies see a return on investment within 3-6 months through improved efficiency and reduced manual work. Would you be interested in seeing how companies similar to yours have calculated their ROI from automation?`;
    }
    
    // Time objections
    if (lowerObjection.includes('time') || lowerObjection.includes('busy') || lowerObjection.includes('later')) {
      return `I completely understand - you're busy running your ${context.industry} business. That's exactly why companies implement our solution - to free up time from manual processes. Could I show you a quick 10-minute demo of how this could save you hours each week?`;
    }
    
    // Current system objections
    if (lowerObjection.includes('current system') || lowerObjection.includes('works fine') || lowerObjection.includes('happy')) {
      return `That's great that your current system is working. Many of our clients felt the same way initially. The question is: while it's working, could it be working better? What if you could reduce manual data entry by 80% - would that be worth exploring?`;
    }
    
    // Think about it / need to discuss
    if (lowerObjection.includes('think about') || lowerObjection.includes('discuss') || lowerObjection.includes('partner') || lowerObjection.includes('team')) {
      return `Of course, this is an important decision for your company. What questions can I answer now that would help you in those discussions? Also, would it be helpful if I provided you with a trial period so your team can see the benefits firsthand?`;
    }
    
    // Send information
    if (lowerObjection.includes('send') || lowerObjection.includes('email') || lowerObjection.includes('information')) {
      return `I'd be happy to send you information. However, I've found that a brief 15-minute live demo is much more effective than any brochure. It allows me to show exactly how this would work for your specific ${context.industry} processes. Would you prefer to schedule that for later this week or could we do a quick walkthrough now?`;
    }
    
    // Competitor objections
    if (lowerObjection.includes('competitor') || lowerObjection.includes('other') || lowerObjection.includes('compare')) {
      return `Smart approach to compare options. What I can tell you is that our clients chose us because of our industry-specific features for ${context.industry}. Rather than me telling you why we're different, would you like to see a side-by-side comparison during a demo?`;
    }
    
    // Generic fallback
    return `I appreciate you sharing that concern with me. That's exactly the kind of feedback that helps me understand your situation better. Let me ask you this - if we could address that specific concern and show you how other ${context.industry} companies overcame similar challenges, would you be open to exploring this further?`;
  },

  async generateCallSummary(callData: any): Promise<string> {
    const { prospectInfo, duration, outcome, qualification } = callData;
    const callMinutes = Math.round(duration / 60);
    
    return `**Call Summary - ${prospectInfo.name} (${prospectInfo.company})**

• **Duration:** ${callMinutes} minutes
• **Industry:** ${prospectInfo.industry}
• **Outcome:** ${outcome.replace('-', ' ').toUpperCase()}

**Key Discussion Points:**
• Discussed current ${prospectInfo.industry} processes and challenges
• Identified potential areas for improvement and automation
• ${qualification.painPointIdentified ? '✅ Pain point identified and acknowledged' : '❌ Need to better identify specific pain points'}
• ${qualification.valueAcknowledged ? '✅ Value proposition understood' : '❌ Need to better communicate value'}

**Next Steps:**
${outcome === 'demo-booked' ? '🎯 Demo scheduled - prepare industry-specific examples' : 
  outcome === 'follow-up-scheduled' ? '📅 Follow-up scheduled - send relevant case studies' :
  '📞 Schedule follow-up call to continue discussion'}

**Notes:**
Add any specific details about the conversation, objections raised, or particular interests mentioned by the prospect.`;
  },

  async generateFollowUpSuggestions(callData: any): Promise<string[]> {
    const { prospectInfo, outcome } = callData;
    
    const suggestions: string[] = [];
    
    if (outcome === 'demo-booked') {
      suggestions.push(
        `1. Prepare ${prospectInfo.industry}-specific demo scenarios and examples`,
        `2. Send calendar invite with demo agenda and any prep materials`,
        `3. Research ${prospectInfo.company} online to personalize the demo`
      );
    } else if (outcome === 'follow-up-scheduled') {
      suggestions.push(
        `1. Send relevant case studies for ${prospectInfo.industry} companies`,
        `2. Prepare ROI calculator specific to their business size`,
        `3. Schedule follow-up call with implementation timeline`
      );
    } else if (outcome === 'not-interested') {
      suggestions.push(
        `1. Send a thank-you email and stay connected on LinkedIn`,
        `2. Add to quarterly newsletter list for industry updates`,
        `3. Set reminder to follow up in 6 months when situation may change`
      );
    } else {
      suggestions.push(
        `1. Send personalized follow-up email within 24 hours`,
        `2. Include relevant resources based on discussed pain points`,
        `3. Propose specific next steps (demo, trial, or discovery call)`
      );
    }
    
    return suggestions;
  }
};