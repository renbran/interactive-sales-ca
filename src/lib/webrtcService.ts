// WebRTC Service for peer-to-peer voice calling
// Enables real VOIP functionality similar to callGEAR

export interface CallQualityMetrics {
  jitter: number; // milliseconds
  packetLoss: number; // percentage
  latency: number; // milliseconds (round-trip time)
  bitrate: number; // kbps
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface WebRTCCallConfig {
  iceServers?: RTCIceServer[];
  audio?: MediaStreamConstraints['audio'];
  onRemoteStream?: (stream: MediaStream) => void;
  onQualityUpdate?: (metrics: CallQualityMetrics) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
}

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private config: WebRTCCallConfig;
  private qualityMonitorInterval: number | null = null;

  constructor(config: WebRTCCallConfig = {}) {
    this.config = {
      iceServers: config.iceServers || [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
      audio: config.audio || {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: { ideal: 48000, min: 44100 },
        channelCount: { ideal: 2, min: 1 },
      },
      ...config,
    };
  }

  /**
   * Initialize WebRTC connection
   */
  async initializeConnection(): Promise<void> {
    try {
      // Get local media stream (microphone)
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: this.config.audio,
        video: false,
      });

      // Create peer connection
      this.peerConnection = new RTCPeerConnection({
        iceServers: this.config.iceServers,
      });

      // Add local tracks to connection
      this.localStream.getTracks().forEach(track => {
        this.peerConnection!.addTrack(track, this.localStream!);
      });

      // Handle remote stream
      this.peerConnection.ontrack = (event) => {
        console.log('Received remote track:', event.track.kind);
        if (!this.remoteStream) {
          this.remoteStream = new MediaStream();
        }
        this.remoteStream.addTrack(event.track);

        if (this.config.onRemoteStream) {
          this.config.onRemoteStream(this.remoteStream);
        }
      };

      // Monitor connection state
      this.peerConnection.onconnectionstatechange = () => {
        const state = this.peerConnection!.connectionState;
        console.log('Connection state:', state);

        if (this.config.onConnectionStateChange) {
          this.config.onConnectionStateChange(state);
        }

        // Start quality monitoring when connected
        if (state === 'connected') {
          this.startQualityMonitoring();
        } else if (state === 'disconnected' || state === 'failed' || state === 'closed') {
          this.stopQualityMonitoring();
        }
      };

      // Handle ICE candidates
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('New ICE candidate:', event.candidate.candidate);
          // In a real implementation, send this to the other peer via signaling server
        }
      };

      console.log('✅ WebRTC connection initialized');
    } catch (error) {
      console.error('❌ Failed to initialize WebRTC:', error);
      throw error;
    }
  }

  /**
   * Create an offer to start a call
   */
  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      console.log('Created offer:', offer);
      return offer;
    } catch (error) {
      console.error('Failed to create offer:', error);
      throw error;
    }
  }

  /**
   * Handle an incoming call offer
   */
  async handleOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    try {
      await this.peerConnection.setRemoteDescription(offer);
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      console.log('Created answer:', answer);
      return answer;
    } catch (error) {
      console.error('Failed to handle offer:', error);
      throw error;
    }
  }

  /**
   * Handle the answer to our offer
   */
  async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    try {
      await this.peerConnection.setRemoteDescription(answer);
      console.log('Set remote description (answer)');
    } catch (error) {
      console.error('Failed to handle answer:', error);
      throw error;
    }
  }

  /**
   * Add ICE candidate from remote peer
   */
  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    try {
      await this.peerConnection.addIceCandidate(candidate);
      console.log('Added ICE candidate');
    } catch (error) {
      console.error('Failed to add ICE candidate:', error);
      throw error;
    }
  }

  /**
   * Monitor call quality metrics
   */
  private async startQualityMonitoring(): Promise<void> {
    if (!this.peerConnection) return;

    this.qualityMonitorInterval = window.setInterval(async () => {
      if (!this.peerConnection) return;

      try {
        const stats = await this.peerConnection.getStats();
        const metrics = this.extractQualityMetrics(stats);

        if (metrics && this.config.onQualityUpdate) {
          this.config.onQualityUpdate(metrics);
        }
      } catch (error) {
        console.error('Failed to get stats:', error);
      }
    }, 2000); // Update every 2 seconds
  }

  /**
   * Stop quality monitoring
   */
  private stopQualityMonitoring(): void {
    if (this.qualityMonitorInterval) {
      clearInterval(this.qualityMonitorInterval);
      this.qualityMonitorInterval = null;
    }
  }

  /**
   * Extract quality metrics from WebRTC stats
   */
  private extractQualityMetrics(stats: RTCStatsReport): CallQualityMetrics | null {
    let jitter = 0;
    let packetLoss = 0;
    let latency = 0;
    let bitrate = 0;

    stats.forEach((report) => {
      // Inbound audio stats
      if (report.type === 'inbound-rtp' && report.kind === 'audio') {
        jitter = (report.jitter || 0) * 1000; // Convert to milliseconds

        const packetsLost = report.packetsLost || 0;
        const packetsReceived = report.packetsReceived || 1;
        packetLoss = (packetsLost / (packetsLost + packetsReceived)) * 100;

        bitrate = (report.bytesReceived || 0) * 8 / 1000; // kbps
      }

      // Candidate pair stats for latency
      if (report.type === 'candidate-pair' && report.state === 'succeeded') {
        latency = (report.currentRoundTripTime || 0) * 1000; // Convert to milliseconds
      }
    });

    // Determine quality level
    let quality: CallQualityMetrics['quality'] = 'excellent';
    if (packetLoss > 5 || jitter > 30 || latency > 300) {
      quality = 'poor';
    } else if (packetLoss > 2 || jitter > 20 || latency > 200) {
      quality = 'fair';
    } else if (packetLoss > 1 || jitter > 10 || latency > 100) {
      quality = 'good';
    }

    return {
      jitter: Math.round(jitter * 10) / 10,
      packetLoss: Math.round(packetLoss * 10) / 10,
      latency: Math.round(latency),
      bitrate: Math.round(bitrate),
      quality,
    };
  }

  /**
   * Get local media stream
   */
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  /**
   * Get remote media stream
   */
  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  /**
   * Mute/unmute local audio
   */
  setMuted(muted: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !muted;
      });
    }
  }

  /**
   * End the call and cleanup
   */
  endCall(): void {
    // Stop quality monitoring
    this.stopQualityMonitoring();

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Clear remote stream
    this.remoteStream = null;

    console.log('Call ended and cleaned up');
  }

  /**
   * Get connection state
   */
  getConnectionState(): RTCPeerConnectionState | null {
    return this.peerConnection?.connectionState || null;
  }
}

/**
 * Create a dual-track recorder for recording both agent and prospect audio
 */
export function createDualTrackRecorder(
  localStream: MediaStream,
  remoteStream: MediaStream,
  options: MediaRecorderOptions = {}
): MediaRecorder {
  // Create AudioContext for mixing
  const audioContext = new AudioContext({ sampleRate: 48000 });

  // Create sources from both streams
  const localSource = audioContext.createMediaStreamSource(localStream);
  const remoteSource = audioContext.createMediaStreamSource(remoteStream);

  // Create destination for mixed audio
  const destination = audioContext.createMediaStreamDestination();

  // Create separate gain nodes
  const leftGain = audioContext.createGain();
  const rightGain = audioContext.createGain();

  // Create stereo merger
  const merger = audioContext.createChannelMerger(2);

  // Connect: local to left channel, remote to right channel
  localSource.connect(leftGain);
  remoteSource.connect(rightGain);

  leftGain.connect(merger, 0, 0); // Agent to left channel
  rightGain.connect(merger, 0, 1); // Prospect to right channel

  merger.connect(destination);

  // Create recorder with both tracks
  const recorder = new MediaRecorder(destination.stream, {
    mimeType: 'audio/webm;codecs=opus',
    audioBitsPerSecond: 128000,
    ...options,
  });

  console.log('✅ Dual-track recorder created (stereo: left=agent, right=prospect)');

  return recorder;
}
