import AsyncStorage from '@react-native-async-storage/async-storage';

const VOLUNTEER_REGISTRATIONS_KEY = 'volunteer_registrations';

// Get all volunteer registrations
export const getVolunteerRegistrations = async () => {
  try {
    const registrations = await AsyncStorage.getItem(VOLUNTEER_REGISTRATIONS_KEY);
    return registrations ? JSON.parse(registrations) : [];
  } catch (error) {
    console.error('Error getting volunteer registrations:', error);
    return [];
  }
};

// Register a user for a volunteer role
export const registerVolunteer = async (eventId, userId, userName, userEmail, role) => {
  try {
    const registrations = await getVolunteerRegistrations();
    
    // Check if user is already registered for this event and role
    const existingRegistration = registrations.find(
      reg => reg.eventId === eventId && reg.userId === userId && reg.role === role
    );
    
    if (existingRegistration) {
      throw new Error('You are already registered for this volunteer role');
    }
    
    const newRegistration = {
      id: Date.now().toString(),
      eventId,
      userId,
      userName,
      userEmail,
      role,
      registeredAt: new Date().toISOString(),
      status: 'active'
    };
    
    registrations.push(newRegistration);
    await AsyncStorage.setItem(VOLUNTEER_REGISTRATIONS_KEY, JSON.stringify(registrations));
    
    return newRegistration;
  } catch (error) {
    console.error('Error registering volunteer:', error);
    throw error;
  }
};

// Cancel a volunteer registration
export const cancelVolunteerRegistration = async (eventId, userId, role) => {
  try {
    const registrations = await getVolunteerRegistrations();
    
    const updatedRegistrations = registrations.filter(
      reg => !(reg.eventId === eventId && reg.userId === userId && reg.role === role)
    );
    
    await AsyncStorage.setItem(VOLUNTEER_REGISTRATIONS_KEY, JSON.stringify(updatedRegistrations));
    
    return true;
  } catch (error) {
    console.error('Error canceling volunteer registration:', error);
    throw error;
  }
};

// Get volunteer registrations for a specific event
export const getEventVolunteerRegistrations = async (eventId) => {
  try {
    const registrations = await getVolunteerRegistrations();
    return registrations.filter(reg => reg.eventId === eventId);
  } catch (error) {
    console.error('Error getting event volunteer registrations:', error);
    return [];
  }
};

// Get volunteer registrations by user
export const getUserVolunteerRegistrations = async (userId) => {
  try {
    const registrations = await getVolunteerRegistrations();
    return registrations.filter(reg => reg.userId === userId);
  } catch (error) {
    console.error('Error getting user volunteer registrations:', error);
    return [];
  }
};

// Get volunteer registrations grouped by role for an event
export const getEventVolunteersByRole = async (eventId) => {
  try {
    const registrations = await getEventVolunteerRegistrations(eventId);
    
    const groupedByRole = {};
    registrations.forEach(reg => {
      if (!groupedByRole[reg.role]) {
        groupedByRole[reg.role] = [];
      }
      groupedByRole[reg.role].push(reg);
    });
    
    return groupedByRole;
  } catch (error) {
    console.error('Error getting volunteers by role:', error);
    return {};
  }
};

// Create sample volunteer data for testing
export const createSampleVolunteerData = async () => {
  try {
    const sampleRegistrations = [
      {
        id: '1',
        eventId: '1',
        userId: 'user1',
        userName: 'John Smith',
        userEmail: 'john.smith@example.com',
        role: 'Greeters',
        registeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        status: 'active'
      },
      {
        id: '2',
        eventId: '1',
        userId: 'user2',
        userName: 'Sarah Johnson',
        userEmail: 'sarah.johnson@example.com',
        role: 'Greeters',
        registeredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        status: 'active'
      },
      {
        id: '3',
        eventId: '1',
        userId: 'user3',
        userName: 'Mike Davis',
        userEmail: 'mike.davis@example.com',
        role: 'Ushers',
        registeredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        status: 'active'
      },
      {
        id: '4',
        eventId: '1',
        userId: 'user4',
        userName: 'Emily Wilson',
        userEmail: 'emily.wilson@example.com',
        role: 'Children\'s Ministry',
        registeredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        status: 'active'
      },
      {
        id: '5',
        eventId: '1',
        userId: 'user5',
        userName: 'David Brown',
        userEmail: 'david.brown@example.com',
        role: 'Sound Team',
        registeredAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
        status: 'active'
      }
    ];

    await AsyncStorage.setItem(VOLUNTEER_REGISTRATIONS_KEY, JSON.stringify(sampleRegistrations));
    console.log('Sample volunteer data created successfully');
    return sampleRegistrations;
  } catch (error) {
    console.error('Error creating sample volunteer data:', error);
    throw error;
  }
};
