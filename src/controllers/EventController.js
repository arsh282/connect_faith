import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/apiConfig';
import { apiService } from '../services/api';
import { broadcastEvent } from '../services/eventBroadcastService';
import { mockApiService } from '../services/mockApi';

// Helper function to get auth token (you'll need to implement this based on your auth system)
const getAuthToken = () => {
  // This should return the user's authentication token
  // You can get this from your auth context, AsyncStorage, or wherever you store it
  return 'mock_token'; // Replace with actual token retrieval
};

// Helper function to determine if we should use mock API
const useMockApi = () => {
  // You can control this with an environment variable or config
  return API_CONFIG.BASE_URL.includes('your-api-endpoint.com') || __DEV__;
};

export const createEvent = async (payload) => {
  try {
    const token = getAuthToken();
    
    // Make sure we have a title field for notification system compatibility
    if (payload.name && !payload.title) {
      payload.title = payload.name;
    }
    
    // Make sure we have a date field for notification system compatibility
    if (payload.startTime && !payload.date) {
      payload.date = payload.startTime;
    }
    
    // Add creation timestamp if not provided
    if (!payload.createdAt) {
      payload.createdAt = new Date().toISOString();
    }
    
    console.log('Creating event with payload:', payload);
    
    let createdEvent;
    
    if (useMockApi()) {
      const result = await mockApiService.createEvent(payload, token);
      if (!result.success) {
        throw new Error(result.error);
      }
      
      createdEvent = result.data.event || result.data;
      console.log('Event created successfully:', createdEvent);
    } else {
      const result = await apiService.createEvent(payload, token);
      if (!result.success) {
        throw new Error(result.error);
      }
      createdEvent = result.data.event || result.data;
    }
    
    // Broadcast the event to all users
    try {
      console.log('Broadcasting event to all users');
      await broadcastEvent(createdEvent);
      console.log('Event broadcast successfully');
    } catch (broadcastError) {
      console.error('Error broadcasting event:', broadcastError);
      // We don't want to fail the event creation if broadcasting fails
    }
    
    return createdEvent;
  } catch (error) {
    console.error('Create event error:', error);
    throw error;
  }
};

export const getEvent = async (id) => {
  try {
    const token = getAuthToken();
    
    if (useMockApi()) {
      const result = await mockApiService.getEventDetails(id, token);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    } else {
      const result = await apiService.getEventDetails(id, token);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    }
  } catch (error) {
    console.error('Get event error:', error);
    throw error;
  }
};

export const updateEvent = async (id, payload) => {
  try {
    if (!id) {
      throw new Error('Event ID is required');
    }
    
    console.log('Updating event with ID:', id);
    
    // Make sure we have required fields for notification system
    if (!payload.title && payload.name) {
      payload.title = payload.name;
    }
    if (!payload.date && payload.startTime) {
      payload.date = payload.startTime;
    }
    
    const token = getAuthToken();
    
    if (useMockApi()) {
      const result = await mockApiService.updateEvent(id, payload, token);
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Also update the event in broadcast events if it exists there
      try {
        const broadcastKey = 'broadcast_events';
        const storedEvents = await AsyncStorage.getItem(broadcastKey);
        if (storedEvents) {
          const broadcastEvents = JSON.parse(storedEvents);
          const updatedEvents = broadcastEvents.map(event => {
            if (event.id === id) {
              return {
                ...event,
                ...payload,
                updatedAt: new Date().toISOString()
              };
            }
            return event;
          });
          await AsyncStorage.setItem(broadcastKey, JSON.stringify(updatedEvents));
          console.log('Updated event in broadcast events');
        }
      } catch (err) {
        console.error('Error updating event in broadcasts:', err);
      }
      
      return result.data;
    } else {
      const result = await apiService.updateEvent(id, payload, token);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    }
  } catch (error) {
    console.error('Update event error:', error);
    throw error;
  }
};

export const deleteEvent = async (id) => {
  try {
    if (!id) {
      throw new Error('Event ID is required');
    }
    
    console.log('Deleting event with ID:', id);
    const token = getAuthToken();
    
    if (useMockApi()) {
      // Delete from mock API (uses AsyncStorage)
      const result = await mockApiService.deleteEvent(id, token);
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Delete from broadcast events too to ensure it doesn't appear in notifications
      try {
        const broadcastKey = 'broadcast_events';
        const storedEvents = await AsyncStorage.getItem(broadcastKey);
        if (storedEvents) {
          const broadcastEvents = JSON.parse(storedEvents);
          const filteredEvents = broadcastEvents.filter(event => event.id !== id);
          await AsyncStorage.setItem(broadcastKey, JSON.stringify(filteredEvents));
          console.log('Removed event from broadcast events');
        }
      } catch (err) {
        console.error('Error removing event from broadcasts:', err);
      }
      
      return result.data;
    } else {
      const result = await apiService.deleteEvent(id, token);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    }
  } catch (error) {
    console.error('Delete event error:', error);
    throw error;
  }
};

export const getEventCategories = async () => {
  try {
    const token = getAuthToken();
    
    if (useMockApi()) {
      const result = await mockApiService.getEventCategories(token);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    } else {
      const result = await apiService.getEventCategories(token);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    }
  } catch (error) {
    console.error('Get event categories error:', error);
    throw error;
  }
};

export const getEvents = async (filters = {}) => {
  try {
    console.log('Getting events with filters:', filters);
    const token = getAuthToken();
    
    if (useMockApi()) {
      const result = await mockApiService.getEvents(token, filters);
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Ensure all events have consistent field names for compatibility
      const normalizedEvents = result.data.map(event => {
        return {
          ...event,
          title: event.title || event.name, // Ensure title is present
          name: event.name || event.title,  // Ensure name is present
          date: event.date || event.startTime, // Ensure date is present
          startTime: event.startTime || event.date, // Ensure startTime is present
        };
      });
      
      return { success: true, data: normalizedEvents };
    } else {
      const result = await apiService.getEvents(token, filters);
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Apply the same normalization for real API responses
      const normalizedEvents = result.data.map(event => {
        return {
          ...event,
          title: event.title || event.name,
          name: event.name || event.title,
          date: event.date || event.startTime,
          startTime: event.startTime || event.date,
        };
      });
      
      return { success: true, data: normalizedEvents };
    }
  } catch (error) {
    console.error('Get events error:', error);
    throw error;
  }
};

export const streamEventsForMonth = (monthStartISO, monthEndISO, cb) => {
  // Mock implementation - in real app this would use WebSocket or polling
  // For now, just call the callback with empty array
  cb([]);
  return () => {}; // Return unsubscribe function
};


