// Audio recording utilities for Scholarix Interactive Sales CA
// Handles local audio recording, storage, and download functionality
export class AudioRecordingManager {
    static getInstance() {
        if (!AudioRecordingManager.instance) {
            AudioRecordingManager.instance = new AudioRecordingManager();
        }
        return AudioRecordingManager.instance;
    }
    /**
     * Download audio recording to user's computer
     */
    downloadRecording(recordingData) {
        try {
            const link = document.createElement('a');
            link.href = recordingData.url;
            link.download = recordingData.filename;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            console.log(`Recording downloaded: ${recordingData.filename}`);
        }
        catch (error) {
            console.error('Failed to download recording:', error);
            throw new Error('Failed to download recording');
        }
    }
    /**
     * Create a filename for the recording
     */
    generateFilename(prospectName, timestamp, format = 'webm') {
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
    async convertAudioFormat(blob, targetFormat = 'webm') {
        // For now, return the original blob
        // In the future, you could implement audio conversion using Web Audio API
        // or a library like lamejs for MP3 conversion
        return blob;
    }
    /**
     * Save recording data to local storage (metadata only, not the actual audio)
     */
    saveRecordingMetadata(recordingData, callId) {
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
        }
        catch (error) {
            console.error('Failed to save recording metadata:', error);
        }
    }
    /**
     * Get all recording metadata from local storage
     */
    getRecordingMetadata() {
        try {
            const stored = localStorage.getItem('scholarix-recordings-metadata');
            return stored ? JSON.parse(stored) : {};
        }
        catch (error) {
            console.error('Failed to get recording metadata:', error);
            return {};
        }
    }
    /**
     * Clean up old recording URLs to prevent memory leaks
     */
    revokeRecordingUrl(url) {
        try {
            URL.revokeObjectURL(url);
        }
        catch (error) {
            console.error('Failed to revoke URL:', error);
        }
    }
    /**
     * Check if browser supports audio recording
     */
    isRecordingSupported() {
        return !!(navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function' && window.MediaRecorder);
    }
    /**
     * Get supported audio formats
     */
    getSupportedFormats() {
        const formats = ['audio/webm', 'audio/mp4', 'audio/ogg'];
        return formats.filter(format => MediaRecorder.isTypeSupported(format));
    }
    /**
     * Get optimal audio format for recording
     */
    getOptimalFormat() {
        const supportedFormats = this.getSupportedFormats();
        // Prefer webm for quality and compression
        if (supportedFormats.includes('audio/webm'))
            return 'audio/webm';
        if (supportedFormats.includes('audio/mp4'))
            return 'audio/mp4';
        if (supportedFormats.includes('audio/ogg'))
            return 'audio/ogg';
        return supportedFormats[0] || 'audio/webm'; // Fallback
    }
    /**
     * Format file size for display
     */
    formatFileSize(bytes) {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    /**
     * Create enhanced recording data object
     */
    createRecordingData(blob, duration, prospectName) {
        const timestamp = Date.now();
        const filename = this.generateFilename(prospectName, timestamp);
        const url = URL.createObjectURL(blob);
        return {
            blob,
            url,
            duration,
            timestamp,
            filename
        };
    }
    /**
     * Auto-download recording if user has enabled auto-download
     */
    handleAutoDownload(recordingData) {
        const autoDownload = localStorage.getItem('scholarix-auto-download-recordings');
        if (autoDownload === 'true') {
            this.downloadRecording(recordingData);
        }
    }
    /**
     * Set auto-download preference
     */
    setAutoDownload(enabled) {
        localStorage.setItem('scholarix-auto-download-recordings', enabled ? 'true' : 'false');
    }
    /**
     * Get auto-download preference
     */
    getAutoDownload() {
        return localStorage.getItem('scholarix-auto-download-recordings') === 'true';
    }
    /**
     * Save the full recording (blob + metadata) into IndexedDB and metadata into localStorage
     * This method is a higher-level convenience used by callers that previously expected
     * a `saveRecording` method.
     */
    async saveRecording(recordingData, callId, prospectName) {
        try {
            // Save metadata in localStorage for quick access
            this.saveRecordingMetadata(recordingData, callId);
            // Save blob into IndexedDB for playback/download/share
            const dbOpen = indexedDB.open('scholarix-recordings-db', 1);
            dbOpen.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('recordings')) {
                    db.createObjectStore('recordings', { keyPath: 'callId' });
                }
            };
            await new Promise((resolve, reject) => {
                dbOpen.onsuccess = (ev) => {
                    const db = ev.target.result;
                    const tx = db.transaction('recordings', 'readwrite');
                    const store = tx.objectStore('recordings');
                    const entry = {
                        callId,
                        blob: recordingData.blob,
                        filename: recordingData.filename,
                        duration: recordingData.duration,
                        timestamp: recordingData.timestamp,
                        prospectName: prospectName || ''
                    };
                    const req = store.put(entry);
                    req.onsuccess = () => {
                        tx.oncomplete = () => {
                            db.close();
                            resolve();
                        };
                    };
                    req.onerror = (err) => {
                        console.error('Failed to store recording in IndexedDB', err);
                        db.close();
                        reject(err);
                    };
                };
                dbOpen.onerror = (e) => {
                    console.error('IndexedDB open failed', e);
                    reject(e);
                };
            });
        }
        catch (error) {
            console.error('saveRecording failed:', error);
            throw error;
        }
    }
    /**
     * Retrieve a recording blob + metadata from IndexedDB by callId
     */
    async getRecording(callId) {
        try {
            const dbOpen = indexedDB.open('scholarix-recordings-db', 1);
            const result = await new Promise((resolve, reject) => {
                dbOpen.onsuccess = (ev) => {
                    const db = ev.target.result;
                    const tx = db.transaction('recordings', 'readonly');
                    const store = tx.objectStore('recordings');
                    const req = store.get(callId);
                    req.onsuccess = () => {
                        const entry = req.result;
                        db.close();
                        resolve(entry || null);
                    };
                    req.onerror = (err) => {
                        db.close();
                        reject(err);
                    };
                };
                dbOpen.onerror = (e) => reject(e);
            });
            if (!result)
                return null;
            const blob = result.blob;
            const audioData = {
                blob,
                url: URL.createObjectURL(blob),
                duration: result.duration,
                timestamp: result.timestamp,
                filename: result.filename
            };
            return audioData;
        }
        catch (error) {
            console.error('getRecording failed:', error);
            return null;
        }
    }
    /**
     * Download a recording by its callId (convenience wrapper)
     */
    async downloadRecordingByCallId(callId) {
        const recording = await this.getRecording(callId);
        if (!recording)
            throw new Error('Recording not found');
        this.downloadRecording(recording);
    }
    /**
     * Share a recording using the Web Share API when available
     */
    async shareRecordingByCallId(callId) {
        const recording = await this.getRecording(callId);
        if (!recording)
            throw new Error('Recording not found');
        if (navigator.canShare && navigator.canShare({ files: [] })) {
            const file = new File([recording.blob], recording.filename, { type: recording.blob.type });
            try {
                await navigator.share({ files: [file], title: recording.filename });
            }
            catch (err) {
                console.error('Share failed', err);
                throw err;
            }
        }
        else {
            throw new Error('Web Share API not supported on this device');
        }
    }
}
// Export singleton instance
export const audioRecordingManager = AudioRecordingManager.getInstance();
