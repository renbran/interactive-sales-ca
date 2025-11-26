/**
 * Enhanced TTS Service
 * Supports multiple voice providers for realistic prospect voices:
 * 1. Browser TTS (free, basic)
 * 2. ElevenLabs (premium, very realistic)
 * 3. Play.ht (alternative premium option)
 * 4. OpenAI TTS (good quality, reasonable cost)
 */
// Map personas to voices across providers
const PERSONA_VOICE_MAPPINGS = {
    'eager-student': {
        browser: { voiceName: 'Google US English Female', rate: 1.1, pitch: 1.2 },
        elevenlabs: '21m00Tcm4TlvDq8ikWAM', // Rachel - young, energetic
        openai: 'nova', // Enthusiastic female voice
    },
    'skeptical-parent': {
        browser: { voiceName: 'Google UK English Male', rate: 0.85, pitch: 0.9 },
        elevenlabs: 'VR6AewLTigWG4xSOukaG', // Arnold - mature, serious
        openai: 'onyx', // Deep, authoritative male
    },
    'budget-conscious': {
        browser: { voiceName: 'Google US English Female', rate: 0.95, pitch: 1.0 },
        elevenlabs: 'EXAVITQu4vr4xnSDxMaL', // Bella - professional female
        openai: 'alloy', // Neutral, professional
    },
    'indecisive': {
        browser: { voiceName: 'Google US English', rate: 0.9, pitch: 1.05 },
        elevenlabs: 'pNInz6obpgDQGcFmaJgB', // Adam - uncertain, hesitant
        openai: 'echo', // Thoughtful male
    },
    'experienced-researcher': {
        browser: { voiceName: 'Google UK English Female', rate: 0.95, pitch: 0.95 },
        elevenlabs: 'MF3mGyEYCl7XYWbV9V6O', // Elli - intelligent, measured
        openai: 'shimmer', // Professional, articulate female
    },
    'competitive-shopper': {
        browser: { voiceName: 'Google UK English Male', rate: 1.05, pitch: 1.0 },
        elevenlabs: 'TxGEqnHWrfWFTfGW9XjX', // Josh - assertive, confident
        openai: 'fable', // Direct, business-like
    },
    'career-focused': {
        browser: { voiceName: 'Google US English', rate: 1.0, pitch: 0.95 },
        elevenlabs: 'pqHfZKP75CvOlQylNhV4', // Bill - executive, commanding
        openai: 'onyx', // Authoritative, decisive
    },
    'visa-worried': {
        browser: { voiceName: 'Google UK English Female', rate: 0.95, pitch: 1.1 },
        elevenlabs: 'jsCqWAovK2LkecY7zXl4', // Freya - anxious, concerned
        openai: 'nova', // Emotional, worried
    }
};
class EnhancedTTSService {
    constructor() {
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                provider: 'browser'
            }
        });
        Object.defineProperty(this, "audioContext", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "isSpeaking", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "currentAudio", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "onSpeakingStateChange", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    static getInstance() {
        if (!EnhancedTTSService.instance) {
            EnhancedTTSService.instance = new EnhancedTTSService();
        }
        return EnhancedTTSService.instance;
    }
    /**
     * Configure TTS provider and credentials
     */
    configure(config) {
        this.config = { ...this.config, ...config };
    }
    /**
     * Set callback for speaking state changes
     */
    onStateChange(callback) {
        this.onSpeakingStateChange = callback;
    }
    /**
     * Speak text with appropriate voice for persona
     */
    async speak(text, persona) {
        // Stop any current speech
        this.stop();
        this.isSpeaking = true;
        this.onSpeakingStateChange?.(true);
        try {
            switch (this.config.provider) {
                case 'elevenlabs':
                    await this.speakElevenLabs(text, persona);
                    break;
                case 'playht':
                    await this.speakPlayHT(text, persona);
                    break;
                case 'openai':
                    await this.speakOpenAI(text, persona);
                    break;
                case 'browser':
                default:
                    await this.speakBrowser(text, persona);
                    break;
            }
        }
        catch (error) {
            console.error('TTS error:', error);
            // Fallback to browser TTS on error
            if (this.config.provider !== 'browser') {
                console.log('Falling back to browser TTS');
                await this.speakBrowser(text, persona);
            }
        }
        finally {
            this.isSpeaking = false;
            this.onSpeakingStateChange?.(false);
        }
    }
    /**
     * Browser TTS (free, basic)
     */
    async speakBrowser(text, persona) {
        if (!('speechSynthesis' in window)) {
            throw new Error('Browser TTS not supported');
        }
        const voices = window.speechSynthesis.getVoices();
        const voiceConfig = PERSONA_VOICE_MAPPINGS[persona.type].browser;
        return new Promise((resolve, reject) => {
            const utterance = new SpeechSynthesisUtterance(text);
            // Find best matching voice
            const voice = voices.find(v => v.name.includes(voiceConfig.voiceName)) || voices[0];
            if (voice)
                utterance.voice = voice;
            utterance.rate = voiceConfig.rate;
            utterance.pitch = voiceConfig.pitch;
            utterance.onend = () => resolve();
            utterance.onerror = (e) => reject(e);
            window.speechSynthesis.speak(utterance);
        });
    }
    /**
     * ElevenLabs TTS (premium, very realistic)
     * Best quality, most realistic voices
     * Cost: ~$0.30 per 1000 characters
     */
    async speakElevenLabs(text, persona) {
        const apiKey = this.config.elevenLabsApiKey || this.config.apiKey;
        if (!apiKey) {
            throw new Error('ElevenLabs API key not configured');
        }
        const voiceId = PERSONA_VOICE_MAPPINGS[persona.type].elevenlabs;
        if (!voiceId) {
            throw new Error(`No ElevenLabs voice mapped for ${persona.type}`);
        }
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'xi-api-key': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text,
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability: 0.5, // Less robotic
                    similarity_boost: 0.75,
                    style: 0.6, // Conversational style
                    use_speaker_boost: true
                }
            })
        });
        if (!response.ok) {
            throw new Error(`ElevenLabs API error: ${response.statusText}`);
        }
        const audioBlob = await response.blob();
        await this.playAudioBlob(audioBlob);
    }
    /**
     * OpenAI TTS (good quality, reasonable cost)
     * Cost: $0.015 per 1000 characters
     */
    async speakOpenAI(text, persona) {
        const apiKey = this.config.openaiApiKey || this.config.apiKey;
        if (!apiKey) {
            throw new Error('OpenAI API key not configured');
        }
        const voice = PERSONA_VOICE_MAPPINGS[persona.type].openai || 'alloy';
        const response = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'tts-1', // or 'tts-1-hd' for higher quality
                input: text,
                voice: voice,
                speed: 1.0
            })
        });
        if (!response.ok) {
            throw new Error(`OpenAI TTS error: ${response.statusText}`);
        }
        const audioBlob = await response.blob();
        await this.playAudioBlob(audioBlob);
    }
    /**
     * Play.ht TTS (alternative premium)
     */
    async speakPlayHT(text, persona) {
        const apiKey = this.config.playhtApiKey;
        const userId = this.config.playhtUserId;
        if (!apiKey || !userId) {
            throw new Error('Play.ht credentials not configured');
        }
        const voiceId = PERSONA_VOICE_MAPPINGS[persona.type].playht || 'en-US-JennyNeural';
        const response = await fetch('https://play.ht/api/v2/tts', {
            method: 'POST',
            headers: {
                'X-USER-ID': userId,
                'AUTHORIZATION': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text,
                voice: voiceId,
                quality: 'premium',
                output_format: 'mp3',
                speed: 1.0
            })
        });
        if (!response.ok) {
            throw new Error(`Play.ht API error: ${response.statusText}`);
        }
        const audioBlob = await response.blob();
        await this.playAudioBlob(audioBlob);
    }
    /**
     * Play audio blob through HTML5 Audio
     */
    async playAudioBlob(blob) {
        return new Promise((resolve, reject) => {
            const audioUrl = URL.createObjectURL(blob);
            const audio = new Audio(audioUrl);
            this.currentAudio = audio;
            audio.onended = () => {
                URL.revokeObjectURL(audioUrl);
                resolve();
            };
            audio.onerror = (e) => {
                URL.revokeObjectURL(audioUrl);
                reject(e);
            };
            audio.play().catch(reject);
        });
    }
    /**
     * Stop current speech
     */
    stop() {
        // Stop browser TTS
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        // Stop audio playback
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.currentAudio = undefined;
        }
        this.isSpeaking = false;
        this.onSpeakingStateChange?.(false);
    }
    /**
     * Check if currently speaking
     */
    getSpeakingState() {
        return this.isSpeaking;
    }
    /**
     * Get current provider
     */
    getProvider() {
        return this.config.provider;
    }
    /**
     * Check if provider is configured
     */
    isProviderConfigured(provider) {
        switch (provider) {
            case 'browser':
                return 'speechSynthesis' in window;
            case 'elevenlabs':
                return !!(this.config.elevenLabsApiKey || this.config.apiKey);
            case 'openai':
                return !!(this.config.openaiApiKey || this.config.apiKey);
            case 'playht':
                return !!(this.config.playhtApiKey && this.config.playhtUserId);
            default:
                return false;
        }
    }
}
export const enhancedTTSService = EnhancedTTSService.getInstance();
