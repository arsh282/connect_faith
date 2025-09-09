import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Linking,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../context/CustomAuthContext';
import { useNotifications } from '../../context/NotificationsContext';

const { width, height } = Dimensions.get('window');

export default function PrayerWallScreen({ navigation }) {
  const [prayerText, setPrayerText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  // Church member contact data
  const churchMembers = [
    {
      id: 1,
      name: "Pastor John Smith",
      role: "Senior Pastor",
      phone: "+1 (555) 123-4567",
      email: "pastor.john@connectfaith.com",
      available: "24/7 Emergency"
    },
    {
      id: 2,
      name: "Sarah Johnson",
      role: "Associate Pastor",
      phone: "+1 (555) 234-5678",
      email: "sarah.johnson@connectfaith.com",
      available: "Mon-Fri 9AM-5PM"
    },
    {
      id: 3,
      name: "Michael Chen",
      role: "Church Elder",
      phone: "+1 (555) 345-6789",
      email: "michael.chen@connectfaith.com",
      available: "Evenings & Weekends"
    },
    {
      id: 4,
      name: "Lisa Rodriguez",
      role: "Prayer Ministry Leader",
      phone: "+1 (555) 456-7890",
      email: "lisa.rodriguez@connectfaith.com",
      available: "Mon-Sat 8AM-8PM"
    },
    {
      id: 5,
      name: "David Thompson",
      role: "Church Counselor",
      phone: "+1 (555) 567-8901",
      email: "david.thompson@connectfaith.com",
      available: "By Appointment"
    }
  ];
  // Default community prayers
  const defaultPrayers = [
    {
      id: 1,
      text: "Praying for healing and strength for my friend going through a tough time with their health. May they feel comforted and recover quickly.",
      author: "Sarah P.",
      isAnonymous: false,
      prayerCount: 15,
      hasPrayed: false,
      timestamp: "2 hours ago",
      isDefault: true
    },
    {
      id: 2,
      text: "Please pray for my family as we navigate some difficult decisions. We need wisdom and guidance from above.",
      author: "Anonymous",
      isAnonymous: true,
      prayerCount: 8,
      hasPrayed: true,
      timestamp: "1 day ago",
      isDefault: true
    },
    {
      id: 3,
      text: "Praying for our church community to grow stronger in faith and love. May we be a light to those around us.",
      author: "Pastor John",
      isAnonymous: false,
      prayerCount: 23,
      hasPrayed: false,
      timestamp: "3 days ago",
      isDefault: true
    }
  ];

  const [prayers, setPrayers] = useState(defaultPrayers);

  // Load prayers from storage when component mounts
  useEffect(() => {
    loadPrayers();
  }, []);

  // Load prayers from AsyncStorage
  const loadPrayers = async () => {
    try {
      const storedPrayers = await AsyncStorage.getItem('community_prayers');
      if (storedPrayers) {
        const parsedPrayers = JSON.parse(storedPrayers);
        // Merge stored prayers with default prayers, avoiding duplicates
        const mergedPrayers = [...defaultPrayers];
        
        // Add stored prayers that aren't already in default prayers
        parsedPrayers.forEach(storedPrayer => {
          if (!mergedPrayers.find(p => p.id === storedPrayer.id)) {
            mergedPrayers.push(storedPrayer);
          }
        });
        
        // Sort by timestamp (newest first)
        mergedPrayers.sort((a, b) => {
          const aTime = new Date(a.createdAt || a.timestamp || 0);
          const bTime = new Date(b.createdAt || b.timestamp || 0);
          return bTime - aTime;
        });
        
        setPrayers(mergedPrayers);
        console.log('📿 Loaded prayers from storage:', mergedPrayers.length);
      } else {
        console.log('📿 No stored prayers found, using defaults');
      }
    } catch (error) {
      console.error('❌ Error loading prayers:', error);
    }
  };

  // Save prayers to AsyncStorage
  const savePrayers = async (prayersToSave) => {
    try {
      // Only save user-submitted prayers (not default ones)
      const userPrayers = prayersToSave.filter(prayer => !prayer.isDefault);
      await AsyncStorage.setItem('community_prayers', JSON.stringify(userPrayers));
      console.log('📿 Saved prayers to storage:', userPrayers.length);
    } catch (error) {
      console.error('❌ Error saving prayers:', error);
    }
  };

  // Format timestamp to relative time
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    const now = new Date();
    const prayerTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - prayerTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return prayerTime.toLocaleDateString();
  };

  const handleSubmitPrayer = async () => {
    if (!prayerText.trim()) {
      Alert.alert('Empty Prayer', 'Please enter your prayer request before submitting.');
      return;
    }

    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to submit a prayer request.');
      return;
    }

    setSubmitting(true);

    try {
      // For now, we'll use the local implementation but add notification functionality
      // In a real app, this would call the backend API
      const now = new Date();
      const newPrayer = {
        id: Date.now(),
        text: prayerText,
        author: isAnonymous ? "Anonymous" : "You",
        isAnonymous: isAnonymous,
        prayerCount: 0,
        hasPrayed: false,
        timestamp: "Just now",
        isDefault: false,
        userId: user?.uid || 'anonymous',
        createdAt: now.toISOString()
      };

      const updatedPrayers = [newPrayer, ...prayers];
      setPrayers(updatedPrayers);
      
      // Save to storage
      await savePrayers(updatedPrayers);
      
      // Add notification for successful prayer submission
      await addNotification({
        type: 'prayer_submission',
        title: 'Prayer Request Submitted',
        message: 'Your prayer request has been submitted successfully! Our church community will be praying for you.',
        prayerId: newPrayer.id
      });

      // Show success alert with emergency contact information
      Alert.alert(
        'Prayer Request Submitted! 🙏',
        'Your prayer request has been submitted successfully. Our church community will be praying for you.\n\nFor urgent matters, please contact:\n\nPastor John Smith: (555) 123-4567\nLisa Rodriguez (Prayer Leader): (555) 456-7890\nDavid Thompson (Counselor): (555) 567-8901',
        [
          { text: 'OK', style: 'default' }
        ]
      );

      setPrayerText('');
      setIsAnonymous(false);
    } catch (error) {
      console.error('Error submitting prayer:', error);
      Alert.alert('Error', 'Failed to submit prayer request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrayFor = async (prayerId) => {
    // Simply toggle the prayer count and mark as prayed
    const updatedPrayers = prayers.map(prayer => 
      prayer.id === prayerId 
        ? { 
            ...prayer, 
            prayerCount: prayer.hasPrayed ? prayer.prayerCount - 1 : prayer.prayerCount + 1,
            hasPrayed: !prayer.hasPrayed 
          }
        : prayer
    );
    
    setPrayers(updatedPrayers);
    
    // Save changes to storage
    await savePrayers(updatedPrayers);
  };

  const handleDoubleTap = async (prayerId) => {
    // Remove prayer
    const updatedPrayers = prayers.filter(prayer => prayer.id !== prayerId);
    setPrayers(updatedPrayers);
    
    // Save changes to storage
    await savePrayers(updatedPrayers);
  };

  const handleCallMember = (phoneNumber, memberName) => {
    const phoneUrl = `tel:${phoneNumber}`;
    Linking.canOpenURL(phoneUrl)
      .then(supported => {
        if (supported) {
          Linking.openURL(phoneUrl);
        } else {
          Alert.alert('Error', 'Unable to make phone calls on this device');
        }
      })
      .catch(err => {
        Alert.alert('Error', 'Unable to make phone calls');
        console.error('Error opening phone app:', err);
      });
  };

  const handleTextMember = (phoneNumber, memberName) => {
    const message = `Hello ${memberName}, I need urgent help or support. Please call me back when you're available. Thank you.`;
    const smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(smsUrl)
      .then(supported => {
        if (supported) {
          Linking.openURL(smsUrl);
        } else {
          Alert.alert('Error', 'Unable to send text messages on this device');
        }
      })
      .catch(err => {
        Alert.alert('Error', 'Unable to send text message');
        console.error('Error opening SMS app:', err);
      });
  };

  const handleEmailMember = (email, memberName) => {
    const subject = 'Urgent Help Request';
    const body = `Hello ${memberName},\n\nI need urgent help or support. Please contact me as soon as possible.\n\nThank you.`;
    const emailUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.canOpenURL(emailUrl)
      .then(supported => {
        if (supported) {
          Linking.openURL(emailUrl);
        } else {
          Alert.alert('Error', 'Unable to send emails on this device');
        }
      })
      .catch(err => {
        Alert.alert('Error', 'Unable to send email');
        console.error('Error opening email app:', err);
      });
  };

  const renderPrayerItem = (prayer) => {
    const isCompleted = prayer.hasPrayed;
    const isOwnPrayer = prayer.author === "You";
    
    return (
      <View key={prayer.id} style={styles.prayerItem}>
        <Text style={styles.prayerText}>{prayer.text}</Text>
        
        <View style={styles.prayerFooter}>
          <Text style={styles.prayerAuthor}>— {prayer.author}</Text>
          <View style={styles.prayerActions}>
            <TouchableOpacity 
              style={[
                styles.prayButton,
                isCompleted && styles.prayButtonActive
              ]}
              onPress={() => handlePrayFor(prayer.id)}
            >
              <Ionicons 
                name={isCompleted ? "heart" : "heart-outline"} 
                size={20} 
                color={isCompleted ? "#6699CC" : "#6699CC"} 
              />
              <Text style={[
                styles.prayButtonText,
                isCompleted && styles.prayButtonTextActive
              ]}>
                {isCompleted ? `Prayed! (${prayer.prayerCount})` : `Tap to pray (${prayer.prayerCount})`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.prayerTimestamp}>
          {prayer.createdAt ? formatTimestamp(prayer.createdAt) : prayer.timestamp}
        </Text>
        
        {/* Show remove option only for own prayers */}
        {isOwnPrayer && (
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={() => handleDoubleTap(prayer.id)}
          >
            <Ionicons name="trash-outline" size={16} color="#FF6B6B" />
            <Text style={styles.removeButtonText}>Remove my prayer</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

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
        <Text style={styles.headerTitle}>Prayer Wall</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Prayer Submission Section */}
        <View style={styles.submissionSection}>
          <Text style={styles.sectionTitle}>Share Your Prayer Request</Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.prayerInput}
              placeholder="Write your prayer request here..."
              placeholderTextColor="rgba(255,255,255,0.7)"
              value={prayerText}
              onChangeText={setPrayerText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.anonymousToggle}>
            <Text style={styles.toggleLabel}>Post anonymously</Text>
            <Switch
              value={isAnonymous}
              onValueChange={setIsAnonymous}
              trackColor={{ false: 'rgba(255,255,255,0.3)', true: '#FFCC00' }}
              thumbColor={isAnonymous ? '#fff' : '#fff'}
            />
          </View>

          <TouchableOpacity 
            style={[
              styles.submitButton,
              (!prayerText.trim() || submitting) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmitPrayer}
            disabled={!prayerText.trim() || submitting}
          >
            {submitting ? (
              <View style={styles.loadingContainer}>
                <Ionicons name="hourglass-outline" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Submitting...</Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>Submit Prayer Request</Text>
            )}
          </TouchableOpacity>

          {/* Need Help Button */}
          <TouchableOpacity 
            style={styles.helpButton}
            onPress={() => setShowHelpModal(true)}
          >
            <Ionicons name="help-circle" size={24} color="#fff" />
            <Text style={styles.helpButtonText}>Need Help or Urgent?</Text>
          </TouchableOpacity>
        </View>

        {/* Prayer List */}
        <View style={styles.prayersSection}>
          <Text style={styles.communityPrayersTitle}>Community Prayers</Text>
          <View style={styles.prayersList}>
            {prayers.map(renderPrayerItem)}
          </View>
        </View>
      </ScrollView>

      {/* Help Modal */}
      <Modal
        visible={showHelpModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowHelpModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Church Support Team</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowHelpModal(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>
              Contact any of our church members for urgent help or support
            </Text>

            <ScrollView style={styles.membersList} showsVerticalScrollIndicator={false}>
              {churchMembers.map((member) => (
                <View key={member.id} style={styles.memberCard}>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberRole}>{member.role}</Text>
                    <Text style={styles.memberPhone}>{member.phone}</Text>
                    <Text style={styles.memberAvailable}>Available: {member.available}</Text>
                  </View>
                  
                  <View style={styles.memberActions}>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleCallMember(member.phone, member.name)}
                    >
                      <Ionicons name="call" size={20} color="#fff" />
                      <Text style={styles.actionButtonText}>Call</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.textButton]}
                      onPress={() => handleTextMember(member.phone, member.name)}
                    >
                      <Ionicons name="chatbubble" size={20} color="#fff" />
                      <Text style={styles.actionButtonText}>Text</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.emailButton]}
                      onPress={() => handleEmailMember(member.email, member.name)}
                    >
                      <Ionicons name="mail" size={20} color="#fff" />
                      <Text style={styles.actionButtonText}>Email</Text>
                    </TouchableOpacity>
                  </View>
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
    fontSize: 22,
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
  submissionSection: {
    backgroundColor: '#6699CC',
    borderRadius: 20,
    padding: 25,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  prayerInput: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
    padding: 20,
    fontSize: 18,
    color: '#fff',
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  anonymousToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  toggleLabel: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#FFCC00',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: 'rgba(255, 204, 0, 0.5)',
    shadowOpacity: 0.1,
  },
  submitButtonText: {
    color: '#333',
    fontSize: 20,
    fontWeight: '700',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  prayersSection: {
    marginBottom: 30,
  },
  communityPrayersTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  prayersList: {
    gap: 20,
  },
  prayerItem: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  prayerText: {
    fontSize: 18,
    color: '#333',
    lineHeight: 28,
    marginBottom: 15,
  },
  prayerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  prayerAuthor: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  prayerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 8,
  },
  prayButtonActive: {
    backgroundColor: '#6699CC',
    borderColor: '#6699CC',
  },
  prayButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  prayButtonTextActive: {
    color: '#fff',
  },
  prayerTimestamp: {
    fontSize: 14,
    color: '#999',
    textAlign: 'right',
    marginTop: 10,
  },
  helpButton: {
    backgroundColor: '#FF6B6B',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 15,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  helpButtonText: {
    color: '#fff',
    fontSize: 18,
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
    borderRadius: 20,
    width: width * 0.9,
    maxHeight: height * 0.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    lineHeight: 22,
  },
  membersList: {
    maxHeight: height * 0.5,
    paddingHorizontal: 20,
  },
  memberCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  memberInfo: {
    marginBottom: 15,
  },
  memberName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 5,
  },
  memberRole: {
    fontSize: 14,
    color: '#6699CC',
    fontWeight: '600',
    marginBottom: 8,
  },
  memberPhone: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 5,
  },
  memberAvailable: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  memberActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#6699CC',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  textButton: {
    backgroundColor: '#28A745',
  },
  emailButton: {
    backgroundColor: '#FFCC00',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FFE0E0',
    gap: 5,
  },
  removeButtonText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '500',
  },
});


