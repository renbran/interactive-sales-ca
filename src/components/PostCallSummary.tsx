import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Clock, User, Phone } from '@phosphor-icons/react';
import { CallRecord } from '@/lib/types';
import { formatDuration } from '@/lib/callUtils';
import { cn } from '@/lib/utils';

interface PostCallSummaryProps {
  open: boolean;
  callRecord: CallRecord;
  onSave: (notes: string) => void;
}

export default function PostCallSummary({ open, callRecord, onSave }: PostCallSummaryProps) {
  const [notes, setNotes] = useState('');

  const getOutcomeColor = () => {
    switch (callRecord.outcome) {
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

  const getOutcomeLabel = () => {
    switch (callRecord.outcome) {
      case 'demo-booked':
        return '🎉 Demo Booked!';
      case 'follow-up-scheduled':
        return '📅 Follow-Up Scheduled';
      case 'not-interested':
        return '❌ Not Interested';
      default:
        return 'Call Completed';
    }
  };

  const handleSave = () => {
    onSave(notes);
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Call Summary</DialogTitle>
          <DialogDescription>
            Review the call outcome and add any notes before saving
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Badge className={cn('text-lg px-4 py-2', getOutcomeColor())}>
              {getOutcomeLabel()}
            </Badge>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-sm">{formatDuration(callRecord.duration || 0)}</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium">{callRecord.prospectInfo.name}</div>
                <div className="text-sm text-muted-foreground">
                  {callRecord.prospectInfo.company} • {callRecord.prospectInfo.industry}
                </div>
                {callRecord.prospectInfo.phone && (
                  <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Phone className="h-3 w-3" />
                    {callRecord.prospectInfo.phone}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <div className="font-medium mb-2">Qualification Status</div>
            <div className="grid grid-cols-2 gap-2">
              {callRecord.qualification.usesManualProcess && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle weight="fill" className="h-4 w-4 text-success" />
                  <span>Uses Manual Process</span>
                </div>
              )}
              {callRecord.qualification.painPointIdentified && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle weight="fill" className="h-4 w-4 text-success" />
                  <span>Pain Identified</span>
                </div>
              )}
              {callRecord.qualification.painQuantified && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle weight="fill" className="h-4 w-4 text-success" />
                  <span>Pain Quantified</span>
                </div>
              )}
              {callRecord.qualification.valueAcknowledged && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle weight="fill" className="h-4 w-4 text-success" />
                  <span>Value Acknowledged</span>
                </div>
              )}
              {callRecord.qualification.timeCommitted && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle weight="fill" className="h-4 w-4 text-success" />
                  <span>Time Committed</span>
                </div>
              )}
              {callRecord.qualification.demoBooked && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle weight="fill" className="h-4 w-4 text-success" />
                  <span>Demo Booked</span>
                </div>
              )}
            </div>
          </div>

          {callRecord.outcome === 'demo-booked' && (
            <div className="rounded-lg bg-success/10 border border-success/20 p-4">
              <div className="font-medium text-success mb-2">📋 Next Steps (Critical!)</div>
              <div className="text-sm text-foreground/80 space-y-1">
                <div>✅ Send calendar invite within 1 hour</div>
                <div>✅ WhatsApp confirmation today evening</div>
                <div>✅ Reminder day before demo</div>
                <div>✅ Meeting link 1 hour before</div>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="notes" className="font-medium mb-2 block">
              Call Notes
            </label>
            <Textarea
              id="notes"
              placeholder="Add any important notes, pain points mentioned, objections, or follow-up actions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              onClick={handleSave}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              size="lg"
            >
              Save Call
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
