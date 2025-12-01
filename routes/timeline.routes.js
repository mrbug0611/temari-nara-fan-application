// routes/timeline.routes.js
const express = require('express');
// Router is a mini application that handles HTTP requests
const router = express.Router();
const TimelineEvent = require('../models/timelineEvent.model');
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