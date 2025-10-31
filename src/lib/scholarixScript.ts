import { ScriptNode, CallOutcome, Industry } from './types';

export const getIndustryPain = (industry: Industry): string => {
  const pains = {
    'real-estate': 'property deals, commission calculations, and document chaos',
    'retail': 'inventory management across locations, stock levels, and sales tracking',
    'trading': 'supplier relationships, procurement processes, and profit margins',
    'logistics': 'shipment tracking, client communication, and billing accuracy',
    'consulting': 'project profitability, time tracking, and client billing'
  };
  return pains[industry] || 'your daily operations';
};

export const getIndustryExample = (industry: Industry): string => {
  const examples = {
    'real-estate': 'losing deals to commission errors, spending hours on paperwork, missing follow-ups',
    'retail': 'running out of popular items, overstocking slow movers, manual stock counts',
    'trading': 'supplier payment delays, margin miscalculations, procurement bottlenecks',
    'logistics': 'shipment delays, angry clients calling for updates, billing mistakes',
    'consulting': 'finishing projects only to realize you lost money, manual time tracking, billing delays'
  };
  return examples[industry] || 'operational challenges that cost money and time';
};

export const getIndustryProcess = (industry: Industry): string => {
  const processes = {
    'real-estate': 'listing to closing',
    'retail': 'receiving to selling',
    'trading': 'sourcing to delivery',
    'logistics': 'booking to delivery',
    'consulting': 'project start to billing'
  };
  return processes[industry] || 'your main business process';
};

export const getIndustrySuccessStory = (industry: Industry): string => {
  const stories = {
    'real-estate': 'a Dubai real estate company that was losing thousands on commission errors every month',
    'retail': 'a retail chain that was constantly out of stock in some locations while overstocked in others',
    'trading': 'a trading company that couldn\'t track their actual margins until after deals were done',
    'logistics': 'a logistics company spending hours daily updating clients manually',
    'consulting': 'a consulting firm that discovered they were losing money on 40% of their projects'
  };
  return stories[industry] || 'a company in your industry with similar challenges';
};

export const getIndustryTimeWaster = (industry: Industry): string => {
  const timeWasters = {
    'real-estate': 'calculating commissions and chasing documents',
    'retail': 'doing inventory counts and managing stock levels',
    'trading': 'dealing with supplier issues and tracking margins',
    'logistics': 'updating clients and fixing billing problems',
    'consulting': 'trying to figure out if projects are actually profitable'
  };
  return timeWasters[industry] || 'manual administrative tasks';
};

export const scholarixScript: Record<string, ScriptNode> = {
  start: {
    id: 'start',
    phase: 'opening',
    type: 'statement',
    text: 'Good morning! Is this Mr. [NAME]?\n\n[Wait for confirmation]\n\nHi [NAME], this is [YOUR NAME] from Scholarix Global here in Dubai. Hey, quick question for you—are you still using Excel or manual processes to manage [THEIR CORE OPERATION]?',
    tips: '🎯 CRITICAL: Stand up, smile, speak with energy and warmth. Use "Hey" to sound friendly. This opening breaks their autopilot filter. Pause 2 seconds after question and LISTEN.',
    responses: [
      { label: 'Yes, using Excel/manual', type: 'positive', nextNodeId: 'permission-hook-yes' },
      { label: 'No, have a system', type: 'negative', nextNodeId: 'permission-hook-no' },
      { label: 'Unsure/mixed', type: 'neutral', nextNodeId: 'permission-hook-yes' }
    ]
  },

  'permission-hook-yes': {
    id: 'permission-hook-yes',
    phase: 'opening',
    type: 'statement',
    text: 'Yeah, I figured as much. Listen, [NAME], let me be straight with you:\n\nWe\'re working with about 40 companies across the UAE right now, helping them automate their [INDUSTRY_PROCESS]. The thing is, most consultants drag this out for 6 months—we get you up and running in about two weeks.\n\nI\'m specifically reaching out to [THEIR INDUSTRY] businesses because, honestly, this is where we see the biggest wins. Companies like yours are often losing real money every day to manual processes.\n\nCan I ask you three quick questions? Should take about 90 seconds. If it sounds like we might be able to help, I\'ll show you exactly how it works—just 15 minutes. If it\'s not a fit, at least you\'ll know. Fair enough?',
    tips: '🗣️ Conversational and consultative, not salesy. Use "Yeah" and "Listen" for warmth. "Let me be straight" builds trust. Pause and wait for genuine response.',
    responses: [
      { label: 'Fair / Go ahead', type: 'positive', nextNodeId: 'discovery-situation', qualificationUpdate: { usesManualProcess: true } },
      { label: 'Not interested', type: 'negative', nextNodeId: 'objection-not-interested' },
      { label: 'Tell me more first', type: 'neutral', nextNodeId: 'discovery-situation' }
    ]
  },

  'permission-hook-no': {
    id: 'permission-hook-no',
    phase: 'opening',
    type: 'question',
    text: 'Interesting! Quick question—can your current system deploy updates in 14 days, or are you waiting weeks or months for changes and fixes?',
    tips: '🎯 Challenge their current solution. Most will admit it\'s slow.',
    responses: [
      { label: 'Takes weeks/months', type: 'negative', nextNodeId: 'permission-hook-speed' },
      { label: 'Pretty fast', type: 'positive', nextNodeId: 'permission-hook-speed' },
      { label: 'Not sure', type: 'neutral', nextNodeId: 'permission-hook-speed' }
    ]
  },

  'permission-hook-speed': {
    id: 'permission-hook-speed',
    phase: 'opening',
    type: 'statement',
    text: 'That\'s the problem we solve. 90 seconds, 3 questions, then you decide if a 15-minute demo makes sense. Fair?',
    tips: '💪 Take control. Make it easy to say yes.',
    responses: [
      { label: 'Fair / Ok', type: 'positive', nextNodeId: 'discovery-situation', qualificationUpdate: { usesManualProcess: false } },
      { label: 'Not interested', type: 'negative', nextNodeId: 'objection-not-interested' }
    ]
  },

  'discovery-situation': {
    id: 'discovery-situation',
    phase: 'discovery',
    type: 'question',
    text: 'Great! So help me understand your current setup...\n\n[FOR REAL ESTATE]: When a new property listing comes in, what\'s the process? Who handles it first, and how do you track everything from listing to closing?\n\n[FOR RETAIL]: When you get new inventory, walk me through what happens—from receiving to getting it on shelves to tracking sales across locations?\n\n[FOR TRADING]: When you\'re sourcing products from suppliers, how do you currently manage the whole procurement cycle?\n\n[FOR LOGISTICS]: When a client books a shipment, what\'s your process from booking to delivery to invoicing?\n\n[FOR CONSULTING]: When you start a new project, how do you track time, costs, and profitability right now?',
    tips: '🎯 Use industry-specific language. Listen for pain points in their process. Take notes.',
    responses: [
      { label: 'Described process (continue)', type: 'neutral', nextNodeId: 'discovery-problem' }
    ]
  },

  'discovery-problem': {
    id: 'discovery-problem',
    phase: 'discovery',
    type: 'question',
    text: 'Okay, I think I\'m getting the picture. So you\'ve got [REFLECT THEIR PROCESS BRIEFLY].\n\nHere\'s what I\'m curious about—what\'s driving you the most crazy about all this right now?\n\n[FOR REAL ESTATE]: Is it more the commission errors, the document chaos, or losing track of where your deals actually are?\n\n[FOR RETAIL]: Is it the inventory blindness—like not knowing what you have—the manual stock counts, or trying to coordinate multiple locations?\n\n[FOR TRADING]: Is it managing suppliers, tracking your actual margins, or just the whole procurement mess?\n\n[FOR LOGISTICS]: Is it keeping track of shipments, billing errors, or constantly updating clients?\n\n[FOR CONSULTING]: Is it not knowing if projects are actually profitable, tracking time, or billing accurately?\n\nLike, what\'s the thing that makes you go "ugh, not this again" every day?',
    tips: '🎯 Conversational tone—"what I\'m curious about" is warmer than "let me ask." Use "like" for natural flow. Listen for emotional words like "frustrating," "nightmare," or "killing me." Mirror their energy.',
    responses: [
      { label: 'Commission/margin errors', type: 'positive', nextNodeId: 'discovery-implication', qualificationUpdate: { painPointIdentified: true } },
      { label: 'Process/document chaos', type: 'positive', nextNodeId: 'discovery-implication', qualificationUpdate: { painPointIdentified: true } },
      { label: 'No visibility/tracking', type: 'positive', nextNodeId: 'discovery-implication', qualificationUpdate: { painPointIdentified: true } },
      { label: 'Time wasting/inefficiency', type: 'positive', nextNodeId: 'discovery-implication', qualificationUpdate: { painPointIdentified: true } },
      { label: 'Other specific pain', type: 'positive', nextNodeId: 'discovery-implication', qualificationUpdate: { painPointIdentified: true } }
    ]
  },

  'discovery-implication': {
    id: 'discovery-implication',
    phase: 'discovery',
    type: 'question',
    text: 'Yeah, I bet that\'s frustrating. So this thing with [THEIR SPECIFIC PAIN]—what\'s that actually costing you?\n\n[FOR REAL ESTATE]: I mean, when commission calculations are wrong, or a deal falls through because documents got lost, what does that hit cost you?\n\n[FOR RETAIL]: When you\'re out of stock because you didn\'t know inventory levels, or you order too much and it sits there—what\'s a typical loss?\n\n[FOR TRADING]: When supplier payments are late or margins are calculated wrong, what kind of money are we talking about?\n\n[FOR LOGISTICS]: When shipments get delayed because information wasn\'t updated, or billing is wrong—what does that cost in client relationships?\n\n[FOR CONSULTING]: When you finish a project and realize you actually lost money on it, what\'s a typical loss?\n\nBallpark—is this costing you thousands monthly? More?',
    tips: '� Keep it conversational. Let them tell you the cost. Don\'t do math for them.',
    responses: [
      { label: 'Thousands monthly', type: 'positive', nextNodeId: 'discovery-need-payoff', qualificationUpdate: { painQuantified: true } },
      { label: 'Tens of thousands', type: 'positive', nextNodeId: 'discovery-need-payoff', qualificationUpdate: { painQuantified: true } },
      { label: 'Haven\'t calculated', type: 'neutral', nextNodeId: 'discovery-need-payoff', qualificationUpdate: { painQuantified: false } },
      { label: 'Not that much', type: 'negative', nextNodeId: 'discovery-need-payoff' }
    ]
  },

  'discovery-need-payoff': {
    id: 'discovery-need-payoff',
    phase: 'discovery',
    type: 'question',
    text: 'Last question, and then I\'ll show you what I\'m thinking...\n\n[FOR REAL ESTATE]: If you could automate your commission tracking, document management, and deal pipeline—and set it up in just two weeks—how much would that change things for you?\n\n[FOR RETAIL]: If you had real-time inventory across all locations, automated reordering, and could set it up in two weeks instead of months—what would that do for your business?\n\n[FOR TRADING]: If supplier management, procurement, and margin tracking were all automated and took two weeks to deploy—how would that change your operations?\n\n[FOR LOGISTICS]: If shipment tracking, client updates, and billing were all automated and you could have it running in two weeks—what would that mean for you?\n\n[FOR CONSULTING]: If project profitability, time tracking, and billing were automated and deployed in two weeks—how would that change your business?\n\nWould that be valuable to you?',
    tips: '🎯 Industry-specific benefits. Let them envision the solution. Stay quiet after asking.',
    responses: [
      { label: 'Game changer / Very valuable', type: 'positive', nextNodeId: 'teaching-moment', qualificationUpdate: { valueAcknowledged: true } },
      { label: 'Would help / Interested', type: 'positive', nextNodeId: 'teaching-moment', qualificationUpdate: { valueAcknowledged: true } },
      { label: 'Maybe / Not sure', type: 'neutral', nextNodeId: 'teaching-moment' }
    ]
  },

  'teaching-moment': {
    id: 'teaching-moment',
    phase: 'teaching',
    type: 'statement',
    text: 'You know what, [NAME]? Here\'s something interesting that most business owners don\'t realize...\n\n[FOR REAL ESTATE]: The top real estate companies here in Dubai aren\'t hiring more people to grow. They\'re automating everything—commission tracking, documents, client management—and they\'re scaling with basically the same team size.\n\n[FOR RETAIL]: The retailers who are expanding like crazy right now aren\'t hiring armies of inventory managers. They\'ve got systems that just tell them exactly what to order, when, and for which location. It\'s almost automatic.\n\n[FOR TRADING]: The really successful trading companies aren\'t drowning in spreadsheets trying to track suppliers. They\'ve automated procurement and they can see their margins in real-time—like, they actually know if they\'re making money.\n\n[FOR LOGISTICS]: The logistics companies that are winning the big contracts aren\'t the ones with the most staff. They\'re the ones who can give clients live updates and never mess up billing.\n\n[FOR CONSULTING]: The profitable consulting firms—the really good ones—they know which projects are making money BEFORE they finish them. Not six months later when it\'s too late.\n\nWe just helped a company like yours get this set up in two weeks. Most consultants would drag it out for six months and charge you double.\n\nThat\'s why I\'d really like to show you how this could work for your specific situation.',
    tips: '🎯 Consultative, almost like you\'re sharing insider knowledge. Use "like crazy," "just tell them," "almost automatic" for conversational flow. Sound genuinely excited about helping, not selling.',
    responses: [
      { label: 'Continue to demo offer', type: 'neutral', nextNodeId: 'demo-offer' }
    ]
  },

  'demo-offer': {
    id: 'demo-offer',
    phase: 'demo-offer',
    type: 'close',
    text: 'Here\'s what I\'d like to do, Mr. [NAME]...\n\nCan we spend about 15 minutes together—either online or I can come by your office—and I\'ll show you exactly how this would work for your [INDUSTRY] business?\n\n[FOR REAL ESTATE]: I\'ll show you the system handling commission calculations, document workflows, and lead management—using real estate scenarios.\n\n[FOR RETAIL]: I\'ll walk you through inventory management, multi-location tracking, and automated reordering—with retail examples.\n\n[FOR TRADING]: I\'ll demonstrate supplier management, procurement workflows, and margin tracking—all set up for trading companies.\n\n[FOR LOGISTICS]: I\'ll show you shipment tracking, client communication, and billing automation—designed for logistics operations.\n\n[FOR CONSULTING]: I\'ll walk through project tracking, time management, and profitability analysis—specifically for consulting firms.\n\nYou\'ll see exactly what it costs and how quickly we can get you up and running. If it makes sense, great. If not, at least you\'ll have some ideas.\n\nI\'ve got time [TIME 1] or [TIME 2]. What works better for you?',
    tips: '🎯 Conversational close. Industry-specific demo promise. Two time options only.',
    responses: [
      { label: 'Books demo time slot', type: 'positive', nextNodeId: 'confirm-demo', qualificationUpdate: { demoBooked: true, timeCommitted: true } },
      { label: 'Too expensive', type: 'objection', nextNodeId: 'objection-expensive' },
      { label: 'No time / Too busy', type: 'objection', nextNodeId: 'objection-no-time' },
      { label: 'Talking to competitors', type: 'objection', nextNodeId: 'objection-competitors' },
      { label: 'Send info first', type: 'objection', nextNodeId: 'objection-send-info' },
      { label: 'Need to discuss with partner', type: 'objection', nextNodeId: 'objection-discuss-partner' }
    ]
  },

  'objection-expensive': {
    id: 'objection-expensive',
    phase: 'objection',
    type: 'objection-handler',
    text: 'I totally get that, Mr. [NAME]. Money\'s tight for everyone right now.\n\nBut here\'s the thing—you just told me this [THEIR SPECIFIC PAIN] is costing you [THEIR AMOUNT] every month, right?\n\nSo really, the question isn\'t whether you can afford to fix this. It\'s whether you can afford to keep bleeding money every month while you think about it.\n\nLook, the demo costs you nothing. Let me just show you the numbers—your actual numbers—and you can see if it makes sense. If the math doesn\'t work out, no hard feelings.\n\nBut if it does work out, you\'ll wish you\'d seen this six months ago.\n\nWhat do you say? [TIME 1] or [TIME 2]?',
    tips: '💰 Conversational, empathetic. Use their own words and pain points back to them.',
    responses: [
      { label: 'Books demo', type: 'positive', nextNodeId: 'confirm-demo', qualificationUpdate: { demoBooked: true, timeCommitted: true } },
      { label: 'Still price concerned', type: 'objection', nextNodeId: 'objection-expensive-v2' },
      { label: 'Not interested', type: 'negative', nextNodeId: 'objection-not-interested-final' }
    ]
  },

  'objection-expensive-v2': {
    id: 'objection-expensive-v2',
    phase: 'objection',
    type: 'objection-handler',
    text: 'Mr. [NAME], fair enough. Let me ask you this: What\'s the ideal price for you to stop bleeding 15,000 AED monthly?\n\n[They\'ll say a number]\n\nGot it. And if I could show you how to START with a smaller package and scale up—or spread payments over 3 months—would you at least want to SEE the options?\n\nThe demo costs you nothing. The decision to move forward comes AFTER you see the value. Fair?',
    tips: '🎯 Offer flexibility. Get them to commit to SEEING the demo, not buying yet.',
    responses: [
      { label: 'Yes, show me options', type: 'positive', nextNodeId: 'confirm-demo', qualificationUpdate: { demoBooked: true, timeCommitted: true } },
      { label: 'No thanks', type: 'negative', nextNodeId: 'objection-not-interested-final' }
    ]
  },

  'objection-no-time': {
    id: 'objection-no-time',
    phase: 'objection',
    type: 'objection-handler',
    text: 'I hear you, Mr. [NAME]. You\'re swamped, right? I bet you\'re thinking "Another sales guy wanting to waste my time."\n\nBut here\'s the thing—and I mean this—you\'re probably busy BECAUSE of all this manual stuff you\'re dealing with.\n\n[FOR REAL ESTATE]: All that time spent on commission calculations and chasing documents.\n[FOR RETAIL]: All those hours doing inventory counts and managing stock levels.\n[FOR TRADING]: All that time dealing with supplier issues and tracking margins.\n[FOR LOGISTICS]: All those calls updating clients and fixing billing problems.\n[FOR CONSULTING]: All that time trying to figure out if projects are actually profitable.\n\nWhat if 15 minutes right now could give you back hours every week?\n\nLook, if after 10 minutes you don\'t see how this saves you time, just hang up on me. I won\'t be offended.\n\nWould early morning work better, or maybe end of day when things calm down?',
    tips: '⏰ Empathetic and conversational. Use industry-specific time wasters.',
    responses: [
      { label: 'Morning works', type: 'positive', nextNodeId: 'confirm-demo', qualificationUpdate: { demoBooked: true, timeCommitted: true } },
      { label: 'Evening works', type: 'positive', nextNodeId: 'confirm-demo', qualificationUpdate: { demoBooked: true, timeCommitted: true } },
      { label: 'Still too busy', type: 'negative', nextNodeId: 'objection-no-time-v2' }
    ]
  },

  'objection-no-time-v2': {
    id: 'objection-no-time-v2',
    phase: 'objection',
    type: 'objection-handler',
    text: 'Mr. [NAME], I hear you. But let me be blunt:\n\nEvery day you\'re "too busy" to look at this, you\'re losing [DAILY COST].\n\nIn 30 days, that\'s [MONTHLY COST].\nIn 90 days, that\'s [QUARTERLY COST].\n\nYour competitors aren\'t too busy. They\'re deploying in 14 days and eating your market share while you\'re manually entering data into Excel.\n\nI\'m not trying to pressure you—I\'m trying to SAVE you.\n\n15 minutes. You pick the time. Let\'s do this.',
    tips: '🔥 Blunt truth. Some prospects need urgency shock.',
    responses: [
      { label: 'Ok, let\'s do it', type: 'positive', nextNodeId: 'confirm-demo', qualificationUpdate: { demoBooked: true, timeCommitted: true } },
      { label: 'No thanks', type: 'negative', nextNodeId: 'objection-not-interested-final' }
    ]
  },

  'objection-competitors': {
    id: 'objection-competitors',
    phase: 'objection',
    type: 'objection-handler',
    text: 'Smart move, Mr. [NAME]. You should definitely shop around for something this important.\n\nCan I ask—what kind of timeline are they giving you? How long until you\'d actually be up and running?\n\n[Listen to their answer]\n\nAnd what happens after they set it up? If you need changes or have problems, do you call them and wait, or can you handle most stuff yourself?\n\n[Listen to their answer]\n\nHere\'s what I\'ve noticed—most traditional consultants love long implementations because that\'s how they bill more hours. We\'re the opposite. We want you self-sufficient as quickly as possible.\n\nLook, I\'m not asking you to drop everyone else. I\'m just asking for 15 minutes to show you what we do differently. Then you can compare apples to apples.\n\nIf what they\'re offering is better, great—at least you\'ll know for sure. But if what we do makes more sense, you\'ll be glad you took a look.\n\nWhat do you think? [TIME 1] or [TIME 2]?',
    tips: '🤝 Collaborative, not competitive. Focus on being helpful, not attacking competitors.',
    responses: [
      { label: 'Let me see yours', type: 'positive', nextNodeId: 'confirm-demo', qualificationUpdate: { demoBooked: true, timeCommitted: true } },
      { label: 'Still want to wait', type: 'negative', nextNodeId: 'objection-competitors-v2' }
    ]
  },

  'objection-competitors-v2': {
    id: 'objection-competitors-v2',
    phase: 'objection',
    type: 'objection-handler',
    text: 'In Arab culture, we say: "Buy quality and cry once, buy cheap and cry forever."\n\nBut here\'s the thing—we\'re BOTH cheaper AND faster.\n\nThe question isn\'t who\'s cheapest. It\'s who can get you operational FIRST while your market window is still open.\n\nYour competitors are moving in 14 days. How long can you afford to wait?',
    tips: '🎯 Cultural appeal + urgency. Make waiting feel risky.',
    responses: [
      { label: 'Ok, show me', type: 'positive', nextNodeId: 'confirm-demo', qualificationUpdate: { demoBooked: true, timeCommitted: true } },
      { label: 'Need to think', type: 'neutral', nextNodeId: 'objection-not-interested-final' }
    ]
  },

  'objection-send-info': {
    id: 'objection-send-info',
    phase: 'objection',
    type: 'objection-handler',
    text: 'Sure, I could email you some brochures, Mr. [NAME]. But honestly? Every [INDUSTRY] business is different.\n\n[FOR REAL ESTATE]: Your commission structure, your document processes, your client management—it\'s all unique to you.\n[FOR RETAIL]: Your product mix, your locations, your inventory flow—totally different from the next retailer.\n[FOR TRADING]: Your supplier relationships, your product lines, your margins—completely unique.\n[FOR LOGISTICS]: Your routes, your clients, your pricing—nothing like the next logistics company.\n[FOR CONSULTING]: Your services, your billing model, your project types—totally different setup.\n\nA generic PDF can\'t show you how this would actually work in YOUR business.\n\nHere\'s what I\'ll do—let me show you the live system first, tailored to your situation. Then if you want all the documentation, I\'ll send you everything.\n\nAt least then the documents will actually make sense to you. Fair enough?',
    tips: '� Industry-specific customization argument. Demo first, then docs.',
    responses: [
      { label: 'Fair, let\'s demo first', type: 'positive', nextNodeId: 'confirm-demo', qualificationUpdate: { demoBooked: true, timeCommitted: true } },
      { label: 'Still want docs first', type: 'negative', nextNodeId: 'objection-send-info-v2' }
    ]
  },

  'objection-send-info-v2': {
    id: 'objection-send-info-v2',
    phase: 'objection',
    type: 'objection-handler',
    text: 'OK, honest question: Are you genuinely interested, or are you politely trying to get me off the phone?\n\nBecause if you\'re interested, the demo is the fastest path.\nIf you\'re not, just tell me—I\'ll save us both time.',
    tips: '🎯 Call them out politely. Bluntness often gets commitment.',
    responses: [
      { label: 'I am interested', type: 'positive', nextNodeId: 'confirm-demo', qualificationUpdate: { demoBooked: true, timeCommitted: true } },
      { label: 'Not interested', type: 'negative', nextNodeId: 'objection-not-interested-final' }
    ]
  },

  'objection-discuss-partner': {
    id: 'objection-discuss-partner',
    phase: 'objection',
    type: 'objection-handler',
    text: 'Of course, Mr. [NAME]. That makes total sense—this affects everyone.\n\nWhat specifically would you need to discuss with them? Is it more about the cost, or the timeline, or how it would work with your current setup?\n\n[Listen to their response]\n\nHere\'s a thought—instead of you trying to explain everything to them, what if we just included them in the demo? That way you both see the same thing, can ask questions together, and make the decision as a team.\n\nWould your partner be available for [TIME 1] or [TIME 2]? We could do it as a group call.',
    tips: '👥 Natural and collaborative. Include everyone in the decision process.',
    responses: [
      { label: 'Yes, include partner', type: 'positive', nextNodeId: 'confirm-demo', qualificationUpdate: { demoBooked: true, timeCommitted: true } },
      { label: 'Need to ask first', type: 'neutral', nextNodeId: 'objection-discuss-partner-v2' }
    ]
  },

  'objection-discuss-partner-v2': {
    id: 'objection-discuss-partner-v2',
    phase: 'objection',
    type: 'objection-handler',
    text: 'Fair enough. Here\'s what I\'ll do—I\'ll send you a one-page summary of what we discussed:\n  • Your current pain points\n  • The ROI calculation\n  • The deployment timeline\n  • The limited offer (40 slots left)\n\nYou discuss with your partner, and I\'ll follow up [DAY] morning.\n\nBut here\'s the thing—these 40 slots are first-come, first-served. I\'d hate for you to miss out while you\'re discussing.\n\nCan we at least HOLD a demo slot for you? No commitment—just reserve the time?',
    tips: '📅 Get a soft commitment. Hold the slot. Follow up aggressively.',
    responses: [
      { label: 'Yes, hold a slot', type: 'positive', nextNodeId: 'confirm-demo', qualificationUpdate: { timeCommitted: true } },
      { label: 'No, will reach out', type: 'negative', nextNodeId: 'end-follow-up' }
    ]
  },

  'objection-not-interested': {
    id: 'objection-not-interested',
    phase: 'objection',
    type: 'objection-handler',
    text: '❌ OBJECTION: "Not interested"\n\nFair enough, Mr. [NAME]. Before I let you go, can I ask—just for my learning—is it because:\n\n  A) You\'re genuinely happy with your current manual/Excel setup and don\'t see any problems?\n  B) Timing just isn\'t right?\n  C) You\'ve tried something before and it didn\'t work?\n  D) Something else I\'m missing?\n\nWhich one?',
    tips: '🎯 Uncover the REAL objection. Most will tell you the truth here.',
    responses: [
      { label: 'A - Happy with current', type: 'neutral', nextNodeId: 'objection-not-interested-happy' },
      { label: 'B - Timing not right', type: 'neutral', nextNodeId: 'objection-not-interested-timing' },
      { label: 'C - Tried before', type: 'neutral', nextNodeId: 'objection-not-interested-tried' },
      { label: 'D - Other reason', type: 'neutral', nextNodeId: 'objection-not-interested-final' }
    ]
  },

  'objection-not-interested-happy': {
    id: 'objection-not-interested-happy',
    phase: 'objection',
    type: 'objection-handler',
    text: 'If you\'re happy, that\'s great. But just so you know—your competitors aren\'t waiting. They\'re deploying in 14 days and scaling without hiring sprees.\n\nWhen that hits your market share, remember this call.\n\n15 minutes could save you months of regret. Last chance: [TIME 1] or [TIME 2]?',
    tips: '⚠️ Final warning shot. Competitor fear.',
    responses: [
      { label: 'Ok, let\'s talk', type: 'positive', nextNodeId: 'confirm-demo', qualificationUpdate: { demoBooked: true, timeCommitted: true } },
      { label: 'No thanks', type: 'negative', nextNodeId: 'end-not-interested' }
    ]
  },

  'objection-not-interested-timing': {
    id: 'objection-not-interested-timing',
    phase: 'objection',
    type: 'objection-handler',
    text: 'I get it. But there\'s never a "perfect" time. The question is: How much does waiting cost you?\n\n[THEIR PAIN COST] daily adds up fast. In 90 days, that\'s [QUARTERLY COST] gone forever.\n\nYour competitors who act TODAY will have a 6-month head start on you.\n\nLast chance: 15 minutes. [TIME 1] or [TIME 2]?',
    tips: '💸 Quantify the cost of waiting. Make inaction painful.',
    responses: [
      { label: 'You\'re right, let\'s do it', type: 'positive', nextNodeId: 'confirm-demo', qualificationUpdate: { demoBooked: true, timeCommitted: true } },
      { label: 'Still not now', type: 'negative', nextNodeId: 'end-follow-up' }
    ]
  },

  'objection-not-interested-tried': {
    id: 'objection-not-interested-tried',
    phase: 'objection',
    type: 'objection-handler',
    text: 'That\'s exactly why we\'re different. Who did you try? What happened?\n\n[Listen to their story]\n\nLet me guess—they took months, cost a fortune, and you still needed consultants for everything?\n\nThat\'s the OLD way. We deploy in 14 days, 40% cheaper, with AI support so you\'re independent.\n\nThree of your competitors tried the old way, failed, then came to us. Now they\'re thriving.\n\n15 minutes to see the difference. [TIME 1] or [TIME 2]?',
    tips: '🔄 Turn past failure into opportunity. Show you\'re different.',
    responses: [
      { label: 'Show me the difference', type: 'positive', nextNodeId: 'confirm-demo', qualificationUpdate: { demoBooked: true, timeCommitted: true } },
      { label: 'Not convinced', type: 'negative', nextNodeId: 'end-not-interested' }
    ]
  },

  'objection-not-interested-final': {
    id: 'objection-not-interested-final',
    phase: 'objection',
    type: 'objection-handler',
    text: 'Look, Mr. [NAME], I\'m not here to twist your arm. But I AM here to make sure you don\'t miss an opportunity that could genuinely transform your business.\n\n15 minutes. If it\'s not valuable, you never hear from me again.\nIf it IS valuable, you\'ll be ahead of 90% of your competitors.\n\nLast chance: [TIME 1] or [TIME 2]?',
    tips: '🎯 Final takeaway close. Make it their decision to lose out.',
    responses: [
      { label: 'Ok, one shot', type: 'positive', nextNodeId: 'confirm-demo', qualificationUpdate: { demoBooked: true, timeCommitted: true } },
      { label: 'No, I\'m good', type: 'negative', nextNodeId: 'end-not-interested' }
    ]
  },

  'confirm-demo': {
    id: 'confirm-demo',
    phase: 'close',
    type: 'close',
    text: 'Perfect! Let me just confirm the details with you:\n\nSo we\'re set for [DAY, DATE] at [TIME]—does that still work for you?\n\nAnd I have your email as [EMAIL] and phone as [PHONE]—is that right?\n\n[FOR FACE-TO-FACE]: I\'ll come by your office—what\'s the address?\n[FOR ONLINE]: I\'ll send you a meeting link about an hour before we connect.\n\nOh, and if you want to get the most out of our 15 minutes together, maybe think about:\n\n[FOR REAL ESTATE]: Your biggest commission or document headache right now\n[FOR RETAIL]: Your most challenging inventory or location issue\n[FOR TRADING]: Your biggest supplier or margin tracking problem\n[FOR LOGISTICS]: Your most frustrating shipment or billing issue\n[FOR CONSULTING]: Your most unprofitable project or time tracking challenge\n\nBut don\'t worry if you don\'t have time to prepare—we\'ll figure it out as we go.\n\nI\'ll send you a calendar invite in the next hour and a quick WhatsApp reminder. Sound good?',
    tips: '✅ Conversational confirmation. Get contact info naturally. Set expectations.',
    responses: [
      { label: 'Confirmed, all set', type: 'positive', nextNodeId: 'end-demo-booked' }
    ]
  },

  'end-demo-booked': {
    id: 'end-demo-booked',
    phase: 'close',
    type: 'statement',
    text: 'Excellent! I\'m really looking forward to showing you how this could work for [COMPANY NAME].\n\nI think you\'re going to be pleasantly surprised by how straightforward this can be.\n\nI\'ll get that calendar invite out to you in the next hour, and I\'ll see you [DAY] at [TIME].\n\nHave a great rest of your day, Mr. [NAME]!',
    tips: '✨ Confident and warm. Set positive expectations for the demo.',
    responses: []
  },

  'end-follow-up': {
    id: 'end-follow-up',
    phase: 'close',
    type: 'statement',
    text: 'No worries at all, Mr. [NAME]. I\'ll put together a quick summary of what we discussed and send that over.\n\nI\'ll check back with you [DAY] to see how you\'re thinking about it.\n\nThanks for your time today—talk to you soon!',
    tips: '� Professional and helpful. Set clear follow-up expectations.',
    responses: []
  },

  'end-not-interested': {
    id: 'end-not-interested',
    phase: 'close',
    type: 'statement',
    text: 'I totally understand, Mr. [NAME]. Not everyone\'s at the same place with this kind of thing.\n\nIf anything changes down the road, or if you ever want to revisit this, just give me a call.\n\nThanks for your time today, and best of luck with everything!',
    tips: '🤝 Gracious and professional. Leave the door open without pressure.',
    responses: []
  }
};

export const determineOutcome = (nodeId: string): CallOutcome => {
  if (nodeId === 'end-demo-booked' || nodeId === 'confirm-demo') return 'demo-booked';
  if (nodeId === 'end-follow-up') return 'follow-up-scheduled';
  if (nodeId === 'end-not-interested') return 'not-interested';
  if (nodeId === 'in-progress') return 'in-progress';
  return 'in-progress';
};
