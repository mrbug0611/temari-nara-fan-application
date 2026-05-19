const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reportType: {
        type: String,
        enum: ['bug', 'harassment', 'content', 'security', 'feedback', 'other'],
        required: true
    },

    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },

    description: {
        type: String,
        required: true,
        maxlength: 2000
    },

    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },

    username: {
        type: String,
        trim: true
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },

    pageUrl: {
        type: String,
        trim: true
    },

    screenshot: {
        filename: String,
        path: String,
        mimetype: String
    },

    status: {
        type: String,
        enum: ['open', 'in-progress', 'resolved', 'closed'],
        default: 'open'
    },

    notes: {
        type: String,
        default: ''
    },

    isRead: {
        type: Boolean,
        default: false
    },

    isFlagged: {
        type: Boolean,
        default: false,
        description: 'Flag for false reports or abuse'
    },

    createdAt: {
        type: Date,
        default: Date.now,
        expires: 30 * 24 * 60 * 60 // Auto-delete after 30 days
    }

}, { timestamps: true });
// Indexes for efficient querying
reportSchema.index({ reportType: 1, createdAt: -1 });
reportSchema.index({ status: 1 });
reportSchema.index({ severity: 1 });
reportSchema.index({ email: 1 });
reportSchema.index({ userId: 1 });

module.exports = mongoose.model('Report', reportSchema);
