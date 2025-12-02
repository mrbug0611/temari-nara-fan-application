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