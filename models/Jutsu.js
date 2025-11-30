// /models/Jutsu.js
const mongoose = require('mongoose');

// A schema defines the structure and data types of the documents within a MongoDB collection
const JutsuSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    }, 

    japaneseName: {
        type: String,
        trim: true,
    },

    type: {
        type: String,
        // Enum restricts the value to a predefined set of options
        enum: ['Ninjutsu', 'Genjutsu', 'Taijutsu', 'Kekkei Genkai', 'Collaboration'],
        required: true,
    },

    nature: {
        // Array to allow multiple natures for a single jutsu
        type: [String],
        enum: ['Fire', 'Water', 'Earth', 'Wind', 'Lightning', 'Yin', 'Yang'],
        default: ['Wind'],
    },

    rank: {
        type: String,
        enum: ['E', 'D', 'C', 'B', 'A', 'S'],
        required: true,
    },

    classification: {
        type: String,
        enum: ['Offensive', 'Defensive', 'Supplamentary'],
        required: true,
    },

    description: {
        type: String,
        required: true,
    },

    handSeals: {
        type: [String],
        default: [],
    },

    users: {
        type: [String],
        default: ['Temari'],
    },

    firstAppearance: {
        manga: String,
        anime: String, 
    }, 

    powerLevel: {
        type: Number,
        min: 1,
        max: 10,
        default: 5,
    },

    chakraCost: {
        type: String, 
        enum: ['Low', 'Medium', 'High', 'Very High'],
        default: 'Medium',
    },

    animationData: {
        particleCount: Number,
        windDirection: String,
        intensity: Number,
        color: String,
        duration: Number,   
    },

    imageUrl: String,
    videoClipUrl: String,
    tags: [String],
    isSignature: {
        type: Boolean,
        default: false,
    },

}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    

}); 