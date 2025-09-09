import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function ServicesScreen({ navigation }) {
  // App services and features
  const appServices = [
    {
      id: 1,
      title: 'Events & Activities',
      description: 'Join church events, Bible studies, and community activities',
      icon: 'calendar-outline',
      color: '#6699CC',
      features: ['Event Registration', 'RSVP System', 'Event Reminders', 'Community Activities'],
      benefits: 'Stay connected with church community through various events and activities',
      screen: 'Events'
    },
    {
      id: 2,
      title: 'Prayer Wall',
      description: 'Submit prayer requests and pray for others in the community',
      icon: 'heart-outline',
      color: '#FF6B35',
      features: ['Prayer Requests', 'Community Prayers', 'Anonymous Prayers', 'Prayer Tracking'],
      benefits: 'Share your prayer needs and support others through prayer',
      screen: 'Pray'
    },
    {
      id: 3,
      title: 'Sermon Archive',
      description: 'Access past sermons, teachings, and spiritual content',
      icon: 'play-circle-outline',
      color: '#4ECDC4',
      features: ['Audio Sermons', 'Video Content', 'Sermon Notes', 'Search Archive'],
      benefits: 'Never miss a sermon and access spiritual content anytime',
      screen: 'Sermons'
    },
    {
      id: 4,
      title: 'Community Chat',
      description: 'Connect with church members through group and private chats',
      icon: 'chatbubbles-outline',
      color: '#FFCC00',
      features: ['Group Chats', 'Private Messages', 'File Sharing', 'Real-time Messaging'],
      benefits: 'Build relationships and stay connected with your church family',
      screen: 'Chat'
    },
    {
      id: 5,
      title: 'Announcements',
      description: 'Stay updated with church news, events, and important updates',
      icon: 'megaphone-outline',
      color: '#9C27B0',
      features: ['Church News', 'Event Updates', 'Important Notices', 'Push Notifications'],
      benefits: 'Never miss important church updates and announcements',
      screen: 'Explore'
    },
    {
      id: 6,
      title: 'Donations',
      description: 'Support the church through secure online donations',
      icon: 'card-outline',
      color: '#4CAF50',
      features: ['Online Giving', 'Recurring Donations', 'Donation History', 'Secure Payments'],
      benefits: 'Support your church financially with secure and convenient giving',
      screen: 'Donations'
    }
  ];

  const handleServicePress = (service) => {
    // Navigate to the appropriate screen based on service
    if (service.screen && navigation) {
      navigation.navigate(service.screen);
    }
  };

  const renderServiceItem = (service) => (
    <TouchableOpacity
      key={service.id}
      style={styles.serviceItem}
      onPress={() => handleServicePress(service)}
    >
      <View style={styles.serviceHeader}>
        <View style={[styles.serviceIcon, { backgroundColor: service.color + '20' }]}>
          <Ionicons name={service.icon} size={28} color={service.color} />
        </View>
        <View style={styles.serviceInfo}>
          <View style={styles.serviceTitleRow}>
            <Text style={styles.serviceTitle}>{service.title}</Text>
            {service.adminOnly && (
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>Admin</Text>
              </View>
            )}
          </View>
          <Text style={styles.serviceDescription}>{service.description}</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#ccc" />
      </View>
      
      <View style={styles.benefitsSection}>
        <Text style={styles.benefitsTitle}>Benefits:</Text>
        <Text style={styles.benefitsText}>{service.benefits}</Text>
      </View>
      
      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>Features:</Text>
        <View style={styles.featuresList}>
          {service.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color={service.color} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6699CC" />
      
      {/* Header */}
      <LinearGradient
        colors={['#6699CC', '#6699CC']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>App Services</Text>
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>ConnectFaith Features</Text>
          <Text style={styles.introText}>
            Discover all the ways ConnectFaith helps you stay connected with your church community. 
            Tap on any service to learn more and access its features.
          </Text>
        </View>

        {appServices.map(renderServiceItem)}
        
        <View style={styles.footerNote}>
          <Ionicons name="information-circle-outline" size={16} color="#6699CC" />
          <Text style={styles.footerText}>
            All services are designed to strengthen your connection with God and your church family
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    width: 34,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  introSection: {
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
  introTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  introText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  serviceItem: {
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
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  serviceIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  adminBadge: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  adminBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  benefitsSection: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  benefitsText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  featuresContainer: {
    marginTop: 8,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    flex: 1,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
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
  footerText: {
    fontSize: 14,
    color: '#6699CC',
    marginLeft: 8,
    flex: 1,
    fontStyle: 'italic',
  },
});
