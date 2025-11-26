import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Comprehensive Script Demo Component
 *
 * This component demonstrates the new comprehensive sales script with:
 * - Embedded objections that appear contextually
 * - Multiple response options for each objection
 * - Cultural adaptations
 * - Real-time script progression
 * - Success rates and statistics
 */
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowRight, Lightbulb, Warning, CheckCircle, XCircle, User, Target, Clock, TrendUp, } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { section1Opening, getNextSection } from '@/lib/comprehensiveScript';
export default function ComprehensiveScriptDemo({ prospectName = 'Ahmed Al Maktoum', prospectCompany = 'Dubai Trading Solutions', culture = 'arab' }) {
    const [currentSection, setCurrentSection] = useState(section1Opening);
    const [activeObjection, setActiveObjection] = useState(null);
    const [selectedResponse, setSelectedResponse] = useState(null);
    const [conversationHistory, setConversationHistory] = useState([]);
    const [showCulturalAdaptation, setShowCulturalAdaptation] = useState(false);
    // Format script with prospect info
    const formatScript = (text) => {
        return text
            .replace(/\[Full Name\]/gi, prospectName)
            .replace(/\[Name\]/gi, prospectName.split(' ')[0])
            .replace(/\[Company Name\]/gi, prospectCompany)
            .replace(/\[Your Name\]/gi, 'Sarah Johnson')
            .replace(/\[decision-maker\]/gi, 'partner');
    };
    // Handle client response
    const handleClientResponse = (response) => {
        const historyItem = `CLIENT: "${response.response}"`;
        setConversationHistory([...conversationHistory, historyItem]);
        if (response.type === 'objection' && response.handleWith) {
            // Find and show the objection
            const objection = currentSection.embeddedObjections.find(obj => obj.id === response.handleWith);
            if (objection) {
                setActiveObjection(objection);
            }
        }
        else if (response.type === 'positive') {
            // Move to next section
            const nextSection = getNextSection(currentSection.id);
            if (nextSection) {
                setCurrentSection(nextSection);
                setActiveObjection(null);
                setSelectedResponse(null);
            }
        }
    };
    // Handle objection response selection
    const handleObjectionResponse = (response) => {
        setSelectedResponse(response);
        const historyItem = `AGENT: ${response.approach}`;
        setConversationHistory([...conversationHistory, historyItem]);
    };
    // Handle response outcome
    const handleOutcome = (success) => {
        if (success) {
            // Move to success path
            const nextSection = getNextSection(currentSection.id);
            if (nextSection) {
                setCurrentSection(nextSection);
                setActiveObjection(null);
                setSelectedResponse(null);
            }
        }
        else {
            // Show alternative response or move to failure path
            setSelectedResponse(null);
        }
        const outcome = success ? 'SUCCESS ✅' : 'NEEDS DIFFERENT APPROACH ⚠️';
        setConversationHistory([...conversationHistory, outcome]);
    };
    // Get tip icon
    const getTipIcon = (type) => {
        switch (type) {
            case 'success':
                return _jsx(CheckCircle, { className: "w-5 h-5", weight: "fill" });
            case 'warning':
                return _jsx(Warning, { className: "w-5 h-5", weight: "fill" });
            case 'critical':
                return _jsx(XCircle, { className: "w-5 h-5", weight: "fill" });
            default:
                return _jsx(Lightbulb, { className: "w-5 h-5", weight: "fill" });
        }
    };
    // Get tip color
    const getTipColor = (type) => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200 text-green-900 dark:bg-green-950 dark:border-green-800 dark:text-green-100';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-100';
            case 'critical':
                return 'bg-red-50 border-red-200 text-red-900 dark:bg-red-950 dark:border-red-800 dark:text-red-100';
            default:
                return 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-100';
        }
    };
    const culturalVariation = currentSection.culturalVariations?.[culture];
    return (_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4 h-screen p-4", children: [_jsxs("div", { className: "lg:col-span-2 flex flex-col gap-4 overflow-hidden", children: [_jsxs(Card, { className: "p-6 border-2", children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsxs(Badge, { className: "bg-primary text-primary-foreground text-sm font-medium px-3 py-1", children: ["SECTION ", currentSection.sectionNumber, ": ", currentSection.sectionName.toUpperCase()] }), _jsxs(Badge, { variant: "outline", className: "text-xs", children: [_jsx(Clock, { className: "w-3 h-3 mr-1" }), currentSection.duration] })] }), _jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [_jsx(Target, { className: "w-4 h-4" }), _jsxs("span", { children: ["Goal: ", currentSection.goal] })] })] }), _jsxs(Badge, { variant: "secondary", className: "cursor-pointer", onClick: () => setShowCulturalAdaptation(!showCulturalAdaptation), children: [_jsx(User, { className: "w-3 h-3 mr-1" }), culture.toUpperCase()] })] }), showCulturalAdaptation && culturalVariation && (_jsxs(Alert, { className: "bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800", children: [_jsx(Lightbulb, { className: "w-4 h-4" }), _jsxs(AlertTitle, { children: ["Cultural Adaptation: ", culture.charAt(0).toUpperCase() + culture.slice(1)] }), _jsxs(AlertDescription, { className: "mt-2 space-y-2", children: [_jsx("p", { className: "text-sm font-medium", children: culturalVariation.tone }), _jsxs("div", { className: "text-xs space-y-1", children: [_jsx("p", { className: "font-semibold", children: "Key Phrases:" }), _jsx("ul", { className: "list-disc pl-4 space-y-0.5", children: culturalVariation.keyPhrases.slice(0, 3).map((phrase, idx) => (_jsx("li", { children: phrase }, idx))) })] })] })] }))] }), _jsx(Card, { className: "flex-1 overflow-hidden", children: _jsx(ScrollArea, { className: "h-full p-6", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "space-y-3", children: [_jsx("h3", { className: "text-lg font-semibold text-primary", children: "What You Say:" }), _jsx("div", { className: "bg-primary/5 p-4 rounded-lg border-l-4 border-primary", children: _jsx("p", { className: "text-[17px] leading-relaxed whitespace-pre-line", children: formatScript(showCulturalAdaptation && culturalVariation
                                                        ? culturalVariation.greeting
                                                        : currentSection.mainScript.agent) }) }), currentSection.mainScript.pauseInstructions && (_jsxs(Alert, { className: "bg-yellow-50 border-yellow-300 dark:bg-yellow-950 dark:border-yellow-700", children: [_jsx(Warning, { className: "w-4 h-4", weight: "fill" }), _jsx(AlertDescription, { className: "font-medium", children: currentSection.mainScript.pauseInstructions })] }))] }), _jsx(Separator, {}), _jsxs("div", { className: "space-y-3", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Expected Client Responses:" }), _jsx("div", { className: "space-y-2", children: currentSection.mainScript.expectedClientResponses.map((response, idx) => (_jsxs(Button, { variant: response.type === 'objection' ? 'destructive' : response.type === 'positive' ? 'default' : 'outline', className: "w-full justify-between text-left h-auto py-3", onClick: () => handleClientResponse(response), children: [_jsxs("span", { className: "flex-1", children: [response.response, response.type === 'objection' && (_jsx(Badge, { variant: "secondary", className: "ml-2 text-xs", children: "OBJECTION" }))] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Badge, { variant: "secondary", className: "text-xs", children: [response.probability, "%"] }), _jsx(ArrowRight, { className: "w-4 h-4" })] })] }, idx))) })] }), currentSection.tips.length > 0 && (_jsxs(_Fragment, { children: [_jsx(Separator, {}), _jsxs("div", { className: "space-y-3", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Quick Tips:" }), _jsx("div", { className: "space-y-3", children: currentSection.tips.map((tip, idx) => (_jsx(Alert, { className: getTipColor(tip.type), children: _jsxs("div", { className: "flex items-start gap-2", children: [getTipIcon(tip.type), _jsxs("div", { className: "flex-1", children: [_jsxs(AlertTitle, { className: "text-sm font-bold mb-1", children: [tip.icon, " ", tip.title] }), _jsx(AlertDescription, { className: "text-xs", children: tip.text })] })] }) }, idx))) })] })] }))] }) }) })] }), _jsxs("div", { className: "flex flex-col gap-4 overflow-hidden", children: [_jsxs(Card, { className: "p-4 border-2 border-orange-200 dark:border-orange-800", children: [_jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx(Warning, { className: "w-5 h-5 text-orange-600", weight: "fill" }), _jsxs("h3", { className: "font-bold text-sm", children: ["EMBEDDED OBJECTIONS (", currentSection.embeddedObjections.length, ")"] })] }), _jsx("p", { className: "text-xs text-muted-foreground mb-3", children: "These objections are always visible and ready for instant response" }), _jsx("div", { className: "space-y-2", children: currentSection.embeddedObjections.map((objection) => (_jsxs(Card, { className: cn("p-3 cursor-pointer transition-all hover:shadow-md", activeObjection?.id === objection.id
                                        ? "border-2 border-orange-500 bg-orange-50 dark:bg-orange-950"
                                        : "hover:border-orange-300"), onClick: () => setActiveObjection(objection), children: [_jsxs("div", { className: "flex items-start justify-between gap-2 mb-2", children: [_jsx("p", { className: "text-sm font-medium flex-1", children: objection.trigger }), _jsx(Badge, { variant: objection.priority === 'high' ? 'destructive' : 'secondary', className: "text-xs", children: objection.priority })] }), objection.statistics && (_jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [_jsx(TrendUp, { className: "w-3 h-3" }), _jsx("span", { children: objection.statistics.conversionRate })] }), _jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [_jsx(Clock, { className: "w-3 h-3" }), _jsx("span", { children: objection.statistics.averageTimeToHandle })] })] }))] }, objection.id))) })] }), activeObjection && (_jsxs(Card, { className: "flex-1 overflow-hidden border-2 border-orange-300 dark:border-orange-700", children: [_jsxs("div", { className: "bg-orange-100 dark:bg-orange-950 p-4 border-b", children: [_jsx("h3", { className: "font-bold text-sm mb-1", children: "HANDLING OBJECTION" }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["Frequency: ", activeObjection.statistics?.frequency, " | Success: ", activeObjection.statistics?.conversionRate] })] }), _jsx(ScrollArea, { className: "h-full", children: _jsx("div", { className: "p-4 space-y-4", children: _jsxs("div", { className: "space-y-3", children: [_jsx("h4", { className: "text-sm font-semibold", children: "Choose Your Approach:" }), activeObjection.responseOptions.map((response, idx) => (_jsxs(Card, { className: cn("p-3 cursor-pointer transition-all", selectedResponse?.approach === response.approach
                                                    ? "border-2 border-green-500 bg-green-50 dark:bg-green-950"
                                                    : "hover:border-green-300"), onClick: () => handleObjectionResponse(response), children: [_jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsx("h5", { className: "text-sm font-bold flex-1", children: response.approach }), _jsxs(Badge, { variant: "outline", className: "text-xs", children: [response.successRate, "% success"] })] }), _jsxs("p", { className: "text-xs text-muted-foreground mb-2", children: ["When to use: ", response.whenToUse] }), selectedResponse?.approach === response.approach && (_jsxs("div", { className: "mt-3 pt-3 border-t space-y-3", children: [_jsxs("div", { className: "bg-white dark:bg-gray-900 p-3 rounded border", children: [_jsx("p", { className: "text-xs font-medium mb-1", children: "SAY THIS:" }), _jsx("p", { className: "text-sm whitespace-pre-line", children: formatScript(response.script) })] }), response.tips && response.tips.length > 0 && (_jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "text-xs font-semibold text-green-700 dark:text-green-400", children: "\u2705 Tips:" }), _jsx("ul", { className: "text-xs space-y-0.5 pl-4", children: response.tips.map((tip, tipIdx) => (_jsx("li", { className: "list-disc", children: tip }, tipIdx))) })] })), response.warnings && response.warnings.length > 0 && (_jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "text-xs font-semibold text-red-700 dark:text-red-400", children: "\u26A0\uFE0F Warnings:" }), _jsx("ul", { className: "text-xs space-y-0.5 pl-4", children: response.warnings.map((warning, warnIdx) => (_jsx("li", { className: "list-disc", children: warning }, warnIdx))) })] })), _jsxs("div", { className: "flex gap-2 pt-2", children: [_jsxs(Button, { size: "sm", variant: "default", className: "flex-1", onClick: () => handleOutcome(true), children: [_jsx(CheckCircle, { className: "w-4 h-4 mr-1", weight: "fill" }), "Success"] }), _jsxs(Button, { size: "sm", variant: "destructive", className: "flex-1", onClick: () => handleOutcome(false), children: [_jsx(XCircle, { className: "w-4 h-4 mr-1", weight: "fill" }), "Try Different"] })] })] }))] }, idx)))] }) }) })] })), conversationHistory.length > 0 && (_jsxs(Card, { className: "p-3", children: [_jsx("h4", { className: "text-xs font-semibold mb-2", children: "Conversation Flow:" }), _jsx(ScrollArea, { className: "h-32", children: _jsx("div", { className: "space-y-1", children: conversationHistory.map((item, idx) => (_jsx("p", { className: "text-xs text-muted-foreground", children: item }, idx))) }) })] }))] })] }));
}
