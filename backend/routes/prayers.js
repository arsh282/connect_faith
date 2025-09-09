const express = require('express');
const { body, validationResult } = require('express-validator');
const { getFirestore } = require('../config/firebase');
const auth = require('../middleware/auth');

const router = express.Router();
const db = getFirestore();

// @route   GET /api/prayers
// @desc    Get all prayers
// @access  Public
router.get('/', async (req, res) => {
  try {
    const prayersSnapshot = await db.collection('prayers')
      .orderBy('createdAt', 'desc')
      .get();

    const prayers = [];
    prayersSnapshot.forEach(doc => {
      prayers.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json(prayers);
  } catch (error) {
    console.error('Get prayers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/prayers
// @desc    Create a prayer request
// @access  Private
router.post('/', [
  auth,
  body('title', 'Title is required').notEmpty(),
  body('content', 'Content is required').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, isAnonymous } = req.body;

    const prayer = {
      title,
      content,
      isAnonymous: isAnonymous || false,
      userId: isAnonymous ? null : req.user.id,
      prayedFor: [],
      createdAt: new Date()
    };

    const prayerRef = await db.collection('prayers').add(prayer);
    const prayerDoc = await prayerRef.get();

    // Emergency contact information for prayer requests
    const emergencyContacts = {
      pastor: {
        name: "Pastor John Smith",
        phone: "+1 (555) 123-4567",
        available: "24/7 for emergencies"
      },
      prayerLeader: {
        name: "Lisa Rodriguez",
        phone: "+1 (555) 456-7890",
        available: "Mon-Sat 8AM-8PM"
      },
      counselor: {
        name: "David Thompson",
        phone: "+1 (555) 567-8901",
        available: "By Appointment"
      }
    };

    // Create notification for prayer submission confirmation
    const notification = {
      type: 'prayer_submission',
      title: 'Prayer Request Submitted',
      message: `Your prayer request "${title}" has been submitted successfully. Our church community will be praying for you.`,
      prayerId: prayerDoc.id,
      userId: req.user.id,
      createdAt: new Date(),
      read: false
    };

    // Save notification to user's notifications
    try {
      await db.collection('notifications').add(notification);
      console.log('Prayer submission notification created for user:', req.user.id);
    } catch (notificationError) {
      console.error('Failed to create prayer notification:', notificationError);
      // Don't fail the prayer submission if notification fails
    }

    res.json({
      id: prayerDoc.id,
      ...prayerDoc.data(),
      notification: {
        message: 'Your prayer request has been submitted successfully!',
        emergencyContacts: emergencyContacts
      }
    });
  } catch (error) {
    console.error('Create prayer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/prayers/:id/pray
// @desc    Mark prayer as prayed for
// @access  Private
router.post('/:id/pray', auth, async (req, res) => {
  try {
    const prayerRef = db.collection('prayers').doc(req.params.id);
    const prayerDoc = await prayerRef.get();

    if (!prayerDoc.exists) {
      return res.status(404).json({ message: 'Prayer not found' });
    }

    const prayerData = prayerDoc.data();
    
    if (prayerData.prayedFor.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already prayed for this request' });
    }

    await prayerRef.update({
      prayedFor: [...prayerData.prayedFor, req.user.id]
    });

    res.json({ message: 'Prayer marked as prayed for' });
  } catch (error) {
    console.error('Pray for prayer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
