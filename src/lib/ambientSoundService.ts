/**
 * Ambient Sound Service
 * Plays subtle background sounds during AI prospect responses
 * Makes the conversation feel more realistic (like they're in an office)
 */

import type { ProspectPersona, ProspectPersonaType } from './types/aiRolePlayTypes';

export type AmbientSoundType =
  | 'office-professional' // Keyboard clicks, occasional phone
  | 'busy-environment' // Background chatter, movement
  | 'executive-office' // Minimal, occasional sounds
  | 'quiet-workspace' // Very subtle, occasional
  | 'call-center'; // Multiple voices, phones

// Map personas to ambient sounds
const PERSONA_AMBIENT_MAP: Record<ProspectPersonaType, AmbientSoundType> = {
  'eager-student': 'busy-environment', // Busy retail environment
  'skeptical-parent': 'office-professional', // Corporate office
  'budget-conscious': 'quiet-workspace', // Small SME office
  'indecisive': 'office-professional', // Mid-size company
  'experienced-researcher': 'quiet-workspace', // Focused IT environment
  'competitive-shopper': 'office-professional', // Procurement office
  'career-focused': 'executive-office', // CEO office
  'visa-worried': 'busy-environment' // Logistics operations
};

interface AmbientSound {
  audioContext: AudioContext;
  gainNode: GainNode;
  sources: AudioBufferSourceNode[];
  isPlaying: boolean;
}

class AmbientSoundService {
  private static instance: AmbientSoundService;
  private currentSound: AmbientSound | null = null;
  private audioBufferCache: Map<AmbientSoundType, AudioBuffer> = new Map();

  static getInstance(): AmbientSoundService {
    if (!AmbientSoundService.instance) {
      AmbientSoundService.instance = new AmbientSoundService();
    }
    return AmbientSoundService.instance;
  }

  /**
   * Play ambient sound for persona
   */
  async play(persona: ProspectPersona, duration: number = 5000): Promise<void> {
    // Stop any currently playing sound
    this.stop();

    const soundType = PERSONA_AMBIENT_MAP[persona.type];

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const gainNode = audioContext.createGain();
      gainNode.connect(audioContext.destination);

      // Very low volume (8-15%)
      const volume = this.getVolumeForPersona(persona);
      gainNode.gain.value = volume;

      // Generate ambient sound buffer
      const buffer = await this.getAmbientBuffer(soundType, audioContext);

      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(gainNode);
      source.start(0);

      this.currentSound = {
        audioContext,
        gainNode,
        sources: [source],
        isPlaying: true
      };

      // Auto-stop after duration
      setTimeout(() => {
        this.stop();
      }, duration);
    } catch (error) {
      console.error('Ambient sound error:', error);
      // Fail silently - ambient sounds are optional
    }
  }

  /**
   * Stop ambient sound
   */
  stop(): void {
    if (this.currentSound && this.currentSound.isPlaying) {
      this.currentSound.sources.forEach(source => {
        try {
          source.stop();
        } catch (e) {
          // Already stopped
        }
      });

      // Fade out
      const { gainNode, audioContext } = this.currentSound;
      gainNode.gain.setValueAtTime(gainNode.gain.value, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);

      setTimeout(() => {
        if (this.currentSound?.audioContext.state !== 'closed') {
          this.currentSound?.audioContext.close();
        }
      }, 400);

      this.currentSound.isPlaying = false;
      this.currentSound = null;
    }
  }

  /**
   * Get volume level for persona
   * More talkative/emotional personas have busier environments
   */
  private getVolumeForPersona(persona: ProspectPersona): number {
    const { talkative, emotional } = persona.personality;

    let baseVolume = 0.10; // 10% base

    // Adjust based on personality
    if (talkative > 7) baseVolume += 0.03;
    if (emotional > 7) baseVolume += 0.02;

    // Career-focused and executives have quieter offices
    if (persona.type === 'career-focused' || persona.type === 'experienced-researcher') {
      baseVolume = 0.06;
    }

    return Math.min(baseVolume, 0.15); // Cap at 15%
  }

  /**
   * Generate or retrieve ambient sound buffer
   */
  private async getAmbientBuffer(
    soundType: AmbientSoundType,
    audioContext: AudioContext
  ): Promise<AudioBuffer> {
    // Check cache first
    if (this.audioBufferCache.has(soundType)) {
      return this.audioBufferCache.get(soundType)!;
    }

    // Generate procedural ambient sound
    const buffer = await this.generateAmbientSound(soundType, audioContext);
    this.audioBufferCache.set(soundType, buffer);
    return buffer;
  }

  /**
   * Generate procedural ambient sounds
   * Creates realistic office ambiance without audio files
   */
  private async generateAmbientSound(
    soundType: AmbientSoundType,
    audioContext: AudioContext
  ): Promise<AudioBuffer> {
    const duration = 10; // 10 seconds, looped
    const sampleRate = audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    switch (soundType) {
      case 'office-professional':
        this.generateOfficeProfessional(data, sampleRate);
        break;
      case 'busy-environment':
        this.generateBusyEnvironment(data, sampleRate);
        break;
      case 'executive-office':
        this.generateExecutiveOffice(data, sampleRate);
        break;
      case 'quiet-workspace':
        this.generateQuietWorkspace(data, sampleRate);
        break;
      case 'call-center':
        this.generateCallCenter(data, sampleRate);
        break;
    }

    return buffer;
  }

  /**
   * Generate office professional sounds
   * Keyboard typing, occasional phone ring, paper shuffling
   */
  private generateOfficeProfessional(data: Float32Array, sampleRate: number): void {
    // Base white noise (very subtle)
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.05;
    }

    // Add occasional keyboard typing sounds
    for (let t = 0; t < data.length; t += sampleRate * (Math.random() * 3 + 2)) {
      if (Math.random() < 0.4) {
        // Typing burst
        const burstLength = sampleRate * 0.5;
        for (let i = 0; i < burstLength && (t + i) < data.length; i++) {
          if (Math.random() < 0.1) {
            data[t + i] += (Math.random() * 2 - 1) * 0.15;
          }
        }
      }
    }

    // Occasional distant muffled sounds
    for (let t = 0; t < data.length; t += sampleRate * (Math.random() * 5 + 3)) {
      if (Math.random() < 0.3) {
        const soundLength = sampleRate * 0.3;
        for (let i = 0; i < soundLength && (t + i) < data.length; i++) {
          const envelope = Math.sin((i / soundLength) * Math.PI);
          data[t + i] += Math.sin(i * 0.1) * 0.08 * envelope;
        }
      }
    }
  }

  /**
   * Generate busy environment
   * Multiple people, movement, general activity
   */
  private generateBusyEnvironment(data: Float32Array, sampleRate: number): void {
    // More dense white noise
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.08;
    }

    // Frequent activity sounds
    for (let t = 0; t < data.length; t += sampleRate * (Math.random() * 2 + 1)) {
      if (Math.random() < 0.6) {
        const soundLength = sampleRate * 0.4;
        for (let i = 0; i < soundLength && (t + i) < data.length; i++) {
          data[t + i] += (Math.random() * 2 - 1) * 0.12;
        }
      }
    }
  }

  /**
   * Generate executive office
   * Minimal sounds, very quiet, occasional subtle sounds
   */
  private generateExecutiveOffice(data: Float32Array, sampleRate: number): void {
    // Very subtle white noise
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.03;
    }

    // Rare subtle sounds
    for (let t = 0; t < data.length; t += sampleRate * (Math.random() * 8 + 5)) {
      if (Math.random() < 0.2) {
        const soundLength = sampleRate * 0.2;
        for (let i = 0; i < soundLength && (t + i) < data.length; i++) {
          const envelope = Math.sin((i / soundLength) * Math.PI);
          data[t + i] += Math.sin(i * 0.05) * 0.05 * envelope;
        }
      }
    }
  }

  /**
   * Generate quiet workspace
   * Occasional keyboard, very quiet
   */
  private generateQuietWorkspace(data: Float32Array, sampleRate: number): void {
    // Minimal white noise
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.04;
    }

    // Occasional typing
    for (let t = 0; t < data.length; t += sampleRate * (Math.random() * 4 + 3)) {
      if (Math.random() < 0.3) {
        const burstLength = sampleRate * 0.3;
        for (let i = 0; i < burstLength && (t + i) < data.length; i++) {
          if (Math.random() < 0.08) {
            data[t + i] += (Math.random() * 2 - 1) * 0.1;
          }
        }
      }
    }
  }

  /**
   * Generate call center sounds
   * Multiple phone conversations, busy atmosphere
   */
  private generateCallCenter(data: Float32Array, sampleRate: number): void {
    // Dense noise
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.1;
    }

    // Frequent varied sounds
    for (let t = 0; t < data.length; t += sampleRate * (Math.random() * 1.5 + 0.5)) {
      if (Math.random() < 0.7) {
        const soundLength = sampleRate * 0.5;
        for (let i = 0; i < soundLength && (t + i) < data.length; i++) {
          data[t + i] += (Math.random() * 2 - 1) * 0.15;
        }
      }
    }
  }

  /**
   * Check if currently playing
   */
  isPlaying(): boolean {
    return this.currentSound?.isPlaying || false;
  }
}

export const ambientSoundService = AmbientSoundService.getInstance();
