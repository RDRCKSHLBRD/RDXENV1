// src/routes/api.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Helper function to read JSON data
const readJsonFile = (filename) => {
  const filePath = path.join(__dirname, '../../data', filename);
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return null;
  }
};

// API Routes
router.get('/clients', (req, res) => {
  const data = readJsonFile('clients.json');
  if (data) {
    res.json(data);
  } else {
    res.status(500).json({ error: 'Failed to load clients data' });
  }
});

router.get('/projects', (req, res) => {
  const data = readJsonFile('projects.json');
  if (data) {
    res.json(data);
  } else {
    res.status(500).json({ error: 'Failed to load projects data' });
  }
});

router.get('/projects/:clientId', (req, res) => {
  const { clientId } = req.params;
  const data = readJsonFile('projects.json');
  
  if (data && data.projects && data.projects[clientId]) {
    res.json({ projects: data.projects[clientId] });
  } else {
    res.status(404).json({ error: 'Projects not found for this client' });
  }
});

router.get('/films', (req, res) => {
  const data = readJsonFile('films.json');
  if (data) {
    res.json(data);
  } else {
    res.status(500).json({ error: 'Failed to load filmography data' });
  }
});

router.get('/copy', (req, res) => {
  const data = readJsonFile('copy.json');
  if (data) {
    res.json(data);
  } else {
    res.status(500).json({ error: 'Failed to load copy data' });
  }
});

router.get('/images', (req, res) => {
  const data = readJsonFile('images.json');
  if (data) {
    res.json(data);
  } else {
    res.status(500).json({ error: 'Failed to load images data' });
  }
});

router.get('/hero', (req, res) => {
  const data = readJsonFile('hero.json');
  if (data) {
    res.json(data);
  } else {
    res.status(500).json({ error: 'Failed to load hero data' });
  }
});

// heroConfig

router.get('/hero/config', (req, res) => {
  const data = readJsonFile('heroConfig.json'); // Use your existing helper function
  if (data) {
    res.json(data);
  } else {
    res.status(500).json({ error: 'Failed to load hero configuration' });
  }
});

// BAckgoround colour -- 

router.get('/background-colours', (req, res) => {
  const data = readJsonFile('backgroundColour.json'); // Make sure filename matches
  if (data && data.colors) { // Check for the 'colors' array specifically
    res.json(data);
  } else {
    res.status(500).json({ error: 'Failed to load background colour data' });
  }
});

// Make sure this is placed before module.exports = router;

module.exports = router;
