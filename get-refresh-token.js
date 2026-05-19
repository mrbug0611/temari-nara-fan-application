// get-refresh-token.js
const { google } = require('googleapis');
const readline = require('readline');
require('dotenv').config();

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL || 'urn:ietf:wg:oauth:2.0:oob'
);
const scopes = [
    'https://www.googleapis.com/auth/gmail.send'
];

const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
});

console.log('Visit this URL to authorize:');
console.log(authUrl);
console.log('\n');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter the authorization code from the URL: ', async (code) => {
    try {
        const { tokens } = await oauth2Client.getToken(code);
        console.log('\n✅ Success!');
        console.log('Refresh Token:', tokens.refresh_token);
        console.log('\nAdd this to your .env file:');
        console.log('GOOGLE_REFRESH_TOKEN=' + tokens.refresh_token);
        rl.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        rl.close();
        process.exit(1);
    }
});