import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';

import { mockApiService } from '../services/mockApi';
import { hasOngoingOrUpcomingEvents } from '../utils/eventUtils';
import AnnouncementsScreen from '../views/screens/AnnouncementsScreen';
import ChatScreen from '../views/screens/ChatScreen';
import ContactListScreen from '../views/screens/ContactListScreen';
import DonationsScreen from '../views/screens/DonationsScreen';
import EventDetailsScreen from '../views/screens/EventDetailsScreen';
import EventsCalendarScreen from '../views/screens/EventsCalendarScreen';
import HomeScreen from '../views/screens/HomeScreen';
import NotificationCenterScreen from '../views/screens/NotificationCenterScreen';
import NotificationScreen from '../views/screens/NotificationScreen';
import PrayerWallScreen from '../views/screens/PrayerWallScreen';
import ProfileSettingsScreen from '../views/screens/ProfileSettingsScreen';
import SermonArchiveScreen from '../views/screens/SermonArchiveScreen';
import SermonDetailsScreen from '../views/screens/SermonDetailsScreen';
import ServicesScreen from '../views/screens/ServicesScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Home Stack for screens accessible from Home tab
function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
      <Stack.Screen name="Notifications" component={NotificationCenterScreen} />
      <Stack.Screen name="Announcements" component={AnnouncementsScreen} />
      <Stack.Screen name="Donations" component={DonationsScreen} />
      <Stack.Screen name="Events" component={EventsCalendarScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="PrayerWall" component={PrayerWallScreen} />
      <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
    </Stack.Navigator>
  );
}

// Sermons Stack for screens accessible from Sermons tab
function SermonsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="SermonsMain" component={SermonArchiveScreen} />
      <Stack.Screen name="SermonDetails" component={SermonDetailsScreen} />
    </Stack.Navigator>
  );
}

// Profile Stack for screens accessible from Profile tab
function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileSettingsScreen} />
      <Stack.Screen name="ContactList" component={ContactListScreen} />
      <Stack.Screen name="Services" component={ServicesScreen} />
    </Stack.Navigator>
  );
}

export default function UserTabs() {
  const [hasEvents, setHasEvents] = useState(false);

  // Fetch events to check for ongoing/upcoming events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await mockApiService.getEvents();
        if (response.success && response.data) {
          const hasOngoingEvents = hasOngoingOrUpcomingEvents(response.data);
          setHasEvents(hasOngoingEvents);
        }
      } catch (error) {
        console.error('Error fetching events for indicator:', error);
      }
    };

    fetchEvents();
    
    // Refresh every 30 seconds to catch new events
    const interval = setInterval(fetchEvents, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Events') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Pray') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Sermons') {
            iconName = focused ? 'play-circle' : 'play-circle-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          // Add event indicator for Events tab
          if (route.name === 'Events' && hasEvents) {
            return (
              <View style={{ position: 'relative' }}>
                <Ionicons name={iconName} size={size} color={color} />
                <View style={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#FF4444',
                  borderWidth: 1,
                  borderColor: '#fff'
                }} />
              </View>
            );
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6699CC',
        tabBarInactiveTintColor: '#999999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          paddingTop: Platform.OS === 'ios' ? 8 : 8,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          height: Platform.OS === 'ios' ? 90 : 80,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack}
        options={{
          title: 'Home',
        }}
      />
      <Tab.Screen 
        name="Events" 
        component={EventsCalendarScreen}
        options={{
          title: 'Events',
        }}
      />
      <Tab.Screen 
        name="Pray" 
        component={PrayerWallScreen}
        options={{
          title: 'Pray',
        }}
      />
      <Tab.Screen 
        name="Sermons" 
        component={SermonsStack}
        options={{
          title: 'Sermons',
        }}
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{
          title: 'Chat',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack}
        options={{
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}


