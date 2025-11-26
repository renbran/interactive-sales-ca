import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Stop, Microphone, MicrophoneSlash, ChatCircleDots, Lightning, TrendUp, CheckCircle, SpeakerHigh, SpeakerSlash } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { PROSPECT_PERSONAS, aiRolePlayService } from '@/lib/aiRolePlayService';
import { ttsService } from '@/lib/ttsService';
import ProspectSpeakingIndicator from '@/components/ProspectSpeakingIndicator';
export default function AIRolePlayPractice() {
    const [selectedPersona, setSelectedPersona] = useState(null);
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [context, setContext] = useState(null);
    const [currentMessage, setCurrentMessage] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [coachingHints, setCoachingHints] = useState([]);
    const [showCoaching, setShowCoaching] = useState(true);
    const [sessionMetrics, setSessionMetrics] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [isTyping, setIsTyping] = useState(false); // NEW: Typing indicator state
    // AI Provider Configuration
    const [aiProvider, setAiProvider] = useState('ollama');
    const [apiKey, setApiKey] = useState('');
    const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
    const [ollamaModel, setOllamaModel] = useState('llama3.1:8b');
    const [showSetup, setShowSetup] = useState(true);
    const [ttsEnabled, setTtsEnabled] = useState(true);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [context?.messages]);
    // Initialize TTS service
    useEffect(() => {
        const initTTS = async () => {
            if (ttsService.isSupported()) {
                try {
                    await ttsService.initialize();
                    // Set up speaking state listener
                    ttsService.onStateChange((speaking) => {
                        setIsSpeaking(speaking);
                    });
                }
                catch (error) {
                    console.error('Failed to initialize TTS:', error);
                }
            }
        };
        initTTS();
    }, []);
    // Initialize AI typing state callback
    useEffect(() => {
        aiRolePlayService.setTypingStateCallback((typing) => {
            setIsTyping(typing);
        });
    }, []);
    // Initialize speech recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setCurrentMessage(transcript);
                setIsListening(false);
            };
            recognitionRef.current.onerror = () => {
                setIsListening(false);
                toast.error('Speech recognition error');
            };
            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, []);
    const startSession = async (persona) => {
        // Validate configuration based on provider
        if (aiProvider === 'openai' && !apiKey) {
            toast.error('Please enter your OpenAI API key');
            return;
        }
        if (aiProvider === 'ollama' && !ollamaUrl) {
            toast.error('Please enter your Ollama URL');
            return;
        }
        // Configure AI service
        aiRolePlayService.setConfig({
            provider: aiProvider,
            apiKey: apiKey || undefined,
            ollamaUrl: ollamaUrl || undefined,
            model: aiProvider === 'ollama' ? ollamaModel : 'gpt-4'
        });
        const sessionId = `session-${Date.now()}`;
        const initialGreeting = aiRolePlayService.generateInitialGreeting(persona);
        const initialMessage = {
            id: `msg-${Date.now()}`,
            role: 'agent',
            content: initialGreeting,
            timestamp: Date.now(),
            sentiment: 'neutral'
        };
        const newContext = {
            sessionId,
            persona,
            messages: [initialMessage],
            currentScriptSection: 'opening',
            objectionsRaised: [],
            objectionsHandled: [],
            conversationPhase: 'opening',
            startTime: Date.now()
        };
        setContext(newContext);
        setSelectedPersona(persona);
        setIsSessionActive(true);
        setShowSetup(false);
        // Speak the greeting with persona-specific voice
        if (ttsEnabled && ttsService.isSupported()) {
            try {
                await ttsService.speak(initialGreeting, persona);
            }
            catch (error) {
                console.error('TTS error:', error);
            }
        }
        toast.success('Practice session started!');
    };
    const sendMessage = async () => {
        if (!currentMessage.trim() || !context || isProcessing)
            return;
        setIsProcessing(true);
        // Add salesperson message
        const salespersonMessage = {
            id: `msg-${Date.now()}`,
            role: 'salesperson',
            content: currentMessage,
            timestamp: Date.now()
        };
        const updatedContext = {
            ...context,
            messages: [...context.messages, salespersonMessage]
        };
        setContext(updatedContext);
        setCurrentMessage('');
        try {
            // Generate AI response
            const aiResponse = await aiRolePlayService.generateProspectResponse(updatedContext, currentMessage);
            // Add AI response to messages
            const aiMessage = {
                id: `msg-${Date.now()}`,
                role: 'agent',
                content: aiResponse.content,
                timestamp: Date.now(),
                sentiment: aiResponse.sentiment,
                objectionType: aiResponse.objectionType
            };
            const finalContext = {
                ...updatedContext,
                messages: [...updatedContext.messages, aiMessage],
                objectionsRaised: aiResponse.objectionType
                    ? [...updatedContext.objectionsRaised, aiResponse.objectionType]
                    : updatedContext.objectionsRaised
            };
            setContext(finalContext);
            // Update coaching hints
            if (aiResponse.coachingHints) {
                setCoachingHints(prev => [...prev, ...aiResponse.coachingHints].slice(-5));
            }
            // Speak the AI response with persona-specific voice
            if (ttsEnabled && ttsService.isSupported() && selectedPersona) {
                try {
                    await ttsService.speak(aiResponse.content, selectedPersona);
                }
                catch (error) {
                    console.error('TTS error:', error);
                }
            }
            // Check if conversation should end
            if (aiResponse.shouldEndConversation) {
                setTimeout(() => endSession(), 2000);
            }
        }
        catch (error) {
            console.error('Failed to generate response:', error);
            toast.error('Failed to get AI response. Check your API key.');
        }
        finally {
            setIsProcessing(false);
        }
    };
    const endSession = () => {
        if (!context)
            return;
        const metrics = aiRolePlayService.calculatePerformanceMetrics(context);
        setSessionMetrics(metrics);
        setIsSessionActive(false);
        toast.success(`Session ended! Overall score: ${Math.round(metrics.overallScore)}%`);
    };
    const toggleListening = () => {
        if (!recognitionRef.current) {
            toast.error('Speech recognition not supported in this browser');
            return;
        }
        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
        else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };
    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'easy': return 'bg-green-500';
            case 'medium': return 'bg-yellow-500';
            case 'hard': return 'bg-orange-500';
            case 'expert': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };
    const getScoreColor = (score) => {
        if (score >= 80)
            return 'text-green-600';
        if (score >= 60)
            return 'text-yellow-600';
        return 'text-red-600';
    };
    if (showSetup) {
        return (_jsx("div", { className: "min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-6", children: _jsxs("div", { className: "max-w-2xl mx-auto space-y-6 pt-8", children: [_jsxs("div", { className: "text-center space-y-3", children: [_jsx("div", { className: "inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4", children: _jsx(ChatCircleDots, { className: "h-8 w-8 text-white", weight: "fill" }) }), _jsx("h1", { className: "text-3xl md:text-4xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent", children: "AI Role-Play Practice" }), _jsx("p", { className: "text-base md:text-lg text-gray-800 font-semibold max-w-md mx-auto", children: "Master your sales skills with realistic AI-powered prospect conversations" })] }), _jsxs(Card, { className: "shadow-lg", children: [_jsxs(CardHeader, { className: "space-y-1", children: [_jsx(CardTitle, { className: "text-xl", children: "Quick Setup" }), _jsx(CardDescription, { className: "text-sm", children: "Choose your AI provider and configure settings" })] }), _jsxs(CardContent, { className: "space-y-5", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold mb-3 text-gray-700", children: "AI Provider" }), _jsxs(Tabs, { value: aiProvider, onValueChange: (v) => setAiProvider(v), children: [_jsxs(TabsList, { className: "grid w-full grid-cols-2", children: [_jsx(TabsTrigger, { value: "ollama", children: "\uD83E\uDD99 Ollama (Local)" }), _jsx(TabsTrigger, { value: "openai", children: "\uD83E\uDD16 OpenAI" })] }), _jsxs(TabsContent, { value: "ollama", className: "space-y-4 mt-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold mb-2 text-gray-700", children: "Ollama API URL" }), _jsx("input", { type: "text", value: ollamaUrl, onChange: (e) => setOllamaUrl(e.target.value), placeholder: "http://localhost:11434 or https://xxxx.ngrok.io", className: "w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm" }), _jsxs("p", { className: "text-xs text-gray-800 font-semibold mt-2 flex items-start gap-1", children: [_jsx("span", { className: "text-blue-600", children: "\uD83D\uDCA1" }), _jsx("span", { children: "Use localhost for local setup or ngrok URL for cloud access" })] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "ollama-model", className: "block text-sm font-semibold mb-2 text-gray-700", children: "Model Name" }), _jsxs("select", { id: "ollama-model", value: ollamaModel, onChange: (e) => setOllamaModel(e.target.value), className: "w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm", children: [_jsx("option", { value: "llama3.1:8b", children: "Llama 3.1 8B (Recommended)" }), _jsx("option", { value: "llama3.1:70b", children: "Llama 3.1 70B (Better quality, slower)" }), _jsx("option", { value: "mistral:7b", children: "Mistral 7B" }), _jsx("option", { value: "phi3:medium", children: "Phi-3 Medium" }), _jsx("option", { value: "gemma2:9b", children: "Gemma 2 9B" })] }), _jsxs("p", { className: "text-xs text-gray-800 font-semibold mt-2 flex items-start gap-1", children: [_jsx("span", { className: "text-green-600", children: "\u2728" }), _jsx("span", { children: "Make sure this model is pulled in your Ollama installation" })] })] })] }), _jsx(TabsContent, { value: "openai", className: "space-y-4 mt-4", children: _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold mb-2 text-gray-700", children: "OpenAI API Key" }), _jsx("input", { type: "password", value: apiKey, onChange: (e) => setApiKey(e.target.value), placeholder: "sk-proj-...", className: "w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm" }), _jsxs("p", { className: "text-xs text-gray-800 font-semibold mt-2 flex items-start gap-1", children: [_jsx("span", { className: "text-green-600", children: "\uD83D\uDD12" }), _jsx("span", { children: "Your API key is stored locally in your browser and only sent to OpenAI" })] })] }) })] })] }), _jsxs("div", { className: "flex items-center justify-between p-4 bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-100", children: [_jsxs("div", { className: "flex items-center gap-3", children: [ttsEnabled ? (_jsx(SpeakerHigh, { className: "h-6 w-6 text-blue-600", weight: "fill" })) : (_jsx(SpeakerSlash, { className: "h-6 w-6 text-gray-400" })), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-gray-900", children: "Realistic Voice" }), _jsx("p", { className: "text-xs text-gray-800 font-semibold", children: "Hear AI speak with unique persona voices" })] })] }), _jsx(Switch, { checked: ttsEnabled, onCheckedChange: setTtsEnabled })] }), _jsx(Button, { onClick: () => setShowSetup(false), disabled: aiProvider === 'openai' ? !apiKey : !ollamaUrl, className: "w-full h-12 text-base font-semibold bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all", children: "Continue to Persona Selection \u2192" }), aiProvider === 'ollama' && (_jsxs("div", { className: "mt-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl", children: [_jsx("p", { className: "text-sm font-semibold text-yellow-900 mb-2", children: "\uD83D\uDE80 Quick Ollama Setup" }), _jsxs("ol", { className: "text-xs text-yellow-800 space-y-1 list-decimal list-inside", children: [_jsxs("li", { children: ["Install Ollama: ", _jsx("code", { className: "bg-yellow-100 px-1 rounded", children: "curl -fsSL https://ollama.ai/install.sh | sh" })] }), _jsxs("li", { children: ["Pull model: ", _jsxs("code", { className: "bg-yellow-100 px-1 rounded", children: ["ollama pull ", ollamaModel] })] }), _jsxs("li", { children: ["For cloud access, run: ", _jsx("code", { className: "bg-yellow-100 px-1 rounded", children: "ngrok http 11434" })] }), _jsx("li", { children: "Copy ngrok URL and paste above" })] })] }))] })] }), _jsx("div", { className: "text-center", children: _jsx("p", { className: "text-xs text-gray-800 font-semibold", children: "\uD83D\uDCA1 Tip: Choose different personas to practice handling various customer types" }) })] }) }));
    }
    if (!isSessionActive && !sessionMetrics) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 p-4 md:p-6", children: _jsxs("div", { className: "max-w-7xl mx-auto space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border-2", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl md:text-3xl font-bold text-gray-900", children: "Select a Prospect Persona" }), _jsx("p", { className: "text-sm md:text-base text-gray-700 mt-1 font-medium", children: "Choose a persona to practice your sales conversation" })] }), _jsx(Button, { variant: "outline", onClick: () => setShowSetup(true), className: "shrink-0", children: "API Settings" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6", children: Object.values(PROSPECT_PERSONAS).map((persona) => (_jsxs(Card, { className: "cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-200 bg-white border-2 hover:border-blue-500", onClick: () => startSession(persona), children: [_jsx(CardHeader, { className: "space-y-3", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: "text-lg font-bold text-gray-900", children: persona.name }), _jsxs(CardDescription, { className: "text-sm mt-1 text-gray-700 font-semibold", children: [persona.age, " years old"] })] }), _jsx(Badge, { className: getDifficultyColor(persona.difficulty) + ' font-bold', children: persona.difficulty })] }) }), _jsxs(CardContent, { className: "space-y-3", children: [_jsx("p", { className: "text-sm text-gray-800 font-medium leading-relaxed", children: persona.background }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-bold mb-1 text-gray-900", children: "Goals:" }), _jsx("div", { className: "flex flex-wrap gap-1", children: persona.goals.slice(0, 2).map((goal, idx) => (_jsx(Badge, { variant: "outline", className: "text-xs font-semibold border-2", children: goal }, idx))) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-bold mb-1 text-gray-900", children: "Main Concerns:" }), _jsx("div", { className: "flex flex-wrap gap-1", children: persona.concerns.slice(0, 2).map((concern, idx) => (_jsx(Badge, { variant: "secondary", className: "text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300", children: concern }, idx))) })] }), _jsx("div", { children: _jsxs("p", { className: "text-xs font-bold text-gray-900", children: ["Budget: ", _jsx("span", { className: "text-green-700", children: persona.budget })] }) })] }), _jsx("div", { className: "pt-2 border-t-2", children: _jsxs("p", { className: "text-xs italic text-gray-700 font-medium", children: ["\"", persona.responseStyle, "\""] }) }), ttsEnabled && ttsService.isSupported() && (_jsxs(Button, { variant: "outline", size: "sm", className: "w-full", onClick: (e) => {
                                                e.stopPropagation();
                                                ttsService.previewVoice(persona);
                                                toast.success('Playing voice preview');
                                            }, children: [_jsx(SpeakerHigh, { className: "h-4 w-4 mr-2" }), "Preview Voice"] }))] })] }, persona.id))) })] }) }));
    }
    if (sessionMetrics) {
        return (_jsx("div", { className: "min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-6", children: _jsx("div", { className: "max-w-4xl mx-auto space-y-6", children: _jsxs(Card, { className: "shadow-xl", children: [_jsxs(CardHeader, { className: "text-center space-y-2 pb-6", children: [_jsx("div", { className: "inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mx-auto mb-2", children: _jsx(CheckCircle, { className: "h-10 w-10 text-white", weight: "fill" }) }), _jsx(CardTitle, { className: "text-2xl md:text-3xl font-bold text-gray-900", children: "Session Complete! \uD83C\uDF89" }), _jsxs(CardDescription, { className: "text-base text-gray-800 font-semibold", children: ["Practice session with ", _jsx("span", { className: "font-bold text-blue-700", children: selectedPersona?.name })] })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "text-center p-8 bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 shadow-md", children: [_jsx("p", { className: "text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide", children: "Overall Performance" }), _jsxs("p", { className: `text-6xl md:text-7xl font-bold ${getScoreColor(sessionMetrics.overallScore)} mb-2`, children: [Math.round(sessionMetrics.overallScore), "%"] }), _jsx("p", { className: "text-base text-gray-800 font-semibold", children: sessionMetrics.overallScore >= 80 ? '🌟 Excellent!' :
                                                sessionMetrics.overallScore >= 60 ? '👍 Good job!' :
                                                    '💪 Keep practicing!' })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6", children: [_jsxs("div", { className: "p-4 bg-white rounded-xl border-2 border-blue-200 shadow-sm", children: [_jsx("p", { className: "text-sm font-bold mb-3 text-gray-900", children: "\uD83D\uDCDD Script Adherence" }), _jsx(Progress, { value: sessionMetrics.scriptAdherence, className: "h-3 mb-2" }), _jsxs("p", { className: "text-lg font-bold text-gray-900", children: [Math.round(sessionMetrics.scriptAdherence), "%"] })] }), _jsxs("div", { className: "p-4 bg-white rounded-xl border-2 border-blue-200 shadow-sm", children: [_jsx("p", { className: "text-sm font-bold mb-3 text-gray-900", children: "\uD83D\uDEE1\uFE0F Objection Handling" }), _jsx(Progress, { value: sessionMetrics.objectionHandling, className: "h-3 mb-2" }), _jsxs("p", { className: "text-lg font-bold text-gray-900", children: [Math.round(sessionMetrics.objectionHandling), "%"] })] }), _jsxs("div", { className: "p-4 bg-white rounded-xl border-2 border-gray-100 shadow-sm", children: [_jsx("p", { className: "text-sm font-semibold mb-3 text-gray-700", children: "\uD83E\uDD1D Rapport Building" }), _jsx(Progress, { value: sessionMetrics.rapport, className: "h-3 mb-2" }), _jsxs("p", { className: "text-lg font-bold text-gray-900", children: [Math.round(sessionMetrics.rapport), "%"] })] }), _jsxs("div", { className: "p-4 bg-white rounded-xl border-2 border-gray-100 shadow-sm", children: [_jsx("p", { className: "text-sm font-semibold mb-3 text-gray-700", children: "\uD83C\uDFAF Closing" }), _jsx(Progress, { value: sessionMetrics.closing, className: "h-3 mb-2" }), _jsxs("p", { className: "text-lg font-bold text-gray-900", children: [Math.round(sessionMetrics.closing), "%"] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6", children: [_jsxs("div", { className: "p-5 bg-green-50 rounded-xl border-2 border-green-200 shadow-sm", children: [_jsxs("p", { className: "font-bold flex items-center gap-2 mb-3 text-green-900", children: [_jsx(CheckCircle, { className: "text-green-600 h-5 w-5", weight: "fill" }), "Your Strengths"] }), _jsxs("ul", { className: "text-sm space-y-2", children: [sessionMetrics.strengths.map((strength, idx) => (_jsxs("li", { className: "text-green-800 flex items-start gap-2", children: [_jsx("span", { className: "text-green-600 font-bold", children: "\u2713" }), _jsx("span", { children: strength })] }, idx))), sessionMetrics.strengths.length === 0 && (_jsx("li", { className: "text-green-700 italic", children: "Keep practicing to build strengths!" }))] })] }), _jsxs("div", { className: "p-5 bg-orange-50 rounded-xl border-2 border-orange-200 shadow-sm", children: [_jsxs("p", { className: "font-bold flex items-center gap-2 mb-3 text-orange-900", children: [_jsx(TrendUp, { className: "text-orange-600 h-5 w-5", weight: "fill" }), "Growth Areas"] }), _jsx("ul", { className: "text-sm space-y-2", children: sessionMetrics.improvements.map((improvement, idx) => (_jsxs("li", { className: "text-orange-800 flex items-start gap-2", children: [_jsx("span", { className: "text-orange-600 font-bold", children: "\u2192" }), _jsx("span", { children: improvement })] }, idx))) })] })] }), sessionMetrics.recommendedTraining.length > 0 && (_jsxs("div", { className: "p-5 bg-blue-50 rounded-xl border-2 border-blue-200 shadow-sm", children: [_jsxs("p", { className: "font-bold mb-3 text-blue-900 flex items-center gap-2", children: [_jsx("span", { className: "text-xl", children: "\uD83D\uDCDA" }), "Recommended Training"] }), _jsx("div", { className: "flex flex-wrap gap-2", children: sessionMetrics.recommendedTraining.map((training, idx) => (_jsx(Badge, { variant: "secondary", className: "text-sm py-1 px-3", children: training }, idx))) })] })), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3 pt-4", children: [_jsx(Button, { onClick: () => {
                                                setSessionMetrics(null);
                                                setContext(null);
                                                setCoachingHints([]);
                                            }, className: "flex-1 h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700", children: "Practice Again with Same Persona" }), _jsx(Button, { variant: "outline", onClick: () => window.location.reload(), className: "flex-1 h-12 text-base font-semibold", children: "Choose Different Persona" })] })] })] }) }) }));
    }
    return (_jsxs("div", { className: "h-screen flex flex-col bg-gray-50", children: [_jsx("div", { className: "border-b-2 border-gray-300 bg-white shadow-sm p-3 md:p-4", children: _jsx("div", { className: "max-w-7xl mx-auto", children: _jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h2", { className: "text-base md:text-lg font-bold truncate text-gray-900", children: selectedPersona?.name }), _jsx("p", { className: "text-xs md:text-sm text-gray-800 font-semibold truncate", children: selectedPersona?.background })] }), _jsxs("div", { className: "flex items-center gap-2 shrink-0 flex-wrap justify-end", children: [isSpeaking && (_jsxs(Badge, { variant: "secondary", className: "animate-pulse hidden sm:flex", children: [_jsx(SpeakerHigh, { className: "h-3 w-3 mr-1", weight: "fill" }), "Speaking..."] })), _jsxs(Button, { variant: "outline", size: "sm", className: "h-8 px-2 md:px-3", onClick: () => {
                                            setTtsEnabled(!ttsEnabled);
                                            if (!ttsEnabled) {
                                                toast.success('Voice enabled');
                                            }
                                            else {
                                                ttsService.stop();
                                                toast.success('Voice disabled');
                                            }
                                        }, children: [ttsEnabled ? (_jsx(SpeakerHigh, { className: "h-4 w-4 md:mr-2" })) : (_jsx(SpeakerSlash, { className: "h-4 w-4 md:mr-2" })), _jsx("span", { className: "hidden md:inline", children: "Voice" })] }), _jsxs(Button, { variant: "outline", size: "sm", className: "h-8 px-2 md:px-3 hidden lg:flex", onClick: () => setShowCoaching(!showCoaching), children: [_jsx(Lightning, { className: "h-4 w-4 md:mr-2" }), _jsxs("span", { className: "hidden md:inline", children: [showCoaching ? 'Hide' : 'Show', " Coach"] })] }), _jsxs(Button, { variant: "destructive", size: "sm", className: "h-8 px-2 md:px-3", onClick: endSession, children: [_jsx(Stop, { className: "h-4 w-4 md:mr-2" }), _jsx("span", { className: "hidden sm:inline", children: "End" })] })] })] }) }) }), _jsxs("div", { className: "flex-1 flex overflow-hidden", children: [_jsxs("div", { className: "flex-1 flex flex-col", children: [_jsxs("div", { className: "flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4", children: [context?.messages.map((message) => (_jsx("div", { className: `flex ${message.role === 'salesperson' ? 'justify-end' : 'justify-start'}`, children: _jsxs("div", { className: `max-w-[85%] sm:max-w-[75%] md:max-w-[70%] rounded-2xl p-3 md:p-4 shadow-md ${message.role === 'salesperson'
                                                ? 'bg-blue-600 text-white rounded-br-md font-semibold'
                                                : 'bg-white border-2 border-gray-300 rounded-bl-md text-gray-900'}`, children: [message.role === 'agent' && isSpeaking &&
                                                    message === context.messages[context.messages.length - 1] && (_jsxs("div", { className: "flex items-center gap-2 mb-2 text-blue-600", children: [_jsx(SpeakerHigh, { className: "h-4 w-4 animate-pulse", weight: "fill" }), _jsx("span", { className: "text-xs font-bold", children: "Speaking..." })] })), _jsx("p", { className: "text-sm md:text-base leading-relaxed font-medium", children: message.content }), message.objectionType && (_jsxs(Badge, { variant: "destructive", className: "mt-2 text-xs font-bold", children: ["\u26A0\uFE0F ", message.objectionType] }))] }) }, message.id))), isTyping && selectedPersona && (_jsx("div", { className: "flex justify-start", children: _jsx("div", { className: "max-w-[85%] sm:max-w-[75%] md:max-w-[70%]", children: _jsx(ProspectSpeakingIndicator, { isThinking: isTyping, persona: selectedPersona }) }) })), _jsx("div", { ref: messagesEndRef })] }), _jsx("div", { className: "border-t bg-white shadow-lg p-3 md:p-4", children: _jsxs("div", { className: "max-w-4xl mx-auto flex gap-2", children: [_jsx(Button, { variant: "outline", size: "icon", onClick: toggleListening, className: `shrink-0 h-10 w-10 md:h-11 md:w-11 ${isListening ? 'bg-red-50 border-red-300' : ''}`, children: isListening ? (_jsx(MicrophoneSlash, { className: "h-5 w-5 text-red-600", weight: "fill" })) : (_jsx(Microphone, { className: "h-5 w-5" })) }), _jsx("input", { type: "text", value: currentMessage, onChange: (e) => setCurrentMessage(e.target.value), onKeyPress: (e) => e.key === 'Enter' && !e.shiftKey && sendMessage(), placeholder: "Type your response or use voice...", className: "flex-1 px-3 md:px-4 py-2 md:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base transition-all", disabled: isProcessing }), _jsx(Button, { onClick: sendMessage, disabled: !currentMessage.trim() || isProcessing, className: "shrink-0 h-10 md:h-11 px-4 md:px-6 bg-blue-600 hover:bg-blue-700", children: "Send" })] }) })] }), showCoaching && (_jsxs("div", { className: "hidden lg:block w-80 xl:w-96 border-l-2 border-gray-300 bg-white p-4 overflow-y-auto", children: [_jsx("div", { className: "sticky top-0 bg-white pb-4 border-b-2 border-gray-300 mb-4", children: _jsxs("h3", { className: "font-bold flex items-center gap-2 text-lg text-gray-900", children: [_jsx(Lightning, { className: "text-yellow-600 h-5 w-5", weight: "fill" }), "Live Coaching"] }) }), _jsxs("div", { className: "mb-4 p-4 bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200", children: [_jsx("p", { className: "text-xs font-bold text-blue-900 mb-1 uppercase tracking-wide", children: "CURRENT PHASE" }), _jsx("p", { className: "text-base font-bold capitalize text-blue-700", children: context?.conversationPhase?.replace('-', ' ') })] }), _jsxs("div", { className: "space-y-3 mb-4", children: [_jsx("p", { className: "text-sm font-bold text-gray-900", children: "\uD83D\uDCA1 Active Hints" }), coachingHints.length === 0 ? (_jsx("div", { className: "p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300", children: _jsx("p", { className: "text-xs text-gray-800 font-semibold text-center", children: "No hints yet. Keep the conversation natural and authentic!" }) })) : (_jsx("div", { className: "space-y-2", children: coachingHints.slice(-3).reverse().map((hint) => (_jsx("div", { className: `p-3 rounded-xl text-xs border-l-4 shadow-sm font-semibold ${hint.type === 'positive'
                                                ? 'bg-green-50 border-green-500 text-green-900'
                                                : hint.type === 'warning'
                                                    ? 'bg-orange-50 border-orange-500 text-orange-900'
                                                    : 'bg-blue-50 border-blue-500 text-blue-900'}`, children: hint.message }, hint.id))) }))] }), _jsxs("div", { className: "p-4 border-2 rounded-xl bg-linear-to-br from-gray-50 to-white border-gray-300", children: [_jsx("p", { className: "text-sm font-bold mb-3 text-gray-900", children: "\uD83D\uDCCA Objection Tracker" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between p-2 bg-white rounded-lg border-2 border-gray-200", children: [_jsx("span", { className: "text-xs font-bold text-gray-900", children: "Raised" }), _jsx(Badge, { variant: "secondary", className: "font-bold bg-cyan-100 text-cyan-900 border border-cyan-300", children: context?.objectionsRaised.length || 0 })] }), _jsxs("div", { className: "flex items-center justify-between p-2 bg-white rounded-lg border-2 border-gray-200", children: [_jsx("span", { className: "text-xs font-bold text-gray-900", children: "Handled" }), _jsx(Badge, { variant: (context?.objectionsHandled.length || 0) >= (context?.objectionsRaised.length || 0)
                                                            ? "default"
                                                            : "secondary", className: "font-bold bg-emerald-100 text-emerald-900 border border-emerald-300", children: context?.objectionsHandled.length || 0 })] })] })] })] }))] })] }));
}
