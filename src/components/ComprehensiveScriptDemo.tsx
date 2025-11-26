/**
 * Comprehensive Script Demo Component
 * 
 * This component demonstrates the new comprehensive sales script with:
 * - Embedded objections that appear contextually
 * - Multiple response options for each objection
 * - Cultural adaptations
 * - Real-time script progression
 * - Success rates and statistics
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  ArrowRight, 
  Lightbulb, 
  Warning, 
  CheckCircle, 
  XCircle,
  User,
  Target,
  Clock,
  TrendUp,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { 
  section1Opening, 
  section2Authority,
  comprehensiveScript,
  getNextSection 
} from '@/lib/comprehensiveScript';
import type { 
  ScriptSection, 
  EmbeddedObjection, 
  ObjectionResponse,
  ClientResponse,
  ScriptTip,
  CultureType 
} from '@/lib/types/enhancedScriptTypes';

interface ComprehensiveScriptDemoProps {
  prospectName?: string;
  prospectCompany?: string;
  culture?: CultureType;
}

export default function ComprehensiveScriptDemo({ 
  prospectName = 'Ahmed Al Maktoum',
  prospectCompany = 'Dubai Trading Solutions',
  culture = 'arab' 
}: ComprehensiveScriptDemoProps) {
  const [currentSection, setCurrentSection] = useState<ScriptSection>(section1Opening);
  const [activeObjection, setActiveObjection] = useState<EmbeddedObjection | null>(null);
  const [selectedResponse, setSelectedResponse] = useState<ObjectionResponse | null>(null);
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);
  const [showCulturalAdaptation, setShowCulturalAdaptation] = useState(false);

  // Format script with prospect info
  const formatScript = (text: string) => {
    return text
      .replace(/\[Full Name\]/gi, prospectName)
      .replace(/\[Name\]/gi, prospectName.split(' ')[0])
      .replace(/\[Company Name\]/gi, prospectCompany)
      .replace(/\[Your Name\]/gi, 'Sarah Johnson')
      .replace(/\[decision-maker\]/gi, 'partner');
  };

  // Handle client response
  const handleClientResponse = (response: ClientResponse) => {
    const historyItem = `CLIENT: "${response.response}"`;
    setConversationHistory([...conversationHistory, historyItem]);

    if (response.type === 'objection' && response.handleWith) {
      // Find and show the objection
      const objection = currentSection.embeddedObjections.find(
        obj => obj.id === response.handleWith
      );
      if (objection) {
        setActiveObjection(objection);
      }
    } else if (response.type === 'positive') {
      // Move to next section
      const nextSection = getNextSection(currentSection.id);
      if (nextSection) {
        setCurrentSection(nextSection);
        setActiveObjection(null);
        setSelectedResponse(null);
      }
    }
  };

  // Handle objection response selection
  const handleObjectionResponse = (response: ObjectionResponse) => {
    setSelectedResponse(response);
    const historyItem = `AGENT: ${response.approach}`;
    setConversationHistory([...conversationHistory, historyItem]);
  };

  // Handle response outcome
  const handleOutcome = (success: boolean) => {
    if (success) {
      // Move to success path
      const nextSection = getNextSection(currentSection.id);
      if (nextSection) {
        setCurrentSection(nextSection);
        setActiveObjection(null);
        setSelectedResponse(null);
      }
    } else {
      // Show alternative response or move to failure path
      setSelectedResponse(null);
    }
    
    const outcome = success ? 'SUCCESS ✅' : 'NEEDS DIFFERENT APPROACH ⚠️';
    setConversationHistory([...conversationHistory, outcome]);
  };

  // Get tip icon
  const getTipIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" weight="fill" />;
      case 'warning':
        return <Warning className="w-5 h-5" weight="fill" />;
      case 'critical':
        return <XCircle className="w-5 h-5" weight="fill" />;
      default:
        return <Lightbulb className="w-5 h-5" weight="fill" />;
    }
  };

  // Get tip color
  const getTipColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-900 dark:bg-green-950 dark:border-green-800 dark:text-green-100';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-100';
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-900 dark:bg-red-950 dark:border-red-800 dark:text-red-100';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-100';
    }
  };

  const culturalVariation = currentSection.culturalVariations?.[culture];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-screen p-3">
      {/* Main Script Display - Left Column */}
      <div className="lg:col-span-2 flex flex-col gap-3 overflow-hidden">
        {/* Section Header - Compact */}
        <Card className="p-3 border-2 bg-white dark:bg-gray-950">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5">
                  SECTION {currentSection.sectionNumber}: {currentSection.sectionName.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                  <Clock className="w-3 h-3 mr-1" />
                  {currentSection.duration}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                <Target className="w-3 h-3" />
                <span>Goal: {currentSection.goal}</span>
              </div>
            </div>
            <Badge 
              variant="secondary" 
              className="cursor-pointer bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600"
              onClick={() => setShowCulturalAdaptation(!showCulturalAdaptation)}
            >
              <User className="w-3 h-3 mr-1" />
              {culture.toUpperCase()}
            </Badge>
          </div>

          {/* Cultural Adaptation */}
          {showCulturalAdaptation && culturalVariation && (
            <Alert className="bg-purple-100 border-purple-400 dark:bg-purple-950 dark:border-purple-600 mt-2">
              <Lightbulb className="w-4 h-4 text-purple-700 dark:text-purple-300" />
              <AlertTitle className="text-sm font-bold text-purple-900 dark:text-purple-100">Cultural Adaptation: {culture.charAt(0).toUpperCase() + culture.slice(1)}</AlertTitle>
              <AlertDescription className="mt-1 space-y-1">
                <p className="text-xs font-medium text-purple-800 dark:text-purple-200">{culturalVariation.tone}</p>
                <div className="text-xs space-y-0.5">
                  <p className="font-semibold text-purple-900 dark:text-purple-100">Key Phrases:</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-purple-800 dark:text-purple-200">
                    {culturalVariation.keyPhrases.slice(0, 3).map((phrase, idx) => (
                      <li key={idx}>{phrase}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </Card>

        {/* Main Script - Maximized */}
        <Card className="flex-1 overflow-hidden bg-white dark:bg-gray-950 border-2">
          <ScrollArea className="h-full p-3">
            <div className="space-y-3">
              {/* Agent Script */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-blue-700 dark:text-blue-300">What You Say:</h3>
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border-l-4 border-blue-600 dark:border-blue-400">
                  <p className="text-sm leading-relaxed whitespace-pre-line text-gray-900 dark:text-gray-100">
                    {formatScript(
                      showCulturalAdaptation && culturalVariation 
                        ? culturalVariation.greeting 
                        : currentSection.mainScript.agent
                    )}
                  </p>
                </div>
                
                {currentSection.mainScript.pauseInstructions && (
                  <Alert className="bg-yellow-100 border-yellow-400 dark:bg-yellow-950 dark:border-yellow-600 py-2">
                    <Warning className="w-4 h-4 text-yellow-700 dark:text-yellow-300" weight="fill" />
                    <AlertDescription className="font-medium text-xs text-yellow-900 dark:text-yellow-100">
                      {currentSection.mainScript.pauseInstructions}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <Separator className="bg-gray-300 dark:bg-gray-600" />

              {/* Expected Client Responses - Compact */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Expected Client Responses:</h3>
                <div className="space-y-1.5">
                  {currentSection.mainScript.expectedClientResponses.map((response, idx) => (
                    <Button
                      key={idx}
                      variant={response.type === 'objection' ? 'destructive' : response.type === 'positive' ? 'default' : 'outline'}
                      className={cn(
                        "w-full justify-between text-left h-auto py-2 text-xs",
                        response.type === 'objection' && "bg-red-600 hover:bg-red-700 text-white",
                        response.type === 'positive' && "bg-green-600 hover:bg-green-700 text-white",
                        response.type === 'neutral' && "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                      )}
                      onClick={() => handleClientResponse(response)}
                    >
                      <span className="flex-1">
                        {response.response}
                        {response.type === 'objection' && (
                          <Badge variant="secondary" className="ml-2 text-xs bg-red-800 text-white">OBJECTION</Badge>
                        )}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900">
                          {response.probability}%
                        </Badge>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Tips Section - Compact */}
              {currentSection.tips.length > 0 && (
                <>
                  <Separator className="bg-gray-300 dark:bg-gray-600" />
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Quick Tips:</h3>
                    <div className="space-y-2">
                      {currentSection.tips.map((tip, idx) => (
                        <Alert key={idx} className={cn(
                          getTipColor(tip.type),
                          "py-2 px-3"
                        )}>
                          <div className="flex items-start gap-2">
                            {getTipIcon(tip.type)}
                            <div className="flex-1">
                              <AlertTitle className="text-xs font-bold mb-0.5">
                                {tip.icon} {tip.title}
                              </AlertTitle>
                              <AlertDescription className="text-xs">
                                {tip.text}
                              </AlertDescription>
                            </div>
                          </div>
                        </Alert>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* Embedded Objections - Right Column */}
      <div className="flex flex-col gap-3 overflow-hidden">
        {/* Objection Visibility Panel - Compact */}
        <Card className="p-3 border-2 border-orange-500 dark:border-orange-600 bg-white dark:bg-gray-950">
          <div className="flex items-center gap-2 mb-2">
            <Warning className="w-4 h-4 text-orange-600 dark:text-orange-400" weight="fill" />
            <h3 className="font-bold text-xs text-gray-900 dark:text-gray-100">EMBEDDED OBJECTIONS ({currentSection.embeddedObjections.length})</h3>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            Always visible - ready for instant response
          </p>
          
          <div className="space-y-1.5">
            {currentSection.embeddedObjections.map((objection) => (
              <Card
                key={objection.id}
                className={cn(
                  "p-2 cursor-pointer transition-all hover:shadow-md",
                  activeObjection?.id === objection.id 
                    ? "border-2 border-orange-600 bg-orange-100 dark:bg-orange-950 dark:border-orange-400" 
                    : "bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 hover:border-orange-400 dark:hover:border-orange-600"
                )}
                onClick={() => setActiveObjection(objection)}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-xs font-medium flex-1 text-gray-900 dark:text-gray-100">{objection.trigger}</p>
                  <Badge 
                    variant={objection.priority === 'high' ? 'destructive' : 'secondary'}
                    className={cn(
                      "text-xs",
                      objection.priority === 'high' ? "bg-red-600 text-white" : "bg-gray-600 text-white dark:bg-gray-400 dark:text-gray-900"
                    )}
                  >
                    {objection.priority}
                  </Badge>
                </div>
                
                {objection.statistics && (
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <TrendUp className="w-3 h-3" />
                      <span>{objection.statistics.conversionRate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{objection.statistics.averageTimeToHandle}</span>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </Card>

        {/* Active Objection Handler */}
        {activeObjection && (
          <Card className="flex-1 overflow-hidden border-2 border-orange-600 dark:border-orange-500 bg-white dark:bg-gray-950">
            <div className="bg-orange-200 dark:bg-orange-950 p-3 border-b border-orange-300 dark:border-orange-700">
              <h3 className="font-bold text-sm mb-1 text-gray-900 dark:text-gray-100">HANDLING OBJECTION</h3>
              <p className="text-xs text-gray-700 dark:text-gray-300">
                Frequency: {activeObjection.statistics?.frequency} | 
                Success: {activeObjection.statistics?.conversionRate}
              </p>
            </div>
            
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                {/* Response Options */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">Choose Your Approach:</h4>
                  {activeObjection.responseOptions.map((response, idx) => (
                    <Card
                      key={idx}
                      className={cn(
                        "p-3 cursor-pointer transition-all",
                        selectedResponse?.approach === response.approach
                          ? "border-2 border-green-500 bg-green-50 dark:bg-green-950"
                          : "hover:border-green-300"
                      )}
                      onClick={() => handleObjectionResponse(response)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="text-sm font-bold flex-1">{response.approach}</h5>
                        <Badge variant="outline" className="text-xs">
                          {response.successRate}% success
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-2">
                        When to use: {response.whenToUse}
                      </p>
                      
                      {selectedResponse?.approach === response.approach && (
                        <div className="mt-3 pt-3 border-t space-y-3">
                          <div className="bg-white dark:bg-gray-900 p-3 rounded border">
                            <p className="text-xs font-medium mb-1">SAY THIS:</p>
                            <p className="text-sm whitespace-pre-line">{formatScript(response.script)}</p>
                          </div>
                          
                          {response.tips && response.tips.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-xs font-semibold text-green-700 dark:text-green-400">
                                ✅ Tips:
                              </p>
                              <ul className="text-xs space-y-0.5 pl-4">
                                {response.tips.map((tip, tipIdx) => (
                                  <li key={tipIdx} className="list-disc">{tip}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {response.warnings && response.warnings.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-xs font-semibold text-red-700 dark:text-red-400">
                                ⚠️ Warnings:
                              </p>
                              <ul className="text-xs space-y-0.5 pl-4">
                                {response.warnings.map((warning, warnIdx) => (
                                  <li key={warnIdx} className="list-disc">{warning}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {/* Outcome Buttons */}
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              variant="default"
                              className="flex-1"
                              onClick={() => handleOutcome(true)}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" weight="fill" />
                              Success
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="flex-1"
                              onClick={() => handleOutcome(false)}
                            >
                              <XCircle className="w-4 h-4 mr-1" weight="fill" />
                              Try Different
                            </Button>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </Card>
        )}

        {/* Conversation History - High Contrast */}
        {conversationHistory.length > 0 && (
          <Card className="p-3 bg-white dark:bg-gray-950 border-2 border-gray-300 dark:border-gray-700">
            <h4 className="text-xs font-bold mb-2 text-gray-900 dark:text-gray-100">Conversation Flow:</h4>
            <ScrollArea className="h-32">
              <div className="space-y-1">
                {conversationHistory.map((item, idx) => (
                  <p key={idx} className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                    {item}
                  </p>
                ))}
              </div>
            </ScrollArea>
          </Card>
        )}
      </div>
    </div>
  );
}
