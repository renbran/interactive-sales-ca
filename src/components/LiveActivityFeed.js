import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Live Activity Feed Component
 * Shows real-time updates from the team
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PhoneCall, UserPlus, PencilSimple, Circle, Bell } from '@phosphor-icons/react';
import { useRealtimeCallUpdates, useRealtimeLeadUpdates, useRealtimeNotifications, useWebSocket } from '@/hooks/useWebSocket';
import { formatDistanceToNow } from 'date-fns';
import { useState, useEffect } from 'react';
export default function LiveActivityFeed() {
    const [activities, setActivities] = useState([]);
    const { status, isConnected } = useWebSocket();
    const { notifications } = useRealtimeNotifications();
    // Add call activities
    useRealtimeCallUpdates((data) => {
        const activity = {
            id: `call_started_${Date.now()}`,
            type: 'call_started',
            title: 'Call Started',
            description: `${data.userName || 'Someone'} started a call with ${data.leadName || 'a lead'}`,
            timestamp: new Date().toISOString(),
            userName: data.userName,
            icon: PhoneCall,
            color: 'text-green-600',
        };
        setActivities(prev => [activity, ...prev].slice(0, 50));
    }, (data) => {
        const activity = {
            id: `call_ended_${Date.now()}`,
            type: 'call_ended',
            title: 'Call Ended',
            description: `${data.userName || 'Someone'} finished a call (${data.duration || 'N/A'})`,
            timestamp: new Date().toISOString(),
            userName: data.userName,
            icon: PhoneCall,
            color: 'text-blue-600',
        };
        setActivities(prev => [activity, ...prev].slice(0, 50));
    });
    // Add lead activities
    useRealtimeLeadUpdates((data) => {
        const activity = {
            id: `lead_created_${Date.now()}`,
            type: 'lead_created',
            title: 'New Lead',
            description: `${data.userName || 'Someone'} added ${data.leadName || 'a new lead'}`,
            timestamp: new Date().toISOString(),
            userName: data.userName,
            icon: UserPlus,
            color: 'text-purple-600',
        };
        setActivities(prev => [activity, ...prev].slice(0, 50));
    }, (data) => {
        const activity = {
            id: `lead_updated_${Date.now()}`,
            type: 'lead_updated',
            title: 'Lead Updated',
            description: `${data.userName || 'Someone'} updated ${data.leadName || 'a lead'}`,
            timestamp: new Date().toISOString(),
            userName: data.userName,
            icon: PencilSimple,
            color: 'text-orange-600',
        };
        setActivities(prev => [activity, ...prev].slice(0, 50));
    });
    // Add notification activities
    useEffect(() => {
        notifications.forEach((notification) => {
            if (notification.payload.heartbeat)
                return;
            const exists = activities.some(a => a.timestamp === notification.timestamp);
            if (exists)
                return;
            const activity = {
                id: `notification_${notification.timestamp}`,
                type: 'notification',
                title: 'System Notification',
                description: notification.payload.message || 'New notification',
                timestamp: notification.timestamp,
                icon: Bell,
                color: 'text-gray-600',
            };
            setActivities(prev => [activity, ...prev].slice(0, 50));
        });
    }, [notifications, activities]);
    const getStatusBadge = () => {
        switch (status) {
            case 'connected':
                return _jsxs(Badge, { variant: "default", className: "bg-green-500", children: [_jsx(Circle, { className: "h-2 w-2 mr-1", weight: "fill" }), "Live"] });
            case 'connecting':
                return _jsxs(Badge, { variant: "secondary", children: [_jsx(Circle, { className: "h-2 w-2 mr-1 animate-pulse", weight: "fill" }), "Connecting"] });
            case 'disconnected':
                return _jsxs(Badge, { variant: "secondary", children: [_jsx(Circle, { className: "h-2 w-2 mr-1", weight: "fill" }), "Offline"] });
            case 'error':
                return _jsxs(Badge, { variant: "destructive", children: [_jsx(Circle, { className: "h-2 w-2 mr-1", weight: "fill" }), "Error"] });
        }
    };
    return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { className: "text-lg", children: "Live Activity" }), getStatusBadge()] }) }), _jsxs(CardContent, { children: [!isConnected && (_jsx("div", { className: "p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4", children: _jsx("p", { className: "text-sm text-yellow-800", children: "Real-time updates are currently unavailable. Reconnecting..." }) })), activities.length === 0 ? (_jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [_jsx(Bell, { className: "h-12 w-12 mx-auto mb-2 opacity-50" }), _jsx("p", { className: "text-sm", children: "No recent activity" }), _jsx("p", { className: "text-xs", children: "Updates will appear here in real-time" })] })) : (_jsx(ScrollArea, { className: "h-[400px]", children: _jsx("div", { className: "space-y-3", children: activities.map((activity) => {
                                const Icon = activity.icon;
                                return (_jsxs("div", { className: "flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors", children: [_jsx("div", { className: `mt-1 ${activity.color}`, children: _jsx(Icon, { className: "h-5 w-5" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium", children: activity.title }), _jsx("p", { className: "text-sm text-muted-foreground truncate", children: activity.description }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true }) })] })] }, activity.id));
                            }) }) }))] })] }));
}
