// routes/timeline.routes.js
const express = require('express');
// Router is a mini application that handles HTTP requests
const router = express.Router();
const TimelineEvent = require('../models/Timeline');
const { authenticate, isAdmin } = require('../middleware/auth');

// Get all timeline events with filtering and sorting
router.get('/', async (req, res) => {
    try {
        const {era, category, significance} = req.query; // extract query parameters (stuff after ? in URL)

        const filter = {};
        if (era) filter.era = era;
        if (category) filter.category = category;
        if (significance) filter.significance = significance;

        const events = await TimelineEvent.find(filter).sort('order');
        res.json(events);

    }
    catch (error) {
        res.status(500).json({error: error.message});
    }
});    

// get events by specific era
router.get('/era/:era', async (req, res) => {
    try {
        const events = await TimelineEvent.find({ era: req.params.era }).sort('order');
        res.json(events);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }   
});    

// get major events only 
router.get('/major', async (req, res) => {
    try {
        // major events defined as 'Major' and 'Critical' significance
        // $in means "is in this array"
        const events = await TimelineEvent.find({ significance: { $in: ['Major', 'Critical'] } }).sort('order');
        res.json(events);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// get event by ID
router.get('/:id', async (req, res) => {
    try { 
        const event = await TimelineEvent.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.json(event);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// get stats at specific point in timeline
router.get('/stats/:order', async (req, res) => {
    try {
        // findOne finds the first document that matches the criteria
        // $lte means "less than or equal to"   
        // order = field in database
        // req.params.order = value from URL
        const event = await TimelineEvent.findOne({
            order: { $lte: parseInt(req.params.order)},  // order <= requested order
            stats: { $exists: true }  // stats field exists
        }).sort('-order'); // sort descending to get the latest event with stats


        if (!event || !event.stats) {
            return res.status(404).json({ error: 'No stats available at this point' });
        }
        res.json(event.stats);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// crerate new timeline event (admin only)
router.post('/', authenticate, isAdmin, async (req, res) => {
    try {
        const event = new TimelineEvent(req.body);
        await event.save();
        res.status(201).json(event);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// update timeline event (admin only)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const event = await TimelineEvent.findByIdAndUpdate(req.params
            .id, req.body, { new: true, runValidators: true });
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.json(event);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// delete timeline event (admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const event = await TimelineEvent.findByIdAndDelete(req.params.id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.json({ message: 'Event deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;