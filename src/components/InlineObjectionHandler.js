import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Warning, Copy, CheckCircle, MagnifyingGlass, CaretDown, CaretUp, Lightbulb, Target } from '@phosphor-icons/react';
import { toast } from 'sonner';
const objectionDatabase = [
    {
        objection: "It's too expensive",
        response: "I totally get that, [NAME]. Money's tight for everyone right now.\n\nBut here's the thing—you just told me this [THEIR PAIN] is costing you [THEIR AMOUNT] every month, right?\n\nSo really, the question isn't whether you can afford to fix this. It's whether you can afford to keep bleeding money every month while you think about it.\n\nLook, the demo costs you nothing. Let me just show you the numbers—your actual numbers—and you can see if it makes sense.",
        tip: "Use their own words and pain points back to them. Make the cost of inaction greater than the cost of action.",
        category: 'price'
    },
    {
        objection: "I'm too busy right now",
        response: "I hear you, [NAME]. You're swamped, right? I bet you're thinking 'Another sales guy wanting to waste my time.'\n\nBut here's the thing—and I mean this—you're probably busy BECAUSE of all this manual stuff you're dealing with.\n\nWhat if 15 minutes right now could give you back hours every week?\n\nLook, if after 10 minutes you don't see how this saves you time, just hang up on me. I won't be offended.",
        tip: "Empathize first, then flip it. Their busy-ness is the reason they need this, not the reason to delay.",
        category: 'timing'
    },
    {
        objection: "Send me some information first",
        response: "Sure, I could email you some brochures, [NAME]. But honestly? Every [INDUSTRY] business is different.\n\nYour [UNIQUE ASPECTS] are totally unique to you. A generic PDF can't show you how this would actually work in YOUR business.\n\nHere's what I'll do—let me show you the live system first, tailored to your situation. Then if you want all the documentation, I'll send you everything.\n\nAt least then the documents will actually make sense to you. Fair enough?",
        tip: "Generic info is worthless. Position the demo as MORE valuable than docs. Offer docs AFTER, not before.",
        category: 'trust'
    },
    {
        objection: "We already have a system",
        response: "Interesting! Quick question—can your current system deploy updates in 14 days, or are you waiting weeks or months for changes and fixes?\n\n[Listen]\n\nThat's the problem we solve. Look, I'm not asking you to drop your current system tomorrow. I'm just asking for 15 minutes to show you what we do differently. Then you can compare apples to apples.\n\nIf what you have is better, great—at least you'll know for sure.",
        tip: "Don't attack their current system. Challenge it with a specific question, then position yourself as one option to compare.",
        category: 'need'
    },
    {
        objection: "I need to talk to my partner first",
        response: "Of course, [NAME]. That makes total sense—this affects everyone.\n\nWhat specifically would you need to discuss with them? Is it more about the cost, or the timeline, or how it would work with your current setup?\n\n[Listen]\n\nHere's a thought—instead of you trying to explain everything to them, what if we just included them in the demo? That way you both see the same thing, can ask questions together, and make the decision as a team.\n\nWould your partner be available for [TIME 1] or [TIME 2]?",
        tip: "Include the decision-maker instead of having the prospect explain it. Group calls convert better.",
        category: 'authority'
    },
    {
        objection: "I'm already looking at other options",
        response: "Smart move, [NAME]. You should definitely shop around for something this important.\n\nCan I ask—what kind of timeline are they giving you? How long until you'd actually be up and running?\n\n[Listen]\n\nHere's what I've noticed—most traditional consultants love long implementations because that's how they bill more hours. We're the opposite. We want you self-sufficient as quickly as possible.\n\nLook, I'm not asking you to drop everyone else. I'm just asking for 15 minutes to show you what we do differently.",
        tip: "Collaborative, not competitive. Position yourself as helping them make a better comparison.",
        category: 'trust'
    },
    {
        objection: "We're happy with Excel/current process",
        response: "If you're happy, that's great. But just so you know—your competitors aren't waiting. They're deploying in 14 days and scaling without hiring sprees.\n\nWhen that hits your market share, remember this call.\n\n15 minutes could save you months of regret. Last chance: [TIME 1] or [TIME 2]?",
        tip: "Final warning shot. Use competitor fear to create urgency. Bold move but sometimes necessary.",
        category: 'need'
    },
    {
        objection: "This isn't a priority right now",
        response: "I get it. But there's never a 'perfect' time. The question is: How much does waiting cost you?\n\n[THEIR PAIN COST] daily adds up fast. In 90 days, that's [QUARTERLY COST] gone forever.\n\nYour competitors who act TODAY will have a 6-month head start on you.\n\nLast chance: 15 minutes. [TIME 1] or [TIME 2]?",
        tip: "Quantify the cost of waiting. Make inaction painful.",
        category: 'timing'
    },
    {
        objection: "We've tried this before and it didn't work",
        response: "That's exactly why we're different. Who did you try? What happened?\n\n[Listen to their story]\n\nLet me guess—they took months, cost a fortune, and you still needed consultants for everything?\n\nThat's the OLD way. We deploy in 14 days, 40% cheaper, with AI support so you're independent.\n\nThree of your competitors tried the old way, failed, then came to us. Now they're thriving.\n\n15 minutes to see the difference. Fair?",
        tip: "Turn past failure into opportunity. Show you're different with specific contrasts.",
        category: 'trust'
    },
    {
        objection: "I don't have the budget",
        response: "Mr. [NAME], fair enough. Let me ask you this: What's the ideal price for you to stop bleeding [MONTHLY COST] every month?\n\n[They'll give a number]\n\nGot it. And if I could show you how to START with a smaller package and scale up—or spread payments over 3 months—would you at least want to SEE the options?\n\nThe demo costs you nothing. The decision to move forward comes AFTER you see the value. Fair?",
        tip: "Offer flexibility. Get them to commit to SEEING options, not buying yet.",
        category: 'price'
    }
];
export default function InlineObjectionHandler({ industry, prospectName = '[NAME]', compact = false }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [copiedId, setCopiedId] = useState(null);
    const categories = [
        { key: 'price', label: 'Price', icon: '💰', color: 'bg-green-100 text-green-800' },
        { key: 'timing', label: 'Timing', icon: '⏰', color: 'bg-yellow-100 text-yellow-800' },
        { key: 'trust', label: 'Trust', icon: '🤝', color: 'bg-blue-100 text-blue-800' },
        { key: 'need', label: 'Need', icon: '🎯', color: 'bg-purple-100 text-purple-800' },
        { key: 'authority', label: 'Authority', icon: '👥', color: 'bg-orange-100 text-orange-800' }
    ];
    const filteredObjections = objectionDatabase.filter(obj => {
        const matchesSearch = searchQuery === '' ||
            obj.objection.toLowerCase().includes(searchQuery.toLowerCase()) ||
            obj.response.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === null || obj.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });
    const copyToClipboard = (text, objection) => {
        // Replace placeholders with actual values
        const processedText = text
            .replace(/\[NAME\]/g, prospectName)
            .replace(/\[INDUSTRY\]/g, industry);
        navigator.clipboard.writeText(processedText);
        setCopiedId(objection);
        toast.success('Response copied to clipboard!');
        setTimeout(() => setCopiedId(null), 2000);
    };
    if (compact) {
        return (_jsxs(Card, { className: "p-3", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: () => setIsExpanded(!isExpanded), className: "w-full justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Warning, { className: "h-4 w-4 text-yellow-600", weight: "fill" }), _jsx("span", { className: "font-medium", children: "Objection Helper" }), _jsxs(Badge, { variant: "secondary", className: "text-xs", children: [objectionDatabase.length, " responses"] })] }), isExpanded ? _jsx(CaretUp, {}) : _jsx(CaretDown, {})] }), isExpanded && (_jsxs("div", { className: "mt-3 space-y-2", children: [_jsx(Input, { placeholder: "Search objections...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "h-8 text-sm" }), _jsx(ScrollArea, { className: "h-[200px]", children: _jsx("div", { className: "space-y-2", children: filteredObjections.map((obj, index) => (_jsxs("div", { className: "p-2 border rounded text-xs hover:bg-muted/50 cursor-pointer", onClick: () => copyToClipboard(obj.response, obj.objection), children: [_jsx("div", { className: "font-medium mb-1", children: obj.objection }), _jsx("div", { className: "text-muted-foreground line-clamp-2", children: obj.response.split('\n')[0] })] }, index))) }) })] }))] }));
    }
    return (_jsxs(Card, { className: "overflow-hidden", children: [_jsxs("div", { className: "flex items-center justify-between p-3 bg-yellow-50 border-b border-yellow-200 cursor-pointer hover:bg-yellow-100 transition-colors", onClick: () => setIsExpanded(!isExpanded), children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Warning, { className: "h-5 w-5 text-yellow-600", weight: "fill" }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-sm", children: "Objection Handler" }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [objectionDatabase.length, " proven responses ready"] })] })] }), _jsx(Button, { variant: "ghost", size: "sm", className: "h-7 w-7 p-0", onClick: (e) => {
                            e.stopPropagation();
                            setIsExpanded(!isExpanded);
                        }, children: isExpanded ? _jsx(CaretUp, {}) : _jsx(CaretDown, {}) })] }), isExpanded && (_jsxs("div", { className: "p-4 space-y-4", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "relative", children: [_jsx(MagnifyingGlass, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), _jsx(Input, { placeholder: "Search objections...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "pl-9" })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Button, { size: "sm", variant: selectedCategory === null ? 'default' : 'outline', onClick: () => setSelectedCategory(null), className: "h-7 text-xs", children: "All" }), categories.map(cat => (_jsxs(Button, { size: "sm", variant: selectedCategory === cat.key ? 'default' : 'outline', onClick: () => setSelectedCategory(cat.key === selectedCategory ? null : cat.key), className: "h-7 text-xs", children: [cat.icon, " ", cat.label] }, cat.key)))] })] }), _jsx(ScrollArea, { className: "h-[400px]", children: _jsxs("div", { className: "space-y-3", children: [filteredObjections.map((obj, index) => {
                                    const category = categories.find(c => c.key === obj.category);
                                    const isCopied = copiedId === obj.objection;
                                    return (_jsx(Card, { className: "p-4 hover:shadow-md transition-shadow", children: _jsxs("div", { className: "flex items-start justify-between gap-3 mb-3", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsxs("h4", { className: "font-medium text-sm", children: ["\"", obj.objection, "\""] }), category && (_jsxs(Badge, { variant: "outline", className: `text-xs ${category.color}`, children: [category.icon, " ", category.label] }))] }), _jsx("div", { className: "text-sm text-muted-foreground whitespace-pre-wrap bg-muted/30 rounded p-3 mb-2", children: obj.response.replace(/\[NAME\]/g, prospectName).replace(/\[INDUSTRY\]/g, industry) }), _jsxs("div", { className: "flex items-start gap-2 text-xs bg-blue-50 border border-blue-200 rounded p-2", children: [_jsx(Lightbulb, { className: "h-3 w-3 text-blue-600 mt-0.5 shrink-0", weight: "fill" }), _jsx("span", { className: "text-blue-900", children: obj.tip })] })] }), _jsx(Button, { size: "sm", variant: isCopied ? 'default' : 'outline', onClick: () => copyToClipboard(obj.response, obj.objection), className: "shrink-0", children: isCopied ? (_jsxs(_Fragment, { children: [_jsx(CheckCircle, { className: "h-4 w-4 mr-1", weight: "fill" }), "Copied!"] })) : (_jsxs(_Fragment, { children: [_jsx(Copy, { className: "h-4 w-4 mr-1" }), "Copy"] })) })] }) }, index));
                                }), filteredObjections.length === 0 && (_jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [_jsx(Target, { className: "h-12 w-12 mx-auto mb-2 opacity-50" }), _jsxs("p", { children: ["No objections found matching \"", searchQuery, "\""] })] }))] }) }), _jsxs("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs space-y-1", children: [_jsxs("div", { className: "font-medium text-yellow-900 flex items-center gap-1", children: [_jsx(Warning, { className: "h-3 w-3", weight: "fill" }), "Pro Tips for Handling Objections"] }), _jsxs("ul", { className: "text-yellow-800 space-y-1 ml-4 list-disc", children: [_jsx("li", { children: "Listen fully before responding\u2014don't interrupt" }), _jsx("li", { children: "Acknowledge their concern first (\"I totally get that...\")" }), _jsx("li", { children: "Use their own words and pain points in your response" }), _jsx("li", { children: "Click \"Copy\" to quickly paste the response during your call" })] })] })] }))] }));
}
