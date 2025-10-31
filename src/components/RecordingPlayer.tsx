import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Play,
  Pause,
  DownloadSimple,
  ShareNetwork,
  SpeakerHigh,
  SpeakerLow,
  SpeakerSlash
} from '@phosphor-icons/react';
import { audioRecordingManager } from '@/lib/audioRecordingManager';
import { toast } from 'sonner';

interface RecordingPlayerProps {
  callId: string;
  compact?: boolean;
}

export default function RecordingPlayer({ callId, compact = false }: RecordingPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasRecording, setHasRecording] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  useEffect(() => {
    loadRecording();

    return () => {
      // Cleanup blob URL on unmount
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, [callId]);

  const loadRecording = async () => {
    try {
      setIsLoading(true);
      const recording = await audioRecordingManager.getRecording(callId);

      if (recording) {
        // Create audio element
        const audioUrl = URL.createObjectURL(recording.blob);
        audioUrlRef.current = audioUrl;

        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        // Set up event listeners
        audio.addEventListener('loadedmetadata', () => {
          setDuration(audio.duration);
          setIsLoading(false);
          setHasRecording(true);
        });

        audio.addEventListener('timeupdate', () => {
          setCurrentTime(audio.currentTime);
        });

        audio.addEventListener('ended', () => {
          setIsPlaying(false);
          setCurrentTime(0);
        });

        audio.volume = volume;
      } else {
        setIsLoading(false);
        setHasRecording(false);
      }
    } catch (error) {
      console.error('Failed to load recording:', error);
      setIsLoading(false);
      setHasRecording(false);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return;
    const newTime = value[0];
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleDownload = async () => {
    try {
      await audioRecordingManager.downloadRecordingByCallId(callId);
      toast.success('Recording downloaded!');
    } catch (error) {
      console.error('Failed to download recording:', error);
      toast.error('Failed to download recording');
    }
  };

  const handleShare = async () => {
    try {
      await audioRecordingManager.shareRecordingByCallId(callId);
    } catch (error: any) {
      if (error.message.includes('not supported')) {
        toast.error('Sharing not supported on this device. Use download instead.');
      } else {
        console.error('Failed to share recording:', error);
        toast.error('Failed to share recording');
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getVolumeIcon = () => {
    if (volume === 0) return <SpeakerSlash className="h-4 w-4" />;
    if (volume < 0.5) return <SpeakerLow className="h-4 w-4" />;
    return <SpeakerHigh className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        <span>Loading recording...</span>
      </div>
    );
  }

  if (!hasRecording) {
    return (
      <div className="text-sm text-muted-foreground italic">
        No recording available
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={togglePlayPause}
          className="h-8 w-8 p-0"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" weight="fill" />
          ) : (
            <Play className="h-4 w-4" weight="fill" />
          )}
        </Button>

        <div className="flex-1 min-w-0">
          <Slider
            value={[currentTime]}
            max={duration}
            step={0.1}
            onValueChange={handleSeek}
            className="w-full"
          />
        </div>

        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        <Button
          size="sm"
          variant="ghost"
          onClick={handleDownload}
          className="h-8 w-8 p-0"
        >
          <DownloadSimple className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-card">
      {/* Main controls */}
      <div className="flex items-center gap-3">
        <Button
          size="lg"
          variant="outline"
          onClick={togglePlayPause}
          className="h-12 w-12 rounded-full p-0"
        >
          {isPlaying ? (
            <Pause className="h-6 w-6" weight="fill" />
          ) : (
            <Play className="h-6 w-6" weight="fill" />
          )}
        </Button>

        <div className="flex-1 space-y-2">
          <Slider
            value={[currentTime]}
            max={duration}
            step={0.1}
            onValueChange={handleSeek}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Secondary controls */}
      <div className="flex items-center justify-between gap-4">
        {/* Volume control */}
        <div className="flex items-center gap-2 flex-1 max-w-xs">
          <button
            onClick={() => handleVolumeChange([volume === 0 ? 1 : 0])}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {getVolumeIcon()}
          </button>
          <Slider
            value={[volume]}
            max={1}
            step={0.1}
            onValueChange={handleVolumeChange}
            className="w-20"
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownload}
            className="gap-2"
          >
            <DownloadSimple className="h-4 w-4" />
            Download
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleShare}
            className="gap-2"
          >
            <ShareNetwork className="h-4 w-4" />
            Share
          </Button>
        </div>
      </div>
    </div>
  );
}
