import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from '@phosphor-icons/react';
import { CallRecord } from '@/lib/types';
import { formatDuration } from '@/lib/callUtils';
import { cn } from '@/lib/utils';

interface PostCallSummaryProps {
  open: boolean;
  callRecord: CallRecord;
  onSave: (notes: string) => void;
}

export default function PostCallSummary({ open, callRecord, onSave }: PostCallSummaryProps) {
  const [notes, setNotes] = useState(callRecord.notes || '');
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (open && callRecord.outcome === 'demo-booked') {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [open, callRecord.outcome]);

  const getOutcomeConfig = () => {
    switch (callRecord.outcome) {
      case 'demo-booked':
        return {
          label: 'Demo Booked! 🎉',
          variant: 'default' as const,
          className: 'bg-success hover:bg-success/90',
          icon: CheckCircle
        };
      case 'follow-up':
        return {
          label: 'Follow-up Required',
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
          label: callRecord.outcome,
          variant: 'outline' as const,
          className: '',
          icon: Clock
        };
    }
  };

  const outcome = getOutcomeConfig();
  const OutcomeIcon = outcome.icon;

  return (
    <>
      <Dialog open={open}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Call Summary</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <div className="font-semibold text-lg">{callRecord.prospectInfo.name}</div>
                <div className="text-sm text-muted-foreground">{callRecord.prospectInfo.company}</div>
              </div>
              <Badge variant={outcome.variant} className={cn('text-sm', outcome.className)}>
                <OutcomeIcon weight="fill" className="mr-2 h-4 w-4" />
                {outcome.label}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Call Duration</div>
                <div className="font-semibold">{formatDuration(callRecord.duration || 0)}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Objective</div>
                <div className="font-semibold capitalize">{callRecord.objective.replace('-', ' ')}</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Qualification Results</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span>Right Person</span>
                  {callRecord.qualification.rightPerson === true ? (
                    <CheckCircle weight="fill" className="h-4 w-4 text-success" />
                  ) : callRecord.qualification.rightPerson === false ? (
                    <XCircle weight="fill" className="h-4 w-4 text-destructive" />
                  ) : (
                    <span className="text-muted-foreground">N/A</span>
                  )}
                </div>
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span>Using Excel</span>
                  {callRecord.qualification.usingExcel === true ? (
                    <CheckCircle weight="fill" className="h-4 w-4 text-success" />
                  ) : callRecord.qualification.usingExcel === false ? (
                    <XCircle weight="fill" className="h-4 w-4 text-destructive" />
                  ) : (
                    <span className="text-muted-foreground">N/A</span>
                  )}
                </div>
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span>Has Authority</span>
                  {callRecord.qualification.hasAuthority === true ? (
                    <CheckCircle weight="fill" className="h-4 w-4 text-success" />
                  ) : callRecord.qualification.hasAuthority === false ? (
                    <XCircle weight="fill" className="h-4 w-4 text-destructive" />
                  ) : (
                    <span className="text-muted-foreground">N/A</span>
                  )}
                </div>
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span>Pain Level</span>
                  {callRecord.qualification.painLevel !== null ? (
                    <span className="font-semibold text-primary">{callRecord.qualification.painLevel}/10</span>
                  ) : (
                    <span className="text-muted-foreground">N/A</span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Call Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes about the call..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              size="lg"
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={() => onSave(notes)}
            >
              Save & Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl animate-bounce">🎉</div>
          </div>
        </div>
      )}
    </>
  );
}
