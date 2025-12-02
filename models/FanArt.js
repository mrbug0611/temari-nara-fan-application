const mongoose = require('mongoose');


const fanArtSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true, 
        trim: true
    },
    artist: {
        name: {
            type: String,
            required: true,
    }, 
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }, 
        
        socialLinks: {
            twitter: String, 
            instagram: String,
            deviantArt: String,
            pixiv: String,
            website: String,
        }

}, 

    imageUrl: {
        type: String,
        required: true,
    },

    thumbnailUrl: String, 

    style: {
        type: String,
        enum: ['Digital', 'Traditional', '3D Model', 'Pixel Art', 'Cosplay', 'Sketch', 'Painting', 'Mixed Media'],
        required: true,
    }, 

    era: {
        type: String,
        enum: ['Part 1', 'Shippuden', 'Boruto', 'The Last', 'Original Design'],
        required: true,
    },

    tags: {
        type: [String],
        default: [],
    }, 

    featuring: {
        type: [String],
        default: ['Temari'],
    }, 

    isShikaTemari: {
        type: Boolean,
        default: false,
    },

    description: String,

    likes: {
        type: Number,
        default: 0,
    }, 

    likedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],

    featured: {
        type: Boolean,
        default: false,
    }, 

    approved: {
        type: Boolean,
        default: false,
    }, 

    moderationNotes: String,

    views: {
        type: Number,
        default: 0,
    }, 

    comments: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        
        userName: String,
        text: String,

        createdAt: {
            type: Date,
            default: Date.now,
        }, 
    }]

}, {
    timestamps: true
});

// indexes for efficient querying
fanArtSchema.index({approved: 1, creatdAt: -1}); 
fanArtSchema.index({style: 1});
fanArtSchema.index({era: 1});
fanArtSchema.index({featured: 1});
fanArtSchema.index({likes: -1});
fanArtSchema.index({tags: 1});

module.exports = mongoose.model('FanArt', fanArtSchema);