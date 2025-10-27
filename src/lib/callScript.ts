import { ScriptNode, CallOutcome } from './types';

export const callScript: Record<string, ScriptNode> = {
  start: {
    id: 'start',
    type: 'statement',
    text: "Hi [Name], this is [Your Name] from [Company]. How are you today? I'll be brief - I'm calling businesses that use Excel for operations management. Do you have 90 seconds for a quick question?",
    responses: [
      { label: 'Yes', type: 'positive', nextNodeId: 'qualify-person' },
      { label: 'No / Busy', type: 'negative', nextNodeId: 'busy-objection' },
      { label: 'What is this about?', type: 'neutral', nextNodeId: 'clarify-purpose' }
    ]
  },
  
  'clarify-purpose': {
    id: 'clarify-purpose',
    type: 'statement',
    text: "Fair question! We help businesses automate their Excel-based processes. I'm calling to see if you're currently using spreadsheets for managing operations, and if so, whether you'd like to see a faster way. Does that make sense?",
    responses: [
      { label: 'Yes, continue', type: 'positive', nextNodeId: 'qualify-person' },
      { label: 'Not interested', type: 'negative', nextNodeId: 'end-not-interested' }
    ]
  },
  
  'busy-objection': {
    id: 'busy-objection',
    type: 'objection',
    text: "I understand you're busy. This will take 60 seconds max. If it's not relevant, I'll let you go immediately. Fair enough?",
    responses: [
      { label: 'Okay, go ahead', type: 'positive', nextNodeId: 'qualify-person' },
      { label: 'Call back later', type: 'neutral', nextNodeId: 'schedule-callback' },
      { label: 'Not interested', type: 'negative', nextNodeId: 'end-not-interested' }
    ]
  },
  
  'qualify-person': {
    id: 'qualify-person',
    type: 'question',
    text: "Quick question: Are you the person who handles operations and process decisions at [Company]?",
    responses: [
      { 
        label: 'Yes, that\'s me', 
        type: 'positive', 
        nextNodeId: 'qualify-excel',
        qualificationUpdate: { rightPerson: true }
      },
      { 
        label: 'No, someone else', 
        type: 'negative', 
        nextNodeId: 'ask-transfer',
        qualificationUpdate: { rightPerson: false }
      }
    ]
  },
  
  'ask-transfer': {
    id: 'ask-transfer',
    type: 'question',
    text: "No problem. Who would be the right person to speak with about your operations processes? Can you transfer me or provide their contact?",
    responses: [
      { label: 'I can transfer you', type: 'positive', nextNodeId: 'end-transfer' },
      { label: 'Contact [person]', type: 'neutral', nextNodeId: 'end-get-contact' },
      { label: 'Can\'t help', type: 'negative', nextNodeId: 'end-no-contact' }
    ]
  },
  
  'qualify-excel': {
    id: 'qualify-excel',
    type: 'question',
    text: "Perfect. Quick question: Are you currently using Excel or manual processes for tracking your operations, inventory, or projects?",
    responses: [
      { 
        label: 'Yes', 
        type: 'positive', 
        nextNodeId: 'assess-pain',
        qualificationUpdate: { usingExcel: true }
      },
      { 
        label: 'No, we use software', 
        type: 'negative', 
        nextNodeId: 'end-already-automated',
        qualificationUpdate: { usingExcel: false }
      },
      { 
        label: 'Some Excel, some software', 
        type: 'neutral', 
        nextNodeId: 'assess-pain',
        qualificationUpdate: { usingExcel: true }
      }
    ]
  },
  
  'assess-pain': {
    id: 'assess-pain',
    type: 'question',
    text: "I hear that a lot. Let me ask: How much of a pain point is it? On a scale of 1-10, where 1 is 'minor annoyance' and 10 is 'costing us serious time and money' - where would you put it?",
    responses: [
      { 
        label: '1-3 (Low)', 
        type: 'negative', 
        nextNodeId: 'low-pain-response',
        qualificationUpdate: { painLevel: 2 }
      },
      { 
        label: '4-6 (Medium)', 
        type: 'neutral', 
        nextNodeId: 'medium-pain-response',
        qualificationUpdate: { painLevel: 5 }
      },
      { 
        label: '7-8 (High)', 
        type: 'positive', 
        nextNodeId: 'check-authority',
        qualificationUpdate: { painLevel: 7 }
      },
      { 
        label: '9-10 (Urgent)', 
        type: 'positive', 
        nextNodeId: 'check-authority',
        qualificationUpdate: { painLevel: 9 }
      }
    ]
  },
  
  'low-pain-response': {
    id: 'low-pain-response',
    type: 'statement',
    text: "Got it. Since it's not a major issue right now, I don't want to waste your time. Can I send you some info to keep on file in case it becomes a bigger problem down the road?",
    responses: [
      { label: 'Sure, send info', type: 'neutral', nextNodeId: 'end-follow-up' },
      { label: 'No thanks', type: 'negative', nextNodeId: 'end-not-interested' }
    ]
  },
  
  'medium-pain-response': {
    id: 'medium-pain-response',
    type: 'statement',
    text: "Okay, so it's on your radar but not urgent. Here's what I suggest: Let me show you a 10-minute demo of how we solve this. If it's not a fit, you've only lost 10 minutes. But if it saves you even an hour a week, that's a big win. Sound fair?",
    responses: [
      { label: 'Yes, show me', type: 'positive', nextNodeId: 'check-authority' },
      { label: 'Maybe later', type: 'neutral', nextNodeId: 'future-pace' },
      { label: 'Not interested', type: 'negative', nextNodeId: 'end-not-interested' }
    ]
  },
  
  'check-authority': {
    id: 'check-authority',
    type: 'question',
    text: "Perfect. Quick question: Are you the person who can make the decision on a tool like this, or would you need to loop someone else in?",
    responses: [
      { 
        label: 'I make the decisions', 
        type: 'positive', 
        nextNodeId: 'discuss-budget',
        qualificationUpdate: { hasAuthority: true }
      },
      { 
        label: 'Need approval, but won\'t connect', 
        type: 'negative', 
        nextNodeId: 'end-gatekeeper',
        qualificationUpdate: { hasAuthority: false }
      },
      { 
        label: 'Can arrange joint meeting', 
        type: 'positive', 
        nextNodeId: 'discuss-budget',
        qualificationUpdate: { hasAuthority: true }
      }
    ]
  },
  
  'discuss-budget': {
    id: 'discuss-budget',
    type: 'question',
    text: "Great. Last question before we schedule: Our solution typically runs between $200-500 per month depending on your needs. Is that in the ballpark of what you'd consider for something that saves your team hours every week?",
    responses: [
      { 
        label: 'Yes, that works', 
        type: 'positive', 
        nextNodeId: 'book-demo',
        qualificationUpdate: { budgetDiscussed: true }
      },
      { 
        label: 'Too expensive', 
        type: 'negative', 
        nextNodeId: 'budget-objection',
        qualificationUpdate: { budgetDiscussed: true }
      },
      { 
        label: 'Need to see value first', 
        type: 'neutral', 
        nextNodeId: 'value-first',
        qualificationUpdate: { budgetDiscussed: true }
      }
    ]
  },
  
  'budget-objection': {
    id: 'budget-objection',
    type: 'objection',
    text: "I get it. Here's the thing: If your team is spending even 5 hours a week on manual Excel work, that's costing you more than our solution. How much time would you estimate your team spends on these manual processes?",
    responses: [
      { label: '5+ hours/week', type: 'positive', nextNodeId: 'value-first' },
      { label: 'Less than that', type: 'negative', nextNodeId: 'end-not-fit' },
      { label: 'Not sure', type: 'neutral', nextNodeId: 'value-first' }
    ]
  },
  
  'value-first': {
    id: 'value-first',
    type: 'statement',
    text: "Absolutely fair. That's exactly why I want to show you a demo - so you can see the ROI yourself. How about we schedule 15 minutes this week? I'll show you exactly how it works with your use case. No pressure, just information. What does your calendar look like?",
    responses: [
      { label: 'Let\'s schedule', type: 'positive', nextNodeId: 'book-demo' },
      { label: 'Let me check and get back', type: 'objection', nextNodeId: 'check-and-return' }
    ]
  },
  
  'check-and-return': {
    id: 'check-and-return',
    type: 'objection',
    text: "I appreciate that, but here's what usually happens: Life gets busy, this falls off your radar, and you're stuck with the same Excel problems six months from now. How about we pick a time right now - even if it's two weeks out - and you can always reschedule if needed. Fair?",
    responses: [
      { label: 'Okay, let\'s pick a time', type: 'positive', nextNodeId: 'book-demo' },
      { label: 'Email me instead', type: 'neutral', nextNodeId: 'end-follow-up' },
      { label: 'Not interested', type: 'negative', nextNodeId: 'takeaway-close' }
    ]
  },
  
  'takeaway-close': {
    id: 'takeaway-close',
    type: 'objection',
    text: "No problem at all. Can I ask - is it that you don't see this as a priority right now, or is there something else I'm missing?",
    responses: [
      { label: 'Not a priority', type: 'negative', nextNodeId: 'end-not-interested' },
      { label: 'Other concerns', type: 'neutral', nextNodeId: 'address-concerns' },
      { label: 'Actually, let\'s talk', type: 'positive', nextNodeId: 'book-demo' }
    ]
  },
  
  'address-concerns': {
    id: 'address-concerns',
    type: 'question',
    text: "Fair enough. What are your main concerns? Let me see if I can address them quickly.",
    responses: [
      { label: 'Concerns addressed', type: 'positive', nextNodeId: 'book-demo' },
      { label: 'Still hesitant', type: 'neutral', nextNodeId: 'end-follow-up' },
      { label: 'Not interested', type: 'negative', nextNodeId: 'end-not-interested' }
    ]
  },
  
  'future-pace': {
    id: 'future-pace',
    type: 'objection',
    text: "I understand. Let me ask: If we don't do something about this now, where do you see this problem being in 6 months? Better, worse, or the same?",
    responses: [
      { label: 'Worse / Same', type: 'positive', nextNodeId: 'value-first' },
      { label: 'We\'ll handle it', type: 'negative', nextNodeId: 'end-not-interested' }
    ]
  },
  
  'book-demo': {
    id: 'book-demo',
    type: 'close',
    text: "Perfect! I'm looking at my calendar now. I have availability on [Day] at [Time] or [Day] at [Time]. Which works better for you?",
    responses: [
      { 
        label: 'First option', 
        type: 'positive', 
        nextNodeId: 'confirm-demo',
        qualificationUpdate: { demoBooked: true }
      },
      { 
        label: 'Second option', 
        type: 'positive', 
        nextNodeId: 'confirm-demo',
        qualificationUpdate: { demoBooked: true }
      },
      { 
        label: 'Different time', 
        type: 'neutral', 
        nextNodeId: 'confirm-demo',
        qualificationUpdate: { demoBooked: true }
      }
    ]
  },
  
  'confirm-demo': {
    id: 'confirm-demo',
    type: 'statement',
    text: "Excellent! I'm sending you a calendar invite right now to [email/phone]. You'll get a confirmation with a Zoom link. I'll send a quick prep email so we can make the most of our time. Looking forward to showing you how this can solve your Excel headaches!",
    nextNodeId: 'end-demo-booked'
  },
  
  'schedule-callback': {
    id: 'schedule-callback',
    type: 'question',
    text: "No problem. What's a better time to reach you - tomorrow morning or afternoon?",
    responses: [
      { label: 'Tomorrow morning', type: 'neutral', nextNodeId: 'end-callback' },
      { label: 'Tomorrow afternoon', type: 'neutral', nextNodeId: 'end-callback' },
      { label: 'Email instead', type: 'neutral', nextNodeId: 'end-follow-up' }
    ]
  },
  
  'end-demo-booked': {
    id: 'end-demo-booked',
    type: 'statement',
    text: "Great talking with you, [Name]. See you [Day/Time]!",
    responses: []
  },
  
  'end-transfer': {
    id: 'end-transfer',
    type: 'statement',
    text: "That would be perfect, thank you!",
    responses: []
  },
  
  'end-get-contact': {
    id: 'end-get-contact',
    type: 'statement',
    text: "Perfect, I appreciate that. What's the best way to reach them?",
    responses: []
  },
  
  'end-no-contact': {
    id: 'end-no-contact',
    type: 'statement',
    text: "No problem. Thanks for your time!",
    responses: []
  },
  
  'end-callback': {
    id: 'end-callback',
    type: 'statement',
    text: "Perfect, I'll call you back then. Thanks!",
    responses: []
  },
  
  'end-follow-up': {
    id: 'end-follow-up',
    type: 'statement',
    text: "No problem. I'll send that over now. Feel free to reach out if you have questions!",
    responses: []
  },
  
  'end-not-interested': {
    id: 'end-not-interested',
    type: 'statement',
    text: "I understand. Thanks for your time and have a great day!",
    responses: []
  },
  
  'end-not-fit': {
    id: 'end-not-fit',
    type: 'statement',
    text: "Understood. Sounds like we might not be the right fit right now. Thanks for your honesty!",
    responses: []
  },
  
  'end-already-automated': {
    id: 'end-already-automated',
    type: 'statement',
    text: "Got it. Sounds like you're already set up well. Thanks for letting me know!",
    responses: []
  },
  
  'end-gatekeeper': {
    id: 'end-gatekeeper',
    type: 'statement',
    text: "I understand. Can you point me to who I should speak with directly? I'd rather not take up your time as a middleman.",
    responses: []
  }
};

export const determineOutcome = (nodeId: string): CallOutcome => {
  if (nodeId === 'end-demo-booked' || nodeId === 'confirm-demo') return 'demo-booked';
  if (nodeId.includes('end-follow-up') || nodeId.includes('end-callback') || nodeId.includes('end-get-contact')) return 'follow-up';
  if (nodeId.includes('end-')) return 'disqualified';
  return 'in-progress';
};
