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
    
    return (
      <TouchableOpacity 
        style={styles.eventCard}
        onPress={() => handleViewEvent(item)}
      >
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{eventName}</Text>
          <Text style={styles.eventDate}>{formatDate(eventDate)}</Text>
          <Text style={styles.eventLocation}>{item.location || 'No location specified'}</Text>
          <Text style={styles.eventStatus}>{item.status || 'UPCOMING'}</Text>
        </View>
        
        <View style={styles.eventActions}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={(e) => {
              e.stopPropagation(); // Prevent triggering the card's onPress
              handleEditEvent(item);
            }}
          >
            <Ionicons name="create-outline" size={22} color="#4A90E2" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={(e) => {
              e.stopPropagation(); // Prevent triggering the card's onPress
              handleDeleteEvent(item.id, eventName);
            }}
          >
            <Ionicons name="trash-outline" size={22} color="#E25C4A" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

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
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2A37',
    marginBottom: 6,
  },
  eventDate: {
    fontSize: 14,
    color: '#4A90E2',
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  eventStatus: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  eventActions: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 8,
  },
  actionButton: {
    padding: 8,
    marginVertical: 4,
  },
});
