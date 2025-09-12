import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useNotifications } from '../../context/NotificationsContext';

const NotificationScreen = ({ navigation }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  // Debug notifications on component mount
  React.useEffect(() => {
    console.log(`🔔 NotificationScreen: Displaying ${notifications.length} notifications`);
    if (notifications.length > 0) {
      console.log('🔔 Notification types:', notifications.map(n => n.type).join(', '));
      console.log('🔔 First notification:', JSON.stringify(notifications[0]));
    }
  }, [notifications]);

  // Handle navigating back
  const handleBack = () => {
    navigation.goBack();
  };

  // Handle when a notification is pressed
  const handleNotificationPress = (notification) => {
    console.log('🔔 Notification pressed:', notification.id, notification.title);
    
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Navigate based on notification type
    if (notification.type === 'event' && notification.eventId) {
      console.log('🔔 Navigating to event details:', notification.eventId);
      navigation.navigate('EventDetails', { eventId: notification.eventId });
    }
  };

  // Format the timestamp to a readable format
  const formatTimestamp = (timestamp) => {
    try {
      if (!timestamp) return 'Recent';
      
      const now = new Date();
      const date = new Date(timestamp);
      
      // Get time difference in milliseconds
      const diffMs = now - date;
      const diffMins = Math.round(diffMs / 60000);
      const diffHours = Math.round(diffMs / 3600000);
      const diffDays = Math.round(diffMs / 86400000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
      if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
      if (diffDays < 30) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
      
      // Format date for older notifications
      return date.toLocaleDateString();
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Unknown time';
    }
  };

  // Render individual notification items
  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationItem, item.read ? styles.readNotification : styles.unreadNotification]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Ionicons 
            name={item.type === 'event' ? 
              (item.isReminder ? 'calendar' : 'calendar-outline') : 
              'notifications-outline'
            } 
            size={20} 
            color={item.read ? '#888' : '#6699CC'}
          />
          <Text style={[
            styles.notificationTitle, 
            item.read ? styles.readText : styles.unreadText
          ]}>
            {item.title}
          </Text>
        </View>
        <Text style={styles.notificationTime}>
          {formatTimestamp(item.timestamp)}
        </Text>
        <Text style={styles.notificationMessage}>
          {item.message}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => deleteNotification(item.id)}
      >
        <Ionicons name="close" size={16} color="#999" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container} >
      <StatusBar barStyle="light-content" backgroundColor="#6699CC" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity 
            style={styles.markAllButton} 
            onPress={markAllAsRead}
          >
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={50} color="#ccc" />
          <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={item => item.id}
          style={styles.notificationList}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#6699CC',
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#6699CC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 10,
    marginLeft: -10,
  },
  markAllButton: {
    padding: 10,
    marginRight: -10,
  },
  markAllText: {
    color: '#fff',
    fontWeight: '500',
  },
  notificationList: {
    flex: 1,
  },
  listContent: {
    padding: 15,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 16,
    marginVertical: 5,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadNotification: {
    backgroundColor: 'rgba(102, 153, 204, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: '#6699CC',
  },
  readNotification: {
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  notificationTitle: {
    fontSize: 16,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  notificationTime: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  unreadText: {
    fontWeight: 'bold',
    color: '#333',
  },
  readText: {
    fontWeight: '400',
    color: '#555',
  },
  deleteButton: {
    padding: 5,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    color: '#888',
    fontSize: 16,
  },
});

export default NotificationScreen;
