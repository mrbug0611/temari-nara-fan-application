// models/Timeline.js
const mongoose = require('mongoose');

const timelineEventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true, 
        trim: true
    }, 

    era: {
        type: String,
        enum: ['Pre-Academy', 'Chunin Exams', 'Sasuke Retrieval', 'Shippuden', 'War Arc', 'Post-War', 'Boruto'],
        required: true
    }, 

    date: {
        arc: String,
        episode: Number,
        chapter: Number
    }, 

    description: {
        type: String,
        required: true
    },

    significance: {
        type: String, 
        enum: ['Minor', 'Moderate', 'Major', 'Critical'],
        default: 'Moderate'
    },

    category: {
        type: String,
        enum: ['Battle', 'Character Development', 'Relationship', 'Personal Achievement', 'Mission', 'Diplomatic'],
        required: true
    }, 

    relatedCharacters: {
        type: [String],
        default: []
    },

    location: String,
    age: Number, 
    imageUrl: String,
    videoClipUrl: String, 

    quotes: [{
        text: String,
        speaker: String
    }], 

    stats: {
        strength: Number,
        intelligence: Number,
        speed: Number,
        taijutsu: Number,
        chakra: Number, 
        ninjutsu: Number,

    }, 

    coordinates: {
        x: Number, // For timeline visualization
        y: Number, 
    }, 

    order: { // chronological order 
        type: Number,
        required: true,
    }, 
    
}, {
    timestamps: true




});

// Indexes for efficient querying
timelineEventSchema.index({order: 1}); 
timelineEventSchema.index({era: 1, order: 1});

module.exports = mongoose.model('TimelineEvent', timelineEventSchema);