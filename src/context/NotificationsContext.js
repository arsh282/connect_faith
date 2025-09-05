import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './CustomAuthContext';

// Create a context for notifications
const NotificationsContext = createContext();

// Custom hook for using the notifications context
export const useNotifications = () => useContext(NotificationsContext);

export const NotificationsProvider = ({ children }) => {
  const { userProfile } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Load notifications from storage on mount and when user changes
  useEffect(() => {
    if (userProfile?.id) {
      loadNotifications();
      
      // Set up periodic refresh to catch new notifications
      const refreshInterval = setInterval(() => {
        console.log('🔔 NotificationsContext: Refreshing notifications');
        loadNotifications();
      }, 10000); // Check every 10 seconds
      
      // Clean up interval on unmount
      return () => clearInterval(refreshInterval);
    }
  }, [userProfile]);

  // Update unread count whenever notifications change
  useEffect(() => {
    const count = notifications.filter(notification => !notification.read).length;
    setUnreadCount(count);
  }, [notifications]);

  // Load notifications from AsyncStorage
  const loadNotifications = async () => {
    try {
      if (!userProfile?.id) return;
      
      const storageKey = `notifications_${userProfile.id}`;
      const storedNotifications = await AsyncStorage.getItem(storageKey);
      
      if (storedNotifications) {
        const parsedNotifications = JSON.parse(storedNotifications);
        setNotifications(parsedNotifications);
        console.log('🔔 NotificationsContext: Loaded notifications:', parsedNotifications.length);
      } else {
        setNotifications([]);
        console.log('🔔 NotificationsContext: No stored notifications found');
      }
    } catch (error) {
      console.error('❌ NotificationsContext: Failed to load notifications', error);
    }
  };

  // Save notifications to AsyncStorage
  const saveNotifications = async (updatedNotifications) => {
    try {
      if (!userProfile?.id) return;
      
      const storageKey = `notifications_${userProfile.id}`;
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('❌ NotificationsContext: Failed to save notifications', error);
    }
  };

  // Add a new notification
  const addNotification = async (notification) => {
    try {
      if (!userProfile?.id) return;

      // Prevent duplicate event notifications
      if (notification.eventId) {
        const existingNotification = notifications.find(
          (n) => n.eventId === notification.eventId && n.type === notification.type && n.isReminder === notification.isReminder
        );
        if (existingNotification) {
          console.log('🔔 NotificationsContext: Duplicate notification prevented:', notification.title);
          return false; // Prevent adding duplicate
        }
      }
      
      // Add id and read status if not provided
      const newNotification = {
        id: `notification_${Date.now()}`,
        timestamp: new Date().toISOString(),
        read: false,
        ...notification
      };
      
      const updatedNotifications = [newNotification, ...notifications];
      setNotifications(updatedNotifications);
      await saveNotifications(updatedNotifications);
      
      console.log('🔔 NotificationsContext: Added notification:', newNotification.title);
      return true;
    } catch (error) {
      console.error('❌ NotificationsContext: Failed to add notification', error);
      return false;
    }
  };

  // Mark a notification as read
  const markAsRead = async (notificationId) => {
    try {
      if (!userProfile?.id) return false;
      
      const updatedNotifications = notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      );
      
      setNotifications(updatedNotifications);
      await saveNotifications(updatedNotifications);
      
      console.log('🔔 NotificationsContext: Marked notification as read:', notificationId);
      return true;
    } catch (error) {
      console.error('❌ NotificationsContext: Failed to mark notification as read', error);
      return false;
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      if (!userProfile?.id) return false;
      
      const updatedNotifications = notifications.map(notification => ({
        ...notification,
        read: true
      }));
      
      setNotifications(updatedNotifications);
      await saveNotifications(updatedNotifications);
      
      console.log('🔔 NotificationsContext: Marked all notifications as read');
      return true;
    } catch (error) {
      console.error('❌ NotificationsContext: Failed to mark all notifications as read', error);
      return false;
    }
  };

  // Delete a notification
  const deleteNotification = async (notificationId) => {
    try {
      if (!userProfile?.id) return false;
      
      const updatedNotifications = notifications.filter(
        notification => notification.id !== notificationId
      );
      
      setNotifications(updatedNotifications);
      await saveNotifications(updatedNotifications);
      
      console.log('🔔 NotificationsContext: Deleted notification:', notificationId);
      return true;
    } catch (error) {
      console.error('❌ NotificationsContext: Failed to delete notification', error);
      return false;
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      if (!userProfile?.id) return false;
      
      setNotifications([]);
      await saveNotifications([]);
      
      console.log('🔔 NotificationsContext: Cleared all notifications');
      return true;
    } catch (error) {
      console.error('❌ NotificationsContext: Failed to clear notifications', error);
      return false;
    }
  };

  // Add an event notification
  const addEventNotification = async (event, isReminder = false) => {
    try {
      if (!event) {
        console.error('❌ NotificationsContext: Cannot add notification for null event');
        return false;
      }
      
      // Handle different event field structures (support both name and title fields)
      const eventTitle = event.title || event.name;
      
      if (!eventTitle) {
        console.error('❌ NotificationsContext: Cannot add notification for event without title or name', event);
        return false;
      }
      
      const title = isReminder 
        ? `Reminder: ${eventTitle}` 
        : `New Event: ${eventTitle}`;
      
      const message = isReminder
        ? `Don't forget! "${eventTitle}" is happening tomorrow.`
        : `Posted by Admin: ${event.description || 'A new event has been created.'}`;
      
      // Handle different date field names (support both date and startTime fields)
      const eventDate = event.date || event.startTime;
      
      const notificationData = {
        type: 'event',
        title,
        message,
        eventId: event.id || `event_${Date.now()}`, // Fallback ID if none provided
        eventDate: eventDate,
        isReminder,
        eventDetails: {
          title: eventTitle,
          date: eventDate,
          location: event.location || 'TBD',
          description: event.description || ''
        }
      };
      
      console.log('🔔 NotificationsContext: Adding event notification:', title);
      return await addNotification(notificationData);
    } catch (error) {
      console.error('❌ NotificationsContext: Failed to add event notification', error);
      return false;
    }
  };

  // Broadcast a notification to all users by storing it in a shared location
  const broadcastEventNotification = async (event) => {
    try {
      if (!event) {
        console.error('❌ NotificationsContext: Cannot broadcast notification for null event');
        return false;
      }
      
      // Handle different event field structures (support both name and title fields)
      const eventTitle = event.title || event.name;
      
      if (!eventTitle) {
        console.error('❌ NotificationsContext: Cannot broadcast notification for event without title', event);
        return false;
      }
      
      console.log('🔊 NotificationsContext: Broadcasting event notification:', eventTitle);
      console.log('🔊 NotificationsContext: Event details:', JSON.stringify(event));
      
      // Save the event in a shared location that all users can access
      const broadcastKey = 'broadcast_events';
      let broadcastEvents = [];
      
      try {
        const storedEvents = await AsyncStorage.getItem(broadcastKey);
        broadcastEvents = storedEvents ? JSON.parse(storedEvents) : [];
        console.log('🔊 NotificationsContext: Existing broadcast events:', broadcastEvents.length);
      } catch (err) {
        console.error('❌ Error loading broadcast events:', err);
      }
      
      // Make sure we have a proper ID for the event
      const eventWithId = {
        ...event,
        id: event.id || `event_${Date.now()}`
      };
      
      // Add the new event to the broadcast list if it's not already there
      if (!broadcastEvents.some(e => e.id === eventWithId.id)) {
        const broadcastEvent = {
          ...eventWithId,
          broadcastTime: new Date().toISOString()
        };
        
        broadcastEvents.push(broadcastEvent);
        console.log('🔊 NotificationsContext: Added event to broadcasts:', broadcastEvent.id);
        
        // Keep only last 20 broadcast events to prevent storage overflow
        if (broadcastEvents.length > 20) {
          broadcastEvents = broadcastEvents.slice(-20);
        }
        
        await AsyncStorage.setItem(broadcastKey, JSON.stringify(broadcastEvents));
        console.log('� NotificationsContext: Saved broadcast events to AsyncStorage, count:', broadcastEvents.length);
        
        // Force immediate refresh of broadcast storage to ensure it's available
        const verifyStorage = await AsyncStorage.getItem(broadcastKey);
        if (verifyStorage) {
          console.log('🔊 NotificationsContext: Verified broadcast events saved successfully');
        } else {
          console.error('❌ NotificationsContext: Failed to verify broadcast events in storage');
        }
      } else {
        console.log('🔊 NotificationsContext: Event already in broadcast list:', eventWithId.id);
      }
      
      // Also add the notification for the current user if they're logged in
      if (userProfile?.id) {
        console.log('🔊 NotificationsContext: Adding notification for current user:', userProfile.id);
        await addEventNotification(event, false);
      }
      
      return true;
    } catch (error) {
      console.error('❌ NotificationsContext: Failed to broadcast event notification', error);
      return false;
    }
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        addEventNotification,
        broadcastEventNotification
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export default NotificationsContext;
