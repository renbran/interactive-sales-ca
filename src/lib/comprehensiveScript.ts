/**
 * Comprehensive Sales Script with Embedded Objections
 * Based on the 3,452-line Scholarix Sales Mastery Script
 * 
 * This script provides a complete conversation flow with:
 * - Embedded objections for fast response
 * - Cultural adaptations (Arab, Indian, Western)
 * - ROI calculations
 * - Analytics tracking
 */

import {
  ScriptSection,
  MainScript,
  EmbeddedObjection,
  ObjectionResponse,
  ScriptTip,
  CulturalVariation,
  ScriptResponse,
  CallPhase,
} from './types/enhancedScriptTypes';

// =============================================================================
// SECTION 1: THE OPENING (0-30 seconds)
// =============================================================================

export const section1Opening: ScriptSection = {
  id: 'section-1-opening',
  sectionNumber: 1,
  sectionName: 'The Opening',
  duration: '0-30 seconds',
  goal: 'Get 2 minutes of their time',
  phase: 'opening' as CallPhase,

  mainScript: {
    agent: `Good morning! Is this Mr. [Full Name]?

[Wait for confirmation - they'll say "Yes" or "Speaking"]

Hi Mr. [Name], this is [Your Name] from Scholarix IT Solutions here in Dubai. I know you're running [Company Name] and probably very busy right now, so I'll be super direct - just need 2 minutes of your time. Is that okay?`,

    expectedClientResponses: [
      {
        response: 'Yes, go ahead',
        type: 'positive',
        nextStep: 'continue-to-authority',
        probability: 35,
      },
      {
        response: "I'm busy / No time / In a meeting",
        type: 'objection',
        nextStep: 'objection-busy',
        probability: 40,
        handleWith: 'obj-001-busy',
      },
      {
        response: 'Not interested',
        type: 'objection',
        nextStep: 'objection-not-interested',
        probability: 20,
        handleWith: 'obj-002-not-interested',
      },
      {
        response: 'Remove me from your list',
        type: 'objection',
        nextStep: 'objection-remove',
        probability: 5,
        handleWith: 'obj-003-remove',
      },
    ],

    pauseInstructions: 'STOP TALKING - Wait for their response. First person to speak loses.',
    
    notes: [
      "Show respect for their time",
      "Be transparent about who you are",
      "Ask permission - lowers resistance"
    ]
  },

  embeddedObjections: [
    {
      id: 'obj-001-busy',
      trigger: "I'm busy / No time / In a meeting",
      priority: 'high',
      category: 'time-based',
      tags: ['opening', 'busy', 'time'],
      statistics: {
        frequency: '40% of opening calls',
        conversionRate: '65% overcome rate',
        averageTimeToHandle: '1-2 minutes',
        bestResponseApproach: 'Soft Approach',
      },
      responseOptions: [
        {
          approach: 'Soft Approach (First Try)',
          whenToUse: "First time they say they are busy. Shows empathy and creates curiosity.",
          script: `I completely understand, Sir. That is exactly why I am calling - you are too busy because of manual work eating your time.

Just 90 seconds - if I can show you how to get back 20 hours weekly, would that be worth 90 seconds right now?

[PAUSE - Wait for response. If they say okay or fine then Continue to Section 2]`,
          successPath: 'section-2-authority',
          failurePath: 'obj-001-busy-response-b',
          successRate: 70,
          tips: [
            'Use Sir to show respect',
            'Quantify the benefit (20 hours weekly)',
            'Ask for very small commitment (90 seconds)',
          ],
          warnings: [
            "Do not sound desperate or pushy",
            "Do not apologize for calling them",
          ],
        },
        {
          approach: 'Reschedule',
          whenToUse: "They are genuinely busy or still resistant after Response A.",
          script: `No problem at all, Mr. [Name]. When would be better - this afternoon around 3 PM, or tomorrow morning around 10 AM?

[Lock specific time - do not say when are you free]

CLIENT: Tomorrow at 10 AM is fine.

Perfect! I will call you tomorrow at 10 AM sharp. I will be brief and valuable, I promise. Have a great day!

[END CALL - Mark calendar - Call back exactly at scheduled time]`,
          successPath: 'schedule-callback',
          failurePath: 'disqualify-timing',
          successRate: 50,
          tips: [
            'Give two specific options, not open-ended',
            'Confirm exact time and date',
            'Set clear expectations',
            'Actually call at the promised time',
          ],
          warnings: [
            "Never say whenever you are free - they will not call back",
            "Never say call me back when you have time - you lose control",
          ],
        },
      ],
    },
    {
      id: 'obj-002-not-interested',
      trigger: 'Not interested',
      priority: 'high',
      category: 'need-based',
      tags: ['opening', 'rejection', 'not-interested'],
      statistics: {
        frequency: '20% of opening calls',
        conversionRate: '45% overcome rate',
        averageTimeToHandle: '2-3 minutes',
        bestResponseApproach: 'Pattern Interrupt',
      },
      responseOptions: [
        {
          approach: 'Pattern Interrupt (Reopen the Door)',
          whenToUse: "They say not interested without hearing what you do.",
          script: `I appreciate your directness, Sir. Before I let you go, can I ask one quick question - is it because you are genuinely happy with your current operations and do not see any problems?

Or have you just heard too many sales pitches?

[PAUSE - Wait for answer. They will usually explain]

---IF THEY SAY We are happy with what we have---

That is great to hear! Just curious though - if you could wave a magic wand and fix ONE thing in your daily operations, what would it be?

[They will tell you their pain - then pivot]

Interesting! That is exactly what we solve. Give me just 90 seconds to explain how, and if it is not relevant, I will never call again. Fair?

---OR IF THEY SAY I have heard too many pitches---

I totally understand. Look, I am not here to waste your time with a pitch. But I am curious - are you currently spending hours daily on manual data entry, Excel coordination, and admin work?

[They will usually say yes]

That is costing you thousands monthly. Just give me 2 minutes to show you how to stop that bleeding. If it is not valuable, hang up. Deal?`,
          successPath: 'section-2-authority',
          failurePath: 'disqualify-no-interest',
          successRate: 45,
          tips: [
            "Do not argue with their objection",
            'Get curious about the reason behind it',
            'Reopen with questions, not statements',
            'Create small commitments (90 seconds, 2 minutes)',
          ],
          warnings: [
            "Do not keep pushing if they firmly decline",
            'Respect their decision after 2 attempts',
          ],
        },
      ],
    },
    {
      id: 'obj-003-remove',
      trigger: 'Remove me from your list / Do not call again',
      priority: 'high',
      category: 'trust-based',
      tags: ['opening', 'angry', 'remove', 'do-not-call'],
      statistics: {
        frequency: '5% of opening calls',
        conversionRate: '15% overcome rate',
        averageTimeToHandle: '1 minute',
        bestResponseApproach: 'Respectful Exit with Door Open',
      },
      responseOptions: [
        {
          approach: 'Respectful Exit with Door Open',
          whenToUse: "They are angry or very firm about not wanting contact.",
          script: `Absolutely, Sir. I apologize for the interruption. Before I remove you, may I ask - is it because this type of solution is not relevant to your business, or just bad timing right now?

[Wait for answer]

---IF THEY SAY NOT RELEVANT---
Understood completely. I will remove you immediately. Sorry for bothering you. Have a great day.

[END CALL - Mark as Do Not Call]

---IF THEY SAY BAD TIMING---
Got it. Should I follow up in 3 months when timing might be better, or would you prefer I never contact you again?

[If they say 3 months is fine:]
Perfect! I will mark my calendar to reach out in March. Thank you for your time, Sir.

[END CALL - Schedule follow-up for 3 months]`,
          successPath: 'schedule-future-callback',
          failurePath: 'disqualify-do-not-call',
          successRate: 15,
          tips: [
            'Always apologize and show respect',
            'Give them control of the situation',
            'Find out WHY they want removal',
            'Offer future callback option if timing-based',
          ],
          warnings: [
            'NEVER call them again if they said never contact',
            "Do not argue or try to convince after removal request",
            'Respect builds reputation - honor their request',
          ],
        },
      ],
    },
  ],

  tips: [
    {
      type: 'success',
      icon: '💡',
      title: 'WHY THIS OPENING WORKS',
      text: "You are showing respect for their time, being transparent about who you are, and asking permission. This lowers resistance and increases the chance they will give you time.",
      highlight: true,
    },
    {
      type: 'critical',
      icon: '🛑',
      title: 'NEVER DO THIS',
      text: 'Never say whenever you are free or call me back when you have time. They will not. YOU control the schedule. Lock a specific time or move on.',
      highlight: true,
    },
    {
      type: 'warning',
      icon: '⚠️',
      title: 'THE SILENCE RULE',
      text: 'After asking Is that okay?, STOP TALKING. Count to 5 in your head. Let the silence create pressure. First person to speak loses.',
    },
  ],

  culturalVariations: {
    arab: {
      culture: 'arab',
      greeting: 'Assalamu alaikum, Mr. [Name]. This is [Your Name] from Scholarix IT Solutions. How are you today, Sir?\n\n[Let them respond - take time for pleasantries - do not rush]\n\nAlhamdulillah, I am well too, thank you for asking.\n\nI hope I am not disturbing you, Sir. I know you are busy running [Company Name]. May I take just 2 minutes of your valuable time?',
      tone: 'Formal, respectful, relationship-first',
      keyPhrases: [
        'Use Inshallah naturally once per conversation',
        'Ask about their business and family (briefly)',
        'Show respect with Sir consistently',
        'Be patient - decisions take longer',
      ],
      avoidPhrases: [
        'You need to decide now (too aggressive)',
        'This is a limited time offer (feels manipulative)',
        'Your competitor already bought (loss of face)',
        'Skip pleasantries and go straight to business (disrespectful)',
      ],
      expectations: [
        'Relationship building before business',
        'Formal and respectful tone',
        'Longer decision-making process',
        'Personal connection matters more than ROI',
        'Face-to-face meetings preferred',
      ],
      closingStyle: 'Soft, relationship-focused, use partners not clients',
      decisionMakingStyle: 'Consultative with family/partners, slower process',
      negotiationApproach: 'Build trust first, then discuss terms',
    },
    indian: {
      culture: 'indian',
      greeting: 'Good morning, Mr. [Name]. This is [Your Name] from Scholarix IT Solutions here in Dubai.\n\nI will be direct and respectful of your time, Sir. I help businesses reduce operational costs through automation. May I take 2 minutes to explain?',
      tone: 'Detailed, ROI-focused, expect negotiation',
      keyPhrases: [
        'Provide detailed ROI calculations',
        'Show technical specifications clearly',
        'Expect and prepare for negotiation',
        'Be prepared for multiple decision-makers',
      ],
      avoidPhrases: [
        'Give your best price first (leaves no negotiation room)',
        'Take offense at price objections (it is cultural)',
        'Skip technical details (they want to understand fully)',
        'Rush the decision (they need time to analyze)',
      ],
      expectations: [
        'Detailed explanations appreciated',
        'ROI and numbers very important',
        'Negotiation is expected and cultural',
        'Multiple decision-makers common',
        'Value thoroughness over speed',
      ],
      closingStyle: 'Detailed with numbers, expect negotiation',
      decisionMakingStyle: 'Analytical, multiple stakeholders involved',
      negotiationApproach: 'Provide value-adds instead of discounts',
    },
    western: {
      culture: 'western',
      greeting: 'Hi [FirstName], this is [Your Name] from Scholarix. I will keep this brief.\n\nWe automate manual business processes. You are probably losing around 25,000 AED monthly to inefficiency.\n\nI can show you how to fix that in 30 minutes. Worth a meeting?',
      tone: 'Direct, efficient, time-focused',
      keyPhrases: [
        'Be efficient and direct',
        'Focus on ROI and business case',
        'Provide clear timelines and deliverables',
        'Be professional and structured',
      ],
      avoidPhrases: [
        'Waste time with excessive small talk',
        'Be vague about pricing or terms',
        'Miss deadlines or commitments',
        'Over-explain obvious points',
      ],
      expectations: [
        'Value efficiency and directness',
        'Time is money - do not waste it',
        'ROI and business case critical',
        'Professional and structured approach',
        'Clear timelines and deliverables',
      ],
      closingStyle: 'Direct ask, clear yes/no decision',
      decisionMakingStyle: 'Quick, individual or small team',
      negotiationApproach: 'Less negotiation, more decision-making',
    },
  },

  responses: [
    {
      label: 'They agree to give 2 minutes',
      type: 'positive',
      nextNodeId: 'section-2-authority',
      qualificationUpdate: {
        status: 'engaged',
        score: 20,
        notes: 'Agreed to initial conversation',
      },
    },
    {
      label: 'Handle busy objection',
      type: 'objection',
      nextNodeId: 'obj-001-busy',
    },
    {
      label: 'Handle not interested objection',
      type: 'objection',
      nextNodeId: 'obj-002-not-interested',
    },
    {
      label: 'Handle removal request',
      type: 'objection',
      nextNodeId: 'obj-003-remove',
    },
  ],

  checklistItems: [
    'Confirm you are speaking with the right person',
    'Introduce yourself and company clearly',
    'Ask permission for 2 minutes',
    'Be ready with busy objection response',
  ],

  warnings: [
    'Never skip the permission ask - it builds trust',
    'Never argue if they ask to be removed - respect it',
    'Control the follow-up - do not let them say call me back',
  ],
};

// =============================================================================
// SECTION 2: AUTHORITY QUALIFICATION (30 sec - 1 min)
// =============================================================================

export const section2Authority: ScriptSection = {
  id: 'section-2-authority',
  sectionNumber: 2,
  sectionName: 'Authority Qualification',
  duration: '30 seconds - 1 minute',
  goal: 'Confirm you are talking to a decision-maker BEFORE investing time',
  phase: 'authority-qualification' as CallPhase,

  mainScript: {
    agent: `Great! Before we go further, let me ask - when it comes to investing in technology or systems for your business, are you the person who makes those decisions, or is there a partner or manager involved?

[CRITICAL MOMENT - Their answer determines if you continue or reschedule. Listen carefully.]`,

    expectedClientResponses: [
      {
        response: 'Yes, I make the decisions',
        type: 'positive',
        nextStep: 'continue-to-discovery',
        probability: 50,
      },
      {
        response: 'I need to check with my partner/boss',
        type: 'objection',
        nextStep: 'objection-partner-involved',
        probability: 35,
        handleWith: 'obj-004-partner',
      },
      {
        response: 'Just send me information first',
        type: 'objection',
        nextStep: 'objection-send-info',
        probability: 15,
        handleWith: 'obj-005-send-info',
      },
    ],

    continueScript: `Perfect! Then you are exactly who I need to speak with. Let me ask you a few quick questions about your current operations...

[Move to Section 3: Discovery]`,

    pauseInstructions: 'WAIT for their answer. This determines if you are wasting your time or talking to the real decision-maker.',
  },

  embeddedObjections: [
    {
      id: 'obj-004-partner',
      trigger: 'I need to check with my partner/boss/finance team',
      priority: 'high',
      category: 'authority-based',
      tags: ['authority', 'partner', 'decision-maker'],
      statistics: {
        frequency: '35% of authority questions',
        conversionRate: '60% overcome rate',
        averageTimeToHandle: '3-4 minutes',
        bestResponseApproach: 'Include Them Now',
      },
      responseOptions: [
        {
          approach: 'Include Them Now (Best Option)',
          whenToUse: "The decision-maker is available or nearby.",
          script: `That makes perfect sense, Mr. [Name]. Here is what I have learned from working with hundreds of businesses - when the decision-maker is not part of the initial conversation, we end up having to repeat everything twice, and important details get lost in translation.

What makes more sense: Can you bring [decision-maker] into this call right now? Or should I call back when you and [decision-maker] can both join for 30 minutes together?

[PAUSE - Let them decide]

---IF THEY SAY Let me get him/her now---
Perfect! I will hold while you grab them.

[Wait on the line - when both are present, restart from opening]

Great! Thank you both for taking the time. Let me quickly introduce myself...

[Continue to Section 3 with BOTH decision-makers present]`,
          successPath: 'section-3-discovery',
          failurePath: 'obj-004-partner-response-b',
          successRate: 75,
          tips: [
            'Position it as efficiency, not pushiness',
            'Explain the value of having everyone together',
            'Wait patiently while they get the partner',
          ],
        },
        {
          approach: 'Schedule Joint Call (If Not Available Now)',
          whenToUse: "Decision-maker is not available right now.",
          script: `I completely understand. Here is what works best - let us schedule a time when you and [decision-maker] can both join for 30 minutes. That way, you both hear the same information, can ask questions together, and make a decision together.

When are you both typically available? Mornings or afternoons work better?

[They will suggest a time]

Perfect! How about Thursday at 11 AM? I will send a calendar invite to both of you.

What is [decision-maker]'s email address?

[Get both emails, send invite immediately after call]

Excellent! I will send the invite in the next 5 minutes. You will both receive it. Looking forward to showing you both how we can transform your operations. Have a great day!

[END CALL - Send invite immediately - Mark as Joint Meeting Scheduled]`,
          successPath: 'schedule-joint-meeting',
          failurePath: 'obj-004-partner-response-c',
          successRate: 65,
          tips: [
            'Lock specific time with both people',
            'Get both email addresses',
            'Send invite immediately (within 5 minutes)',
            'Follow up day before meeting',
          ],
        },
      ],
    },
    {
      id: 'obj-005-send-info',
      trigger: 'Just send me information first',
      priority: 'medium',
      category: 'timing-based',
      tags: ['authority', 'information', 'delay'],
      statistics: {
        frequency: '15% of authority questions',
        conversionRate: '50% overcome rate',
        averageTimeToHandle: '2-3 minutes',
        bestResponseApproach: 'Meeting Value Reframe',
      },
      responseOptions: [
        {
          approach: 'Meeting Value Reframe',
          whenToUse: "They want to review information before committing to a meeting.",
          script: `I totally understand, Mr. [Name]. Here is the challenge though - every business is unique. What works for a restaurant will not work for a trading company, right?

I can send you generic information, but it will not show you what this looks like for YOUR specific business with YOUR specific challenges.

The meeting is actually more valuable because I will show you YOUR processes automated, not generic examples. You can ask questions specific to your situation.

It is just 30 minutes, and honestly - if after 10 minutes you feel it is not valuable, you can end the call. You are in complete control. Fair enough?

I have two slots available: Thursday 11 AM or Friday 3 PM. Which works better for your schedule?

[PAUSE - Push for the meeting first]`,
          successPath: 'section-3-discovery',
          failurePath: 'send-info-schedule-meeting',
          successRate: 50,
          tips: [
            'Always push for meeting first',
            'Position meeting as MORE valuable than document',
            'If you must send info, lock tentative meeting immediately',
            'Send both info AND calendar invite together',
          ],
          warnings: [
            "Do not just send info and hope - they will not call back",
            'Always include next-step commitment',
          ],
        },
      ],
    },
  ],

  tips: [
    {
      type: 'critical',
      icon: '🛑',
      title: 'THIS IS YOUR NEW SUPERPOWER',
      text: 'Master this section and you will stop wasting 50% of your time on people who cannot buy. This single change will double your conversion rate.',
      highlight: true,
    },
    {
      type: 'warning',
      icon: '⚠️',
      title: 'THE GOLDEN RULE',
      text: "If you cannot get the actual decision-maker on the call within 2 attempts, DO NOT book the meeting. You will waste your time presenting to someone who cannot buy. Mark them for follow-up in 1 month.",
    },
    {
      type: 'success',
      icon: '💡',
      title: 'PRO TIP',
      text: "If you send information, ALWAYS include a calendar invite for a follow-up call. Do not just send info and hope they will call you back. They will not.",
    },
  ],

  culturalVariations: {
    arab: {
      culture: 'arab',
      greeting: 'Authority questions require patience',
      tone: 'Respectful, understanding of family/partnership dynamics',
      keyPhrases: [
        'May I suggest we include your partner in our next discussion?',
        'I understand you consult with your team - that shows wisdom',
        'When would be a good time for us all to meet together?',
      ],
      avoidPhrases: [
        'You need to decide alone',
        'Why do you need to check with someone?',
        'Are you not the decision-maker?',
      ],
      expectations: [
        'Multiple stakeholders normal',
        'Family business dynamics',
        'Respect hierarchy',
      ],
      closingStyle: 'Inclusive, respectful of relationships',
      decisionMakingStyle: 'Consultative, takes time',
      negotiationApproach: 'Include all stakeholders early',
    },
    indian: {
      culture: 'indian',
      greeting: 'Authority questions handled professionally',
      tone: 'Professional, understanding of business structure',
      keyPhrases: [
        'I appreciate you want to involve your team',
        'Let us schedule with all decision-makers',
        'Who else should be part of this discussion?',
      ],
      avoidPhrases: [
        'Why do you need approval?',
        'Cannot you decide alone?',
        'This is wasting time',
      ],
      expectations: [
        'Multiple approvals expected',
        'Hierarchical decision-making',
        'Value thoroughness',
      ],
      closingStyle: 'Include all stakeholders',
      decisionMakingStyle: 'Structured, multiple levels',
      negotiationApproach: 'Present to group, not individual',
    },
    western: {
      culture: 'western',
      greeting: 'Direct authority qualification',
      tone: 'Direct, efficient',
      keyPhrases: [
        'Are you the decision-maker?',
        'Who else needs to be involved?',
        'Let us get everyone in one meeting',
      ],
      avoidPhrases: [
        'Long explanations about why you need decision-maker',
        'Indirect questioning',
      ],
      expectations: [
        'Quick identification of decision-maker',
        'Efficient process',
        'Direct answers',
      ],
      closingStyle: 'Direct, efficient',
      decisionMakingStyle: 'Quick, fewer stakeholders',
      negotiationApproach: 'Work with identified decision-maker',
    },
  },

  responses: [
    {
      label: 'Decision-maker confirmed',
      type: 'positive',
      nextNodeId: 'section-3-discovery',
      qualificationUpdate: {
        status: 'qualified',
        score: 50,
        notes: 'Confirmed decision-maker authority',
      },
    },
    {
      label: 'Partner involved - handle objection',
      type: 'objection',
      nextNodeId: 'obj-004-partner',
    },
    {
      label: 'Wants information first',
      type: 'objection',
      nextNodeId: 'obj-005-send-info',
    },
  ],

  checklistItems: [
    'Confirm decision-making authority',
    'If partner involved, try to include them now',
    'Do not proceed without decision-maker access',
    'Lock specific next steps',
  ],
};

// =============================================================================
// EXPORT COMPREHENSIVE SCRIPT
// =============================================================================

export const comprehensiveScript: Record<string, ScriptSection> = {
  [section1Opening.id]: section1Opening,
  [section2Authority.id]: section2Authority,
  // Additional sections will be added here
};

// Helper function to get script by phase
export const getScriptByPhase = (phase: CallPhase): ScriptSection | undefined => {
  return Object.values(comprehensiveScript).find(section => section.phase === phase);
};

// Helper function to get next section
export const getNextSection = (currentSectionId: string): ScriptSection | undefined => {
  const currentSection = comprehensiveScript[currentSectionId];
  if (!currentSection) return undefined;
  
  const nextSectionNumber = currentSection.sectionNumber + 1;
  return Object.values(comprehensiveScript).find(
    section => section.sectionNumber === nextSectionNumber
  );
};

// Helper to get all objections from all sections
export const getAllObjections = (): EmbeddedObjection[] => {
  const allObjections: EmbeddedObjection[] = [];
  Object.values(comprehensiveScript).forEach(section => {
    allObjections.push(...section.embeddedObjections);
  });
  return allObjections;
};

// Helper to find objection by ID
export const getObjectionById = (objectionId: string): EmbeddedObjection | undefined => {
  const allObjections = getAllObjections();
  return allObjections.find(obj => obj.id === objectionId);
};
