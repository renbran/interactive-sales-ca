import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from '@phosphor-icons/react';
import { ScriptNode, ResponseType } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ScriptDisplayProps {
  currentNode: ScriptNode;
  prospectName: string;
  onResponse: (nextNodeId: string) => void;
}

export default function ScriptDisplay({ currentNode, prospectName, onResponse }: ScriptDisplayProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'question':
        return 'bg-primary text-primary-foreground';
      case 'objection':
        return 'bg-warning text-warning-foreground';
      case 'close':
        return 'bg-success text-success-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getResponseVariant = (type: ResponseType): 'default' | 'outline' | 'secondary' => {
    switch (type) {
      case 'positive':
        return 'default';
      case 'negative':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const formatScript = (text: string) => {
    return text
      .replace(/\[Name\]/g, prospectName)
      .replace(/\[Company\]/g, '[COMPANY]')
      .replace(/\[Your Name\]/g, '[YOUR NAME]');
  };

  return (
    <Card className="p-8 min-h-[400px] flex flex-col">
      <div className="space-y-6 flex-1">
        <div className="flex items-center gap-2">
          <Badge className={cn(getTypeColor(currentNode.type), 'text-sm')}>
            {currentNode.type.replace('-', ' ').toUpperCase()}
          </Badge>
        </div>

        <div className="text-[22px] leading-relaxed font-normal text-foreground">
          {formatScript(currentNode.text)}
        </div>
      </div>

      {currentNode.responses && currentNode.responses.length > 0 && (
        <div className="mt-8 space-y-4">
          <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Client Response:
          </div>
          <div className="grid gap-3">
            {currentNode.responses.map((response, index) => (
              <Button
                key={index}
                size="lg"
                variant={getResponseVariant(response.type)}
                className={cn(
                  "w-full justify-between text-base h-auto py-4 transition-all hover:scale-[1.02] active:scale-[0.98]",
                  response.type === 'positive' && "bg-primary hover:bg-primary/90",
                  response.type === 'negative' && "border-destructive text-destructive hover:bg-destructive/10"
                )}
                onClick={() => onResponse(response.nextNodeId)}
              >
                <span>{response.label}</span>
                <ArrowRight className="h-5 w-5" />
              </Button>
            ))}
          </div>
        </div>
      )}

      {(!currentNode.responses || currentNode.responses.length === 0) && currentNode.nextNodeId && (
        <div className="mt-8">
          <Button
            size="lg"
            className="w-full bg-primary hover:bg-primary/90"
            onClick={() => onResponse(currentNode.nextNodeId!)}
          >
            Continue
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      )}
    </Card>
  );
}
