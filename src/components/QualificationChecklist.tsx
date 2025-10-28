import { CheckCircle, XCircle, Circle, Target } from '@phosphor-icons/react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { QualificationStatus } from '@/lib/types';
import { getQualificationProgress } from '@/lib/callUtils';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface QualificationChecklistProps {
  qualification: QualificationStatus;
}

export default function QualificationChecklist({ qualification }: QualificationChecklistProps) {
  const progress = getQualificationProgress(qualification as unknown as Record<string, boolean | number | null>);
  
  const getStatusColor = (): string => {
    if (progress >= 80) return 'bg-success';
    if (progress >= 50) return 'bg-warning';
    return 'bg-muted';
  };

  const getOverallStatus = (): { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } => {
    const hasNegative = Object.values(qualification).some(v => v === false);
    if (qualification.demoBooked) return { label: 'Demo Booked! 🎉', variant: 'default' };
    if (hasNegative) return { label: 'Issues Found', variant: 'destructive' };
    if (progress >= 60) return { label: 'Strong Lead', variant: 'default' };
    if (progress >= 30) return { label: 'In Progress', variant: 'secondary' };
    return { label: 'Just Started', variant: 'outline' };
  };

  const status = getOverallStatus();

  const items = [
    { label: 'Uses Manual Process', value: qualification.usesManualProcess, key: 'usesManualProcess' },
    { label: 'Pain Point Identified', value: qualification.painPointIdentified, key: 'painPointIdentified' },
    { label: 'Pain Quantified ($$$)', value: qualification.painQuantified, key: 'painQuantified' },
    { label: 'Value Acknowledged', value: qualification.valueAcknowledged, key: 'valueAcknowledged' },
    { label: 'Time Committed', value: qualification.timeCommitted, key: 'timeCommitted' },
    { label: 'Demo Booked', value: qualification.demoBooked, key: 'demoBooked' },
  ];

  const renderIcon = (value: boolean | null) => {
    if (value === null) {
      return <Circle className="h-5 w-5 text-muted-foreground" weight="bold" />;
    }
    if (value === false) {
      return <XCircle weight="fill" className="h-5 w-5 text-destructive" />;
    }
    return <CheckCircle weight="fill" className="h-5 w-5 text-success" />;
  };

  return (
    <Card className="card-mobile h-full">
      <div className="space-mobile-y">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Target weight="fill" className="h-5 w-5 text-accent" />
            <h3 className="text-responsive-lg font-semibold">Qualification</h3>
          </div>
          <Badge className={cn(
            'w-fit',
            status.variant === 'default' ? 'bg-success text-success-foreground' :
            status.variant === 'destructive' ? 'bg-destructive text-destructive-foreground' :
            status.variant === 'secondary' ? 'bg-secondary text-secondary-foreground' :
            'bg-muted text-muted-foreground'
          )}>
            {status.label}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className={cn('h-2', getStatusColor())} />
        </div>

        <Separator />

        <div className="space-y-2 sm:space-y-3">
          {items.map((item, idx) => (
            <div
              key={idx}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg transition-colors touch-target',
                item.value === true && 'bg-success/10',
                item.value === false && 'bg-destructive/10',
                item.value === null && 'bg-muted/30'
              )}
            >
              <div className="mt-0.5 shrink-0">
                {renderIcon(item.value)}
              </div>
              <div className="flex-1 min-w-0">
                <div className={cn(
                  'text-sm font-medium leading-tight',
                  item.value === true && 'text-success',
                  item.value === false && 'text-destructive',
                  item.value === null && 'text-muted-foreground'
                )}>
                  {item.label}
                </div>
                {item.key === 'demoBooked' && item.value === true && (
                  <div className="text-xs text-muted-foreground mt-1 leading-tight">
                    Remember: Send calendar invite within 1 hour!
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <Separator />

        <div className="rounded-lg bg-primary/10 p-4 border border-primary/20">
          <div className="text-xs font-medium text-primary mb-2">📊 SCHOLARIX TARGET</div>
          <div className="space-y-1 text-xs text-foreground/70">
            <div>• 40%+ demo booking rate</div>
            <div>• 3-5 minute average call</div>
            <div>• 40 slots @ 40% discount</div>
            <div>• 14-day deployment promise</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
