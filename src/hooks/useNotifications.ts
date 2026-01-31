import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  requestNotificationPermission, 
  onForegroundMessage, 
  sendAppNotification,
  isNotificationSupported,
  NotificationType 
} from '@/lib/firebase';

interface UseNotificationsReturn {
  isSupported: boolean;
  permission: NotificationPermission | 'unsupported';
  fcmToken: string | null;
  requestPermission: () => Promise<void>;
  sendNotification: (type: NotificationType, title: string, body: string, data?: Record<string, string>) => void;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    const supported = isNotificationSupported();
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
    } else {
      setPermission('unsupported');
    }
  }, []);

  // Listen for foreground messages
  useEffect(() => {
    if (!isSupported || permission !== 'granted') return;

    const unsubscribe = onForegroundMessage((payload) => {
      // Show toast for foreground messages
      if (payload.notification) {
        toast(payload.notification.title || 'New Notification', {
          description: payload.notification.body,
        });
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isSupported, permission]);

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      toast.error('Push notifications are not supported in this browser');
      return;
    }

    try {
      const token = await requestNotificationPermission();
      
      if (token) {
        setFcmToken(token);
        setPermission('granted');
        toast.success('Notifications enabled! You will receive delivery updates.');
        
        // Here you would typically send the token to your backend
        console.log('FCM Token to save:', token);
      } else if (Notification.permission === 'denied') {
        setPermission('denied');
        toast.error('Notification permission denied. Please enable in browser settings.');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Failed to enable notifications');
    }
  }, [isSupported]);

  const sendNotification = useCallback((
    type: NotificationType, 
    title: string, 
    body: string, 
    data?: Record<string, string>
  ) => {
    if (permission === 'granted') {
      sendAppNotification({ type, title, body, data });
    } else {
      // Fallback to toast if notifications not granted
      toast(title, { description: body });
    }
  }, [permission]);

  return {
    isSupported,
    permission,
    fcmToken,
    requestPermission,
    sendNotification,
  };
};

export default useNotifications;
