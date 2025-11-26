import { jsx as _jsx } from "react/jsx-runtime";
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from "react-error-boundary";
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App.tsx';
import { ErrorFallback } from './ErrorFallback.tsx';
import { getEnv } from './lib/env';
import { logger } from './lib/logger';
import "./main.css";
import "./styles/theme.css";
import "./index.css";
// Validate environment variables on startup
let env;
try {
    env = getEnv();
    logger.info('Application starting', {
        metadata: {
            environment: env.ENVIRONMENT,
            hasAI: !!(env.OPENAI_API_KEY || env.OLLAMA_BASE_URL),
        }
    });
}
catch (error) {
    logger.error('Failed to validate environment', error);
    throw error;
}
createRoot(document.getElementById('root')).render(_jsx(ErrorBoundary, { FallbackComponent: ErrorFallback, children: _jsx(ClerkProvider, { publishableKey: env.CLERK_PUBLISHABLE_KEY, children: _jsx(App, {}) }) }));
