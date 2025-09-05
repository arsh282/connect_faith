import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { createEvent, getEventCategories, updateEvent } from '../../controllers/EventController';
import { broadcastEvent } from '../../services/eventBroadcastService';

export default function CreateEditEventScreen({ navigation, route }) {
  // Get event data if we're editing an existing event
  const existingEvent = route.params?.event;
  const isEditing = !!existingEvent;
  
  const [name, setName] = useState(existingEvent?.name || existingEvent?.title || '');
  const [description, setDescription] = useState(existingEvent?.description || '');
  const [categoryId, setCategoryId] = useState(existingEvent?.categoryId || '');
  const [startTime, setStartTime] = useState(existingEvent?.startTime ? new Date(existingEvent.startTime) : new Date());
  const [endTime, setEndTime] = useState(existingEvent?.endTime ? new Date(existingEvent.endTime) : new Date());
  const [location, setLocation] = useState(existingEvent?.location || '');
  const [imageUrl, setImageUrl] = useState(existingEvent?.imageUrl || '');
  const [status, setStatus] = useState(existingEvent?.status || 'UPCOMING');
  const [maxAttendees, setMaxAttendees] = useState(existingEvent?.maxAttendees ? String(existingEvent.maxAttendees) : '');
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  // Date/Time picker states
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  
  // Android-specific date/time picker states
  const [showStartDateOnly, setShowStartDateOnly] = useState(false);
  const [showStartTimeOnly, setShowStartTimeOnly] = useState(false);
  const [showEndDateOnly, setShowEndDateOnly] = useState(false);
  const [showEndTimeOnly, setShowEndTimeOnly] = useState(false);

  const statusOptions = [
    { value: 'UPCOMING', label: 'Upcoming' },
    { value: 'ONGOING', label: 'Ongoing' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const categoriesData = await getEventCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to load categories:', error);
        Alert.alert('Error', 'Failed to load event categories');
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  const formatDateTime = (date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoryName = (id) => {
    const category = categories.find(cat => cat.id === id);
    return category ? category.name : 'Select Category';
  };

  const getStatusLabel = (value) => {
    const status = statusOptions.find(s => s.value === value);
    return status ? status.label : 'Select Status';
  };

  // Android-specific date/time handlers
  const handleStartDateChange = (event, selectedDate) => {
    setShowStartDateOnly(false);
    if (selectedDate) {
      const newDateTime = new Date(selectedDate);
      newDateTime.setHours(startTime.getHours());
      newDateTime.setMinutes(startTime.getMinutes());
      setStartTime(newDateTime);
      // Show time picker after date is selected
      setShowStartTimeOnly(true);
    }
  };

  const handleStartTimeChange = (event, selectedTime) => {
    setShowStartTimeOnly(false);
    if (selectedTime) {
      const newDateTime = new Date(startTime);
      newDateTime.setHours(selectedTime.getHours());
      newDateTime.setMinutes(selectedTime.getMinutes());
      setStartTime(newDateTime);
    }
  };

  const handleEndDateChange = (event, selectedDate) => {
    setShowEndDateOnly(false);
    if (selectedDate) {
      const newDateTime = new Date(selectedDate);
      newDateTime.setHours(endTime.getHours());
      newDateTime.setMinutes(endTime.getMinutes());
      setEndTime(newDateTime);
      // Show time picker after date is selected
      setShowEndTimeOnly(true);
    }
  };

  const handleEndTimeChange = (event, selectedTime) => {
    setShowEndTimeOnly(false);
    if (selectedTime) {
      const newDateTime = new Date(endTime);
      newDateTime.setHours(selectedTime.getHours());
      newDateTime.setMinutes(selectedTime.getMinutes());
      setEndTime(newDateTime);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please enter an event name.');
      return;
    }
    if (!categoryId) {
      Alert.alert('Missing Category', 'Please select an event category.');
      return;
    }
    if (endTime <= startTime) {
      Alert.alert('Invalid Time', 'End time must be after start time.');
      return;
    }

    setSaving(true);
    try {
      const eventData = {
        name: name.trim(),
        title: name.trim(), // For compatibility with notification system
        description: description.trim() || null,
        categoryId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        date: startTime.toISOString(), // For compatibility with notification system
        location: location.trim() || null,
        imageUrl: imageUrl.trim() || null,
        status,
        maxAttendees: maxAttendees ? Number(maxAttendees) : null,
        updatedAt: new Date().toISOString()
      };

      if (isEditing) {
        // Update existing event
        const updatedEvent = await updateEvent(existingEvent.id, eventData);
        
        // Broadcast the updated event to all users
        if (updatedEvent) {
          console.log('Broadcasting updated event to all users');
          await broadcastEvent(updatedEvent);
        }
        
        Alert.alert('Success', 'Event updated successfully');
      } else {
        // Create new event
        const newEvent = await createEvent(eventData);
        
        // Double ensure broadcast by also calling broadcastEvent directly
        if (newEvent) {
          console.log('Double ensuring event broadcast to all users');
          await broadcastEvent(newEvent);
        }
        
        Alert.alert('Success', 'Event created successfully');
      }
      
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message || `Failed to ${isEditing ? 'update' : 'create'} event`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    // Only show delete option for existing events
    if (!isEditing) {
      return;
    }
    
    Alert.alert(
      'Delete Event', 
      'Are you sure you want to delete this event? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              setSaving(true);
              // Import dynamically to avoid circular imports
              const { deleteEvent } = require('../../controllers/EventController');
              await deleteEvent(existingEvent.id);
              Alert.alert('Success', 'Event deleted successfully');
              navigation.goBack();
            } catch (error) {
              console.error('Failed to delete event:', error);
              Alert.alert('Error', 'Failed to delete event');
            } finally {
              setSaving(false);
            }
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionHeading}>Event Details</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Event Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Youth Mission Trip"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#99A0A5"
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={4}
            placeholder="A brief overview of the event"
            value={description}
            onChangeText={setDescription}
            placeholderTextColor="#99A0A5"
          />

          <Text style={styles.label}>Category *</Text>
          <TouchableOpacity
            style={[styles.pickerButton, loadingCategories && styles.pickerButtonDisabled]}
            onPress={() => !loadingCategories && setShowCategoryPicker(true)}
            disabled={loadingCategories}
          >
            <Text style={[styles.pickerText, !categoryId && { color: '#99A0A5' }]}>
              {loadingCategories ? 'Loading categories...' : getCategoryName(categoryId)}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Start Time *</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => {
              if (Platform.OS === 'android') {
                setShowStartDateOnly(true);
              } else {
                setShowStartDatePicker(true);
              }
            }}
          >
            <Text style={styles.pickerText}>
              {formatDateTime(startTime)}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>End Time *</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => {
              if (Platform.OS === 'android') {
                setShowEndDateOnly(true);
              } else {
                setShowEndDatePicker(true);
              }
            }}
          >
            <Text style={styles.pickerText}>
              {formatDateTime(endTime)}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            placeholder="Community Hall, 123 Church Rd"
            value={location}
            onChangeText={setLocation}
            placeholderTextColor="#99A0A5"
          />

          <Text style={styles.label}>Image URL</Text>
          <TextInput
            style={styles.input}
            placeholder="https://example.com/event-image.jpg"
            value={imageUrl}
            onChangeText={setImageUrl}
            placeholderTextColor="#99A0A5"
          />

          <Text style={styles.label}>Status</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowStatusPicker(true)}
          >
            <Text style={styles.pickerText}>
              {getStatusLabel(status)}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Max Attendees</Text>
          <TextInput
            style={styles.input}
            placeholder="100"
            value={maxAttendees}
            onChangeText={setMaxAttendees}
            keyboardType="numeric"
            placeholderTextColor="#99A0A5"
          />
        </View>

        <TouchableOpacity style={[styles.primaryButton, saving && { opacity: 0.7 }]} onPress={handleSave} disabled={saving}>
          <Text style={styles.primaryButtonText}>
            {saving 
              ? (isEditing ? 'Updating…' : 'Creating…') 
              : (isEditing ? 'Update Event' : 'Create Event')
            }
          </Text>
        </TouchableOpacity>

        {isEditing && (
          <TouchableOpacity style={styles.destructiveButton} onPress={handleDelete}>
            <Text style={styles.destructiveButtonText}>Delete Event</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Category Picker Modal */}
      <Modal
        visible={showCategoryPicker}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.modalOption}
                onPress={() => {
                  setCategoryId(category.id);
                  setShowCategoryPicker(false);
                }}
              >
                <Text style={styles.modalOptionText}>{category.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowCategoryPicker(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Status Picker Modal */}
      <Modal
        visible={showStatusPicker}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Status</Text>
            {statusOptions.map((statusOption) => (
              <TouchableOpacity
                key={statusOption.value}
                style={styles.modalOption}
                onPress={() => {
                  setStatus(statusOption.value);
                  setShowStatusPicker(false);
                }}
              >
                <Text style={styles.modalOptionText}>{statusOption.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowStatusPicker(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Start Date/Time Picker Modal */}
      <Modal
        visible={showStartDatePicker}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Start Date & Time</Text>
            <View style={styles.dateTimePickerContainer}>
              <DateTimePicker
                value={startTime}
                mode="datetime"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  if (Platform.OS === 'android') {
                    setShowStartDatePicker(false);
                  }
                  if (selectedDate) {
                    setStartTime(selectedDate);
                  }
                }}
                style={styles.dateTimePicker}
              />
            </View>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowStartDatePicker(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={() => setShowStartDatePicker(false)}
              >
                <Text style={styles.modalConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* End Date/Time Picker Modal */}
      <Modal
        visible={showEndDatePicker}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select End Date & Time</Text>
            <View style={styles.dateTimePickerContainer}>
              <DateTimePicker
                value={endTime}
                mode="datetime"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  if (Platform.OS === 'android') {
                    setShowEndDatePicker(false);
                  }
                  if (selectedDate) {
                    setEndTime(selectedDate);
                  }
                }}
                style={styles.dateTimePicker}
              />
            </View>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowEndDatePicker(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={() => setShowEndDatePicker(false)}
              >
                <Text style={styles.modalConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Android-specific Start Date Picker */}
      {Platform.OS === 'android' && showStartDateOnly && (
        <DateTimePicker
          value={startTime}
          mode="date"
          display="default"
          onChange={handleStartDateChange}
        />
      )}

      {/* Android-specific Start Time Picker */}
      {Platform.OS === 'android' && showStartTimeOnly && (
        <DateTimePicker
          value={startTime}
          mode="time"
          display="default"
          onChange={handleStartTimeChange}
        />
      )}

      {/* Android-specific End Date Picker */}
      {Platform.OS === 'android' && showEndDateOnly && (
        <DateTimePicker
          value={endTime}
          mode="date"
          display="default"
          onChange={handleEndDateChange}
        />
      )}

      {/* Android-specific End Time Picker */}
      {Platform.OS === 'android' && showEndTimeOnly && (
        <DateTimePicker
          value={endTime}
          mode="time"
          display="default"
          onChange={handleEndTimeChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: Platform.OS === 'ios' ? 10 : 0,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1F2A37',
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 12,
    color: '#1F2A37',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#111827',
    fontSize: 16,
    marginBottom: 12,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    justifyContent: 'center',
  },
  pickerText: {
    color: '#111827',
    fontSize: 16,
  },
  pickerButtonDisabled: {
    opacity: 0.6,
  },
  row: {
    flexDirection: 'row',
  },
  flex1: { flex: 1 },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  optionLabel: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: '#5B8EAD',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  destructiveButton: {
    backgroundColor: '#B94A48',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  destructiveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2A37',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#111827',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  dateTimePickerContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  dateTimePicker: {
    width: Platform.OS === 'ios' ? 300 : '100%',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#5B8EAD',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
});


