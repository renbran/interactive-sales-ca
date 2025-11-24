/**
 * Natural Speech Processor
 * Post-processes AI responses to add realistic human speech patterns
 * Includes filler words, hesitations, incomplete thoughts, and natural imperfections
 */

import type { ProspectPersona } from './types/aiRolePlayTypes';

interface SpeechPattern {
  fillerWords: string[];
  hesitations: string[];
  thinkingPhrases: string[];
  interruptionPhrases: string[];
}

/**
 * Filler words and patterns based on persona personality
 */
const getSpeechPatterns = (persona: ProspectPersona): SpeechPattern => {
  const { emotional, decisive, skeptical, talkative } = persona.personality;

  // Base patterns everyone uses
  const base: SpeechPattern = {
    fillerWords: ['um', 'uh', 'you know', 'I mean'],
    hesitations: ['well', 'so', 'like'],
    thinkingPhrases: ['let me think', 'hmm', 'I don\'t know'],
    interruptionPhrases: ['wait', 'hold on', 'actually']
  };

  // Emotional personas use more expressive language
  if (emotional > 6) {
    base.fillerWords.push('honestly', 'seriously', 'I swear');
    base.hesitations.push('oh', 'wow', 'geez');
  }

  // Indecisive personas (low decisive score) hesitate more
  if (decisive < 4) {
    base.hesitations.push('maybe', 'perhaps', 'I\'m not sure');
    base.thinkingPhrases.push('I need to think about this', 'let me consider', 'I\'m not certain');
  }

  // Skeptical personas question more
  if (skeptical > 7) {
    base.interruptionPhrases.push('but wait', 'hang on', 'okay but');
    base.thinkingPhrases.push('I\'m not convinced', 'I\'m skeptical', 'really?');
  }

  // Talkative personas use more fillers
  if (talkative > 7) {
    base.fillerWords.push('basically', 'obviously', 'definitely', 'actually');
  }

  return base;
};

/**
 * Add filler words to sentence beginnings
 */
function addFillerWords(text: string, patterns: SpeechPattern, probability: number = 0.3): string {
  const sentences = text.split(/\.\s+/);

  return sentences.map((sentence, index) => {
    // Don't add filler to first sentence (sounds awkward)
    if (index === 0) return sentence;

    // Random chance to add filler
    if (Math.random() < probability) {
      const filler = patterns.fillerWords[Math.floor(Math.random() * patterns.fillerWords.length)];
      // Capitalize filler if it's start of sentence
      const capitalizedFiller = filler.charAt(0).toUpperCase() + filler.slice(1);
      return `${capitalizedFiller}, ${sentence.charAt(0).toLowerCase()}${sentence.slice(1)}`;
    }

    return sentence;
  }).join('. ');
}

/**
 * Add hesitations mid-sentence
 */
function addHesitations(text: string, patterns: SpeechPattern, probability: number = 0.2): string {
  const sentences = text.split(/\.\s+/);

  return sentences.map(sentence => {
    // Only apply to longer sentences
    if (sentence.split(' ').length < 6) return sentence;

    if (Math.random() < probability) {
      const words = sentence.split(' ');
      const insertIndex = Math.floor(words.length / 2) + Math.floor(Math.random() * 3) - 1;
      const hesitation = patterns.hesitations[Math.floor(Math.random() * patterns.hesitations.length)];

      words.splice(insertIndex, 0, `${hesitation},`);
      return words.join(' ');
    }

    return sentence;
  }).join('. ');
}

/**
 * Add thinking pauses (ellipses)
 */
function addThinkingPauses(text: string, probability: number = 0.15): string {
  const sentences = text.split(/\.\s+/);

  return sentences.map((sentence, index) => {
    // Sometimes replace period with ellipses
    if (Math.random() < probability && index < sentences.length - 1) {
      return `${sentence}...`;
    }
    return sentence;
  }).join('. ');
}

/**
 * Add interruption phrases (for second thoughts)
 */
function addInterruptions(text: string, patterns: SpeechPattern, probability: number = 0.1): string {
  // Only add interruption if text is long enough
  if (text.split('.').length < 2) return text;

  if (Math.random() < probability) {
    const sentences = text.split(/\.\s+/);
    const interruptIndex = Math.min(sentences.length - 1, 1 + Math.floor(Math.random() * 2));
    const interruption = patterns.interruptionPhrases[Math.floor(Math.random() * patterns.interruptionPhrases.length)];

    // Capitalize the interruption
    const capitalizedInterruption = interruption.charAt(0).toUpperCase() + interruption.slice(1);
    sentences.splice(interruptIndex, 0, `${capitalizedInterruption}`);

    return sentences.join('. ');
  }

  return text;
}

/**
 * Add incomplete thoughts (trail off mid-sentence)
 */
function addIncompleteThoughts(text: string, persona: ProspectPersona, probability: number = 0.1): string {
  // Only for indecisive or highly emotional personas
  if (persona.personality.decisive > 6) return text;

  if (Math.random() < probability) {
    const sentences = text.split(/\.\s+/);
    if (sentences.length < 2) return text;

    // Add trailing thought at the end
    const trailingPhrases = [
      'Wait, let me think about that',
      'Actually, I\'m not sure',
      'Hmm, I need to consider this more',
      'Let me think...'
    ];

    const trailing = trailingPhrases[Math.floor(Math.random() * trailingPhrases.length)];
    return `${text} ${trailing}...`;
  }

  return text;
}

/**
 * Remove overly formal language and make it conversational
 */
function makeConversational(text: string): string {
  return text
    // Replace formal phrases with casual equivalents
    .replace(/\bI appreciate\b/gi, 'I like')
    .replace(/\bI would be interested in\b/gi, 'I want to know about')
    .replace(/\bCould you elaborate\b/gi, 'Can you explain more')
    .replace(/\bregarding\b/gi, 'about')
    .replace(/\bI understand your concern\b/gi, 'I see what you mean')
    .replace(/\bThat is a valid point\b/gi, 'That makes sense')
    .replace(/\bperhaps\b(?! you)/gi, 'maybe') // Keep "perhaps you" but change standalone "perhaps"
    .replace(/\bIndeed\b/gi, 'Yeah')
    .replace(/\bCertainly\b/gi, 'Sure')
    .replace(/\bI comprehend\b/gi, 'I get it');
}

/**
 * Add more contractions for natural speech
 */
function addContractions(text: string): string {
  return text
    .replace(/\bI am\b/g, 'I\'m')
    .replace(/\byou are\b/g, 'you\'re')
    .replace(/\bwe are\b/g, 'we\'re')
    .replace(/\bthey are\b/g, 'they\'re')
    .replace(/\bdo not\b/g, 'don\'t')
    .replace(/\bcannot\b/g, 'can\'t')
    .replace(/\bwill not\b/g, 'won\'t')
    .replace(/\bshould not\b/g, 'shouldn\'t')
    .replace(/\bwould not\b/g, 'wouldn\'t')
    .replace(/\bcould not\b/g, 'couldn\'t')
    .replace(/\bI have\b/g, 'I\'ve')
    .replace(/\byou have\b/g, 'you\'ve')
    .replace(/\bwe have\b/g, 'we\'ve')
    .replace(/\bthat is\b/g, 'that\'s')
    .replace(/\bit is\b/g, 'it\'s')
    .replace(/\bwhat is\b/g, 'what\'s');
}

/**
 * Main function: Process AI response to add natural speech patterns
 */
export function addNaturalSpeechPatterns(
  text: string,
  persona: ProspectPersona,
  options: {
    fillerProbability?: number;
    hesitationProbability?: number;
    pauseProbability?: number;
    interruptionProbability?: number;
    incompleteProbability?: number;
  } = {}
): string {
  const {
    fillerProbability = 0.25,
    hesitationProbability = 0.2,
    pauseProbability = 0.15,
    interruptionProbability = 0.1,
    incompleteProbability = 0.08
  } = options;

  let processed = text;

  // Get persona-specific speech patterns
  const patterns = getSpeechPatterns(persona);

  // Apply transformations in order
  processed = makeConversational(processed);
  processed = addContractions(processed);
  processed = addFillerWords(processed, patterns, fillerProbability);
  processed = addHesitations(processed, patterns, hesitationProbability);
  processed = addThinkingPauses(processed, pauseProbability);
  processed = addInterruptions(processed, patterns, interruptionProbability);
  processed = addIncompleteThoughts(processed, persona, incompleteProbability);

  // Clean up any double spaces or weird punctuation
  processed = processed
    .replace(/\s+/g, ' ') // Multiple spaces to single
    .replace(/\s+\./g, '.') // Space before period
    .replace(/\s+,/g, ',') // Space before comma
    .replace(/,\s*,/g, ',') // Double commas
    .replace(/\.\s*\./g, '.') // Double periods (not ellipses)
    .trim();

  return processed;
}

/**
 * Adjust processing intensity based on persona personality
 * More natural/casual personas get more processing
 */
export function getProcessingIntensity(persona: ProspectPersona): {
  fillerProbability: number;
  hesitationProbability: number;
  pauseProbability: number;
  interruptionProbability: number;
  incompleteProbability: number;
} {
  const { emotional, decisive, skeptical, talkative } = persona.personality;

  // Base probabilities
  let filler = 0.25;
  let hesitation = 0.2;
  let pause = 0.15;
  let interruption = 0.1;
  let incomplete = 0.08;

  // Emotional personas are more expressive
  if (emotional > 6) {
    filler += 0.1;
    hesitation += 0.05;
  }

  // Indecisive personas hesitate more
  if (decisive < 4) {
    hesitation += 0.15;
    pause += 0.1;
    incomplete += 0.07;
  }

  // Skeptical personas interrupt more with objections
  if (skeptical > 7) {
    interruption += 0.15;
    pause += 0.05;
  }

  // Talkative personas use more fillers
  if (talkative > 7) {
    filler += 0.15;
  }

  return {
    fillerProbability: Math.min(filler, 0.5), // Cap at 50%
    hesitationProbability: Math.min(hesitation, 0.4),
    pauseProbability: Math.min(pause, 0.3),
    interruptionProbability: Math.min(interruption, 0.25),
    incompleteProbability: Math.min(incomplete, 0.2)
  };
}
