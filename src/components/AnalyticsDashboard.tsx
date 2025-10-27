import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChartBar, Phone, Target, Clock } from '@phosphor-icons/react';
import { CallMetrics } from '@/lib/types';
import { cn } from '@/lib/utils';

interface AnalyticsDashboardProps {
  metrics: CallMetrics;
}

export default function AnalyticsDashboard({ metrics }: AnalyticsDashboardProps) {
  const conversionRateStatus = metrics.conversionRate >= 40 ? 'success' : metrics.conversionRate >= 20 ? 'warning' : 'danger';
  
  const avgDurationStatus = metrics.avgCallDuration <= 300 && metrics.avgCallDuration >= 180 ? 'success' : 'warning';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ChartBar weight="fill" className="h-8 w-8 text-accent" />
        <div>
          <h2 className="text-2xl font-semibold">Performance Analytics</h2>
          <p className="text-muted-foreground">Track your progress toward the Scholarix 40%+ booking rate target</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Phone className="h-5 w-5 text-primary" />
            <div className="text-sm font-medium text-muted-foreground">Total Calls</div>
          </div>
          <div className="text-4xl font-semibold">{metrics.totalCalls}</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5 text-success" />
            <div className="text-sm font-medium text-muted-foreground">Demos Booked</div>
          </div>
          <div className="text-4xl font-semibold text-success">{metrics.demosBooked}</div>
        </Card>

        <Card className={cn(
          'p-6',
          conversionRateStatus === 'success' && 'border-success',
          conversionRateStatus === 'warning' && 'border-warning',
          conversionRateStatus === 'danger' && 'border-destructive'
        )}>
          <div className="flex items-center gap-2 mb-2">
            <ChartBar className="h-5 w-5 text-accent" />
            <div className="text-sm font-medium text-muted-foreground">Conversion Rate</div>
          </div>
          <div className={cn(
            'text-4xl font-semibold',
            conversionRateStatus === 'success' && 'text-success',
            conversionRateStatus === 'warning' && 'text-warning',
            conversionRateStatus === 'danger' && 'text-destructive'
          )}>
            {metrics.conversionRate.toFixed(1)}%
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Target: 40%+ {conversionRateStatus === 'success' && '✓'}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-primary" />
            <div className="text-sm font-medium text-muted-foreground">Avg Duration</div>
          </div>
          <div className={cn(
            'text-4xl font-semibold',
            avgDurationStatus === 'success' && 'text-success'
          )}>
            {Math.floor(metrics.avgCallDuration / 60)}:{(Math.floor(metrics.avgCallDuration) % 60).toString().padStart(2, '0')}
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Target: 3-5 minutes
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">SPIN Qualification Breakdown</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Uses Manual Process</span>
              <span className="font-medium">{metrics.qualificationBreakdown.usesManualProcess} / {metrics.totalCalls}</span>
            </div>
            <Progress 
              value={metrics.totalCalls > 0 ? (metrics.qualificationBreakdown.usesManualProcess / metrics.totalCalls) * 100 : 0} 
              className="h-2"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Pain Point Identified</span>
              <span className="font-medium">{metrics.qualificationBreakdown.painPointIdentified} / {metrics.totalCalls}</span>
            </div>
            <Progress 
              value={metrics.totalCalls > 0 ? (metrics.qualificationBreakdown.painPointIdentified / metrics.totalCalls) * 100 : 0} 
              className="h-2"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Pain Quantified ($$$ Value)</span>
              <span className="font-medium">{metrics.qualificationBreakdown.painQuantified} / {metrics.totalCalls}</span>
            </div>
            <Progress 
              value={metrics.totalCalls > 0 ? (metrics.qualificationBreakdown.painQuantified / metrics.totalCalls) * 100 : 0} 
              className="h-2"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Value Acknowledged</span>
              <span className="font-medium">{metrics.qualificationBreakdown.valueAcknowledged} / {metrics.totalCalls}</span>
            </div>
            <Progress 
              value={metrics.totalCalls > 0 ? (metrics.qualificationBreakdown.valueAcknowledged / metrics.totalCalls) * 100 : 0} 
              className="h-2"
            />
          </div>
        </div>
      </Card>

      {metrics.conversionRate < 20 && metrics.totalCalls >= 5 && (
        <Card className="p-6 bg-destructive/10 border-destructive">
          <div className="flex items-start gap-3">
            <Target className="h-6 w-6 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-destructive mb-2">Conversion Rate Below Target</div>
              <div className="text-sm text-foreground/80 space-y-1">
                <div>• Review the Scholarix methodology - are you following the SPIN sequence?</div>
                <div>• Focus on pain quantification - get them to say a number</div>
                <div>• Use the teaching moment to position as advisor, not vendor</div>
                <div>• Handle objections with PEARL method - don't skip steps</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {metrics.conversionRate >= 40 && metrics.totalCalls >= 10 && (
        <Card className="p-6 bg-success/10 border-success">
          <div className="flex items-start gap-3">
            <Target className="h-6 w-6 text-success flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-success mb-2">🎉 Exceeding Target! Elite Closer Status</div>
              <div className="text-sm text-foreground/80">
                You're crushing it with {metrics.conversionRate.toFixed(1)}% conversion rate. Keep following the system!
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
