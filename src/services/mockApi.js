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
  },
  // Default member accounts
  {
    id: 'member-001',
    email: 'member@member.com',
    password: 'password',
    firstName: 'John',
    lastName: 'Smith',
    role: 'Member',
    DOB: '1990-01-01'
  },
  {
    id: 'member-002',
    email: 'jane.doe@example.com',
    password: 'password',
    firstName: 'Jane',
    lastName: 'Doe',
    role: 'Member',
    DOB: '1985-05-15'
  },
  {
    id: 'member-003',
    email: 'mike.johnson@example.com',
    password: 'password',
    firstName: 'Mike',
    lastName: 'Johnson',
    role: 'Member',
    DOB: '1992-08-22'
  },
  {
    id: 'member-004',
    email: 'sarah.wilson@example.com',
    password: 'password',
    firstName: 'Sarah',
    lastName: 'Wilson',
    role: 'Member',
    DOB: '1988-12-10'
  },
  {
    id: 'member-005',
    email: 'david.brown@example.com',
    password: 'password',
    firstName: 'David',
    lastName: 'Brown',
    role: 'Member',
    DOB: '1995-03-18'
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
    attendees: ['member-001', 'member-002', 'member-003'], // Sample RSVPs
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
    attendees: ['member-001', 'member-004'], // Sample RSVPs
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

      // Debug logging to see all available users
      console.log('🎭 Mock API: Available users:', mockUsers.map(u => u.email));

      // Find user - case insensitive email comparison
      const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        console.log('🎭 Mock API: No user found with email:', email);
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
        
        // Ensure we always have at least the default events
        if (mockEvents.length === 0) {
          mockEvents = [...defaultMockEvents];
          await AsyncStorage.setItem('mockEvents', JSON.stringify(mockEvents));
          console.log('🎭 Mock API: Re-initialized storage with default events');
        }
      } catch (err) {
        console.error('Error loading events from storage:', err);
        mockEvents = [...defaultMockEvents];
        // Try to save defaults to storage
        try {
          await AsyncStorage.setItem('mockEvents', JSON.stringify(mockEvents));
        } catch (saveErr) {
          console.error('Error saving default events to storage:', saveErr);
        }
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
        } else {
          // If no events in storage, try to find in default events
          mockEvent = defaultMockEvents.find(event => event.id === eventId);
          console.log('🎭 Mock API: Found event in default events:', !!mockEvent);
        }
      } catch (err) {
        console.error('Error finding event in storage:', err);
        // Try to find in default events as fallback
        mockEvent = defaultMockEvents.find(event => event.id === eventId);
      }
      
      // If not found, return a sample event
      if (!mockEvent) {
        console.log('🎭 Mock API: Event not found, creating sample event');
        mockEvent = {
          id: eventId,
          name: 'Sample Event',
          title: 'Sample Event',
          description: 'This is a sample event description',
          categoryId: '1',
          startTime: new Date(Date.now() + 86400000).toISOString(),
          endTime: new Date(Date.now() + 86400000 + 7200000).toISOString(),
          date: new Date(Date.now() + 86400000).toISOString(),
          location: 'Main Sanctuary',
          imageUrl: null,
          status: 'UPCOMING',
          maxAttendees: 200,
          attendees: [],
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
  },

  // Mock RSVP for event
  rsvpEvent: async (eventId, memberId, token) => {
    try {
      console.log('🎭 Mock API: RSVP for event:', eventId, 'by member:', memberId);
      
      // Get events from storage
      let storedEvents = [];
      try {
        const eventsJson = await AsyncStorage.getItem('mockEvents');
        if (eventsJson) {
          storedEvents = JSON.parse(eventsJson);
        } else {
          // If no events in storage, use default events and save them
          storedEvents = [...defaultMockEvents];
          await AsyncStorage.setItem('mockEvents', JSON.stringify(storedEvents));
          console.log('🎭 Mock API: Initialized storage with default events for RSVP');
        }
      } catch (err) {
        console.error('Error loading events from storage:', err);
        storedEvents = [...defaultMockEvents];
      }
      
      // Find the event
      const eventIndex = storedEvents.findIndex(event => event.id === eventId);
      if (eventIndex === -1) {
        throw new Error('Event not found');
      }
      
      const event = storedEvents[eventIndex];
      
      // Check if member is already RSVP'd
      const isAlreadyRSVPd = event.attendees && event.attendees.includes(memberId);
      
      if (isAlreadyRSVPd) {
        // Remove RSVP
        event.attendees = event.attendees.filter(id => id !== memberId);
        console.log('🎭 Mock API: Removed RSVP for member:', memberId);
      } else {
        // Add RSVP
        if (!event.attendees) {
          event.attendees = [];
        }
        event.attendees.push(memberId);
        console.log('🎭 Mock API: Added RSVP for member:', memberId);
      }
      
      // Update the event in storage
      storedEvents[eventIndex] = {
        ...event,
        updatedAt: new Date().toISOString()
      };
      
      await AsyncStorage.setItem('mockEvents', JSON.stringify(storedEvents));
      
      const response = await mockApiService.simulateApiCall({
        success: true,
        eventId: eventId,
        memberId: memberId,
        isRSVPd: !isAlreadyRSVPd,
        attendanceCount: event.attendees.length,
        message: isAlreadyRSVPd ? 'RSVP cancelled successfully' : 'RSVP successful'
      });
      
      return { success: true, data: response };
    } catch (error) {
      console.log('🎭 Mock API: RSVP failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Mock create notification
  createNotification: async (notificationData, token) => {
    try {
      console.log('🎭 Mock API: Creating notification:', notificationData);
      
      // Get existing notifications from storage
      let storedNotifications = [];
      try {
        const notificationsJson = await AsyncStorage.getItem('mockNotifications');
        storedNotifications = notificationsJson ? JSON.parse(notificationsJson) : [];
      } catch (err) {
        console.error('Error loading notifications from storage:', err);
      }
      
      // Create new notification
      const newNotification = {
        id: `notification_${Date.now()}`,
        ...notificationData,
        timestamp: new Date().toISOString(),
        read: false
      };
      
      // Add to stored notifications
      storedNotifications.push(newNotification);
      
      // Keep only last 100 notifications to prevent storage overflow
      if (storedNotifications.length > 100) {
        storedNotifications = storedNotifications.slice(-100);
      }
      
      // Save back to storage
      await AsyncStorage.setItem('mockNotifications', JSON.stringify(storedNotifications));
      
      // Also add to broadcast notifications for real-time updates
      try {
        const broadcastKey = 'broadcast_notifications';
        let broadcastNotifications = [];
        const storedBroadcasts = await AsyncStorage.getItem(broadcastKey);
        broadcastNotifications = storedBroadcasts ? JSON.parse(storedBroadcasts) : [];
        
        broadcastNotifications.push(newNotification);
        
        // Keep only last 50 broadcast notifications
        if (broadcastNotifications.length > 50) {
          broadcastNotifications = broadcastNotifications.slice(-50);
        }
        
        await AsyncStorage.setItem(broadcastKey, JSON.stringify(broadcastNotifications));
        console.log('🎭 Mock API: Added notification to broadcast storage');
      } catch (err) {
        console.error('Error saving to broadcast storage:', err);
      }
      
      const response = await mockApiService.simulateApiCall({
        success: true,
        notification: newNotification,
        message: 'Notification created successfully'
      });
      
      return { success: true, data: response };
    } catch (error) {
      console.log('🎭 Mock API: Create notification failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Mock get all members
  getAllMembers: async (token) => {
    try {
      console.log('🎭 Mock API: Getting all members');
      
      // Filter out admin users and return only members
      const members = mockUsers.filter(user => user.role === 'Member');
      
      const response = await mockApiService.simulateApiCall(members);
      return { success: true, data: response };
    } catch (error) {
      console.log('🎭 Mock API: Get all members failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Mock get event RSVP details (all members with their RSVP status for a specific event)
  getEventRSVPDetails: async (eventId, token) => {
    try {
      console.log('🎭 Mock API: Getting RSVP details for event:', eventId);
      
      // Get the event details
      const eventResponse = await mockApiService.getEventDetails(eventId, token);
      if (!eventResponse.success) {
        throw new Error('Event not found');
      }
      
      const event = eventResponse.data;
      const rsvpMemberIds = event.attendees || [];
      
      // Get all members
      const membersResponse = await mockApiService.getAllMembers(token);
      if (!membersResponse.success) {
        throw new Error('Failed to get members');
      }
      
      const allMembers = membersResponse.data;
      
      // Create RSVP details for each member
      const rsvpDetails = allMembers.map(member => ({
        id: member.id,
        name: `${member.firstName} ${member.lastName}`,
        email: member.email,
        status: rsvpMemberIds.includes(member.id) ? 'Attending' : 'Pending',
        rsvpDate: rsvpMemberIds.includes(member.id) 
          ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
          : null
      }));
      
      const response = await mockApiService.simulateApiCall({
        eventId: eventId,
        eventName: event.name || event.title,
        totalMembers: allMembers.length,
        attendingCount: rsvpMemberIds.length,
        pendingCount: allMembers.length - rsvpMemberIds.length,
        rsvpDetails: rsvpDetails
      });
      
      return { success: true, data: response };
    } catch (error) {
      console.log('🎭 Mock API: Get event RSVP details failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Mock get events with RSVP counts
  getEventsWithRSVPCounts: async (token) => {
    try {
      console.log('🎭 Mock API: Getting events with RSVP counts');
      
      // Get all events
      const eventsResponse = await mockApiService.getEvents(token);
      if (!eventsResponse.success) {
        throw new Error('Failed to get events');
      }
      
      const events = eventsResponse.data;
      
      // Add RSVP counts to each event
      const eventsWithCounts = events.map(event => ({
        ...event,
        rsvpCount: (event.attendees || []).length,
        totalMembers: mockUsers.filter(user => user.role === 'Member').length
      }));
      
      const response = await mockApiService.simulateApiCall(eventsWithCounts);
      return { success: true, data: response };
    } catch (error) {
      console.log('🎭 Mock API: Get events with RSVP counts failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Mock create notifications for all members when an event is created
  createEventNotificationsForAllMembers: async (event, token) => {
    try {
      console.log('🎭 Mock API: Creating event notifications for all members:', event.name || event.title);
      
      // Get all members (exclude admin users)
      const members = mockUsers.filter(user => user.role === 'Member');
      console.log('🎭 Mock API: Found members to notify:', members.length);
      
      const eventTitle = event.name || event.title;
      const eventDate = event.startTime || event.date;
      
      // Create notification for each member
      for (const member of members) {
        const notificationData = {
          type: 'event',
          title: `New Event: ${eventTitle}`,
          message: `A new event "${eventTitle}" has been created. ${event.description ? event.description.substring(0, 100) + '...' : 'Check it out!'}`,
          eventId: event.id,
          eventDate: eventDate,
          isReminder: false,
          memberId: member.id,
          eventDetails: {
            title: eventTitle,
            date: eventDate,
            location: event.location || 'TBD',
            description: event.description || ''
          }
        };
        
        // Create individual notification for this member
        await mockApiService.createNotification(notificationData, token);
        console.log('🎭 Mock API: Created notification for member:', member.firstName, member.lastName);
      }
      
      const response = await mockApiService.simulateApiCall({
        success: true,
        message: `Notifications sent to ${members.length} members`,
        memberCount: members.length
      });
      
      return { success: true, data: response };
    } catch (error) {
      console.log('🎭 Mock API: Create event notifications for all members failed:', error.message);
      return { success: false, error: error.message };
    }
  }
};
