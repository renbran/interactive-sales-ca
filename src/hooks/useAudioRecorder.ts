import { useState, useRef, useCallback } from 'react';

  url: string;
}
export functio
  const [isPaused, 
 

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (eve
          audioChunksRef.current.push(event.data);

      mediaRecorder.start(100);
      pau
      setIsPaused(false);
      timerRef.current = setInter

      }, 1000);
      return true;
      console.error('Fail
    }


      pausedTimeRef.current = Date.now();
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(100);
      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0;
      setIsRecording(true);
      setIsPaused(false);

      timerRef.current = setInterval(() => {
        if (!pausedTimeRef.current) {
          setRecordingTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }
      }, 1000);

      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      return false;

    if (m

        streamRef.current.getTracks().forEac
      }
      if (timerRef.current) {
        timerRef.current = null;

     
      set

  return {
    isPaused,
    startRecording,
    resumeRecording,
    cancelRecording
}
      }
















































      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      audioChunksRef.current = [];
      setIsRecording(false);
      setIsPaused(false);
      setRecordingTime(0);
    }
  }, []);

  return {
    isRecording,
    isPaused,
    recordingTime,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    cancelRecording
  };
}
