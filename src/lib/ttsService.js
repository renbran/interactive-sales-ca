// Enhanced Text-to-Speech Service for AI Role-Play
// Provides realistic voice synthesis with persona-specific characteristics
// Voice characteristics for each persona type
const PERSONA_VOICE_SETTINGS = {
    'eager-student': {
        gender: 'female',
        rate: 1.1, // Faster speech (excited)
        pitch: 1.2, // Higher pitch (young, enthusiastic)
        volume: 1.0,
        lang: 'en-US',
        preferredVoices: [
            'Microsoft Zira - English (United States)',
            'Google US English',
            'Samantha',
            'Victoria',
            'Karen'
        ]
    },
    'skeptical-parent': {
        gender: 'male',
        rate: 0.85, // Slower, more deliberate
        pitch: 0.9, // Lower pitch (older, serious)
        volume: 0.95,
        lang: 'en-IN', // Indian English
        preferredVoices: [
            'Microsoft Ravi - English (India)',
            'Google UK English Male',
            'Daniel',
            'Oliver',
            'Rishi'
        ]
    },
    'budget-conscious': {
        gender: 'female',
        rate: 0.95, // Normal pace
        pitch: 1.0, // Normal pitch
        volume: 0.9,
        lang: 'en-IN',
        preferredVoices: [
            'Microsoft Heera - English (India)',
            'Google UK English Female',
            'Veena',
            'Serena',
            'Kate'
        ]
    },
    'indecisive': {
        gender: 'male',
        rate: 0.9, // Slightly slower (uncertain)
        pitch: 1.05, // Slightly higher (younger)
        volume: 0.85, // Quieter (less confident)
        lang: 'en-IN',
        preferredVoices: [
            'Microsoft Ravi - English (India)',
            'Google US English',
            'Tom',
            'Alex',
            'Fred'
        ]
    },
    'experienced-researcher': {
        gender: 'female',
        rate: 0.95, // Measured, professional
        pitch: 0.95, // Slightly lower (mature, professional)
        volume: 1.0,
        lang: 'en-IN',
        preferredVoices: [
            'Microsoft Heera - English (India)',
            'Google UK English Female',
            'Fiona',
            'Moira',
            'Tessa'
        ]
    },
    'competitive-shopper': {
        gender: 'male',
        rate: 1.05, // Faster (assertive)
        pitch: 1.0, // Normal pitch
        volume: 1.0,
        lang: 'en-IN',
        preferredVoices: [
            'Microsoft Ravi - English (India)',
            'Google UK English Male',
            'Daniel',
            'James',
            'Aaron'
        ]
    },
    'career-focused': {
        gender: 'male',
        rate: 1.0, // Business-like pace
        pitch: 0.95, // Professional tone
        volume: 1.0,
        lang: 'en-US',
        preferredVoices: [
            'Microsoft David - English (United States)',
            'Google US English',
            'Alex',
            'Bruce',
            'Fred'
        ]
    },
    'visa-worried': {
        gender: 'female',
        rate: 0.95, // Normal pace
        pitch: 1.1, // Slightly higher (anxious)
        volume: 0.9, // Slightly quieter (nervous)
        lang: 'en-IN',
        preferredVoices: [
            'Microsoft Heera - English (India)',
            'Google UK English Female',
            'Priya',
            'Veena',
            'Serena'
        ]
    }
};
class TextToSpeechService {
    constructor() {
        Object.defineProperty(this, "voices", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "isInitialized", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "isSpeaking", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "currentUtterance", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "onSpeakingStateChange", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    static getInstance() {
        if (!TextToSpeechService.instance) {
            TextToSpeechService.instance = new TextToSpeechService();
        }
        return TextToSpeechService.instance;
    }
    /**
     * Initialize TTS service and load available voices
     */
    async initialize() {
        if (!('speechSynthesis' in window)) {
            throw new Error('Text-to-speech not supported in this browser');
        }
        return new Promise((resolve) => {
            const loadVoices = () => {
                this.voices = window.speechSynthesis.getVoices();
                this.isInitialized = true;
                resolve();
            };
            // Some browsers load voices asynchronously
            if (window.speechSynthesis.getVoices().length > 0) {
                loadVoices();
            }
            else {
                window.speechSynthesis.addEventListener('voiceschanged', loadVoices, { once: true });
                // Fallback timeout
                setTimeout(loadVoices, 1000);
            }
        });
    }
    /**
     * Check if TTS is supported
     */
    isSupported() {
        return 'speechSynthesis' in window;
    }
    /**
     * Get all available voices
     */
    getAvailableVoices() {
        return this.voices;
    }
    /**
     * Find the best matching voice for a persona
     */
    findBestVoice(settings) {
        if (this.voices.length === 0)
            return null;
        // Try to find preferred voices in order
        for (const preferredName of settings.preferredVoices) {
            const voice = this.voices.find(v => v.name.toLowerCase().includes(preferredName.toLowerCase()));
            if (voice)
                return voice;
        }
        // Fallback: find any voice matching gender and language
        const genderMatch = this.voices.find(v => v.lang.startsWith(settings.lang.split('-')[0]) &&
            (settings.gender === 'female'
                ? v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman')
                : v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('man')));
        if (genderMatch)
            return genderMatch;
        // Final fallback: any voice for the language
        const langMatch = this.voices.find(v => v.lang.startsWith(settings.lang.split('-')[0]));
        if (langMatch)
            return langMatch;
        // Last resort: first available voice
        return this.voices[0];
    }
    /**
     * Speak text with persona-specific voice settings
     */
    async speak(text, persona) {
        if (!this.isSupported()) {
            console.warn('TTS not supported');
            return;
        }
        // Stop any current speech
        this.stop();
        // Ensure voices are loaded
        if (!this.isInitialized) {
            await this.initialize();
        }
        const settings = PERSONA_VOICE_SETTINGS[persona.type];
        const voice = this.findBestVoice(settings);
        return new Promise((resolve, reject) => {
            const utterance = new SpeechSynthesisUtterance(text);
            // Apply voice settings
            if (voice) {
                utterance.voice = voice;
            }
            utterance.rate = settings.rate;
            utterance.pitch = settings.pitch;
            utterance.volume = settings.volume;
            utterance.lang = settings.lang;
            // Event handlers
            utterance.onstart = () => {
                this.isSpeaking = true;
                this.currentUtterance = utterance;
                this.onSpeakingStateChange?.(true);
            };
            utterance.onend = () => {
                this.isSpeaking = false;
                this.currentUtterance = null;
                this.onSpeakingStateChange?.(false);
                resolve();
            };
            utterance.onerror = (event) => {
                this.isSpeaking = false;
                this.currentUtterance = null;
                this.onSpeakingStateChange?.(false);
                console.error('TTS error:', event);
                reject(event);
            };
            // Speak
            try {
                window.speechSynthesis.speak(utterance);
            }
            catch (error) {
                console.error('Failed to speak:', error);
                this.isSpeaking = false;
                this.onSpeakingStateChange?.(false);
                reject(error);
            }
        });
    }
    /**
     * Stop current speech
     */
    stop() {
        if (this.isSupported() && this.isSpeaking) {
            window.speechSynthesis.cancel();
            this.isSpeaking = false;
            this.currentUtterance = null;
            this.onSpeakingStateChange?.(false);
        }
    }
    /**
     * Pause current speech
     */
    pause() {
        if (this.isSupported() && this.isSpeaking) {
            window.speechSynthesis.pause();
        }
    }
    /**
     * Resume paused speech
     */
    resume() {
        if (this.isSupported()) {
            window.speechSynthesis.resume();
        }
    }
    /**
     * Check if currently speaking
     */
    getSpeakingState() {
        return this.isSpeaking;
    }
    /**
     * Set callback for speaking state changes
     */
    onStateChange(callback) {
        this.onSpeakingStateChange = callback;
    }
    /**
     * Get voice preview for persona
     */
    async previewVoice(persona) {
        const previewTexts = {
            'eager-student': "Hi! I'm really excited about studying abroad!",
            'skeptical-parent': "I have many questions about the costs and quality.",
            'budget-conscious': "What are the most affordable options available?",
            'indecisive': "I'm not sure if this is the right decision for me.",
            'experienced-researcher': "I need detailed information about the research programs.",
            'competitive-shopper': "What makes your service different from others?",
            'career-focused': "I want to know about the return on investment.",
            'visa-worried': "I'm really concerned about the visa approval process."
        };
        const text = previewTexts[persona.type];
        await this.speak(text, persona);
    }
    /**
     * Test if a specific voice is available
     */
    hasVoice(voiceName) {
        return this.voices.some(v => v.name.toLowerCase().includes(voiceName.toLowerCase()));
    }
    /**
     * Get voice info for debugging
     */
    getVoiceInfo() {
        if (this.voices.length === 0)
            return 'No voices available';
        return this.voices.map(v => `${v.name} (${v.lang}) - ${v.localService ? 'Local' : 'Remote'}`).join('\n');
    }
}
export const ttsService = TextToSpeechService.getInstance();
