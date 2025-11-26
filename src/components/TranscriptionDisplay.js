import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Microphone, ClockClockwise, Heart, CheckCircle, ListChecks, ArrowRight, TrendUp, ChartBar, CaretDown, CaretRight } from '@phosphor-icons/react';
import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
export default function TranscriptionDisplay({ callId, recordingUrl, onTranscribe, transcriptionData, isTranscribing = false }) {
    const [activeSegment, setActiveSegment] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [expandedSections, setExpandedSections] = useState({
        summary: true,
        insights: false,
        analytics: false
    });
    const audioRef = useRef(null);
    const handleTranscribe = async () => {
        await onTranscribe(callId);
    };
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    const getSentimentColor = (sentiment) => {
        switch (sentiment) {
            case 'positive':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'negative':
                return 'text-red-600 bg-red-50 border-red-200';
            default:
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        }
    };
    const getQualityColor = (score) => {
        if (score >= 8)
            return 'text-green-600';
        if (score >= 6)
            return 'text-yellow-600';
        return 'text-red-600';
    };
    const jumpToSegment = (startTime) => {
        if (audioRef.current) {
            audioRef.current.currentTime = startTime;
            if (!isPlaying) {
                audioRef.current.play();
                setIsPlaying(true);
            }
        }
    };
    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };
    if (!recordingUrl) {
        return (_jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [_jsx(Microphone, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }), _jsx("p", { children: "No recording available for transcription" })] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(Card, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Microphone, { className: "h-5 w-5 text-primary" }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold", children: "AI Transcription" }), _jsx("p", { className: "text-sm text-muted-foreground", children: transcriptionData?.status === 'completed'
                                                ? 'Transcription complete'
                                                : transcriptionData?.status === 'processing' || isTranscribing
                                                    ? 'Processing transcription...'
                                                    : 'Generate AI transcription with insights' })] })] }), !transcriptionData?.transcript && (_jsx(Button, { onClick: handleTranscribe, disabled: isTranscribing || transcriptionData?.status === 'processing', className: "flex items-center gap-2", children: isTranscribing || transcriptionData?.status === 'processing' ? (_jsxs(_Fragment, { children: [_jsx(ClockClockwise, { className: "h-4 w-4 animate-spin" }), "Processing..."] })) : (_jsxs(_Fragment, { children: [_jsx(Microphone, { className: "h-4 w-4" }), "Transcribe Call"] })) }))] }) }), (isTranscribing || transcriptionData?.status === 'processing') && (_jsx(Card, { className: "p-6", children: _jsxs("div", { className: "text-center", children: [_jsx(ClockClockwise, { className: "h-12 w-12 mx-auto mb-4 text-primary animate-spin" }), _jsx("h3", { className: "font-semibold mb-2", children: "Processing Transcription" }), _jsx("p", { className: "text-muted-foreground", children: "Please wait while we transcribe and analyze your call recording..." })] }) })), transcriptionData?.transcript && transcriptionData.status === 'completed' && (_jsxs(Tabs, { defaultValue: "overview", className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "transcript", children: "Transcript" }), _jsx(TabsTrigger, { value: "insights", children: "Insights" }), _jsx(TabsTrigger, { value: "analytics", children: "Analytics" })] }), _jsxs(TabsContent, { value: "overview", className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsx(Card, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Heart, { className: "h-8 w-8 text-primary" }), _jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold", children: transcriptionData.sentiment?.label || 'Neutral' }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Overall Sentiment" })] })] }) }), _jsx(Card, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(TrendUp, { className: "h-8 w-8 text-primary" }), _jsxs("div", { children: [_jsxs("div", { className: "text-2xl font-bold", children: [transcriptionData.qualityScore || 'N/A', transcriptionData.qualityScore && '/10'] }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Call Quality" })] })] }) }), _jsx(Card, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(ListChecks, { className: "h-8 w-8 text-primary" }), _jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold", children: transcriptionData.keyTopics?.length || 0 }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Key Topics" })] })] }) })] }), transcriptionData.summary && (_jsx(Collapsible, { open: expandedSections.summary, onOpenChange: () => toggleSection('summary'), children: _jsxs(Card, { children: [_jsxs(CollapsibleTrigger, { className: "flex items-center justify-between w-full p-4 hover:bg-muted/50", children: [_jsxs("h3", { className: "font-semibold flex items-center gap-2", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-primary" }), "Call Summary"] }), expandedSections.summary ? _jsx(CaretDown, {}) : _jsx(CaretRight, {})] }), _jsx(CollapsibleContent, { children: _jsx("div", { className: "px-4 pb-4", children: _jsx("p", { className: "text-muted-foreground leading-relaxed", children: transcriptionData.summary }) }) })] }) })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [transcriptionData.actionItems && transcriptionData.actionItems.length > 0 && (_jsxs(Card, { className: "p-4", children: [_jsxs("h3", { className: "font-semibold mb-3 flex items-center gap-2", children: [_jsx(ListChecks, { className: "h-5 w-5 text-primary" }), "Action Items"] }), _jsx("ul", { className: "space-y-2", children: transcriptionData.actionItems.map((item, index) => (_jsxs("li", { className: "flex items-start gap-2 text-sm", children: [_jsx(CheckCircle, { className: "h-4 w-4 text-primary mt-0.5 shrink-0" }), item] }, index))) })] })), transcriptionData.nextSteps && transcriptionData.nextSteps.length > 0 && (_jsxs(Card, { className: "p-4", children: [_jsxs("h3", { className: "font-semibold mb-3 flex items-center gap-2", children: [_jsx(ArrowRight, { className: "h-5 w-5 text-primary" }), "Next Steps"] }), _jsx("ul", { className: "space-y-2", children: transcriptionData.nextSteps.map((step, index) => (_jsxs("li", { className: "flex items-start gap-2 text-sm", children: [_jsx(ArrowRight, { className: "h-4 w-4 text-primary mt-0.5 shrink-0" }), step] }, index))) })] }))] })] }), _jsxs(TabsContent, { value: "transcript", className: "space-y-4", children: [recordingUrl && (_jsx(Card, { className: "p-4", children: _jsx("audio", { ref: audioRef, src: recordingUrl, controls: true, className: "w-full", onTimeUpdate: (e) => setCurrentTime(e.currentTarget.currentTime), onPlay: () => setIsPlaying(true), onPause: () => setIsPlaying(false) }) })), transcriptionData.segments && (_jsxs(Card, { children: [_jsxs("div", { className: "p-4 border-b", children: [_jsx("h3", { className: "font-semibold", children: "Interactive Transcript" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Click on any segment to jump to that part of the recording" })] }), _jsx(ScrollArea, { className: "h-[600px]", children: _jsx("div", { className: "p-4 space-y-3", children: transcriptionData.segments.map((segment) => (_jsxs("div", { className: cn("flex gap-4 p-3 rounded-lg cursor-pointer transition-colors", currentTime >= segment.start && currentTime <= segment.end
                                                    ? "bg-primary/10 border border-primary/20"
                                                    : "hover:bg-muted/50"), onClick: () => jumpToSegment(segment.start), children: [_jsxs("div", { className: "shrink-0", children: [_jsx("div", { className: "text-xs text-muted-foreground", children: formatTime(segment.start) }), _jsx(Badge, { variant: "outline", className: "text-xs mt-1", children: segment.speaker })] }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm leading-relaxed", children: segment.text }), _jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: ["Confidence: ", Math.round(segment.confidence * 100), "%"] })] })] }, segment.id))) }) })] }))] }), _jsxs(TabsContent, { value: "insights", className: "space-y-4", children: [transcriptionData.keyTopics && transcriptionData.keyTopics.length > 0 && (_jsxs(Card, { className: "p-4", children: [_jsxs("h3", { className: "font-semibold mb-3 flex items-center gap-2", children: [_jsx(ChartBar, { className: "h-5 w-5 text-primary" }), "Key Topics Discussed"] }), _jsx("div", { className: "flex flex-wrap gap-2", children: transcriptionData.keyTopics.map((topic, index) => (_jsx(Badge, { variant: "secondary", children: topic }, index))) })] })), transcriptionData.sentiment && (_jsxs(Card, { className: "p-4", children: [_jsxs("h3", { className: "font-semibold mb-3 flex items-center gap-2", children: [_jsx(Heart, { className: "h-5 w-5 text-primary" }), "Sentiment Analysis"] }), _jsx("div", { className: cn("p-3 rounded-lg border", getSentimentColor(transcriptionData.sentiment.label)), children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { className: "font-medium", children: [transcriptionData.sentiment.label.charAt(0).toUpperCase() +
                                                            transcriptionData.sentiment.label.slice(1), " Sentiment"] }), _jsxs("span", { className: "text-sm", children: ["Score: ", transcriptionData.sentiment.score.toFixed(2)] })] }) })] }))] }), _jsx(TabsContent, { value: "analytics", className: "space-y-4", children: transcriptionData.analytics && (_jsx(_Fragment, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs(Card, { className: "p-4", children: [_jsx("h4", { className: "font-medium mb-2", children: "Talk Time Ratio" }), _jsxs("div", { className: "text-2xl font-bold", children: [Math.round(transcriptionData.analytics.talkTimeRatio * 100), "%"] }), _jsx("p", { className: "text-sm text-muted-foreground", children: "You vs. Prospect" })] }), _jsxs(Card, { className: "p-4", children: [_jsx("h4", { className: "font-medium mb-2", children: "Speaking Pace" }), _jsx("div", { className: "text-2xl font-bold", children: Math.round(transcriptionData.analytics.speakingPace) }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Words per minute" })] }), _jsxs(Card, { className: "p-4", children: [_jsx("h4", { className: "font-medium mb-2", children: "Interruptions" }), _jsx("div", { className: "text-2xl font-bold", children: transcriptionData.analytics.interruptions }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Total count" })] }), _jsxs(Card, { className: "p-4", children: [_jsx("h4", { className: "font-medium mb-2", children: "Engagement Score" }), _jsx("div", { className: cn("text-2xl font-bold", getQualityColor(transcriptionData.analytics.engagementScore)), children: transcriptionData.analytics.engagementScore.toFixed(1) }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Out of 10" })] })] }) })) })] })), transcriptionData?.status === 'failed' && (_jsx(Card, { className: "p-6 border-destructive", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "h-12 w-12 mx-auto mb-4 text-destructive", children: "\u26A0\uFE0F" }), _jsx("h3", { className: "font-semibold mb-2 text-destructive", children: "Transcription Failed" }), _jsx("p", { className: "text-muted-foreground mb-4", children: "There was an error processing the transcription. Please try again." }), _jsx(Button, { variant: "outline", onClick: handleTranscribe, children: "Retry Transcription" })] }) }))] }));
}
