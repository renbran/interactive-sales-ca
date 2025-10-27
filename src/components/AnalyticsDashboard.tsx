import { Card } from '@/components/ui/card';
import { ChartBar, CheckCircle, Phone, Clock } from '@phosphor-icons/react';
import { CallMetrics } from '@/lib/types';
import { formatDuration } from '@/lib/callUtils';

interface AnalyticsDashboardProps {
  metrics: CallMetrics;
}

export default function AnalyticsDashboard({ metrics }: AnalyticsDashboardProps) {
  const stats = [
    {
      label: 'Total Calls',
      value: metrics.totalCalls,
      icon: Phone,
      color: 'text-primary'
    },
    {
      label: 'Demos Booked',
      value: metrics.demosBooked,
      icon: CheckCircle,
      color: 'text-success'
    },
    {
      label: 'Conversion Rate',
      value: `${metrics.conversionRate.toFixed(1)}%`,
      icon: ChartBar,
      color: 'text-accent'
    },
    {
      label: 'Avg Call Duration',
      value: formatDuration(metrics.avgCallDuration),
      icon: Clock,
      color: 'text-primary'
    }
  ];

  const qualificationStats = [
    { label: 'Right Person Reached', value: metrics.qualificationBreakdown.rightPerson },
    { label: 'Using Excel', value: metrics.qualificationBreakdown.usingExcel },
    { label: 'Has Authority', value: metrics.qualificationBreakdown.hasAuthority },
    { label: 'Budget Discussed', value: metrics.qualificationBreakdown.budgetDiscussed }
  ];

  const getPercentage = (value: number) => {
    if (metrics.totalCalls === 0) return 0;
    return ((value / metrics.totalCalls) * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
                <Icon className={`h-5 w-5 ${stat.color}`} weight="fill" />
              </div>
              <div className="text-3xl font-semibold">{stat.value}</div>
            </Card>
          );
        })}
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Qualification Breakdown</h3>
        <div className="space-y-4">
          {qualificationStats.map((stat, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{stat.label}</span>
                <span className="text-muted-foreground">
                  {stat.value} of {metrics.totalCalls} ({getPercentage(stat.value)}%)
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${getPercentage(stat.value)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {metrics.totalCalls > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Performance Insights</h3>
          <div className="space-y-3 text-sm">
            {metrics.conversionRate >= 20 && (
              <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                <div className="font-semibold text-success mb-1">🎉 Excellent Conversion Rate!</div>
                <div className="text-muted-foreground">
                  You're booking demos at {metrics.conversionRate.toFixed(1)}% - well above the industry average of 15-20%
                </div>
              </div>
            )}
            {metrics.conversionRate < 10 && metrics.totalCalls >= 5 && (
              <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <div className="font-semibold text-warning-foreground mb-1">💡 Opportunity for Improvement</div>
                <div className="text-muted-foreground">
                  Your conversion rate is {metrics.conversionRate.toFixed(1)}%. Focus on qualification questions and objection handling.
                </div>
              </div>
            )}
            {metrics.qualificationBreakdown.rightPerson / metrics.totalCalls < 0.5 && metrics.totalCalls >= 5 && (
              <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
                <div className="font-semibold text-accent-foreground mb-1">🎯 Target the Right Person</div>
                <div className="text-muted-foreground">
                  You're reaching the decision-maker less than 50% of the time. Consider improving your prospecting research.
                </div>
              </div>
            )}
            {metrics.avgCallDuration < 120 && metrics.totalCalls >= 5 && (
              <div className="p-3 bg-muted border rounded-lg">
                <div className="font-semibold mb-1">⏱️ Quick Calls</div>
                <div className="text-muted-foreground">
                  Average call duration is {formatDuration(metrics.avgCallDuration)}. Consider spending more time building rapport and uncovering pain points.
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
