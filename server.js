const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Simple in-memory "database"
const database = {
  keys: [],
  users: []
};

// Helper function to generate HWID (simplified for example)
function generateHWID() {
  return crypto.createHash('sha256').update(uuidv4()).digest('hex');
}

// Helper function to generate API keys
function generateAPIKey() {
  return crypto.randomBytes(32).toString('hex');
}

// Middleware to validate API key and HWID
function validateKeyAndHWID(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  const hwid = req.headers['x-hwid'];

  if (!apiKey || !hwid) {
    return res.status(400).json({ error: 'API key and HWID required' });
  }

  const keyEntry = database.keys.find(k => k.key === apiKey && k.hwid === hwid);
  if (!keyEntry) {
    return res.status(403).json({ error: 'Invalid API key or HWID' });
  }

  req.keyEntry = keyEntry;
  next();
}

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'HWID API Service',
    endpoints: {
      createKey: 'POST /api/keys',
      getKey: 'GET /api/keys/:key',
      updateKey: 'PATCH /api/keys/:key',
      deleteKey: 'DELETE /api/keys/:key',
      validate: 'POST /api/keys/validate'
    },
    note: 'All endpoints except / require X-API-Key and X-HWID headers'
  });
});

// API Endpoints

// Create new key with HWID
app.post('/api/keys', (req, res) => {
  const { hwid = generateHWID() } = req.body;
  const newKey = {
    id: uuidv4(),
    key: generateAPIKey(),
    hwid,
    createdAt: new Date(),
    isActive: true
  };
  database.keys.push(newKey);
  res.json(newKey);
});

// Retrieve key info
app.get('/api/keys/:key', validateKeyAndHWID, (req, res) => {
  res.json(req.keyEntry);
});

// Update key (patch)
app.patch('/api/keys/:key', validateKeyAndHWID, (req, res) => {
  const updates = req.body;
  Object.assign(req.keyEntry, updates);
  res.json(req.keyEntry);
});

// Delete key
app.delete('/api/keys/:key', validateKeyAndHWID, (req, res) => {
  database.keys = database.keys.filter(k => k.key !== req.keyEntry.key);
  res.json({ message: 'Key deleted successfully' });
});

// Validate key
app.post('/api/keys/validate', validateKeyAndHWID, (req, res) => {
  res.json({ valid: true, message: 'Key and HWID are valid' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Example HWID: ${generateHWID()}`);
});