const express = require('express');
const { body, validationResult } = require('express-validator');
const { getFirestore } = require('../config/firebase');
const auth = require('../middleware/auth');

const router = express.Router();
const db = getFirestore();

// @route   GET /api/sermons
// @desc    Get all sermons
// @access  Public
router.get('/', async (req, res) => {
  try {
    const sermonsSnapshot = await db.collection('sermons')
      .orderBy('date', 'desc')
      .get();

    const sermons = [];
    sermonsSnapshot.forEach(doc => {
      sermons.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json(sermons);
  } catch (error) {
    console.error('Get sermons error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/sermons
// @desc    Create a new sermon
// @access  Private (Admin only)
router.post('/', [
  auth,
  body('title', 'Title is required').notEmpty(),
  body('preacher', 'Preacher is required').notEmpty(),
  body('date', 'Date is required').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { 
      title, 
      preacher, 
      date, 
      description, 
      audioUrl, 
      videoUrl, 
      youtubeUrl,
      duration,
      tags,
      notes,
      type = 'audio' // 'audio' or 'video'
    } = req.body;

    const sermon = {
      title,
      preacher,
      date: new Date(date),
      description: description || null,
      audioUrl: audioUrl || null,
      videoUrl: videoUrl || null,
      youtubeUrl: youtubeUrl || null,
      duration: duration || null,
      tags: tags || [],
      type: type,
      notes: notes || null,
      createdBy: req.user.id,
      createdAt: new Date(),
      viewCount: 0,
      likeCount: 0
    };

    const sermonRef = await db.collection('sermons').add(sermon);
    const sermonDoc = await sermonRef.get();

    res.json({
      id: sermonDoc.id,
      ...sermonDoc.data()
    });
  } catch (error) {
    console.error('Create sermon error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/sermons/:id/view
// @desc    Increment sermon view count
// @access  Public
router.put('/:id/view', async (req, res) => {
  try {
    const sermonId = req.params.id;
    const sermonRef = db.collection('sermons').doc(sermonId);
    
    await sermonRef.update({
      viewCount: db.FieldValue.increment(1)
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Update view count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/sermons/:id/like
// @desc    Toggle sermon like
// @access  Private
router.put('/:id/like', auth, async (req, res) => {
  try {
    const sermonId = req.params.id;
    const userId = req.user.id;
    const sermonRef = db.collection('sermons').doc(sermonId);
    const sermonDoc = await sermonRef.get();
    
    if (!sermonDoc.exists) {
      return res.status(404).json({ message: 'Sermon not found' });
    }

    const sermonData = sermonDoc.data();
    const likedBy = sermonData.likedBy || [];
    const isLiked = likedBy.includes(userId);

    if (isLiked) {
      // Unlike
      await sermonRef.update({
        likeCount: db.FieldValue.increment(-1),
        likedBy: db.FieldValue.arrayRemove(userId)
      });
    } else {
      // Like
      await sermonRef.update({
        likeCount: db.FieldValue.increment(1),
        likedBy: db.FieldValue.arrayUnion(userId)
      });
    }

    res.json({ 
      success: true, 
      isLiked: !isLiked,
      likeCount: isLiked ? sermonData.likeCount - 1 : (sermonData.likeCount || 0) + 1
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/sermons/:id
// @desc    Get sermon by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const sermonId = req.params.id;
    const sermonDoc = await db.collection('sermons').doc(sermonId).get();
    
    if (!sermonDoc.exists) {
      return res.status(404).json({ message: 'Sermon not found' });
    }

    res.json({
      id: sermonDoc.id,
      ...sermonDoc.data()
    });
  } catch (error) {
    console.error('Get sermon error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
