import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Alert,
    Linking,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function ContactListScreen({ navigation }) {
  // Church contacts data
  const churchContacts = [
    {
      id: 1,
      name: 'Pastor Michael Johnson',
      role: 'Senior Pastor',
      phone: '+1 (555) 123-4567',
      email: 'pastor@connectfaith.com',
      avatar: 'MJ',
      department: 'Leadership',
      officeHours: 'Mon-Fri 9:00 AM - 5:00 PM'
    },
    {
      id: 2,
      name: 'Sarah Wilson',
      role: 'Youth Pastor',
      phone: '+1 (555) 234-5678',
      email: 'youth@connectfaith.com',
      avatar: 'SW',
      department: 'Youth Ministry',
      officeHours: 'Tue-Thu 2:00 PM - 8:00 PM'
    },
    {
      id: 3,
      name: 'David Chen',
      role: 'Music Director',
      phone: '+1 (555) 345-6789',
      email: 'music@connectfaith.com',
      avatar: 'DC',
      department: 'Worship',
      officeHours: 'Wed-Fri 10:00 AM - 6:00 PM'
    },
    {
      id: 4,
      name: 'Lisa Rodriguez',
      role: 'Children\'s Ministry Director',
      phone: '+1 (555) 456-7890',
      email: 'children@connectfaith.com',
      avatar: 'LR',
      department: 'Children\'s Ministry',
      officeHours: 'Mon, Wed, Fri 9:00 AM - 3:00 PM'
    },
    {
      id: 5,
      name: 'Robert Thompson',
      role: 'Church Administrator',
      phone: '+1 (555) 567-8901',
      email: 'admin@connectfaith.com',
      avatar: 'RT',
      department: 'Administration',
      officeHours: 'Mon-Fri 8:00 AM - 4:00 PM'
    },
    {
      id: 6,
      name: 'Mary Johnson',
      role: 'Prayer Coordinator',
      phone: '+1 (555) 678-9012',
      email: 'prayer@connectfaith.com',
      avatar: 'MJ',
      department: 'Prayer Ministry',
      officeHours: 'Tue, Thu 10:00 AM - 2:00 PM'
    },
    {
      id: 7,
      name: 'James Wilson',
      role: 'Outreach Coordinator',
      phone: '+1 (555) 789-0123',
      email: 'outreach@connectfaith.com',
      avatar: 'JW',
      department: 'Community Outreach',
      officeHours: 'Mon, Wed, Fri 1:00 PM - 5:00 PM'
    },
    {
      id: 8,
      name: 'Jennifer Davis',
      role: 'Women\'s Ministry Leader',
      phone: '+1 (555) 890-1234',
      email: 'women@connectfaith.com',
      avatar: 'JD',
      department: 'Women\'s Ministry',
      officeHours: 'Tue, Thu 9:00 AM - 1:00 PM'
    }
  ];

  const handleCall = (phone, name) => {
    const phoneUrl = `tel:${phone}`;
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(phoneUrl);
        } else {
          Alert.alert('Error', 'Phone calls are not supported on this device');
        }
      })
      .catch((err) => {
        Alert.alert('Error', 'Unable to make phone call');
        console.error('Phone call error:', err);
      });
  };

  const handleMessage = (phone, name) => {
    const smsUrl = `sms:${phone}`;
    Linking.canOpenURL(smsUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(smsUrl);
        } else {
          Alert.alert('Error', 'SMS is not supported on this device');
        }
      })
      .catch((err) => {
        Alert.alert('Error', 'Unable to send SMS');
        console.error('SMS error:', err);
      });
  };

  const handleEmail = (email, name) => {
    const emailUrl = `mailto:${email}`;
    Linking.canOpenURL(emailUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(emailUrl);
        } else {
          Alert.alert('Error', 'Email is not supported on this device');
        }
      })
      .catch((err) => {
        Alert.alert('Error', 'Unable to send email');
        console.error('Email error:', err);
      });
  };

  const renderContactItem = (contact) => (
    <View key={contact.id} style={styles.contactItem}>
      <View style={styles.contactHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{contact.avatar}</Text>
        </View>
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{contact.name}</Text>
          <Text style={styles.contactRole}>{contact.role}</Text>
          <Text style={styles.contactDepartment}>{contact.department}</Text>
        </View>
      </View>
      
      <View style={styles.contactDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{contact.officeHours}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="call-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{contact.phone}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="mail-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{contact.email}</Text>
        </View>
      </View>
      
      <View style={styles.contactActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.callButton]}
          onPress={() => handleCall(contact.phone, contact.name)}
        >
          <Ionicons name="call" size={16} color="#fff" />
          <Text style={styles.actionButtonText} numberOfLines={1}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.messageButton]}
          onPress={() => handleMessage(contact.phone, contact.name)}
        >
          <Ionicons name="chatbubble" size={16} color="#fff" />
          <Text style={styles.actionButtonText} numberOfLines={1}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.emailButton]}
          onPress={() => handleEmail(contact.email, contact.name)}
        >
          <Ionicons name="mail" size={16} color="#fff" />
          <Text style={styles.actionButtonText} numberOfLines={1}>Email</Text>
        </TouchableOpacity>
      </View>
    </View>
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
          <Text style={styles.headerTitle}>Church Contacts</Text>
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>Get in Touch</Text>
          <Text style={styles.introText}>
            Connect with our church staff and ministry leaders. We're here to help and support you in your faith journey.
          </Text>
        </View>

        {churchContacts.map(renderContactItem)}
        
        <View style={styles.footerNote}>
          <Ionicons name="information-circle-outline" size={16} color="#6699CC" />
          <Text style={styles.footerText}>
            For general inquiries, please contact the church office at (555) 123-4567
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
  contactItem: {
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
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6699CC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  contactRole: {
    fontSize: 16,
    color: '#6699CC',
    fontWeight: '600',
    marginBottom: 2,
  },
  contactDepartment: {
    fontSize: 14,
    color: '#666',
  },
  contactDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  contactActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 3,
  },
  callButton: {
    backgroundColor: '#4CAF50',
  },
  messageButton: {
    backgroundColor: '#2196F3',
  },
  emailButton: {
    backgroundColor: '#FF9800',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    numberOfLines: 1,
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
