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
import { mockApiService } from '../../services/mockApi';

/**
 * Event Registration List Screen
 * Displays all events with their RSVP counts
 * When an event is selected, it navigates to the RSVP details screen
 */
export default function EventRegistrationsScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  // Load events with RSVP counts from the API
  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await mockApiService.getEventsWithRSVPCounts('mock_token');
      
      if (response && response.success) {
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

  // Navigate to RSVP details screen
  const handleViewRSVPDetails = (event) => {
    navigation.navigate('EventRSVPDetails', { event });
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

  // Format time for display
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status color based on event status
  const getStatusColor = (status) => {
    switch (status) {
      case 'UPCOMING': return '#4A90E2';
      case 'ONGOING': return '#27AE60';
      case 'COMPLETED': return '#95A5A6';
      case 'CANCELLED': return '#E74C3C';
      default: return '#4A90E2';
    }
  };

  // Get status icon based on event status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'UPCOMING': return 'time-outline';
      case 'ONGOING': return 'play-circle-outline';
      case 'COMPLETED': return 'checkmark-circle-outline';
      case 'CANCELLED': return 'close-circle-outline';
      default: return 'time-outline';
    }
  };

  // Render an individual event item
  const renderEventItem = ({ item }) => {
    const eventDate = item.startTime || item.date;
    const eventName = item.name || item.title;
    const rsvpCount = item.rsvpCount || 0;
    const totalMembers = item.totalMembers || 0;
    
    return (
      <TouchableOpacity 
        style={styles.eventCard}
        onPress={() => handleViewRSVPDetails(item)}
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
            style={styles.viewRSVPButton}
            onPress={() => handleViewRSVPDetails(item)}
          >
            <Ionicons name="people-outline" size={20} color="#4A90E2" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.eventDetails}>
          <View style={styles.eventDetailRow}>
            <View style={styles.eventDetailIcon}>
              <Ionicons name="calendar-outline" size={16} color="#4A90E2" />
            </View>
            <View style={styles.eventDetailContent}>
              <Text style={styles.eventDetailLabel}>Date & Time</Text>
              <Text style={styles.eventDetailText}>
                {formatDate(eventDate)} at {formatTime(eventDate)}
              </Text>
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
          
          <View style={styles.eventDetailRow}>
            <View style={styles.eventDetailIcon}>
              <Ionicons name="people-outline" size={16} color="#4A90E2" />
            </View>
            <View style={styles.eventDetailContent}>
              <Text style={styles.eventDetailLabel}>RSVP Count</Text>
              <Text style={styles.eventDetailText}>
                {rsvpCount} of {totalMembers} members
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.rsvpStatsContainer}>
          <View style={styles.rsvpStat}>
            <Text style={styles.rsvpStatNumber}>{rsvpCount}</Text>
            <Text style={styles.rsvpStatLabel}>Attending</Text>
          </View>
          <View style={styles.rsvpStatDivider} />
          <View style={styles.rsvpStat}>
            <Text style={styles.rsvpStatNumber}>{totalMembers - rsvpCount}</Text>
            <Text style={styles.rsvpStatLabel}>Pending</Text>
          </View>
          <View style={styles.rsvpStatDivider} />
          <View style={styles.rsvpStat}>
            <Text style={styles.rsvpStatNumber}>{totalMembers}</Text>
            <Text style={styles.rsvpStatLabel}>Total Members</Text>
          </View>
        </View>
        
        <View style={styles.eventActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.viewRSVPDetailsButton]} 
            onPress={() => handleViewRSVPDetails(item)}
          >
            <Ionicons name="list-outline" size={18} color="#fff" />
            <Text style={styles.actionButtonText}>View RSVP Details</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6699CC" />
      
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
          <Text style={styles.emptySubtext}>Events will appear here once they are created</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
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
  viewRSVPButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F0F4F8',
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
  rsvpStatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 16,
  },
  rsvpStat: {
    alignItems: 'center',
    flex: 1,
  },
  rsvpStatNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2A37',
    marginBottom: 4,
  },
  rsvpStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  rsvpStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
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
  viewRSVPDetailsButton: {
    backgroundColor: '#4A90E2',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});