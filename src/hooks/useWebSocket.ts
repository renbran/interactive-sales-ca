/**
 * React hooks for WebSocket functionality
 * Provides easy-to-use hooks for real-time features
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { websocketManager, WebSocketMessage, ConnectionStatus } from '@/lib/websocket';
import { getEnv } from '@/lib/env';
import { logger } from '@/lib/logger';
import { useAuth } from '@clerk/clerk-react';

/**
 * Hook to manage WebSocket connection lifecycle
 */
export function useWebSocket() {
  const { getToken } = useAuth();
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const isInitialized = useRef(false);

  useEffect(() => {
    // Only initialize once
    if (isInitialized.current) return;

    const initConnection = async () => {
      try {
        const wsUrl = getEnv('VITE_WS_URL', 'ws://localhost:8787/ws');
        const token = await getToken();
        
        websocketManager.connect(wsUrl, token || undefined);
        isInitialized.current = true;
        
        logger.info('WebSocket connection initialized');
      } catch (error) {
        logger.error('Failed to initialize WebSocket', error);
      }
    };

    initConnection();

    // Subscribe to status changes
    const unsubscribe = websocketManager.onStatusChange(setStatus);

    return () => {
      unsubscribe();
      // Don't disconnect on unmount - keep connection alive for app lifetime
    };
  }, [getToken]);

  const send = useCallback((message: Partial<WebSocketMessage>) => {
    return websocketManager.send(message);
  }, []);

  const disconnect = useCallback(() => {
    websocketManager.disconnect();
  }, []);

  return {
    status,
    send,
    disconnect,
    isConnected: status === 'connected',
  };
}

/**
 * Hook to listen for specific message types
 */
export function useWebSocketMessages<T = any>(
  messageType: WebSocketMessage['type'] | WebSocketMessage['type'][],
  handler: (payload: T, message: WebSocketMessage) => void,
  deps: any[] = []
) {
  const handlerRef = useRef(handler);
  
  // Keep handler reference up to date
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const types = Array.isArray(messageType) ? messageType : [messageType];
    
    const unsubscribe = websocketManager.onMessage((message) => {
      if (types.includes(message.type)) {
        handlerRef.current(message.payload, message);
      }
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageType, ...deps]);
}

/**
 * Hook for real-time call updates
 */
export function useRealtimeCallUpdates(
  onCallStarted?: (data: any) => void,
  onCallEnded?: (data: any) => void
) {
  useWebSocketMessages('call_started', (payload) => {
    logger.debug('Call started event received', payload);
    onCallStarted?.(payload);
  }, [onCallStarted]);

  useWebSocketMessages('call_ended', (payload) => {
    logger.debug('Call ended event received', payload);
    onCallEnded?.(payload);
  }, [onCallEnded]);
}

/**
 * Hook for real-time lead updates
 */
export function useRealtimeLeadUpdates(
  onLeadCreated?: (data: any) => void,
  onLeadUpdated?: (data: any) => void
) {
  useWebSocketMessages('lead_created', (payload) => {
    logger.debug('Lead created event received', payload);
    onLeadCreated?.(payload);
  }, [onLeadCreated]);

  useWebSocketMessages('lead_updated', (payload) => {
    logger.debug('Lead updated event received', payload);
    onLeadUpdated?.(payload);
  }, [onLeadUpdated]);
}

/**
 * Hook for team presence (who's online)
 */
export function useTeamPresence() {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useWebSocketMessages('user_joined', (payload: { userId: string; userName: string }) => {
    logger.debug('User joined', payload);
    setOnlineUsers(prev => [...new Set([...prev, payload.userId])]);
  });

  useWebSocketMessages('user_left', (payload: { userId: string }) => {
    logger.debug('User left', payload);
    setOnlineUsers(prev => prev.filter(id => id !== payload.userId));
  });

  return { onlineUsers };
}

/**
 * Hook for real-time notifications
 */
export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<WebSocketMessage[]>([]);

  useWebSocketMessages('notification', (payload, message) => {
    // Skip heartbeat messages
    if (payload.heartbeat) return;
    
    logger.debug('Notification received', payload);
    setNotifications(prev => [message, ...prev].slice(0, 50)); // Keep last 50
  });

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const removeNotification = useCallback((timestamp: string) => {
    setNotifications(prev => prev.filter(n => n.timestamp !== timestamp));
  }, []);

  return {
    notifications,
    clearNotifications,
    removeNotification,
    unreadCount: notifications.length,
  };
}

/**
 * Hook to broadcast events to other users
 */
export function useBroadcast() {
  const { userId } = useAuth();
  const { send, isConnected } = useWebSocket();

  const broadcastCallStarted = useCallback((callData: any) => {
    if (!isConnected) {
      logger.warn('Cannot broadcast: WebSocket not connected');
      return false;
    }
    return send({
      type: 'call_started',
      payload: callData,
      userId,
    });
  }, [send, isConnected, userId]);

  const broadcastCallEnded = useCallback((callData: any) => {
    if (!isConnected) return false;
    return send({
      type: 'call_ended',
      payload: callData,
      userId,
    });
  }, [send, isConnected, userId]);

  const broadcastLeadCreated = useCallback((leadData: any) => {
    if (!isConnected) return false;
    return send({
      type: 'lead_created',
      payload: leadData,
      userId,
    });
  }, [send, isConnected, userId]);

  const broadcastLeadUpdated = useCallback((leadData: any) => {
    if (!isConnected) return false;
    return send({
      type: 'lead_updated',
      payload: leadData,
      userId,
    });
  }, [send, isConnected, userId]);

  return {
    broadcastCallStarted,
    broadcastCallEnded,
    broadcastLeadCreated,
    broadcastLeadUpdated,
    isConnected,
  };
}
