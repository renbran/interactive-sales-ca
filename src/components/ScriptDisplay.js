import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowRight, Lightbulb } from '@phosphor-icons/react';
import { formatScriptWithRealism, removePlaceholderBrackets } from '@/lib/scriptRealism';
import { cn } from '@/lib/utils';
export default function ScriptDisplay({ currentNode, prospectInfo, onResponse }) {
    const getPhaseColor = (phase) => {
        switch (phase) {
            case 'opening':
                return 'bg-primary text-primary-foreground';
            case 'discovery':
                return 'bg-accent text-accent-foreground';
            case 'teaching':
                return 'bg-warning text-warning-foreground';
            case 'demo-offer':
                return 'bg-success text-success-foreground';
            case 'objection':
                return 'bg-destructive text-destructive-foreground';
            case 'close':
                return 'bg-success text-success-foreground';
            default:
                return 'bg-secondary text-secondary-foreground';
        }
    };
    const getResponseButtonColor = (type) => {
        switch (type) {
            case 'positive':
                return 'bg-success hover:bg-success/90 text-success-foreground';
            case 'negative':
                return 'bg-muted hover:bg-muted/90 text-muted-foreground border';
            case 'objection':
                return 'bg-warning hover:bg-warning/90 text-warning-foreground';
            default:
                return 'bg-secondary hover:bg-secondary/90 text-secondary-foreground';
        }
    };
    const formatScript = (text) => {
        // Use the new realistic formatter that removes ALL placeholder brackets
        const formatted = formatScriptWithRealism(text, {
            prospectName: prospectInfo.name,
            companyName: prospectInfo.company,
            industry: prospectInfo.industry,
        }, {
            generateTimes: true,
            generateDates: true,
        });
        // Final pass to ensure no brackets remain
        return removePlaceholderBrackets(formatted);
    };
    const scriptText = formatScript(currentNode.text);
    const scriptParagraphs = scriptText.split('\n\n');
    return (_jsxs(Card, { className: "flex flex-col h-full min-h-[500px]", children: [_jsxs("div", { className: "p-6 border-b", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx(Badge, { className: cn(getPhaseColor(currentNode.phase), 'text-sm font-medium px-3 py-1'), children: currentNode.phase.toUpperCase().replace('-', ' ') }), _jsx(Badge, { variant: "outline", className: "text-xs", children: currentNode.type.replace('-', ' ') })] }), _jsx("h2", { className: "text-xl font-semibold", children: prospectInfo.name ? `Calling ${prospectInfo.name}` : 'Follow the Script' }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [prospectInfo.company, " \u2022 ", prospectInfo.industry?.replace('-', ' ') || 'Industry'] })] }), _jsx(ScrollArea, { className: "flex-1 p-6", children: _jsxs("div", { className: "space-y-4", children: [scriptParagraphs.map((paragraph, idx) => (_jsx("div", { children: paragraph.startsWith('•') || paragraph.startsWith('✅') || paragraph.startsWith('📋') || paragraph.startsWith('🎯') || paragraph.startsWith('💰') || paragraph.startsWith('🎁') ? (_jsx("div", { className: "pl-4 text-[17px] leading-relaxed whitespace-pre-wrap text-foreground/90", children: paragraph })) : (_jsx("p", { className: "text-[18px] leading-relaxed whitespace-pre-wrap text-foreground font-medium", children: paragraph })) }, idx))), currentNode.tips && (_jsxs(_Fragment, { children: [_jsx(Separator, { className: "my-4" }), _jsx("div", { className: "rounded-lg bg-accent/10 border border-accent/20 p-4", children: _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(Lightbulb, { weight: "fill", className: "h-5 w-5 text-accent mt-0.5 flex-shrink-0" }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-accent mb-1 text-sm", children: "Pro Tip" }), _jsx("div", { className: "text-sm text-foreground/80", children: currentNode.tips })] })] }) })] }))] }) }), currentNode.responses && currentNode.responses.length > 0 && (_jsxs("div", { className: "p-6 border-t bg-muted/30", children: [_jsx("div", { className: "text-sm font-medium mb-3 text-muted-foreground", children: "Select prospect's response:" }), _jsx("div", { className: "grid gap-2", children: currentNode.responses.map((response, idx) => (_jsxs(Button, { onClick: () => onResponse(response.nextNodeId), className: cn('w-full justify-between h-auto py-3 px-4 text-left', getResponseButtonColor(response.type)), size: "lg", children: [_jsx("span", { className: "flex-1", children: response.label }), _jsx(ArrowRight, { weight: "bold", className: "h-5 w-5 ml-2 flex-shrink-0" })] }, idx))) }), _jsx("div", { className: "mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg", children: _jsxs("div", { className: "flex items-center gap-2 text-sm text-blue-800", children: [_jsx(Lightbulb, { weight: "fill", className: "h-4 w-4" }), _jsx("span", { className: "font-medium", children: "Pro Tip:" }), _jsx("span", { children: "Need help with an objection? Use the \"AI Helper\" tab for personalized responses!" })] }) })] }))] }));
}
