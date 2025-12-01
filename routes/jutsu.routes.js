// routes/jutsu.routes.js
const express = require('express');
// Router is a mini application that handles HTTP requests
const router = express.Router();
const Jutsu = require('../models/jutsu');
const { authenticate, isAdmin } = require('../middleware/auth');

// Get all jutsu with filtering and sorting
router.get('/', async (req, res) => {
    try {
        const { 
            type, 
            rank, 
            nature, 
            classification, 
            isSignature, 
            sort = '-powerLevel', // default sort by powerLevel descending if not provided 
            limit = 50, 
            page = 1,

        } = req.query; // extract query parameters (stuff after ? in URL)
        // for example type=Ninjutsu&rank=S&limit=10&page=2

        const filter = {};

        // Build filter object based on query parameters
        if (type) filter.type = type;
        if (rank) filter.rank = rank;
        if (nature) filter.nature = nature;
        if (classification) filter.classification = classification;
        if (isSignature !== undefined) filter.isSignature = isSignature === 'true';

        const skip = (page - 1) * limit;

        const jutsus = await Jutsu.find(filter)
            .sort(sort)
            .limit(parseInt(limit))
            .skip(skip);

        const total = await Jutsu.countDocuments(filter); // how many total matching jutsus
            
        res.json({ // sends json response back to client
            jutsus,
            pagination: { // object with pagination info
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit) // 47 / 10 = 4.7 rounded up to 5
            }
        });
    }

    catch (error) {
        res.status(500).json({error: error.message });
    }

});

// get signature jutsu
router.get('/signature', async (req, res) => {
    try {
        const signatureJutsus = await Jutsu.find({ isSignature: true })
        .sort('-powerLevel');
        res.json(signatureJutsus);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a single jutsu by ID
router.get('/:id', async (req, res) => {
    try {
        const jutsu = await Jutsu.findById(req.params.id);

        if (!jutsu) {
            return res.status(404).json({ error: 'Jutsu not found' });
        }
        res.json(jutsu);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});     

// Create a new jutsu (admin only)
router.post('/', authenticate, isAdmin, async (req, res) => {
    try {
        const jutsu = new Jutsu(req.body);
        await jutsu.save();
        res.status(201).json(jutsu);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});     

// Update a jutsu by ID (admin only)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const jutsu = await Jutsu.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true });
            // returns the updated document instead of the old one
            // validates the update against the schema

        if (!jutsu) {
            return res.status(404).json({ error: 'Jutsu not found' });
        }
        res.json(jutsu);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a jutsu by ID (admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const jutsu = await Jutsu.findByIdAndDelete(req.params.id);
        if (!jutsu) {
            return res.status(404).json({ error: 'Jutsu not found' });
        }
        res.json({ message: 'Jutsu deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;