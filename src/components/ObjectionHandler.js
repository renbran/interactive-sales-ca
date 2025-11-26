import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Lightbulb } from '@phosphor-icons/react';
import { aiService, checkAIHealth } from '@/lib/openaiService';
export default function ObjectionHandler({ industry, prospectName }) {
    const [objection, setObjection] = useState('');
    const [response, setResponse] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiEnabled, setAiEnabled] = useState(false);
    useState(() => {
        // Check if OpenAI API key is available
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
        const hasApiKey = apiKey &&
            apiKey !== 'your_openai_api_key_here' &&
            apiKey !== 'sk-your-openai-api-key-here';
        if (hasApiKey) {
            // Test the API connection
            checkAIHealth().then(setAiEnabled).catch(() => {
                // If health check fails, still enable AI to let users try
                setAiEnabled(true);
            });
        }
        else {
            // For production deployment, assume AI is available if no key is visible (it might be set via secrets)
            setAiEnabled(true);
        }
    });
    const commonObjections = [
        "I'm busy / No time / In a meeting",
        "Not interested",
        "Remove me from your list",
        "It's too expensive",
        "We need to think about it",
        "We're using existing system/software",
        "We're too small for this",
        "Just send me information first",
        "We tried automation before and it didn't work",
        "Can you give us a discount?",
        "We need to discuss with partner/boss",
        "We're talking to competitors",
        "No budget right now",
    ];
    const handleGenerateResponse = async () => {
        if (!objection.trim())
            return;
        setIsGenerating(true);
        try {
            const aiResponse = await aiService.generateObjectionResponse(objection, {
                industry,
                painPoint: 'Manual processes and inefficiencies',
            });
            setResponse(aiResponse);
        }
        catch (error) {
            console.error('Failed to generate objection response:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            if (errorMessage.includes('API key') || errorMessage.includes('invalid_request_error')) {
                setResponse('🔧 AI Assistant Setup Required\n\nThe AI objection handler needs to be configured with a valid OpenAI API key. Please contact your administrator to enable AI features.\n\nIn the meantime, here are some general objection handling tips:\n\n• Acknowledge their concern\n• Ask clarifying questions\n• Provide relevant examples\n• Offer a trial or demo\n• Ask for next steps');
            }
            else if (errorMessage.includes('rate limit')) {
                setResponse('AI service is temporarily busy. Please try again in a moment.');
            }
            else {
                setResponse('AI features are currently unavailable. Please use your sales training and experience to handle this objection, or try again later when the service is restored.');
            }
        }
        setIsGenerating(false);
    };
    const handleQuickObjection = (quickObjection) => {
        setObjection(quickObjection);
    };
    if (!aiEnabled) {
        return (_jsxs(Card, { className: "w-full", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Lightbulb, { className: "h-5 w-5 text-orange-500" }), "AI Objection Handler"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [_jsx(Lightbulb, { className: "h-12 w-12 mx-auto mb-4 text-gray-400" }), _jsx("p", { className: "text-lg font-medium mb-2", children: "AI Assistant Loading..." }), _jsx("p", { className: "text-sm mb-2", children: "Initializing AI-powered objection handling." }), _jsx("div", { className: "animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2" }), _jsx("p", { className: "text-xs text-blue-600", children: "If this takes too long, the service may be temporarily unavailable." })] }) })] }));
    }
    return (_jsxs(Card, { className: "w-full", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Lightbulb, { className: "h-5 w-5 text-orange-500" }), "AI Objection Handler", _jsxs(Badge, { variant: "secondary", className: "text-xs", children: ["Industry: ", industry] })] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "objection", className: "font-medium mb-2 block text-sm", children: "What objection did you hear?" }), _jsx(Textarea, { id: "objection", placeholder: `Enter the prospect's objection here...`, value: objection, onChange: (e) => setObjection(e.target.value), rows: 3, className: "resize-none" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("p", { className: "text-sm font-medium text-muted-foreground", children: "Quick Select Common Objections:" }), _jsx("div", { className: "flex flex-wrap gap-2", children: commonObjections.map((commonObj, index) => (_jsx(Button, { variant: "outline", size: "sm", onClick: () => handleQuickObjection(commonObj), className: "text-xs", children: commonObj }, index))) })] }), _jsx(Button, { onClick: handleGenerateResponse, disabled: !objection.trim() || isGenerating, className: "w-full", size: "lg", children: isGenerating ? (_jsxs("span", { className: "flex items-center gap-2", children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white" }), "Generating Response..."] })) : (_jsxs("span", { className: "flex items-center gap-2", children: [_jsx(ArrowRight, { className: "h-4 w-4" }), "Generate AI Response"] })) }), response && (_jsxs("div", { className: "space-y-2", children: [_jsx("p", { className: "text-sm font-medium", children: "\uD83D\uDCA1 AI Suggested Response:" }), _jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: _jsx("p", { className: "text-sm text-blue-900 whitespace-pre-wrap", children: response }) }), _jsxs("div", { className: "text-xs text-muted-foreground", children: ["\uD83D\uDCA1 Tip: Personalize this response with specific details about ", prospectName || 'the prospect', "'s situation."] })] }))] })] }));
}
