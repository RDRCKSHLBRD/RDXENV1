// src/routes/index.js
const express = require('express');
const router = express.Router();
const path = require('path');
const apiRoutes = require('./api');

// API Routes
router.use('/api', apiRoutes);

// Page routes
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

router.get('/filmography', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/filmography.html'));
});

// Fallback route for any other requests
router.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

module.exports = router;