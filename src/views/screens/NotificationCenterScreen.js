import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../context/CustomAuthContext';
import { useNotifications } from '../../context/NotificationsContext';

export default function NotificationCenterScreen({ navigation }) {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const { userProfile } = useAuth();
  const [localNotifications, setLocalNotifications] = useState([]);

  // Update local notifications when context notifications change
  useEffect(() => {
    if (notifications && notifications.length > 0) {
      // Transform context notifications to match the expected format
      const transformedNotifications = notifications.map(notification => ({
        id: notification.id,
        title: notification.title,
        description: notification.message || notification.description,
        time: formatTime(notification.timestamp),
        type: notification.type || 'system',
        unread: !notification.read,
        icon: getIconForType(notification.type)
      }));
      setLocalNotifications(transformedNotifications);
    } else {
      setLocalNotifications([]);
    }
  }, [notifications]);

  // Format timestamp to relative time
  const formatTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return notificationTime.toLocaleDateString();
  };

  // Get appropriate icon for notification type
  const getIconForType = (type) => {
    switch (type) {
      case 'event': return 'calendar-outline';
      case 'message': return 'chatbubble-outline';
      case 'announcement': return 'megaphone-outline';
      case 'system': return 'notifications-outline';
      default: return 'notifications-outline';
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'event': return '#4ECDC4';
      case 'message': return '#FF6B35';
      case 'announcement': return '#45B7D1';
      case 'system': return '#96CEB4';
      default: return '#666';
    }
  };

  const renderNotification = (notification) => (
    <TouchableOpacity 
      key={notification.id}
      style={styles.notificationCard}
      activeOpacity={0.8}
      onPress={() => handleNotificationPress(notification)}
    >
      <View style={styles.notificationIcon}>
        <Ionicons 
          name={notification.icon} 
          size={24} 
          color={getIconColor(notification.type)} 
        />
      </View>
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          <View style={styles.notificationMeta}>
            <Text style={styles.notificationTime}>{notification.time}</Text>
            {notification.unread && (
              <View style={styles.unreadIndicator} />
            )}
          </View>
        </View>
        <Text style={styles.notificationDescription}>{notification.description}</Text>
      </View>
    </TouchableOpacity>
  );

  const handleNotificationPress = async (notification) => {
    // Mark as read if it's unread
    if (notification.unread) {
      await markAsRead(notification.id);
    }
    
    // Navigate to appropriate screen based on notification type
    if (notification.type === 'event') {
      navigation.navigate('Events');
    } else if (notification.type === 'message') {
      navigation.navigate('Chat');
    } else if (notification.type === 'announcement') {
      navigation.navigate('Announcements');
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
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
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity 
          style={styles.markAllButton}
          onPress={handleMarkAllAsRead}
        >
          <Text style={styles.markAllText}>Mark All Read</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {localNotifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No Notifications</Text>
            <Text style={styles.emptyStateDescription}>
              You're all caught up! Check back later for updates.
            </Text>
          </View>
        ) : (
          <View style={styles.notificationsList}>
            {localNotifications.map(renderNotification)}
          </View>
        )}
      </ScrollView>
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
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#6699CC',
    borderBottomWidth: 1,
    borderBottomColor: '#6699CC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 10,
    marginLeft: -10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  markAllButton: {
    padding: 10,
    marginRight: -10,
  },
  markAllText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  notificationsList: {
    gap: 12,
    paddingTop: 15,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  notificationMeta: {
    alignItems: 'flex-end',
  },
  notificationTime: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFCC00',
  },
  notificationDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});


