import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { 
  Phone, 
  Clock, 
  User, 
  CheckCircle, 
  Microphone, 
  Download, 
  Play, 
  Pause, 
  Trash,
  Robot,
  DotsThree,
  CaretDown,
  CaretRight,
  Heart,
  TrendUp,
  ListChecks,
  ChartBar
} from '@phosphor-icons/react';
import { CallRecord } from '@/lib/types';
import { formatDuration } from '@/lib/callUtils';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { audioRecordingManager } from '@/lib/audioRecordingManager';
import { transcriptionApi } from '@/lib/transcriptionApi';
import TranscriptionDisplay from './TranscriptionDisplay';

interface CallHistoryProps {
  calls: CallRecord[];
}

interface CallCardProps {
  call: CallRecord;
  playingCallId: string | null;
  onPlayRecording: (call: CallRecord) => void;
  onStopRecording: () => void;
  onDownloadRecording: (call: CallRecord) => void;
  onDeleteRecording: (callId: string) => void;
  onTranscribeCall: (callId: number) => Promise<void>;
  transcriptionData: any;
  isTranscribing: boolean;
  getRecordingInfo: (callId: string) => any;
}

// Separate Call Card Component for better organization
function CallCard({ 
  call, 
  playingCallId, 
  onPlayRecording, 
  onStopRecording, 
  onDownloadRecording, 
  onDeleteRecording,
  onTranscribeCall,
  transcriptionData,
  isTranscribing,
  getRecordingInfo 
}: CallCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  const getOutcomeColor = (outcome: string) => {
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

  const getOutcomeLabel = (outcome: string) => {
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

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      {/* Main Call Summary - Always Visible */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="mt-1">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                call.outcome === 'demo-booked' ? 'bg-green-100' :
                call.outcome === 'follow-up-scheduled' ? 'bg-yellow-100' :
                call.outcome === 'not-interested' ? 'bg-red-100' : 'bg-gray-100'
              )}>
                <User className={cn(
                  "h-5 w-5",
                  call.outcome === 'demo-booked' ? 'text-green-600' :
                  call.outcome === 'follow-up-scheduled' ? 'text-yellow-600' :
                  call.outcome === 'not-interested' ? 'text-red-600' : 'text-gray-600'
                )} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg truncate">{call.prospectInfo.name}</h3>
                <Badge className={cn('text-xs px-2 py-0.5', getOutcomeColor(call.outcome))}>
                  {getOutcomeLabel(call.outcome)}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground truncate mb-2">
                {call.prospectInfo.company} • {call.prospectInfo.industry}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(call.duration || 0)}
                </div>
                <div>
                  {new Date(call.startTime).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  {qualificationScore}/4 Qualified
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center gap-2 ml-4">
            {call.recordingUrl && (
              <>
                <Button
                  size="sm"
                  variant={playingCallId === call.id ? "default" : "ghost"}
                  onClick={() => playingCallId === call.id ? onStopRecording() : onPlayRecording(call)}
                  className="h-8 w-8 p-0"
                >
                  {playingCallId === call.id ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                
                {hasTranscription && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setActiveTab('transcription')}
                    className="h-8 w-8 p-0 text-green-600"
                  >
                    <Robot className="h-4 w-4" />
                  </Button>
                )}
                
                {transcriptionProcessing && (
                  <div className="h-8 w-8 flex items-center justify-center">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                )}
              </>
            )}
            
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                >
                  {isExpanded ? <CaretDown className="h-4 w-4" /> : <CaretRight className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
        </div>

        {/* Expandable Content */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent className="space-y-4">
            <Separator />
            
            {/* Tabs for Different Views */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="recording" disabled={!call.recordingUrl}>
                  Recording
                  {call.recordingUrl && <Microphone className="h-3 w-3 ml-1" />}
                </TabsTrigger>
                <TabsTrigger value="transcription" disabled={!call.recordingUrl}>
                  AI Insights
                  {hasTranscription && <Robot className="h-3 w-3 ml-1 text-green-600" />}
                  {transcriptionProcessing && <div className="h-3 w-3 ml-1 animate-spin rounded-full border border-primary border-t-transparent" />}
                </TabsTrigger>
              </TabsList>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-4 mt-4">
                {/* Qualification Badges */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Qualification Progress</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Badge variant={call.qualification.painPointIdentified ? "default" : "outline"} className="text-xs justify-center">
                      <CheckCircle weight="fill" className={cn("h-3 w-3 mr-1", 
                        call.qualification.painPointIdentified ? "text-white" : "text-muted-foreground")} />
                      Pain Identified
                    </Badge>
                    <Badge variant={call.qualification.painQuantified ? "default" : "outline"} className="text-xs justify-center">
                      <CheckCircle weight="fill" className={cn("h-3 w-3 mr-1", 
                        call.qualification.painQuantified ? "text-white" : "text-muted-foreground")} />
                      Pain Quantified
                    </Badge>
                    <Badge variant={call.qualification.valueAcknowledged ? "default" : "outline"} className="text-xs justify-center">
                      <CheckCircle weight="fill" className={cn("h-3 w-3 mr-1", 
                        call.qualification.valueAcknowledged ? "text-white" : "text-muted-foreground")} />
                      Value Acknowledged
                    </Badge>
                    <Badge variant={call.qualification.demoBooked ? "default" : "outline"} className="text-xs justify-center">
                      <CheckCircle weight="fill" className={cn("h-3 w-3 mr-1", 
                        call.qualification.demoBooked ? "text-white" : "text-muted-foreground")} />
                      Demo Booked
                    </Badge>
                  </div>
                </div>

                {/* Notes */}
                {call.notes && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Call Notes</h4>
                    <div className="text-sm bg-muted/50 rounded-lg p-3">
                      <div className="text-muted-foreground whitespace-pre-wrap">{call.notes}</div>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Recording Tab */}
              <TabsContent value="recording" className="space-y-4 mt-4">
                {call.recordingUrl && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Microphone weight="fill" className="h-4 w-4" />
                        <span>Recording ({formatDuration(call.recordingDuration || 0)})</span>
                        {getRecordingInfo(call.id) && (
                          <Badge variant="outline" className="text-xs">Local Copy</Badge>
                        )}
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline">
                            <DotsThree className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onDownloadRecording(call)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          {getRecordingInfo(call.id) && (
                            <DropdownMenuItem 
                              onClick={() => onDeleteRecording(call.id)}
                              className="text-destructive"
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Delete Local Copy
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <audio
                      src={call.recordingUrl}
                      controls
                      className="w-full"
                    />
                  </div>
                )}
              </TabsContent>

              {/* Transcription Tab */}
              <TabsContent value="transcription" className="mt-4">
                {call.recordingUrl ? (
                  <div className="space-y-4">
                    {!hasTranscription && !transcriptionProcessing && (
                      <div className="text-center py-8">
                        <Robot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h4 className="font-medium mb-2">AI Transcription Available</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Get AI-powered insights including sentiment analysis, key topics, and action items.
                        </p>
                        <Button onClick={() => onTranscribeCall(parseInt(call.id))}>
                          <Robot className="h-4 w-4 mr-2" />
                          Generate AI Insights
                        </Button>
                      </div>
                    )}
                    
                    {transcriptionProcessing && (
                      <div className="text-center py-8">
                        <div className="h-12 w-12 mx-auto mb-4 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                        <h4 className="font-medium mb-2">Processing...</h4>
                        <p className="text-sm text-muted-foreground">
                          AI is analyzing your call recording. This usually takes 1-2 minutes.
                        </p>
                      </div>
                    )}
                    
                    {hasTranscription && (
                      <div className="space-y-4">
                        {/* Quick Insights */}
                        <div className="grid grid-cols-3 gap-4">
                          <Card className="p-3 text-center">
                            <Heart className="h-6 w-6 mx-auto mb-2 text-primary" />
                            <div className="font-medium text-sm">
                              {transcriptionData.sentiment?.label || 'Neutral'}
                            </div>
                            <div className="text-xs text-muted-foreground">Sentiment</div>
                          </Card>
                          <Card className="p-3 text-center">
                            <TrendUp className="h-6 w-6 mx-auto mb-2 text-primary" />
                            <div className="font-medium text-sm">
                              {transcriptionData.qualityScore || 'N/A'}/10
                            </div>
                            <div className="text-xs text-muted-foreground">Quality</div>
                          </Card>
                          <Card className="p-3 text-center">
                            <ListChecks className="h-6 w-6 mx-auto mb-2 text-primary" />
                            <div className="font-medium text-sm">
                              {transcriptionData.keyTopics?.length || 0}
                            </div>
                            <div className="text-xs text-muted-foreground">Topics</div>
                          </Card>
                        </div>
                        
                        {/* Summary */}
                        {transcriptionData.summary && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium">AI Summary</h4>
                            <div className="text-sm bg-muted/50 rounded-lg p-3">
                              {transcriptionData.summary}
                            </div>
                          </div>
                        )}
                        
                        {/* Action Items */}
                        {transcriptionData.actionItems && transcriptionData.actionItems.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium">Action Items</h4>
                            <ul className="space-y-1">
                              {transcriptionData.actionItems.slice(0, 3).map((item: string, index: number) => (
                                <li key={index} className="flex items-start gap-2 text-sm">
                                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <Button variant="outline" className="w-full" onClick={() => {
                          // Open full transcription modal
                          const modal = document.createElement('div');
                          modal.id = 'transcription-modal';
                          document.body.appendChild(modal);
                        }}>
                          <ChartBar className="h-4 w-4 mr-2" />
                          View Full Analysis
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Microphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No recording available for transcription</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </Card>
  );
}

export default function CallHistory({ calls }: CallHistoryProps) {
  const [playingCallId, setPlayingCallId] = useState<string | null>(null);
  const [recordingMetadata, setRecordingMetadata] = useState<Record<string, any>>({});
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [transcriptionData, setTranscriptionData] = useState<Record<string, any>>({});
  const [transcribingCalls, setTranscribingCalls] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load recording metadata
    setRecordingMetadata(audioRecordingManager.getRecordingMetadata());
  }, []);

  const getRecordingInfo = (callId: string) => {
    return recordingMetadata[callId];
  };

  const downloadRecording = async (call: CallRecord) => {
    if (!call.recordingUrl) return;
    
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
    } catch (error) {
      console.error('Error downloading recording:', error);
    }
  };

  const playRecording = (call: CallRecord) => {
    if (!call.recordingUrl) return;
    
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

  const deleteRecording = (callId: string) => {
    if (playingCallId === callId) {
      stopRecording();
    }
    
    // Remove from metadata
    const updatedMetadata = { ...recordingMetadata };
    delete updatedMetadata[callId];
    localStorage.setItem('scholarix-recordings-metadata', JSON.stringify(updatedMetadata));
    setRecordingMetadata(updatedMetadata);
  };

  const transcribeCall = async (callId: number) => {
    setTranscribingCalls(prev => new Set(prev).add(callId.toString()));
    
    try {
      const result = await transcriptionApi.transcribeCall(callId);
      setTranscriptionData(prev => ({
        ...prev,
        [callId]: result.data
      }));
    } catch (error) {
      console.error('Error transcribing call:', error);
      // Set failed status
      setTranscriptionData(prev => ({
        ...prev,
        [callId]: { status: 'failed' }
      }));
    } finally {
      setTranscribingCalls(prev => {
        const newSet = new Set(prev);
        newSet.delete(callId.toString());
        return newSet;
      });
    }
  };

  const fetchTranscription = async (callId: number) => {
    try {
      const result = await transcriptionApi.getTranscription(callId);
      setTranscriptionData(prev => ({
        ...prev,
        [callId]: result.data
      }));
    } catch (error) {
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
    return (
      <Card className="p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <Phone className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Calls Yet</h3>
        <p className="text-muted-foreground mb-6">
          Your call history will appear here after you complete your first call.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Call History ({calls.length})</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Demo Booked
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            Follow-up
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            Not Interested
          </div>
        </div>
      </div>
      
      <ScrollArea className="h-[700px]">
        <div className="space-y-3">
          {[...calls].reverse().map((call) => (
            <CallCard
              key={call.id}
              call={call}
              playingCallId={playingCallId}
              onPlayRecording={playRecording}
              onStopRecording={stopRecording}
              onDownloadRecording={downloadRecording}
              onDeleteRecording={deleteRecording}
              onTranscribeCall={transcribeCall}
              transcriptionData={transcriptionData[parseInt(call.id)]}
              isTranscribing={transcribingCalls.has(call.id)}
              getRecordingInfo={getRecordingInfo}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}