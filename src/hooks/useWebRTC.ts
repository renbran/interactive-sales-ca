// React hook for WebRTC integration
// Simplifies VOIP call management in React components

import { useState, useRef, useCallback, useEffect } from 'react';
import { WebRTCService, type CallQualityMetrics, type WebRTCCallConfig } from '@/lib/webrtcService';

export function useWebRTC(config: WebRTCCallConfig = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callQuality, setCallQuality] = useState<CallQualityMetrics | null>(null);
  const [remoteAudioElement, setRemoteAudioElement] = useState<HTMLAudioElement | null>(null);

  const webrtcServiceRef = useRef<WebRTCService | null>(null);

  // Initialize WebRTC service
  useEffect(() => {
    const service = new WebRTCService({
      ...config,
      onRemoteStream: (stream) => {
        console.log('Received remote stream');

        // Create audio element for remote stream
        const audio = new Audio();
        audio.srcObject = stream;
        audio.autoplay = true;
        audio.play().catch(err => console.error('Failed to play remote audio:', err));
        setRemoteAudioElement(audio);

        // Call original callback if provided
        if (config.onRemoteStream) {
          config.onRemoteStream(stream);
        }
      },
      onQualityUpdate: (metrics) => {
        setCallQuality(metrics);

        // Call original callback if provided
        if (config.onQualityUpdate) {
          config.onQualityUpdate(metrics);
        }
      },
      onConnectionStateChange: (state) => {
        setIsConnected(state === 'connected');
        setIsConnecting(state === 'connecting');

        // Call original callback if provided
        if (config.onConnectionStateChange) {
          config.onConnectionStateChange(state);
        }
      },
    });

    webrtcServiceRef.current = service;

    return () => {
      // Cleanup on unmount
      if (webrtcServiceRef.current) {
        webrtcServiceRef.current.endCall();
      }
      if (remoteAudioElement) {
        remoteAudioElement.pause();
        remoteAudioElement.srcObject = null;
      }
    };
  }, []);

  /**
   * Start a call (initiator)
   */
  const startCall = useCallback(async () => {
    if (!webrtcServiceRef.current) {
      throw new Error('WebRTC service not initialized');
    }

    try {
      setIsConnecting(true);
      await webrtcServiceRef.current.initializeConnection();
      const offer = await webrtcServiceRef.current.createOffer();

      console.log('Call started, offer created:', offer);

      // In a real implementation, send this offer to the other peer via signaling server
      // For now, return it so the caller can handle signaling
      return offer;
    } catch (error) {
      setIsConnecting(false);
      console.error('Failed to start call:', error);
      throw error;
    }
  }, []);

  /**
   * Answer an incoming call
   */
  const answerCall = useCallback(async (offer: RTCSessionDescriptionInit) => {
    if (!webrtcServiceRef.current) {
      throw new Error('WebRTC service not initialized');
    }

    try {
      setIsConnecting(true);
      await webrtcServiceRef.current.initializeConnection();
      const answer = await webrtcServiceRef.current.handleOffer(offer);

      console.log('Call answered, answer created:', answer);

      // In a real implementation, send this answer to the other peer via signaling server
      return answer;
    } catch (error) {
      setIsConnecting(false);
      console.error('Failed to answer call:', error);
      throw error;
    }
  }, []);

  /**
   * Handle the answer from the other peer
   */
  const handleAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    if (!webrtcServiceRef.current) {
      throw new Error('WebRTC service not initialized');
    }

    try {
      await webrtcServiceRef.current.handleAnswer(answer);
      console.log('Answer handled successfully');
    } catch (error) {
      console.error('Failed to handle answer:', error);
      throw error;
    }
  }, []);

  /**
   * Add ICE candidate from remote peer
   */
  const addIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    if (!webrtcServiceRef.current) {
      throw new Error('WebRTC service not initialized');
    }

    try {
      await webrtcServiceRef.current.addIceCandidate(candidate);
    } catch (error) {
      console.error('Failed to add ICE candidate:', error);
      throw error;
    }
  }, []);

  /**
   * Toggle mute
   */
  const toggleMute = useCallback(() => {
    if (!webrtcServiceRef.current) return;

    const newMutedState = !isMuted;
    webrtcServiceRef.current.setMuted(newMutedState);
    setIsMuted(newMutedState);
  }, [isMuted]);

  /**
   * End the call
   */
  const endCall = useCallback(() => {
    if (!webrtcServiceRef.current) return;

    webrtcServiceRef.current.endCall();
    setIsConnected(false);
    setIsConnecting(false);
    setCallQuality(null);

    if (remoteAudioElement) {
      remoteAudioElement.pause();
      remoteAudioElement.srcObject = null;
      setRemoteAudioElement(null);
    }

    console.log('Call ended');
  }, [remoteAudioElement]);

  /**
   * Get local media stream
   */
  const getLocalStream = useCallback((): MediaStream | null => {
    return webrtcServiceRef.current?.getLocalStream() || null;
  }, []);

  /**
   * Get remote media stream
   */
  const getRemoteStream = useCallback((): MediaStream | null => {
    return webrtcServiceRef.current?.getRemoteStream() || null;
  }, []);

  return {
    // State
    isConnected,
    isConnecting,
    isMuted,
    callQuality,

    // Actions
    startCall,
    answerCall,
    handleAnswer,
    addIceCandidate,
    toggleMute,
    endCall,

    // Getters
    getLocalStream,
    getRemoteStream,

    // Service reference (for advanced usage)
    webrtcService: webrtcServiceRef.current,
  };
}
