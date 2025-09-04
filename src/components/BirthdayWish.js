import { useEffect, useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

const birthdayWishes = [
  "Happy Birthday! 🎉 Wishing you a joyful year ahead filled with God's blessings!",
  "May your day be filled with love, laughter, and divine joy. Happy Birthday! 🎂",
  "Cheers to you on your special day! May God bless you abundantly! 🥳",
  "Wishing you a fantastic birthday and a wonderful year of growth and happiness! ✨",
  "Hope your birthday is as amazing as you are! God's love be with you! 💝",
  "Happy Birthday! May this new year of life bring you closer to God's purpose! 🙏",
  "Celebrating you today! May God's grace shine upon you this year! 🌟",
  "Happy Birthday! Wishing you peace, joy, and countless blessings! 🎈",
  "May your special day be filled with God's love and the warmth of family! ❤️",
  "Happy Birthday! Here's to another year of God's faithfulness in your life! 🎊",
  "Blessed birthday! May God continue to guide and protect you! 🕊️",
  "Happy Birthday! May your heart be filled with gratitude and joy! 🎁"
];

// Special wishes for users who sign up on their birthday
const signupBirthdayWishes = [
  "Welcome and Happy Birthday! 🎉 What a perfect day to join our community!",
  "Happy Birthday and welcome to ConnectFaith! 🎂 We're glad you chose to join us on your special day!",
  "Double celebration! 🥳 Welcome to our community and Happy Birthday!",
  "Happy Birthday! 🎈 Thank you for making us part of your special day by joining our community!",
  "What a blessed coincidence! Happy Birthday and welcome aboard! 🙏✨",
];

function isBirthday(dateOfBirth) {
  if (!dateOfBirth) {
    console.log('🎂 isBirthday: No dateOfBirth provided');
    return false;
  }
  
  console.log('🎂 isBirthday: Checking DOB:', dateOfBirth);
  
  const today = new Date();
  
  // Special case: If the dateOfBirth is today (signup date is birthday)
  if (dateOfBirth.includes(today.toISOString().split('T')[0])) {
    console.log('🎂 isBirthday: Signing up on birthday!');
    return true;
  }
  
  // Handle various date formats including ISO string, date object, or YYYY-MM-DD
  const dob = new Date(dateOfBirth);
  
  const todayMonth = today.getMonth();
  const todayDay = today.getDate();
  const dobMonth = dob.getMonth();
  const dobDay = dob.getDate();
  
  const isBirthdayToday = todayDay === dobDay && todayMonth === dobMonth;
  
  console.log('🎂 isBirthday: Today:', today.toDateString());
  console.log('🎂 isBirthday: DOB:', dob.toDateString());
  console.log('🎂 isBirthday: Today Month/Day:', todayMonth, todayDay);
  console.log('🎂 isBirthday: DOB Month/Day:', dobMonth, dobDay);
  console.log('🎂 isBirthday: Is Birthday?', isBirthdayToday);
  
  if (isBirthdayToday) {
    console.log('🎂 isBirthday: Happy Birthday!', dob.toDateString());
  }
  
  return isBirthdayToday;
}

export default function BirthdayWish({ userProfile }) {
  const [showWish, setShowWish] = useState(false);
  const [wish, setWish] = useState('');

  useEffect(() => {
    if (!userProfile) {
      console.log('🎂 BirthdayWish: No user profile available');
      return;
    }
    
    console.log('🎂 BirthdayWish: Checking birthday for user:', userProfile.firstName);
    console.log('🎂 BirthdayWish: User DOB:', userProfile.DOB);
    
    // Check if this is a newly registered user (created within the last minute)
    const isNewlyRegistered = userProfile.createdAt && 
      new Date().getTime() - new Date(userProfile.createdAt).getTime() < 60000; // Less than 1 minute
      
    if (isNewlyRegistered) {
      console.log('🎂 BirthdayWish: New user registration detected!');
    }
    
    // Check if today is user's birthday
    if (userProfile.DOB && isBirthday(userProfile.DOB)) {
      console.log('🎂 BirthdayWish: Today is user\'s birthday!');
      
      // Choose appropriate wish message based on whether they're new or existing user
      let randomWish;
      if (isNewlyRegistered) {
        // Special wish for someone who signed up on their birthday
        randomWish = signupBirthdayWishes[Math.floor(Math.random() * signupBirthdayWishes.length)];
        console.log('🎂 BirthdayWish: Using special signup birthday message');
      } else {
        // Regular birthday wish for existing users
        randomWish = birthdayWishes[Math.floor(Math.random() * birthdayWishes.length)];
      }
      
      console.log('🎂 BirthdayWish: Showing birthday popup for:', userProfile.firstName);
      setWish(randomWish);
      setShowWish(true);
    } else {
      console.log('🎂 BirthdayWish: Not user\'s birthday today');
    }
  }, [userProfile]);

  if (!showWish) return null;

  return (
    <Modal visible={showWish} animationType="fade" transparent>
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
      }}>
        <View style={{
          backgroundColor: '#fff',
          borderRadius: 20,
          padding: 30,
          margin: 20,
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
          maxWidth: '90%'
        }}>
          <View style={{ width: 100, height: 100, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFD700', borderRadius: 50, marginBottom: 20 }}>
            <Text style={{ fontSize: 40 }}>🎂</Text>
          </View>
          <Text style={{ fontSize: 20, color: '#333', marginVertical: 20, textAlign: 'center', lineHeight: 28 }}>{wish}</Text>
          <TouchableOpacity 
            style={{
              backgroundColor: '#6699CC',
              paddingHorizontal: 30,
              paddingVertical: 12,
              borderRadius: 25,
              marginTop: 10
            }}
            onPress={() => setShowWish(false)}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Thank You! 🙏</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}