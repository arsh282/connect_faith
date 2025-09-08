import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { getEvents } from '../../controllers/EventController';

const { width, height } = Dimensions.get('window');

export default function EventsCalendarScreen({ navigation }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [showEventDetails, setShowEventDetails] = useState(false);

  // Fetch events on component mount and when month changes
  useEffect(() => {
    fetchEvents();
  }, [currentMonth]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const result = await getEvents();
      // Handle the response structure from EventController
      const eventsData = result?.data || result || [];
      setEvents(Array.isArray(eventsData) ? eventsData : []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      Alert.alert('Error', 'Failed to load events');
      setEvents([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days = [];
    
    // Add empty days for padding
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getEventsForDate = (date) => {
    if (!events || !Array.isArray(events)) {
      return [];
    }
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => {
      // Handle different date formats from API
      const eventDate = event.startTime ? new Date(event.startTime).toISOString().split('T')[0] : event.date;
      return eventDate === dateString;
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const hasEvent = (date) => {
    return getEventsForDate(date).length > 0;
  };

  const getUpcomingEvents = () => {
    if (!events || !Array.isArray(events)) {
      return [];
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return events
      .filter(event => {
        const eventDate = event.startTime ? new Date(event.startTime) : new Date(event.date);
        return eventDate >= today;
      })
      .sort((a, b) => {
        const dateA = a.startTime ? new Date(a.startTime) : new Date(a.date);
        const dateB = b.startTime ? new Date(b.startTime) : new Date(b.date);
        return dateA - dateB;
      })
      .slice(0, 5); // Show next 5 events
  };

  const formatEventTime = (event) => {
    if (event.startTime) {
      const date = new Date(event.startTime);
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    }
    return event.time || 'TBD';
  };

  const formatEventDate = (event) => {
    if (event.startTime) {
      const date = new Date(event.startTime);
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric' 
      });
    }
    return event.date || 'TBD';
  };

  const renderCalendarDay = (date, index) => {
    if (!date) {
      return <View key={index} style={styles.emptyDay} />;
    }

    const dayEvents = getEventsForDate(date);
    const isCurrentDay = isToday(date);
    const isCurrentSelected = isSelected(date);
    const hasEvents = dayEvents.length > 0;

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.calendarDay,
          isCurrentDay && styles.today,
          isCurrentSelected && styles.selectedDay,
          hasEvents && styles.hasEvent
        ]}
        onPress={() => {
          setSelectedDate(date);
          const dayEvents = getEventsForDate(date);
          if (dayEvents.length > 0) {
            setSelectedEvents(dayEvents);
            setShowEventDetails(true);
          }
        }}
      >
        <Text style={[
          styles.dayText,
          isCurrentDay && styles.todayText,
          isCurrentSelected && styles.selectedDayText
        ]}>
          {date.getDate()}
        </Text>
        {hasEvents && (
          <View style={styles.eventIndicator} />
        )}
      </TouchableOpacity>
    );
  };

  const renderEventItem = (event) => (
    <TouchableOpacity
      key={event.id}
      style={styles.eventItem}
      onPress={() => navigation.navigate('EventDetails', { event })}
      activeOpacity={0.8}
    >
      <View style={styles.eventTimeContainer}>
        <Text style={styles.eventTimeBadge}>{event.time}</Text>
      </View>
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.eventLocation}>{event.location}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );

  const days = getDaysInMonth(currentMonth);
  const selectedDateEvents = getEventsForDate(selectedDate);

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
        <Text style={styles.headerTitle}>Events Calendar</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Month Navigation */}
        <View style={styles.monthNavigation}>
          <TouchableOpacity 
            style={styles.monthButton}
            onPress={() => {
              const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
              setCurrentMonth(newMonth);
            }}
          >
            <Ionicons name="chevron-back" size={24} color="#6699CC" />
          </TouchableOpacity>
          
          <Text style={styles.monthTitle}>
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
          
          <TouchableOpacity 
            style={styles.monthButton}
            onPress={() => {
              const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
              setCurrentMonth(newMonth);
            }}
          >
            <Ionicons name="chevron-forward" size={24} color="#6699CC" />
          </TouchableOpacity>
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarContainer}>
          {/* Day Headers */}
          <View style={styles.dayHeaders}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <Text key={day} style={styles.dayHeader}>{day}</Text>
            ))}
          </View>
          
          {/* Calendar Days */}
          <View style={styles.calendarGrid}>
            {days.map((date, index) => renderCalendarDay(date, index))}
          </View>
        </View>

        {/* Selected Date Info */}
        <View style={styles.selectedDateInfo}>
          <Text style={styles.selectedDateTitle}>{formatDate(selectedDate)}</Text>
          <Text style={styles.selectedDateSubtitle}>
            {getEventsForDate(selectedDate).length} event{getEventsForDate(selectedDate).length !== 1 ? 's' : ''} scheduled
          </Text>
        </View>

        {/* Upcoming Events List */}
        <View style={styles.eventsSection}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          <View style={styles.eventsList}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading events...</Text>
              </View>
            ) : getUpcomingEvents().length > 0 ? (
              getUpcomingEvents().map((event, index) => (
                <TouchableOpacity 
                  key={event.id || index}
                  style={styles.eventItem}
                  onPress={() => navigation.navigate('EventDetails', { event })}
                >
                  <View style={styles.eventDateContainer}>
                    <Text style={styles.eventDate}>{formatEventDate(event)}</Text>
                    <Text style={styles.eventTime}>{formatEventTime(event)}</Text>
                  </View>
                  <View style={styles.eventDetails}>
                    <Text style={styles.eventTitle}>{event.name || event.title}</Text>
                    <Text style={styles.eventLocation}>{event.location || 'Location TBD'}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.noEvents}>
                <Ionicons name="calendar-outline" size={48} color="#999" />
                <Text style={styles.noEventsText}>No upcoming events</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Event Details Modal */}
      <Modal
        visible={showEventDetails}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEventDetails(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Event Details</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowEventDetails(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {selectedEvents.map((event, index) => (
                <View key={event.id || index} style={styles.eventDetailItem}>
                  <View style={styles.eventDetailHeader}>
                    <Text style={styles.eventDetailTitle}>{event.name || event.title}</Text>
                    <View style={styles.eventDetailMeta}>
                      <View style={styles.eventDetailMetaItem}>
                        <Ionicons name="calendar" size={16} color="#6699CC" />
                        <Text style={styles.eventDetailMetaText}>{formatEventDate(event)}</Text>
                      </View>
                      <View style={styles.eventDetailMetaItem}>
                        <Ionicons name="time" size={16} color="#6699CC" />
                        <Text style={styles.eventDetailMetaText}>{formatEventTime(event)}</Text>
                      </View>
                      <View style={styles.eventDetailMetaItem}>
                        <Ionicons name="location" size={16} color="#6699CC" />
                        <Text style={styles.eventDetailMetaText}>{event.location || 'Location TBD'}</Text>
                      </View>
                    </View>
                  </View>
                  
                  {event.description && (
                    <View style={styles.eventDetailDescription}>
                      <Text style={styles.eventDetailDescriptionTitle}>Description</Text>
                      <Text style={styles.eventDetailDescriptionText}>{event.description}</Text>
                    </View>
                  )}
                  
                  {event.maxAttendees && (
                    <View style={styles.eventDetailCapacity}>
                      <Text style={styles.eventDetailCapacityText}>
                        Capacity: {event.attendees?.length || 0} / {event.maxAttendees}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  monthButton: {
    padding: 10,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  calendarContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: (width - 80) / 7,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
    borderRadius: 8,
    position: 'relative',
  },
  emptyDay: {
    width: (width - 80) / 7,
    height: 45,
  },
  dayText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  today: {
    backgroundColor: '#FFCC00',
  },
  todayText: {
    color: '#333',
    fontWeight: '700',
  },
  selectedDay: {
    backgroundColor: '#6699CC',
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: '700',
  },
  hasEvent: {
    borderWidth: 2,
    borderColor: '#FFCC00',
  },
  eventIndicator: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFCC00',
  },
  selectedDateInfo: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedDateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  selectedDateSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  eventsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  eventsList: {
    gap: 12,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  eventTimeContainer: {
    backgroundColor: '#6699CC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 15,
  },
  eventTimeBadge: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
    color: '#999',
  },
  noEvents: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  noEventsText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  eventItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventDateContainer: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 60,
  },
  eventDate: {
    fontSize: 12,
    color: '#6699CC',
    fontWeight: '600',
    textAlign: 'center',
  },
  eventTime: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
    textAlign: 'center',
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
    color: '#666',
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
  eventDetailItem: {
    marginBottom: 20,
  },
  eventDetailHeader: {
    marginBottom: 16,
  },
  eventDetailTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2A37',
    marginBottom: 12,
  },
  eventDetailMeta: {
    gap: 8,
  },
  eventDetailMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventDetailMetaText: {
    fontSize: 16,
    color: '#4B5563',
  },
  eventDetailDescription: {
    marginBottom: 16,
  },
  eventDetailDescriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2A37',
    marginBottom: 8,
  },
  eventDetailDescriptionText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
  },
  eventDetailCapacity: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
  },
  eventDetailCapacityText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});


