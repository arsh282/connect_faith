import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef } from 'react';
import { useAuth } from '../context/CustomAuthContext';
import { useNotifications } from '../context/NotificationsContext';

// This is a custom hook that handles checking for upcoming events
// and sending notifications as needed
export const useEventNotifications = (events) => {
  const { userProfile } = useAuth();
  const { addEventNotification } = useNotifications();
  const isProcessingRef = useRef(false);
  const processedEventsRef = useRef(new Set());
  const processedBroadcastsRef = useRef(new Set());
  
  // Create a safe reference to events that's guaranteed to be an array
  const safeEvents = Array.isArray(events) ? events : [];
  
  // Load previously processed events on mount
  useEffect(() => {
    if (!userProfile?.id) return;
    
    const loadProcessedEvents = async () => {
      try {
        // Load processed broadcasts
        const processedKey = `processed_broadcasts_${userProfile.id}`;
        const processedJson = await AsyncStorage.getItem(processedKey);
        
        if (processedJson) {
          const processed = JSON.parse(processedJson);
          processed.forEach(id => processedBroadcastsRef.current.add(id));
          console.log(`🔄 Loaded ${processed.length} previously processed broadcasts`);
        }
      } catch (err) {
        console.error('❌ Error loading processed events:', err);
      }
    };
    
    loadProcessedEvents();
  }, [userProfile?.id]);

  // Process new events (called when events change)
  useEffect(() => {
    if (!userProfile || userProfile.role === 'Admin') return;
    if (safeEvents.length === 0) return;
    
    const checkForNewEvents = async () => {
      // Check if we're already processing to prevent infinite loops
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;
      
      try {
        if (!userProfile?.id) return;
        
        // Get last notification check time from AsyncStorage
        const storageKey = `lastEventCheckTime_${userProfile.id}`;
        const storedTime = await AsyncStorage.getItem(storageKey);
        const lastCheckTime = storedTime ? new Date(storedTime) : new Date(0);
        
        const now = new Date();
        
        // Find events created after last check (with defensive programming)
        const newEvents = safeEvents.filter(event => {
          // Skip already processed events to prevent duplicates
          if (!event.id || processedEventsRef.current.has(event.id)) {
            return false;
          }
          
          // If no createdAt, we can't determine if it's new
          if (!event.createdAt) {
            console.log('❌ Event missing createdAt timestamp:', event.id);
            return false;
          }
          
          try {
            const createdAt = new Date(event.createdAt);
            const isNew = createdAt > lastCheckTime;
            
            if (isNew) {
              console.log(`🔔 Found new event: ${event.name || event.title}, created at: ${createdAt.toISOString()}`);
            }
            
            return isNew;
          } catch (err) {
            console.error('❌ Error parsing event creation date:', err);
            return false;
          }
        });
        
        console.log(`🔔 Found ${newEvents.length} new events since last check`);
        
        // Send notifications for new events
        for (const event of newEvents) {
          await addEventNotification(event, false);
          // Mark this event as processed
          processedEventsRef.current.add(event.id);
        }
        
        // Update last check time
        await AsyncStorage.setItem(storageKey, now.toISOString());
      } catch (error) {
        console.error('❌ Error checking for new events:', error);
      } finally {
        isProcessingRef.current = false;
      }
    };
    
    // Run the check after a small delay to prevent race conditions
    const timeoutId = setTimeout(() => {
      checkForNewEvents();
    }, 100);
    
    // Clean up timeout on component unmount
    return () => clearTimeout(timeoutId);
  }, [events, userProfile]);
  
  // Check for broadcast events (sent by admin to all users)
  useEffect(() => {
    if (!userProfile || userProfile.role === 'Admin') return;
    
    const checkForBroadcastEvents = async () => {
      try {
        if (!userProfile?.id) return;
        
        console.log(`🔍 Checking for broadcast events for user ${userProfile.id}`);
        
        // Reset stored events if needed (for testing)
        const resetKey = `reset_notifications_${userProfile.id}`;
        const shouldReset = await AsyncStorage.getItem(resetKey);
        if (shouldReset === 'true') {
          console.log('🔄 Resetting processed broadcasts for testing');
          processedBroadcastsRef.current = new Set();
          await AsyncStorage.removeItem(resetKey);
          await AsyncStorage.removeItem(`lastBroadcastCheckTime_${userProfile.id}`);
        }
        
        // Get broadcast events from shared storage
        const broadcastKey = 'broadcast_events';
        const storedEvents = await AsyncStorage.getItem(broadcastKey);
        
        if (!storedEvents) {
          console.log('🔍 No stored broadcast events found');
          return;
        }
        
        const broadcastEvents = JSON.parse(storedEvents);
        console.log(`🔊 Found ${broadcastEvents.length} broadcast events in storage`);
        
        // IMPORTANT: Log more details to diagnose issues
        console.log('🔍 Broadcast events IDs:', broadcastEvents.map(e => e.id).join(', '));
        console.log('🔍 Processed broadcast IDs:', Array.from(processedBroadcastsRef.current).join(', '));
        
        // Get last broadcast check time
        const lastCheckKey = `lastBroadcastCheckTime_${userProfile.id}`;
        const storedTime = await AsyncStorage.getItem(lastCheckKey);
        const lastCheckTime = storedTime ? new Date(storedTime) : new Date(0);
        console.log(`🔍 Last broadcast check time: ${lastCheckTime.toISOString()}`);
        
        // Find new broadcast events - IMPROVED method
        const newBroadcasts = broadcastEvents.filter(event => {
          // Skip invalid events
          if (!event.id) {
            console.log('🔍 Event missing ID, skipping');
            return false;
          }
          
          // IMPORTANT: For testing/fixing, we consider all events that haven't been
          // explicitly processed as new, regardless of timestamp
          if (processedBroadcastsRef.current.has(event.id)) {
            console.log(`🔍 Event ${event.id} already processed, skipping`);
            return false;
          }
          
          // Ensure we have a broadcastTime
          if (!event.broadcastTime) {
            console.log(`🔍 Event ${event.id} missing broadcastTime, setting to now`);
            event.broadcastTime = new Date().toISOString();
          }
          
          // Set event as new (since we know it's not in our processed list)
          console.log(`🔊 Found new broadcast event: ${event.name || event.title} (ID: ${event.id})`);
          return true;
        });
        
        console.log(`🔍 Found ${newBroadcasts.length} new broadcast events to process`);
        
        // Process new broadcasts
        for (const event of newBroadcasts) {
          try {
            console.log(`🔍 Adding notification for broadcast event: ${event.id}`);
            
            // Make sure we have minimum required fields
            const eventToProcess = {
              ...event,
              title: event.title || event.name || 'New Event',
              name: event.name || event.title || 'New Event',
              date: event.date || event.startTime || new Date().toISOString(),
              startTime: event.startTime || event.date || new Date().toISOString(),
            };
            
            const success = await addEventNotification(eventToProcess, false);
            
            if (success) {
              processedBroadcastsRef.current.add(event.id);
              console.log(`✅ Successfully processed broadcast event: ${event.id}`);
              
              // Store processed events persistently to avoid duplicates across app restarts
              try {
                const processedKey = `processed_broadcasts_${userProfile.id}`;
                const processedJson = await AsyncStorage.getItem(processedKey);
                const processed = processedJson ? JSON.parse(processedJson) : [];
                
                if (!processed.includes(event.id)) {
                  processed.push(event.id);
                  await AsyncStorage.setItem(processedKey, JSON.stringify(processed));
                }
              } catch (err) {
                console.error('Error storing processed broadcasts:', err);
              }
            } else {
              console.error(`❌ Failed to process broadcast event: ${event.id}`);
            }
          } catch (err) {
            console.error(`❌ Error processing broadcast event ${event.id}:`, err);
          }
        }
        
        // Update last broadcast check time
        await AsyncStorage.setItem(lastCheckKey, new Date().toISOString());
        console.log(`🔍 Updated last broadcast check time to ${new Date().toISOString()}`);
        
      } catch (error) {
        console.error('❌ Error checking for broadcast events:', error);
      }
    };
    
    // Check for broadcasts initially and every 5 seconds for faster updates
    checkForBroadcastEvents();
    const interval = setInterval(checkForBroadcastEvents, 5000); // Check every 5 seconds
    
    return () => clearInterval(interval);
  }, [userProfile]);
  
  // Create a ref to track sent reminders at the top level
  const remindersSentRef = useRef(new Set());
  
  // Check for upcoming events daily and send reminders
  useEffect(() => {
    if (!userProfile || userProfile.role === 'Admin') return;
    if (safeEvents.length === 0) return;
    
    let isMounted = true; // Flag to track component mount status
    
    const checkUpcomingEvents = async () => {
      try {
        // Skip if component is unmounted or user is no longer available
        if (!isMounted || !userProfile?.id) return;
        
        // Use simple date comparison to avoid date-fns dependency issues
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const dayAfterTomorrow = new Date(tomorrow);
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
        
        // Find events happening tomorrow (between tomorrow 00:00 and the next day 00:00)
        const upcomingEvents = safeEvents.filter(event => {
          // Skip if we already sent a reminder for this event
          if (!event.id || remindersSentRef.current.has(event.id)) {
            return false;
          }
          
          // Handle different date field names (either date or startTime)
          const eventDateField = event.date || event.startTime;
          if (!eventDateField) {
            console.log('❌ Event missing date or startTime:', event.id);
            return false;
          }
          
          try {
            const eventDate = new Date(eventDateField);
            // Check if event date is between tomorrow start and day after tomorrow start
            const isUpcoming = eventDate >= tomorrow && eventDate < dayAfterTomorrow;
            
            if (isUpcoming) {
              console.log(`🔔 Found upcoming event: ${event.name || event.title}, date: ${eventDate.toISOString()}`);
            }
            
            return isUpcoming;
          } catch (err) {
            console.error('❌ Error parsing event date:', err);
            return false;
          }
        });
        
        console.log(`🔔 Found ${upcomingEvents.length} events happening tomorrow`);
        
        // Send reminder notifications for events happening tomorrow
        for (const event of upcomingEvents) {
          if (isMounted && userProfile?.id) {
            await addEventNotification(event, true);
            // Mark this reminder as sent
            remindersSentRef.current.add(event.id);
          }
        }
      } catch (error) {
        console.error('❌ Error checking upcoming events:', error);
      }
    };
    
    // Run the check after a small delay to avoid race conditions
    const initialCheckTimeout = setTimeout(() => {
      checkUpcomingEvents();
    }, 500);
    
    // Using a shorter interval for testing - 1 hour instead of 24 hours
    // This reduces the risk of memory leaks during development
    const interval = setInterval(checkUpcomingEvents, 60 * 60 * 1000);
    
    // Cleanup function
    return () => {
      isMounted = false;
      clearTimeout(initialCheckTimeout);
      clearInterval(interval);
    };
  }, [safeEvents, userProfile, userProfile?.id]); // Updated to use safeEvents
  
  return null; // This hook doesn't render anything
};

// Export any additional helper functions if needed
export const markEventAsSeen = (eventId) => {
  // Implementation to mark an event as seen/read
};

export default useEventNotifications;
