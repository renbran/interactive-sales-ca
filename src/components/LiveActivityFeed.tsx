/**
 * Live Activity Feed Component
 * Shows real-time updates from the team
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  PhoneCall, 
  UserPlus, 
  PencilSimple,
  Circle,
  Bell
} from '@phosphor-icons/react';
import { useRealtimeCallUpdates, useRealtimeLeadUpdates, useRealtimeNotifications, useWebSocket } from '@/hooks/useWebSocket';
import { formatDistanceToNow } from 'date-fns';
import { useState, useEffect } from 'react';

type ActivityItem = {
  id: string;
  type: 'call_started' | 'call_ended' | 'lead_created' | 'lead_updated' | 'notification';
  title: string;
  description: string;
  timestamp: string;
  userName?: string;
  icon: any;
  color: string;
};

export default function LiveActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const { status, isConnected } = useWebSocket();
  const { notifications } = useRealtimeNotifications();

  // Add call activities
  useRealtimeCallUpdates(
    (data) => {
      const activity: ActivityItem = {
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
    },
    (data) => {
      const activity: ActivityItem = {
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
    }
  );

  // Add lead activities
  useRealtimeLeadUpdates(
    (data) => {
      const activity: ActivityItem = {
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
    },
    (data) => {
      const activity: ActivityItem = {
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
    }
  );

  // Add notification activities
  useEffect(() => {
    notifications.forEach((notification) => {
      if (notification.payload.heartbeat) return;
      
      const exists = activities.some(a => a.timestamp === notification.timestamp);
      if (exists) return;

      const activity: ActivityItem = {
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
        return <Badge variant="default" className="bg-green-500"><Circle className="h-2 w-2 mr-1" weight="fill" />Live</Badge>;
      case 'connecting':
        return <Badge variant="secondary"><Circle className="h-2 w-2 mr-1 animate-pulse" weight="fill" />Connecting</Badge>;
      case 'disconnected':
        return <Badge variant="secondary"><Circle className="h-2 w-2 mr-1" weight="fill" />Offline</Badge>;
      case 'error':
        return <Badge variant="destructive"><Circle className="h-2 w-2 mr-1" weight="fill" />Error</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Live Activity</CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        {!isConnected && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
            <p className="text-sm text-yellow-800">
              Real-time updates are currently unavailable. Reconnecting...
            </p>
          </div>
        )}
        
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recent activity</p>
            <p className="text-xs">Updates will appear here in real-time</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {activities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className={`mt-1 ${activity.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
