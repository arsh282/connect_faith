import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useNotifications } from '../context/NotificationsContext';

const NotificationBell = ({ style, onLogout }) => {
  const { notifications, unreadCount } = useNotifications();
  const navigation = useNavigation();
  
  // Log notification updates for debugging
  useEffect(() => {
    console.log(`🔔 NotificationBell: Unread count updated: ${unreadCount}`);
  }, [unreadCount, notifications.length]);

  const handleBellPress = () => {
    // Using a try-catch to prevent navigation errors
    try {
      navigation.navigate('NotificationScreen');
      console.log('Navigating to NotificationScreen');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleLogoutPress = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <View style={style}>
      <View style={styles.bellContainer}>
        <TouchableOpacity onPress={handleBellPress} style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={24} color="#fff" />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogoutPress}
        >
          <Ionicons name="log-out-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bellContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    position: 'relative',
    padding: 8,
    marginRight: 10,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 8,
  }
});

export default NotificationBell;
