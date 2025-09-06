import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EventDetailsModal from '../../components/admin/EventDetailsModal';
import { deleteEvent, getEvents } from '../../controllers/EventController';

/**
 * Screen for managing events (admin only)
 * Displays a list of all events with options to edit and delete
 */
export default function EventManagementScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  // Load events when the screen mounts
  useEffect(() => {
    loadEvents();
  }, []);

  // Focus listener to refresh events when returning to this screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadEvents();
    });

    return unsubscribe;
  }, [navigation]);

  // Load events from the API
  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await getEvents();
      
      if (response && response.data) {
        // Sort events by date (most recent first)
        const sortedEvents = [...response.data].sort((a, b) => {
          return new Date(b.startTime || b.date) - new Date(a.startTime || a.date);
        });
        
        setEvents(sortedEvents);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error('Failed to load events:', error);
      Alert.alert('Error', 'Failed to load events. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    loadEvents();
  };

  // Navigate to event creation screen
  const handleCreateEvent = () => {
    navigation.navigate('CreateEvent');
  };

  // Show event details
  const handleViewEvent = (event) => {
    setSelectedEvent(event);
    setDetailsModalVisible(true);
  };

  // Navigate to event editing screen
  const handleEditEvent = (event) => {
    setDetailsModalVisible(false);
    navigation.navigate('CreateEvent', { event });
  };

  // Handle event deletion
  const handleDeleteEvent = (eventId, eventName) => {
    Alert.alert(
      'Delete Event',
      `Are you sure you want to delete "${eventName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteEvent(eventId);
              
              // Remove the deleted event from the state
              setEvents(events.filter(e => e.id !== eventId));
              
              // Close modal if it was open
              if (detailsModalVisible) {
                setDetailsModalVisible(false);
              }
              
              Alert.alert('Success', 'Event deleted successfully');
            } catch (error) {
              console.error('Failed to delete event:', error);
              Alert.alert('Error', 'Failed to delete event. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Render an individual event item
  const renderEventItem = ({ item }) => {
    const eventDate = item.startTime || item.date;
    const eventName = item.name || item.title;
    
    const getStatusColor = (status) => {
      switch (status) {
        case 'UPCOMING': return '#4A90E2';
        case 'ONGOING': return '#27AE60';
        case 'COMPLETED': return '#95A5A6';
        case 'CANCELLED': return '#E74C3C';
        default: return '#4A90E2';
      }
    };

    const getStatusIcon = (status) => {
      switch (status) {
        case 'UPCOMING': return 'time-outline';
        case 'ONGOING': return 'play-circle-outline';
        case 'COMPLETED': return 'checkmark-circle-outline';
        case 'CANCELLED': return 'close-circle-outline';
        default: return 'time-outline';
      }
    };
    
    return (
      <TouchableOpacity 
        style={styles.eventCard}
        onPress={() => handleViewEvent(item)}
        activeOpacity={0.8}
      >
        <View style={styles.eventCardHeader}>
          <View style={styles.eventTitleContainer}>
            <Text style={styles.eventTitle}>{eventName}</Text>
            <View style={[styles.eventStatus, { backgroundColor: getStatusColor(item.status || 'UPCOMING') + '20' }]}>
              <Ionicons name={getStatusIcon(item.status || 'UPCOMING')} size={14} color={getStatusColor(item.status || 'UPCOMING')} />
              <Text style={[styles.eventStatusText, { color: getStatusColor(item.status || 'UPCOMING') }]}>
                {item.status || 'UPCOMING'}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.moreButton}
            onPress={() => handleViewEvent(item)}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#999" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.eventDetails}>
          <View style={styles.eventDetailRow}>
            <View style={styles.eventDetailIcon}>
              <Ionicons name="calendar-outline" size={16} color="#4A90E2" />
            </View>
            <View style={styles.eventDetailContent}>
              <Text style={styles.eventDetailLabel}>Date</Text>
              <Text style={styles.eventDetailText}>{formatDate(eventDate)}</Text>
            </View>
          </View>
          
          <View style={styles.eventDetailRow}>
            <View style={styles.eventDetailIcon}>
              <Ionicons name="location-outline" size={16} color="#4A90E2" />
            </View>
            <View style={styles.eventDetailContent}>
              <Text style={styles.eventDetailLabel}>Location</Text>
              <Text style={styles.eventDetailText}>{item.location || 'No location specified'}</Text>
            </View>
          </View>
          
          {item.maxAttendees && (
            <View style={styles.eventDetailRow}>
              <View style={styles.eventDetailIcon}>
                <Ionicons name="people-outline" size={16} color="#4A90E2" />
              </View>
              <View style={styles.eventDetailContent}>
                <Text style={styles.eventDetailLabel}>Capacity</Text>
                <Text style={styles.eventDetailText}>Max {item.maxAttendees} attendees</Text>
              </View>
            </View>
          )}
        </View>
        
        <View style={styles.eventActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.viewButton]} 
            onPress={(e) => {
              e.stopPropagation();
              handleViewEvent(item);
            }}
          >
            <Ionicons name="eye-outline" size={18} color="#4A90E2" />
            <Text style={styles.actionButtonText}>View</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]} 
            onPress={(e) => {
              e.stopPropagation();
              handleEditEvent(item);
            }}
          >
            <Ionicons name="create-outline" size={18} color="#fff" />
            <Text style={[styles.actionButtonText, styles.editButtonText]}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]} 
            onPress={(e) => {
              e.stopPropagation();
              handleDeleteEvent(item.id, eventName);
            }}
          >
            <Ionicons name="trash-outline" size={18} color="#fff" />
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

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
        
        <Text style={styles.headerTitle}>Manage Events</Text>
        
        <TouchableOpacity 
          style={styles.createButton}
          onPress={handleCreateEvent}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Events List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      ) : events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>No events found</Text>
          <TouchableOpacity 
            style={styles.createEventButton}
            onPress={handleCreateEvent}
          >
            <Text style={styles.createEventButtonText}>Create New Event</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={events}
          renderItem={renderEventItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.eventsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4A90E2']}
            />
          }
        />
      )}
      
      {/* Event Details Modal */}
      <EventDetailsModal
        visible={detailsModalVisible}
        event={selectedEvent}
        onClose={() => setDetailsModalVisible(false)}
        onEdit={() => handleEditEvent(selectedEvent)}
        onDelete={() => selectedEvent && handleDeleteEvent(selectedEvent.id, selectedEvent.name || selectedEvent.title)}
      />
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
  createButton: {
    padding: 4,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
    marginBottom: 20,
  },
  createEventButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  createEventButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  eventsList: {
    padding: 16,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  eventCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  eventTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2A37',
    marginBottom: 8,
    lineHeight: 26,
  },
  eventStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  eventStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  moreButton: {
    padding: 4,
  },
  eventDetails: {
    marginBottom: 16,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  eventDetailIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F4F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventDetailContent: {
    flex: 1,
  },
  eventDetailLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  eventDetailText: {
    fontSize: 14,
    color: '#1F2A37',
    fontWeight: '500',
  },
  eventActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
  },
  viewButton: {
    backgroundColor: '#F0F4F8',
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  editButton: {
    backgroundColor: '#4A90E2',
  },
  deleteButton: {
    backgroundColor: '#E74C3C',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
  },
  editButtonText: {
    color: '#fff',
  },
  deleteButtonText: {
    color: '#fff',
  },
});
