// Mock API Service for Development
// This simulates your backend API responses for testing

import AsyncStorage from '@react-native-async-storage/async-storage';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data
const mockRoles = [
  { id: '1', name: 'Member' },
  { id: '2', name: 'Admin' },
  { id: '3', name: 'Moderator' }
];

const mockUsers = [
  // Default admin account
  {
    id: 'admin-001',
    email: 'admin@admin.connectfaith.com',
    password: 'admin123456',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin'
  }
];

// Default events that will be shown if no custom events are stored
const defaultMockEvents = [
  {
    id: 'event_1',
    name: 'Sunday Worship Service',
    description: 'Join us for our weekly worship service with inspiring music, prayer, and fellowship. All are welcome to come and worship together.',
    categoryId: '1',
    startTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    endTime: new Date(Date.now() + 86400000 + 7200000).toISOString(), // Tomorrow + 2 hours
    location: 'Main Sanctuary',
    imageUrl: null,
    status: 'UPCOMING',
    maxAttendees: 200,
    attendees: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'event_2',
    name: 'Bible Study Group',
    description: 'Weekly bible study for adults. We will be studying the Book of Romans and discussing how to apply biblical principles to our daily lives.',
    categoryId: '2',
    startTime: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
    endTime: new Date(Date.now() + 172800000 + 3600000).toISOString(), // Day after tomorrow + 1 hour
    location: 'Fellowship Hall',
    imageUrl: null,
    status: 'UPCOMING',
    maxAttendees: 50,
    attendees: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const mockApiService = {
  // Simulate API delay
  simulateApiCall: async (data, shouldFail = false) => {
    await delay(1000); // Simulate network delay
    
    if (shouldFail) {
      throw new Error('Simulated API failure');
    }
    
    return data;
  },

  // Mock user registration
  registerUser: async (userData) => {
    try {
      console.log('🎭 Mock API: Registering user:', userData);
      
      // Simulate validation
      if (!userData.email || !userData.password) {
        throw new Error('Email and password are required');
      }

      // Prevent admin email registration
      if (userData.email.endsWith('@admin.connectfaith.com')) {
        throw new Error('Admin emails cannot be registered through this form');
      }

      // Check if user already exists
      const existingUser = mockUsers.find(user => user.email === userData.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create mock user
      const newUser = {
        id: `user_${Date.now()}`,
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockUsers.push(newUser);
      
      // Log the DOB that is being included in the user record
      console.log('🎭 Mock API: Registering user with DOB:', newUser.DOB);
      console.log('🎭 Mock API: User created at:', newUser.createdAt);
      
      // Special check for birthday on signup day
      const today = new Date();
      const dob = new Date(newUser.DOB);
      if (today.getDate() === dob.getDate() && today.getMonth() === dob.getMonth()) {
        console.log('🎭 Mock API: Today is user\'s birthday!');
      }
      
      const response = await mockApiService.simulateApiCall({
        user: {
          id: newUser.id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          DOB: newUser.DOB, // Ensure DOB is properly included
          role: 'Member',
          createdAt: newUser.createdAt // Include creation timestamp
        },
        token: `mock_token_${Date.now()}`
      });

      return { success: true, data: response };
    } catch (error) {
      console.log('🎭 Mock API: Registration failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Mock user login
  loginUser: async (email, password) => {
    try {
      console.log('🎭 Mock API: Logging in user:', email);
      
      // Simulate validation
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Find user
      const user = mockUsers.find(u => u.email === email);
      if (!user) {
        throw new Error('User not found');
      }

      // Simulate password check (in real app, this would be hashed)
      if (user.password !== password) {
        throw new Error('Invalid password');
      }

      const response = await mockApiService.simulateApiCall({
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          DOB: user.DOB,
          role: user.role || 'Member'
        },
        token: `mock_token_${Date.now()}`
      });

      return { success: true, data: response };
    } catch (error) {
      console.log('🎭 Mock API: Login failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Mock get roles
  getRoles: async () => {
    try {
      console.log('🎭 Mock API: Getting roles');
      
      const response = await mockApiService.simulateApiCall(mockRoles);
      return { success: true, data: response };
    } catch (error) {
      console.log('🎭 Mock API: Get roles failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Mock get user profile
  getUserProfile: async (userId, token) => {
    try {
      console.log('🎭 Mock API: Getting user profile:', userId);
      
      const user = mockUsers.find(u => u.id === userId);
      if (!user) {
        throw new Error('User not found');
      }

      const response = await mockApiService.simulateApiCall({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        middleName: user.middleName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        DOB: user.DOB,
        street1: user.street1,
        street2: user.street2,
        city: user.city,
        region: user.region,
        postalCode: user.postalCode,
        country: user.country,
        role: 'Member',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      });

      return { success: true, data: response };
    } catch (error) {
      console.log('🎭 Mock API: Get profile failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Mock update user profile
  updateUserProfile: async (userId, updates, token) => {
    try {
      console.log('🎭 Mock API: Updating user profile:', userId, updates);
      
      const userIndex = mockUsers.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        throw new Error('User not found');
      }

      // Update user
      mockUsers[userIndex] = {
        ...mockUsers[userIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      const response = await mockApiService.simulateApiCall(mockUsers[userIndex]);

      return { success: true, data: response };
    } catch (error) {
      console.log('🎭 Mock API: Update profile failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Mock forgot password
  forgotPassword: async (email) => {
    try {
      console.log('🎭 Mock API: Forgot password for:', email);
      
      const user = mockUsers.find(u => u.email === email);
      if (!user) {
        throw new Error('User not found');
      }

      const response = await mockApiService.simulateApiCall({
        message: 'Password reset email sent successfully'
      });

      return { success: true, data: response };
    } catch (error) {
      console.log('🎭 Mock API: Forgot password failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Mock reset password
  resetPassword: async (token, newPassword) => {
    try {
      console.log('🎭 Mock API: Resetting password');
      
      const response = await mockApiService.simulateApiCall({
        message: 'Password reset successfully'
      });

      return { success: true, data: response };
    } catch (error) {
      console.log('🎭 Mock API: Reset password failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Mock event categories
  getEventCategories: async (token) => {
    try {
      console.log('🎭 Mock API: Getting event categories');
      
      const categories = [
        { id: '1', name: 'Worship Service' },
        { id: '2', name: 'Bible Study' },
        { id: '3', name: 'Youth Ministry' },
        { id: '4', name: 'Community Outreach' },
        { id: '5', name: 'Fellowship' },
        { id: '6', name: 'Mission Trip' },
      ];
      
      const response = await mockApiService.simulateApiCall(categories);
      return { success: true, data: response };
    } catch (error) {
      console.log('🎭 Mock API: Get event categories failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Mock create event
  createEvent: async (eventData, token) => {
    try {
      console.log('🎭 Mock API: Creating event:', eventData);
      
      // Simulate validation
      if (!eventData.name) {
        throw new Error('Event name is required');
      }
      if (!eventData.categoryId) {
        throw new Error('Event category is required');
      }
      if (!eventData.startTime || !eventData.endTime) {
        throw new Error('Start time and end time are required');
      }

      // Create mock event
      const newEvent = {
        id: `event_${Date.now()}`,
        ...eventData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Get existing events from storage or use defaults
      let storedEvents = [];
      try {
        const eventsJson = await AsyncStorage.getItem('mockEvents');
        storedEvents = eventsJson ? JSON.parse(eventsJson) : [...defaultMockEvents];
      } catch (err) {
        console.error('Error loading events from storage:', err);
        storedEvents = [...defaultMockEvents];
      }
      
      // Add the new event to the stored events
      storedEvents.push(newEvent);
      
      // Save back to storage
      await AsyncStorage.setItem('mockEvents', JSON.stringify(storedEvents));
      console.log('🎭 Mock API: Saved event to storage, total events:', storedEvents.length);
      
      // Directly save to broadcast storage for immediate notification
      try {
        const broadcastKey = 'broadcast_events';
        let broadcastEvents = [];
        const storedEvents = await AsyncStorage.getItem(broadcastKey);
        broadcastEvents = storedEvents ? JSON.parse(storedEvents) : [];
        
        // Add the new event with broadcast timestamp
        const broadcastEvent = {
          ...newEvent,
          broadcastTime: new Date().toISOString()
        };
        
        broadcastEvents.push(broadcastEvent);
        
        // Keep only last 20 events
        if (broadcastEvents.length > 20) {
          broadcastEvents = broadcastEvents.slice(-20);
        }
        
        await AsyncStorage.setItem(broadcastKey, JSON.stringify(broadcastEvents));
        console.log('🎭 Mock API: Added event to broadcasts directly from API');
      } catch (err) {
        console.error('Error saving to broadcast storage:', err);
      }

      const response = await mockApiService.simulateApiCall({
        event: newEvent,
        message: 'Event created successfully'
      });

      return { success: true, data: response };
    } catch (error) {
      console.log('🎭 Mock API: Create event failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Mock update event
  updateEvent: async (eventId, eventData, token) => {
    try {
      console.log('🎭 Mock API: Updating event:', eventId, eventData);
      
      // Get events from storage
      let storedEvents = [];
      try {
        const eventsJson = await AsyncStorage.getItem('mockEvents');
        storedEvents = eventsJson ? JSON.parse(eventsJson) : [];
        
        // Find and update the event
        const updatedEvents = storedEvents.map(event => {
          if (event.id === eventId) {
            return {
              ...event,
              ...eventData,
              updatedAt: new Date().toISOString()
            };
          }
          return event;
        });
        
        // Save back to storage
        await AsyncStorage.setItem('mockEvents', JSON.stringify(updatedEvents));
        console.log('🎭 Mock API: Event updated in storage');
      } catch (err) {
        console.error('Error updating event in storage:', err);
      }
      
      const updatedEvent = {
        id: eventId,
        ...eventData,
        updatedAt: new Date().toISOString()
      };
      
      const response = await mockApiService.simulateApiCall({
        event: updatedEvent,
        message: 'Event updated successfully'
      });

      return { success: true, data: response };
    } catch (error) {
      console.log('🎭 Mock API: Update event failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Mock delete event
  deleteEvent: async (eventId, token) => {
    try {
      console.log('🎭 Mock API: Deleting event:', eventId);
      
      // Get events from storage
      let storedEvents = [];
      try {
        const eventsJson = await AsyncStorage.getItem('mockEvents');
        storedEvents = eventsJson ? JSON.parse(eventsJson) : [];
        
        // Remove the event with the specified ID
        storedEvents = storedEvents.filter(event => event.id !== eventId);
        
        // Save back to storage
        await AsyncStorage.setItem('mockEvents', JSON.stringify(storedEvents));
        console.log('🎭 Mock API: Event deleted from storage, remaining:', storedEvents.length);
      } catch (err) {
        console.error('Error deleting event from storage:', err);
      }
      
      const response = await mockApiService.simulateApiCall({
        message: 'Event deleted successfully'
      });

      return { success: true, data: response };
    } catch (error) {
      console.log('🎭 Mock API: Delete event failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Mock get events
  getEvents: async (token, filters = {}) => {
    try {
      console.log('🎭 Mock API: Getting events with filters:', filters);
      
      // Get events from storage or use defaults if not found
      let mockEvents = [];
      try {
        const eventsJson = await AsyncStorage.getItem('mockEvents');
        if (eventsJson) {
          mockEvents = JSON.parse(eventsJson);
          console.log('🎭 Mock API: Retrieved events from storage, count:', mockEvents.length);
        } else {
          // First time setup - save default events to storage
          mockEvents = [...defaultMockEvents];
          await AsyncStorage.setItem('mockEvents', JSON.stringify(mockEvents));
          console.log('🎭 Mock API: Initialized storage with default events');
        }
      } catch (err) {
        console.error('Error loading events from storage:', err);
        mockEvents = [...defaultMockEvents];
      }
      
      // Apply filters if provided
      if (filters) {
        // Filter by category if specified
        if (filters.categoryId) {
          mockEvents = mockEvents.filter(event => event.categoryId === filters.categoryId);
        }
        
        // Filter by status if specified
        if (filters.status) {
          mockEvents = mockEvents.filter(event => event.status === filters.status);
        }
        
        // Filter by date range if specified
        if (filters.startDate && filters.endDate) {
          const startDate = new Date(filters.startDate);
          const endDate = new Date(filters.endDate);
          mockEvents = mockEvents.filter(event => {
            const eventDate = new Date(event.startTime);
            return eventDate >= startDate && eventDate <= endDate;
          });
        }
      }
      
      // Sort by date (most recent first)
      mockEvents.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      
      const response = await mockApiService.simulateApiCall(mockEvents);
      return { success: true, data: response };
    } catch (error) {
      console.log('🎭 Mock API: Get events failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Mock get event details
  getEventDetails: async (eventId, token) => {
    try {
      console.log('🎭 Mock API: Getting event details:', eventId);
      
      // Try to find the event in storage
      let mockEvent = null;
      try {
        const eventsJson = await AsyncStorage.getItem('mockEvents');
        if (eventsJson) {
          const storedEvents = JSON.parse(eventsJson);
          mockEvent = storedEvents.find(event => event.id === eventId);
          console.log('🎭 Mock API: Found event in storage:', !!mockEvent);
        }
      } catch (err) {
        console.error('Error finding event in storage:', err);
      }
      
      // If not found, return a sample event
      if (!mockEvent) {
        mockEvent = {
          id: eventId,
          name: 'Sample Event',
          description: 'This is a sample event description',
          categoryId: '1',
          startTime: new Date(Date.now() + 86400000).toISOString(),
          endTime: new Date(Date.now() + 86400000 + 7200000).toISOString(),
          location: 'Main Sanctuary',
          imageUrl: null,
          status: 'UPCOMING',
          maxAttendees: 200,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
      
      const response = await mockApiService.simulateApiCall(mockEvent);
      return { success: true, data: response };
    } catch (error) {
      console.log('🎭 Mock API: Get event details failed:', error.message);
      return { success: false, error: error.message };
    }
  }
};
