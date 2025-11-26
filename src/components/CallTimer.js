import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Clock } from '@phosphor-icons/react';
import { formatDuration } from '@/lib/callUtils';
export default function CallTimer({ startTime, isActive }) {
    const [elapsed, setElapsed] = useState(0);
    useEffect(() => {
        if (!isActive)
            return;
        const interval = setInterval(() => {
            setElapsed(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [startTime, isActive]);
    return (_jsxs("div", { className: "flex items-center gap-2 text-lg font-semibold", children: [_jsx(Clock, { weight: "fill", className: "h-5 w-5 text-primary" }), _jsx("span", { className: "font-mono", children: formatDuration(elapsed) })] }));
}
