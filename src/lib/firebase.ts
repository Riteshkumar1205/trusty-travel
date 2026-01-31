import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging, MessagePayload } from 'firebase/messaging';

// Firebase configuration - Replace with your Firebase project config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:000000000000:web:0000000000000000000000',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
let messaging: Messaging | null = null;

// Check if browser supports notifications
const isNotificationSupported = () => {
  return 'Notification' in window && 
         'serviceWorker' in navigator && 
         'PushManager' in window;
};

// Initialize messaging only in supported browsers
if (typeof window !== 'undefined' && isNotificationSupported()) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.warn('Firebase Messaging initialization failed:', error);
  }
}

// Request notification permission and get FCM token
export const requestNotificationPermission = async (): Promise<string | null> => {
  if (!isNotificationSupported()) {
    console.warn('Push notifications not supported in this browser');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted');
      
      if (messaging) {
        // Get FCM token
        const token = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || 'demo-vapid-key'
        });
        
        console.log('FCM Token:', token);
        return token;
      }
    } else {
      console.log('Notification permission denied');
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
  }
  
  return null;
};

// Subscribe to foreground messages
export const onForegroundMessage = (callback: (payload: MessagePayload) => void): (() => void) | null => {
  if (!messaging) {
    console.warn('Messaging not initialized');
    return null;
  }

  return onMessage(messaging, (payload) => {
    console.log('Foreground message received:', payload);
    callback(payload);
  });
};

// Send local notification (for demo/testing without FCM backend)
export const sendLocalNotification = (title: string, options?: NotificationOptions): void => {
  if (!isNotificationSupported()) {
    console.warn('Notifications not supported');
    return;
  }

  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/favicon.ico',
      ...options,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }
};

// Notification types for the app
export type NotificationType = 
  | 'otp_pickup'
  | 'otp_delivery'
  | 'payment_received'
  | 'payment_sent'
  | 'parcel_matched'
  | 'parcel_picked_up'
  | 'parcel_delivered'
  | 'traveler_nearby'
  | 'journey_started'
  | 'message_received';

interface AppNotification {
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, string>;
}

// Send app-specific notifications
export const sendAppNotification = (notification: AppNotification): void => {
  const iconMap: Record<NotificationType, string> = {
    otp_pickup: '📦',
    otp_delivery: '🎯',
    payment_received: '💰',
    payment_sent: '💸',
    parcel_matched: '🤝',
    parcel_picked_up: '✅',
    parcel_delivered: '🎉',
    traveler_nearby: '📍',
    journey_started: '🚀',
    message_received: '💬',
  };

  const icon = iconMap[notification.type] || '🔔';
  
  sendLocalNotification(`${icon} ${notification.title}`, {
    body: notification.body,
    tag: notification.type,
    data: notification.data,
    requireInteraction: ['otp_pickup', 'otp_delivery', 'payment_received'].includes(notification.type),
  });
};

export { app, messaging, isNotificationSupported };
