// routes/contact.routes.js
const express = require('express');
const router = express.Router();
const { createTransporter } = require('../config/email');
const rateLimit = require('express-rate-limit');

let transporter;

// Initialize transporter on startup
(async () => {
    try {
        transporter = await createTransporter();
        console.log('Email service ready for contact form');
    } catch (error) {
        console.error('Email service initialization failed:', error.message);
    }
})();

// NEW: HTML Escape function to sanitize user input
// This prevents HTML/JavaScript injection in email content
const escapeHtml = (text) => {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

// Rate limiting for contact submissions (max 5 per hour per IP)
const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: 'Too many contact messages from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false
});

// Send contact form email to admin
const sendContactEmail = async (contactData) => {
    try {
        if (!transporter) {
            console.warn('Email transporter not ready, skipping contact email');
            return;
        }

        const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

        // Sanitize all user input before embedding in HTML
        const sanitizedName = escapeHtml(contactData.name);
        const sanitizedEmail = escapeHtml(contactData.email);
        const sanitizedSubject = escapeHtml(contactData.subject);
        const sanitizedMessage = escapeHtml(contactData.message);
        const sanitizedMethod = contactData.contactMethod === 'email' ? 'Email' : 'Reply on Site';

        const mailOptions = {
            from: `"Temari Fan App" <${process.env.EMAIL_FROM}>`,
            to: adminEmail,
            replyTo: sanitizedEmail,
            subject: `[Contact Form] ${sanitizedSubject} - from ${sanitizedName}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); padding: 20px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
                        <h1 style="margin: 0;">New Contact Form Submission</h1>
                        <p style="margin: 5px 0 0 0;">From Temari Fan App</p>
                    </div>
                    
                    <div style="background: #f3f4f6; padding: 30px; border-radius: 0 0 8px 8px;">
                        <p>You have received a new contact form submission:</p>
                        
                        <div style="background: white; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0; border-radius: 4px;">
                            <p style="margin: 10px 0;"><strong>Name:</strong> ${sanitizedName}</p>
                            <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${sanitizedEmail}">${sanitizedEmail}</a></p>
                            <p style="margin: 10px 0;"><strong>Subject:</strong> ${sanitizedSubject}</p>
                            <p style="margin: 10px 0;"><strong>Contact Method Preference:</strong> ${sanitizedMethod}</p>
                            <p style="margin: 10px 0;"><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
                        </div>

                        <div style="background: #f9fafb; padding: 15px; border-radius: 4px; margin: 20px 0;">
                            <p style="margin: 0 0 10px 0;"><strong>Message:</strong></p>
                            <p style="color: #374151; white-space: pre-wrap; margin: 0;">${sanitizedMessage}</p>
                        </div>

                        <hr style="border: none; border-top: 1px solid #d1d5db; margin: 20px 0;" />

                        <p style="color: #6b7280; font-size: 14px; margin: 0;">
                            To reply to this message, simply reply to this email. The sender's email address is ${sanitizedEmail}.
                        </p>
                    </div>
                    
                    <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
                        <p>© 2025 Temari Fan App. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Contact form email sent to ${adminEmail}`);
    } catch (error) {
        console.error('Failed to send contact email:', error);
    }
};

// Send confirmation email to user
const sendConfirmationEmail = async (email, name) => {
    try {
        if (!transporter) {
            console.warn('Email transporter not ready, skipping confirmation email');
            return;
        }

        // Sanitize user input in confirmation email too
        const sanitizedName = escapeHtml(name);
        const sanitizedEmail = escapeHtml(email);

        const mailOptions = {
            from: `"Temari Fan App" <${process.env.EMAIL_FROM}>`,
            to: sanitizedEmail,
            subject: 'We Received Your Message - Temari Fan App',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); padding: 20px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
                        <h1 style="margin: 0;">Thank You!</h1>
                        <p style="margin: 5px 0 0 0;">We've received your message</p>
                    </div>
                    
                    <div style="background: #f3f4f6; padding: 30px; border-radius: 0 0 8px 8px;">
                        <p>Hello ${sanitizedName},</p>
                        
                        <p>Thank you for reaching out to us! We've received your message and appreciate you taking the time to contact the Temari Fan App team.</p>
                        
                        <div style="background: white; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0; border-radius: 4px;">
                            <p style="margin: 5px 0;"><strong>Submitted at:</strong> ${new Date().toLocaleString()}</p>
                            <p style="margin: 5px 0;"><strong>Your email:</strong> ${sanitizedEmail}</p>
                        </div>
                        
                        <p><strong>What happens next?</strong></p>
                        <ul style="color: #374151;">
                            <li>Our team will review your message</li>
                            <li>We'll respond within 24-48 hours</li>
                            <li>You'll receive our reply at this email address</li>
                        </ul>
                        
                        <p style="color: #6b7280; font-size: 14px; border-top: 1px solid #d1d5db; padding-top: 15px; margin-top: 20px;">
                            If you have any urgent issues, please also check out our <a href="${process.env.BACKEND_URL || 'http://localhost:5000'}/reports" style="color: #10b981; text-decoration: none;">Report Issue</a> page.
                        </p>
                    </div>
                    
                    <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
                        <p>© 2025 Temari Fan App. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Confirmation email sent to ${sanitizedEmail}`);
    } catch (error) {
        console.error('Failed to send confirmation email:', error);
    }
};

// Submit a contact form
router.post('/', contactLimiter, async (req, res) => {
    try {
        const { name, email, subject, message, contactMethod } = req.body;

        // Validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                error: 'Missing required fields: name, email, subject, message'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: 'Invalid email format'
            });
        }

        if (message.trim().length < 10) {
            return res.status(400).json({
                error: 'Message must be at least 10 characters long'
            });
        }

        // Send emails with sanitized data
        sendContactEmail({ name, email, subject, message, contactMethod });
        sendConfirmationEmail(email, name);

        console.log(`Contact form submitted: ${name} (${email}) - Subject: ${subject}`);

        res.status(201).json({
            message: 'Message sent successfully',
            email: email
        });

    } catch (error) {
        console.error('Error submitting contact form:', error);
        res.status(500).json({
            error: 'Failed to send message. Please try again later.'
        });
    }
});

module.exports = router;