/**
 * COMPREHENSIVE SCRIPT STRUCTURE - SAMPLE IMPLEMENTATION
 * Section 1: The Opening (0-30 seconds)
 * 
 * This demonstrates the new enhanced structure with:
 * - Embedded objections
 * - Multiple response options
 * - Anticipated client responses
 * - Inline tips and warnings
 * - Cultural variations
 * - Real conversation flow
 */

import { Industry } from './types';

// ==================== ENHANCED TYPE DEFINITIONS ====================

export interface ScriptSection {
  id: string;
  sectionNumber: number;
  sectionName: string;
  duration: string;
  goal: string;
  phase: 'opening' | 'qualification' | 'discovery' | 'pitch' | 'meeting-lock' | 'demo' | 'close' | 'contract' | 'follow-up';
}

export interface ConversationStep {
  stepId: string;
  speaker: 'agent' | 'client' | 'instruction';
  text: string;
  pauseAfter?: boolean;
  highlightText?: string;
  waitForResponse?: boolean;
}

export interface ClientResponse {
  response: string;
  type: 'positive' | 'neutral' | 'objection';
  probability: number; // Percentage
  nextStep: string;
  learningNote?: string;
}

export interface ObjectionResponse {
  approach: string;
  label: string; // e.g., "Response A", "Response B"
  whenToUse: string;
  successRate: string;
  script: ConversationStep[];
  tips?: ScriptTip[];
  warnings?: ScriptTip[];
  successPath: string;
  failurePath?: string;
}

export interface EmbeddedObjection {
  id: string;
  trigger: string;
  frequency: string; // e.g., "40% of calls"
  priority: 'critical' | 'high' | 'medium' | 'low';
  responseOptions: ObjectionResponse[];
  statistics?: {
    conversionRate: string;
    averageTime: string;
  };
}

export interface ScriptTip {
  type: 'success' | 'warning' | 'critical' | 'calculation' | 'info';
  icon: string;
  title: string;
  text: string;
  highlight?: boolean;
  actionable?: string;
}

export interface CulturalVariation {
  culture: 'arab' | 'indian' | 'western';
  greeting: ConversationStep[];
  toneGuidelines: string[];
  keyPhrases: string[];
  avoidPhrases: string[];
  culturalExpectations: string[];
  closingStyle: string;
}

export interface EnhancedScriptNode {
  // Section metadata
  section: ScriptSection;
  
  // Main conversation flow
  mainScript: {
    introduction: ConversationStep[];
    expectedClientResponses: ClientResponse[];
    continueScript?: ConversationStep[];
  };
  
  // Embedded objections that may arise
  embeddedObjections: EmbeddedObjection[];
  
  // Inline guidance
  tips: ScriptTip[];
  
  // Cultural adaptations
  culturalVariations?: CulturalVariation[];
  
  // ROI calculation if applicable
  roiCalculation?: {
    template: string;
    variables: string[];
    exampleValues: Record<string, number>;
  };
  
  // Navigation
  nextSection?: string;
  alternativePaths?: {
    label: string;
    condition: string;
    destination: string;
  }[];
}

// ==================== SECTION 1: THE OPENING ====================

export const section1Opening: EnhancedScriptNode = {
  section: {
    id: 'section-1',
    sectionNumber: 1,
    sectionName: 'The Opening',
    duration: '0-30 seconds',
    goal: 'Get 2 minutes of their time',
    phase: 'opening'
  },
  
  mainScript: {
    introduction: [
      {
        stepId: 'opening-greeting',
        speaker: 'agent',
        text: 'Good morning! Is this Mr. [Full Name]?',
        waitForResponse: true
      },
      {
        stepId: 'opening-wait',
        speaker: 'instruction',
        text: '[Wait for confirmation - they\'ll say "Yes" or "Speaking"]',
        pauseAfter: true
      }
    ],
    
    expectedClientResponses: [
      {
        response: 'Yes',
        type: 'positive',
        probability: 60,
        nextStep: 'opening-intro',
        learningNote: 'Direct confirmation - proceed immediately'
      },
      {
        response: 'Speaking',
        type: 'positive',
        probability: 30,
        nextStep: 'opening-intro',
        learningNote: 'Formal confirmation - shows professional attitude'
      },
      {
        response: 'Who is this?',
        type: 'neutral',
        probability: 10,
        nextStep: 'opening-identify-first',
        learningNote: 'Suspicious or cautious - need to build trust quickly'
      }
    ],
    
    continueScript: [
      {
        stepId: 'opening-intro',
        speaker: 'agent',
        text: 'Hi Mr. [Name], this is [Your Name] from Scholarix IT Solutions here in Dubai. I know you\'re running [Company Name] and probably very busy right now, so I\'ll be super direct - just need 2 minutes of your time. Is that okay?',
        highlightText: 'just need 2 minutes of your time',
        waitForResponse: true
      },
      {
        stepId: 'opening-pause',
        speaker: 'instruction',
        text: '[PAUSE - Wait for their response. They will either agree or object]',
        pauseAfter: true
      }
    ]
  },
  
  embeddedObjections: [
    {
      id: 'objection-opening-001',
      trigger: "I'm busy / No time / In a meeting",
      frequency: '40% of calls',
      priority: 'critical',
      statistics: {
        conversionRate: '65% overcome rate',
        averageTime: '45 seconds to resolve'
      },
      responseOptions: [
        {
          approach: 'Soft Approach',
          label: 'Response A (First Try)',
          whenToUse: 'First time they say they\'re busy. Shows empathy and creates curiosity.',
          successRate: '70%',
          script: [
            {
              stepId: 'busy-soft-1',
              speaker: 'agent',
              text: 'I completely understand, Sir. That\'s exactly why I\'m calling - you\'re too busy because of manual work eating your time.',
              pauseAfter: false
            },
            {
              stepId: 'busy-soft-2',
              speaker: 'agent',
              text: 'Just 90 seconds - if I can show you how to get back 20 hours weekly, would that be worth 90 seconds right now?',
              highlightText: 'get back 20 hours weekly',
              waitForResponse: true
            },
            {
              stepId: 'busy-soft-instruction',
              speaker: 'instruction',
              text: '[Wait for response. If they say "okay" or "fine" → Continue to Section 2: Authority Qualification]',
              pauseAfter: true
            }
          ],
          tips: [
            {
              type: 'success',
              icon: '💡',
              title: 'Why This Works',
              text: 'You\'re acknowledging their pain (being busy) and immediately offering value (20 hours back). This reframes the conversation from interruption to opportunity.'
            }
          ],
          successPath: 'section-2-authority',
          failurePath: 'objection-opening-001-response-b'
        },
        {
          approach: 'Reschedule',
          label: 'Response B (If Still Resistant)',
          whenToUse: 'They\'re genuinely busy or still resistant after Response A.',
          successRate: '50%',
          script: [
            {
              stepId: 'busy-reschedule-1',
              speaker: 'agent',
              text: 'No problem at all, Mr. [Name]. When would be better - this afternoon around 3 PM, or tomorrow morning around 10 AM?',
              highlightText: 'this afternoon around 3 PM, or tomorrow morning at 10 AM',
              waitForResponse: true
            },
            {
              stepId: 'busy-reschedule-instruction',
              speaker: 'instruction',
              text: '[Lock specific time - don\'t say "when are you free"]',
              pauseAfter: false
            },
            {
              stepId: 'busy-reschedule-client',
              speaker: 'client',
              text: 'Tomorrow at 10 AM is fine.',
              pauseAfter: false
            },
            {
              stepId: 'busy-reschedule-2',
              speaker: 'agent',
              text: 'Perfect! I\'ll call you tomorrow at 10 AM sharp. I\'ll be brief and valuable, I promise. Have a great day!',
              pauseAfter: false
            },
            {
              stepId: 'busy-reschedule-end',
              speaker: 'instruction',
              text: '[END CALL - Mark calendar - Call back exactly at scheduled time]',
              pauseAfter: true
            }
          ],
          warnings: [
            {
              type: 'critical',
              icon: '⚠️',
              title: 'CRITICAL MISTAKE TO AVOID',
              text: 'Never say "whenever you\'re free" or "call me back when you have time." They won\'t. YOU control the schedule. Lock a specific time or move on.',
              highlight: true
            }
          ],
          successPath: 'callback-scheduled',
          failurePath: 'disqualify-not-interested'
        }
      ]
    },
    {
      id: 'objection-opening-002',
      trigger: 'Not interested',
      frequency: '25% of calls',
      priority: 'high',
      statistics: {
        conversionRate: '45% overcome rate',
        averageTime: '60 seconds to resolve'
      },
      responseOptions: [
        {
          approach: 'Pattern Interrupt',
          label: 'Response: Reopen the Door',
          whenToUse: 'They say "not interested" without hearing what you do.',
          successRate: '45%',
          script: [
            {
              stepId: 'not-interested-1',
              speaker: 'agent',
              text: 'I appreciate your directness, Sir. Before I let you go, can I ask one quick question - is it because you\'re genuinely happy with your current operations and don\'t see any problems?',
              pauseAfter: false
            },
            {
              stepId: 'not-interested-2',
              speaker: 'agent',
              text: 'Or have you just heard too many sales pitches?',
              waitForResponse: true
            },
            {
              stepId: 'not-interested-pause',
              speaker: 'instruction',
              text: '[PAUSE - Wait for answer. They\'ll usually explain]',
              pauseAfter: true
            },
            {
              stepId: 'not-interested-option-a',
              speaker: 'client',
              text: 'Option A: "We\'re happy with what we have."',
              pauseAfter: false
            },
            {
              stepId: 'not-interested-response-a',
              speaker: 'agent',
              text: 'That\'s great to hear! Just curious though - if you could wave a magic wand and fix ONE thing in your daily operations, what would it be?',
              highlightText: 'wave a magic wand and fix ONE thing',
              waitForResponse: true
            },
            {
              stepId: 'not-interested-pivot',
              speaker: 'instruction',
              text: '[They\'ll tell you their pain - then pivot]',
              pauseAfter: false
            },
            {
              stepId: 'not-interested-close-a',
              speaker: 'agent',
              text: 'Interesting! That\'s exactly what we solve. Give me just 90 seconds to explain how, and if it\'s not relevant, I\'ll never call again. Fair?',
              waitForResponse: true
            },
            {
              stepId: 'not-interested-divider',
              speaker: 'instruction',
              text: '---OR---',
              pauseAfter: false
            },
            {
              stepId: 'not-interested-option-b',
              speaker: 'client',
              text: 'Option B: "I\'ve heard too many pitches."',
              pauseAfter: false
            },
            {
              stepId: 'not-interested-response-b',
              speaker: 'agent',
              text: 'I totally understand. Look, I\'m not here to waste your time with a pitch. But I am curious - are you currently spending hours daily on manual data entry, Excel coordination, and admin work?',
              waitForResponse: true
            },
            {
              stepId: 'not-interested-yes',
              speaker: 'instruction',
              text: '[They\'ll usually say yes]',
              pauseAfter: false
            },
            {
              stepId: 'not-interested-close-b',
              speaker: 'agent',
              text: 'That\'s costing you thousands monthly. Just give me 2 minutes to show you how to stop that bleeding. If it\'s not valuable, hang up. Deal?',
              waitForResponse: true
            }
          ],
          tips: [
            {
              type: 'success',
              icon: '💡',
              title: 'Why This Works',
              text: 'You\'re not arguing with their objection. You\'re getting curious about the reason behind it. This reopens the conversation and often reveals the real concern.',
              highlight: true
            }
          ],
          successPath: 'section-2-authority',
          failurePath: 'disqualify-not-interested'
        }
      ]
    },
    {
      id: 'objection-opening-003',
      trigger: 'Remove me from your list / Don\'t call again',
      frequency: '15% of calls',
      priority: 'critical',
      statistics: {
        conversionRate: '10% overcome rate (very low - respect their request)',
        averageTime: '30 seconds to resolve'
      },
      responseOptions: [
        {
          approach: 'Respectful Exit with Door Open',
          label: 'Response: Respectful Exit',
          whenToUse: 'They\'re angry or very firm about not wanting contact.',
          successRate: '10%',
          script: [
            {
              stepId: 'remove-list-1',
              speaker: 'agent',
              text: 'Absolutely, Sir. I apologize for the interruption. Before I remove you, may I ask - is it because this type of solution isn\'t relevant to your business, or just bad timing right now?',
              waitForResponse: true
            },
            {
              stepId: 'remove-list-wait',
              speaker: 'instruction',
              text: '[Wait for answer]',
              pauseAfter: true
            },
            {
              stepId: 'remove-list-not-relevant',
              speaker: 'instruction',
              text: 'If they say "NOT RELEVANT":',
              pauseAfter: false
            },
            {
              stepId: 'remove-list-response-relevant',
              speaker: 'agent',
              text: '"Understood completely. I\'ll remove you immediately. Sorry for bothering you. Have a great day."',
              pauseAfter: false
            },
            {
              stepId: 'remove-list-end-relevant',
              speaker: 'instruction',
              text: '[END CALL - Mark as "Do Not Call"]',
              pauseAfter: true
            },
            {
              stepId: 'remove-list-bad-timing',
              speaker: 'instruction',
              text: 'If they say "BAD TIMING":',
              pauseAfter: false
            },
            {
              stepId: 'remove-list-response-timing',
              speaker: 'agent',
              text: '"Got it. Should I follow up in 3 months when timing might be better, or would you prefer I never contact you again?"',
              waitForResponse: true
            },
            {
              stepId: 'remove-list-3months',
              speaker: 'instruction',
              text: '[If they say "3 months is fine"]:',
              pauseAfter: false
            },
            {
              stepId: 'remove-list-schedule',
              speaker: 'agent',
              text: '"Perfect! I\'ll mark my calendar to reach out in March. Thank you for your time, Sir."',
              pauseAfter: false
            },
            {
              stepId: 'remove-list-end-schedule',
              speaker: 'instruction',
              text: '[END CALL - Schedule follow-up for 3 months]',
              pauseAfter: true
            }
          ],
          warnings: [
            {
              type: 'critical',
              icon: '🛑',
              title: 'NEVER DO THIS',
              text: 'Don\'t argue, don\'t try to convince them after they ask to be removed, and don\'t call them again if they said "never contact." Respect builds reputation.',
              highlight: true,
              actionable: 'Mark as "Do Not Call" in CRM immediately'
            }
          ],
          successPath: 'follow-up-3-months',
          failurePath: 'disqualify-do-not-call'
        }
      ]
    }
  ],
  
  tips: [
    {
      type: 'success',
      icon: '💡',
      title: 'WHY THIS OPENING WORKS',
      text: 'You\'re showing respect for their time, being transparent about who you are, and asking permission. This lowers resistance and increases the chance they\'ll give you time.',
      highlight: false
    },
    {
      type: 'info',
      icon: '📊',
      title: 'Opening Success Rates',
      text: 'Expected conversion: 60 calls → 20 conversations (33%). If you\'re below this, review your tone and energy.',
      highlight: false
    }
  ],
  
  culturalVariations: [
    {
      culture: 'arab',
      greeting: [
        {
          stepId: 'arab-greeting',
          speaker: 'agent',
          text: 'Assalamu alaikum, Mr. Abdullah. This is [Your Name] from Scholarix IT Solutions. How are you today, Sir?',
          pauseAfter: false
        },
        {
          stepId: 'arab-wait',
          speaker: 'instruction',
          text: '[Let them respond - take time for pleasantries - don\'t rush]',
          pauseAfter: false
        },
        {
          stepId: 'arab-continue',
          speaker: 'agent',
          text: 'Alhamdulillah, I\'m well too, thank you for asking. I hope I\'m not disturbing you, Sir. I know you\'re busy running [Company Name]. May I take just 2 minutes of your valuable time?',
          highlightText: 'May I take just 2 minutes',
          waitForResponse: true
        }
      ],
      toneGuidelines: [
        'Use formal, respectful language',
        'Allow time for pleasantries',
        'Show patience - decisions take longer',
        'Emphasize relationship over transaction'
      ],
      keyPhrases: [
        'Inshallah (naturally, once per conversation)',
        'Alhamdulillah (when appropriate)',
        'Sir (consistently)',
        'Your valuable time',
        'With your permission'
      ],
      avoidPhrases: [
        'You need to decide now',
        'This is a limited time offer',
        'Your competitor already bought',
        'Skipping pleasantries'
      ],
      culturalExpectations: [
        'Relationship before business',
        'Respect and formality important',
        'Decisions take longer (consultation with family/partners)',
        'Personal connection matters more than ROI',
        'Face-to-face meetings preferred',
        'Religious references acceptable and appreciated'
      ],
      closingStyle: 'Softer language - "partners" not "clients", "together" not "you buy"'
    },
    {
      culture: 'indian',
      greeting: [
        {
          stepId: 'indian-greeting',
          speaker: 'agent',
          text: 'Good morning, Mr. Patel. This is [Your Name] from Scholarix IT Solutions here in Dubai.',
          pauseAfter: false
        },
        {
          stepId: 'indian-intro',
          speaker: 'agent',
          text: 'I\'ll be direct and respectful of your time, Sir. I help businesses reduce operational costs through automation. May I take 2 minutes to explain?',
          highlightText: 'reduce operational costs',
          waitForResponse: true
        }
      ],
      toneGuidelines: [
        'Provide detailed explanations',
        'Focus heavily on ROI and numbers',
        'Prepare for negotiation',
        'Be ready for multiple decision-makers',
        'Value thoroughness over speed'
      ],
      keyPhrases: [
        'Exact numbers and calculations',
        'ROI and savings',
        'Sir (respectful)',
        'Let me show you the mathematics',
        'Smart business decision'
      ],
      avoidPhrases: [
        'Best price first (leaves no room for negotiation)',
        'Take offense at price questions',
        'Skip technical details',
        'Rush the decision'
      ],
      culturalExpectations: [
        'Appreciate detailed explanations',
        'ROI and numbers very important',
        'Negotiation is expected and cultural',
        'Multiple decision-makers common',
        'Value thoroughness over speed',
        'Persistence is expected and respected'
      ],
      closingStyle: 'Detailed ROI emphasis with thorough number breakdowns'
    },
    {
      culture: 'western',
      greeting: [
        {
          stepId: 'western-greeting',
          speaker: 'agent',
          text: 'Hi David, this is [Your Name] from Scholarix. I\'ll keep this brief.',
          pauseAfter: false
        },
        {
          stepId: 'western-intro',
          speaker: 'agent',
          text: 'We automate manual business processes. You\'re probably losing around 25,000 AED monthly to inefficiency. I can show you how to fix that in 30 minutes. Worth a meeting?',
          highlightText: 'losing around 25,000 AED monthly',
          waitForResponse: true
        }
      ],
      toneGuidelines: [
        'Be direct and efficient',
        'Value time highly',
        'Focus on ROI and business case',
        'Professional and structured approach',
        'Clear timelines and deliverables'
      ],
      keyPhrases: [
        'I\'ll keep this brief',
        'Bottom line',
        'ROI',
        'Business case',
        'Clear timeline'
      ],
      avoidPhrases: [
        'Excessive small talk',
        'Vague about pricing',
        'Miss deadlines',
        'Over-explain obvious points'
      ],
      culturalExpectations: [
        'Value efficiency and directness',
        'Time is money - don\'t waste it',
        'ROI and business case critical',
        'Professional and structured approach',
        'Clear timelines and deliverables',
        'Less negotiation, more decision-making'
      ],
      closingStyle: 'Direct, no-nonsense with clear yes/no decision request'
    }
  ],
  
  nextSection: 'section-2-authority',
  
  alternativePaths: [
    {
      label: 'They agree to 2 minutes',
      condition: 'Positive response to time request',
      destination: 'section-2-authority'
    },
    {
      label: 'Objection encountered',
      condition: 'Any objection raised',
      destination: 'handle-embedded-objection'
    },
    {
      label: 'Hard rejection',
      condition: 'Strong no with "remove from list"',
      destination: 'disqualify-do-not-call'
    },
    {
      label: 'Reschedule callback',
      condition: 'They want to be called back later',
      destination: 'callback-scheduled'
    }
  ]
};

// ==================== USAGE EXAMPLE ====================

/**
 * How to use this enhanced structure in the CallApp component:
 * 
 * 1. Load the section
 * 2. Display main script steps sequentially
 * 3. Show anticipated client responses
 * 4. When objection triggered, show embedded responses
 * 5. Track which response option used
 * 6. Navigate to appropriate next step
 * 7. Apply cultural adaptation if selected
 */

export const getSectionById = (sectionId: string): EnhancedScriptNode | null => {
  // In production, this would query from a full script database
  if (sectionId === 'section-1') {
    return section1Opening;
  }
  return null;
};

export const getObjectionById = (objectionId: string): EmbeddedObjection | null => {
  const section = section1Opening;
  return section.embeddedObjections.find(obj => obj.id === objectionId) || null;
};

export const applyCulturalAdaptation = (
  section: EnhancedScriptNode,
  culture: 'arab' | 'indian' | 'western'
): ConversationStep[] => {
  const variation = section.culturalVariations?.find(v => v.culture === culture);
  return variation?.greeting || section.mainScript.introduction;
};
