import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Robot, 
  Brain, 
  TrendUp, 
  Warning, 
  CheckCircle, 
  Clock,
  Lightbulb,
  Target,
  CaretDown,
  CaretRight
} from '@phosphor-icons/react';
import { aiService } from '@/lib/openaiService';
import { LiveCoachingInsight, AdaptiveScriptSuggestion, PerformanceCoaching, LiveCallMetrics } from '@/lib/types';
import { cn } from '@/lib/utils';

interface LiveCoachingAssistantProps {
  prospectInfo: any;
  currentPhase: string;
  callDuration: number;
  onScriptSuggestion?: (suggestion: string) => void;
}

export default function LiveCoachingAssistant({ 
  prospectInfo, 
  currentPhase, 
  callDuration,
  onScriptSuggestion 
}: LiveCoachingAssistantProps) {
  const [prospectResponse, setProspectResponse] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [coachingInsight, setCoachingInsight] = useState<LiveCoachingInsight | null>(null);
  const [adaptiveScript, setAdaptiveScript] = useState<AdaptiveScriptSuggestion | null>(null);
  const [performanceCoaching, setPerformanceCoaching] = useState<PerformanceCoaching | null>(null);
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);
  const [callMetrics, setCallMetrics] = useState<LiveCallMetrics>({
    talkTimeRatio: 0.5,
    questionsAsked: 0,
    objectionCount: 0,
    callDuration: callDuration,
    currentPhase: currentPhase,
    prospectEngagement: 'medium'
  });
  const [expandedSections, setExpandedSections] = useState({
    coaching: true,
    script: false,
    performance: false
  });

  // Update call metrics
  useEffect(() => {
    setCallMetrics(prev => ({
      ...prev,
      callDuration: callDuration,
      currentPhase: currentPhase
    }));
  }, [callDuration, currentPhase]);

  // Analyze prospect response and get live coaching
  const analyzeResponse = useCallback(async () => {
    if (!prospectResponse.trim()) return;

    setIsAnalyzing(true);
    try {
      // Add to conversation history
      const newHistory = [...conversationHistory, `Prospect: ${prospectResponse}`];
      setConversationHistory(newHistory);

      // Get AI coaching insight
      const insight = await aiService.analyzeLiveResponse({
        prospectResponse,
        callPhase: currentPhase,
        scriptContent: 'Current script context',
        prospectInfo,
        conversationHistory: newHistory
      });

      setCoachingInsight(insight);

      // Update call metrics based on response
      const updatedMetrics = {
        ...callMetrics,
        objectionCount: insight.responseType === 'objection' ? callMetrics.objectionCount + 1 : callMetrics.objectionCount,
        prospectEngagement: insight.sentiment === 'enthusiastic' ? 'high' as const : 
                           insight.sentiment === 'interested' ? 'medium' as const : 'low' as const
      };
      setCallMetrics(updatedMetrics);

      // Get adaptive script suggestion
      const scriptSuggestion = await aiService.generateAdaptiveScript({
        currentPhase,
        prospectResponse,
        prospectInfo,
        detectedSignals: insight.detectedSignals
      });
      setAdaptiveScript(scriptSuggestion);

      // Get performance coaching
      const perfCoaching = await aiService.generatePerformanceCoaching(updatedMetrics);
      setPerformanceCoaching(perfCoaching);

      // Clear input after analysis
      setProspectResponse('');

    } catch (error) {
      console.error('Error analyzing response:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [prospectResponse, currentPhase, prospectInfo, conversationHistory, callMetrics]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'enthusiastic': return 'bg-green-100 text-green-800 border-green-200';
      case 'interested': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'skeptical': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resistant': return 'bg-red-100 text-red-800 border-red-200';
      case 'confused': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="space-y-4">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Live AI Coaching
            <Badge variant="outline" className="text-xs">
              {currentPhase.replace('-', ' ').toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              What did the prospect just say?
            </label>
            <Textarea
              placeholder="Enter the prospect's response here for instant AI coaching..."
              value={prospectResponse}
              onChange={(e) => setProspectResponse(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <Button
            onClick={analyzeResponse}
            disabled={!prospectResponse.trim() || isAnalyzing}
            className="w-full"
            size="lg"
          >
            {isAnalyzing ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Analyzing Response...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Robot className="h-4 w-4" />
                Get Live Coaching
              </span>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Coaching Insights */}
      {coachingInsight && (
        <Collapsible open={expandedSections.coaching} onOpenChange={() => toggleSection('coaching')}>
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="hover:bg-muted/50 cursor-pointer">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-600" />
                    Instant Coaching
                    <Badge className={cn('text-xs', getSentimentColor(coachingInsight.sentiment))}>
                      {coachingInsight.sentiment}
                    </Badge>
                  </div>
                  {expandedSections.coaching ? <CaretDown /> : <CaretRight />}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                {/* Main Coaching Tip */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-medium text-blue-900 mb-1">💡 Coaching Tip</div>
                      <p className="text-sm text-blue-800">{coachingInsight.coachingTip}</p>
                    </div>
                  </div>
                </div>

                {/* Next Best Action */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-medium text-green-900 mb-1">🎯 Next Best Action</div>
                      <p className="text-sm text-green-800">{coachingInsight.nextBestAction}</p>
                    </div>
                  </div>
                </div>

                {/* Detected Signals */}
                {coachingInsight.detectedSignals.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">🚨 Detected Signals</h4>
                    <div className="flex flex-wrap gap-2">
                      {coachingInsight.detectedSignals.map((signal, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {signal}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Follow-up */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="text-sm">
                    <span className="font-medium text-yellow-900">💬 Suggested Follow-up: </span>
                    <span className="text-yellow-800">"{coachingInsight.suggestedFollowUp}"</span>
                  </div>
                </div>

                {/* Urgency & Confidence */}
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Warning className={cn("h-3 w-3", getUrgencyColor(coachingInsight.urgencyLevel))} />
                    <span>Urgency: {coachingInsight.urgencyLevel}</span>
                  </div>
                  <div>Confidence: {Math.round(coachingInsight.confidence * 100)}%</div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Adaptive Script Suggestion */}
      {adaptiveScript && (
        <Collapsible open={expandedSections.script} onOpenChange={() => toggleSection('script')}>
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="hover:bg-muted/50 cursor-pointer">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Robot className="h-5 w-5 text-purple-600" />
                    Adaptive Script
                  </div>
                  {expandedSections.script ? <CaretDown /> : <CaretRight />}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                {/* Suggested Script */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="font-medium text-purple-900 mb-2">📝 Suggested Script</div>
                  <p className="text-sm text-purple-800 italic">
                    "{adaptiveScript.suggestedScript.replace(/\[NAME\]/g, prospectInfo.name || '[NAME]').replace(/\[COMPANY\]/g, prospectInfo.company || '[COMPANY]')}"
                  </p>
                </div>

                {/* Reasoning */}
                <div>
                  <h4 className="text-sm font-medium mb-1">🧠 Why This Approach</h4>
                  <p className="text-sm text-muted-foreground">{adaptiveScript.reasoning}</p>
                </div>

                {/* Key Points */}
                <div>
                  <h4 className="text-sm font-medium mb-2">🎯 Key Points to Cover</h4>
                  <ul className="space-y-1">
                    {adaptiveScript.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => onScriptSuggestion?.(adaptiveScript.suggestedScript)}
                  >
                    Use This Script
                  </Button>
                  <Button size="sm" variant="outline">
                    Try Alternative
                  </Button>
                </div>

                {/* Meta Info */}
                <div className="text-xs text-muted-foreground flex justify-between">
                  <span>⏱️ Time: {adaptiveScript.timeToSpend}</span>
                  <span>📊 Success: {adaptiveScript.successMetrics}</span>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Performance Coaching */}
      {performanceCoaching && (
        <Collapsible open={expandedSections.performance} onOpenChange={() => toggleSection('performance')}>
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="hover:bg-muted/50 cursor-pointer">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendUp className="h-5 w-5 text-orange-600" />
                    Performance Coaching
                    <Badge variant="outline" className="text-xs">
                      Score: {performanceCoaching.overallScore.toFixed(1)}/10
                    </Badge>
                  </div>
                  {expandedSections.performance ? <CaretDown /> : <CaretRight />}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                {/* Primary Feedback */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="font-medium text-orange-900 mb-1">🎯 Primary Focus</div>
                  <p className="text-sm text-orange-800">{performanceCoaching.primaryFeedback}</p>
                </div>

                {/* Warning Flag */}
                {performanceCoaching.warningFlag && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-red-800">
                      <Warning className="h-4 w-4" />
                      <span className="font-medium text-sm">{performanceCoaching.warningFlag}</span>
                    </div>
                  </div>
                )}

                {/* Strengths & Improvements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-green-700">✅ Strengths</h4>
                    <ul className="space-y-1">
                      {performanceCoaching.strengths.map((strength, index) => (
                        <li key={index} className="text-sm text-green-600 flex items-start gap-1">
                          <CheckCircle className="h-3 w-3 mt-0.5 shrink-0" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-blue-700">🔧 Improvements</h4>
                    <ul className="space-y-1">
                      {performanceCoaching.specificImprovements.map((improvement, index) => (
                        <li key={index} className="text-sm text-blue-600 flex items-start gap-1">
                          <Target className="h-3 w-3 mt-0.5 shrink-0" />
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Suggested Technique */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                  <div className="text-sm">
                    <span className="font-medium text-indigo-900">💡 Try This: </span>
                    <span className="text-indigo-800">{performanceCoaching.suggestedTechnique}</span>
                  </div>
                </div>

                {/* Call Metrics Summary */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-primary">{Math.round(callMetrics.talkTimeRatio * 100)}%</div>
                    <div className="text-xs text-muted-foreground">Talk Time</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-primary">{callMetrics.questionsAsked}</div>
                    <div className="text-xs text-muted-foreground">Questions</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-primary">{Math.floor(callMetrics.callDuration / 60)}m</div>
                    <div className="text-xs text-muted-foreground">Duration</div>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Conversation History */}
      {conversationHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Conversation History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {conversationHistory.slice(-5).map((entry, index) => (
                <div key={index} className="text-sm p-2 bg-muted/30 rounded">
                  {entry}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}