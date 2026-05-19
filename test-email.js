const nodemailer = require('nodemailer');

async function testEmail() {
    // HARDCODE YOUR STRINGS HERE FOR THIS 1-MINUTE TEST
    const userEmail = 'your-email@gmail.com'; 
    const clientId = 'your-google-client-id.apps.googleusercontent.com';
    const clientSecret = 'your-google-client-secret';
    const refreshToken = 'your-google-refresh-token';

    console.log('Attempting isolated SMTP connection...');

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: userEmail,
            clientId: clientId,
            clientSecret: clientSecret,
            refreshToken: refreshToken
        }
    });

    try {
        await transporter.verify();
        console.log('✅ SUCCESS: Your Google credentials and OAuth setup are 100% correct!');
    } catch (error) {
        console.error('❌ FAILURE in isolation test:');
        console.error(error);
    }
}

testEmail();