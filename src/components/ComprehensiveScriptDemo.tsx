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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-screen p-4">
      {/* Main Script Display - Left Column */}
      <div className="lg:col-span-2 flex flex-col gap-4 overflow-hidden">
        {/* Section Header */}
        <Card className="p-6 border-2">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1">
                  SECTION {currentSection.sectionNumber}: {currentSection.sectionName.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {currentSection.duration}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Target className="w-4 h-4" />
                <span>Goal: {currentSection.goal}</span>
              </div>
            </div>
            <Badge 
              variant="secondary" 
              className="cursor-pointer"
              onClick={() => setShowCulturalAdaptation(!showCulturalAdaptation)}
            >
              <User className="w-3 h-3 mr-1" />
              {culture.toUpperCase()}
            </Badge>
          </div>

          {/* Cultural Adaptation */}
          {showCulturalAdaptation && culturalVariation && (
            <Alert className="bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800">
              <Lightbulb className="w-4 h-4" />
              <AlertTitle>Cultural Adaptation: {culture.charAt(0).toUpperCase() + culture.slice(1)}</AlertTitle>
              <AlertDescription className="mt-2 space-y-2">
                <p className="text-sm font-medium">{culturalVariation.tone}</p>
                <div className="text-xs space-y-1">
                  <p className="font-semibold">Key Phrases:</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {culturalVariation.keyPhrases.slice(0, 3).map((phrase, idx) => (
                      <li key={idx}>{phrase}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </Card>

        {/* Main Script */}
        <Card className="flex-1 overflow-hidden">
          <ScrollArea className="h-full p-6">
            <div className="space-y-6">
              {/* Agent Script */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-primary">What You Say:</h3>
                <div className="bg-primary/5 p-4 rounded-lg border-l-4 border-primary">
                  <p className="text-[17px] leading-relaxed whitespace-pre-line">
                    {formatScript(
                      showCulturalAdaptation && culturalVariation 
                        ? culturalVariation.greeting 
                        : currentSection.mainScript.agent
                    )}
                  </p>
                </div>
                
                {currentSection.mainScript.pauseInstructions && (
                  <Alert className="bg-yellow-50 border-yellow-300 dark:bg-yellow-950 dark:border-yellow-700">
                    <Warning className="w-4 h-4" weight="fill" />
                    <AlertDescription className="font-medium">
                      {currentSection.mainScript.pauseInstructions}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <Separator />

              {/* Expected Client Responses */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Expected Client Responses:</h3>
                <div className="space-y-2">
                  {currentSection.mainScript.expectedClientResponses.map((response, idx) => (
                    <Button
                      key={idx}
                      variant={response.type === 'objection' ? 'destructive' : response.type === 'positive' ? 'default' : 'outline'}
                      className="w-full justify-between text-left h-auto py-3"
                      onClick={() => handleClientResponse(response)}
                    >
                      <span className="flex-1">
                        {response.response}
                        {response.type === 'objection' && (
                          <Badge variant="secondary" className="ml-2 text-xs">OBJECTION</Badge>
                        )}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {response.probability}%
                        </Badge>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Tips Section */}
              {currentSection.tips.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Quick Tips:</h3>
                    <div className="space-y-3">
                      {currentSection.tips.map((tip, idx) => (
                        <Alert key={idx} className={getTipColor(tip.type)}>
                          <div className="flex items-start gap-2">
                            {getTipIcon(tip.type)}
                            <div className="flex-1">
                              <AlertTitle className="text-sm font-bold mb-1">
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
      <div className="flex flex-col gap-4 overflow-hidden">
        {/* Objection Visibility Panel */}
        <Card className="p-4 border-2 border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-2 mb-3">
            <Warning className="w-5 h-5 text-orange-600" weight="fill" />
            <h3 className="font-bold text-sm">EMBEDDED OBJECTIONS ({currentSection.embeddedObjections.length})</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            These objections are always visible and ready for instant response
          </p>
          
          <div className="space-y-2">
            {currentSection.embeddedObjections.map((objection) => (
              <Card
                key={objection.id}
                className={cn(
                  "p-3 cursor-pointer transition-all hover:shadow-md",
                  activeObjection?.id === objection.id 
                    ? "border-2 border-orange-500 bg-orange-50 dark:bg-orange-950" 
                    : "hover:border-orange-300"
                )}
                onClick={() => setActiveObjection(objection)}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-medium flex-1">{objection.trigger}</p>
                  <Badge 
                    variant={objection.priority === 'high' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {objection.priority}
                  </Badge>
                </div>
                
                {objection.statistics && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <TrendUp className="w-3 h-3" />
                      <span>{objection.statistics.conversionRate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
          <Card className="flex-1 overflow-hidden border-2 border-orange-300 dark:border-orange-700">
            <div className="bg-orange-100 dark:bg-orange-950 p-4 border-b">
              <h3 className="font-bold text-sm mb-1">HANDLING OBJECTION</h3>
              <p className="text-xs text-muted-foreground">
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

        {/* Conversation History */}
        {conversationHistory.length > 0 && (
          <Card className="p-3">
            <h4 className="text-xs font-semibold mb-2">Conversation Flow:</h4>
            <ScrollArea className="h-32">
              <div className="space-y-1">
                {conversationHistory.map((item, idx) => (
                  <p key={idx} className="text-xs text-muted-foreground">
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
