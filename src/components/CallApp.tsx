import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
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

export default function CallApp() {
  const [callHistory, setCallHistory] = useKV<CallRecord[]>('scholarix-call-history', []);
  const audioRecorder = useAudioRecorder();
  
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
    
    audioRecorder.startRecording().then(success => {
      if (success) {
        toast.success('Call started - Recording audio locally!');
      } else {
        toast.warning('Call started but audio recording failed. Check microphone permissions.');
      }
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
        
        // Create enhanced recording data
        const recordingData = audioRecordingManager.createRecordingData(
          new Blob([recording.url]), // This will need to be the actual blob
          recording.duration,
          activeCall.prospectInfo.name
        );
        
        recordingUrl = recording.url;
        recordingDuration = recording.duration;
        
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

  const saveCallSummary = (notes: string) => {
    if (!completedCall) return;

    const updatedCall = { ...completedCall, notes };
    setCallHistory((current) => [...(current || []), updatedCall]);
    
    setShowPostCallSummary(false);
    setCompletedCall(null);
    
    if (updatedCall.outcome === 'demo-booked') {
      toast.success('🎉 Demo booked! Remember: Send calendar invite within 1 hour!');
    } else {
      toast.success('Call saved to history');
    }
    
    setActiveTab('analytics');
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
