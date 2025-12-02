//server.js - Main Express Server File
// load required modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// create express app
const app = express();

// import routes
const jutsuRoutes = require('./routes/jutsu.routes');
const timelineRoutes = require('./routes/timeline.routes');
const fanArtRoutes = require('./routes/fanart.routes');
