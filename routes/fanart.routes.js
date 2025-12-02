const express = require('express');
const router = express.Router();
const FanArt = require('../models/FanArt');
const {authenticate, isModerator} = require('../middleware/auth.middleware');

// Route to get all approved fan art with filtering 
router.get('/', async (req, res) => {
    try {
        const {
            style, 
            era, 
            featured, 
            isShikaTemari,
            sort = '-createdAt',
            limit = 20,
            page = 1

        } = req.query;

        const filter = { approved: true };

        if (style) filter.style = style;
        if (era) filter.era = era;
        if (featured !== undefined) filter.featured = featured === 'true';
        if (isShikaTemari !== undefined) filter.isShikaTemari = isShikaTemari === 'true';

        const skip = (page - 1) * limit;

        const fanArt = await FanArt.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('artist.userId', 'username profile.avatar'); // replace reference id with actual user fields
        
        const total = await FanArt.countDocuments(filter);

        res.json({
            fanArt,
            
            pagination: {
                total, 
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        }); 


    } catch (error) {
        res.status(500).json({ error: error.message});
    }
});

// get featured fan art
router.get('/featured', async (req, res) => {
    try {
        const featuredArt = await FanArt.find({ approved: true, featured: true })
            .sort('-likes')
            .limit(10)
            .populate('artist.userId', 'username profile.avatar');
        res.json(featuredArt);
    }
    catch (error) {
        res.status(500).json({ error: error.message});
    }
});

// get shika temari fan art
router.get('/shikatema', async (req, res) => {
    try {
        const shikaTemari = await FanArt.find({ approved: true, isShikaTemari: true })
            .sort('-likes')
            .populate('artist.userId', 'username profile.avatar');
        res.json(shikaTemari);
    }
    catch (error) {
        res.status(500).json({ error: error.message});
    }
});

// get fan art by id and increment view count
router.get('/:id', async (req, res) => {
    try {
        const fanArt = await FanArt.findByIdAndUpdate(
            req.params.id, 
            { $inc: { views: 1 } }, 
            { new: true }
        ).populate('artist.userId', 'username profile.avatar')
        .populate('comments.userId', 'username profile.avatar');
        if (!fanArt) {
            return res.status(404).json({ error: 'Fan Art not found' });
        }
        res.json(fanArt);
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
});

// submit new fan art
router.post('/', authenticate, async (req, res) => {
    try {
        const fanArt = new FanArt({
            ...req.body, 
            'artist.userId': req.user.id,
        });
        await fanArt.save();

        // update user activity
        await req.user.updateOne({
            $inc: { 'activity.fanArtSubmissions': 1 }
        });

        res.status(201).json(fanArt);
    }
    catch (error) {
        res.status(400).json({ error: error.message});
    }   
});

// like / unlike fan art 
router.post('/:id/like', authenticate, async (req, res) => {
    try {
        const fanArt = await FanArt.findById(req.params.id);
        if (!fanArt) {
            return res.status(404).json({ error: 'Fan Art not found' });
        }
        const hasLiked = fanArt.likedBy.includes(req.user.id);

        if (hasLiked) {
            fanArt.likedBy = fanArt.likedBy.filter(
                id => id.toString() !== req.user.id.toString());
            fanArt.likes = Math.max(0, fanArt.likes - 1);

        }

        else {
            fanArt.likedBy.push(req.user.id);
            fanArt.likes += 1;
        }

        await fanArt.save();
        res.json({likes: fanArt.likes, hasLiked: !hasLiked});
    }
    catch (error) {
        res.status(500).json({ error: error.message});
    }
});

// add a comment to fan art
router.post('/:id/comment', authenticate, async (req, res) => {
    try {
        const fanArt = await FanArt.findById(req.params.id);
        if (!fanArt) { 
            return res.status(404).json({ error: 'Fan Art not found' });
        }

        fanArt.commnents.push( {
            userId: req.user.id,
            username: req.user.username,
            text: req.body.text,
        });

        await fanArt.save();
        res.status(201).json(fanArt.commnents[fanArt.comments.length - 1]);
    }
    catch (error) {
        res.status(400).json({ error: error.message});
    }
});

// approve fan art (moderator only)
// patch only used to update specific fields
// put updats the entire resource
router.patch('/:id/approve', authenticate, isModerator, async (req, res) => {
    try {
        const fanArt = await FanArt.findByIdAndUpdate(
            req.params.id, 
            { approved: true },
            { new: true }
        );
        if (!fanArt) {
            return res.status(404).json({ error: 'Fan Art not found' });
        }
        res.json(fanArt);
    }
    catch (error) {
        res.status(500).json({ error: error.message});
    }
});

// toggled featured status (moderator only)
// Toggle featured (Moderator only)
router.patch('/:id/feature', authenticate, isModerator, async (req, res) => {
  try {
    const fanArt = await FanArt.findById(req.params.id);
    if (!fanArt) {
      return res.status(404).json({ error: 'Fan art not found' });
    }
    fanArt.featured = !fanArt.featured;
    await fanArt.save();
    res.json(fanArt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// delete fan art
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const fanArt = await FanArt.findByIdAndDelete(req.params.id);
        if (!fanArt) {
            return res.status(404).json({ error: 'Fan Art not found' });
        }

        // only allow artist or moderator or admin to delete
        if (fanArt.artist.userId.toString() !== req.user.id.toString() &&
            !req.user.isModerator &&
            !req.user.isAdmin) {
                return res.status(403).json({ error: 'Unauthorized' });
        }

        await fanArt.deleteOne();
        res.json({ message: 'Fan Art deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message});
    }
});

module.exports = router;