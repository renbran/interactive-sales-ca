import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Phone, Clock, User, CheckCircle, Microphone, Download, Play, Pause, Trash, Robot } from '@phosphor-icons/react';
import { formatDuration } from '@/lib/callUtils';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { audioRecordingManager } from '@/lib/audioRecordingManager';
import { transcriptionApi } from '@/lib/transcriptionApi';
import TranscriptionDisplay from './TranscriptionDisplay';
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
    const getOutcomeColor = (outcome) => {
        switch (outcome) {
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
    const getOutcomeLabel = (outcome) => {
        switch (outcome) {
            case 'demo-booked':
                return 'Demo Booked';
            case 'follow-up-scheduled':
                return 'Follow-Up';
            case 'not-interested':
                return 'Not Interested';
            default:
                return outcome;
        }
    };
    const getRecordingInfo = (callId) => {
        return recordingMetadata[callId] || null;
    };
    const downloadRecording = (call) => {
        if (!call.recordingUrl)
            return;
        const filename = audioRecordingManager.generateFilename(call.prospectInfo.name, call.startTime);
        const a = document.createElement('a');
        a.href = call.recordingUrl;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };
    const playRecording = (call) => {
        if (!call.recordingUrl)
            return;
        // Stop current audio if playing
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            setCurrentAudio(null);
            setPlayingCallId(null);
        }
        if (playingCallId === call.id) {
            return; // Already stopped
        }
        const audio = new Audio(call.recordingUrl);
        audio.addEventListener('ended', () => {
            setPlayingCallId(null);
            setCurrentAudio(null);
        });
        audio.addEventListener('error', (e) => {
            console.error('Error playing recording:', e);
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
    return (_jsxs(Card, { className: "p-6", children: [_jsxs("h2", { className: "text-2xl font-semibold mb-6", children: ["Call History (", calls.length, ")"] }), _jsx(ScrollArea, { className: "h-[600px] pr-4", children: _jsx("div", { className: "space-y-4", children: [...calls].reverse().map((call) => (_jsxs(Card, { className: "p-5 hover:shadow-md transition-shadow", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { className: "flex items-start gap-3 flex-1", children: [_jsx(User, { className: "h-5 w-5 text-muted-foreground mt-1" }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "font-semibold text-lg", children: call.prospectInfo.name }), _jsxs("div", { className: "text-sm text-muted-foreground", children: [call.prospectInfo.company, " \u2022 ", call.prospectInfo.industry] })] })] }), _jsx(Badge, { className: cn('ml-4', getOutcomeColor(call.outcome)), children: getOutcomeLabel(call.outcome) })] }), _jsxs("div", { className: "flex items-center gap-4 text-sm text-muted-foreground mb-3", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Clock, { className: "h-4 w-4" }), formatDuration(call.duration || 0)] }), _jsx("div", { children: new Date(call.startTime).toLocaleString() })] }), _jsxs("div", { className: "flex flex-wrap gap-2 mb-3", children: [call.qualification.painPointIdentified && (_jsxs(Badge, { variant: "outline", className: "text-xs", children: [_jsx(CheckCircle, { weight: "fill", className: "h-3 w-3 mr-1 text-success" }), "Pain Identified"] })), call.qualification.painQuantified && (_jsxs(Badge, { variant: "outline", className: "text-xs", children: [_jsx(CheckCircle, { weight: "fill", className: "h-3 w-3 mr-1 text-success" }), "Pain Quantified"] })), call.qualification.valueAcknowledged && (_jsxs(Badge, { variant: "outline", className: "text-xs", children: [_jsx(CheckCircle, { weight: "fill", className: "h-3 w-3 mr-1 text-success" }), "Value Acknowledged"] })), call.qualification.demoBooked && (_jsxs(Badge, { variant: "outline", className: "text-xs", children: [_jsx(CheckCircle, { weight: "fill", className: "h-3 w-3 mr-1 text-success" }), "Demo Booked!"] }))] }), call.notes && (_jsxs("div", { className: "text-sm bg-muted/50 rounded p-3 mt-3", children: [_jsx("div", { className: "font-medium mb-1", children: "Notes:" }), _jsx("div", { className: "text-muted-foreground whitespace-pre-wrap", children: call.notes })] })), call.recordingUrl && (_jsxs("div", { className: "mt-3 space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [_jsx(Microphone, { weight: "fill", className: "h-4 w-4" }), _jsxs("span", { children: ["Recording available (", formatDuration(call.recordingDuration || 0), ")"] }), getRecordingInfo(call.id) && (_jsx(Badge, { variant: "outline", className: "text-xs", children: "Local Copy" }))] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { size: "sm", variant: playingCallId === call.id ? "default" : "outline", onClick: () => playingCallId === call.id ? stopRecording() : playRecording(call), className: "shrink-0", children: playingCallId === call.id ? (_jsx(Pause, { className: "h-4 w-4" })) : (_jsx(Play, { className: "h-4 w-4" })) }), _jsx("audio", { src: call.recordingUrl, controls: true, className: "h-8 flex-1 min-w-0" }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => downloadRecording(call), className: "shrink-0", children: _jsx(Download, { className: "h-4 w-4" }) }), _jsxs(Dialog, { children: [_jsx(DialogTrigger, { asChild: true, children: _jsx(Button, { size: "sm", variant: "outline", className: "shrink-0", children: _jsx(Robot, { className: "h-4 w-4" }) }) }), _jsxs(DialogContent, { className: "max-w-4xl max-h-[90vh] overflow-y-auto", children: [_jsx(DialogHeader, { children: _jsxs(DialogTitle, { children: ["AI Transcription - ", call.prospectInfo.name] }) }), _jsx(TranscriptionDisplay, { callId: parseInt(call.id), recordingUrl: call.recordingUrl, onTranscribe: transcribeCall, transcriptionData: transcriptionData[parseInt(call.id)], isTranscribing: transcribingCalls.has(call.id) })] })] }), getRecordingInfo(call.id) && (_jsx(Button, { size: "sm", variant: "ghost", onClick: () => deleteRecording(call.id), className: "shrink-0 text-destructive hover:text-destructive", children: _jsx(Trash, { className: "h-4 w-4" }) }))] })] }))] }, call.id))) }) })] }));
}
