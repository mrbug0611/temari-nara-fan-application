// middleware/auth.js 
// Checks if the user is authenticated before allowing access to protected routes
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Authenticate JWT token middleware
const authenticate = async (req, res, next) => {
    try {
   
        const token = req.cookies.token; // get token from cookies

        if (!token) {
            return res.status(401).json({ error: 'Authentication Required' });
        }

        // verify token is valid and extract data 
        // jwt.verify() checks is token is legitimate and hasn't been tampered with

        const decoded = jwt.verify(
            token, // jwt token to verify 
            process.env.JWT_SECRET // secret key used to verify token
        );

        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ error: 'User Not Found' });
        }

        if (user.isBanned) {
            return res.status(403).json({ error: 'Account is Banned',
                banned: true,
                banReason: user.banReason || 'No reason provided',
             });
        }

        req.user = user; // attach user to request object for downstream use
        req.token = token; // attach token to request object for downstream use
        next(); // proceed to next middleware or route handler

    }
    catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid Token' });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token Expired' });
        }
        
        return res.status(500).json({ error: 'Authentication Error' });
    }
}; 

// Checks if the user has admin privileges
const isAdmin = (req, res, next) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ error: 'Admin Access Required' });
    }
    next();
}  

// Check if user is moderator or admin 
const isModerator = (req, res, next) => {
    if (!req.user.isModerator && !req.user.isAdmin) {
        return res.status(403).json({ error: 'Moderator Access Required' });
    }
    next();
}

// Optional Authentication Middleware
// show different content based on whether user is logged in or not
// but don't require them to be logged in   
// can continue with limited features even if user is banned, no token, or invalid token
const optionalAuthenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (token) {
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || 'temari-wind-release-secret'
            ); 
        

            const user = await User.findById(decoded.id);

            if (user && !user.isBanned) {
                req.user = user;
                req.token = token;
            }
    }
    next();
    }
catch (error) {
        // If no token is provided, proceed without authentication
        return next();
    }
};  

module.exports = {
    authenticate,
    isAdmin,
    isModerator,
    optionalAuthenticate
};