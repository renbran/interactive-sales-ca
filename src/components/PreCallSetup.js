import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, X } from '@phosphor-icons/react';
import { getIndustryPain } from '@/lib/scholarixScript';
export default function PreCallSetup({ open, onClose, onStart }) {
    const [prospect, setProspect] = useState({
        name: '',
        title: '',
        company: '',
        industry: 'real-estate',
        phone: '',
        email: '',
        whatsapp: ''
    });
    const [objective, setObjective] = useState('cold-call');
    const isValid = prospect.name && prospect.company && prospect.phone && prospect.industry;
    const handleStart = () => {
        if (isValid) {
            onStart(prospect, objective);
            setProspect({
                name: '',
                title: '',
                company: '',
                industry: 'real-estate',
                phone: '',
                email: '',
                whatsapp: ''
            });
            setObjective('cold-call');
        }
    };
    return (_jsx(Dialog, { open: open, onOpenChange: (open) => !open && onClose(), children: _jsxs(DialogContent, { className: "dialog-mobile sm:max-w-[600px] max-h-[90vh] overflow-y-auto", children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { className: "text-responsive-lg flex items-center gap-2", children: [_jsx(Phone, { weight: "fill", className: "h-5 w-5 sm:h-6 sm:w-6 text-accent" }), "Pre-Call Setup"] }), _jsx(DialogDescription, { className: "text-sm sm:text-base", children: "Complete prospect intel before starting the call. This information will auto-fill in your script." })] }), _jsxs("div", { className: "space-mobile-y py-4", children: [_jsxs("div", { className: "grid-mobile-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "name", className: "text-sm font-medium", children: "Prospect Name *" }), _jsx(Input, { id: "name", className: "input-mobile focus-mobile", placeholder: "Mohammed Al-Rashid", value: prospect.name, onChange: (e) => setProspect({ ...prospect, name: e.target.value }) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "title", className: "text-sm font-medium", children: "Title" }), _jsx(Input, { id: "title", className: "input-mobile focus-mobile", placeholder: "Managing Director", value: prospect.title, onChange: (e) => setProspect({ ...prospect, title: e.target.value }) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "company", className: "text-sm font-medium", children: "Company Name *" }), _jsx(Input, { id: "company", className: "input-mobile focus-mobile", placeholder: "ABC Real Estate LLC", value: prospect.company, onChange: (e) => setProspect({ ...prospect, company: e.target.value }) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "industry", className: "text-sm font-medium", children: "Industry *" }), _jsxs(Select, { value: prospect.industry, onValueChange: (value) => setProspect({ ...prospect, industry: value }), children: [_jsx(SelectTrigger, { id: "industry", className: "select-mobile focus-mobile", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "real-estate", children: "Real Estate" }), _jsx(SelectItem, { value: "retail", children: "Retail" }), _jsx(SelectItem, { value: "trading", children: "Trading" }), _jsx(SelectItem, { value: "logistics", children: "Logistics" }), _jsx(SelectItem, { value: "consulting", children: "Consulting" })] })] }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["Likely pain: ", getIndustryPain(prospect.industry)] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "phone", children: "Phone Number *" }), _jsx(Input, { id: "phone", type: "tel", placeholder: "+971 50 123 4567", value: prospect.phone, onChange: (e) => setProspect({ ...prospect, phone: e.target.value }) })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "whatsapp", children: "WhatsApp (Optional)" }), _jsx(Input, { id: "whatsapp", type: "tel", placeholder: "+971 50 123 4567", value: prospect.whatsapp, onChange: (e) => setProspect({ ...prospect, whatsapp: e.target.value }) })] })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "email", children: "Email (Optional)" }), _jsx(Input, { id: "email", type: "email", placeholder: "m.alrashid@company.ae", value: prospect.email, onChange: (e) => setProspect({ ...prospect, email: e.target.value }) })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "objective", children: "Call Objective" }), _jsxs(Select, { value: objective, onValueChange: (value) => setObjective(value), children: [_jsx(SelectTrigger, { id: "objective", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "cold-call", children: "Cold Call (First Contact)" }), _jsx(SelectItem, { value: "follow-up", children: "Follow-Up Call" }), _jsx(SelectItem, { value: "demo-confirmation", children: "Demo Confirmation" })] })] })] }), _jsxs("div", { className: "rounded-lg bg-accent/10 p-4 border border-accent/20", children: [_jsx("div", { className: "text-sm font-medium text-accent mb-2", children: "\uD83D\uDCCB Pre-Call Mental Frame" }), _jsxs("div", { className: "text-xs text-foreground/80 space-y-1", children: [_jsx("div", { children: "\u2705 Standing up (energy = confidence)" }), _jsx("div", { children: "\u2705 Smiling (vocal warmth transfers)" }), _jsx("div", { children: "\u2705 Pen + notepad ready" }), _jsx("div", { children: "\u2705 Remember: You're saving them from bleeding money daily" })] })] })] }), _jsxs("div", { className: "flex gap-3 justify-end", children: [_jsxs(Button, { variant: "outline", onClick: onClose, children: [_jsx(X, { className: "mr-2 h-4 w-4" }), "Cancel"] }), _jsxs(Button, { onClick: handleStart, disabled: !isValid, className: "bg-accent hover:bg-accent/90 text-accent-foreground", children: [_jsx(Phone, { weight: "fill", className: "mr-2 h-4 w-4" }), "Start Call"] })] })] }) }));
}
