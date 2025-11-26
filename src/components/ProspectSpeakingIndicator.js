import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Prospect Speaking Indicator
 * Shows animated typing/thinking indicator when AI prospect is formulating response
 * Provides visual feedback during realistic response delays
 */
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { User } from '@phosphor-icons/react';
export default function ProspectSpeakingIndicator({ isThinking, persona, thinkingText }) {
    if (!isThinking)
        return null;
    // Different thinking messages based on persona personality
    const getThinkingMessage = () => {
        if (thinkingText)
            return thinkingText;
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
    return (_jsx(Card, { className: "p-4 bg-accent/5 border-accent/20", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Avatar, { className: "h-10 w-10 bg-accent/20", children: _jsx("div", { className: "flex items-center justify-center w-full h-full", children: _jsx(User, { weight: "fill", className: "h-5 w-5 text-accent" }) }) }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm font-medium text-foreground", children: persona.name }), _jsx("span", { className: "text-xs text-muted-foreground", children: getThinkingMessage() })] }), _jsxs("div", { className: "flex items-center gap-1 mt-2", children: [_jsx("span", { className: "w-2 h-2 bg-accent rounded-full animate-bounce", style: { animationDelay: '0ms' } }), _jsx("span", { className: "w-2 h-2 bg-accent rounded-full animate-bounce", style: { animationDelay: '150ms' } }), _jsx("span", { className: "w-2 h-2 bg-accent rounded-full animate-bounce", style: { animationDelay: '300ms' } })] })] }), _jsx("div", { className: "px-2 py-1 bg-accent/10 rounded text-xs text-accent font-medium", children: persona.personality.decisive > 7 ? 'Quick' :
                        persona.personality.skeptical > 7 ? 'Analyzing' :
                            'Responding' })] }) }));
}
/**
 * Compact version for inline use
 */
export function CompactProspectIndicator({ isThinking, personaName }) {
    if (!isThinking)
        return null;
    return (_jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground py-2", children: [_jsxs("div", { className: "flex gap-1", children: [_jsx("span", { className: "w-1.5 h-1.5 bg-accent rounded-full animate-bounce" }), _jsx("span", { className: "w-1.5 h-1.5 bg-accent rounded-full animate-bounce delay-100" }), _jsx("span", { className: "w-1.5 h-1.5 bg-accent rounded-full animate-bounce delay-200" })] }), _jsxs("span", { children: [personaName, " is typing..."] })] }));
}
