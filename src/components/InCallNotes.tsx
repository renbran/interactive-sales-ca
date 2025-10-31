import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  NotePencil,
  FloppyDisk,
  CaretDown,
  CaretUp,
  Clock,
  CheckCircle
} from '@phosphor-icons/react';
import { toast } from 'sonner';

interface InCallNotesProps {
  callId: string;
  prospectName: string;
  onNotesChange?: (notes: string) => void;
}

export default function InCallNotes({ callId, prospectName, onNotesChange }: InCallNotesProps) {
  const [notes, setNotes] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [wordCount, setWordCount] = useState(0);

  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem(`call-notes-${callId}`);
    if (savedNotes) {
      setNotes(savedNotes);
      setWordCount(savedNotes.trim().split(/\s+/).filter(w => w.length > 0).length);
    }
  }, [callId]);

  // Auto-save notes to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      if (notes.trim()) {
        localStorage.setItem(`call-notes-${callId}`, notes);
        setIsSaving(false);
        setLastSaved(new Date());
        onNotesChange?.(notes);
      }
    }, 1000); // Auto-save after 1 second of no typing

    return () => clearTimeout(timer);
  }, [notes, callId, onNotesChange]);

  const handleNotesChange = (value: string) => {
    setNotes(value);
    setIsSaving(true);
    setWordCount(value.trim().split(/\s+/).filter(w => w.length > 0).length);
  };

  const clearNotes = () => {
    if (confirm('Are you sure you want to clear all notes?')) {
      setNotes('');
      setWordCount(0);
      localStorage.removeItem(`call-notes-${callId}`);
      toast.success('Notes cleared');
    }
  };

  const quickNotes = [
    'Follow up next week',
    'Send pricing info',
    'Decision maker not available',
    'Interested in demo',
    'Budget constraints',
    'Current contract expires soon',
    'Competitor mentioned',
    'Technical requirements needed'
  ];

  const addQuickNote = (note: string) => {
    const newNotes = notes ? `${notes}\n• ${note}` : `• ${note}`;
    setNotes(newNotes);
    if (!isExpanded) setIsExpanded(true);
    toast.success('Note added');
  };

  return (
    <Card className="overflow-hidden">
      {/* Header - Always visible */}
      <div
        className="flex items-center justify-between p-3 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <NotePencil className="h-5 w-5 text-primary" weight="fill" />
          <div>
            <h3 className="font-semibold text-sm">Call Notes</h3>
            <p className="text-xs text-muted-foreground">
              {wordCount > 0 ? `${wordCount} words` : 'Click to add notes'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSaving && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <span>Saving...</span>
            </div>
          )}

          {lastSaved && !isSaving && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <CheckCircle className="h-3 w-3" weight="fill" />
              <span>Saved</span>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <CaretUp className="h-4 w-4" />
            ) : (
              <CaretDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Quick notes */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Quick Notes</label>
            <div className="flex flex-wrap gap-2">
              {quickNotes.map((note, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant="outline"
                  onClick={() => addQuickNote(note)}
                  className="text-xs h-7"
                >
                  + {note}
                </Button>
              ))}
            </div>
          </div>

          {/* Notes textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">
                Notes for {prospectName}
              </label>
              {notes.trim() && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearNotes}
                  className="text-xs h-6 text-destructive hover:text-destructive"
                >
                  Clear
                </Button>
              )}
            </div>

            <Textarea
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Type your notes here...&#10;&#10;Examples:&#10;• Pain point: Manual processes causing errors&#10;• Budget: 50K AED annually&#10;• Next step: Send proposal by Friday&#10;• Decision timeline: 2 weeks"
              className="min-h-[200px] font-mono text-sm resize-none"
            />
          </div>

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs space-y-1">
            <div className="font-medium text-blue-900 flex items-center gap-1">
              <NotePencil className="h-3 w-3" />
              Pro Tips
            </div>
            <ul className="text-blue-700 space-y-1 ml-4 list-disc">
              <li>Note specific numbers and dates mentioned</li>
              <li>Capture exact pain points in their own words</li>
              <li>Record next steps and commitments</li>
              <li>Auto-saves every second - no need to click save!</li>
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
}
