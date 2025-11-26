/**
 * Component-specific error boundaries for graceful degradation
 */

import { Component, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Warning, ArrowClockwise, Phone, Robot, Users } from '@phosphor-icons/react';
import { logger } from '@/lib/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  componentName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Base error boundary class
 */
class BaseErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    const componentName = this.props.componentName || 'Unknown Component';
    
    logger.error(
      `Error in ${componentName}`,
      error,
      {
        component: componentName,
        metadata: {
          componentStack: errorInfo.componentStack,
        },
      }
    );

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return this.renderDefaultFallback();
    }

    return this.props.children;
  }

  renderDefaultFallback(): ReactNode {
    return (
      <Alert variant="destructive" className="m-4">
        <Warning className="h-4 w-4" />
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-3">
            {this.state.error?.message || 'An unexpected error occurred in this component.'}
          </p>
          <Button
            onClick={this.handleReset}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <ArrowClockwise className="h-4 w-4" />
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
}

/**
 * Error boundary specifically for Call-related components
 */
export class CallErrorBoundary extends BaseErrorBoundary {
  renderDefaultFallback(): ReactNode {
    return (
      <Card className="m-4 border-destructive">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-destructive" />
            <CardTitle>Call Feature Unavailable</CardTitle>
          </div>
          <CardDescription>
            The call feature encountered an error and couldn't load properly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {import.meta.env.DEV && this.state.error && (
              <Alert>
                <AlertDescription className="text-xs font-mono">
                  {this.state.error.message}
                </AlertDescription>
              </Alert>
            )}
            <div className="flex gap-2">
              <Button
                onClick={this.handleReset}
                variant="default"
                size="sm"
                className="gap-2"
              >
                <ArrowClockwise className="h-4 w-4" />
                Reload Call Interface
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
              >
                Refresh Page
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
}

/**
 * Error boundary for AI-powered features
 */
export class AIErrorBoundary extends BaseErrorBoundary {
  renderDefaultFallback(): ReactNode {
    return (
      <Card className="m-4 border-orange-500">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Robot className="h-5 w-5 text-orange-500" />
            <CardTitle>AI Feature Unavailable</CardTitle>
          </div>
          <CardDescription>
            The AI assistant encountered an error. You can continue without AI features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              This might be due to:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Missing or invalid API configuration</li>
              <li>Network connectivity issues</li>
              <li>Service temporarily unavailable</li>
            </ul>
            {import.meta.env.DEV && this.state.error && (
              <Alert>
                <AlertDescription className="text-xs font-mono">
                  {this.state.error.message}
                </AlertDescription>
              </Alert>
            )}
            <div className="flex gap-2">
              <Button
                onClick={this.handleReset}
                variant="default"
                size="sm"
                className="gap-2"
              >
                <ArrowClockwise className="h-4 w-4" />
                Retry AI Features
              </Button>
              <Button
                onClick={() => {
                  this.handleReset();
                  if (this.props.onReset) this.props.onReset();
                }}
                variant="outline"
                size="sm"
              >
                Continue Without AI
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
}

/**
 * Error boundary for Lead Management features
 */
export class LeadErrorBoundary extends BaseErrorBoundary {
  renderDefaultFallback(): ReactNode {
    return (
      <Card className="m-4 border-destructive">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-destructive" />
            <CardTitle>Lead Management Error</CardTitle>
          </div>
          <CardDescription>
            Unable to load lead management features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Your data is safe. Try refreshing to restore functionality.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <Alert>
                <AlertDescription className="text-xs font-mono">
                  {this.state.error.message}
                </AlertDescription>
              </Alert>
            )}
            <div className="flex gap-2">
              <Button
                onClick={this.handleReset}
                variant="default"
                size="sm"
                className="gap-2"
              >
                <ArrowClockwise className="h-4 w-4" />
                Reload Leads
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
              >
                Refresh Page
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
}

/**
 * Generic error boundary with custom fallback support
 */
export class ComponentErrorBoundary extends BaseErrorBoundary {}

// Export a HOC wrapper for easier use
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  boundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  return function WithErrorBoundaryWrapper(props: P) {
    return (
      <ComponentErrorBoundary {...boundaryProps}>
        <Component {...props} />
      </ComponentErrorBoundary>
    );
  };
}
