/**
 * Prospect Speaking Indicator
 * Shows animated typing/thinking indicator when AI prospect is formulating response
 * Provides visual feedback during realistic response delays
 */

import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { User } from '@phosphor-icons/react';
import type { ProspectPersona } from '@/lib/types/aiRolePlayTypes';

interface ProspectSpeakingIndicatorProps {
  isThinking: boolean;
  persona: ProspectPersona;
  thinkingText?: string;
}

export default function ProspectSpeakingIndicator({
  isThinking,
  persona,
  thinkingText
}: ProspectSpeakingIndicatorProps) {
  if (!isThinking) return null;

  // Different thinking messages based on persona personality
  const getThinkingMessage = () => {
    if (thinkingText) return thinkingText;

    const { decisive, skeptical, emotional } = persona.personality;

    // Decisive personas think fast
    if (decisive > 7) {
      return 'thinking...';
    }

    // Skeptical personas contemplate
    if (skeptical > 7) {
      return 'considering your point...';
    }

    // Emotional personas show more expression
    if (emotional > 6) {
      return 'hmm, let me think...';
    }

    return 'typing...';
  };

  return (
    <Card className="p-4 bg-accent/5 border-accent/20">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <Avatar className="h-10 w-10 bg-accent/20">
          <div className="flex items-center justify-center w-full h-full">
            <User weight="fill" className="h-5 w-5 text-accent" />
          </div>
        </Avatar>

        {/* Thinking content */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {persona.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {getThinkingMessage()}
            </span>
          </div>

          {/* Animated dots */}
          <div className="flex items-center gap-1 mt-2">
            <span
              className="w-2 h-2 bg-accent rounded-full animate-bounce"
              style={{ animationDelay: '0ms' }}
            />
            <span
              className="w-2 h-2 bg-accent rounded-full animate-bounce"
              style={{ animationDelay: '150ms' }}
            />
            <span
              className="w-2 h-2 bg-accent rounded-full animate-bounce"
              style={{ animationDelay: '300ms' }}
            />
          </div>
        </div>

        {/* Status badge */}
        <div className="px-2 py-1 bg-accent/10 rounded text-xs text-accent font-medium">
          {persona.personality.decisive > 7 ? 'Quick' :
           persona.personality.skeptical > 7 ? 'Analyzing' :
           'Responding'}
        </div>
      </div>
    </Card>
  );
}

/**
 * Compact version for inline use
 */
export function CompactProspectIndicator({ isThinking, personaName }: {
  isThinking: boolean;
  personaName: string;
}) {
  if (!isThinking) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" />
        <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce delay-100" />
        <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce delay-200" />
      </div>
      <span>{personaName} is typing...</span>
    </div>
  );
}
