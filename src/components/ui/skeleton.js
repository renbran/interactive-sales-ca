import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "@/lib/utils";
function Skeleton({ className, ...props }) {
    return (_jsx("div", { "data-slot": "skeleton", className: cn("bg-accent animate-pulse rounded-md", className), ...props }));
}
// Specialized skeleton components for common patterns
export function CardSkeleton() {
    return (_jsxs("div", { className: "rounded-lg border bg-white p-6 space-y-4", children: [_jsx(Skeleton, { className: "h-4 w-3/4" }), _jsx(Skeleton, { className: "h-4 w-1/2" }), _jsx(Skeleton, { className: "h-4 w-5/6" })] }));
}
export function TableSkeleton({ rows = 5 }) {
    return (_jsx("div", { className: "space-y-3", children: Array.from({ length: rows }).map((_, i) => (_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx(Skeleton, { className: "h-12 w-12 rounded-full" }), _jsxs("div", { className: "space-y-2 flex-1", children: [_jsx(Skeleton, { className: "h-4 w-full" }), _jsx(Skeleton, { className: "h-3 w-3/4" })] })] }, i))) }));
}
export function MetricCardSkeleton() {
    return (_jsxs("div", { className: "rounded-lg border bg-white p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx(Skeleton, { className: "h-4 w-24" }), _jsx(Skeleton, { className: "h-5 w-5 rounded" })] }), _jsx(Skeleton, { className: "h-8 w-20 mb-2" }), _jsx(Skeleton, { className: "h-3 w-32" })] }));
}
export function AnalyticsDashboardSkeleton() {
    return (_jsxs("div", { className: "p-4 md:p-6 space-y-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Skeleton, { className: "h-8 w-48" }), _jsx(Skeleton, { className: "h-4 w-64" })] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: Array.from({ length: 4 }).map((_, i) => (_jsx(MetricCardSkeleton, {}, i))) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4", children: [_jsx(CardSkeleton, {}), _jsx(CardSkeleton, {})] })] }));
}
export { Skeleton };
