import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, XCircle, Clock, User } from '@phosphor-icons/react';
import { CallRecord } from '@/lib/types';
import { formatDuration } from '@/lib/callUtils';
import { cn } from '@/lib/utils';

interface CallHistoryProps {
  calls: CallRecord[];
}

export default function CallHistory({ calls }: CallHistoryProps) {
  const getOutcomeConfig = (outcome: string) => {
    switch (outcome) {
      case 'demo-booked':
        return {
          label: 'Demo Booked',
          variant: 'default' as const,
          className: 'bg-success hover:bg-success/90',
          icon: CheckCircle
        };
      case 'follow-up':
        return {
          label: 'Follow-up',
          variant: 'secondary' as const,
          className: '',
          icon: Clock
        };
      case 'disqualified':
        return {
          label: 'Disqualified',
          variant: 'destructive' as const,
          className: '',
          icon: XCircle
        };
      default:
        return {
          label: outcome,
          variant: 'outline' as const,
          className: '',
          icon: Clock
        };
    }
  };

  const sortedCalls = [...calls].sort((a, b) => b.startTime - a.startTime);

  if (calls.length === 0) {
    return (
      <Card className="p-12 text-center">
        <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">No Calls Yet</h3>
        <p className="text-muted-foreground">
          Click "New Call" to start your first sales conversation
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-lg mb-4">Call History</h3>
      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-3">
          {sortedCalls.map((call) => {
            const outcome = getOutcomeConfig(call.outcome);
            const OutcomeIcon = outcome.icon;
            
            return (
              <div
                key={call.id}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold">{call.prospectInfo.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {call.prospectInfo.company}
                    </div>
                  </div>
                  <Badge variant={outcome.variant} className={cn('text-xs', outcome.className)}>
                    <OutcomeIcon weight="fill" className="mr-1 h-3 w-3" />
                    {outcome.label}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatDuration(call.duration || 0)}
                  </div>
                  <div>
                    {new Date(call.startTime).toLocaleDateString()} at{' '}
                    {new Date(call.startTime).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>

                {call.qualification.painLevel !== null && (
                  <div className="mt-2 text-sm">
                    <span className="text-muted-foreground">Pain Level:</span>
                    <span className="ml-2 font-semibold text-primary">
                      {call.qualification.painLevel}/10
                    </span>
                  </div>
                )}

                {call.notes && (
                  <div className="mt-2 text-sm text-muted-foreground italic">
                    "{call.notes}"
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
}
