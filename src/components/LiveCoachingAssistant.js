import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Robot, Brain, TrendUp, Warning, CheckCircle, Clock, Lightbulb, Target, CaretDown, CaretRight } from '@phosphor-icons/react';
import { aiService } from '@/lib/openaiService';
import { cn } from '@/lib/utils';
export default function LiveCoachingAssistant({ prospectInfo, currentPhase, callDuration, onScriptSuggestion }) {
    const [prospectResponse, setProspectResponse] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [coachingInsight, setCoachingInsight] = useState(null);
    const [adaptiveScript, setAdaptiveScript] = useState(null);
    const [performanceCoaching, setPerformanceCoaching] = useState(null);
    const [conversationHistory, setConversationHistory] = useState([]);
    const [callMetrics, setCallMetrics] = useState({
        talkTimeRatio: 0.5,
        questionsAsked: 0,
        objectionCount: 0,
        callDuration: callDuration,
        currentPhase: currentPhase,
        prospectEngagement: 'medium'
    });
    const [expandedSections, setExpandedSections] = useState({
        coaching: true,
        script: false,
        performance: false
    });
    // Update call metrics
    useEffect(() => {
        setCallMetrics(prev => ({
            ...prev,
            callDuration: callDuration,
            currentPhase: currentPhase
        }));
    }, [callDuration, currentPhase]);
    // Analyze prospect response and get live coaching
    const analyzeResponse = useCallback(async () => {
        if (!prospectResponse.trim())
            return;
        setIsAnalyzing(true);
        try {
            // Add to conversation history
            const newHistory = [...conversationHistory, `Prospect: ${prospectResponse}`];
            setConversationHistory(newHistory);
            // Get AI coaching insight
            const insight = await aiService.analyzeLiveResponse({
                prospectResponse,
                callPhase: currentPhase,
                scriptContent: 'Current script context',
                prospectInfo,
                conversationHistory: newHistory
            });
            setCoachingInsight(insight);
            // Update call metrics based on response
            const updatedMetrics = {
                ...callMetrics,
                objectionCount: insight.responseType === 'objection' ? callMetrics.objectionCount + 1 : callMetrics.objectionCount,
                prospectEngagement: insight.sentiment === 'enthusiastic' ? 'high' :
                    insight.sentiment === 'interested' ? 'medium' : 'low'
            };
            setCallMetrics(updatedMetrics);
            // Get adaptive script suggestion
            const scriptSuggestion = await aiService.generateAdaptiveScript({
                currentPhase,
                prospectResponse,
                prospectInfo,
                detectedSignals: insight.detectedSignals
            });
            setAdaptiveScript(scriptSuggestion);
            // Get performance coaching
            const perfCoaching = await aiService.generatePerformanceCoaching(updatedMetrics);
            setPerformanceCoaching(perfCoaching);
            // Clear input after analysis
            setProspectResponse('');
        }
        catch (error) {
            console.error('Error analyzing response:', error);
        }
        finally {
            setIsAnalyzing(false);
        }
    }, [prospectResponse, currentPhase, prospectInfo, conversationHistory, callMetrics]);
    const getSentimentColor = (sentiment) => {
        switch (sentiment) {
            case 'enthusiastic': return 'bg-green-100 text-green-800 border-green-200';
            case 'interested': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'skeptical': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'resistant': return 'bg-red-100 text-red-800 border-red-200';
            case 'confused': return 'bg-purple-100 text-purple-800 border-purple-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };
    const getUrgencyColor = (urgency) => {
        switch (urgency) {
            case 'high': return 'text-red-600';
            case 'medium': return 'text-yellow-600';
            case 'low': return 'text-green-600';
            default: return 'text-gray-600';
        }
    };
    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Brain, { className: "h-5 w-5 text-primary" }), "Live AI Coaching", _jsx(Badge, { variant: "outline", className: "text-xs", children: currentPhase.replace('-', ' ').toUpperCase() })] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium mb-2 block", children: "What did the prospect just say?" }), _jsx(Textarea, { placeholder: "Enter the prospect's response here for instant AI coaching...", value: prospectResponse, onChange: (e) => setProspectResponse(e.target.value), rows: 3, className: "resize-none" })] }), _jsx(Button, { onClick: analyzeResponse, disabled: !prospectResponse.trim() || isAnalyzing, className: "w-full", size: "lg", children: isAnalyzing ? (_jsxs("span", { className: "flex items-center gap-2", children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white" }), "Analyzing Response..."] })) : (_jsxs("span", { className: "flex items-center gap-2", children: [_jsx(Robot, { className: "h-4 w-4" }), "Get Live Coaching"] })) })] })] }), coachingInsight && (_jsx(Collapsible, { open: expandedSections.coaching, onOpenChange: () => toggleSection('coaching'), children: _jsxs(Card, { children: [_jsx(CollapsibleTrigger, { className: "w-full", children: _jsx(CardHeader, { className: "hover:bg-muted/50 cursor-pointer", children: _jsxs(CardTitle, { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Target, { className: "h-5 w-5 text-green-600" }), "Instant Coaching", _jsx(Badge, { className: cn('text-xs', getSentimentColor(coachingInsight.sentiment)), children: coachingInsight.sentiment })] }), expandedSections.coaching ? _jsx(CaretDown, {}) : _jsx(CaretRight, {})] }) }) }), _jsx(CollapsibleContent, { children: _jsxs(CardContent, { className: "space-y-4", children: [_jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(Lightbulb, { className: "h-5 w-5 text-blue-600 mt-0.5 shrink-0" }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-blue-900 mb-1", children: "\uD83D\uDCA1 Coaching Tip" }), _jsx("p", { className: "text-sm text-blue-800", children: coachingInsight.coachingTip })] })] }) }), _jsx("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4", children: _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-600 mt-0.5 shrink-0" }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-green-900 mb-1", children: "\uD83C\uDFAF Next Best Action" }), _jsx("p", { className: "text-sm text-green-800", children: coachingInsight.nextBestAction })] })] }) }), coachingInsight.detectedSignals.length > 0 && (_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium mb-2", children: "\uD83D\uDEA8 Detected Signals" }), _jsx("div", { className: "flex flex-wrap gap-2", children: coachingInsight.detectedSignals.map((signal, index) => (_jsx(Badge, { variant: "outline", className: "text-xs", children: signal }, index))) })] })), _jsx("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-3", children: _jsxs("div", { className: "text-sm", children: [_jsx("span", { className: "font-medium text-yellow-900", children: "\uD83D\uDCAC Suggested Follow-up: " }), _jsxs("span", { className: "text-yellow-800", children: ["\"", coachingInsight.suggestedFollowUp, "\""] })] }) }), _jsxs("div", { className: "flex justify-between items-center text-xs text-muted-foreground", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Warning, { className: cn("h-3 w-3", getUrgencyColor(coachingInsight.urgencyLevel)) }), _jsxs("span", { children: ["Urgency: ", coachingInsight.urgencyLevel] })] }), _jsxs("div", { children: ["Confidence: ", Math.round(coachingInsight.confidence * 100), "%"] })] })] }) })] }) })), adaptiveScript && (_jsx(Collapsible, { open: expandedSections.script, onOpenChange: () => toggleSection('script'), children: _jsxs(Card, { children: [_jsx(CollapsibleTrigger, { className: "w-full", children: _jsx(CardHeader, { className: "hover:bg-muted/50 cursor-pointer", children: _jsxs(CardTitle, { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Robot, { className: "h-5 w-5 text-purple-600" }), "Adaptive Script"] }), expandedSections.script ? _jsx(CaretDown, {}) : _jsx(CaretRight, {})] }) }) }), _jsx(CollapsibleContent, { children: _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "bg-purple-50 border border-purple-200 rounded-lg p-4", children: [_jsx("div", { className: "font-medium text-purple-900 mb-2", children: "\uD83D\uDCDD Suggested Script" }), _jsxs("p", { className: "text-sm text-purple-800 italic", children: ["\"", adaptiveScript.suggestedScript.replace(/\[NAME\]/g, prospectInfo.name || '[NAME]').replace(/\[COMPANY\]/g, prospectInfo.company || '[COMPANY]'), "\""] })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium mb-1", children: "\uD83E\uDDE0 Why This Approach" }), _jsx("p", { className: "text-sm text-muted-foreground", children: adaptiveScript.reasoning })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium mb-2", children: "\uD83C\uDFAF Key Points to Cover" }), _jsx("ul", { className: "space-y-1", children: adaptiveScript.keyPoints.map((point, index) => (_jsxs("li", { className: "flex items-start gap-2 text-sm", children: [_jsx(CheckCircle, { className: "h-4 w-4 text-green-600 mt-0.5 shrink-0" }), point] }, index))) })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { size: "sm", onClick: () => onScriptSuggestion?.(adaptiveScript.suggestedScript), children: "Use This Script" }), _jsx(Button, { size: "sm", variant: "outline", children: "Try Alternative" })] }), _jsxs("div", { className: "text-xs text-muted-foreground flex justify-between", children: [_jsxs("span", { children: ["\u23F1\uFE0F Time: ", adaptiveScript.timeToSpend] }), _jsxs("span", { children: ["\uD83D\uDCCA Success: ", adaptiveScript.successMetrics] })] })] }) })] }) })), performanceCoaching && (_jsx(Collapsible, { open: expandedSections.performance, onOpenChange: () => toggleSection('performance'), children: _jsxs(Card, { children: [_jsx(CollapsibleTrigger, { className: "w-full", children: _jsx(CardHeader, { className: "hover:bg-muted/50 cursor-pointer", children: _jsxs(CardTitle, { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(TrendUp, { className: "h-5 w-5 text-orange-600" }), "Performance Coaching", _jsxs(Badge, { variant: "outline", className: "text-xs", children: ["Score: ", performanceCoaching.overallScore.toFixed(1), "/10"] })] }), expandedSections.performance ? _jsx(CaretDown, {}) : _jsx(CaretRight, {})] }) }) }), _jsx(CollapsibleContent, { children: _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "bg-orange-50 border border-orange-200 rounded-lg p-4", children: [_jsx("div", { className: "font-medium text-orange-900 mb-1", children: "\uD83C\uDFAF Primary Focus" }), _jsx("p", { className: "text-sm text-orange-800", children: performanceCoaching.primaryFeedback })] }), performanceCoaching.warningFlag && (_jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-3", children: _jsxs("div", { className: "flex items-center gap-2 text-red-800", children: [_jsx(Warning, { className: "h-4 w-4" }), _jsx("span", { className: "font-medium text-sm", children: performanceCoaching.warningFlag })] }) })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium mb-2 text-green-700", children: "\u2705 Strengths" }), _jsx("ul", { className: "space-y-1", children: performanceCoaching.strengths.map((strength, index) => (_jsxs("li", { className: "text-sm text-green-600 flex items-start gap-1", children: [_jsx(CheckCircle, { className: "h-3 w-3 mt-0.5 shrink-0" }), strength] }, index))) })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium mb-2 text-blue-700", children: "\uD83D\uDD27 Improvements" }), _jsx("ul", { className: "space-y-1", children: performanceCoaching.specificImprovements.map((improvement, index) => (_jsxs("li", { className: "text-sm text-blue-600 flex items-start gap-1", children: [_jsx(Target, { className: "h-3 w-3 mt-0.5 shrink-0" }), improvement] }, index))) })] })] }), _jsx("div", { className: "bg-indigo-50 border border-indigo-200 rounded-lg p-3", children: _jsxs("div", { className: "text-sm", children: [_jsx("span", { className: "font-medium text-indigo-900", children: "\uD83D\uDCA1 Try This: " }), _jsx("span", { className: "text-indigo-800", children: performanceCoaching.suggestedTechnique })] }) }), _jsxs("div", { className: "grid grid-cols-3 gap-4 text-center", children: [_jsxs("div", { children: [_jsxs("div", { className: "text-lg font-bold text-primary", children: [Math.round(callMetrics.talkTimeRatio * 100), "%"] }), _jsx("div", { className: "text-xs text-muted-foreground", children: "Talk Time" })] }), _jsxs("div", { children: [_jsx("div", { className: "text-lg font-bold text-primary", children: callMetrics.questionsAsked }), _jsx("div", { className: "text-xs text-muted-foreground", children: "Questions" })] }), _jsxs("div", { children: [_jsxs("div", { className: "text-lg font-bold text-primary", children: [Math.floor(callMetrics.callDuration / 60), "m"] }), _jsx("div", { className: "text-xs text-muted-foreground", children: "Duration" })] })] })] }) })] }) })), conversationHistory.length > 0 && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "h-5 w-5 text-muted-foreground" }), "Conversation History"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-2 max-h-40 overflow-y-auto", children: conversationHistory.slice(-5).map((entry, index) => (_jsx("div", { className: "text-sm p-2 bg-muted/30 rounded", children: entry }, index))) }) })] }))] }));
}
