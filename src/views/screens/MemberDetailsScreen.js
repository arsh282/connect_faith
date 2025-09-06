import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/CustomAuthContext';
import { mockApiService } from '../../services/mockApi';

/**
 * Screen for viewing member details when admin clicks on RSVP notification
 * Shows member information and event details
 */
export default function MemberDetailsScreen({ navigation, route }) {
  const { userProfile } = useAuth();
  const { notification } = route?.params || {};
  
  const [memberDetails, setMemberDetails] = useState(null);
  const [eventDetails, setEventDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (notification) {
      loadMemberAndEventDetails();
    }
  }, [notification]);

  const loadMemberAndEventDetails = async () => {
    try {
      setLoading(true);
      
      // Load member details
      if (notification.memberId) {
        const memberResponse = await mockApiService.getUserProfile(notification.memberId, 'mock_token');
        if (memberResponse.success) {
          setMemberDetails(memberResponse.data);
        }
      }
      
      // Load event details
      if (notification.eventId) {
        const eventResponse = await mockApiService.getEventDetails(notification.eventId, 'mock_token');
        if (eventResponse.success) {
          setEventDetails(eventResponse.data);
        }
      }
    } catch (error) {
      console.error('Failed to load member/event details:', error);
      Alert.alert('Error', 'Failed to load details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return 'Not provided';
    // Simple phone formatting
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const handleContactMember = () => {
    if (memberDetails?.email) {
      Alert.alert(
        'Contact Member',
        `Would you like to contact ${memberDetails.firstName} ${memberDetails.lastName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Email', 
            onPress: () => {
              // In a real app, this would open email client
              Alert.alert('Email', `Email: ${memberDetails.email}`);
            }
          },
          ...(memberDetails.phoneNumber ? [{
            text: 'Call',
            onPress: () => {
              // In a real app, this would initiate phone call
              Alert.alert('Call', `Phone: ${formatPhoneNumber(memberDetails.phoneNumber)}`);
            }
          }] : [])
        ]
      );
    }
  };

  const handleViewEvent = () => {
    if (eventDetails) {
      navigation.navigate('EventDetails', { event: eventDetails });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#6699CC" />
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Member Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading member details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6699CC" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Member Details</Text>
        
        <TouchableOpacity 
          style={styles.contactButton}
          onPress={handleContactMember}
        >
          <Ionicons name="mail-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* RSVP Notification Info */}
        <View style={styles.notificationCard}>
          <View style={styles.notificationHeader}>
            <Ionicons name="checkmark-circle" size={24} color="#27AE60" />
            <Text style={styles.notificationTitle}>RSVP Confirmation</Text>
          </View>
          <Text style={styles.notificationMessage}>
            {notification.message || 'Member has RSVP\'d for an event'}
          </Text>
          <Text style={styles.notificationTime}>
            {formatDate(notification.timestamp)}
          </Text>
        </View>

        {/* Member Information */}
        {memberDetails && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person" size={20} color="#4A90E2" />
              <Text style={styles.sectionTitle}>Member Information</Text>
            </View>
            
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>
                  {memberDetails.firstName} {memberDetails.lastName}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{memberDetails.email}</Text>
              </View>
              
              {memberDetails.phoneNumber && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>
                    {formatPhoneNumber(memberDetails.phoneNumber)}
                  </Text>
                </View>
              )}
              
              {memberDetails.DOB && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Date of Birth</Text>
                  <Text style={styles.infoValue}>
                    {new Date(memberDetails.DOB).toLocaleDateString()}
                  </Text>
                </View>
              )}
              
              {memberDetails.city && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Location</Text>
                  <Text style={styles.infoValue}>
                    {[memberDetails.city, memberDetails.region, memberDetails.country]
                      .filter(Boolean)
                      .join(', ')}
                  </Text>
                </View>
              )}
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Member Since</Text>
                <Text style={styles.infoValue}>
                  {memberDetails.createdAt ? 
                    new Date(memberDetails.createdAt).toLocaleDateString() : 
                    'Unknown'
                  }
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Event Information */}
        {eventDetails && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar" size={20} color="#4A90E2" />
              <Text style={styles.sectionTitle}>Event Details</Text>
            </View>
            
            <TouchableOpacity style={styles.eventCard} onPress={handleViewEvent}>
              <View style={styles.eventHeader}>
                <Text style={styles.eventTitle}>
                  {eventDetails.name || eventDetails.title}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </View>
              
              <Text style={styles.eventDescription}>
                {eventDetails.description || 'No description available'}
              </Text>
              
              <View style={styles.eventDetails}>
                <View style={styles.eventDetailRow}>
                  <Ionicons name="calendar-outline" size={16} color="#666" />
                  <Text style={styles.eventDetailText}>
                    {formatDate(eventDetails.startTime || eventDetails.date)}
                  </Text>
                </View>
                
                {eventDetails.location && (
                  <View style={styles.eventDetailRow}>
                    <Ionicons name="location-outline" size={16} color="#666" />
                    <Text style={styles.eventDetailText}>{eventDetails.location}</Text>
                  </View>
                )}
                
                {eventDetails.maxAttendees && (
                  <View style={styles.eventDetailRow}>
                    <Ionicons name="people-outline" size={16} color="#666" />
                    <Text style={styles.eventDetailText}>
                      Max {eventDetails.maxAttendees} attendees
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleContactMember}
          >
            <Ionicons name="mail" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Contact Member</Text>
          </TouchableOpacity>
          
          {eventDetails && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={handleViewEvent}
            >
              <Ionicons name="calendar" size={20} color="#4A90E2" />
              <Text style={styles.secondaryButtonText}>View Event</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#6699CC',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#5A8ABC',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  backButton: {
    padding: 4,
  },
  contactButton: {
    padding: 4,
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
  content: {
    flex: 1,
    padding: 16,
  },
  notificationCard: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#27AE60',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27AE60',
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#2C3E50',
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1,
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  eventDetails: {
    gap: 8,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDetailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  actionButtons: {
    gap: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#4A90E2',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  secondaryButtonText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
