import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../context/CustomAuthContext';
import { useNotifications } from '../../context/NotificationsContext';
import { mockApiService } from '../../services/mockApi';
import {
    cancelVolunteerRegistration,
    getUserVolunteerRegistrations,
    registerVolunteer
} from '../../services/volunteerService';

const { width, height } = Dimensions.get('window');

export default function EventDetailsScreen({ navigation, route }) {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const { event: rawEvent, eventId } = route?.params || {};
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRSVP, setIsRSVP] = useState(false);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [showVolunteerModal, setShowVolunteerModal] = useState(false);
  const [selectedVolunteerRole, setSelectedVolunteerRole] = useState('');
  const [isVolunteering, setIsVolunteering] = useState(false);
  const [isRSVPLoading, setIsRSVPLoading] = useState(false);

  // Load event data on component mount
  useEffect(() => {
    loadEventData();
  }, [rawEvent, eventId]);

  // Re-check RSVP status when user changes
  useEffect(() => {
    if (event && user?.id) {
      const isUserRSVPd = event?.attendees?.includes(user.id) || false;
      setIsRSVP(isUserRSVPd);
    }
  }, [event, user?.id]);

  const loadEventData = async () => {
    try {
      setLoading(true);
      
      if (rawEvent) {
        // Event object was passed directly
        const eventWithDefaults = {
          ...rawEvent,
          needsVolunteers: rawEvent?.needsVolunteers ?? true,
          volunteerRoles: rawEvent?.volunteerRoles ?? ['Greeters', 'Ushers', 'Children\'s Ministry', 'Sound Team', 'Parking Attendants', 'Welcome Team']
        };
        setEvent(eventWithDefaults);
        // Check if current user is already RSVP'd
        const isUserRSVPd = eventWithDefaults?.attendees?.includes(user?.id) || false;
        setIsRSVP(isUserRSVPd);
        setAttendanceCount(eventWithDefaults?.attendees?.length || 0);
      } else if (eventId) {
        // Only eventId was passed, need to fetch event details
        const eventResponse = await mockApiService.getEventDetails(eventId, 'mock_token');
        if (eventResponse.success) {
          const eventData = eventResponse.data;
          const eventWithDefaults = {
            ...eventData,
            needsVolunteers: eventData?.needsVolunteers ?? true,
            volunteerRoles: eventData?.volunteerRoles ?? ['Greeters', 'Ushers', 'Children\'s Ministry', 'Sound Team', 'Parking Attendants', 'Welcome Team']
          };
          setEvent(eventWithDefaults);
          // Check if current user is already RSVP'd
          const isUserRSVPd = eventWithDefaults?.attendees?.includes(user?.id) || false;
          setIsRSVP(isUserRSVPd);
          setAttendanceCount(eventWithDefaults?.attendees?.length || 0);
        } else {
          throw new Error('Event not found');
        }
      } else {
        // No event data provided, use default event
        const defaultEvent = {
          id: 'event_1',
          name: 'Sunday Worship Service',
          title: 'Sunday Worship Service',
          date: new Date(Date.now() + 86400000).toISOString(),
          startTime: new Date(Date.now() + 86400000).toISOString(),
          time: '10:00 AM',
          location: 'Main Sanctuary',
          type: 'service',
          description: 'Join us for our weekly worship service with inspiring music, prayer, and fellowship. All are welcome to come and worship together.',
          image: require('../../../assets/images/events-placeholder.png'),
          attendees: 0,
          maxAttendees: 200,
          isRSVP: false,
          needsVolunteers: true,
          volunteerRoles: ['Greeters', 'Ushers', 'Children\'s Ministry', 'Sound Team']
        };
        setEvent(defaultEvent);
        setIsRSVP(false);
        setAttendanceCount(0);
      }
    } catch (error) {
      console.error('Failed to load event data:', error);
      Alert.alert('Error', 'Failed to load event details. Please try again.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // Check if user is already registered as a volunteer for this event
  useEffect(() => {
    const checkVolunteerStatus = async () => {
      if (user?.id && event?.id) {
        try {
          const userRegistrations = await getUserVolunteerRegistrations(user.id);
          const eventRegistration = userRegistrations.find(reg => reg.eventId === event.id);
          
          if (eventRegistration) {
            setIsVolunteering(true);
            setSelectedVolunteerRole(eventRegistration.role);
          }
        } catch (error) {
          console.error('Error checking volunteer status:', error);
        }
      }
    };

    checkVolunteerStatus();
  }, [user?.id, event?.id]);

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'service': return '#6699CC';
      case 'youth': return '#FFCC00';
      case 'study': return '#6699CC';
      case 'outreach': return '#FFCC00';
      default: return '#6699CC';
    }
  };

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'service': return 'church';
      case 'youth': return 'people';
      case 'study': return 'book';
      case 'outreach': return 'heart';
      default: return 'calendar';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleRSVP = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'Please log in to RSVP for events.');
      return;
    }

    if (isRSVPLoading) return;

    console.log('🎫 RSVP: Starting RSVP process for event:', event.id, 'user:', user.id);
    setIsRSVPLoading(true);

    try {
      // Call the mock API to RSVP
      const response = await mockApiService.rsvpEvent(event.id, user.id, 'mock_token');
      
      if (response.success) {
        const { isRSVPd, attendanceCount: newAttendanceCount } = response.data;
        
        console.log('🎫 RSVP: Success! isRSVPd:', isRSVPd, 'attendanceCount:', newAttendanceCount);
        
        // Update local state
        setIsRSVP(isRSVPd);
        setAttendanceCount(newAttendanceCount);
        
        // Show success message
    Alert.alert(
      'RSVP Updated',
          isRSVPd ? 'You have successfully RSVP\'d for this event!' : 'You have cancelled your RSVP for this event.',
          [{ text: 'OK' }]
        );

        // If RSVP was successful, create admin notification
        if (isRSVPd) {
          const memberName = user.name || user.displayName || user.firstName || 'Member';
          const eventTitle = event.title || event.name || 'Event';
          
          const notificationData = {
            type: 'rsvp',
            title: 'New RSVP',
            message: `Member ${memberName} has RSVP'd for ${eventTitle}`,
            eventId: event.id,
            memberId: user.id,
            memberName: memberName,
            eventTitle: eventTitle,
            timestamp: new Date().toISOString()
          };

          // Create notification for admin using the mock API
          await mockApiService.createNotification(notificationData, 'mock_token');
          
          console.log('🔔 RSVP notification created for admin:', notificationData);
        }
      } else {
        throw new Error(response.error || 'RSVP failed');
      }
    } catch (error) {
      console.error('RSVP Error:', error);
      Alert.alert(
        'RSVP Error',
        error.message || 'Failed to update RSVP. Please try again.',
      [{ text: 'OK' }]
    );
    } finally {
      setIsRSVPLoading(false);
    }
  };

  const handleDonation = () => {
    navigation.navigate('Donations');
  };

  const handleVolunteer = () => {
    setShowVolunteerModal(true);
  };

  const handleVolunteerRoleSelect = async (role) => {
    if (!user?.id) {
      Alert.alert('Error', 'Please log in to volunteer for events.');
      return;
    }

    try {
      await registerVolunteer(
        event.id,
        user.id,
        user.name || user.displayName || 'User',
        user.email || '',
        role
      );
      
      setSelectedVolunteerRole(role);
      setIsVolunteering(true);
      setShowVolunteerModal(false);
      
      Alert.alert(
        'Volunteer Registration Successful!',
        `Thank you for volunteering as ${role}! The admin has been notified and you will be contacted with more details.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error registering volunteer:', error);
      Alert.alert(
        'Registration Error',
        error.message || 'Failed to register as volunteer. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleCancelVolunteer = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'Please log in to manage volunteer registrations.');
      return;
    }

    try {
      await cancelVolunteerRegistration(event.id, user.id, selectedVolunteerRole);
      
      setIsVolunteering(false);
      setSelectedVolunteerRole('');
      
      Alert.alert(
        'Volunteer Registration Cancelled',
        'You have successfully cancelled your volunteer registration for this event.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error cancelling volunteer registration:', error);
      Alert.alert(
        'Cancellation Error',
        'Failed to cancel volunteer registration. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Show loading state while event data is being loaded
  if (loading || !event) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#6699CC" translucent />
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Event Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading event details...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6699CC" translucent />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Details</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroSection}>
          <Image 
            source={event.image || require('../../../assets/images/events-placeholder.png')}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay} />
          <View style={styles.eventTypeBadge}>
            <Ionicons name={getEventTypeIcon(event?.type)} size={16} color="#fff" />
            <Text style={styles.eventTypeText}>{(event.type || 'event').toUpperCase()}</Text>
          </View>
          <View style={styles.heroGradient} />
        </View>

        {/* Event Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.eventHeader}>
            <Text style={styles.eventTitle}>{event.title || event.name || 'Event'}</Text>
            <View style={styles.eventStatusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Upcoming</Text>
            </View>
          </View>
          
          <View style={styles.eventMeta}>
            <View style={styles.metaItem}>
              <View style={styles.metaIconContainer}>
                <Ionicons name="calendar" size={18} color="#fff" />
              </View>
              <View style={styles.metaContent}>
                <Text style={styles.metaLabel}>Date</Text>
                <Text style={styles.metaText}>{formatDate(event.date || event.startTime || new Date())}</Text>
              </View>
            </View>
            <View style={styles.metaItem}>
              <View style={styles.metaIconContainer}>
                <Ionicons name="time" size={18} color="#fff" />
              </View>
              <View style={styles.metaContent}>
                <Text style={styles.metaLabel}>Time</Text>
                <Text style={styles.metaText}>{event.time || 'TBD'}</Text>
              </View>
            </View>
            <View style={styles.metaItem}>
              <View style={styles.metaIconContainer}>
                <Ionicons name="location" size={18} color="#fff" />
              </View>
              <View style={styles.metaContent}>
                <Text style={styles.metaLabel}>Location</Text>
                <Text style={styles.metaText}>{event.location || 'Location TBD'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionTitle}>About This Event</Text>
            <Text style={styles.description}>{event.description || 'No description available.'}</Text>
          </View>

          {/* Attendance */}
          <View style={styles.attendanceSection}>
            <View style={styles.attendanceHeader}>
              <Text style={styles.sectionTitle}>Attendance</Text>
              <Text style={styles.attendanceCount}>{attendanceCount}/{event.maxAttendees || 100}</Text>
            </View>
            <View style={styles.attendanceBar}>
              <View style={styles.attendanceProgress}>
                <View 
                  style={[
                    styles.attendanceFill, 
                    { width: `${(attendanceCount / (event.maxAttendees || 100)) * 100}%` }
                  ]} 
                />
              </View>
            </View>
            <Text style={styles.attendanceText}>
              {event.maxAttendees - attendanceCount} spots remaining
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[
              styles.actionButton,
              styles.rsvpButton,
              isRSVP && styles.rsvpButtonActive,
              isRSVPLoading && styles.rsvpButtonLoading
            ]}
            onPress={handleRSVP}
            disabled={isRSVPLoading}
          >
            <View style={styles.actionButtonContent}>
              <Ionicons 
                name={isRSVPLoading ? "hourglass" : (isRSVP ? "checkmark-circle" : "add-circle-outline")} 
                size={22} 
                color={isRSVP ? "#fff" : "#6699CC"} 
              />
              <Text style={[
                styles.actionButtonText,
                isRSVP && styles.actionButtonTextActive
              ]}>
                {isRSVPLoading ? 'Processing...' : (isRSVP ? 'RSVP\'d' : 'RSVP')}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.donationButton]}
            onPress={handleDonation}
          >
            <View style={styles.actionButtonContent}>
              <Ionicons name="heart" size={22} color="#E74C3C" />
              <Text style={styles.actionButtonText}>Donate</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Volunteer Section */}
        {(event?.needsVolunteers || event?.volunteerRoles?.length > 0) && (
          <View style={styles.volunteerSection}>
            <View style={styles.volunteerHeader}>
              <Text style={styles.sectionTitle}>Volunteer Opportunities</Text>
              <View style={styles.volunteerCount}>
                <Ionicons name="people" size={16} color="#FFCC00" />
                <Text style={styles.volunteerCountText}>{event.volunteerRoles?.length || 0} roles available</Text>
              </View>
            </View>
            
            {isVolunteering ? (
              <View style={styles.volunteerStatusCard}>
                <View style={styles.volunteerStatusHeader}>
                  <View style={styles.volunteerStatusIcon}>
                    <Ionicons name="checkmark-circle" size={24} color="#27AE60" />
                  </View>
                  <View style={styles.volunteerStatusContent}>
                    <Text style={styles.volunteerStatusTitle}>You're Volunteering!</Text>
                    <Text style={styles.volunteerRoleText}>Role: {selectedVolunteerRole}</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.cancelVolunteerButton}
                  onPress={handleCancelVolunteer}
                >
                  <Ionicons name="close-circle" size={16} color="#fff" />
                  <Text style={styles.cancelVolunteerButtonText}>Cancel Volunteer</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <TouchableOpacity 
                  style={styles.volunteerButton}
                  onPress={handleVolunteer}
                >
                  <View style={styles.volunteerButtonContent}>
                    <View style={styles.volunteerButtonIcon}>
                      <Ionicons name="people" size={24} color="#FFCC00" />
                    </View>
                    <View style={styles.volunteerButtonTextContainer}>
                      <Text style={styles.volunteerButtonText}>Volunteer for this Event</Text>
                      <Text style={styles.volunteerButtonSubtext}>Help make this event amazing</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#FFCC00" />
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Additional Info */}
        <View style={styles.additionalInfo}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          
          <View style={styles.infoItem}>
            <Ionicons name="information-circle" size={20} color="#6699CC" />
            <Text style={styles.infoText}>
              Please arrive 10 minutes early to find parking and get settled.
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="restaurant" size={20} color="#6699CC" />
            <Text style={styles.infoText}>
              Light refreshments will be served after the event.
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="car" size={20} color="#6699CC" />
            <Text style={styles.infoText}>
              Free parking available in the church parking lot.
            </Text>
          </View>
        </View>

        {/* Contact */}
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Questions?</Text>
          <TouchableOpacity style={styles.contactButton}>
            <Ionicons name="mail" size={20} color="#6699CC" />
            <Text style={styles.contactButtonText}>Contact Event Organizer</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Volunteer Role Selection Modal */}
      <Modal
        visible={showVolunteerModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowVolunteerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Volunteer Role</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowVolunteerModal(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.modalDescription}>
                Choose a volunteer role for this event:
              </Text>
              
              {(event.volunteerRoles || []).map((role, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.volunteerRoleOption}
                  onPress={() => handleVolunteerRoleSelect(role)}
                >
                  <View style={styles.volunteerRoleInfo}>
                    <Ionicons name="person" size={20} color="#FFCC00" />
                    <Text style={styles.volunteerRoleText}>{role}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
    backgroundColor: '#6699CC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  shareButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  heroSection: {
    position: 'relative',
    height: 250,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  eventTypeBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#FFCC00',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  eventTypeText: {
    color: '#333',
    fontSize: 12,
    fontWeight: '600',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
  },
  detailsCard: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  eventTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    lineHeight: 34,
    flex: 1,
    marginRight: 12,
  },
  eventStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#27AE60',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#27AE60',
  },
  eventMeta: {
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  metaIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6699CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaContent: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
    marginBottom: 2,
  },
  metaText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  descriptionSection: {
    marginBottom: 25,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 25,
  },
  attendanceSection: {
    marginBottom: 25,
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  attendanceCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6699CC',
  },
  attendanceBar: {
    marginBottom: 8,
  },
  attendanceProgress: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  attendanceFill: {
    height: '100%',
    backgroundColor: '#6699CC',
    borderRadius: 4,
  },
  attendanceText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 15,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  rsvpButton: {
    borderWidth: 2,
    borderColor: '#6699CC',
  },
  rsvpButtonActive: {
    backgroundColor: '#6699CC',
  },
  rsvpButtonLoading: {
    opacity: 0.7,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  actionButtonTextActive: {
    color: '#fff',
  },
  donationButton: {
    borderWidth: 2,
    borderColor: '#E74C3C',
  },
  volunteerSection: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 20,
  },
  volunteerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  volunteerCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  volunteerCountText: {
    fontSize: 14,
    color: '#FFCC00',
    fontWeight: '600',
  },
  volunteerButton: {
    backgroundColor: '#FFF8E1',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFCC00',
  },
  volunteerButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 12,
  },
  volunteerButtonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFCC00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  volunteerButtonTextContainer: {
    flex: 1,
  },
  volunteerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  volunteerButtonSubtext: {
    fontSize: 14,
    color: '#666',
  },
  volunteerStatusCard: {
    backgroundColor: '#E8F5E8',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#27AE60',
  },
  volunteerStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  volunteerStatusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#27AE60',
    justifyContent: 'center',
    alignItems: 'center',
  },
  volunteerStatusContent: {
    flex: 1,
  },
  volunteerStatusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#27AE60',
    marginBottom: 4,
  },
  volunteerRoleText: {
    fontSize: 16,
    color: '#333',
  },
  cancelVolunteerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E74C3C',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 6,
  },
  cancelVolunteerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2A37',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  modalDescription: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 20,
    lineHeight: 22,
  },
  volunteerRoleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  volunteerRoleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  additionalInfo: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  contactSection: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 30,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 8,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6699CC',
  },
  placeholder: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
});


