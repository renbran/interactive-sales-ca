import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CheckCircle, XCircle, Circle, Target } from '@phosphor-icons/react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getQualificationProgress } from '@/lib/callUtils';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
export default function QualificationChecklist({ qualification }) {
    const progress = getQualificationProgress(qualification);
    const getStatusColor = () => {
        if (progress >= 80)
            return 'bg-success';
        if (progress >= 50)
            return 'bg-warning';
        return 'bg-muted';
    };
    const getOverallStatus = () => {
        const hasNegative = Object.values(qualification).some(v => v === false);
        if (qualification.demoBooked)
            return { label: 'Demo Booked! 🎉', variant: 'default' };
        if (hasNegative)
            return { label: 'Issues Found', variant: 'destructive' };
        if (progress >= 60)
            return { label: 'Strong Lead', variant: 'default' };
        if (progress >= 30)
            return { label: 'In Progress', variant: 'secondary' };
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
    const renderIcon = (value) => {
        if (value === null) {
            return _jsx(Circle, { className: "h-5 w-5 text-muted-foreground", weight: "bold" });
        }
        if (value === false) {
            return _jsx(XCircle, { weight: "fill", className: "h-5 w-5 text-destructive" });
        }
        return _jsx(CheckCircle, { weight: "fill", className: "h-5 w-5 text-success" });
    };
    return (_jsx(Card, { className: "card-mobile h-full", children: _jsxs("div", { className: "space-mobile-y", children: [_jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Target, { weight: "fill", className: "h-5 w-5 text-accent" }), _jsx("h3", { className: "text-responsive-lg font-semibold", children: "Qualification" })] }), _jsx(Badge, { className: cn('w-fit', status.variant === 'default' ? 'bg-success text-success-foreground' :
                                status.variant === 'destructive' ? 'bg-destructive text-destructive-foreground' :
                                    status.variant === 'secondary' ? 'bg-secondary text-secondary-foreground' :
                                        'bg-muted text-muted-foreground'), children: status.label })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-muted-foreground", children: "Progress" }), _jsxs("span", { className: "font-medium", children: [Math.round(progress), "%"] })] }), _jsx(Progress, { value: progress, className: cn('h-2', getStatusColor()) })] }), _jsx(Separator, {}), _jsx("div", { className: "space-y-2 sm:space-y-3", children: items.map((item, idx) => (_jsxs("div", { className: cn('flex items-start gap-3 p-3 rounded-lg transition-colors touch-target', item.value === true && 'bg-success/10', item.value === false && 'bg-destructive/10', item.value === null && 'bg-muted/30'), children: [_jsx("div", { className: "mt-0.5 shrink-0", children: renderIcon(item.value) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("div", { className: cn('text-sm font-medium leading-tight', item.value === true && 'text-success', item.value === false && 'text-destructive', item.value === null && 'text-muted-foreground'), children: item.label }), item.key === 'demoBooked' && item.value === true && (_jsx("div", { className: "text-xs text-muted-foreground mt-1 leading-tight", children: "Remember: Send calendar invite within 1 hour!" }))] })] }, idx))) }), _jsx(Separator, {}), _jsxs("div", { className: "rounded-lg bg-primary/10 p-4 border border-primary/20", children: [_jsx("div", { className: "text-xs font-medium text-primary mb-2", children: "\uD83D\uDCCA SCHOLARIX TARGET" }), _jsxs("div", { className: "space-y-1 text-xs text-foreground/70", children: [_jsx("div", { children: "\u2022 40%+ demo booking rate" }), _jsx("div", { children: "\u2022 3-5 minute average call" }), _jsx("div", { children: "\u2022 40 slots @ 40% discount" }), _jsx("div", { children: "\u2022 14-day deployment promise" })] })] })] }) }));
}
