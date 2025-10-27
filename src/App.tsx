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
import { callScript, determineOutcome } from '@/lib/callScript';
import { calculateMetrics } from '@/lib/callUtils';

function App() {
  const [callHistory, setCallHistory] = useKV<CallRecord[]>('call-history', []);
  
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
        rightPerson: null,
        usingExcel: null,
        painLevel: null,
        hasAuthority: null,
        budgetDiscussed: null,
        demoBooked: null
      },
      isRecording: true,
      isPaused: false
    };
    
    setActiveCall(newCall);
    setShowPreCallSetup(false);
    setActiveTab('call');
    toast.success('Call started');
  };

  const handleResponse = (nextNodeId: string) => {
    if (!activeCall) return;

    const nextNode = callScript[nextNodeId];
    if (!nextNode) return;

    let updatedQualification = { ...activeCall.qualification };
    
    const currentNode = callScript[activeCall.currentNodeId];
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
      if (nextNodeId.startsWith('end-') || nextNodeId === 'confirm-demo') {
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
      toast.success('🎉 Demo booked and saved!');
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
  const currentNode = activeCall ? callScript[activeCall.currentNodeId] : null;

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" />
      
      <div className="container mx-auto py-8 px-4">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[32px] font-semibold tracking-tight mb-1">Sales Call Assistant</h1>
              <p className="text-muted-foreground">Guide your conversations to demo bookings</p>
            </div>
            {!activeCall && (
              <Button 
                size="lg" 
                className="bg-accent hover:bg-accent/90"
                onClick={() => setShowPreCallSetup(true)}
              >
                <Phone weight="fill" className="mr-2 h-5 w-5" />
                New Call
              </Button>
            )}
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
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
                    prospectName={activeCall.prospectInfo.name}
                    onResponse={handleResponse}
                  />
                </div>

                <div className="lg:col-span-3">
                  <QualificationChecklist qualification={activeCall.qualification} />
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <Phone className="h-20 w-20 mx-auto mb-6 text-muted-foreground" />
                <h2 className="text-2xl font-semibold mb-3">No Active Call</h2>
                <p className="text-muted-foreground mb-6">
                  Start a new call to begin guiding your sales conversation
                </p>
                <Button 
                  size="lg"
                  className="bg-accent hover:bg-accent/90"
                  onClick={() => setShowPreCallSetup(true)}
                >
                  <Phone weight="fill" className="mr-2 h-5 w-5" />
                  New Call
                </Button>
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