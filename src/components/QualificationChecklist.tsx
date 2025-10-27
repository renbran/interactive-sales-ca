import { CheckCircle, XCircle, Circle } from '@phosphor-icons/react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { QualificationStatus } from '@/lib/types';
import { getQualificationProgress } from '@/lib/callUtils';
import { Badge } from '@/components/ui/badge';
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
    if (hasNegative) return { label: 'Disqualified', variant: 'destructive' };
    if (progress >= 80) return { label: 'Qualified', variant: 'default' };
    if (progress >= 40) return { label: 'In Progress', variant: 'secondary' };
    return { label: 'Not Started', variant: 'outline' };
  };

  const status = getOverallStatus();

  const items = [
    { label: 'Right Person', value: qualification.rightPerson },
    { label: 'Using Excel', value: qualification.usingExcel },
    { label: 'Pain Level', value: qualification.painLevel !== null ? `${qualification.painLevel}/10` : null },
    { label: 'Has Authority', value: qualification.hasAuthority },
    { label: 'Budget Discussed', value: qualification.budgetDiscussed },
    { label: 'Demo Booked', value: qualification.demoBooked },
  ];

  const renderIcon = (value: boolean | string | null) => {
    if (value === null) {
      return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
    if (value === false) {
      return <XCircle weight="fill" className="h-5 w-5 text-destructive" />;
    }
    return <CheckCircle weight="fill" className="h-5 w-5 text-success" />;
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Qualification Status</h3>
          <Badge variant={status.variant} className={status.variant === 'default' ? 'bg-success hover:bg-success/90' : ''}>
            {status.label}
          </Badge>
        </div>

        <div className="space-y-1">
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
            <div 
              className={cn("h-full transition-all duration-300", getStatusColor())}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</p>
        </div>

        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
              <span className="text-sm font-medium">{item.label}</span>
              <div className="flex items-center gap-2">
                {typeof item.value === 'string' && (
                  <span className="text-sm font-semibold text-primary">{item.value}</span>
                )}
                {renderIcon(item.value)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
