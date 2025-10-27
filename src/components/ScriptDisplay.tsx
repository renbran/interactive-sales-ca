import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowRight, Lightbulb } from '@phosphor-icons/react';
import { ScriptNode, ResponseType, ProspectInfo } from '@/lib/types';
import { getIndustryPain } from '@/lib/scholarixScript';
import { cn } from '@/lib/utils';

interface ScriptDisplayProps {
  currentNode: ScriptNode;
  prospectInfo: ProspectInfo;
  onResponse: (nextNodeId: string) => void;
}

export default function ScriptDisplay({ currentNode, prospectInfo, onResponse }: ScriptDisplayProps) {
  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'opening':
        return 'bg-primary text-primary-foreground';
      case 'discovery':
        return 'bg-accent text-accent-foreground';
      case 'teaching':
        return 'bg-warning text-warning-foreground';
      case 'demo-offer':
        return 'bg-success text-success-foreground';
      case 'objection':
        return 'bg-destructive text-destructive-foreground';
      case 'close':
        return 'bg-success text-success-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getResponseButtonColor = (type: ResponseType) => {
    switch (type) {
      case 'positive':
        return 'bg-success hover:bg-success/90 text-success-foreground';
      case 'negative':
        return 'bg-muted hover:bg-muted/90 text-muted-foreground border';
      case 'objection':
        return 'bg-warning hover:bg-warning/90 text-warning-foreground';
      default:
        return 'bg-secondary hover:bg-secondary/90 text-secondary-foreground';
    }
  };

  const formatScript = (text: string) => {
    return text
      .replace(/\[NAME\]/gi, prospectInfo.name || '[NAME]')
      .replace(/\[COMPANY NAME\]/gi, prospectInfo.company || '[COMPANY]')
      .replace(/\[THEIR INDUSTRY\]/gi, prospectInfo.industry?.replace('-', ' ') || '[INDUSTRY]')
      .replace(/\[THEIR CORE OPERATION\]/gi, getIndustryPain(prospectInfo.industry))
      .replace(/\[YOUR NAME\]/gi, '[YOUR NAME]')
      .replace(/\[COMPANY\]/gi, prospectInfo.company || '[COMPANY]')
      .replace(/\[DAY\]/gi, '[DAY]')
      .replace(/\[DATE\]/gi, '[DATE]')
      .replace(/\[TIME\]/gi, '[TIME]')
      .replace(/\[TIME 1\]/gi, '[TIME 1]')
      .replace(/\[TIME 2\]/gi, '[TIME 2]');
  };

  const scriptText = formatScript(currentNode.text);
  const scriptParagraphs = scriptText.split('\n\n');

  return (
    <Card className="flex flex-col h-full min-h-[500px]">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-2">
          <Badge className={cn(getPhaseColor(currentNode.phase), 'text-sm font-medium px-3 py-1')}>
            {currentNode.phase.toUpperCase().replace('-', ' ')}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {currentNode.type.replace('-', ' ')}
          </Badge>
        </div>
        <h2 className="text-xl font-semibold">
          {prospectInfo.name ? `Calling ${prospectInfo.name}` : 'Follow the Script'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {prospectInfo.company} • {prospectInfo.industry?.replace('-', ' ') || 'Industry'}
        </p>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-4">
          {scriptParagraphs.map((paragraph, idx) => (
            <div key={idx}>
              {paragraph.startsWith('•') || paragraph.startsWith('✅') || paragraph.startsWith('📋') || paragraph.startsWith('🎯') || paragraph.startsWith('💰') || paragraph.startsWith('🎁') ? (
                <div className="pl-4 text-[17px] leading-relaxed whitespace-pre-wrap text-foreground/90">
                  {paragraph}
                </div>
              ) : (
                <p className="text-[18px] leading-relaxed whitespace-pre-wrap text-foreground font-medium">
                  {paragraph}
                </p>
              )}
            </div>
          ))}

          {currentNode.tips && (
            <>
              <Separator className="my-4" />
              <div className="rounded-lg bg-accent/10 border border-accent/20 p-4">
                <div className="flex items-start gap-2">
                  <Lightbulb weight="fill" className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-accent mb-1 text-sm">Pro Tip</div>
                    <div className="text-sm text-foreground/80">{currentNode.tips}</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </ScrollArea>

      {currentNode.responses && currentNode.responses.length > 0 && (
        <div className="p-6 border-t bg-muted/30">
          <div className="text-sm font-medium mb-3 text-muted-foreground">Select prospect's response:</div>
          <div className="grid gap-2">
            {currentNode.responses.map((response, idx) => (
              <Button
                key={idx}
                onClick={() => onResponse(response.nextNodeId)}
                className={cn(
                  'w-full justify-between h-auto py-3 px-4 text-left',
                  getResponseButtonColor(response.type)
                )}
                size="lg"
              >
                <span className="flex-1">{response.label}</span>
                <ArrowRight weight="bold" className="h-5 w-5 ml-2 flex-shrink-0" />
              </Button>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
