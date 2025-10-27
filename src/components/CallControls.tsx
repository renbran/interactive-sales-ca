import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PhoneDisconnect, Record, Pause, Play } from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';
import CallTimer from './CallTimer';
import { ProspectInfo } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CallControlsProps {
  prospectInfo: ProspectInfo;
  startTime: number;
  isRecording: boolean;
  isPaused: boolean;
  onEndCall: () => void;
  onToggleRecording: () => void;
  onTogglePause: () => void;
}

export default function CallControls({
  prospectInfo,
  startTime,
  isRecording,
  isPaused,
  onEndCall,
  onToggleRecording,
  onTogglePause
}: CallControlsProps) {
  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg mb-2">Prospect Information</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Name:</span>
              <span className="ml-2 font-medium">{prospectInfo.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Company:</span>
              <span className="ml-2 font-medium">{prospectInfo.company}</span>
            </div>
            {prospectInfo.industry && (
              <div>
                <span className="text-muted-foreground">Industry:</span>
                <span className="ml-2 font-medium">{prospectInfo.industry}</span>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Phone:</span>
              <span className="ml-2 font-medium">{prospectInfo.phone}</span>
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
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={onToggleRecording}
          >
            <Record weight="fill" className="mr-2 h-5 w-5" />
            {isRecording ? 'Stop' : 'Record'}
          </Button>
          {isRecording && (
            <Button
              variant="outline"
              size="lg"
              className="flex-1"
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
          className="w-full"
          onClick={onEndCall}
        >
          <PhoneDisconnect weight="fill" className="mr-2 h-5 w-5" />
          End Call
        </Button>
      </div>
    </Card>
  );
}
