import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Clock, User, Phone, ArrowRight, Target, Microphone } from '@phosphor-icons/react';
import { CallRecord } from '@/lib/types';
import { formatDuration } from '@/lib/callUtils';
import { cn } from '@/lib/utils';
import { aiService, checkAIHealth } from '@/lib/openaiService';

interface PostCallSummaryProps {
  open: boolean;
  callRecord: CallRecord;
  onSave: (notes: string) => void;
}

export default function PostCallSummary({ open, callRecord, onSave }: PostCallSummaryProps) {
  const [notes, setNotes] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [followUpSuggestions, setFollowUpSuggestions] = useState<string[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);

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
    const finalNotes = aiSummary ? `${aiSummary}\n\nAdditional Notes:\n${notes}` : notes;
    onSave(finalNotes);
    setNotes('');
    setAiSummary('');
    setFollowUpSuggestions([]);
  };

  const generateAISummary = async () => {
    setIsGeneratingAI(true);
    try {
      const summary = await aiService.generateCallSummary({
        prospectInfo: callRecord.prospectInfo,
        duration: callRecord.duration || 0,
        outcome: callRecord.outcome,
        qualification: callRecord.qualification,
        scriptPath: callRecord.scriptPath,
      });
      setAiSummary(summary);

      const suggestions = await aiService.generateFollowUpSuggestions({
        prospectInfo: callRecord.prospectInfo,
        outcome: callRecord.outcome,
        qualification: callRecord.qualification,
      });
      setFollowUpSuggestions(suggestions);
    } catch (error) {
      console.error('Failed to generate AI summary:', error);
      // Show a user-friendly error message
    }
    setIsGeneratingAI(false);
  };

  // Check if Ollama is available when component opens
  useEffect(() => {
    if (open) {
      checkAIHealth().then(setAiEnabled);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-xl sm:text-2xl">Call Summary</DialogTitle>
          <DialogDescription className="text-sm">
            Review the call outcome and add any notes before saving
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 overflow-y-auto flex-1 pr-2 -mr-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <Badge className={cn('text-sm sm:text-lg px-3 py-1 sm:px-4 sm:py-2 text-center', getOutcomeColor())}>
              {getOutcomeLabel()}
            </Badge>
            <div className="flex items-center gap-2 text-muted-foreground justify-center sm:justify-start">
              <Clock className="h-4 w-4" />
              <span className="text-sm">{formatDuration(callRecord.duration || 0)}</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-start gap-2 sm:gap-3">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div className="min-w-0">
                <div className="font-medium text-sm sm:text-base truncate">{callRecord.prospectInfo.name}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  <div className="truncate">{callRecord.prospectInfo.company}</div>
                  <div className="truncate">{callRecord.prospectInfo.industry}</div>
                </div>
                {callRecord.prospectInfo.phone && (
                  <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Phone className="h-3 w-3 shrink-0" />
                    <span className="truncate">{callRecord.prospectInfo.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {callRecord.recordingUrl && (
            <>
              <div>
                <div className="font-medium mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <Microphone weight="fill" className="h-4 w-4 sm:h-5 sm:w-5" />
                  Call Recording
                </div>
                <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Duration: {formatDuration(callRecord.recordingDuration || 0)}
                    </span>
                  </div>
                  <audio
                    src={callRecord.recordingUrl}
                    controls
                    className="w-full h-8 sm:h-10"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Recording saved locally in your browser
                  </p>
                </div>
              </div>
              <Separator />
            </>
          )}

          <div>
            <div className="font-medium mb-2 text-sm sm:text-base">Qualification Status</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {callRecord.qualification.usesManualProcess && (
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <CheckCircle weight="fill" className="h-3 w-3 sm:h-4 sm:w-4 text-success shrink-0" />
                  <span>Uses Manual Process</span>
                </div>
              )}
              {callRecord.qualification.painPointIdentified && (
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <CheckCircle weight="fill" className="h-3 w-3 sm:h-4 sm:w-4 text-success shrink-0" />
                  <span>Pain Identified</span>
                </div>
              )}
              {callRecord.qualification.painQuantified && (
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <CheckCircle weight="fill" className="h-3 w-3 sm:h-4 sm:w-4 text-success shrink-0" />
                  <span>Pain Quantified</span>
                </div>
              )}
              {callRecord.qualification.valueAcknowledged && (
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <CheckCircle weight="fill" className="h-3 w-3 sm:h-4 sm:w-4 text-success shrink-0" />
                  <span>Value Acknowledged</span>
                </div>
              )}
              {callRecord.qualification.timeCommitted && (
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <CheckCircle weight="fill" className="h-3 w-3 sm:h-4 sm:w-4 text-success shrink-0" />
                  <span>Time Committed</span>
                </div>
              )}
              {callRecord.qualification.demoBooked && (
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <CheckCircle weight="fill" className="h-3 w-3 sm:h-4 sm:w-4 text-success shrink-0" />
                  <span>Demo Booked</span>
                </div>
              )}
            </div>
          </div>

          {callRecord.outcome === 'demo-booked' && (
            <div className="rounded-lg bg-success/10 border border-success/20 p-3 sm:p-4">
              <div className="font-medium text-success mb-2 text-sm sm:text-base">📋 Next Steps (Critical!)</div>
              <div className="text-xs sm:text-sm text-foreground/80 space-y-1">
                <div>✅ Send calendar invite within 1 hour</div>
                <div>✅ WhatsApp confirmation today evening</div>
                <div>✅ Reminder day before demo</div>
                <div>✅ Meeting link 1 hour before</div>
              </div>
            </div>
          )}

          {/* AI-Powered Summary Section */}
          {aiEnabled && (
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 mb-3">
                <div className="font-medium text-blue-900 text-sm sm:text-base">🤖 AI Call Analysis</div>
                <Button
                  onClick={generateAISummary}
                  disabled={isGeneratingAI}
                  variant="outline"
                  size="sm"
                  className="text-blue-700 border-blue-300 hover:bg-blue-100 w-full sm:w-auto"
                >
                  {isGeneratingAI ? (
                    <span className="flex items-center gap-2 justify-center">
                      <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-blue-700"></div>
                      <span className="text-xs sm:text-sm">Analyzing...</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 justify-center">
                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="text-xs sm:text-sm">Generate Summary</span>
                    </span>
                  )}
                </Button>
              </div>

              {aiSummary && (
                <div className="space-y-2 sm:space-y-3">
                  <div>
                    <div className="font-medium text-xs sm:text-sm text-blue-900 mb-2">Call Summary:</div>
                    <div className="text-xs sm:text-sm text-blue-800 bg-white rounded p-2 sm:p-3 border border-blue-100">
                      {aiSummary}
                    </div>
                  </div>

                  {followUpSuggestions.length > 0 && (
                    <div>
                      <div className="font-medium text-xs sm:text-sm text-blue-900 mb-2">AI Follow-up Suggestions:</div>
                      <div className="text-xs sm:text-sm text-blue-800 bg-white rounded p-2 sm:p-3 border border-blue-100">
                        <ul className="space-y-1">
                          {followUpSuggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <Target className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 text-blue-600 shrink-0" />
                              <span className="text-xs sm:text-sm">{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div>
            <label htmlFor="notes" className="font-medium mb-2 block text-sm sm:text-base">
              Call Notes
            </label>
            <Textarea
              id="notes"
              placeholder="Add any important notes, pain points mentioned, objections, or follow-up actions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="text-sm"
            />
          </div>
        </div>

        {/* Fixed footer with save button */}
        <div className="shrink-0 pt-4 border-t bg-background">
          <div className="flex gap-3 justify-end">
            <Button
              onClick={handleSave}
              className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto"
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
