/**
 * Production-safe logging utility
 * Only logs in development environment to avoid console spam in production
 */
const isDevelopment = import.meta.env.DEV;
class Logger {
    formatMessage(level, message, context) {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
        if (context?.component) {
            return `${prefix} [${context.component}] ${message}`;
        }
        return `${prefix} ${message}`;
    }
    /**
     * Debug-level logging - only in development
     */
    debug(message, context) {
        if (isDevelopment) {
            console.debug(this.formatMessage('debug', message, context), context?.metadata || '');
        }
    }
    /**
     * Info-level logging - only in development
     */
    info(message, context) {
        if (isDevelopment) {
            console.log(this.formatMessage('info', message, context), context?.metadata || '');
        }
    }
    /**
     * Warning-level logging - always logged
     */
    warn(message, context) {
        console.warn(this.formatMessage('warn', message, context), context?.metadata || '');
    }
    /**
     * Error-level logging - always logged
     */
    error(message, error, context) {
        const formattedMessage = this.formatMessage('error', message, context);
        if (error instanceof Error) {
            console.error(formattedMessage, {
                message: error.message,
                stack: isDevelopment ? error.stack : undefined,
                ...context?.metadata,
            });
        }
        else {
            console.error(formattedMessage, error, context?.metadata || '');
        }
    }
    /**
     * Log API requests - only in development
     */
    apiRequest(method, url, status) {
        if (isDevelopment) {
            const statusText = status ? `[${status}]` : '';
            this.debug(`API ${method} ${statusText} ${url}`, {
                component: 'API',
                metadata: { method, url, status },
            });
        }
    }
    /**
     * Log API errors - always logged
     */
    apiError(method, url, status, error) {
        this.error(`API ${method} failed [${status}] ${url}`, error instanceof Error ? error : new Error(String(error)), { component: 'API', metadata: { method, url, status } });
    }
    /**
     * Performance logging - only in development
     */
    perf(label, startTime) {
        if (isDevelopment) {
            const duration = performance.now() - startTime;
            this.debug(`⏱️ ${label}: ${duration.toFixed(2)}ms`, {
                component: 'Performance',
                metadata: { duration },
            });
        }
    }
    /**
     * Group logging for better organization - only in development
     */
    group(label, callback) {
        if (isDevelopment) {
            console.group(label);
            callback();
            console.groupEnd();
        }
    }
}
// Export singleton instance
export const logger = new Logger();
// Export for testing
export { Logger };
