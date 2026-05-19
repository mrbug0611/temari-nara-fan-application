// routes/report.routes.js - FIXED VERSION
const express = require('express');
const router = express.Router();
const { createTransporter } = require('../config/email');
const Report = require('../models/Report');
const { authenticate, isAdmin, isModerator } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const multer = require('multer');

// ✅ Configure multer to store files in memory
const upload = multer({ storage: multer.memoryStorage() });

let transporter;
let emailConfigError = null;

// Initialize transporter on startup
(async () => {
    try {
        transporter = await createTransporter();
        console.log('✅ Email service (OAuth2) ready');
    } catch (error) {
        emailConfigError = error.message;
        console.error('❌ Email configuration error:', error.message);
        console.error('   Email functionality will be disabled.');
        console.error('   Please verify your OAuth2 environment variables are correctly set.');
    }
})();

// Helper function to check if email is configured
const isEmailConfigured = () => {
    if (!transporter) {
        console.warn('⚠️  Email transporter not initialized');
        return false;
    }
    return true;
};

// Send confirmation email to user
const sendConfirmationEmail = async (email, reportId, reportType) => {
    try {
        if (!transporter) {
            console.warn('Email transporter not ready, skipping confirmation email');
            return;
        }

        const mailOptions = {
            from: `"Temari Fan App" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: 'Report Received - Temari Fan App',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); padding: 20px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
                        <h1 style="margin: 0;">Thank You!</h1>
                        <p style="margin: 5px 0 0 0;">Your report has been received</p>
                    </div>
                    
                    <div style="background: #f3f4f6; padding: 30px; border-radius: 0 0 8px 8px;">
                        <p>Hello,</p>
                        
                        <p>We've received your report and appreciate you helping us maintain a safe community. Our team will review your submission and take appropriate action.</p>
                        
                        <div style="background: white; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0;">
                            <p style="margin: 5px 0;"><strong>Report ID:</strong> ${reportId}</p>
                            <p style="margin: 5px 0;"><strong>Report Type:</strong> ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}</p>
                            <p style="margin: 5px 0;"><strong>Submitted:</strong> ${new Date().toLocaleDateString()}</p>
                        </div>
                        
                        <p><strong>What happens next?</strong></p>
                        <ul style="color: #374151;">
                            <li>Our moderation team will review your report within 24-48 hours</li>
                            <li>We'll take appropriate action based on our Community Guidelines</li>
                            <li>For urgent security issues, we prioritize immediately</li>
                        </ul>
                        
                        <p style="color: #6b7280; font-size: 14px; border-top: 1px solid #d1d5db; padding-top: 15px;">
                            If you have any questions, please don't hesitate to contact us. This is an automated email - please do not reply to this address.
                        </p>
                    </div>
                    
                    <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
                        <p>© 2025 Temari Fan App. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Confirmation email sent to ${email}`);
    } catch (error) {
        console.error('Failed to send confirmation email:', error);
    }
};

// Send notification email to admins
const sendAdminNotification = async (report, screenshotFile) => {
    try {
        if (!transporter) {
            console.warn('Email transporter not ready, skipping admin notification');
            return;
        }

        const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
        
        const severityColor = {
            low: '#10b981',
            medium: '#f59e0b',
            high: '#ef4444',
            critical: '#7c2d12'
        };

        // ✅ Build attachments array if screenshot exists
        const attachments = screenshotFile ? [
            {
                filename: screenshotFile.originalname,
                content: screenshotFile.buffer
            }
        ] : [];

        const mailOptions = {
            from: `"Temari Fan App" <${process.env.EMAIL_FROM}>`,
            to: adminEmail,
            subject: `[${report.severity.toUpperCase()}] New ${report.reportType} Report Submitted`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: ${severityColor[report.severity]}; padding: 15px; color: white; border-radius: 8px;">
                        <h2 style="margin: 0;">New Report: ${report.reportType.toUpperCase()}</h2>
                        <p style="margin: 5px 0 0 0;">Severity: ${report.severity.toUpperCase()}</p>
                    </div>
                    
                    <div style="padding: 20px; background: #f9fafb;">
                        <h3>${report.title}</h3>
                        
                        <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
                            <p><strong>Description:</strong></p>
                            <p style="color: #374151; white-space: pre-wrap;">${report.description}</p>
                        </div>
                        
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr style="border-bottom: 1px solid #e5e7eb;">
                                <td style="padding: 8px; font-weight: bold;">Report ID:</td>
                                <td style="padding: 8px;">${report._id}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #e5e7eb;">
                                <td style="padding: 8px; font-weight: bold;">Email:</td>
                                <td style="padding: 8px;">${report.email}</td>
                            </tr>
                            ${report.username ? `
                            <tr style="border-bottom: 1px solid #e5e7eb;">
                                <td style="padding: 8px; font-weight: bold;">Username:</td>
                                <td style="padding: 8px;">${report.username}</td>
                            </tr>
                            ` : ''}
                            <tr style="border-bottom: 1px solid #e5e7eb;">
                                <td style="padding: 8px; font-weight: bold;">Type:</td>
                                <td style="padding: 8px;">${report.reportType}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #e5e7eb;">
                                <td style="padding: 8px; font-weight: bold;">Severity:</td>
                                <td style="padding: 8px;">${report.severity}</td>
                            </tr>
                            ${report.pageUrl ? `
                            <tr style="border-bottom: 1px solid #e5e7eb;">
                                <td style="padding: 8px; font-weight: bold;">Page URL:</td>
                                <td style="padding: 8px;"><a href="${report.pageUrl}">${report.pageUrl}</a></td>
                            </tr>
                            ` : ''}
                            <tr>
                                <td style="padding: 8px; font-weight: bold;">Submitted:</td>
                                <td style="padding: 8px;">${new Date(report.createdAt).toLocaleString()}</td>
                            </tr>
                            ${screenshotFile ? `
                            <tr style="border-bottom: 1px solid #e5e7eb;">
                                <td style="padding: 8px; font-weight: bold;">Screenshot:</td>
                                <td style="padding: 8px;">📎 ${screenshotFile.originalname} (${(screenshotFile.size / 1024).toFixed(2)} KB)</td>
                            </tr>
                            ` : ''}
                        </table>
                        
                        <div style="margin-top: 20px;">
                            <a href="${process.env.BACKEND_URL || 'http://localhost:5000'}/admin/reports/${report._id}" 
                               style="display: inline-block; padding: 10px 20px; background: #10b981; color: white; text-decoration: none; border-radius: 5px;">
                                View Full Report
                            </a>
                        </div>
                    </div>
                </div>
            `,
            attachments: attachments
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Admin notification sent to ${adminEmail}`);
    } catch (error) {
        console.error('Failed to send admin notification:', error);
    }
};

// Rate limiting for report submissions (max 5 reports per hour per IP)
const reportLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: 'Too many reports from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false
});

// ✅ FIXED: Added upload.single('screenshot') middleware to parse FormData
// This middleware:
// 1. Parses multipart/form-data from the request
// 2. Extracts file from 'screenshot' field into req.file
// 3. Extracts all text fields into req.body
router.post('/', reportLimiter, upload.single('screenshot'), async (req, res) => {
    try {
        // ✅ NOW req.body is populated because multer middleware parsed it
        const { reportType, title, description, email, username, severity, pageUrl } = req.body;

        // ✅ req.file contains screenshot data if user selected one
        const screenshotFile = req.file;

        if (!reportType || !title || !description || !email) {
            return res.status(400).json({
                error: 'Missing required fields: reportType, title, description, email'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: 'Invalid email format'
            });
        }

        const validTypes = ['bug', 'harassment', 'content', 'security', 'feedback', 'other'];
        if (!validTypes.includes(reportType)) {
            return res.status(400).json({
                error: 'Invalid report type'
            });
        }

        if (description.trim().length < 10) {
            return res.status(400).json({
                error: 'Description must be at least 10 characters long'
            });
        }

        const report = new Report({
            reportType,
            title: title.trim(),
            description: description.trim(),
            email: email.toLowerCase(),
            username: username?.trim() || null,
            severity: severity || 'medium',
            pageUrl: pageUrl?.trim() || null,
            userId: req.user?._id || null
        });

        await report.save();

        // ✅ Pass screenshotFile to admin notification
        sendConfirmationEmail(report.email, report._id, report.reportType);
        sendAdminNotification(report, screenshotFile);

        console.log(`✅ New report submitted: ${report._id} - Type: ${reportType} - Email: ${email}`);
        if (screenshotFile) {
            console.log(`   Screenshot attached: ${screenshotFile.originalname} (${screenshotFile.size} bytes)`);
        }

        res.status(201).json({
            message: 'Report submitted successfully',
            reportId: report._id,
            email: report.email
        });

    } catch (error) {
        console.error('Error submitting report:', error);
        res.status(500).json({
            error: 'Failed to submit report. Please try again later.'
        });
    }
});

// Get all reports (admin/moderator only)
router.get('/', authenticate, isModerator, async (req, res) => {
    try {
        const { status, reportType, severity, sort = '-createdAt', limit = 20, page = 1 } = req.query;

        const filter = {};

        if (status) {
            const validStatuses = ['open', 'in-progress', 'resolved', 'closed'];
            if (validStatuses.includes(status)) {
                filter.status = status;
            }
        }

        if (reportType) {
            const validTypes = ['bug', 'harassment', 'content', 'security', 'feedback', 'other'];
            if (validTypes.includes(reportType)) {
                filter.reportType = reportType;
            }
        }

        if (severity) {
            const validSeverities = ['low', 'medium', 'high', 'critical'];
            if (validSeverities.includes(severity)) {
                filter.severity = severity;
            }
        }

        const skip = (page - 1) * limit;
        const reports = await Report.find(filter)
            .sort(sort)
            .limit(parseInt(limit))
            .skip(skip);

        const total = await Report.countDocuments(filter);

        res.json({
            reports,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single report
router.get('/:id', authenticate, async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        // User can only view their own reports unless they're admin/moderator
        if (report.userId?.toString() !== req.user.id && !req.user.isAdmin && !req.user.isModerator) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        res.json(report);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update report status (admin/moderator only)
router.patch('/:id/status', authenticate, isModerator, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['open', 'in-progress', 'resolved', 'closed'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const report = await Report.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        res.json(report);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add note to report (admin/moderator only)
router.patch('/:id/notes', authenticate, isModerator, async (req, res) => {
    try {
        const { notes } = req.body;
        const report = await Report.findByIdAndUpdate(
            req.params.id,
            { notes },
            { new: true }
        );

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        res.json(report);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark as read (admin/moderator only)
router.patch('/:id/read', authenticate, isModerator, async (req, res) => {
    try {
        const report = await Report.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        res.json(report);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Flag report (admin/moderator only)
router.patch('/:id/flag', authenticate, isModerator, async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }
        report.isFlagged = !report.isFlagged;
        await report.save();
        res.json({ isFlagged: report.isFlagged });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete report (admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const report = await Report.findByIdAndDelete(req.params.id);
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }
        res.json({ message: 'Report deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;