/**
 * WebSocket Connection Manager
 * Provides real-time communication with auto-reconnection
 */
import { logger } from './logger';
class WebSocketManager {
    constructor() {
        Object.defineProperty(this, "ws", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "url", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ''
        });
        Object.defineProperty(this, "reconnectAttempts", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "maxReconnectAttempts", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 5
        });
        Object.defineProperty(this, "reconnectDelay", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1000
        }); // Start at 1 second
        Object.defineProperty(this, "messageHandlers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set()
        });
        Object.defineProperty(this, "statusHandlers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set()
        });
        Object.defineProperty(this, "currentStatus", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'disconnected'
        });
        Object.defineProperty(this, "heartbeatInterval", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "reconnectTimeout", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
    }
    /**
     * Initialize WebSocket connection
     */
    connect(url, token) {
        this.url = url;
        this.setStatus('connecting');
        try {
            // Add auth token to WebSocket URL if provided
            const wsUrl = token ? `${url}?token=${token}` : url;
            this.ws = new WebSocket(wsUrl);
            this.ws.onopen = this.handleOpen.bind(this);
            this.ws.onmessage = this.handleMessage.bind(this);
            this.ws.onerror = this.handleError.bind(this);
            this.ws.onclose = this.handleClose.bind(this);
            logger.info('WebSocket connection initiated', { url });
        }
        catch (error) {
            logger.error('Failed to create WebSocket connection', error);
            this.setStatus('error');
            this.attemptReconnect();
        }
    }
    /**
     * Handle connection opened
     */
    handleOpen() {
        logger.info('WebSocket connected');
        this.setStatus('connected');
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        this.startHeartbeat();
    }
    /**
     * Handle incoming messages
     */
    handleMessage(event) {
        try {
            const message = JSON.parse(event.data);
            logger.debug('WebSocket message received', { type: message.type });
            // Broadcast to all handlers
            this.messageHandlers.forEach(handler => {
                try {
                    handler(message);
                }
                catch (error) {
                    logger.error('Error in message handler', error);
                }
            });
        }
        catch (error) {
            logger.error('Failed to parse WebSocket message', error);
        }
    }
    /**
     * Handle connection errors
     */
    handleError(event) {
        logger.error('WebSocket error', event);
        this.setStatus('error');
    }
    /**
     * Handle connection closed
     */
    handleClose(event) {
        logger.warn('WebSocket closed', {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean
        });
        this.setStatus('disconnected');
        this.stopHeartbeat();
        // Attempt reconnection unless closed cleanly
        if (!event.wasClean) {
            this.attemptReconnect();
        }
    }
    /**
     * Attempt to reconnect with exponential backoff
     */
    attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            logger.error('Max reconnection attempts reached');
            this.setStatus('error');
            return;
        }
        this.reconnectAttempts++;
        const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);
        logger.info(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.reconnectTimeout = window.setTimeout(() => {
            logger.info('Attempting reconnection...');
            this.connect(this.url);
        }, delay);
    }
    /**
     * Send message to server
     */
    send(message) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            logger.warn('Cannot send message: WebSocket not connected');
            return false;
        }
        try {
            const fullMessage = {
                type: message.type || 'notification',
                payload: message.payload,
                timestamp: new Date().toISOString(),
                userId: message.userId,
            };
            this.ws.send(JSON.stringify(fullMessage));
            logger.debug('WebSocket message sent', { type: fullMessage.type });
            return true;
        }
        catch (error) {
            logger.error('Failed to send WebSocket message', error);
            return false;
        }
    }
    /**
     * Subscribe to messages
     */
    onMessage(handler) {
        this.messageHandlers.add(handler);
        // Return unsubscribe function
        return () => {
            this.messageHandlers.delete(handler);
        };
    }
    /**
     * Subscribe to connection status changes
     */
    onStatusChange(handler) {
        this.statusHandlers.add(handler);
        // Immediately call with current status
        handler(this.currentStatus);
        // Return unsubscribe function
        return () => {
            this.statusHandlers.delete(handler);
        };
    }
    /**
     * Update connection status and notify listeners
     */
    setStatus(status) {
        if (this.currentStatus === status)
            return;
        this.currentStatus = status;
        this.statusHandlers.forEach(handler => {
            try {
                handler(status);
            }
            catch (error) {
                logger.error('Error in status handler', error);
            }
        });
    }
    /**
     * Get current connection status
     */
    getStatus() {
        return this.currentStatus;
    }
    /**
     * Start heartbeat to keep connection alive
     */
    startHeartbeat() {
        this.stopHeartbeat();
        this.heartbeatInterval = window.setInterval(() => {
            if (this.ws?.readyState === WebSocket.OPEN) {
                this.send({ type: 'notification', payload: { heartbeat: true } });
            }
        }, 30000); // Every 30 seconds
    }
    /**
     * Stop heartbeat
     */
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }
    /**
     * Disconnect WebSocket
     */
    disconnect() {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
        this.stopHeartbeat();
        if (this.ws) {
            this.ws.close(1000, 'Client disconnect');
            this.ws = null;
        }
        this.setStatus('disconnected');
        logger.info('WebSocket disconnected');
    }
    /**
     * Check if connected
     */
    isConnected() {
        return this.ws?.readyState === WebSocket.OPEN;
    }
}
// Singleton instance
export const websocketManager = new WebSocketManager();
// Export for testing
export { WebSocketManager };
