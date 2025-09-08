// Test script to verify notification system is working
// Run this in the app console or as a test

import AsyncStorage from '@react-native-async-storage/async-storage';

// Test function to create a test notification
export const createTestNotification = async (userId = 'test_user_123') => {
  try {
    console.log('🧪 Creating test notification for user:', userId);
    
    // Create a test notification
    const testNotification = {
      id: `test_notification_${Date.now()}`,
      title: 'Test Notification',
      message: 'This is a test notification to verify the system is working',
      type: 'system',
      timestamp: new Date().toISOString(),
      read: false
    };
    
    // Get existing notifications for this user
    const storageKey = `notifications_${userId}`;
    const existingNotifications = await AsyncStorage.getItem(storageKey);
    const notifications = existingNotifications ? JSON.parse(existingNotifications) : [];
    
    // Add the test notification
    notifications.unshift(testNotification);
    
    // Save back to storage
    await AsyncStorage.setItem(storageKey, JSON.stringify(notifications));
    
    console.log('✅ Test notification created successfully');
    console.log('📱 Total notifications for user:', notifications.length);
    
    return true;
  } catch (error) {
    console.error('❌ Error creating test notification:', error);
    return false;
  }
};

// Test function to check if user is admin (admins don't receive notifications)
export const checkUserRole = (userProfile) => {
  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'Admin';
  console.log('👤 User role:', userProfile?.role);
  console.log('🔒 Is admin:', isAdmin);
  console.log('📝 Admin users do not receive notifications');
  return isAdmin;
};

// Test function to verify notification storage
export const verifyNotificationStorage = async (userId) => {
  try {
    const storageKey = `notifications_${userId}`;
    const stored = await AsyncStorage.getItem(storageKey);
    
    if (stored) {
      const notifications = JSON.parse(stored);
      console.log('📱 Found notifications for user:', userId);
      console.log('📊 Notification count:', notifications.length);
      console.log('📋 Notifications:', notifications.map(n => ({
        id: n.id,
        title: n.title,
        type: n.type,
        read: n.read
      })));
      return notifications;
    } else {
      console.log('📱 No notifications found for user:', userId);
      return [];
    }
  } catch (error) {
    console.error('❌ Error verifying notification storage:', error);
    return [];
  }
};

// Test function to check broadcast events
export const checkBroadcastEvents = async () => {
  try {
    const broadcastKey = 'broadcast_events';
    const stored = await AsyncStorage.getItem(broadcastKey);
    
    if (stored) {
      const events = JSON.parse(stored);
      console.log('📡 Found broadcast events:', events.length);
      console.log('📋 Events:', events.map(e => ({
        id: e.id,
        title: e.title || e.name,
        broadcastTime: e.broadcastTime
      })));
      return events;
    } else {
      console.log('📡 No broadcast events found');
      return [];
    }
  } catch (error) {
    console.error('❌ Error checking broadcast events:', error);
    return [];
  }
};

// Main test function
export const runNotificationTests = async (userProfile) => {
  console.log('🧪 Running notification system tests...');
  console.log('=====================================');
  
  // Check user role
  const isAdmin = checkUserRole(userProfile);
  
  if (isAdmin) {
    console.log('⚠️  User is admin - admins do not receive notifications');
    console.log('💡 Try logging in as a regular member to test notifications');
    return;
  }
  
  // Check current notifications
  const userId = userProfile?.id || 'test_user';
  const currentNotifications = await verifyNotificationStorage(userId);
  
  // Check broadcast events
  const broadcastEvents = await checkBroadcastEvents();
  
  // Create test notification
  await createTestNotification(userId);
  
  // Verify the test notification was created
  const updatedNotifications = await verifyNotificationStorage(userId);
  
  console.log('=====================================');
  console.log('✅ Notification tests completed');
  console.log('📱 Check the NotificationScreen (not NotificationCenterScreen)');
  console.log('🔔 Look for the notification bell with a red badge');
};

export default {
  createTestNotification,
  checkUserRole,
  verifyNotificationStorage,
  checkBroadcastEvents,
  runNotificationTests
};
