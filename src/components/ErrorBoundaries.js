import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Component-specific error boundaries for graceful degradation
 */
import { Component } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Warning, ArrowClockwise, Phone, Robot, Users } from '@phosphor-icons/react';
import { logger } from '@/lib/logger';
/**
 * Base error boundary class
 */
class BaseErrorBoundary extends Component {
    constructor(props) {
        super(props);
        Object.defineProperty(this, "handleReset", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                this.setState({
                    hasError: false,
                    error: null,
                    errorInfo: null,
                });
                if (this.props.onReset) {
                    this.props.onReset();
                }
            }
        });
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }
    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error,
        };
    }
    componentDidCatch(error, errorInfo) {
        const componentName = this.props.componentName || 'Unknown Component';
        logger.error(`Error in ${componentName}`, error, {
            component: componentName,
            metadata: {
                componentStack: errorInfo.componentStack,
            },
        });
        this.setState({
            error,
            errorInfo,
        });
    }
    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return this.renderDefaultFallback();
        }
        return this.props.children;
    }
    renderDefaultFallback() {
        return (_jsxs(Alert, { variant: "destructive", className: "m-4", children: [_jsx(Warning, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "Something went wrong" }), _jsxs(AlertDescription, { className: "mt-2", children: [_jsx("p", { className: "mb-3", children: this.state.error?.message || 'An unexpected error occurred in this component.' }), _jsxs(Button, { onClick: this.handleReset, variant: "outline", size: "sm", className: "gap-2", children: [_jsx(ArrowClockwise, { className: "h-4 w-4" }), "Try Again"] })] })] }));
    }
}
/**
 * Error boundary specifically for Call-related components
 */
export class CallErrorBoundary extends BaseErrorBoundary {
    renderDefaultFallback() {
        return (_jsxs(Card, { className: "m-4 border-destructive", children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Phone, { className: "h-5 w-5 text-destructive" }), _jsx(CardTitle, { children: "Call Feature Unavailable" })] }), _jsx(CardDescription, { children: "The call feature encountered an error and couldn't load properly." })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [import.meta.env.DEV && this.state.error && (_jsx(Alert, { children: _jsx(AlertDescription, { className: "text-xs font-mono", children: this.state.error.message }) })), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { onClick: this.handleReset, variant: "default", size: "sm", className: "gap-2", children: [_jsx(ArrowClockwise, { className: "h-4 w-4" }), "Reload Call Interface"] }), _jsx(Button, { onClick: () => window.location.reload(), variant: "outline", size: "sm", children: "Refresh Page" })] })] }) })] }));
    }
}
/**
 * Error boundary for AI-powered features
 */
export class AIErrorBoundary extends BaseErrorBoundary {
    renderDefaultFallback() {
        return (_jsxs(Card, { className: "m-4 border-orange-500", children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Robot, { className: "h-5 w-5 text-orange-500" }), _jsx(CardTitle, { children: "AI Feature Unavailable" })] }), _jsx(CardDescription, { children: "The AI assistant encountered an error. You can continue without AI features." })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "This might be due to:" }), _jsxs("ul", { className: "list-disc list-inside text-sm text-muted-foreground space-y-1", children: [_jsx("li", { children: "Missing or invalid API configuration" }), _jsx("li", { children: "Network connectivity issues" }), _jsx("li", { children: "Service temporarily unavailable" })] }), import.meta.env.DEV && this.state.error && (_jsx(Alert, { children: _jsx(AlertDescription, { className: "text-xs font-mono", children: this.state.error.message }) })), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { onClick: this.handleReset, variant: "default", size: "sm", className: "gap-2", children: [_jsx(ArrowClockwise, { className: "h-4 w-4" }), "Retry AI Features"] }), _jsx(Button, { onClick: () => {
                                            this.handleReset();
                                            if (this.props.onReset)
                                                this.props.onReset();
                                        }, variant: "outline", size: "sm", children: "Continue Without AI" })] })] }) })] }));
    }
}
/**
 * Error boundary for Lead Management features
 */
export class LeadErrorBoundary extends BaseErrorBoundary {
    renderDefaultFallback() {
        return (_jsxs(Card, { className: "m-4 border-destructive", children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Users, { className: "h-5 w-5 text-destructive" }), _jsx(CardTitle, { children: "Lead Management Error" })] }), _jsx(CardDescription, { children: "Unable to load lead management features." })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Your data is safe. Try refreshing to restore functionality." }), import.meta.env.DEV && this.state.error && (_jsx(Alert, { children: _jsx(AlertDescription, { className: "text-xs font-mono", children: this.state.error.message }) })), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { onClick: this.handleReset, variant: "default", size: "sm", className: "gap-2", children: [_jsx(ArrowClockwise, { className: "h-4 w-4" }), "Reload Leads"] }), _jsx(Button, { onClick: () => window.location.reload(), variant: "outline", size: "sm", children: "Refresh Page" })] })] }) })] }));
    }
}
/**
 * Generic error boundary with custom fallback support
 */
export class ComponentErrorBoundary extends BaseErrorBoundary {
}
// Export a HOC wrapper for easier use
export function withErrorBoundary(Component, boundaryProps) {
    return function WithErrorBoundaryWrapper(props) {
        return (_jsx(ComponentErrorBoundary, { ...boundaryProps, children: _jsx(Component, { ...props }) }));
    };
}
