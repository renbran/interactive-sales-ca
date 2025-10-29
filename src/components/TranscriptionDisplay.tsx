import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Microphone, 
  ClockClockwise, 
  Heart, 
  User, 
  CheckCircle,
  ListChecks,
  ArrowRight,
  TrendUp,
  Clock,
  ChartBar,
  CaretDown,
  CaretRight,
  Play,
  Pause
} from '@phosphor-icons/react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { TranscriptionData, TranscriptionSegment, TranscriptionAnalytics } from '@/lib/types';

interface TranscriptionDisplayProps {
  callId: number;
  recordingUrl?: string;
  onTranscribe: (callId: number) => Promise<void>;
  transcriptionData?: TranscriptionData;
  isTranscribing?: boolean;
}

export default function TranscriptionDisplay({ 
  callId, 
  recordingUrl, 
  onTranscribe, 
  transcriptionData,
  isTranscribing = false 
}: TranscriptionDisplayProps) {
  const [activeSegment, setActiveSegment] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    summary: true,
    insights: false,
    analytics: false
  });
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleTranscribe = async () => {
    await onTranscribe(callId);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'negative':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const jumpToSegment = (startTime: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = startTime;
      if (!isPlaying) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!recordingUrl) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Microphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No recording available for transcription</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Transcription Controls */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Microphone className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold">AI Transcription</h3>
              <p className="text-sm text-muted-foreground">
                {transcriptionData?.status === 'completed' 
                  ? 'Transcription complete' 
                  : transcriptionData?.status === 'processing' || isTranscribing
                  ? 'Processing transcription...'
                  : 'Generate AI transcription with insights'}
              </p>
            </div>
          </div>
          
          {!transcriptionData?.transcript && (
            <Button 
              onClick={handleTranscribe}
              disabled={isTranscribing || transcriptionData?.status === 'processing'}
              className="flex items-center gap-2"
            >
              {isTranscribing || transcriptionData?.status === 'processing' ? (
                <>
                  <ClockClockwise className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Microphone className="h-4 w-4" />
                  Transcribe Call
                </>
              )}
            </Button>
          )}
        </div>
      </Card>

      {/* Processing State */}
      {(isTranscribing || transcriptionData?.status === 'processing') && (
        <Card className="p-6">
          <div className="text-center">
            <ClockClockwise className="h-12 w-12 mx-auto mb-4 text-primary animate-spin" />
            <h3 className="font-semibold mb-2">Processing Transcription</h3>
            <p className="text-muted-foreground">
              Please wait while we transcribe and analyze your call recording...
            </p>
          </div>
        </Card>
      )}

      {/* Transcription Results */}
      {transcriptionData?.transcript && transcriptionData.status === 'completed' && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transcript">Transcript</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Heart className="h-8 w-8 text-primary" />
                  <div>
                    <div className="text-2xl font-bold">
                      {transcriptionData.sentiment?.label || 'Neutral'}
                    </div>
                    <div className="text-sm text-muted-foreground">Overall Sentiment</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <TrendUp className="h-8 w-8 text-primary" />
                  <div>
                    <div className="text-2xl font-bold">
                      {transcriptionData.qualityScore || 'N/A'}
                      {transcriptionData.qualityScore && '/10'}
                    </div>
                    <div className="text-sm text-muted-foreground">Call Quality</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <ListChecks className="h-8 w-8 text-primary" />
                  <div>
                    <div className="text-2xl font-bold">
                      {transcriptionData.keyTopics?.length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Key Topics</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Summary */}
            {transcriptionData.summary && (
              <Collapsible 
                open={expandedSections.summary} 
                onOpenChange={() => toggleSection('summary')}
              >
                <Card>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50">
                    <h3 className="font-semibold flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      Call Summary
                    </h3>
                    {expandedSections.summary ? <CaretDown /> : <CaretRight />}
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-4 pb-4">
                      <p className="text-muted-foreground leading-relaxed">
                        {transcriptionData.summary}
                      </p>
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            )}

            {/* Action Items & Next Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {transcriptionData.actionItems && transcriptionData.actionItems.length > 0 && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <ListChecks className="h-5 w-5 text-primary" />
                    Action Items
                  </h3>
                  <ul className="space-y-2">
                    {transcriptionData.actionItems.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {transcriptionData.nextSteps && transcriptionData.nextSteps.length > 0 && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <ArrowRight className="h-5 w-5 text-primary" />
                    Next Steps
                  </h3>
                  <ul className="space-y-2">
                    {transcriptionData.nextSteps.map((step, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        {step}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Transcript Tab */}
          <TabsContent value="transcript" className="space-y-4">
            {recordingUrl && (
              <Card className="p-4">
                <audio 
                  ref={audioRef}
                  src={recordingUrl}
                  controls
                  className="w-full"
                  onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              </Card>
            )}

            {transcriptionData.segments && (
              <Card>
                <div className="p-4 border-b">
                  <h3 className="font-semibold">Interactive Transcript</h3>
                  <p className="text-sm text-muted-foreground">
                    Click on any segment to jump to that part of the recording
                  </p>
                </div>
                <ScrollArea className="h-[600px]">
                  <div className="p-4 space-y-3">
                    {transcriptionData.segments.map((segment) => (
                      <div
                        key={segment.id}
                        className={cn(
                          "flex gap-4 p-3 rounded-lg cursor-pointer transition-colors",
                          currentTime >= segment.start && currentTime <= segment.end
                            ? "bg-primary/10 border border-primary/20"
                            : "hover:bg-muted/50"
                        )}
                        onClick={() => jumpToSegment(segment.start)}
                      >
                        <div className="shrink-0">
                          <div className="text-xs text-muted-foreground">
                            {formatTime(segment.start)}
                          </div>
                          <Badge variant="outline" className="text-xs mt-1">
                            {segment.speaker}
                          </Badge>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm leading-relaxed">{segment.text}</p>
                          <div className="text-xs text-muted-foreground mt-1">
                            Confidence: {Math.round(segment.confidence * 100)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </Card>
            )}
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-4">
            {transcriptionData.keyTopics && transcriptionData.keyTopics.length > 0 && (
              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <ChartBar className="h-5 w-5 text-primary" />
                  Key Topics Discussed
                </h3>
                <div className="flex flex-wrap gap-2">
                  {transcriptionData.keyTopics.map((topic, index) => (
                    <Badge key={index} variant="secondary">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            {transcriptionData.sentiment && (
              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Sentiment Analysis
                </h3>
                <div className={cn(
                  "p-3 rounded-lg border",
                  getSentimentColor(transcriptionData.sentiment.label)
                )}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {transcriptionData.sentiment.label.charAt(0).toUpperCase() + 
                       transcriptionData.sentiment.label.slice(1)} Sentiment
                    </span>
                    <span className="text-sm">
                      Score: {transcriptionData.sentiment.score.toFixed(2)}
                    </span>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            {transcriptionData.analytics && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Talk Time Ratio</h4>
                    <div className="text-2xl font-bold">
                      {Math.round(transcriptionData.analytics.talkTimeRatio * 100)}%
                    </div>
                    <p className="text-sm text-muted-foreground">You vs. Prospect</p>
                  </Card>

                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Speaking Pace</h4>
                    <div className="text-2xl font-bold">
                      {Math.round(transcriptionData.analytics.speakingPace)}
                    </div>
                    <p className="text-sm text-muted-foreground">Words per minute</p>
                  </Card>

                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Interruptions</h4>
                    <div className="text-2xl font-bold">
                      {transcriptionData.analytics.interruptions}
                    </div>
                    <p className="text-sm text-muted-foreground">Total count</p>
                  </Card>

                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Engagement Score</h4>
                    <div className={cn(
                      "text-2xl font-bold",
                      getQualityColor(transcriptionData.analytics.engagementScore)
                    )}>
                      {transcriptionData.analytics.engagementScore.toFixed(1)}
                    </div>
                    <p className="text-sm text-muted-foreground">Out of 10</p>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Error State */}
      {transcriptionData?.status === 'failed' && (
        <Card className="p-6 border-destructive">
          <div className="text-center">
            <div className="h-12 w-12 mx-auto mb-4 text-destructive">⚠️</div>
            <h3 className="font-semibold mb-2 text-destructive">Transcription Failed</h3>
            <p className="text-muted-foreground mb-4">
              There was an error processing the transcription. Please try again.
            </p>
            <Button variant="outline" onClick={handleTranscribe}>
              Retry Transcription
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}