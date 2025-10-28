import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PhoneDisconnect, Record, Pause, Play } from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';
import CallTimer from './CallTimer';
import { ProspectInfo } from '@/lib/types';
import { cn } from '@/lib/utils';
import { AudioLevelMeter } from './CallQualityIndicator';
import CallQualityIndicator from './CallQualityIndicator';
import type { CallQualityMetrics } from '@/lib/webrtcService';

interface CallControlsProps {
  prospectInfo: ProspectInfo;
  startTime: number;
  isRecording: boolean;
  isPaused: boolean;
  audioLevel?: number; // 0-100
  callQuality?: CallQualityMetrics | null;
  onEndCall: () => void;
  onToggleRecording: () => void;
  onTogglePause: () => void;
}

export default function CallControls({
  prospectInfo,
  startTime,
  isRecording,
  isPaused,
  audioLevel,
  callQuality,
  onEndCall,
  onToggleRecording,
  onTogglePause
}: CallControlsProps) {
  return (
    <Card className="card-mobile space-mobile-y">
      <div className="space-mobile-y">
        <div>
          <h3 className="text-responsive-lg font-semibold mb-3">Prospect Information</h3>
          <div className="space-y-3 text-sm">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className="text-muted-foreground min-w-0 flex-shrink-0">Name:</span>
              <span className="ml-0 sm:ml-2 font-medium wrap-break-word">{prospectInfo.name}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className="text-muted-foreground min-w-0 flex-shrink-0">Company:</span>
              <span className="ml-0 sm:ml-2 font-medium wrap-break-word">{prospectInfo.company}</span>
            </div>
            {prospectInfo.industry && (
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="text-muted-foreground min-w-0 flex-shrink-0">Industry:</span>
                <span className="ml-0 sm:ml-2 font-medium capitalize">{prospectInfo.industry}</span>
              </div>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className="text-muted-foreground min-w-0 flex-shrink-0">Phone:</span>
              <span className="ml-0 sm:ml-2 font-medium">{prospectInfo.phone}</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Call Duration</span>
            <CallTimer startTime={startTime} isActive={true} />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Recording</span>
            <Badge variant={isRecording && !isPaused ? 'default' : 'secondary'} className={cn(
              isRecording && !isPaused && 'bg-destructive hover:bg-destructive/90'
            )}>
              <div className={cn(
                "h-2 w-2 rounded-full mr-2",
                isRecording && !isPaused ? 'bg-white animate-pulse' : 'bg-muted-foreground'
              )} />
              {isRecording && !isPaused ? 'Recording' : isPaused ? 'Paused' : 'Stopped'}
            </Badge>
          </div>
        </div>

        {/* Audio Level Meter */}
        {audioLevel !== undefined && (
          <div className="pt-4 border-t">
            <AudioLevelMeter level={audioLevel} label="Microphone Level" />
          </div>
        )}

        {/* Call Quality Indicator */}
        {callQuality && (
          <div className="pt-4 border-t">
            <CallQualityIndicator metrics={callQuality} />
          </div>
        )}
      </div>

      {/* Mobile-optimized call controls */}
      <div className="space-mobile-y">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="lg"
            className="btn-mobile flex-1 w-full sm:w-auto"
            onClick={onToggleRecording}
          >
            <Record weight="fill" className="mr-2 h-5 w-5" />
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </Button>
          
          {isRecording && (
            <Button
              variant="outline"
              size="lg"
              className="btn-mobile flex-1 w-full sm:w-auto"
              onClick={onTogglePause}
            >
              {isPaused ? (
                <>
                  <Play weight="fill" className="mr-2 h-5 w-5" />
                  Resume
                </>
              ) : (
                <>
                  <Pause weight="fill" className="mr-2 h-5 w-5" />
                  Pause
                </>
              )}
            </Button>
          )}
        </div>

        <Button
          size="lg"
          variant="destructive"
          className="btn-mobile w-full"
          onClick={onEndCall}
        >
          <PhoneDisconnect weight="fill" className="mr-2 h-5 w-5" />
          End Call
        </Button>
      </div>
    </Card>
  );
}
