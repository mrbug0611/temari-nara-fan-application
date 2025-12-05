// models/StrategistPost.js
const mongoose = require('mongoose');

const strategistPostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true

    }, 

    author: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }, 

        username: {
            type: String,
            required: true,
        }, 

        avatar: String, 

        rank: {
            type: String,
            enum: ['Genin', 'Chunin', 'Jonin', 'ANBU', 'Kage'],
            default: 'Genin'
        }, 
    }, 

    category: {
        type: String,
        enum: ['Team Strategy', 'Battle Analysis', 'Character Analysis', 'Jutsu Combos', 'Historical Discussion', 'General'],
        required: true, 
    }, 

    content: {
        type: String,
        required: true,
    },

    tags: [String],
    relatedCharacters: [String],    

    teamLineup: [{
        character: String,
        role: String,
        reasoning: String,
    }],

    battleScenario: {
        opponents: [String],
        environment: String,
        conditions: String,
        strategy: String,
    }, 

    likes: {
        type: Number,
        default: 0
    }, 

    likedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }], 

    views: {
        type: Number,
        default: 0
    },

    replies: [{
        author: {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Reply',
            }, 

            username: String,
            avatar: String,
            rank: String, 
    }, 
        content: String,

        likes: {
            type: Number,
            default: 0
        }, 

        likedBy: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }],

        createdAt: {
            type: Date,
            default: Date.now
        },


    }],

    pinned: {
        type: Boolean,
        default: false
    }, 

    locked:{
        type: Boolean,
        default: false
    }, 

    featured: {
        type: Boolean,
        default: false
    }, 

    
}, { timestamps: true




});

// indexes for efficient querying
strategistPostSchema.index({category: 1, createdAt: -1});
strategistPostSchema.index({'author.userId': 1});
strategistPostSchema.index({tags: 1});
strategistPostSchema.index({likes: -1});
strategistPostSchema.index({pinned: 1, createdAt: -1});

module.exports = mongoose.model('StrategistPost', strategistPostSchema);    