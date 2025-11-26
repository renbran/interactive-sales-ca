/**
 * Ambient Sound Service
 * Plays subtle background sounds during AI prospect responses
 * Makes the conversation feel more realistic (like they're in an office)
 */
// Map personas to ambient sounds
const PERSONA_AMBIENT_MAP = {
    'eager-student': 'busy-environment', // Busy retail environment
    'skeptical-parent': 'office-professional', // Corporate office
    'budget-conscious': 'quiet-workspace', // Small SME office
    'indecisive': 'office-professional', // Mid-size company
    'experienced-researcher': 'quiet-workspace', // Focused IT environment
    'competitive-shopper': 'office-professional', // Procurement office
    'career-focused': 'executive-office', // CEO office
    'visa-worried': 'busy-environment' // Logistics operations
};
class AmbientSoundService {
    constructor() {
        Object.defineProperty(this, "currentSound", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "audioBufferCache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
    }
    static getInstance() {
        if (!AmbientSoundService.instance) {
            AmbientSoundService.instance = new AmbientSoundService();
        }
        return AmbientSoundService.instance;
    }
    /**
     * Play ambient sound for persona
     */
    async play(persona, duration = 5000) {
        // Stop any currently playing sound
        this.stop();
        const soundType = PERSONA_AMBIENT_MAP[persona.type];
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
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
        }
        catch (error) {
            console.error('Ambient sound error:', error);
            // Fail silently - ambient sounds are optional
        }
    }
    /**
     * Stop ambient sound
     */
    stop() {
        if (this.currentSound && this.currentSound.isPlaying) {
            this.currentSound.sources.forEach(source => {
                try {
                    source.stop();
                }
                catch (e) {
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
    getVolumeForPersona(persona) {
        const { talkative, emotional } = persona.personality;
        let baseVolume = 0.10; // 10% base
        // Adjust based on personality
        if (talkative > 7)
            baseVolume += 0.03;
        if (emotional > 7)
            baseVolume += 0.02;
        // Career-focused and executives have quieter offices
        if (persona.type === 'career-focused' || persona.type === 'experienced-researcher') {
            baseVolume = 0.06;
        }
        return Math.min(baseVolume, 0.15); // Cap at 15%
    }
    /**
     * Generate or retrieve ambient sound buffer
     */
    async getAmbientBuffer(soundType, audioContext) {
        // Check cache first
        if (this.audioBufferCache.has(soundType)) {
            return this.audioBufferCache.get(soundType);
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
    async generateAmbientSound(soundType, audioContext) {
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
    generateOfficeProfessional(data, sampleRate) {
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
    generateBusyEnvironment(data, sampleRate) {
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
    generateExecutiveOffice(data, sampleRate) {
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
    generateQuietWorkspace(data, sampleRate) {
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
    generateCallCenter(data, sampleRate) {
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
    isPlaying() {
        return this.currentSound?.isPlaying || false;
    }
}
export const ambientSoundService = AmbientSoundService.getInstance();
