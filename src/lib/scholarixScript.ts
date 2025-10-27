import { ScriptNode, CallOutcome, Industry } from './types';

export const getIndustryPain = (industry: Industry): string => {
  const pains = {
    'real-estate': 'property deals / commission tracking / document management',
    'retail': 'inventory / multi-location tracking / POS systems',
    'trading': 'procurement / supplier management / margin tracking',
    'logistics': 'shipment tracking / invoice management / customer updates',
    'consulting': 'project profitability / time tracking / billing'
  };
  return pains[industry] || 'your core operations';
};

export const getIndustryExample = (industry: Industry): string => {
  const examples = {
    'real-estate': 'deal tracking chaos, commission errors, document hell',
    'retail': 'inventory blindness, multi-location nightmare, manual POS',
    'trading': 'procurement mess, supplier chaos, margin invisibility',
    'logistics': 'shipment tracking disaster, invoice errors, customer complaints',
    'consulting': 'project profitability unknown, time tracking manual, billing chaos'
  };
  return examples[industry] || 'operational inefficiencies';
};

export const scholarixScript: Record<string, ScriptNode> = {
  start: {
    id: 'start',
    phase: 'opening',
    type: 'statement',
    text: 'Good morning! Mr. [NAME]?\n\n[Wait for confirmation]\n\nThis is [YOUR NAME] from Scholarix Global in Dubai. Quick question—are you still using Excel or manual processes to run [THEIR CORE OPERATION]?',
    tips: '🎯 CRITICAL: Stand up, smile, speak with energy. This opening breaks their autopilot filter. Pause 2 seconds after question.',
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
    text: 'Perfect—that\'s exactly why I\'m calling. I\'ll be direct, Mr. [NAME]:\n\nWe just opened 40 slots for UAE companies to deploy a complete Odoo + AI automation system at 40% below market price. But here\'s the catch—traditional consultants take 6 to 12 months to deploy. We do it in 14 days.\n\nI\'m calling decision-makers in [THEIR INDUSTRY] because you\'re bleeding the most money from manual chaos.\n\nI need 90 seconds to ask you 3 quick questions to see if you qualify for one of the 40 slots. After that, if it makes sense, we book a 15-minute demo where I show you the live system solving your exact problems.\n\nFair enough?',
    tips: '⚡ Scarcity + Speed + Value. Emphasize "40 slots" and "14 days". Stop talking and wait for response.',
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
    text: '📋 SITUATION QUESTION:\n\nWalk me through quickly—when [a deal comes in / inventory arrives / a shipment is booked / a project starts], what happens? Who touches it, and how many Excel sheets or manual steps are involved?',
    tips: '👂 LISTEN CAREFULLY. Write down their process. This is gold for the demo.',
    responses: [
      { label: 'Described process (continue)', type: 'neutral', nextNodeId: 'discovery-problem' }
    ]
  },

  'discovery-problem': {
    id: 'discovery-problem',
    phase: 'discovery',
    type: 'question',
    text: '🎯 PROBLEM QUESTION:\n\nGot it. So here\'s what I\'m hearing—[reflect back their process].\n\nNow, what\'s the BIGGEST headache with that setup? Is it:\n  • Time consumption—hours wasted on data entry?\n  • Errors and mistakes—wrong numbers, duplicate entries?\n  • Visibility—you can\'t see what\'s happening in real-time?\n  • Scalability—if you grow, you need to hire more admin people?\n  • Something else?\n\nWhat\'s the #1 killer for you?',
    tips: '🔥 This identifies their PRIMARY PAIN. Write it down verbatim. Use it in every subsequent conversation.',
    responses: [
      { label: 'Time consumption', type: 'positive', nextNodeId: 'discovery-implication', qualificationUpdate: { painPointIdentified: true } },
      { label: 'Errors & mistakes', type: 'positive', nextNodeId: 'discovery-implication', qualificationUpdate: { painPointIdentified: true } },
      { label: 'No visibility', type: 'positive', nextNodeId: 'discovery-implication', qualificationUpdate: { painPointIdentified: true } },
      { label: 'Scalability issues', type: 'positive', nextNodeId: 'discovery-implication', qualificationUpdate: { painPointIdentified: true } },
      { label: 'Other pain mentioned', type: 'positive', nextNodeId: 'discovery-implication', qualificationUpdate: { painPointIdentified: true } }
    ]
  },

  'discovery-implication': {
    id: 'discovery-implication',
    phase: 'discovery',
    type: 'question',
    text: '💰 IMPLICATION QUESTION (THE MONEY QUESTION):\n\nOK, so [THEIR PAIN]. Let me ask you this:\n\nHow much is that costing you—not just in money, but in time, stress, missed opportunities, and customer complaints?\n\nFor example, if your team spends [X] hours daily on manual work, that\'s [X × 22 × hourly cost] AED monthly just burning cash.\n\nAnd if you\'re making errors—wrong commissions, inventory mistakes, billing issues—what does ONE mistake cost you? Not just the refund, but the reputation damage?\n\n[PAUSE - Let them calculate the pain]\n\nSo we\'re talking thousands monthly, right? Maybe tens of thousands?',
    tips: '💵 CRITICAL: Get them to say a NUMBER. If they won\'t give exact, get them to agree it\'s "thousands" or "tens of thousands".',
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
    text: '🎁 NEED-PAYOFF QUESTION:\n\nLast question: If I could show you a system that:\n  • Deploys in 14 days (not 6 months)\n  • Cuts your admin time by 70-80%\n  • Has AI support built in so you\'re not calling consultants for every fix\n  • Starts at 2,499 AED per month (40% below market)\n  • And you could start IMMEDIATELY once we gather requirements—\n\nHow much would that change your business? Scale faster? Sleep better? Compete more aggressively?',
    tips: '✨ Let THEM sell themselves. Stay silent after asking. Wait for their response.',
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
    text: '🎓 THE CHALLENGER TEACHING MOMENT:\n\nMr. [NAME], let me tell you something most people don\'t realize—\n\nYour competitors who are scaling right now? They\'re not hiring 15-20 new admin people. They\'re deploying systems like this in 14 days and absorbing DOUBLE the workload with the SAME headcount.\n\nWe just saved a top-2 Dubai real estate brokerage from bankruptcy. They were bleeding cash, didn\'t know where or why. Traditional consultants quoted 6-12 months. We deployed in 14 days. Within WEEKS, they identified the financial hemorrhaging and pulled back from collapse.\n\nHere\'s the brutal truth: Every day you wait, you\'re losing [THEIR PAIN COST] while your competitors move at machine speed.\n\nThe question isn\'t whether you NEED this—you already told me you do. The question is whether you want to be 6 months ahead of competitors or 6 months behind.\n\nThat\'s why I want to show you this live. Not a sales pitch—a WORKING system solving your exact problems in real-time.',
    tips: '🔥 This repositions you from vendor to advisor. Use competitor fear and urgency.',
    responses: [
      { label: 'Continue to demo offer', type: 'neutral', nextNodeId: 'demo-offer' }
    ]
  },

  'demo-offer': {
    id: 'demo-offer',
    phase: 'demo-offer',
    type: 'close',
    text: '📅 THE IRRESISTIBLE DEMO OFFER:\n\nHere\'s what I\'m proposing:\n\n15-20 minutes—your choice, online or face-to-face.\n\nI\'ll show you:\n  ✅ A live Odoo database already configured for [THEIR INDUSTRY]\n  ✅ How it handles [THEIR SPECIFIC PAIN] automatically\n  ✅ How to navigate it (it\'s stupidly simple)\n  ✅ Exactly what it costs and how fast you can deploy\n\nAt the end, you get a quotation. If you like it, we gather requirements and start IMMEDIATELY once you approve.\n\nIf you don\'t like it, you walk away with free ideas for improving your operations.\n\nAnd remember—only 40 slots at this price. Once they\'re gone, you\'ll pay full market rate and wait like everyone else.\n\nI have two openings: [TODAY/TOMORROW] at [TIME 1] or [DAY 2] at [TIME 2].\n\nWhich works better for you?',
    tips: '🎯 STOP TALKING. This is the close. Give two specific times. Wait for their answer.',
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
    text: '💎 OBJECTION: "Too expensive" / "No budget"\n\n[Pause 3 seconds]\n\nI completely understand, Mr. [NAME]. You want every dirham to count.\n\nLet me put this in perspective. You just told me you\'re losing [THEIR PAIN COST] monthly right now—let\'s say 15,000 AED conservatively.\n\nOur system starts at 2,499 AED monthly.\n\nSo the real question isn\'t whether you can afford 2,499 AED. It\'s whether you can afford to keep losing 15,000 AED every single month.\n\nThe system PAYS for itself in week one.\n\nAnd honestly, the demo is free. Let me SHOW you the ROI calculation with your real numbers. If the math doesn\'t work, you walk away.\n\nBut if it does—and I\'m confident it will—you\'ll realize you can\'t afford NOT to do this.\n\n[TIME 1] or [TIME 2]?',
    tips: '💰 Flip the script: They can\'t afford NOT to buy. Make it about their losses, not your price.',
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
    text: '⏰ OBJECTION: "No time" / "Too busy"\n\n[Pause, empathy tone]\n\nYou\'re probably thinking: "This is another sales call, I\'m drowning in work, and I don\'t have time for this right now."\n\n[Let them agree]\n\nAnd here\'s the irony—you\'re too busy BECAUSE you\'re doing everything manually. That\'s exactly the problem we fix.\n\nYou just told me your team spends [X] hours daily on admin. That\'s [X × 5 = weekly hours].\n\nWhat if I could give you 70% of that time back—starting in 14 days?\n\nWould you trade 15 minutes RIGHT NOW to save [X hours] every single week going forward?\n\nLook, I get it. You\'re busy. So let\'s do this:\n\nI\'ll block 15 minutes—not 30, not 60—just 15.\n\nIf after 10 minutes you don\'t see value, END THE CALL. I won\'t be offended.\n\nBut if you DO see value, you\'ll wish you\'d booked this a year ago.\n\nWhat\'s easier for you—early morning before chaos starts, or evening after things calm down?',
    tips: '⏱️ Accusation audit + flip it. They\'re too busy because they DON\'T have this system.',
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
    text: '🏆 OBJECTION: "Talking to competitors"\n\nThat\'s great—I\'m glad you\'re taking this seriously. Doing your due diligence is smart.\n\nCan I ask—what\'s their deployment timeline? How long until you\'re live and running?\n\n[They\'ll say 3 months, 6 months, 12 months]\n\nAnd what happens if you need a fix or customization after launch? Do you call them and wait, or do you have AI support built in?\n\n[They\'ll admit they don\'t know or have to call consultants]\n\nHere\'s the difference: Traditional consultants WANT long deployments and consultant dependency—that\'s how they make money.\n\nWe want you SELF-SUFFICIENT in 14 days with AI handling 80% of support.\n\nWe\'re 40% cheaper, 75% faster, and we DON\'T want you dependent on us.\n\nThat\'s why three of your competitors are already using us.\n\nLook, I\'m not asking you to ditch your other options. I\'m asking you to spend 15 minutes seeing what they\'re NOT showing you.\n\nThen make an informed decision.\n\nIf their offer is better, great—you\'ll know for sure.\nIf ours is better, you\'ll thank yourself for not settling.\n\n15 minutes. [TIME 1] or [TIME 2]?',
    tips: '⚡ Competitive differentiation: Speed, AI support, independence. Position others as slow and dependent.',
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
    text: '📧 OBJECTION: "Send me information first"\n\nMr. [NAME], I could send you a PDF. Everyone does that.\n\nBut here\'s the problem: Every business is unique. A real estate company\'s needs are completely different from a trading company, right?\n\nA generic PDF won\'t show you what this looks like for YOUR business—your workflows, your pain points, your ROI.\n\nThat\'s why the demo is MORE valuable than any PDF I could send.\n\nPlus, I can\'t show you the LIVE system in a PDF. You need to SEE it working—your data, your processes, your results.\n\nHere\'s what I\'ll do: Book the 15-minute demo. If after 10 minutes you want documents, I\'ll send you EVERYTHING—proposals, case studies, technical specs, pricing, the works.\n\nBut at least you\'ll have SEEN it first, so the documents actually make sense.\n\nFair?',
    tips: '📄 The Takeaway: Demo is more valuable than docs. Make them want to see it first.',
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
    text: '👥 OBJECTION: "Need to discuss with partner/team"\n\nAbsolutely, Mr. [NAME]. Smart decision.\n\nQuick question: What specifically do you need to discuss with them? Is it the cost, the timeline, the features, or something else?\n\n[They\'ll tell you the REAL objection]\n\nGot it. Here\'s an idea: What if I did the demo with both of you at the same time? That way, you both see it, ask questions together, and make a decision faster.\n\nWould [PARTNER NAME] be available [TIME 1] or [TIME 2]?',
    tips: '🤝 Get both decision-makers on the call. Saves time and avoids the "I need to discuss" loop.',
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
    text: '🎉 EXCELLENT! Let me lock this in right now:\n\n📅 MEETING DETAILS:\n  • Date: [DAY, DATE]\n  • Time: [TIME] UAE time\n  • Duration: 15-20 minutes\n  • Format: [Online / Face-to-face]\n  • What to expect: Live Odoo demo, your pain points solved, quotation\n\n📧 YOUR CONTACT INFO:\n  • Email: [CONFIRM]\n  • WhatsApp: [CONFIRM]\n  • Best backup number: [CONFIRM]\n\n📨 WHAT I\'LL SEND YOU:\n  1. Calendar invitation - within the hour\n  2. WhatsApp confirmation - today evening\n  3. Demo preparation doc - 5 min read\n  4. Meeting link - 1 hour before\n  5. Reminder - day before\n\n🎯 WHAT TO PREPARE (Optional but helpful):\n  • Sample data/processes you want automated\n  • Your #1 operational headache\n  • Your growth plans for next 6-12 months\n\nAny questions before we lock this?',
    tips: '✅ CRITICAL: Get ALL contact info. Confirm everything. Multiple touchpoints prevent no-shows.',
    responses: [
      { label: 'Confirmed, all set', type: 'positive', nextNodeId: 'end-demo-booked' }
    ]
  },

  'end-demo-booked': {
    id: 'end-demo-booked',
    phase: 'close',
    type: 'statement',
    text: '🚀 Perfect! I\'m looking forward to showing you how we can transform [COMPANY NAME] in 14 days.\n\nYou\'re making a smart move, Mr. [NAME].\n\nHave a great day, and I\'ll see you [DAY] at [TIME]!',
    tips: '🎊 End on high energy. They should feel excited, not pressured.',
    responses: []
  },

  'end-follow-up': {
    id: 'end-follow-up',
    phase: 'close',
    type: 'statement',
    text: '📞 No problem, Mr. [NAME]. I\'ll send you that summary and follow up [DAY].\n\nRemember—only 40 slots at this price. First come, first served.\n\nTalk soon!',
    tips: '📅 Always get a follow-up commitment. Never let them go cold.',
    responses: []
  },

  'end-not-interested': {
    id: 'end-not-interested',
    phase: 'close',
    type: 'statement',
    text: '👋 I understand, Mr. [NAME]. If anything changes—or when you see your competitors launching in 14 days—you know where to find me.\n\nBest of luck!',
    tips: '🤝 End professionally. Leave door open. They might call back when they see competitors winning.',
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
