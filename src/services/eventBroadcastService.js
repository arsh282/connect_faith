import AsyncStorage from '@react-native-async-storage/async-storage';

// Function to broadcast an event to all users
export const broadcastEvent = async (event) => {
  try {
    if (!event || (!event.name && !event.title)) {
      console.error('❌ Cannot broadcast invalid event:', event);
      return false;
    }
    
    const eventId = event.id || `event_${Date.now()}`;
    
    console.log('🔊 Broadcasting event:', eventId);
    
    // Prepare event with all required fields
    const eventWithBroadcast = {
      ...event,
      id: eventId,
      title: event.title || event.name || 'New Event',
      name: event.name || event.title || 'New Event',
      date: event.date || event.startTime || new Date().toISOString(),
      startTime: event.startTime || event.date || new Date().toISOString(),
      description: event.description || '',
      location: event.location || 'TBD',
      broadcastTime: new Date().toISOString()
    };
    
    // Get existing broadcast events
    const broadcastKey = 'broadcast_events';
    let broadcastEvents = [];
    try {
      const storedEvents = await AsyncStorage.getItem(broadcastKey);
      broadcastEvents = storedEvents ? JSON.parse(storedEvents) : [];
    } catch (err) {
      console.error('❌ Error loading broadcast events:', err);
    }
    
    // Add the event if it doesn't already exist
    if (!broadcastEvents.some(e => e.id === eventId)) {
      broadcastEvents.push(eventWithBroadcast);
      
      // Keep only the last 20 events to prevent storage bloat
      if (broadcastEvents.length > 20) {
        broadcastEvents = broadcastEvents.slice(-20);
      }
      
      // Save back to storage
      await AsyncStorage.setItem(broadcastKey, JSON.stringify(broadcastEvents));
      console.log('🔊 Added event to broadcasts, count:', broadcastEvents.length);
      
      // Verify storage
      const verifyStorage = await AsyncStorage.getItem(broadcastKey);
      if (!verifyStorage) {
        console.error('❌ Failed to verify broadcast events in storage');
        return false;
      }
    } else {
      console.log('🔊 Event already in broadcast list:', eventId);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error broadcasting event:', error);
    return false;
  }
};

// Function to reset notification state for testing
export const resetNotificationState = async (userId) => {
  try {
    if (!userId) {
      console.error('❌ Cannot reset notification state without userId');
      return false;
    }
    
    console.log(`🔄 Resetting notification state for user: ${userId}`);
    
    // Mark for reset on next check
    await AsyncStorage.setItem(`reset_notifications_${userId}`, 'true');
    
    // Clear processed broadcasts
    await AsyncStorage.removeItem(`processed_broadcasts_${userId}`);
    
    // Reset last check time
    await AsyncStorage.removeItem(`lastBroadcastCheckTime_${userId}`);
    await AsyncStorage.removeItem(`lastEventCheckTime_${userId}`);
    
    console.log('🔄 Notification state reset successful');
    return true;
  } catch (error) {
    console.error('❌ Error resetting notification state:', error);
    return false;
  }
};

// Debug function to check broadcast events
export const debugBroadcastEvents = async () => {
  try {
    const broadcastKey = 'broadcast_events';
    const storedEvents = await AsyncStorage.getItem(broadcastKey);
    const broadcastEvents = storedEvents ? JSON.parse(storedEvents) : [];
    
    console.log('🔍 DEBUG: Broadcast events in storage:', broadcastEvents.length);
    broadcastEvents.forEach((event, index) => {
      console.log(`🔍 DEBUG: Event ${index + 1}:`, {
        id: event.id,
        name: event.name || event.title,
        broadcastTime: event.broadcastTime,
        createdAt: event.createdAt
      });
    });
    
    return broadcastEvents;
  } catch (error) {
    console.error('❌ DEBUG: Error checking broadcast events:', error);
    return [];
  }
};

export default {
  broadcastEvent,
  resetNotificationState,
  debugBroadcastEvents
};
