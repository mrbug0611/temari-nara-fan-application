//models/User.js 
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3, 
        maxlength: 20, 
    }, 

    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        // converts email to lowercase before saving
        lowercase: true,
    }, 

    password: {
        type: String,
        required: true,
        minlength: 6,
    }, 

    profile: {
        avatar: {
            type: String,
            default: 'default-avatar.png',

        },    

        bio: {
            type: String,
            maxlength: 500,
        },

        favoriteCharacter: String, 
        favoriteJutsu: String, 

        rank: {
            type: String,
            enum: ['Genin', 'Chunin', 'Jonin', 'ANBU', 'Kage'],
            default: 'Genin',
        },

        village: String, 

        joinDate: {
            type: Date,
            default: Date.now,
        },
    }, 

    preferences: {
        windEffect: {
            type: Boolean,
            default: true,
        }, 

        backgroundWeather: {
            type: Boolean,
            default: true,
        }, 

        notifications: {
            type: Boolean,
            default: true,
        },  

        theme: {
            type: String,
            enum: ['light', 'dark', 'auto'],
            default: 'auto',
        }, 
    }, 

    activity: {
        fanArtSubmissions: {
            type: Number,
            default: 0,
        }, 

        forumPosts: {
            type: Number,
            default: 0,
        }, 

        forumReplies: {
            type: Number,
            default: 0,
        },

        totalLikes: {
            type: Number,
            default: 0,
        },

        lastActive: Date,
    }, 

    achievements: [{
        name: String,
        description: String,
        unlockedAt: Date,
        icon: String,
    }],
    
    savedContent: {
        fanArt: [{
            // used to reference another document in a different collection
            // unique identifier for the documents in MongoDB
            type: mongoose.Schema.Types.ObjectId,
            ref: 'FanArt',
        }], 

        posts: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'StrategistPost',
        }],

        jutsus: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Jutsu',
        }],
    }, 

    isAdmin: {
        type: Boolean,
        default: false,
    },

    isModerator: {
        type: Boolean,
        default: false,
    },

    isBanned: {
        type: Boolean,
        default: false,
    },

    banReason: {
        type: String,
        maxlength: 500,
    },

    bannedAt: {
        type: Date,
    }, 

    bannedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
}, { timestamps: true
});



// Hash password before saving user document
userSchema.pre('save', async function() {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
}); 

// Method to compare entered password with hashed password in DB
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};


module.exports = mongoose.model('User', userSchema);