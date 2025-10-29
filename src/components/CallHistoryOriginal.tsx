import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Phone, Clock, User, CheckCircle, Microphone, Download, Play, Pause, Trash, Robot } from '@phosphor-icons/react';
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

  const getOutcomeColor = (outcome: string) => {
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

  const getOutcomeLabel = (outcome: string) => {
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

  const getRecordingInfo = (callId: string) => {
    return recordingMetadata[callId] || null;
  };

  const downloadRecording = (call: CallRecord) => {
    if (!call.recordingUrl) return;
    
    const filename = audioRecordingManager.generateFilename(
      call.prospectInfo.name,
      call.startTime
    );
    
    const a = document.createElement('a');
    a.href = call.recordingUrl;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const playRecording = (call: CallRecord) => {
    if (!call.recordingUrl) return;

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
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Call History ({calls.length})</h2>
      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-4">
          {[...calls].reverse().map((call) => (
            <Card key={call.id} className="p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <User className="h-5 w-5 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <div className="font-semibold text-lg">{call.prospectInfo.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {call.prospectInfo.company} • {call.prospectInfo.industry}
                    </div>
                  </div>
                </div>
                <Badge className={cn('ml-4', getOutcomeColor(call.outcome))}>
                  {getOutcomeLabel(call.outcome)}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDuration(call.duration || 0)}
                </div>
                <div>
                  {new Date(call.startTime).toLocaleString()}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {call.qualification.painPointIdentified && (
                  <Badge variant="outline" className="text-xs">
                    <CheckCircle weight="fill" className="h-3 w-3 mr-1 text-success" />
                    Pain Identified
                  </Badge>
                )}
                {call.qualification.painQuantified && (
                  <Badge variant="outline" className="text-xs">
                    <CheckCircle weight="fill" className="h-3 w-3 mr-1 text-success" />
                    Pain Quantified
                  </Badge>
                )}
                {call.qualification.valueAcknowledged && (
                  <Badge variant="outline" className="text-xs">
                    <CheckCircle weight="fill" className="h-3 w-3 mr-1 text-success" />
                    Value Acknowledged
                  </Badge>
                )}
                {call.qualification.demoBooked && (
                  <Badge variant="outline" className="text-xs">
                    <CheckCircle weight="fill" className="h-3 w-3 mr-1 text-success" />
                    Demo Booked!
                  </Badge>
                )}
              </div>

              {call.notes && (
                <div className="text-sm bg-muted/50 rounded p-3 mt-3">
                  <div className="font-medium mb-1">Notes:</div>
                  <div className="text-muted-foreground whitespace-pre-wrap">{call.notes}</div>
                </div>
              )}

              {call.recordingUrl && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Microphone weight="fill" className="h-4 w-4" />
                    <span>Recording available ({formatDuration(call.recordingDuration || 0)})</span>
                    {getRecordingInfo(call.id) && (
                      <Badge variant="outline" className="text-xs">
                        Local Copy
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={playingCallId === call.id ? "default" : "outline"}
                      onClick={() => playingCallId === call.id ? stopRecording() : playRecording(call)}
                      className="shrink-0"
                    >
                      {playingCallId === call.id ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <audio
                      src={call.recordingUrl}
                      controls
                      className="h-8 flex-1 min-w-0"
                    />
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadRecording(call)}
                      className="shrink-0"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="shrink-0"
                        >
                          <Robot className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>AI Transcription - {call.prospectInfo.name}</DialogTitle>
                        </DialogHeader>
                        <TranscriptionDisplay
                          callId={parseInt(call.id)}
                          recordingUrl={call.recordingUrl}
                          onTranscribe={transcribeCall}
                          transcriptionData={transcriptionData[parseInt(call.id)]}
                          isTranscribing={transcribingCalls.has(call.id)}
                        />
                      </DialogContent>
                    </Dialog>
                    
                    {getRecordingInfo(call.id) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteRecording(call.id)}
                        className="shrink-0 text-destructive hover:text-destructive"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
