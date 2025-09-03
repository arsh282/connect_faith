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

function isBirthday(dateOfBirth) {
  if (!dateOfBirth) {
    console.log('🎂 isBirthday: No dateOfBirth provided');
    return false;
  }
  const today = new Date();
  const dob = new Date(dateOfBirth);
  
  const isBirthdayToday = today.getDate() === dob.getDate() && today.getMonth() === dob.getMonth();
  
  if (isBirthdayToday) {
    console.log('🎂 isBirthday: Happy Birthday!', dob.toDateString());
  }
  
  return isBirthdayToday;
}

export default function BirthdayWish({ userProfile }) {
  const [showWish, setShowWish] = useState(false);
  const [wish, setWish] = useState('');

  useEffect(() => {
    if (userProfile && isBirthday(userProfile.DOB)) {
      console.log('🎂 BirthdayWish: Showing birthday popup for:', userProfile.firstName);
      const randomWish = birthdayWishes[Math.floor(Math.random() * birthdayWishes.length)];
      setWish(randomWish);
      setShowWish(true);
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