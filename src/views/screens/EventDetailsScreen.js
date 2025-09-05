import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
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
import {
    cancelVolunteerRegistration,
    getUserVolunteerRegistrations,
    registerVolunteer
} from '../../services/volunteerService';

const { width, height } = Dimensions.get('window');

export default function EventDetailsScreen({ navigation, route }) {
  const { user } = useAuth();
  const { event: rawEvent } = route?.params || {
    id: 1,
    title: 'Sunday Service',
    date: '2024-03-10',
    time: '10:00 AM',
    location: 'Main Sanctuary',
    type: 'service',
    description: 'Join us for our weekly Sunday service featuring inspiring worship, powerful preaching, and fellowship with our church family. This week, Pastor John will be sharing a message about "Walking in Faith Through Difficult Times."',
    image: require('../../../assets/images/events-placeholder.png'),
    attendees: 45,
    maxAttendees: 100,
    isRSVP: false,
    needsVolunteers: true,
    volunteerRoles: ['Greeters', 'Ushers', 'Children\'s Ministry', 'Sound Team']
  };

  // Ensure event has volunteer properties with defaults
  const event = {
    ...rawEvent,
    needsVolunteers: rawEvent?.needsVolunteers ?? true,
    volunteerRoles: rawEvent?.volunteerRoles ?? ['Greeters', 'Ushers', 'Children\'s Ministry', 'Sound Team', 'Parking Attendants', 'Welcome Team']
  };

  const [isRSVP, setIsRSVP] = useState(event?.isRSVP || false);
  const [showVolunteerModal, setShowVolunteerModal] = useState(false);
  const [selectedVolunteerRole, setSelectedVolunteerRole] = useState('');
  const [isVolunteering, setIsVolunteering] = useState(false);

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

  const handleRSVP = () => {
    setIsRSVP(!isRSVP);
    Alert.alert(
      'RSVP Updated',
      isRSVP ? 'You have cancelled your RSVP for this event.' : 'You have successfully RSVP\'d for this event!',
      [{ text: 'OK' }]
    );
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
        <View style={styles.headerRight} />
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
        </View>

        {/* Event Details Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.eventTitle}>{event.title || event.name || 'Event'}</Text>
          
          <View style={styles.eventMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar" size={20} color="#6699CC" />
              <Text style={styles.metaText}>{formatDate(event.date || event.startTime || new Date())}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time" size={20} color="#6699CC" />
              <Text style={styles.metaText}>{event.time || 'TBD'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="location" size={20} color="#6699CC" />
              <Text style={styles.metaText}>{event.location || 'Location TBD'}</Text>
            </View>
          </View>

          <Text style={styles.description}>{event.description || 'No description available.'}</Text>

          {/* Attendance */}
          <View style={styles.attendanceSection}>
            <Text style={styles.sectionTitle}>Attendance</Text>
            <View style={styles.attendanceBar}>
              <View style={styles.attendanceProgress}>
                <View 
                  style={[
                    styles.attendanceFill, 
                    { width: `${((event.attendees || 0) / (event.maxAttendees || 100)) * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.attendanceText}>
                {event.attendees || 0} of {event.maxAttendees || 100} spots filled
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[
              styles.actionButton,
              styles.rsvpButton,
              isRSVP && styles.rsvpButtonActive
            ]}
            onPress={handleRSVP}
          >
            <Ionicons 
              name={isRSVP ? "checkmark-circle" : "add-circle-outline"} 
              size={24} 
              color={isRSVP ? "#fff" : "#6699CC"} 
            />
            <Text style={[
              styles.actionButtonText,
              isRSVP && styles.actionButtonTextActive
            ]}>
              {isRSVP ? 'RSVP\'d' : 'RSVP'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.donationButton]}
            onPress={handleDonation}
          >
            <Ionicons name="heart" size={24} color="#E74C3C" />
            <Text style={styles.actionButtonText}>Donate</Text>
          </TouchableOpacity>
        </View>

        {/* Volunteer Section */}
        {(event?.needsVolunteers || event?.volunteerRoles?.length > 0) && (
          <View style={styles.volunteerSection}>
            <Text style={styles.sectionTitle}>Volunteer Opportunities</Text>
            
            {isVolunteering ? (
              <View style={styles.volunteerStatusCard}>
                <View style={styles.volunteerStatusHeader}>
                  <Ionicons name="checkmark-circle" size={24} color="#27AE60" />
                  <Text style={styles.volunteerStatusTitle}>You're Volunteering!</Text>
                </View>
                <Text style={styles.volunteerRoleText}>Role: {selectedVolunteerRole}</Text>
                <TouchableOpacity 
                  style={styles.cancelVolunteerButton}
                  onPress={handleCancelVolunteer}
                >
                  <Text style={styles.cancelVolunteerButtonText}>Cancel Volunteer</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <TouchableOpacity 
                  style={styles.volunteerButton}
                  onPress={handleVolunteer}
                >
                  <Ionicons name="people" size={24} color="#FFCC00" />
                  <Text style={styles.volunteerButtonText}>Volunteer for this Event</Text>
                  <Ionicons name="chevron-forward" size={20} color="#FFCC00" />
                </TouchableOpacity>
                
                <Text style={styles.volunteerSubtext}>
                  Tap to select from available volunteer roles
                </Text>
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
  headerRight: {
    width: 40,
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
  eventTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
    lineHeight: 34,
  },
  eventMeta: {
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  metaText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    gap: 8,
  },
  rsvpButton: {
    borderWidth: 2,
    borderColor: '#6699CC',
  },
  rsvpButtonActive: {
    backgroundColor: '#6699CC',
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
  volunteerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF8E1',
    padding: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFCC00',
    gap: 12,
  },
  volunteerButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  volunteerSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
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
    marginBottom: 12,
    gap: 12,
  },
  volunteerStatusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#27AE60',
  },
  volunteerRoleText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  cancelVolunteerButton: {
    backgroundColor: '#E74C3C',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: 'flex-start',
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
});


