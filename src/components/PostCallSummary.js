import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Clock, User, Phone, ArrowRight, Target, Microphone } from '@phosphor-icons/react';
import { formatDuration } from '@/lib/callUtils';
import { cn } from '@/lib/utils';
import { aiService, checkAIHealth } from '@/lib/openaiService';
export default function PostCallSummary({ open, callRecord, onSave }) {
    const [notes, setNotes] = useState('');
    const [aiSummary, setAiSummary] = useState('');
    const [followUpSuggestions, setFollowUpSuggestions] = useState([]);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [aiEnabled, setAiEnabled] = useState(false);
    const getOutcomeColor = () => {
        switch (callRecord.outcome) {
            case 'demo-booked':
                return 'bg-success text-success-foreground';
            case 'follow-up-scheduled':
                return 'bg-warning text-warning-foreground';
            case 'not-interested':
                return 'bg-destructive text-destructive-foreground';
            default:
                return 'bg-secondary text-secondary-foreground';
        }
    };
    const getOutcomeLabel = () => {
        switch (callRecord.outcome) {
            case 'demo-booked':
                return '🎉 Demo Booked!';
            case 'follow-up-scheduled':
                return '📅 Follow-Up Scheduled';
            case 'not-interested':
                return '❌ Not Interested';
            default:
                return 'Call Completed';
        }
    };
    const handleSave = () => {
        const finalNotes = aiSummary ? `${aiSummary}\n\nAdditional Notes:\n${notes}` : notes;
        onSave(finalNotes);
        setNotes('');
        setAiSummary('');
        setFollowUpSuggestions([]);
    };
    const generateAISummary = async () => {
        setIsGeneratingAI(true);
        try {
            const summary = await aiService.generateCallSummary({
                prospectInfo: callRecord.prospectInfo,
                duration: callRecord.duration || 0,
                outcome: callRecord.outcome,
                qualification: callRecord.qualification,
                scriptPath: callRecord.scriptPath,
            });
            setAiSummary(summary);
            const suggestions = await aiService.generateFollowUpSuggestions({
                prospectInfo: callRecord.prospectInfo,
                outcome: callRecord.outcome,
                qualification: callRecord.qualification,
            });
            setFollowUpSuggestions(suggestions);
        }
        catch (error) {
            console.error('Failed to generate AI summary:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            if (errorMessage.includes('API key') || errorMessage.includes('invalid_request_error')) {
                setAiSummary('🔧 AI Summary Feature Unavailable\n\nThe AI-powered call summary requires OpenAI API configuration. Please contact your administrator to enable AI features.\n\nFor now, please manually add your call notes below.');
            }
            else {
                setAiSummary('AI summary temporarily unavailable. Please add your call notes manually.');
            }
        }
        setIsGeneratingAI(false);
    };
    // Check if Ollama is available when component opens
    useEffect(() => {
        if (open) {
            checkAIHealth().then(setAiEnabled);
        }
    }, [open]);
    return (_jsx(Dialog, { open: open, onOpenChange: () => { }, children: _jsxs(DialogContent, { className: "w-[95vw] max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col", children: [_jsxs(DialogHeader, { className: "shrink-0", children: [_jsx(DialogTitle, { className: "text-xl sm:text-2xl", children: "Call Summary" }), _jsx(DialogDescription, { className: "text-sm", children: "Review the call outcome and add any notes before saving" })] }), _jsxs("div", { className: "space-y-4 sm:space-y-6 overflow-y-auto flex-1 pr-2 -mr-2", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3", children: [_jsx(Badge, { className: cn('text-sm sm:text-lg px-3 py-1 sm:px-4 sm:py-2 text-center', getOutcomeColor()), children: getOutcomeLabel() }), _jsxs("div", { className: "flex items-center gap-2 text-muted-foreground justify-center sm:justify-start", children: [_jsx(Clock, { className: "h-4 w-4" }), _jsx("span", { className: "text-sm", children: formatDuration(callRecord.duration || 0) })] })] }), _jsx(Separator, {}), _jsx("div", { className: "space-y-2 sm:space-y-3", children: _jsxs("div", { className: "flex items-start gap-2 sm:gap-3", children: [_jsx(User, { className: "h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 shrink-0" }), _jsxs("div", { className: "min-w-0", children: [_jsx("div", { className: "font-medium text-sm sm:text-base truncate", children: callRecord.prospectInfo.name }), _jsxs("div", { className: "text-xs sm:text-sm text-muted-foreground", children: [_jsx("div", { className: "truncate", children: callRecord.prospectInfo.company }), _jsx("div", { className: "truncate", children: callRecord.prospectInfo.industry })] }), callRecord.prospectInfo.phone && (_jsxs("div", { className: "text-xs sm:text-sm text-muted-foreground flex items-center gap-1 mt-1", children: [_jsx(Phone, { className: "h-3 w-3 shrink-0" }), _jsx("span", { className: "truncate", children: callRecord.prospectInfo.phone })] }))] })] }) }), _jsx(Separator, {}), callRecord.recordingUrl && (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsxs("div", { className: "font-medium mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base", children: [_jsx(Microphone, { weight: "fill", className: "h-4 w-4 sm:h-5 sm:w-5" }), "Call Recording"] }), _jsxs("div", { className: "bg-muted/50 rounded-lg p-3 sm:p-4", children: [_jsx("div", { className: "flex items-center justify-between mb-2", children: _jsxs("span", { className: "text-xs sm:text-sm text-muted-foreground", children: ["Duration: ", formatDuration(callRecord.recordingDuration || 0)] }) }), _jsx("audio", { src: callRecord.recordingUrl, controls: true, className: "w-full h-8 sm:h-10" }), _jsx("p", { className: "text-xs text-muted-foreground mt-2", children: "Recording saved locally in your browser" })] })] }), _jsx(Separator, {})] })), _jsxs("div", { children: [_jsx("div", { className: "font-medium mb-2 text-sm sm:text-base", children: "Qualification Status" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2", children: [callRecord.qualification.usesManualProcess && (_jsxs("div", { className: "flex items-center gap-2 text-xs sm:text-sm", children: [_jsx(CheckCircle, { weight: "fill", className: "h-3 w-3 sm:h-4 sm:w-4 text-success shrink-0" }), _jsx("span", { children: "Uses Manual Process" })] })), callRecord.qualification.painPointIdentified && (_jsxs("div", { className: "flex items-center gap-2 text-xs sm:text-sm", children: [_jsx(CheckCircle, { weight: "fill", className: "h-3 w-3 sm:h-4 sm:w-4 text-success shrink-0" }), _jsx("span", { children: "Pain Identified" })] })), callRecord.qualification.painQuantified && (_jsxs("div", { className: "flex items-center gap-2 text-xs sm:text-sm", children: [_jsx(CheckCircle, { weight: "fill", className: "h-3 w-3 sm:h-4 sm:w-4 text-success shrink-0" }), _jsx("span", { children: "Pain Quantified" })] })), callRecord.qualification.valueAcknowledged && (_jsxs("div", { className: "flex items-center gap-2 text-xs sm:text-sm", children: [_jsx(CheckCircle, { weight: "fill", className: "h-3 w-3 sm:h-4 sm:w-4 text-success shrink-0" }), _jsx("span", { children: "Value Acknowledged" })] })), callRecord.qualification.timeCommitted && (_jsxs("div", { className: "flex items-center gap-2 text-xs sm:text-sm", children: [_jsx(CheckCircle, { weight: "fill", className: "h-3 w-3 sm:h-4 sm:w-4 text-success shrink-0" }), _jsx("span", { children: "Time Committed" })] })), callRecord.qualification.demoBooked && (_jsxs("div", { className: "flex items-center gap-2 text-xs sm:text-sm", children: [_jsx(CheckCircle, { weight: "fill", className: "h-3 w-3 sm:h-4 sm:w-4 text-success shrink-0" }), _jsx("span", { children: "Demo Booked" })] }))] })] }), callRecord.outcome === 'demo-booked' && (_jsxs("div", { className: "rounded-lg bg-success/10 border border-success/20 p-3 sm:p-4", children: [_jsx("div", { className: "font-medium text-success mb-2 text-sm sm:text-base", children: "\uD83D\uDCCB Next Steps (Critical!)" }), _jsxs("div", { className: "text-xs sm:text-sm text-foreground/80 space-y-1", children: [_jsx("div", { children: "\u2705 Send calendar invite within 1 hour" }), _jsx("div", { children: "\u2705 WhatsApp confirmation today evening" }), _jsx("div", { children: "\u2705 Reminder day before demo" }), _jsx("div", { children: "\u2705 Meeting link 1 hour before" })] })] })), aiEnabled && (_jsxs("div", { className: "rounded-lg bg-blue-50 border border-blue-200 p-3 sm:p-4", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 mb-3", children: [_jsx("div", { className: "font-medium text-blue-900 text-sm sm:text-base", children: "\uD83E\uDD16 AI Call Analysis" }), _jsx(Button, { onClick: generateAISummary, disabled: isGeneratingAI, variant: "outline", size: "sm", className: "text-blue-700 border-blue-300 hover:bg-blue-100 w-full sm:w-auto", children: isGeneratingAI ? (_jsxs("span", { className: "flex items-center gap-2 justify-center", children: [_jsx("div", { className: "animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-blue-700" }), _jsx("span", { className: "text-xs sm:text-sm", children: "Analyzing..." })] })) : (_jsxs("span", { className: "flex items-center gap-2 justify-center", children: [_jsx(ArrowRight, { className: "h-3 w-3 sm:h-4 sm:w-4" }), _jsx("span", { className: "text-xs sm:text-sm", children: "Generate Summary" })] })) })] }), aiSummary && (_jsxs("div", { className: "space-y-2 sm:space-y-3", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium text-xs sm:text-sm text-blue-900 mb-2", children: "Call Summary:" }), _jsx("div", { className: "text-xs sm:text-sm text-blue-800 bg-white rounded p-2 sm:p-3 border border-blue-100", children: aiSummary })] }), followUpSuggestions.length > 0 && (_jsxs("div", { children: [_jsx("div", { className: "font-medium text-xs sm:text-sm text-blue-900 mb-2", children: "AI Follow-up Suggestions:" }), _jsx("div", { className: "text-xs sm:text-sm text-blue-800 bg-white rounded p-2 sm:p-3 border border-blue-100", children: _jsx("ul", { className: "space-y-1", children: followUpSuggestions.map((suggestion, index) => (_jsxs("li", { className: "flex items-start gap-2", children: [_jsx(Target, { className: "h-3 w-3 sm:h-4 sm:w-4 mt-0.5 text-blue-600 shrink-0" }), _jsx("span", { className: "text-xs sm:text-sm", children: suggestion })] }, index))) }) })] }))] }))] })), _jsxs("div", { children: [_jsx("label", { htmlFor: "notes", className: "font-medium mb-2 block text-sm sm:text-base", children: "Call Notes" }), _jsx(Textarea, { id: "notes", placeholder: "Add any important notes, pain points mentioned, objections, or follow-up actions...", value: notes, onChange: (e) => setNotes(e.target.value), rows: 3, className: "text-sm" })] })] }), _jsx("div", { className: "shrink-0 pt-4 border-t bg-background", children: _jsx("div", { className: "flex gap-3 justify-end", children: _jsx(Button, { onClick: handleSave, className: "bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto", size: "lg", children: "Save Call" }) }) })] }) }));
}
