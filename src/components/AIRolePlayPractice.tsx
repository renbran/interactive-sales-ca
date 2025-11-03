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
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">AI Role-Play Practice</h1>
          <p className="text-muted-foreground">
            Practice your sales skills with AI-powered prospects
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Setup</CardTitle>
            <CardDescription>Enter your OpenAI API key to get started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">OpenAI API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2 border rounded-md"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your API key is stored locally and never sent anywhere except OpenAI
              </p>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                {ttsEnabled ? (
                  <SpeakerHigh className="h-5 w-5 text-blue-600" weight="fill" />
                ) : (
                  <SpeakerSlash className="h-5 w-5 text-gray-400" />
                )}
                <div>
                  <p className="text-sm font-medium">Realistic Voice</p>
                  <p className="text-xs text-muted-foreground">
                    AI speaks with persona-specific voice
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
              className="w-full"
            >
              Continue to Persona Selection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isSessionActive && !sessionMetrics) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Select a Prospect Persona</h1>
            <p className="text-muted-foreground">
              Choose a persona to practice your sales conversation
            </p>
          </div>
          <Button variant="outline" onClick={() => setShowSetup(true)}>
            API Settings
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(PROSPECT_PERSONAS).map((persona) => (
            <Card 
              key={persona.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => startSession(persona)}
            >
              <CardHeader>
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
    );
  }

  if (sessionMetrics) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Session Complete! 🎉</CardTitle>
            <CardDescription>
              Practice session with {selectedPersona?.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Score */}
            <div className="text-center p-6 bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Overall Score</p>
              <p className={`text-5xl font-bold ${getScoreColor(sessionMetrics.overallScore)}`}>
                {Math.round(sessionMetrics.overallScore)}%
              </p>
            </div>

            {/* Detailed Scores */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-2">Script Adherence</p>
                <Progress value={sessionMetrics.scriptAdherence} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round(sessionMetrics.scriptAdherence)}%
                </p>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Objection Handling</p>
                <Progress value={sessionMetrics.objectionHandling} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round(sessionMetrics.objectionHandling)}%
                </p>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Rapport Building</p>
                <Progress value={sessionMetrics.rapport} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round(sessionMetrics.rapport)}%
                </p>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Closing</p>
                <Progress value={sessionMetrics.closing} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round(sessionMetrics.closing)}%
                </p>
              </div>
            </div>

            {/* Strengths and Improvements */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="font-medium flex items-center gap-2">
                  <CheckCircle className="text-green-600" weight="fill" />
                  Strengths
                </p>
                <ul className="text-sm space-y-1">
                  {sessionMetrics.strengths.map((strength, idx) => (
                    <li key={idx} className="text-green-700">• {strength}</li>
                  ))}
                  {sessionMetrics.strengths.length === 0 && (
                    <li className="text-muted-foreground italic">Keep practicing!</li>
                  )}
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-medium flex items-center gap-2">
                  <TrendUp className="text-orange-600" weight="fill" />
                  Areas to Improve
                </p>
                <ul className="text-sm space-y-1">
                  {sessionMetrics.improvements.map((improvement, idx) => (
                    <li key={idx} className="text-orange-700">• {improvement}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommended Training */}
            {sessionMetrics.recommendedTraining.length > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="font-medium mb-2">📚 Recommended Training</p>
                <div className="flex flex-wrap gap-2">
                  {sessionMetrics.recommendedTraining.map((training, idx) => (
                    <Badge key={idx} variant="secondary">{training}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button 
                onClick={() => {
                  setSessionMetrics(null);
                  setContext(null);
                  setCoachingHints([]);
                }}
                className="flex-1"
              >
                Practice Again
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-white p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">
              Role-Playing with {selectedPersona?.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              {selectedPersona?.background}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isSpeaking && (
              <Badge variant="secondary" className="animate-pulse">
                <SpeakerHigh className="h-3 w-3 mr-1" weight="fill" />
                AI Speaking...
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
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
                <SpeakerHigh className="h-4 w-4 mr-2" />
              ) : (
                <SpeakerSlash className="h-4 w-4 mr-2" />
              )}
              Voice
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCoaching(!showCoaching)}
            >
              <Lightning className="h-4 w-4 mr-2" />
              {showCoaching ? 'Hide' : 'Show'} Coaching
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={endSession}
            >
              <Stop className="h-4 w-4 mr-2" />
              End Session
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversation Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {context?.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'salesperson' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.role === 'salesperson'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border'
                  }`}
                >
                  {message.role === 'agent' && isSpeaking && 
                   message === context.messages[context.messages.length - 1] && (
                    <div className="flex items-center gap-2 mb-2 text-blue-600">
                      <SpeakerHigh className="h-4 w-4 animate-pulse" weight="fill" />
                      <span className="text-xs font-medium">Speaking...</span>
                    </div>
                  )}
                  <p className="text-sm">{message.content}</p>
                  {message.objectionType && (
                    <Badge variant="destructive" className="mt-2 text-xs">
                      Objection: {message.objectionType}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-white border rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" />
                    <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce delay-100" />
                    <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t bg-white p-4">
            <div className="max-w-4xl mx-auto flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleListening}
                className={isListening ? 'bg-red-50' : ''}
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
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your response..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isProcessing}
              />
              <Button
                onClick={sendMessage}
                disabled={!currentMessage.trim() || isProcessing}
              >
                Send
              </Button>
            </div>
          </div>
        </div>

        {/* Coaching Sidebar */}
        {showCoaching && (
          <div className="w-80 border-l bg-white p-4 overflow-y-auto">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Lightning className="text-yellow-600" weight="fill" />
              Real-Time Coaching
            </h3>

            {/* Current Phase */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs font-medium text-blue-900 mb-1">Current Phase</p>
              <p className="text-sm font-bold capitalize">{context?.conversationPhase}</p>
            </div>

            {/* Coaching Hints */}
            <div className="space-y-2 mb-4">
              <p className="text-sm font-medium">Active Hints</p>
              {coachingHints.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  No hints yet. Keep the conversation going!
                </p>
              ) : (
                coachingHints.slice(-3).map((hint) => (
                  <div
                    key={hint.id}
                    className={`p-2 rounded text-xs border-l-2 ${
                      hint.type === 'positive'
                        ? 'bg-green-50 border-green-500'
                        : hint.type === 'warning'
                        ? 'bg-orange-50 border-orange-500'
                        : 'bg-blue-50 border-blue-500'
                    }`}
                  >
                    {hint.message}
                  </div>
                ))
              )}
            </div>

            {/* Objections Tracker */}
            <div className="p-3 border rounded-lg">
              <p className="text-sm font-medium mb-2">Objections</p>
              <div className="space-y-1 text-xs">
                <p>Raised: {context?.objectionsRaised.length || 0}</p>
                <p>Handled: {context?.objectionsHandled.length || 0}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
