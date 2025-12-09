// routes/user.routes.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { authenticate, isAdmin, isModerator } = require('../middleware/auth');

// Register new user with cookies 
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
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // set http-only cookie 
    res.cookie('token', token, {
      httpOnly: true, // accessible only by web server not JavaScript
      secure: process.env.NODE_ENV === 'production', // https only in production
      sameSite: 'strict', // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    res.status(201).json({
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

// Login user with cookies 
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
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
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

// logout user clear cookie
router.post('/logout', authenticate, (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  res.json({ message: 'Logged out successfully' });
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

// ban a user (admin only)
router.post('/:id/ban', authenticate, isAdmin, async (req, res) => {
  try {
    const { reason } = req.body;

    const userId = req.params.id; 
    
    // prevent admin from banning themselves
    if (userId === req.user.id.toString()) {
      return res.status(400).json({ error: 'Cannot ban yourself' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // prevent banning other admins
    if (user.isAdmin) {
      return res.status(403).json({ error: 'Cannot ban another admin' });
    }

    // check if user is already banned
    if (user.isBanned) {
      return res.status(400).json({ error: 'User is already banned' });
    }


    user.isBanned = true;
    user.banReason = reason || 'Violation of terms of service';
    user.bannedAt = new Date();
    user.bannedBy = req.user.id;
    await user.save();

    res.json({ message: 'User has been banned', 
      id: user.id, 
      username: user.username, 
      email: user.email, 
      isBanned: user.isBanned,
      banReason: user.banReason,
      bannedAt: user.bannedAt

     });
  }
  catch (error) {
    res.status(500).json({ error: error.message
    });
  }
});

// unban a user (admin only)
router.post('/:id/unban', authenticate, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (!user.isBanned) {
      return res.status(400).json({ error: 'User is not banned' });
    }
    user.isBanned = false;
    user.banReason = undefined;
    user.bannedAt = undefined;
    user.bannedBy = undefined;
    await user.save();
    res.json({ message: 'User has been unbanned', 
      id: user.id, 
      username: user.username,
      email: user.email,
      isBanned: user.isBanned 
    });
  }
  catch (error) {
    res.status(500).json({ error: error.message });
  } 
});


// get a ban history of a user (admin/moderator only)
router.get('/:id/ban-info', authenticate, isModerator, async (req, res) => {
  try {

    const user = await User.findById(req.params.id)
      .select('username email isBanned banReason bannedAt bannedBy')
      .populate('bannedBy', 'username email');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      username: user.username,
      email: user.email,
      isBanned: user.isBanned,
      banInfo: user.isBanned ? {
        reason: user.banReason,
        bannedAt: user.bannedAt,
        bannedBy: user.bannedBy
      } : null
     });
  } 
  catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// update ban reason (admin only)
router.put('/:id/ban-reason', authenticate, isAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const userId = req.params.id;

    if (!reason) {
      return res.status(400).json({ error: 'Ban reason is required' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (!user.isBanned) {
      return res.status(400).json({ error: 'User is not banned' });
    }
    user.banReason = reason;
    await user.save();
    res.json({ message: 'Ban reason updated', 
      user: {
        id: user.id, 
        username: user.username, 
        banReason: user.banReason
      }
    });
  }
  catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Promote user to admin (Super Admin only)
router.post('/:id/promote', authenticate, isAdmin, async (req, res) => {
  try {
    const { role } = req.body; // 'admin' or 'moderator'
    const userId = req.params.id;

    // Only allow if requester is already an admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Only admins can promote users' });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Promote user
    if (role === 'admin') {
      user.isAdmin = true;
      user.isModerator = true; // Admins are also moderators
    } else if (role === 'moderator') {
      user.isModerator = true;
    } else {
      return res.status(400).json({ error: 'Invalid role. Use "admin" or "moderator"' });
    }

    await user.save();

    res.json({
      message: `User promoted to ${role} successfully`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        isModerator: user.isModerator
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Demote user (Super Admin only)
router.post('/:id/demote', authenticate, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent self-demotion
    if (userId === req.user.id.toString()) {
      return res.status(400).json({ error: 'You cannot demote yourself' });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Demote user
    user.isAdmin = false;
    user.isModerator = false;

    await user.save();

    res.json({
      message: 'User demoted successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        isModerator: user.isModerator
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;