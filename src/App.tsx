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
import { CallRecord, ProspectInfo, CallObjective, QualificationStatus } from '@/lib/types';
import { scholarixScript, determineOutcome } from '@/lib/scholarixScript';
import { calculateMetrics } from '@/lib/callUtils';

function App() {
  const [callHistory, setCallHistory] = useKV<CallRecord[]>('scholarix-call-history', []);
  
  const [showPreCallSetup, setShowPreCallSetup] = useState(false);
  const [activeCall, setActiveCall] = useState<{
    id: string;
    prospectInfo: ProspectInfo;
    objective: CallObjective;
    startTime: number;
    currentNodeId: string;
    scriptPath: string[];
    qualification: QualificationStatus;
    isRecording: boolean;
    isPaused: boolean;
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
      },
      isRecording: true,
      isPaused: false
    };
    
    setActiveCall(newCall);
    setShowPreCallSetup(false);
    setActiveTab('call');
    toast.success('Call started - follow the script!');
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

  const endCall = () => {
    if (!activeCall) return;

    const endTime = Date.now();
    const duration = Math.floor((endTime - activeCall.startTime) / 1000);
    const outcome = determineOutcome(activeCall.currentNodeId);

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
      scriptPath: activeCall.scriptPath
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
    setActiveCall({
      ...activeCall,
      isRecording: !activeCall.isRecording,
      isPaused: false
    });
    toast.info(activeCall.isRecording ? 'Recording stopped' : 'Recording started');
  };

  const togglePause = () => {
    if (!activeCall) return;
    setActiveCall({
      ...activeCall,
      isPaused: !activeCall.isPaused
    });
    toast.info(activeCall.isPaused ? 'Recording resumed' : 'Recording paused');
  };

  const metrics = calculateMetrics(callHistory || []);
  const currentNode = activeCall ? scholarixScript[activeCall.currentNodeId] : null;

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" />
      
      <div className="container mx-auto py-8 px-4 max-w-[1600px]">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-[32px] font-semibold tracking-tight">Scholarix Telesales System</h1>
                <span className="px-3 py-1 bg-accent text-accent-foreground text-sm font-medium rounded-full">
                  UAE Edition
                </span>
              </div>
              <p className="text-muted-foreground">
                The No-Escape System: Turn cold calls into committed demos in under 5 minutes
              </p>
              <p className="text-sm text-accent font-medium mt-1">
                Target: 40%+ demo booking rate | 14-day deployment | 40 slots available
              </p>
            </div>
            {!activeCall && (
              <Button 
                size="lg" 
                className="bg-accent hover:bg-accent/90 h-12 px-6"
                onClick={() => setShowPreCallSetup(true)}
              >
                <Phone weight="fill" className="mr-2 h-5 w-5" />
                Start New Call
              </Button>
            )}
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="call">Live Call</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="call" className="space-y-6">
            {activeCall && currentNode ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-3">
                  <CallControls
                    prospectInfo={activeCall.prospectInfo}
                    startTime={activeCall.startTime}
                    isRecording={activeCall.isRecording}
                    isPaused={activeCall.isPaused}
                    onEndCall={endCall}
                    onToggleRecording={toggleRecording}
                    onTogglePause={togglePause}
                  />
                </div>

                <div className="lg:col-span-6">
                  <ScriptDisplay
                    currentNode={currentNode}
                    prospectInfo={activeCall.prospectInfo}
                    onResponse={handleResponse}
                  />
                </div>

                <div className="lg:col-span-3">
                  <QualificationChecklist qualification={activeCall.qualification} />
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-accent/10 mb-6">
                  <Phone className="h-12 w-12 text-accent" weight="fill" />
                </div>
                <h2 className="text-2xl font-semibold mb-3">No Active Call</h2>
                <p className="text-muted-foreground mb-2 max-w-md mx-auto">
                  Ready to transform cold prospects into committed demos?
                </p>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                  Stand up, smile, and start a new call to begin the Scholarix methodology.
                </p>
                <Button 
                  size="lg"
                  className="bg-accent hover:bg-accent/90 h-12 px-6"
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

          <TabsContent value="history">
            <CallHistory calls={callHistory || []} />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard metrics={metrics} />
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

export default App;
