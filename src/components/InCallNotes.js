import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { NotePencil, CaretDown, CaretUp, CheckCircle } from '@phosphor-icons/react';
import { toast } from 'sonner';
export default function InCallNotes({ callId, prospectName, onNotesChange }) {
    const [notes, setNotes] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
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
    const handleNotesChange = (value) => {
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
    const addQuickNote = (note) => {
        const newNotes = notes ? `${notes}\n• ${note}` : `• ${note}`;
        setNotes(newNotes);
        if (!isExpanded)
            setIsExpanded(true);
        toast.success('Note added');
    };
    return (_jsxs(Card, { className: "overflow-hidden", children: [_jsxs("div", { className: "flex items-center justify-between p-3 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors", onClick: () => setIsExpanded(!isExpanded), children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(NotePencil, { className: "h-5 w-5 text-primary", weight: "fill" }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-sm", children: "Call Notes" }), _jsx("p", { className: "text-xs text-muted-foreground", children: wordCount > 0 ? `${wordCount} words` : 'Click to add notes' })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [isSaving && (_jsxs("div", { className: "flex items-center gap-1 text-xs text-muted-foreground", children: [_jsx("div", { className: "h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" }), _jsx("span", { children: "Saving..." })] })), lastSaved && !isSaving && (_jsxs("div", { className: "flex items-center gap-1 text-xs text-green-600", children: [_jsx(CheckCircle, { className: "h-3 w-3", weight: "fill" }), _jsx("span", { children: "Saved" })] })), _jsx(Button, { variant: "ghost", size: "sm", className: "h-7 w-7 p-0", onClick: (e) => {
                                    e.stopPropagation();
                                    setIsExpanded(!isExpanded);
                                }, children: isExpanded ? (_jsx(CaretUp, { className: "h-4 w-4" })) : (_jsx(CaretDown, { className: "h-4 w-4" })) })] })] }), isExpanded && (_jsxs("div", { className: "p-4 space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-xs font-medium text-muted-foreground", children: "Quick Notes" }), _jsx("div", { className: "flex flex-wrap gap-2", children: quickNotes.map((note, index) => (_jsxs(Button, { size: "sm", variant: "outline", onClick: () => addQuickNote(note), className: "text-xs h-7", children: ["+ ", note] }, index))) })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("label", { className: "text-xs font-medium text-muted-foreground", children: ["Notes for ", prospectName] }), notes.trim() && (_jsx(Button, { size: "sm", variant: "ghost", onClick: clearNotes, className: "text-xs h-6 text-destructive hover:text-destructive", children: "Clear" }))] }), _jsx(Textarea, { value: notes, onChange: (e) => handleNotesChange(e.target.value), placeholder: "Type your notes here...\n\nExamples:\n\u2022 Pain point: Manual processes causing errors\n\u2022 Budget: 50K AED annually\n\u2022 Next step: Send proposal by Friday\n\u2022 Decision timeline: 2 weeks", className: "min-h-[200px] font-mono text-sm resize-none" })] }), _jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs space-y-1", children: [_jsxs("div", { className: "font-medium text-blue-900 flex items-center gap-1", children: [_jsx(NotePencil, { className: "h-3 w-3" }), "Pro Tips"] }), _jsxs("ul", { className: "text-blue-700 space-y-1 ml-4 list-disc", children: [_jsx("li", { children: "Note specific numbers and dates mentioned" }), _jsx("li", { children: "Capture exact pain points in their own words" }), _jsx("li", { children: "Record next steps and commitments" }), _jsx("li", { children: "Auto-saves every second - no need to click save!" })] })] })] }))] }));
}
