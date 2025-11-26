import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useUser, useAuth } from '@clerk/clerk-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Phone } from '@phosphor-icons/react';
import { Toaster, toast } from 'sonner';
import PreCallSetup from '@/components/PreCallSetup';
import ScriptDisplay from '@/components/ScriptDisplay';
import CallControls from '@/components/CallControls';
import QualificationChecklist from '@/components/QualificationChecklist';
import PostCallSummary from '@/components/PostCallSummary';
import CallHistory from '@/components/CallHistory';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import ObjectionHandler from '@/components/ObjectionHandler';
import LiveCoachingAssistant from '@/components/LiveCoachingAssistant';
import RecordingSettings from '@/components/RecordingSettings';
import InCallNotes from '@/components/InCallNotes';
import InlineObjectionHandler from '@/components/InlineObjectionHandler';
import { scholarixScript, determineOutcome } from '@/lib/scholarixScript';
import { calculateMetrics } from '@/lib/callUtils';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { audioRecordingManager } from '@/lib/audioRecordingManager';
export default function CallApp() {
    const [callHistory, setCallHistory] = useLocalStorage('scholarix-call-history', []);
    const { user } = useUser();
    const { getToken } = useAuth();
    const audioRecorder = useAudioRecorder();
    const [showPreCallSetup, setShowPreCallSetup] = useState(false);
    const [activeCall, setActiveCall] = useState(null);
    const [showPostCallSummary, setShowPostCallSummary] = useState(false);
    const [completedCall, setCompletedCall] = useState(null);
    const [activeTab, setActiveTab] = useState('call');
    const [callNotes, setCallNotes] = useState('');
    // Load call history from backend on mount
    useEffect(() => {
        const loadCallHistory = async () => {
            if (!user) {
                console.log('No user logged in, using local storage only');
                return;
            }
            try {
                const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
                const token = await getToken();
                console.log('Loading call history from:', API_BASE_URL);
                const response = await fetch(`${API_BASE_URL}/calls?limit=50`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    console.log('Raw API response:', data);
                    // Transform backend calls to CallRecord format
                    const transformedCalls = data.calls.map((call) => ({
                        id: call.id.toString(),
                        prospectInfo: {
                            name: call.lead?.name || 'Unknown',
                            company: call.lead?.company || '',
                            role: '',
                            email: call.lead?.email || '',
                            phone: call.lead?.phone || '',
                        },
                        objective: 'discovery',
                        startTime: new Date(call.started_at).getTime(),
                        endTime: call.ended_at ? new Date(call.ended_at).getTime() : undefined,
                        duration: call.duration || 0,
                        outcome: call.outcome || 'no-contact',
                        qualification: {
                            usesManualProcess: call.qualification_score > 70,
                            painPointIdentified: call.qualification_score > 60,
                            painQuantified: call.qualification_score > 50,
                            valueAcknowledged: call.qualification_score > 40,
                            timeCommitted: call.qualification_score > 30,
                            demoBooked: call.outcome === 'demo-booked',
                        },
                        notes: call.notes || '',
                    }));
                    // CRITICAL FIX: Only update if backend has data OR if localStorage is empty
                    // This prevents overwriting localStorage with empty backend response
                    if (transformedCalls.length > 0) {
                        setCallHistory(transformedCalls);
                        console.log(`✅ Loaded ${transformedCalls.length} calls from backend`);
                    }
                    else {
                        // Backend returned empty - check if we have local data
                        const currentLocalData = callHistory || [];
                        if (currentLocalData.length > 0) {
                            console.log(`⚠️ Backend returned empty, preserving ${currentLocalData.length} local calls`);
                            toast.info(`Using ${currentLocalData.length} locally saved calls. Backend sync pending.`);
                        }
                        else {
                            console.log('✅ No calls in backend or local storage');
                        }
                    }
                }
                else {
                    const errorText = await response.text();
                    console.error('Failed to load calls:', response.status, errorText);
                    toast.error('Failed to load calls from server. Using local data.');
                }
            }
            catch (error) {
                console.error('Error loading call history:', error);
                // Preserve local storage data on error
                const localCount = callHistory?.length || 0;
                if (localCount > 0) {
                    console.log(`⚠️ Backend error, preserving ${localCount} local calls`);
                    toast.warning(`Network error. Using ${localCount} locally saved calls.`);
                }
            }
        };
        loadCallHistory();
    }, [user, getToken, setCallHistory, callHistory]);
    const startCall = (prospect, objective) => {
        const newCall = {
            id: Date.now().toString(),
            prospectInfo: prospect,
            objective,
            startTime: Date.now(),
            currentNodeId: 'start',
            scriptPath: ['start'],
            qualification: {
                usesManualProcess: null,
                painPointIdentified: null,
                painQuantified: null,
                valueAcknowledged: null,
                timeCommitted: null,
                demoBooked: null
            }
        };
        setActiveCall(newCall);
        setShowPreCallSetup(false);
        setActiveTab('call');
        // Start recording with detailed logging
        console.log('Attempting to start audio recording...');
        audioRecorder.startRecording().then(success => {
            console.log('Recording start result:', success);
            if (success) {
                console.log('✅ Audio recording started successfully');
                toast.success('📞 Call started with audio recording!');
            }
            else {
                console.warn('⚠️ Recording failed to start');
                toast('📞 Call started (recording unavailable - check microphone permissions)', {
                    duration: 4000,
                });
            }
        }).catch(error => {
            console.error('❌ Recording start error:', error);
            console.error('Error details:', error.message, error.name);
            toast('📞 Call started without recording', {
                duration: 3000,
            });
        });
    };
    const handleResponse = (nextNodeId) => {
        if (!activeCall)
            return;
        const nextNode = scholarixScript[nextNodeId];
        if (!nextNode)
            return;
        let updatedQualification = { ...activeCall.qualification };
        const currentNode = scholarixScript[activeCall.currentNodeId];
        const selectedResponse = currentNode.responses?.find(r => r.nextNodeId === nextNodeId);
        if (selectedResponse?.qualificationUpdate) {
            updatedQualification = { ...updatedQualification, ...selectedResponse.qualificationUpdate };
        }
        if (nextNode.qualificationUpdate) {
            updatedQualification = { ...updatedQualification, ...nextNode.qualificationUpdate };
        }
        setActiveCall({
            ...activeCall,
            currentNodeId: nextNodeId,
            scriptPath: [...activeCall.scriptPath, nextNodeId],
            qualification: updatedQualification
        });
        if (nextNode.responses?.length === 0 || !nextNode.responses) {
            if (nextNodeId.startsWith('end-')) {
                setTimeout(() => {
                    endCall();
                }, 2000);
            }
        }
    };
    const endCall = async () => {
        if (!activeCall)
            return;
        const endTime = Date.now();
        const duration = Math.floor((endTime - activeCall.startTime) / 1000);
        const outcome = determineOutcome(activeCall.currentNodeId);
        let recordingUrl;
        let recordingDuration;
        if (audioRecorder.isRecording) {
            try {
                const recording = await audioRecorder.stopRecording();
                // Create enhanced recording data with the actual blob
                const recordingData = audioRecordingManager.createRecordingData(recording.blob, recording.duration, activeCall.prospectInfo.name);
                // Store the blob for later upload to backend
                recordingUrl = recording.url;
                recordingDuration = recording.duration;
                // Save blob to state for upload when saving call
                // We'll store it temporarily with the call record
                window.__pendingRecordingBlob = recording.blob;
                window.__pendingRecordingType = recording.blob.type;
                // Save recording to IndexedDB for playback
                await audioRecordingManager.saveRecording(recordingData, activeCall.id, activeCall.prospectInfo.name);
                // Handle auto-download
                audioRecordingManager.handleAutoDownload(recordingData);
                toast.success(`📼 Recording saved! Duration: ${Math.floor(recording.duration)}s`);
            }
            catch (error) {
                console.error('Failed to save recording:', error);
                toast.error('Failed to save audio recording');
            }
        }
        const callRecord = {
            id: activeCall.id,
            prospectInfo: activeCall.prospectInfo,
            objective: activeCall.objective,
            startTime: activeCall.startTime,
            endTime,
            duration,
            outcome,
            qualification: activeCall.qualification,
            notes: '',
            scriptPath: activeCall.scriptPath,
            recordingUrl,
            recordingDuration
        };
        setCompletedCall(callRecord);
        setShowPostCallSummary(true);
        setActiveCall(null);
    };
    const saveCallSummary = async (notes) => {
        if (!completedCall)
            return;
        // Combine in-call notes with post-call notes
        const finalNotes = callNotes ? `${callNotes}\n\n--- Post-Call Summary ---\n${notes}` : notes;
        const updatedCall = { ...completedCall, notes: finalNotes };
        // Save to local state first for immediate UI update
        setCallHistory((current) => [...(current || []), updatedCall]);
        // Save to backend database
        try {
            if (!user) {
                console.warn('No user logged in, skipping backend save');
                toast.warning('Call saved locally. Sign in to sync across devices.');
                setShowPostCallSummary(false);
                setCompletedCall(null);
                return;
            }
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
            const token = await getToken();
            console.log('API_BASE_URL:', API_BASE_URL);
            console.log('User authenticated:', !!user);
            let leadId = localStorage.getItem('current-lead-id');
            // If no lead ID, create a lead first
            if (!leadId) {
                console.log('No lead ID found, creating lead from prospect info...');
                const leadResponse = await fetch(`${API_BASE_URL}/leads`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: completedCall.prospectInfo.name,
                        email: completedCall.prospectInfo.email,
                        phone: completedCall.prospectInfo.phone,
                        company: completedCall.prospectInfo.company,
                        status: 'contacted',
                        source: 'call-app',
                    }),
                });
                if (leadResponse.ok) {
                    const leadData = await leadResponse.json();
                    leadId = leadData.lead.id.toString();
                    if (leadId) {
                        localStorage.setItem('current-lead-id', leadId);
                        console.log('Lead created with ID:', leadId);
                    }
                }
                else {
                    const errorText = await leadResponse.text();
                    console.error('Failed to create lead:', leadResponse.status, errorText);
                    throw new Error(`Failed to create lead: ${leadResponse.status}`);
                }
            }
            if (!leadId) {
                throw new Error('Unable to create or retrieve lead ID');
            }
            console.log('Saving call with lead ID:', leadId);
            // Upload recording if available
            let recordingUrl = updatedCall.recordingUrl;
            const recordingBlob = window.__pendingRecordingBlob;
            const recordingType = window.__pendingRecordingType || 'audio/webm';
            if (recordingBlob) {
                try {
                    console.log('Uploading recording to R2...');
                    const formData = new FormData();
                    formData.append('recording', recordingBlob, `recording-${leadId}-${Date.now()}.webm`);
                    formData.append('lead_id', leadId);
                    formData.append('call_id', updatedCall.id);
                    const uploadResponse = await fetch(`${API_BASE_URL}/recordings/upload`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                        body: formData,
                    });
                    if (uploadResponse.ok) {
                        const uploadResult = await uploadResponse.json();
                        recordingUrl = uploadResult.url;
                        console.log('Recording uploaded successfully:', recordingUrl);
                        // Clean up temporary storage
                        delete window.__pendingRecordingBlob;
                        delete window.__pendingRecordingType;
                    }
                    else {
                        console.error('Failed to upload recording:', await uploadResponse.text());
                        toast.warning('Recording saved locally but not uploaded to cloud');
                    }
                }
                catch (uploadError) {
                    console.error('Error uploading recording:', uploadError);
                    toast.warning('Recording saved locally but not uploaded to cloud');
                }
            }
            const response = await fetch(`${API_BASE_URL}/calls`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    lead_id: parseInt(leadId),
                    status: 'completed',
                    started_at: new Date(updatedCall.startTime).toISOString(),
                    duration: updatedCall.duration,
                    outcome: updatedCall.outcome,
                    recording_url: recordingUrl,
                    recording_duration: updatedCall.recordingDuration,
                    qualification_score: calculateQualificationScore(updatedCall.qualification),
                    notes: notes,
                    next_steps: updatedCall.outcome === 'demo-booked' ? 'Send calendar invite' : '',
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', response.status, errorText);
                throw new Error(`Failed to save call to backend: ${response.status} ${errorText}`);
            }
            const result = await response.json();
            console.log('Call saved to backend successfully:', result);
            toast.success('✅ Call saved and synced to cloud!');
        }
        catch (error) {
            console.error('Error saving call to backend:', error);
            const errorMessage = error.message || 'Network error';
            console.error('Full error details:', error);
            // Show detailed error message to help diagnose
            toast.error(`Call saved locally but failed to sync to cloud.\n` +
                `Error: ${errorMessage}\n` +
                `Your data is safe in localStorage. Try signing out and back in.`, { duration: 6000 });
        }
        setShowPostCallSummary(false);
        setCompletedCall(null);
        if (updatedCall.outcome === 'demo-booked') {
            toast('🎉 Demo booked! Remember: Send calendar invite within 1 hour!');
        }
        setActiveTab('analytics');
    };
    // Helper function to calculate qualification score
    const calculateQualificationScore = (qualification) => {
        const scores = Object.values(qualification).map(val => val === true ? 1 : val === false ? 0 : 0.5);
        const sum = scores.reduce((a, b) => a + b, 0);
        return Math.round((sum / scores.length) * 100);
    };
    const toggleRecording = () => {
        if (!activeCall)
            return;
        if (audioRecorder.isRecording) {
            audioRecorder.stopRecording().then(() => {
                toast.info('Recording stopped');
            });
        }
        else {
            audioRecorder.startRecording().then(success => {
                if (success) {
                    toast.info('Recording started');
                }
                else {
                    toast.error('Failed to start recording');
                }
            });
        }
    };
    const togglePause = () => {
        if (!activeCall || !audioRecorder.isRecording)
            return;
        if (audioRecorder.isPaused) {
            audioRecorder.resumeRecording();
            toast.info('Recording resumed');
        }
        else {
            audioRecorder.pauseRecording();
            toast.info('Recording paused');
        }
    };
    const metrics = calculateMetrics(callHistory || []);
    const currentNode = activeCall ? scholarixScript[activeCall.currentNodeId] : null;
    return (_jsxs("div", { className: "min-h-screen bg-background", children: [_jsx(Toaster, { position: "top-right" }), _jsxs("div", { className: "mobile-container mx-auto py-4 sm:py-6 lg:py-8 max-w-[1600px]", children: [_jsx("header", { className: "mb-6 sm:mb-8", children: _jsxs("div", { className: "flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0", children: [_jsxs("div", { className: "space-y-2 sm:space-y-3", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3", children: [_jsx("h1", { className: "text-responsive-xl sm:text-responsive-2xl font-semibold tracking-tight", children: "Scholarix Telesales System" }), _jsx("span", { className: "inline-block px-3 py-1 bg-accent text-accent-foreground text-xs sm:text-sm font-medium rounded-full w-fit", children: "UAE Edition" })] }), _jsx("p", { className: "text-muted-foreground text-sm sm:text-base leading-relaxed", children: "The No-Escape System: Turn cold calls into committed demos in under 5 minutes" }), _jsxs("p", { className: "text-xs sm:text-sm text-accent font-medium", children: [_jsx("span", { className: "block sm:inline", children: "Target: 40%+ demo booking rate" }), _jsx("span", { className: "hidden sm:inline mx-1", children: "|" }), _jsx("span", { className: "block sm:inline", children: "14-day deployment" }), _jsx("span", { className: "hidden sm:inline mx-1", children: "|" }), _jsx("span", { className: "block sm:inline", children: "40 slots available" })] })] }), !activeCall && (_jsxs(Button, { size: "lg", className: "btn-mobile bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto lg:w-auto px-6", onClick: () => setShowPreCallSetup(true), children: [_jsx(Phone, { weight: "fill", className: "mr-2 h-5 w-5" }), "Start New Call"] }))] }) }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "space-y-4 sm:space-y-6", children: [_jsx("div", { className: "tabs-mobile", children: _jsxs(TabsList, { className: "inline-flex h-12 w-max min-w-full items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground", children: [_jsx(TabsTrigger, { value: "call", className: "whitespace-nowrap px-3 sm:px-4 py-2 text-sm font-medium touch-target", children: "Live Call" }), _jsx(TabsTrigger, { value: "ai-helper", className: "whitespace-nowrap px-3 sm:px-4 py-2 text-sm font-medium touch-target", children: "AI Helper" }), _jsx(TabsTrigger, { value: "history", className: "whitespace-nowrap px-3 sm:px-4 py-2 text-sm font-medium touch-target", children: "History" }), _jsx(TabsTrigger, { value: "analytics", className: "whitespace-nowrap px-3 sm:px-4 py-2 text-sm font-medium touch-target", children: "Analytics" }), _jsx(TabsTrigger, { value: "settings", className: "whitespace-nowrap px-3 sm:px-4 py-2 text-sm font-medium touch-target", children: "Settings" })] }) }), _jsx(TabsContent, { value: "call", className: "space-y-4 sm:space-y-6", children: activeCall && currentNode ? (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-4 lg:grid lg:grid-cols-12 lg:gap-6 lg:space-y-0", children: [_jsx("div", { className: "order-1 lg:order-1 lg:col-span-3", children: _jsx(CallControls, { prospectInfo: activeCall.prospectInfo, startTime: activeCall.startTime, isRecording: audioRecorder.isRecording, isPaused: audioRecorder.isPaused, onEndCall: endCall, onToggleRecording: toggleRecording, onTogglePause: togglePause }) }), _jsx("div", { className: "order-2 lg:order-2 lg:col-span-6", children: _jsx(ScriptDisplay, { currentNode: currentNode, prospectInfo: activeCall.prospectInfo, onResponse: handleResponse }) }), _jsx("div", { className: "order-3 lg:order-3 lg:col-span-3", children: _jsx(QualificationChecklist, { qualification: activeCall.qualification }) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4", children: [_jsx(InCallNotes, { callId: activeCall.id, prospectName: activeCall.prospectInfo.name, onNotesChange: setCallNotes }), _jsx(InlineObjectionHandler, { industry: activeCall.prospectInfo.industry, prospectName: activeCall.prospectInfo.name, compact: false })] })] })) : (_jsxs("div", { className: "text-center py-12 sm:py-16 lg:py-20 px-4", children: [_jsx("div", { className: "inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-accent/10 mb-4 sm:mb-6", children: _jsx(Phone, { className: "h-10 w-10 sm:h-12 sm:w-12 text-accent", weight: "fill" }) }), _jsx("h2", { className: "text-responsive-lg sm:text-responsive-xl font-semibold mb-3", children: "No Active Call" }), _jsx("p", { className: "text-muted-foreground mb-2 max-w-md mx-auto text-sm sm:text-base", children: "Ready to transform cold prospects into committed demos?" }), _jsx("p", { className: "text-xs sm:text-sm text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed", children: "Stand up, smile, and start a new call to begin the Scholarix methodology." }), _jsxs(Button, { size: "lg", className: "btn-mobile bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto px-6", onClick: () => setShowPreCallSetup(true), children: [_jsx(Phone, { weight: "fill", className: "mr-2 h-5 w-5" }), "Start New Call"] }), _jsxs("div", { className: "mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto text-left", children: [_jsxs("div", { className: "p-4 rounded-lg bg-card border", children: [_jsx("div", { className: "font-medium mb-1", children: "\u26A1 14-Day Deployment" }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Not 6 months. Deploy in 14 days." })] }), _jsxs("div", { className: "p-4 rounded-lg bg-card border", children: [_jsx("div", { className: "font-medium mb-1", children: "\uD83D\uDCB0 40% Below Market" }), _jsx("div", { className: "text-sm text-muted-foreground", children: "2,499 AED/month. Limited slots." })] }), _jsxs("div", { className: "p-4 rounded-lg bg-card border", children: [_jsx("div", { className: "font-medium mb-1", children: "\uD83C\uDFAF 40%+ Conversion" }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Follow the script. Book demos." })] })] })] })) }), _jsx(TabsContent, { value: "ai-helper", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6", children: [_jsx("h2", { className: "text-xl font-bold text-blue-900 mb-2", children: "\uD83E\uDD16 AI Sales Assistant" }), _jsx("p", { className: "text-blue-700 text-sm", children: "Get AI-powered suggestions for handling objections and real-time coaching during your calls." })] }), activeCall && currentNode && (_jsx(LiveCoachingAssistant, { prospectInfo: activeCall.prospectInfo, currentPhase: currentNode.phase, callDuration: Date.now() - activeCall.startTime, onScriptSuggestion: (suggestion) => {
                                                // Could integrate with script display to show suggested text
                                                console.log('Script suggestion:', suggestion);
                                            } })), _jsx(ObjectionHandler, { industry: activeCall?.prospectInfo.industry || 'real-estate', prospectName: activeCall?.prospectInfo.name })] }) }), _jsx(TabsContent, { value: "history", children: _jsx(CallHistory, { calls: callHistory || [] }) }), _jsx(TabsContent, { value: "analytics", children: _jsx(AnalyticsDashboard, { metrics: metrics }) }), _jsx(TabsContent, { value: "settings", children: _jsx(RecordingSettings, {}) })] })] }), _jsx(PreCallSetup, { open: showPreCallSetup, onClose: () => setShowPreCallSetup(false), onStart: startCall }), completedCall && (_jsx(PostCallSummary, { open: showPostCallSummary, callRecord: completedCall, onSave: saveCallSummary }))] }));
}
