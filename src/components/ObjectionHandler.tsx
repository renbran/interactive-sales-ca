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
    const hasApiKey = import.meta.env.VITE_OPENAI_API_KEY && 
                     import.meta.env.VITE_OPENAI_API_KEY !== 'your_openai_api_key_here';
    
    if (hasApiKey) {
      checkAIHealth().then(setAiEnabled);
    } else {
      // For production, assume AI is available and let the API call handle errors
      setAiEnabled(true);
    }
  });

  const commonObjections = [
    "It's too expensive",
    "We need to think about it",
    "We're happy with our current system",
    "We don't have time right now",
    "Need to discuss with my partner/team",
    "Can you send me more information?",
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
      
      if (errorMessage.includes('API key')) {
        setResponse('AI service is temporarily unavailable. Please contact support to configure the OpenAI API key.');
      } else if (errorMessage.includes('rate limit')) {
        setResponse('AI service is temporarily busy. Please try again in a moment.');
      } else {
        setResponse('Sorry, I cannot generate a response right now. The AI service may be temporarily unavailable.');
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