// Audio recording utilities for Scholarix Interactive Sales CA
// Handles local audio recording, storage, and download functionality

import { recordingStorage, StoredRecording } from './recordingStorage';

export interface AudioRecordingData {
  blob: Blob;
  url: string;
  duration: number;
  timestamp: number;
  filename: string;
  fileExtension?: string;
}

export class AudioRecordingManager {
  private static instance: AudioRecordingManager;

  static getInstance(): AudioRecordingManager {
    if (!AudioRecordingManager.instance) {
      AudioRecordingManager.instance = new AudioRecordingManager();
    }
    return AudioRecordingManager.instance;
  }

  /**
   * Download audio recording to user's computer
   */
  downloadRecording(recordingData: AudioRecordingData): void {
    try {
      const link = document.createElement('a');
      link.href = recordingData.url;
      link.download = recordingData.filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`Recording downloaded: ${recordingData.filename}`);
    } catch (error) {
      console.error('Failed to download recording:', error);
      throw new Error('Failed to download recording');
    }
  }

  /**
   * Create a filename for the recording
   */
  generateFilename(prospectName: string, timestamp: number, format: string = 'webm'): string {
    const date = new Date(timestamp);
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
    
    // Clean prospect name for filename
    const cleanName = prospectName
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .toLowerCase();
    
    return `call-${cleanName}-${dateStr}-${timeStr}.${format}`;
  }

  /**
   * Convert audio blob to different formats (if needed)
   */
  async convertAudioFormat(blob: Blob, targetFormat: 'mp3' | 'wav' | 'webm' = 'webm'): Promise<Blob> {
    // For now, return the original blob
    // In the future, you could implement audio conversion using Web Audio API
    // or a library like lamejs for MP3 conversion
    return blob;
  }

  /**
   * Save recording to IndexedDB with full audio data
   */
  async saveRecording(recordingData: AudioRecordingData, callId: string, prospectName: string): Promise<void> {
    try {
      const storedRecording: StoredRecording = {
        id: `recording-${callId}`,
        callId,
        blob: recordingData.blob,
        filename: recordingData.filename,
        duration: recordingData.duration,
        timestamp: recordingData.timestamp,
        prospectName,
        mimeType: recordingData.blob.type,
        size: recordingData.blob.size
      };

      await recordingStorage.saveRecording(storedRecording);

      // Also save metadata to localStorage for backwards compatibility
      this.saveRecordingMetadata(recordingData, callId);
    } catch (error) {
      console.error('Failed to save recording to IndexedDB:', error);
      throw error;
    }
  }

  /**
   * Save recording metadata to local storage (metadata only, not the actual audio)
   */
  private saveRecordingMetadata(recordingData: AudioRecordingData, callId: string): void {
    try {
      const metadata = {
        callId,
        filename: recordingData.filename,
        duration: recordingData.duration,
        timestamp: recordingData.timestamp,
        size: recordingData.blob.size,
        type: recordingData.blob.type
      };

      const existingRecordings = this.getRecordingMetadata();
      existingRecordings[callId] = metadata;

      localStorage.setItem('scholarix-recordings-metadata', JSON.stringify(existingRecordings));
    } catch (error) {
      console.error('Failed to save recording metadata:', error);
    }
  }

  /**
   * Get recording from IndexedDB by call ID
   */
  async getRecording(callId: string): Promise<StoredRecording | null> {
    try {
      return await recordingStorage.getRecordingByCallId(callId);
    } catch (error) {
      console.error('Failed to get recording:', error);
      return null;
    }
  }

  /**
   * Download recording by call ID
   */
  async downloadRecordingByCallId(callId: string): Promise<void> {
    const recording = await this.getRecording(callId);
    if (recording) {
      recordingStorage.downloadRecording(recording);
    } else {
      throw new Error('Recording not found');
    }
  }

  /**
   * Share recording by call ID
   */
  async shareRecordingByCallId(callId: string): Promise<void> {
    const recording = await this.getRecording(callId);
    if (recording) {
      await recordingStorage.shareRecording(recording);
    } else {
      throw new Error('Recording not found');
    }
  }

  /**
   * Get all recording metadata from local storage
   */
  getRecordingMetadata(): Record<string, any> {
    try {
      const stored = localStorage.getItem('scholarix-recordings-metadata');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to get recording metadata:', error);
      return {};
    }
  }

  /**
   * Clean up old recording URLs to prevent memory leaks
   */
  revokeRecordingUrl(url: string): void {
    try {
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to revoke URL:', error);
    }
  }

  /**
   * Check if browser supports audio recording
   */
  isRecordingSupported(): boolean {
    return !!(navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function' && window.MediaRecorder);
  }

  /**
   * Get supported audio formats
   */
  getSupportedFormats(): string[] {
    const formats = ['audio/webm', 'audio/mp4', 'audio/ogg'];
    return formats.filter(format => MediaRecorder.isTypeSupported(format));
  }

  /**
   * Get optimal audio format for recording
   */
  getOptimalFormat(): string {
    const supportedFormats = this.getSupportedFormats();
    
    // Prefer webm for quality and compression
    if (supportedFormats.includes('audio/webm')) return 'audio/webm';
    if (supportedFormats.includes('audio/mp4')) return 'audio/mp4';
    if (supportedFormats.includes('audio/ogg')) return 'audio/ogg';
    
    return supportedFormats[0] || 'audio/webm'; // Fallback
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Create enhanced recording data object
   */
  createRecordingData(blob: Blob, duration: number, prospectName: string): AudioRecordingData {
    const timestamp = Date.now();
    // Get file extension from blob if available
    const fileExt = (blob as any).fileExtension || (window as any).__recordingFileExtension || 'webm';
    const filename = this.generateFilename(prospectName, timestamp, fileExt);
    const url = URL.createObjectURL(blob);

    return {
      blob,
      url,
      duration,
      timestamp,
      filename,
      fileExtension: fileExt
    };
  }

  /**
   * Auto-download recording if user has enabled auto-download
   */
  handleAutoDownload(recordingData: AudioRecordingData): void {
    const autoDownload = localStorage.getItem('scholarix-auto-download-recordings');
    if (autoDownload === 'true') {
      this.downloadRecording(recordingData);
    }
  }

  /**
   * Set auto-download preference
   */
  setAutoDownload(enabled: boolean): void {
    localStorage.setItem('scholarix-auto-download-recordings', enabled ? 'true' : 'false');
  }

  /**
   * Get auto-download preference
   */
  getAutoDownload(): boolean {
    return localStorage.getItem('scholarix-auto-download-recordings') === 'true';
  }
}

// Export singleton instance
export const audioRecordingManager = AudioRecordingManager.getInstance();