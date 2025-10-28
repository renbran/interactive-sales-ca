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
import RecordingSettings from '@/components/RecordingSettings';
import { CallRecord, ProspectInfo, CallObjective, QualificationStatus } from '@/lib/types';
import { scholarixScript, determineOutcome } from '@/lib/scholarixScript';
import { calculateMetrics } from '@/lib/callUtils';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { audioRecordingManager } from '@/lib/audioRecordingManager';

// Helper function to upload recording with retry logic
async function uploadRecordingWithRetry(
  formData: FormData,
  apiUrl: string,
  token: string | null,
  maxRetries = 3
): Promise<any> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Upload attempt ${attempt}/${maxRetries}`);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        return await response.json();
      }

      // If not OK and not last attempt, retry
      if (attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
        console.log(`Upload failed, retrying in ${waitTime/1000}s...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        // Last attempt failed
        throw new Error(`Upload failed after ${maxRetries} attempts: ${response.status}`);
      }
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      // Retry on network error
      const waitTime = Math.pow(2, attempt) * 1000;
      console.log(`Network error, retrying in ${waitTime/1000}s...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  throw new Error('Upload failed after all retries');
}

export default function CallApp() {
  const [callHistory, setCallHistory] = useLocalStorage<CallRecord[]>('scholarix-call-history', []);
  const { user } = useUser();
  const { getToken } = useAuth();
  const audioRecorder = useAudioRecorder();

  // Store recording blob properly in React state instead of window global
  const [pendingRecording, setPendingRecording] = useState<{
    blob: Blob;
    type: string;
  } | null>(null);

  const [showPreCallSetup, setShowPreCallSetup] = useState(false);
  const [activeCall, setActiveCall] = useState<{
    id: string;
    prospectInfo: ProspectInfo;
    objective: CallObjective;
    startTime: number;
    currentNodeId: string;
    scriptPath: string[];
    qualification: QualificationStatus;
  } | null>(null);
  const [showPostCallSummary, setShowPostCallSummary] = useState(false);
  const [completedCall, setCompletedCall] = useState<CallRecord | null>(null);
  const [activeTab, setActiveTab] = useState('call');

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
          const transformedCalls: CallRecord[] = data.calls.map((call: any) => ({
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

          setCallHistory(transformedCalls);
          console.log(`✅ Loaded ${transformedCalls.length} calls from backend`);
        } else {
          const errorText = await response.text();
          console.error('Failed to load calls:', response.status, errorText);
        }
      } catch (error) {
        console.error('Error loading call history:', error);
        // Silently fall back to local storage - no need to alarm the user
        // Keep using local storage if backend fails
      }
    };

    loadCallHistory();
  }, [user, getToken, setCallHistory]);

  const startCall = (prospect: ProspectInfo, objective: CallObjective) => {
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
      } else {
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

  const handleResponse = (nextNodeId: string) => {
    if (!activeCall) return;

    const nextNode = scholarixScript[nextNodeId];
    if (!nextNode) return;

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
    if (!activeCall) return;

    const endTime = Date.now();
    const duration = Math.floor((endTime - activeCall.startTime) / 1000);
    const outcome = determineOutcome(activeCall.currentNodeId);

    let recordingUrl: string | undefined;
    let recordingDuration: number | undefined;

    if (audioRecorder.isRecording) {
      try {
        const recording = await audioRecorder.stopRecording();
        
        // Create enhanced recording data with the actual blob
        const recordingData = audioRecordingManager.createRecordingData(
          recording.blob,
          recording.duration,
          activeCall.prospectInfo.name
        );
        
        // Store the blob for later upload to backend
        recordingUrl = recording.url;
        recordingDuration = recording.duration;

        // Save blob to React state for upload when saving call
        setPendingRecording({
          blob: recording.blob,
          type: recording.blob.type,
        });

        // Save metadata and handle auto-download
        audioRecordingManager.saveRecordingMetadata(recordingData, activeCall.id);
        audioRecordingManager.handleAutoDownload(recordingData);
        
        toast.success(`Audio recording saved! File: ${recordingData.filename}`);
      } catch (error) {
        console.error('Failed to save recording:', error);
        toast.error('Failed to save audio recording');
      }
    }

    const callRecord: CallRecord = {
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

  const saveCallSummary = async (notes: string) => {
    if (!completedCall) return;

    const updatedCall = { ...completedCall, notes };
    
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
        } else {
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

      if (pendingRecording) {
        try {
          console.log('Uploading recording to R2 with retry logic...');
          const formData = new FormData();
          formData.append('recording', pendingRecording.blob, `recording-${leadId}-${Date.now()}.webm`);
          formData.append('lead_id', leadId);
          formData.append('call_id', updatedCall.id);

          // Use retry function with exponential backoff
          const uploadResult = await uploadRecordingWithRetry(
            formData,
            `${API_BASE_URL}/recordings/upload`,
            token,
            3 // Max 3 retries
          );

          recordingUrl = uploadResult.url;
          console.log('Recording uploaded successfully:', recordingUrl);

          // Clean up React state
          setPendingRecording(null);
        } catch (uploadError) {
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
      toast.success('Call saved and synced to cloud!');
    } catch (error: any) {
      console.error('Error saving call to backend:', error);
      toast.error(`Call saved locally but failed to sync: ${error.message || 'Network error'}`);
    }
    
    setShowPostCallSummary(false);
    setCompletedCall(null);
    
    if (updatedCall.outcome === 'demo-booked') {
      toast('🎉 Demo booked! Remember: Send calendar invite within 1 hour!');
    }
    
    setActiveTab('analytics');
  };

  // Helper function to calculate qualification score
  const calculateQualificationScore = (qualification: QualificationStatus): number => {
    const scores = Object.values(qualification).map(val => 
      val === true ? 1 : val === false ? 0 : 0.5
    );
    const sum = scores.reduce((a, b) => a + b, 0);
    return Math.round((sum / scores.length) * 100);
  };

  const toggleRecording = () => {
    if (!activeCall) return;
    
    if (audioRecorder.isRecording) {
      audioRecorder.stopRecording().then(() => {
        toast.info('Recording stopped');
      });
    } else {
      audioRecorder.startRecording().then(success => {
        if (success) {
          toast.info('Recording started');
        } else {
          toast.error('Failed to start recording');
        }
      });
    }
  };

  const togglePause = () => {
    if (!activeCall || !audioRecorder.isRecording) return;
    
    if (audioRecorder.isPaused) {
      audioRecorder.resumeRecording();
      toast.info('Recording resumed');
    } else {
      audioRecorder.pauseRecording();
      toast.info('Recording paused');
    }
  };

  const metrics = calculateMetrics(callHistory || []);
  const currentNode = activeCall ? scholarixScript[activeCall.currentNodeId] : null;

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" />
      
      <div className="mobile-container mx-auto py-4 sm:py-6 lg:py-8 max-w-[1600px]">
        {/* Mobile-First Header */}
        <header className="mb-6 sm:mb-8">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            {/* Title Section - Stacked on mobile */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <h1 className="text-responsive-xl sm:text-responsive-2xl font-semibold tracking-tight">
                  Scholarix Telesales System
                </h1>
                <span className="inline-block px-3 py-1 bg-accent text-accent-foreground text-xs sm:text-sm font-medium rounded-full w-fit">
                  UAE Edition
                </span>
              </div>
              
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                The No-Escape System: Turn cold calls into committed demos in under 5 minutes
              </p>
              
              <p className="text-xs sm:text-sm text-accent font-medium">
                <span className="block sm:inline">Target: 40%+ demo booking rate</span>
                <span className="hidden sm:inline mx-1">|</span>
                <span className="block sm:inline">14-day deployment</span>
                <span className="hidden sm:inline mx-1">|</span>
                <span className="block sm:inline">40 slots available</span>
              </p>
            </div>
            
            {/* CTA Button - Full width on mobile, auto on desktop */}
            {!activeCall && (
              <Button 
                size="lg" 
                className="btn-mobile bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto lg:w-auto px-6"
                onClick={() => setShowPreCallSetup(true)}
              >
                <Phone weight="fill" className="mr-2 h-5 w-5" />
                Start New Call
              </Button>
            )}
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          {/* Mobile-optimized horizontal scrolling tabs */}
          <div className="tabs-mobile">
            <TabsList className="inline-flex h-12 w-max min-w-full items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground">
              <TabsTrigger 
                value="call" 
                className="whitespace-nowrap px-3 sm:px-4 py-2 text-sm font-medium touch-target"
              >
                Live Call
              </TabsTrigger>
              
              <TabsTrigger 
                value="ai-helper" 
                className="whitespace-nowrap px-3 sm:px-4 py-2 text-sm font-medium touch-target"
              >
                AI Helper
              </TabsTrigger>
              
              <TabsTrigger 
                value="history" 
                className="whitespace-nowrap px-3 sm:px-4 py-2 text-sm font-medium touch-target"
              >
                History
              </TabsTrigger>
              
              <TabsTrigger 
                value="analytics" 
                className="whitespace-nowrap px-3 sm:px-4 py-2 text-sm font-medium touch-target"
              >
                Analytics
              </TabsTrigger>
              
              <TabsTrigger 
                value="settings" 
                className="whitespace-nowrap px-3 sm:px-4 py-2 text-sm font-medium touch-target"
              >
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="call" className="space-y-4 sm:space-y-6">
            {activeCall && currentNode ? (
              <div className="space-y-4 lg:grid lg:grid-cols-12 lg:gap-6 lg:space-y-0">
                {/* Call Controls - Priority on mobile (top) */}
                <div className="order-1 lg:order-1 lg:col-span-3">
                  <CallControls
                    prospectInfo={activeCall.prospectInfo}
                    startTime={activeCall.startTime}
                    isRecording={audioRecorder.isRecording}
                    isPaused={audioRecorder.isPaused}
                    onEndCall={endCall}
                    onToggleRecording={toggleRecording}
                    onTogglePause={togglePause}
                  />
                </div>

                {/* Script Display - Main content (middle on mobile) */}
                <div className="order-2 lg:order-2 lg:col-span-6">
                  <ScriptDisplay
                    currentNode={currentNode}
                    prospectInfo={activeCall.prospectInfo}
                    onResponse={handleResponse}
                  />
                </div>

                {/* Qualification Checklist - Bottom on mobile */}
                <div className="order-3 lg:order-3 lg:col-span-3">
                  <QualificationChecklist qualification={activeCall.qualification} />
                </div>
              </div>
            ) : (
              <div className="text-center py-12 sm:py-16 lg:py-20 px-4">
                <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-accent/10 mb-4 sm:mb-6">
                  <Phone className="h-10 w-10 sm:h-12 sm:w-12 text-accent" weight="fill" />
                </div>
                
                <h2 className="text-responsive-lg sm:text-responsive-xl font-semibold mb-3">
                  No Active Call
                </h2>
                
                <p className="text-muted-foreground mb-2 max-w-md mx-auto text-sm sm:text-base">
                  Ready to transform cold prospects into committed demos?
                </p>
                
                <p className="text-xs sm:text-sm text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
                  Stand up, smile, and start a new call to begin the Scholarix methodology.
                </p>
                
                <Button 
                  size="lg"
                  className="btn-mobile bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto px-6"
                  onClick={() => setShowPreCallSetup(true)}
                >
                  <Phone weight="fill" className="mr-2 h-5 w-5" />
                  Start New Call
                </Button>
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
                  <div className="p-4 rounded-lg bg-card border">
                    <div className="font-medium mb-1">⚡ 14-Day Deployment</div>
                    <div className="text-sm text-muted-foreground">Not 6 months. Deploy in 14 days.</div>
                  </div>
                  <div className="p-4 rounded-lg bg-card border">
                    <div className="font-medium mb-1">💰 40% Below Market</div>
                    <div className="text-sm text-muted-foreground">2,499 AED/month. Limited slots.</div>
                  </div>
                  <div className="p-4 rounded-lg bg-card border">
                    <div className="font-medium mb-1">🎯 40%+ Conversion</div>
                    <div className="text-sm text-muted-foreground">Follow the script. Book demos.</div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="ai-helper">
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                <h2 className="text-xl font-bold text-blue-900 mb-2">🤖 AI Sales Assistant</h2>
                <p className="text-blue-700 text-sm">
                  Get AI-powered suggestions for handling objections and improving your sales conversations.
                </p>
              </div>
              
              <ObjectionHandler 
                industry={activeCall?.prospectInfo.industry || 'real-estate'}
                prospectName={activeCall?.prospectInfo.name}
              />
            </div>
          </TabsContent>

          <TabsContent value="history">
            <CallHistory calls={callHistory || []} />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard metrics={metrics} />
          </TabsContent>

          <TabsContent value="settings">
            <RecordingSettings />
          </TabsContent>
        </Tabs>
      </div>

      <PreCallSetup
        open={showPreCallSetup}
        onClose={() => setShowPreCallSetup(false)}
        onStart={startCall}
      />

      {completedCall && (
        <PostCallSummary
          open={showPostCallSummary}
          callRecord={completedCall}
          onSave={saveCallSummary}
        />
      )}
    </div>
  );
}

// Export removed - now using named export above
