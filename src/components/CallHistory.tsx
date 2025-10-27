import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Phone, Clock, User, CheckCircle, XCircle } from '@phosphor-icons/react';
import { CallRecord } from '@/lib/types';
import { formatDuration } from '@/lib/callUtils';
import { cn } from '@/lib/utils';

interface CallHistoryProps {
  calls: CallRecord[];
}

export default function CallHistory({ calls }: CallHistoryProps) {
  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'demo-booked':
        return 'bg-success text-success-foreground';
      case 'follow-up-scheduled':
        return 'bg-warning text-warning-foreground';
      case 'not-interested':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getOutcomeLabel = (outcome: string) => {
    switch (outcome) {
      case 'demo-booked':
        return 'Demo Booked';
      case 'follow-up-scheduled':
        return 'Follow-Up';
      case 'not-interested':
        return 'Not Interested';
      default:
        return outcome;
    }
  };

  if (calls.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <Phone className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Calls Yet</h3>
        <p className="text-muted-foreground mb-6">
          Your call history will appear here after you complete your first call.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Call History ({calls.length})</h2>
      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-4">
          {[...calls].reverse().map((call) => (
            <Card key={call.id} className="p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <User className="h-5 w-5 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <div className="font-semibold text-lg">{call.prospectInfo.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {call.prospectInfo.company} • {call.prospectInfo.industry}
                    </div>
                  </div>
                </div>
                <Badge className={cn('ml-4', getOutcomeColor(call.outcome))}>
                  {getOutcomeLabel(call.outcome)}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDuration(call.duration || 0)}
                </div>
                <div>
                  {new Date(call.startTime).toLocaleString()}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {call.qualification.painPointIdentified && (
                  <Badge variant="outline" className="text-xs">
                    <CheckCircle weight="fill" className="h-3 w-3 mr-1 text-success" />
                    Pain Identified
                  </Badge>
                )}
                {call.qualification.painQuantified && (
                  <Badge variant="outline" className="text-xs">
                    <CheckCircle weight="fill" className="h-3 w-3 mr-1 text-success" />
                    Pain Quantified
                  </Badge>
                )}
                {call.qualification.valueAcknowledged && (
                  <Badge variant="outline" className="text-xs">
                    <CheckCircle weight="fill" className="h-3 w-3 mr-1 text-success" />
                    Value Acknowledged
                  </Badge>
                )}
                {call.qualification.demoBooked && (
                  <Badge variant="outline" className="text-xs">
                    <CheckCircle weight="fill" className="h-3 w-3 mr-1 text-success" />
                    Demo Booked!
                  </Badge>
                )}
              </div>

              {call.notes && (
                <div className="text-sm bg-muted/50 rounded p-3 mt-3">
                  <div className="font-medium mb-1">Notes:</div>
                  <div className="text-muted-foreground whitespace-pre-wrap">{call.notes}</div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
