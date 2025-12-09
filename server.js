//server.js - Main Express Server File
// load required modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const CookieParser = require('cookie-parser');
require('dotenv').config();

// create express app
const app = express();

// import routes
const jutsuRoutes = require('./routes/jutsu.routes');
const timelineRoutes = require('./routes/timeline.routes');
const fanArtRoutes = require('./routes/fanart.routes');
const strategistRoutes = require('./routes/strategist.routes');
const weatherRoutes = require('./routes/weather.routes');
const userRoutes = require('./routes/user.routes');

// middleware 
app.use(helmet()); // security headers (protection against common vulnerabilities)

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000', // allows only request from this origin
    credentials: true, // allow cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // allowed headers
})); // enable CORS (cross-origin resource sharing)
; // enable CORS (cross-origin resource sharing)
// allows requests from frontend url 
app.use(CookieParser()); // parse cookies from request headers
app.use(express.json({limit: '10mb'})); // parse JSON request bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // parse URL-encoded request bodies

// rate limiting
// limit number of requests from a single IP
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter); // apply rate limiting to all /api/ routes

// connect to MongoDB
mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Failed to connect to MongoDB', err);
});

// routes 
app.use('/api/jutsu', jutsuRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/fanart', fanArtRoutes);
app.use('/api/strategist', strategistRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/user', userRoutes);

// health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'active', message: 'Server is healthy', time: new Date().toISOString() });
});

// error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal Server Error',
            status: err.status || 500
        },
    });
});

// 404 handler 
app.use((req, res) => {
    res.status(404).json({ error: { message: 'Not Found', status: 404 } });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

});