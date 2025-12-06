// routes/user.routes.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { authenticate } = require('../middleware/auth');

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'Username or email already exists' 
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      'profile.joinDate': new Date()
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'temari-wind-release-secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile,
        preferences: user.preferences
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if banned
    if (user.isBanned) {
      return res.status(403).json({ error: 'Account is banned' });
    }

    // Update last active
    user.activity.lastActive = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'temari-wind-release-secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile,
        preferences: user.preferences,
        isAdmin: user.isAdmin,
        isModerator: user.isModerator
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user profile
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('savedContent.fanArt')
      .populate('savedContent.posts')
      .populate('savedContent.jutsus');
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/me', authenticate, async (req, res) => {
  try {
    const allowedUpdates = ['profile', 'preferences'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field]) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Change password
router.put('/me/password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Save/unsave fan art
router.post('/me/save/fanart/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const fanArtId = req.params.id;

    const index = user.savedContent.fanArt.indexOf(fanArtId);
    if (index > -1) {
      user.savedContent.fanArt.splice(index, 1);
    } else {
      user.savedContent.fanArt.push(fanArtId);
    }

    await user.save();
    res.json({ saved: index === -1 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save/unsave post
router.post('/me/save/post/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const postId = req.params.id;

    const index = user.savedContent.posts.indexOf(postId);
    if (index > -1) {
      user.savedContent.posts.splice(index, 1);
    } else {
      user.savedContent.posts.push(postId);
    }

    await user.save();
    res.json({ saved: index === -1 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save/unsave jutsu
router.post('/me/save/jutsu/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const jutsuId = req.params.id;

    const index = user.savedContent.jutsus.indexOf(jutsuId);
    if (index > -1) {
      user.savedContent.jutsus.splice(index, 1);
    } else {
      user.savedContent.jutsus.push(jutsuId);
    }

    await user.save();
    res.json({ saved: index === -1 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by username (public profile)
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password -email -savedContent');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user stats
router.get('/:username/stats', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('username profile.rank activity achievements');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;