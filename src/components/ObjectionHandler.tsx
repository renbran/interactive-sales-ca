import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Lightbulb } from '@phosphor-icons/react';
import { aiService, checkAIHealth } from '@/lib/openaiService';
import { Industry } from '@/lib/types';

interface ObjectionHandlerProps {
  industry: Industry;
  prospectName?: string;
}

export default function ObjectionHandler({ industry, prospectName }: ObjectionHandlerProps) {
  const [objection, setObjection] = useState('');
  const [response, setResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);

  useState(() => {
    // Check if OpenAI API key is available
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    const hasApiKey = apiKey && 
                     apiKey !== 'your_openai_api_key_here' &&
                     apiKey !== 'sk-your-openai-api-key-here';
    
    if (hasApiKey) {
      // Test the API connection
      checkAIHealth().then(setAiEnabled).catch(() => {
        // If health check fails, still enable AI to let users try
        setAiEnabled(true);
      });
    } else {
      // For production deployment, assume AI is available if no key is visible (it might be set via secrets)
      setAiEnabled(true);
    }
  });

  const commonObjections = [
    "I'm busy / No time / In a meeting",
    "Not interested",
    "Remove me from your list",
    "It's too expensive",
    "We need to think about it",
    "We're using existing system/software",
    "We're too small for this",
    "Just send me information first",
    "We tried automation before and it didn't work",
    "Can you give us a discount?",
    "We need to discuss with partner/boss",
    "We're talking to competitors",
    "No budget right now",
  ];

  const handleGenerateResponse = async () => {
    if (!objection.trim()) return;

    setIsGenerating(true);
    try {
      const aiResponse = await aiService.generateObjectionResponse(objection, {
        industry,
        painPoint: 'Manual processes and inefficiencies',
      });
      setResponse(aiResponse);
    } catch (error) {
      console.error('Failed to generate objection response:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('API key') || errorMessage.includes('invalid_request_error')) {
        setResponse('🔧 AI Assistant Setup Required\n\nThe AI objection handler needs to be configured with a valid OpenAI API key. Please contact your administrator to enable AI features.\n\nIn the meantime, here are some general objection handling tips:\n\n• Acknowledge their concern\n• Ask clarifying questions\n• Provide relevant examples\n• Offer a trial or demo\n• Ask for next steps');
      } else if (errorMessage.includes('rate limit')) {
        setResponse('AI service is temporarily busy. Please try again in a moment.');
      } else {
        setResponse('AI features are currently unavailable. Please use your sales training and experience to handle this objection, or try again later when the service is restored.');
      }
    }
    setIsGenerating(false);
  };

  const handleQuickObjection = (quickObjection: string) => {
    setObjection(quickObjection);
  };

  if (!aiEnabled) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-orange-500" />
            AI Objection Handler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">AI Assistant Loading...</p>
            <p className="text-sm mb-2">
              Initializing AI-powered objection handling.
            </p>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-xs text-blue-600">
              If this takes too long, the service may be temporarily unavailable.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-orange-500" />
          AI Objection Handler
          <Badge variant="secondary" className="text-xs">
            Industry: {industry}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="objection" className="font-medium mb-2 block text-sm">
            What objection did you hear?
          </label>
          <Textarea
            id="objection"
            placeholder={`Enter the prospect's objection here...`}
            value={objection}
            onChange={(e) => setObjection(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Quick Select Common Objections:</p>
          <div className="flex flex-wrap gap-2">
            {commonObjections.map((commonObj, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleQuickObjection(commonObj)}
                className="text-xs"
              >
                {commonObj}
              </Button>
            ))}
          </div>
        </div>

        <Button
          onClick={handleGenerateResponse}
          disabled={!objection.trim() || isGenerating}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Generating Response...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              Generate AI Response
            </span>
          )}
        </Button>

        {response && (
          <div className="space-y-2">
            <p className="text-sm font-medium">💡 AI Suggested Response:</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900 whitespace-pre-wrap">{response}</p>
            </div>
            <div className="text-xs text-muted-foreground">
              💡 Tip: Personalize this response with specific details about {prospectName || 'the prospect'}'s situation.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}