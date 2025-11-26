/**
 * Audio Effects Processor
 * Adds realistic phone line effects to voice audio
 * Makes TTS sound like it's coming through a real phone call
 */
export class AudioEffectsProcessor {
    constructor() {
        Object.defineProperty(this, "audioContext", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    /**
     * Apply phone line effects to audio blob
     * Simulates: bandwidth limitation, compression, slight noise
     */
    async applyPhoneLineEffects(audioBlob) {
        try {
            // Decode audio data
            const arrayBuffer = await audioBlob.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            // Create offline context for processing
            const offlineContext = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
            // Source
            const source = offlineContext.createBufferSource();
            source.buffer = audioBuffer;
            // 1. Bandpass filter (300Hz - 3400Hz typical phone range)
            const bandpass = offlineContext.createBiquadFilter();
            bandpass.type = 'bandpass';
            bandpass.frequency.value = 1850; // Center frequency
            bandpass.Q.value = 1.5;
            // 2. High-pass filter to remove rumble
            const highpass = offlineContext.createBiquadFilter();
            highpass.type = 'highpass';
            highpass.frequency.value = 300;
            // 3. Low-pass filter to remove high-end
            const lowpass = offlineContext.createBiquadFilter();
            lowpass.type = 'lowpass';
            lowpass.frequency.value = 3400;
            // 4. Slight compression (dynamic range reduction)
            const compressor = offlineContext.createDynamicsCompressor();
            compressor.threshold.value = -24;
            compressor.knee.value = 30;
            compressor.ratio.value = 12;
            compressor.attack.value = 0.003;
            compressor.release.value = 0.25;
            // 5. Add subtle phone line noise
            const noiseGain = offlineContext.createGain();
            noiseGain.gain.value = 0.008; // Very subtle
            const noiseSource = this.createPhoneNoise(offlineContext);
            // Connect the chain
            source.connect(highpass);
            highpass.connect(bandpass);
            bandpass.connect(lowpass);
            lowpass.connect(compressor);
            compressor.connect(offlineContext.destination);
            // Add noise
            noiseSource.connect(noiseGain);
            noiseGain.connect(offlineContext.destination);
            // Start processing
            source.start(0);
            noiseSource.start(0);
            // Render
            const renderedBuffer = await offlineContext.startRendering();
            // Convert back to blob
            const processedBlob = await this.audioBufferToBlob(renderedBuffer);
            return processedBlob;
        }
        catch (error) {
            console.error('Audio processing error:', error);
            // Return original on error
            return audioBlob;
        }
    }
    /**
     * Create phone line background noise
     */
    createPhoneNoise(context) {
        const bufferSize = context.sampleRate * 2; // 2 seconds
        const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
        const data = buffer.getChannelData(0);
        // Generate white noise with slight low-frequency bias
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.1;
        }
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        return source;
    }
    /**
     * Convert AudioBuffer to WAV Blob
     */
    async audioBufferToBlob(buffer) {
        const numberOfChannels = buffer.numberOfChannels;
        const length = buffer.length * numberOfChannels * 2;
        const arrayBuffer = new ArrayBuffer(44 + length);
        const view = new DataView(arrayBuffer);
        // WAV header
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };
        let offset = 0;
        // RIFF chunk descriptor
        writeString(offset, 'RIFF');
        offset += 4;
        view.setUint32(offset, 36 + length, true);
        offset += 4;
        writeString(offset, 'WAVE');
        offset += 4;
        // fmt sub-chunk
        writeString(offset, 'fmt ');
        offset += 4;
        view.setUint32(offset, 16, true);
        offset += 4; // SubChunk1Size
        view.setUint16(offset, 1, true);
        offset += 2; // AudioFormat (PCM)
        view.setUint16(offset, numberOfChannels, true);
        offset += 2;
        view.setUint32(offset, buffer.sampleRate, true);
        offset += 4;
        view.setUint32(offset, buffer.sampleRate * numberOfChannels * 2, true);
        offset += 4; // ByteRate
        view.setUint16(offset, numberOfChannels * 2, true);
        offset += 2; // BlockAlign
        view.setUint16(offset, 16, true);
        offset += 2; // BitsPerSample
        // data sub-chunk
        writeString(offset, 'data');
        offset += 4;
        view.setUint32(offset, length, true);
        offset += 4;
        // Write audio samples
        const channels = [];
        for (let i = 0; i < numberOfChannels; i++) {
            channels.push(buffer.getChannelData(i));
        }
        for (let i = 0; i < buffer.length; i++) {
            for (let channel = 0; channel < numberOfChannels; channel++) {
                const sample = Math.max(-1, Math.min(1, channels[channel][i]));
                view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
                offset += 2;
            }
        }
        return new Blob([arrayBuffer], { type: 'audio/wav' });
    }
    /**
     * Add static/crackle effects (for very realistic phone line)
     * Optional - use sparingly
     */
    async addStaticCrackle(audioBlob, intensity = 0.05) {
        // Similar to above but with random pops/crackles
        // Implementation omitted for brevity - can be added if needed
        return audioBlob;
    }
    /**
     * Cleanup resources
     */
    dispose() {
        if (this.audioContext.state !== 'closed') {
            this.audioContext.close();
        }
    }
}
// Singleton instance
let processorInstance = null;
export function getAudioEffectsProcessor() {
    if (!processorInstance) {
        processorInstance = new AudioEffectsProcessor();
    }
    return processorInstance;
}
/**
 * Convenience function to apply phone effects
 */
export async function applyPhoneEffects(audioBlob) {
    const processor = getAudioEffectsProcessor();
    return processor.applyPhoneLineEffects(audioBlob);
}
