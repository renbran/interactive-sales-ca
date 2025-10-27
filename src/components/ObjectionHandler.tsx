import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Lightbulb } from '@phosphor-icons/react';
import { ollamaService, checkOllamaHealth } from '@/lib/ollamaService';
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
    checkOllamaHealth().then(setAiEnabled);
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
      const aiResponse = await ollamaService.generateObjectionResponse(objection, {
        industry,
        painPoint: 'Manual processes and inefficiencies',
      });
      setResponse(aiResponse);
    } catch (error) {
      console.error('Failed to generate objection response:', error);
      setResponse('Sorry, I cannot generate a response right now. Please check your Ollama connection.');
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
            <p className="text-lg font-medium mb-2">AI Assistant Unavailable</p>
            <p className="text-sm">
              Connect to Ollama to get AI-powered objection handling suggestions.
            </p>
            <p className="text-xs mt-2 text-blue-600">
              Make sure Ollama is running at {import.meta.env.VITE_OLLAMA_BASE_URL || 'http://localhost:11434'}
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