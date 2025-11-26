import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Empty State Components
 * Provides helpful guidance when no data is available
 */
import { Button } from '@/components/ui/button';
import { PhoneCall, Users, ChartBar, Books, Plus, ArrowRight } from '@phosphor-icons/react';
export function EmptyState({ icon, title, description, action, secondaryAction }) {
    return (_jsxs("div", { className: "flex flex-col items-center justify-center min-h-[400px] text-center p-6 animate-in fade-in zoom-in-95 duration-300", children: [icon && (_jsx("div", { className: "rounded-full bg-gradient-to-br from-blue-50 to-blue-100 p-6 mb-4 shadow-sm", children: icon })), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: title }), _jsx("p", { className: "text-muted-foreground mb-6 max-w-sm", children: description }), action && (_jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [_jsxs(Button, { size: "lg", onClick: action.onClick, className: "shadow-sm", children: [action.icon || _jsx(Plus, { className: "mr-2 h-4 w-4" }), action.label] }), secondaryAction && (_jsxs(Button, { size: "lg", variant: "outline", onClick: secondaryAction.onClick, children: [secondaryAction.label, _jsx(ArrowRight, { className: "ml-2 h-4 w-4" })] }))] }))] }));
}
// Specialized empty states for common scenarios
export function EmptyCallsState({ onStartCall }) {
    return (_jsx(EmptyState, { icon: _jsx(PhoneCall, { className: "h-12 w-12 text-blue-600", weight: "duotone" }), title: "No calls yet", description: "Start making calls to track your conversations, record insights, and build your sales pipeline.", action: {
            label: "Make First Call",
            onClick: onStartCall,
            icon: _jsx(PhoneCall, { className: "mr-2 h-4 w-4" })
        }, secondaryAction: {
            label: "View Tutorial",
            onClick: () => console.log('Tutorial')
        } }));
}
export function EmptyLeadsState({ onAddLead }) {
    return (_jsx(EmptyState, { icon: _jsx(Users, { className: "h-12 w-12 text-purple-600", weight: "duotone" }), title: "No leads yet", description: "Add your first lead to start tracking prospects, managing follow-ups, and closing deals.", action: {
            label: "Add First Lead",
            onClick: onAddLead,
            icon: _jsx(Plus, { className: "mr-2 h-4 w-4" })
        }, secondaryAction: {
            label: "Import Leads",
            onClick: () => console.log('Import')
        } }));
}
export function EmptyAnalyticsState() {
    return (_jsx(EmptyState, { icon: _jsx(ChartBar, { className: "h-12 w-12 text-teal-600", weight: "duotone" }), title: "Not enough data", description: "Analytics will appear here once you've made calls and added leads. Start building your pipeline to see insights." }));
}
export function EmptyScriptsState({ onCreateScript }) {
    return (_jsx(EmptyState, { icon: _jsx(Books, { className: "h-12 w-12 text-orange-600", weight: "duotone" }), title: "No scripts yet", description: "Create your first sales script to practice your pitch and improve your calling technique.", action: {
            label: "Create Script",
            onClick: onCreateScript,
            icon: _jsx(Plus, { className: "mr-2 h-4 w-4" })
        } }));
}
// Generic search/filter empty state
export function EmptySearchState({ searchTerm }) {
    return (_jsxs("div", { className: "flex flex-col items-center justify-center min-h-[300px] text-center p-6", children: [_jsx("div", { className: "rounded-full bg-gray-100 p-4 mb-4", children: _jsx("svg", { className: "h-8 w-8 text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }) }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No results found" }), _jsxs("p", { className: "text-sm text-gray-500 mb-4", children: ["No results for \"", _jsx("span", { className: "font-medium", children: searchTerm }), "\". Try adjusting your search."] })] }));
}
// Error state (different from empty)
export function ErrorState({ title, description, onRetry }) {
    return (_jsxs("div", { className: "flex flex-col items-center justify-center min-h-[400px] text-center p-6", children: [_jsx("div", { className: "rounded-full bg-red-50 p-6 mb-4", children: _jsx("svg", { className: "h-12 w-12 text-red-600", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }) }) }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: title || "Something went wrong" }), _jsx("p", { className: "text-muted-foreground mb-6 max-w-sm", children: description || "We encountered an error loading this data. Please try again." }), onRetry && (_jsx(Button, { onClick: onRetry, variant: "outline", children: "Try Again" }))] }));
}
