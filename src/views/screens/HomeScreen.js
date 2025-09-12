import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import {
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import BirthdayWish from '../../components/BirthdayWish';
import NotificationBell from '../../components/NotificationBell';
import { useRolePermissions } from '../../components/RoleBasedAccess';
import { useAuth } from '../../context/CustomAuthContext';
import { resetNotificationState } from '../../services/eventBroadcastService';
import { useEventNotifications } from '../../services/eventNotificationService';
import { hasOngoingOrUpcomingEvents } from '../../utils/eventUtils';

const HomeScreen = ({ navigation }) => {
  const { userProfile, logout, isNewUser, clearNewUserFlag } = useAuth();
  
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

  // Clear new user flag after a delay to show welcome message
  useEffect(() => {
    if (isNewUser) {
      const timer = setTimeout(() => {
        clearNewUserFlag();
      }, 5000); // Clear after 5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [isNewUser, clearNewUserFlag]);
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

  // Social media redirect functions
  const openFacebook = () => {
    const facebookUrl = 'https://www.facebook.com/yourchurchpage'; // Replace with actual Facebook page
    Linking.openURL(facebookUrl).catch(err => console.error('Failed to open Facebook:', err));
  };

  const openInstagram = () => {
    const instagramUrl = 'https://www.instagram.com/yourchurchpage'; // Replace with actual Instagram page
    Linking.openURL(instagramUrl).catch(err => console.error('Failed to open Instagram:', err));
  };

  const openYouTube = () => {
    const youtubeUrl = 'https://www.youtube.com/yourchurchchannel'; // Replace with actual YouTube channel
    Linking.openURL(youtubeUrl).catch(err => console.error('Failed to open YouTube:', err));
  };

  // Check if there are ongoing or upcoming events
  const hasOngoingEvents = hasOngoingOrUpcomingEvents(eventsToProcess);

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
      description: 'View upcoming events',
      hasIndicator: hasOngoingEvents
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
              <Text style={[styles.welcomeText, { fontWeight: 'bold' }]}>
                {isNewUser 
                  ? `Welcome, ${userProfile?.firstName || 'User'}!` 
                  : `Welcome back, ${userProfile?.firstName || 'User'}!`
                }
              </Text>
            </View>
          </View>
          <NotificationBell />
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Connect Us Section */}
        <View style={styles.section}>
          <View style={styles.connectUsContainer}>
            <Text style={styles.sectionTitle}>Connect With Us</Text>
            <View style={styles.socialMediaContainer}>
            <TouchableOpacity style={styles.socialButton} onPress={openFacebook}>
              <View style={[styles.socialIconContainer, { backgroundColor: '#3B5998' }]}>
                <Ionicons name="logo-facebook" size={24} color="#fff" />
              </View>
              <Text style={styles.socialButtonText}>Facebook</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.socialButton} onPress={openInstagram}>
              <View style={[styles.socialIconContainer, { backgroundColor: '#E4405F' }]}>
                <Ionicons name="logo-instagram" size={24} color="#fff" />
              </View>
              <Text style={styles.socialButtonText}>Instagram</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.socialButton} onPress={openYouTube}>
              <View style={[styles.socialIconContainer, { backgroundColor: '#FF0000' }]}>
                <Ionicons name="logo-youtube" size={24} color="#fff" />
              </View>
              <Text style={styles.socialButtonText}>YouTube</Text>
            </TouchableOpacity>
            </View>
          </View>
        </View>

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
                  {feature.hasIndicator && (
                    <View style={styles.eventIndicator}>
                      <View style={styles.eventIndicatorDot} />
                    </View>
                  )}
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
    backgroundColor: '#8E44AD',
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    paddingTop: 20,
    paddingBottom: 5,
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
    position: 'relative',
  },
  eventIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  eventIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4444',
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
  socialMediaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  socialButton: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  socialIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  socialButtonText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
  },
  connectUsContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default HomeScreen;


