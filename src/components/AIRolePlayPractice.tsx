import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Play,
  Pause,
  Stop,
  Microphone,
  MicrophoneSlash,
  ChatCircleDots,
  Lightning,
  TrendUp,
  CheckCircle,
  WarningCircle,
  SpeakerHigh,
  SpeakerSlash
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import {
  PROSPECT_PERSONAS,
  aiRolePlayService
} from '@/lib/aiRolePlayService';
import { ttsService } from '@/lib/ttsService';
import type {
  ProspectPersona,
  ConversationContext,
  AIMessage,
  CoachingHint,
  PerformanceMetrics
} from '@/lib/types/aiRolePlayTypes';

export default function AIRolePlayPractice() {
  const [selectedPersona, setSelectedPersona] = useState<ProspectPersona | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [context, setContext] = useState<ConversationContext | null>(null);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [coachingHints, setCoachingHints] = useState<CoachingHint[]>([]);
  const [showCoaching, setShowCoaching] = useState(true);
  const [sessionMetrics, setSessionMetrics] = useState<PerformanceMetrics | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showSetup, setShowSetup] = useState(true);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

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
        } catch (error) {
          console.error('Failed to initialize TTS:', error);
        }
      }
    };
    initTTS();
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
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

  const startSession = async (persona: ProspectPersona) => {
    if (!apiKey) {
      toast.error('Please enter your OpenAI API key in the setup tab');
      return;
    }

    aiRolePlayService.setApiKey(apiKey);
    
    const sessionId = `session-${Date.now()}`;
    const initialGreeting = aiRolePlayService.generateInitialGreeting(persona);

    const initialMessage: AIMessage = {
      id: `msg-${Date.now()}`,
      role: 'agent',
      content: initialGreeting,
      timestamp: Date.now(),
      sentiment: 'neutral'
    };

    const newContext: ConversationContext = {
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
      } catch (error) {
        console.error('TTS error:', error);
      }
    }

    toast.success('Practice session started!');
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || !context || isProcessing) return;

    setIsProcessing(true);

    // Add salesperson message
    const salespersonMessage: AIMessage = {
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
      const aiResponse = await aiRolePlayService.generateProspectResponse(
        updatedContext,
        currentMessage
      );

      // Add AI response to messages
      const aiMessage: AIMessage = {
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
        setCoachingHints(prev => [...prev, ...aiResponse.coachingHints!].slice(-5));
      }

      // Speak the AI response with persona-specific voice
      if (ttsEnabled && ttsService.isSupported() && selectedPersona) {
        try {
          await ttsService.speak(aiResponse.content, selectedPersona);
        } catch (error) {
          console.error('TTS error:', error);
        }
      }

      // Check if conversation should end
      if (aiResponse.shouldEndConversation) {
        setTimeout(() => endSession(), 2000);
      }
    } catch (error) {
      console.error('Failed to generate response:', error);
      toast.error('Failed to get AI response. Check your API key.');
    } finally {
      setIsProcessing(false);
    }
  };

  const endSession = () => {
    if (!context) return;

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
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-orange-500';
      case 'expert': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (showSetup) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-6">
        <div className="max-w-2xl mx-auto space-y-6 pt-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <ChatCircleDots className="h-8 w-8 text-white" weight="fill" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AI Role-Play Practice
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-md mx-auto">
              Master your sales skills with realistic AI-powered prospect conversations
            </p>
          </div>

          <Card className="shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">Quick Setup</CardTitle>
              <CardDescription className="text-sm">
                Enter your OpenAI API key to start practicing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-proj-..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                />
                <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1">
                  <span className="text-green-600">🔒</span>
                  <span>Your API key is stored locally in your browser and only sent to OpenAI</span>
                </p>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-100">
                <div className="flex items-center gap-3">
                  {ttsEnabled ? (
                    <SpeakerHigh className="h-6 w-6 text-blue-600" weight="fill" />
                  ) : (
                    <SpeakerSlash className="h-6 w-6 text-gray-400" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Realistic Voice</p>
                    <p className="text-xs text-gray-600">
                      Hear AI speak with unique persona voices
                    </p>
                  </div>
                </div>
                <Switch
                  checked={ttsEnabled}
                  onCheckedChange={setTtsEnabled}
                />
              </div>

              <Button 
                onClick={() => setShowSetup(false)} 
                disabled={!apiKey}
                className="w-full h-12 text-base font-semibold bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
              >
                Continue to Persona Selection →
              </Button>
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              💡 Tip: Choose different personas to practice handling various customer types
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isSessionActive && !sessionMetrics) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Select a Prospect Persona</h1>
              <p className="text-sm md:text-base text-muted-foreground mt-1">
                Choose a persona to practice your sales conversation
              </p>
            </div>
            <Button variant="outline" onClick={() => setShowSetup(true)} className="shrink-0">
              API Settings
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {Object.values(PROSPECT_PERSONAS).map((persona) => (
              <Card 
                key={persona.id}
                className="cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-200 bg-white"
                onClick={() => startSession(persona)}
              >
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{persona.name}</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {persona.age} years old
                      </CardDescription>
                    </div>
                    <Badge className={getDifficultyColor(persona.difficulty)}>
                      {persona.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm">{persona.background}</p>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium mb-1">Goals:</p>
                      <div className="flex flex-wrap gap-1">
                        {persona.goals.slice(0, 2).map((goal, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {goal}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-medium mb-1">Main Concerns:</p>
                      <div className="flex flex-wrap gap-1">
                        {persona.concerns.slice(0, 2).map((concern, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {concern}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-medium">Budget: {persona.budget}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-xs italic text-muted-foreground">
                      "{persona.responseStyle}"
                    </p>
                  </div>

                  {ttsEnabled && ttsService.isSupported() && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        ttsService.previewVoice(persona);
                        toast.success('Playing voice preview');
                      }}
                    >
                      <SpeakerHigh className="h-4 w-4 mr-2" />
                      Preview Voice
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (sessionMetrics) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="shadow-xl">
            <CardHeader className="text-center space-y-2 pb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mx-auto mb-2">
                <CheckCircle className="h-10 w-10 text-white" weight="fill" />
              </div>
              <CardTitle className="text-2xl md:text-3xl font-bold">Session Complete! 🎉</CardTitle>
              <CardDescription className="text-base">
                Practice session with <span className="font-semibold text-gray-700">{selectedPersona?.name}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Overall Score */}
              <div className="text-center p-8 bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-100 shadow-md">
                <p className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Overall Performance</p>
                <p className={`text-6xl md:text-7xl font-bold ${getScoreColor(sessionMetrics.overallScore)} mb-2`}>
                  {Math.round(sessionMetrics.overallScore)}%
                </p>
                <p className="text-sm text-gray-600">
                  {sessionMetrics.overallScore >= 80 ? '🌟 Excellent!' : 
                   sessionMetrics.overallScore >= 60 ? '👍 Good job!' : 
                   '💪 Keep practicing!'}
                </p>
              </div>

            {/* Detailed Scores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="p-4 bg-white rounded-xl border-2 border-gray-100 shadow-sm">
                <p className="text-sm font-semibold mb-3 text-gray-700">📝 Script Adherence</p>
                <Progress value={sessionMetrics.scriptAdherence} className="h-3 mb-2" />
                <p className="text-lg font-bold text-gray-900">
                  {Math.round(sessionMetrics.scriptAdherence)}%
                </p>
              </div>
              <div className="p-4 bg-white rounded-xl border-2 border-gray-100 shadow-sm">
                <p className="text-sm font-semibold mb-3 text-gray-700">🛡️ Objection Handling</p>
                <Progress value={sessionMetrics.objectionHandling} className="h-3 mb-2" />
                <p className="text-lg font-bold text-gray-900">
                  {Math.round(sessionMetrics.objectionHandling)}%
                </p>
              </div>
              <div className="p-4 bg-white rounded-xl border-2 border-gray-100 shadow-sm">
                <p className="text-sm font-semibold mb-3 text-gray-700">🤝 Rapport Building</p>
                <Progress value={sessionMetrics.rapport} className="h-3 mb-2" />
                <p className="text-lg font-bold text-gray-900">
                  {Math.round(sessionMetrics.rapport)}%
                </p>
              </div>
              <div className="p-4 bg-white rounded-xl border-2 border-gray-100 shadow-sm">
                <p className="text-sm font-semibold mb-3 text-gray-700">🎯 Closing</p>
                <Progress value={sessionMetrics.closing} className="h-3 mb-2" />
                <p className="text-lg font-bold text-gray-900">
                  {Math.round(sessionMetrics.closing)}%
                </p>
              </div>
            </div>

            {/* Strengths and Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="p-5 bg-green-50 rounded-xl border-2 border-green-200 shadow-sm">
                <p className="font-bold flex items-center gap-2 mb-3 text-green-900">
                  <CheckCircle className="text-green-600 h-5 w-5" weight="fill" />
                  Your Strengths
                </p>
                <ul className="text-sm space-y-2">
                  {sessionMetrics.strengths.map((strength, idx) => (
                    <li key={idx} className="text-green-800 flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                  {sessionMetrics.strengths.length === 0 && (
                    <li className="text-green-700 italic">Keep practicing to build strengths!</li>
                  )}
                </ul>
              </div>
              <div className="p-5 bg-orange-50 rounded-xl border-2 border-orange-200 shadow-sm">
                <p className="font-bold flex items-center gap-2 mb-3 text-orange-900">
                  <TrendUp className="text-orange-600 h-5 w-5" weight="fill" />
                  Growth Areas
                </p>
                <ul className="text-sm space-y-2">
                  {sessionMetrics.improvements.map((improvement, idx) => (
                    <li key={idx} className="text-orange-800 flex items-start gap-2">
                      <span className="text-orange-600 font-bold">→</span>
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommended Training */}
            {sessionMetrics.recommendedTraining.length > 0 && (
              <div className="p-5 bg-blue-50 rounded-xl border-2 border-blue-200 shadow-sm">
                <p className="font-bold mb-3 text-blue-900 flex items-center gap-2">
                  <span className="text-xl">📚</span>
                  Recommended Training
                </p>
                <div className="flex flex-wrap gap-2">
                  {sessionMetrics.recommendedTraining.map((training, idx) => (
                    <Badge key={idx} variant="secondary" className="text-sm py-1 px-3">
                      {training}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                onClick={() => {
                  setSessionMetrics(null);
                  setContext(null);
                  setCoachingHints([]);
                }}
                className="flex-1 h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700"
              >
                Practice Again with Same Persona
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="flex-1 h-12 text-base font-semibold"
              >
                Choose Different Persona
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white shadow-sm p-3 md:p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-base md:text-lg font-bold truncate">
                {selectedPersona?.name}
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground truncate">
                {selectedPersona?.background}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
              {isSpeaking && (
                <Badge variant="secondary" className="animate-pulse hidden sm:flex">
                  <SpeakerHigh className="h-3 w-3 mr-1" weight="fill" />
                  Speaking...
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 md:px-3"
                onClick={() => {
                  setTtsEnabled(!ttsEnabled);
                  if (!ttsEnabled) {
                    toast.success('Voice enabled');
                  } else {
                    ttsService.stop();
                    toast.success('Voice disabled');
                  }
                }}
              >
                {ttsEnabled ? (
                  <SpeakerHigh className="h-4 w-4 md:mr-2" />
                ) : (
                  <SpeakerSlash className="h-4 w-4 md:mr-2" />
                )}
                <span className="hidden md:inline">Voice</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 md:px-3 hidden lg:flex"
                onClick={() => setShowCoaching(!showCoaching)}
              >
                <Lightning className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">{showCoaching ? 'Hide' : 'Show'} Coach</span>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="h-8 px-2 md:px-3"
                onClick={endSession}
              >
                <Stop className="h-4 w-4 md:mr-2" />
                <span className="hidden sm:inline">End</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversation Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
            {context?.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'salesperson' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] md:max-w-[70%] rounded-2xl p-3 md:p-4 shadow-sm ${
                    message.role === 'salesperson'
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : 'bg-white border-2 border-gray-100 rounded-bl-md'
                  }`}
                >
                  {message.role === 'agent' && isSpeaking && 
                   message === context.messages[context.messages.length - 1] && (
                    <div className="flex items-center gap-2 mb-2 text-blue-600">
                      <SpeakerHigh className="h-4 w-4 animate-pulse" weight="fill" />
                      <span className="text-xs font-medium">Speaking...</span>
                    </div>
                  )}
                  <p className="text-sm md:text-base leading-relaxed">{message.content}</p>
                  {message.objectionType && (
                    <Badge variant="destructive" className="mt-2 text-xs">
                      ⚠️ {message.objectionType}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-white border-2 border-gray-100 rounded-2xl rounded-bl-md p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-gray-400 animate-bounce" />
                    <div className="h-2.5 w-2.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0.1s]" />
                    <div className="h-2.5 w-2.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t bg-white shadow-lg p-3 md:p-4">
            <div className="max-w-4xl mx-auto flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleListening}
                className={`shrink-0 h-10 w-10 md:h-11 md:w-11 ${isListening ? 'bg-red-50 border-red-300' : ''}`}
              >
                {isListening ? (
                  <MicrophoneSlash className="h-5 w-5 text-red-600" weight="fill" />
                ) : (
                  <Microphone className="h-5 w-5" />
                )}
              </Button>
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Type your response or use voice..."
                className="flex-1 px-3 md:px-4 py-2 md:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base transition-all"
                disabled={isProcessing}
              />
              <Button
                onClick={sendMessage}
                disabled={!currentMessage.trim() || isProcessing}
                className="shrink-0 h-10 md:h-11 px-4 md:px-6 bg-blue-600 hover:bg-blue-700"
              >
                Send
              </Button>
            </div>
          </div>
        </div>

        {/* Coaching Sidebar - Desktop only */}
        {showCoaching && (
          <div className="hidden lg:block w-80 xl:w-96 border-l bg-white p-4 overflow-y-auto">
            <div className="sticky top-0 bg-white pb-4 border-b mb-4">
              <h3 className="font-bold flex items-center gap-2 text-lg">
                <Lightning className="text-yellow-600 h-5 w-5" weight="fill" />
                Live Coaching
              </h3>
            </div>

            {/* Current Phase */}
            <div className="mb-4 p-4 bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-100">
              <p className="text-xs font-semibold text-blue-900 mb-1 uppercase tracking-wide">Current Phase</p>
              <p className="text-base font-bold capitalize text-blue-700">{context?.conversationPhase?.replace('-', ' ')}</p>
            </div>

            {/* Coaching Hints */}
            <div className="space-y-3 mb-4">
              <p className="text-sm font-semibold text-gray-900">💡 Active Hints</p>
              {coachingHints.length === 0 ? (
                <div className="p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <p className="text-xs text-muted-foreground text-center">
                    No hints yet. Keep the conversation natural and authentic!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {coachingHints.slice(-3).reverse().map((hint) => (
                    <div
                      key={hint.id}
                      className={`p-3 rounded-xl text-xs border-l-4 shadow-sm ${
                        hint.type === 'positive'
                          ? 'bg-green-50 border-green-500 text-green-900'
                          : hint.type === 'warning'
                          ? 'bg-orange-50 border-orange-500 text-orange-900'
                          : 'bg-blue-50 border-blue-500 text-blue-900'
                      }`}
                    >
                      {hint.message}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Objections Tracker */}
            <div className="p-4 border-2 rounded-xl bg-linear-to-br from-gray-50 to-white">
              <p className="text-sm font-semibold mb-3 text-gray-900">📊 Objection Tracker</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-white rounded-lg border">
                  <span className="text-xs font-medium text-gray-600">Raised</span>
                  <Badge variant="secondary" className="font-bold">
                    {context?.objectionsRaised.length || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded-lg border">
                  <span className="text-xs font-medium text-gray-600">Handled</span>
                  <Badge variant={
                    (context?.objectionsHandled.length || 0) >= (context?.objectionsRaised.length || 0)
                      ? "default"
                      : "secondary"
                  } className="font-bold">
                    {context?.objectionsHandled.length || 0}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
