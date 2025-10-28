import { useState, useRef, useCallback } from 'react';

interface RecordingResult {
  blob: Blob;
  url: string;
  duration: number;
}

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  const startRecording = useCallback(async () => {
    try {
      // Check browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('Browser does not support audio recording');
        return false;
      }

      // Check MediaRecorder support
      if (!window.MediaRecorder) {
        console.error('MediaRecorder API not supported');
        return false;
      }

      // Enhanced audio constraints for better quality
      const audioConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: { ideal: 48000, min: 44100 }, // Higher sample rate for better quality
          channelCount: { ideal: 2, min: 1 }, // Stereo preferred, mono fallback
          sampleSize: { ideal: 16 }, // 16-bit audio
          latency: { ideal: 0.01 }, // Low latency for real-time
          volume: { ideal: 1.0 } // Maximum volume
        } 
      };

      console.log('Requesting microphone access with enhanced audio settings...');
      const stream = await navigator.mediaDevices.getUserMedia(audioConstraints);
      streamRef.current = stream;

      // Log actual audio settings
      const audioTrack = stream.getAudioTracks()[0];
      const settings = audioTrack.getSettings();
      console.log('Audio track settings:', {
        sampleRate: settings.sampleRate,
        channelCount: settings.channelCount,
        echoCancellation: settings.echoCancellation,
        noiseSuppression: settings.noiseSuppression,
        autoGainControl: settings.autoGainControl,
        deviceId: settings.deviceId,
        label: audioTrack.label
      });

      // Determine best supported MIME type with codec for quality
      let mimeType = '';
      let selectedFormat = 'default';
      
      // Priority order: webm with opus (best quality/compression), mp4, ogg, webm basic
      const formats = [
        { mime: 'audio/webm;codecs=opus', name: 'WebM Opus (Best)' },
        { mime: 'audio/webm', name: 'WebM' },
        { mime: 'audio/mp4', name: 'MP4' },
        { mime: 'audio/ogg;codecs=opus', name: 'OGG Opus' },
        { mime: 'audio/ogg', name: 'OGG' },
      ];

      for (const format of formats) {
        if (MediaRecorder.isTypeSupported(format.mime)) {
          mimeType = format.mime;
          selectedFormat = format.name;
          break;
        }
      }

      if (!mimeType) {
        console.warn('No preferred audio format supported, using browser default');
      }

      // Configure MediaRecorder with quality settings
      const recorderOptions: MediaRecorderOptions = {
        mimeType: mimeType || undefined,
        audioBitsPerSecond: 128000, // 128 kbps - high quality audio
      };

      const mediaRecorder = new MediaRecorder(stream, recorderOptions);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.onerror = (event: any) => {
        console.error('MediaRecorder error:', event.error);
      };

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log(`Audio chunk received: ${event.data.size} bytes`);
        }
      };

      // Start recording with timeslice for regular data chunks
      mediaRecorder.start(1000); // Collect data every 1 second (better for quality)
      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0;
      setIsRecording(true);
      setIsPaused(false);

      timerRef.current = setInterval(() => {
        if (!pausedTimeRef.current) {
          setRecordingTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }
      }, 1000);

      console.log('✅ Recording started successfully');
      console.log('   Format:', selectedFormat);
      console.log('   MIME:', mimeType || 'browser default');
      console.log('   Bitrate: 128 kbps');
      console.log('   Sample Rate:', settings.sampleRate, 'Hz');
      
      return true;
    } catch (error: any) {
      console.error('❌ Failed to start recording:', error);
      
      // Provide specific error messages
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        console.error('   Reason: Microphone permission denied');
      } else if (error.name === 'NotFoundError') {
        console.error('   Reason: No microphone found');
      } else if (error.name === 'NotReadableError') {
        console.error('   Reason: Microphone is already in use by another application');
      } else if (error.name === 'OverconstrainedError') {
        console.error('   Reason: Audio constraints cannot be satisfied');
      } else {
        console.error('   Reason:', error.message);
      }
      
      return false;
    }
  }, []);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      pausedTimeRef.current = Date.now();
      setIsPaused(true);
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      if (pausedTimeRef.current) {
        startTimeRef.current += Date.now() - pausedTimeRef.current;
        pausedTimeRef.current = 0;
      }
      setIsPaused(false);
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<RecordingResult> => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorderRef.current) {
        reject(new Error('No recording in progress'));
        return;
      }

      const mediaRecorder = mediaRecorderRef.current;
      const actualMimeType = mediaRecorder.mimeType || 'audio/webm';

      mediaRecorder.onstop = () => {
        console.log('📼 Processing recording...');
        console.log('   Chunks collected:', audioChunksRef.current.length);
        
        // Calculate total size
        const totalSize = audioChunksRef.current.reduce((acc, chunk) => acc + chunk.size, 0);
        console.log('   Total size:', (totalSize / 1024 / 1024).toFixed(2), 'MB');

        // Create blob with correct MIME type
        const audioBlob = new Blob(audioChunksRef.current, { type: actualMimeType });
        const url = URL.createObjectURL(audioBlob);
        const duration = recordingTime;

        console.log('✅ Recording completed');
        console.log('   Duration:', duration, 'seconds');
        console.log('   Format:', actualMimeType);
        console.log('   Quality: High (128 kbps)');

        // Clean up media stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => {
            track.stop();
            console.log('   Stopped track:', track.label);
          });
          streamRef.current = null;
        }

        // Clean up timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        setIsRecording(false);
        setIsPaused(false);
        setRecordingTime(0);

        resolve({ blob: audioBlob, url, duration });
      };

      mediaRecorder.onerror = (event: any) => {
        console.error('❌ Error stopping recording:', event.error);
        reject(new Error('Failed to stop recording'));
      };

      try {
        mediaRecorder.stop();
      } catch (error) {
        console.error('❌ Exception stopping recording:', error);
        reject(error);
      }
    });
  }, [recordingTime]);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
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
