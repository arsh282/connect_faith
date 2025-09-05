import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Platform,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { getEvents } from '../../controllers/EventController';
import { createSampleVolunteerData, getEventVolunteersByRole } from '../../services/volunteerService';

export default function VolunteerManagementScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [volunteers, setVolunteers] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      loadEventVolunteers(selectedEvent.id);
    }
  }, [selectedEvent]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const result = await getEvents();
      const eventsData = result?.data || result || [];
      setEvents(Array.isArray(eventsData) ? eventsData : []);
      
      // Select the first event by default
      if (eventsData.length > 0) {
        setSelectedEvent(eventsData[0]);
      }
    } catch (error) {
      console.error('Failed to load events:', error);
      Alert.alert('Error', 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const loadEventVolunteers = async (eventId) => {
    try {
      const volunteersByRole = await getEventVolunteersByRole(eventId);
      setVolunteers(volunteersByRole);
    } catch (error) {
      console.error('Failed to load volunteers:', error);
      Alert.alert('Error', 'Failed to load volunteer registrations');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    if (selectedEvent) {
      await loadEventVolunteers(selectedEvent.id);
    }
    setRefreshing(false);
  };

  const createSampleData = async () => {
    try {
      await createSampleVolunteerData();
      Alert.alert('Success', 'Sample volunteer data created! Refresh to see the data.');
      if (selectedEvent) {
        await loadEventVolunteers(selectedEvent.id);
      }
    } catch (error) {
      console.error('Error creating sample data:', error);
      Alert.alert('Error', 'Failed to create sample data');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderVolunteerItem = ({ item }) => (
    <View style={styles.volunteerItem}>
      <View style={styles.volunteerInfo}>
        <Text style={styles.volunteerName}>{item.userName}</Text>
        <Text style={styles.volunteerEmail}>{item.userEmail}</Text>
        <Text style={styles.volunteerDate}>
          Registered: {formatDate(item.registeredAt)}
        </Text>
      </View>
      <View style={styles.volunteerStatus}>
        <View style={[styles.statusDot, { backgroundColor: '#27AE60' }]} />
        <Text style={styles.statusText}>Active</Text>
      </View>
    </View>
  );

  const renderRoleSection = ({ item: role }) => {
    const roleVolunteers = volunteers[role] || [];
    
    return (
      <View style={styles.roleSection}>
        <View style={styles.roleHeader}>
          <Text style={styles.roleTitle}>{role}</Text>
          <View style={styles.roleCount}>
            <Text style={styles.roleCountText}>{roleVolunteers.length} volunteer{roleVolunteers.length !== 1 ? 's' : ''}</Text>
          </View>
        </View>
        
        {roleVolunteers.length > 0 ? (
          <FlatList
            data={roleVolunteers}
            renderItem={renderVolunteerItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.noVolunteers}>
            <Ionicons name="people-outline" size={32} color="#ccc" />
            <Text style={styles.noVolunteersText}>No volunteers yet</Text>
          </View>
        )}
      </View>
    );
  };

  const renderEventItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.eventItem,
        selectedEvent?.id === item.id && styles.selectedEventItem
      ]}
      onPress={() => setSelectedEvent(item)}
    >
      <Text style={styles.eventTitle}>{item.title || item.name}</Text>
      <Text style={styles.eventDate}>{formatDate(item.date || item.startTime)}</Text>
    </TouchableOpacity>
  );

  const roles = Object.keys(volunteers);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6699CC" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Volunteer Management</Text>
        <View style={styles.headerRight} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      ) : (
        <View style={styles.content}>
          {/* Events List */}
          <View style={styles.eventsSection}>
            <Text style={styles.sectionTitle}>Select Event</Text>
            <FlatList
              data={events}
              renderItem={renderEventItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.eventsList}
            />
          </View>

          {/* Selected Event Info */}
          {selectedEvent && (
            <View style={styles.selectedEventInfo}>
              <Text style={styles.selectedEventTitle}>
                {selectedEvent.title || selectedEvent.name}
              </Text>
              <Text style={styles.selectedEventDate}>
                {formatDate(selectedEvent.date || selectedEvent.startTime)}
              </Text>
              
              {/* Sample Data Button */}
              <TouchableOpacity 
                style={styles.sampleDataButton}
                onPress={createSampleData}
              >
                <Ionicons name="add-circle-outline" size={20} color="#fff" />
                <Text style={styles.sampleDataButtonText}>Create Sample Data</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Volunteers by Role */}
          {selectedEvent && (
            <View style={styles.volunteersSection}>
              <Text style={styles.sectionTitle}>Volunteer Registrations</Text>
              
              {roles.length > 0 ? (
                <FlatList
                  data={roles}
                  renderItem={renderRoleSection}
                  keyExtractor={(item) => item}
                  showsVerticalScrollIndicator={false}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                      colors={['#4A90E2']}
                    />
                  }
                />
              ) : (
                <View style={styles.noVolunteersContainer}>
                  <Ionicons name="people-outline" size={60} color="#ccc" />
                  <Text style={styles.noVolunteersTitle}>No Volunteer Registrations</Text>
                  <Text style={styles.noVolunteersSubtitle}>
                    No one has registered to volunteer for this event yet.
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}
    </View>
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
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
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
  headerRight: {
    width: 40,
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
  },
  eventsSection: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  eventsList: {
    paddingHorizontal: 4,
  },
  eventItem: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedEventItem: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 12,
    color: '#666',
  },
  selectedEventInfo: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedEventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  selectedEventDate: {
    fontSize: 14,
    color: '#666',
  },
  sampleDataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sampleDataButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  volunteersSection: {
    flex: 1,
    padding: 20,
  },
  roleSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  roleCount: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleCountText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  volunteerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fafafa',
    borderRadius: 8,
    marginBottom: 8,
  },
  volunteerInfo: {
    flex: 1,
  },
  volunteerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  volunteerEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  volunteerDate: {
    fontSize: 12,
    color: '#999',
  },
  volunteerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#27AE60',
    fontWeight: '500',
  },
  noVolunteers: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noVolunteersText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  noVolunteersContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noVolunteersTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  noVolunteersSubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
});
