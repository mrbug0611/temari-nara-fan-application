// config/email.js
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

// NEW: Validate OAuth2 environment variables at startup
const validateOAuth2Env = () => {
    const requiredVars = [
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET',
        'GOOGLE_REDIRECT_URL',
        'GOOGLE_REFRESH_TOKEN',
        'EMAIL_USER'
    ];

    const missing = requiredVars.filter(varName => !process.env[varName]);

    if (missing.length > 0) {
        throw new Error(
            `Missing required OAuth2 environment variables:\n` +
            missing.map(v => `  - ${v}`).join('\n') +
            `\n\nPlease check your .env file and ensure all variables are set.`
        );
    }
};

// Validate on module load (fails fast if config is incomplete)
try {
    validateOAuth2Env();
} catch (error) {
    console.error('OAuth2 Configuration Error:', error.message);
    throw error; // Re-throw to prevent server from starting with broken email config
}

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL
);

// Set the refresh token
oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

const createTransporter = async () => {
    try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL_USER,
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
            }
        });

        return transporter;
    } catch (error) {
        console.error('Error creating transporter:', error);
        throw error;
    }
};

module.exports = { createTransporter };