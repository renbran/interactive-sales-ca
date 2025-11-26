import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Phone, Clock, User, CheckCircle, Microphone, Download, Play, Pause, Trash, Robot, DotsThree, CaretDown, CaretRight, Heart, TrendUp, ListChecks, ChartBar } from '@phosphor-icons/react';
import { formatDuration } from '@/lib/callUtils';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { audioRecordingManager } from '@/lib/audioRecordingManager';
import { transcriptionApi } from '@/lib/transcriptionApi';
// Separate Call Card Component for better organization
function CallCard({ call, playingCallId, onPlayRecording, onStopRecording, onDownloadRecording, onDeleteRecording, onTranscribeCall, transcriptionData, isTranscribing, getRecordingInfo }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState('details');
    const getOutcomeColor = (outcome) => {
        switch (outcome) {
            case 'demo-booked':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'follow-up-scheduled':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'not-interested':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };
    const getOutcomeLabel = (outcome) => {
        switch (outcome) {
            case 'demo-booked': return 'Demo Booked';
            case 'follow-up-scheduled': return 'Follow-Up';
            case 'not-interested': return 'Not Interested';
            default: return outcome;
        }
    };
    const qualificationScore = [
        call.qualification.painPointIdentified,
        call.qualification.painQuantified,
        call.qualification.valueAcknowledged,
        call.qualification.demoBooked,
    ].filter(Boolean).length;
    const hasTranscription = transcriptionData?.status === 'completed';
    const transcriptionProcessing = transcriptionData?.status === 'processing' || isTranscribing;
    return (_jsx(Card, { className: "overflow-hidden transition-all duration-200 hover:shadow-md", children: _jsxs("div", { className: "p-4", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { className: "flex items-start gap-3 flex-1 min-w-0", children: [_jsx("div", { className: "mt-1", children: _jsx("div", { className: cn("w-10 h-10 rounded-full flex items-center justify-center", call.outcome === 'demo-booked' ? 'bg-green-100' :
                                            call.outcome === 'follow-up-scheduled' ? 'bg-yellow-100' :
                                                call.outcome === 'not-interested' ? 'bg-red-100' : 'bg-gray-100'), children: _jsx(User, { className: cn("h-5 w-5", call.outcome === 'demo-booked' ? 'text-green-600' :
                                                call.outcome === 'follow-up-scheduled' ? 'text-yellow-600' :
                                                    call.outcome === 'not-interested' ? 'text-red-600' : 'text-gray-600') }) }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("h3", { className: "font-semibold text-lg truncate", children: call.prospectInfo.name }), _jsx(Badge, { className: cn('text-xs px-2 py-0.5', getOutcomeColor(call.outcome)), children: getOutcomeLabel(call.outcome) })] }), _jsxs("div", { className: "text-sm text-muted-foreground truncate mb-2", children: [call.prospectInfo.company, " \u2022 ", call.prospectInfo.industry] }), _jsxs("div", { className: "flex items-center gap-4 text-xs text-muted-foreground", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Clock, { className: "h-3 w-3" }), formatDuration(call.duration || 0)] }), _jsx("div", { children: new Date(call.startTime).toLocaleDateString() }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(CheckCircle, { className: "h-3 w-3" }), qualificationScore, "/4 Qualified"] })] })] })] }), _jsxs("div", { className: "flex items-center gap-2 ml-4", children: [call.recordingUrl && (_jsxs(_Fragment, { children: [_jsx(Button, { size: "sm", variant: playingCallId === call.id ? "default" : "ghost", onClick: () => playingCallId === call.id ? onStopRecording() : onPlayRecording(call), className: "h-8 w-8 p-0", children: playingCallId === call.id ? (_jsx(Pause, { className: "h-4 w-4" })) : (_jsx(Play, { className: "h-4 w-4" })) }), hasTranscription && (_jsx(Button, { size: "sm", variant: "ghost", onClick: () => setActiveTab('transcription'), className: "h-8 w-8 p-0 text-green-600", children: _jsx(Robot, { className: "h-4 w-4" }) })), transcriptionProcessing && (_jsx("div", { className: "h-8 w-8 flex items-center justify-center", children: _jsx("div", { className: "h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" }) }))] })), _jsx(Collapsible, { open: isExpanded, onOpenChange: setIsExpanded, children: _jsx(CollapsibleTrigger, { asChild: true, children: _jsx(Button, { size: "sm", variant: "ghost", className: "h-8 w-8 p-0", children: isExpanded ? _jsx(CaretDown, { className: "h-4 w-4" }) : _jsx(CaretRight, { className: "h-4 w-4" }) }) }) })] })] }), _jsx(Collapsible, { open: isExpanded, onOpenChange: setIsExpanded, children: _jsxs(CollapsibleContent, { className: "space-y-4", children: [_jsx(Separator, {}), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-3", children: [_jsx(TabsTrigger, { value: "details", children: "Details" }), _jsxs(TabsTrigger, { value: "recording", disabled: !call.recordingUrl, children: ["Recording", call.recordingUrl && _jsx(Microphone, { className: "h-3 w-3 ml-1" })] }), _jsxs(TabsTrigger, { value: "transcription", disabled: !call.recordingUrl, children: ["AI Insights", hasTranscription && _jsx(Robot, { className: "h-3 w-3 ml-1 text-green-600" }), transcriptionProcessing && _jsx("div", { className: "h-3 w-3 ml-1 animate-spin rounded-full border border-primary border-t-transparent" })] })] }), _jsxs(TabsContent, { value: "details", className: "space-y-4 mt-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "text-sm font-medium", children: "Qualification Progress" }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs(Badge, { variant: call.qualification.painPointIdentified ? "default" : "outline", className: "text-xs justify-center", children: [_jsx(CheckCircle, { weight: "fill", className: cn("h-3 w-3 mr-1", call.qualification.painPointIdentified ? "text-white" : "text-muted-foreground") }), "Pain Identified"] }), _jsxs(Badge, { variant: call.qualification.painQuantified ? "default" : "outline", className: "text-xs justify-center", children: [_jsx(CheckCircle, { weight: "fill", className: cn("h-3 w-3 mr-1", call.qualification.painQuantified ? "text-white" : "text-muted-foreground") }), "Pain Quantified"] }), _jsxs(Badge, { variant: call.qualification.valueAcknowledged ? "default" : "outline", className: "text-xs justify-center", children: [_jsx(CheckCircle, { weight: "fill", className: cn("h-3 w-3 mr-1", call.qualification.valueAcknowledged ? "text-white" : "text-muted-foreground") }), "Value Acknowledged"] }), _jsxs(Badge, { variant: call.qualification.demoBooked ? "default" : "outline", className: "text-xs justify-center", children: [_jsx(CheckCircle, { weight: "fill", className: cn("h-3 w-3 mr-1", call.qualification.demoBooked ? "text-white" : "text-muted-foreground") }), "Demo Booked"] })] })] }), call.notes && (_jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "text-sm font-medium", children: "Call Notes" }), _jsx("div", { className: "text-sm bg-muted/50 rounded-lg p-3", children: _jsx("div", { className: "text-muted-foreground whitespace-pre-wrap", children: call.notes }) })] }))] }), _jsx(TabsContent, { value: "recording", className: "space-y-4 mt-4", children: call.recordingUrl && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [_jsx(Microphone, { weight: "fill", className: "h-4 w-4" }), _jsxs("span", { children: ["Recording (", formatDuration(call.recordingDuration || 0), ")"] }), getRecordingInfo(call.id) && (_jsx(Badge, { variant: "outline", className: "text-xs", children: "Local Copy" }))] }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { size: "sm", variant: "outline", children: _jsx(DotsThree, { className: "h-4 w-4" }) }) }), _jsxs(DropdownMenuContent, { align: "end", children: [_jsxs(DropdownMenuItem, { onClick: () => onDownloadRecording(call), children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Download"] }), getRecordingInfo(call.id) && (_jsxs(DropdownMenuItem, { onClick: () => onDeleteRecording(call.id), className: "text-destructive", children: [_jsx(Trash, { className: "h-4 w-4 mr-2" }), "Delete Local Copy"] }))] })] })] }), _jsx("audio", { src: call.recordingUrl, controls: true, className: "w-full" })] })) }), _jsx(TabsContent, { value: "transcription", className: "mt-4", children: call.recordingUrl ? (_jsxs("div", { className: "space-y-4", children: [!hasTranscription && !transcriptionProcessing && (_jsxs("div", { className: "text-center py-8", children: [_jsx(Robot, { className: "h-12 w-12 mx-auto mb-4 text-muted-foreground" }), _jsx("h4", { className: "font-medium mb-2", children: "AI Transcription Available" }), _jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "Get AI-powered insights including sentiment analysis, key topics, and action items." }), _jsxs(Button, { onClick: () => onTranscribeCall(parseInt(call.id)), children: [_jsx(Robot, { className: "h-4 w-4 mr-2" }), "Generate AI Insights"] })] })), transcriptionProcessing && (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "h-12 w-12 mx-auto mb-4 animate-spin rounded-full border-4 border-primary border-t-transparent" }), _jsx("h4", { className: "font-medium mb-2", children: "Processing..." }), _jsx("p", { className: "text-sm text-muted-foreground", children: "AI is analyzing your call recording. This usually takes 1-2 minutes." })] })), hasTranscription && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs(Card, { className: "p-3 text-center", children: [_jsx(Heart, { className: "h-6 w-6 mx-auto mb-2 text-primary" }), _jsx("div", { className: "font-medium text-sm", children: transcriptionData.sentiment?.label || 'Neutral' }), _jsx("div", { className: "text-xs text-muted-foreground", children: "Sentiment" })] }), _jsxs(Card, { className: "p-3 text-center", children: [_jsx(TrendUp, { className: "h-6 w-6 mx-auto mb-2 text-primary" }), _jsxs("div", { className: "font-medium text-sm", children: [transcriptionData.qualityScore || 'N/A', "/10"] }), _jsx("div", { className: "text-xs text-muted-foreground", children: "Quality" })] }), _jsxs(Card, { className: "p-3 text-center", children: [_jsx(ListChecks, { className: "h-6 w-6 mx-auto mb-2 text-primary" }), _jsx("div", { className: "font-medium text-sm", children: transcriptionData.keyTopics?.length || 0 }), _jsx("div", { className: "text-xs text-muted-foreground", children: "Topics" })] })] }), transcriptionData.summary && (_jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "text-sm font-medium", children: "AI Summary" }), _jsx("div", { className: "text-sm bg-muted/50 rounded-lg p-3", children: transcriptionData.summary })] })), transcriptionData.actionItems && transcriptionData.actionItems.length > 0 && (_jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "text-sm font-medium", children: "Action Items" }), _jsx("ul", { className: "space-y-1", children: transcriptionData.actionItems.slice(0, 3).map((item, index) => (_jsxs("li", { className: "flex items-start gap-2 text-sm", children: [_jsx(CheckCircle, { className: "h-4 w-4 text-primary mt-0.5 shrink-0" }), item] }, index))) })] })), _jsxs(Button, { variant: "outline", className: "w-full", onClick: () => {
                                                                // Open full transcription modal
                                                                const modal = document.createElement('div');
                                                                modal.id = 'transcription-modal';
                                                                document.body.appendChild(modal);
                                                            }, children: [_jsx(ChartBar, { className: "h-4 w-4 mr-2" }), "View Full Analysis"] })] }))] })) : (_jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [_jsx(Microphone, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }), _jsx("p", { children: "No recording available for transcription" })] })) })] })] }) })] }) }));
}
export default function CallHistory({ calls }) {
    const [playingCallId, setPlayingCallId] = useState(null);
    const [recordingMetadata, setRecordingMetadata] = useState({});
    const [currentAudio, setCurrentAudio] = useState(null);
    const [transcriptionData, setTranscriptionData] = useState({});
    const [transcribingCalls, setTranscribingCalls] = useState(new Set());
    useEffect(() => {
        // Load recording metadata
        setRecordingMetadata(audioRecordingManager.getRecordingMetadata());
    }, []);
    const getRecordingInfo = (callId) => {
        return recordingMetadata[callId];
    };
    const downloadRecording = async (call) => {
        if (!call.recordingUrl)
            return;
        try {
            const response = await fetch(call.recordingUrl);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `call-${call.prospectInfo.name.replace(/\s+/g, '-')}-${new Date(call.startTime).toISOString().split('T')[0]}.webm`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
        catch (error) {
            console.error('Error downloading recording:', error);
        }
    };
    const playRecording = (call) => {
        if (!call.recordingUrl)
            return;
        if (currentAudio) {
            currentAudio.pause();
        }
        const audio = new Audio(call.recordingUrl);
        audio.addEventListener('ended', () => {
            setPlayingCallId(null);
            setCurrentAudio(null);
        });
        audio.play();
        setCurrentAudio(audio);
        setPlayingCallId(call.id);
    };
    const stopRecording = () => {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            setCurrentAudio(null);
            setPlayingCallId(null);
        }
    };
    const deleteRecording = (callId) => {
        if (playingCallId === callId) {
            stopRecording();
        }
        // Remove from metadata
        const updatedMetadata = { ...recordingMetadata };
        delete updatedMetadata[callId];
        localStorage.setItem('scholarix-recordings-metadata', JSON.stringify(updatedMetadata));
        setRecordingMetadata(updatedMetadata);
    };
    const transcribeCall = async (callId) => {
        setTranscribingCalls(prev => new Set(prev).add(callId.toString()));
        try {
            const result = await transcriptionApi.transcribeCall(callId);
            setTranscriptionData(prev => ({
                ...prev,
                [callId]: result.data
            }));
        }
        catch (error) {
            console.error('Error transcribing call:', error);
            // Set failed status
            setTranscriptionData(prev => ({
                ...prev,
                [callId]: { status: 'failed' }
            }));
        }
        finally {
            setTranscribingCalls(prev => {
                const newSet = new Set(prev);
                newSet.delete(callId.toString());
                return newSet;
            });
        }
    };
    const fetchTranscription = async (callId) => {
        try {
            const result = await transcriptionApi.getTranscription(callId);
            setTranscriptionData(prev => ({
                ...prev,
                [callId]: result.data
            }));
        }
        catch (error) {
            console.error('Error fetching transcription:', error);
        }
    };
    // Load existing transcriptions on mount
    useEffect(() => {
        calls.forEach(call => {
            if (call.recordingUrl) {
                fetchTranscription(parseInt(call.id));
            }
        });
    }, [calls]);
    if (calls.length === 0) {
        return (_jsxs(Card, { className: "p-12 text-center", children: [_jsx("div", { className: "inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4", children: _jsx(Phone, { className: "h-8 w-8 text-muted-foreground" }) }), _jsx("h3", { className: "text-xl font-semibold mb-2", children: "No Calls Yet" }), _jsx("p", { className: "text-muted-foreground mb-6", children: "Your call history will appear here after you complete your first call." })] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("h2", { className: "text-2xl font-semibold", children: ["Call History (", calls.length, ")"] }), _jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full" }), "Demo Booked"] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("div", { className: "w-2 h-2 bg-yellow-500 rounded-full" }), "Follow-up"] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("div", { className: "w-2 h-2 bg-red-500 rounded-full" }), "Not Interested"] })] })] }), _jsx(ScrollArea, { className: "h-[700px]", children: _jsx("div", { className: "space-y-3", children: [...calls].reverse().map((call) => (_jsx(CallCard, { call: call, playingCallId: playingCallId, onPlayRecording: playRecording, onStopRecording: stopRecording, onDownloadRecording: downloadRecording, onDeleteRecording: deleteRecording, onTranscribeCall: transcribeCall, transcriptionData: transcriptionData[parseInt(call.id)], isTranscribing: transcribingCalls.has(call.id), getRecordingInfo: getRecordingInfo }, call.id))) }) })] }));
}
