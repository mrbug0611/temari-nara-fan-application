// routes/proxy.routes.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const dns = require('dns').promises;
const net = require('net');

// Proxy image requests through the backend to bypass CORS
router.get('/image', async (req, res) => {
  try {
    const { url } = req.query;

    // Validate that URL is provided
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    // Decode the URL (it comes URL-encoded from frontend)
    const decodedUrl = decodeURIComponent(url);

    // Validate that it's a valid URL
    try {
      
        const parsedUrl = new URL(decodedUrl);

        // Only allow HTTP/HTTPS protocols
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
             return res.status(400).json({ error: 'Only HTTP/HTTPS protocols are allowed' });
        }

          // Block private IP ranges and localhost
        const hostname = parsedUrl.hostname.toLowerCase();
        const blockedPatterns = [
            /^localhost$/i,
            /^127\./,
            /^10\./,
            /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
            /^192\.168\./,
            /^169\.254\./,  // Cloud metadata
            /^0\./,
            /^\[?::1\]?$/,  // IPv6 localhost
            /^\[?fe80:/i,   // IPv6 link-local
            /^\[?fc00:/i,   // IPv6 unique local
        ];

        if (blockedPatterns.some(pattern => pattern.test(hostname))) {
            return res.status(400).json({ error: 'Access to private/internal addresses is not allowed' });
  }
 


    } catch (err) {
      return res.status(400).json({ error: 'Invalid URL provided' });
    }

    // Fetch the image from the external source
    const response = await axios.get(decodedUrl, {
      responseType: 'arraybuffer',
      timeout: 10000,
      maxContentLength: 10_000_000, // 10 MB limit
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

        // Validate that the response is actually an image
    const contentType = response.headers['content-type'] || '';
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp'];

    if (!validImageTypes.some(type => contentType.toLowerCase().startsWith(type))) { // if not at least 1 valid type
        return res.status(400).json({ error: 'URL does not point to a valid image' });
    }


    res.set('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    res.set('Access-Control-Allow-Origin', '*');

    // Send the image data
    res.send(response.data);

  } catch (error) {
    console.error('Proxy error:', error.message);

    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'Image not found' });
    }

    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({ error: 'Request timeout' });
    }

    res.status(500).json({ error: 'Failed to proxy image' });
  }
});

module.exports = router;