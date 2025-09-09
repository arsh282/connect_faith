import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import BirthdayWish from '../../components/BirthdayWish';
import NotificationBell from '../../components/NotificationBell';
import { RoleIndicator, useRolePermissions } from '../../components/RoleBasedAccess';
import { useAuth } from '../../context/CustomAuthContext';
import { resetNotificationState } from '../../services/eventBroadcastService';
import { useEventNotifications } from '../../services/eventNotificationService';

const HomeScreen = ({ navigation }) => {
  const { userProfile, logout } = useAuth();
  
  useEffect(() => {
    // Log user profile information for debugging birthday wish feature
    console.log('🏠 HomeScreen: User profile loaded:', userProfile ? 'Yes' : 'No');
    if (userProfile) {
      console.log('🏠 HomeScreen: User details:', {
        name: userProfile.firstName,
        DOB: userProfile.DOB,
        createdAt: userProfile.createdAt
      });
      
      // Check if today is user's birthday
      if (userProfile.DOB) {
        const today = new Date();
        const dob = new Date(userProfile.DOB);
        
        if (today.getDate() === dob.getDate() && today.getMonth() === dob.getMonth()) {
          console.log('🏠 HomeScreen: Today is user\'s birthday!');
        }
        
        // Check if user signed up today
        if (userProfile.createdAt) {
          const createdDate = new Date(userProfile.createdAt);
          const isSignupToday = today.toDateString() === createdDate.toDateString();
          
          if (isSignupToday) {
            console.log('🏠 HomeScreen: User signed up today!');
          }
        }
      }
    }
  }, [userProfile]);
  const permissions = useRolePermissions();
  
  // Get events data from the API
  const [events, setEvents] = React.useState([]);
  
  // Fetch events when the component mounts and periodically refresh
  React.useEffect(() => {
    let isMounted = true;
    
    async function fetchEvents() {
      try {
        if (!isMounted) return;
        
        // Import dynamically to avoid circular dependencies
        const { mockApiService } = require('../../services/mockApi');
        
        // Fetch events from the API (mock or real)
        const response = await mockApiService.getEvents();
        
        if (response.success && response.data && isMounted) {
          console.log('📅 Fetched events:', response.data.length);
          setEvents(response.data);
        }
      } catch (error) {
        console.error('❌ Error fetching events:', error);
      }
    }
    
    // Initial fetch
    fetchEvents();
    
    // Set up periodic refresh (every 30 seconds) to catch new events
    const intervalId = setInterval(() => {
      console.log('📅 Refreshing events data...');
      fetchEvents();
    }, 30000); // 30 seconds
    
    // Clean up
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);
  
  // Filter events for non-admin users and ensure it's a valid array
  const eventsToProcess = React.useMemo(() => {
    // Double ensure events is always an array
    const eventsArray = Array.isArray(events) ? events : [];
    return userProfile?.role === 'Admin' ? [] : eventsArray;
  }, [userProfile?.role, events]);
  
  // Always call hooks at the top level - the hook itself will now safely handle undefined/null events
  useEventNotifications(eventsToProcess);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  // Function to reset notification state for testing
  const handleResetNotifications = async () => {
    if (userProfile?.id) {
      try {
        await resetNotificationState(userProfile.id);
        alert('Notification system reset. Please restart the app to see new notifications.');
      } catch (error) {
        console.error('Error resetting notifications:', error);
        alert('Failed to reset notifications');
      }
    }
  };

  const navigateToScreen = (screenName) => {
    navigation.navigate(screenName);
  };

  // Member features
  const memberFeatures = [
    {
      title: 'Prayer Request',
      icon: 'heart-outline',
      color: '#6699CC',
      screen: 'PrayerWall',
      description: 'Submit and pray for requests'
    },
    {
      title: 'Community Chat',
      icon: 'chatbubbles-outline',
      color: '#6699CC',
      screen: 'Chat',
      description: 'Connect with church members'
    },
    {
      title: 'Events',
      icon: 'calendar-outline',
      color: '#6699CC',
      screen: 'Events',
      description: 'View upcoming events'
    },
    {
      title: 'Sermons',
      icon: 'play-circle-outline',
      color: '#6699CC',
      screen: 'Sermons',
      description: 'Watch and listen to sermons'
    },
    {
      title: 'Donations',
      icon: 'card-outline',
      color: '#6699CC',
      screen: 'Donations',
      description: 'Support our ministry'
    },
    {
      title: 'Announcements',
      icon: 'megaphone-outline',
      color: '#6699CC',
      screen: 'Announcements',
      description: 'Stay updated with news'
    }
  ];

  // Admin features
  const adminFeatures = [
    {
      title: 'Create Event',
      icon: 'add-circle-outline',
      color: '#FFCC00',
      screen: 'CreateEvent',
      description: 'Add new church events',
      requiresAdmin: true
    },
    {
      title: 'Create Announcement',
      icon: 'megaphone-outline',
      color: '#FFCC00',
      screen: 'CreateAnnouncement',
      description: 'Post church announcements',
      requiresAdmin: true
    },
    {
      title: 'Upload Sermon',
      icon: 'cloud-upload-outline',
      color: '#FFCC00',
      screen: 'UploadSermon',
      description: 'Add new sermon content',
      requiresAdmin: true
    },
    {
      title: 'User Management',
      icon: 'people-outline',
      color: '#FFCC00',
      screen: 'UserManagement',
      description: 'Manage church members',
      requiresAdmin: true
    },
    {
      title: 'Reports',
      icon: 'analytics-outline',
      color: '#FFCC00',
      screen: 'DonationReports',
      description: 'View church analytics',
      requiresAdmin: true
    },
    {
      title: 'Moderation',
      icon: 'shield-checkmark-outline',
      color: '#FFCC00',
      screen: 'ModerationCenter',
      description: 'Moderate content',
      requiresAdmin: true
    }
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6699CC" />
      
      {/* Birthday Wish Modal */}
      <BirthdayWish userProfile={userProfile} />
      
      {/* Header */}
      <LinearGradient
        colors={['#6699CC', '#6699CC']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <View style={styles.profileImage}>
              <Ionicons name="person" size={24} color="#fff" />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.welcomeText}>Welcome back!</Text>
              <Text style={styles.userName}>{userProfile?.fullName || 'User'}</Text>
              <View style={styles.roleContainer}>
                <RoleIndicator role={userProfile?.role} />
              </View>
            </View>
          </View>
          {userProfile?.role === 'Admin' ? (
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color="#fff" />
            </TouchableOpacity>
          ) : (
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.resetButton} 
                onPress={handleResetNotifications}
              >
                <Ionicons name="refresh" size={18} color="#fff" />
              </TouchableOpacity>
              <NotificationBell onLogout={handleLogout} />
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What would you like to do today?</Text>
          
          {/* Member Features */}
          <View style={styles.featuresGrid}>
            {memberFeatures.map((feature, index) => (
              <TouchableOpacity
                key={index}
                style={styles.featureCard}
                onPress={() => navigateToScreen(feature.screen)}
              >
                <View style={[styles.iconContainer, { backgroundColor: feature.color + '20' }]}>
                  <Ionicons name={feature.icon} size={28} color={feature.color} />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Admin Features */}
          {permissions.isAdmin() && (
            <>
              <Text style={styles.adminSectionTitle}>Admin Tools</Text>
              <View style={styles.featuresGrid}>
                {adminFeatures.map((feature, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.featureCard}
                    onPress={() => navigateToScreen(feature.screen)}
                  >
                    <View style={[styles.iconContainer, { backgroundColor: feature.color + '20' }]}>
                      <Ionicons name={feature.icon} size={28} color={feature.color} />
                    </View>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6699CC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userDetails: {
    flex: 1,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
  userName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
  roleContainer: {
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetButton: {
    marginRight: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    paddingTop: 20,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  adminSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFCC00',
    marginTop: 30,
    marginBottom: 15,
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default HomeScreen;


