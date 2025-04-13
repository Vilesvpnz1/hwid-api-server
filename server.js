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

// Root endpoint with HTML and JSON responses
app.get('/', (req, res) => {
  if (req.headers['accept']?.includes('text/html')) {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>HWID API Service</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
            background-color: #f5f5f5;
          }
          h1 {
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
          }
          .endpoint {
            background: white;
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          }
          .method {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 3px;
            font-weight: bold;
            color: white;
            margin-right: 10px;
          }
          .post { background: #2ecc71; }
          .get { background: #3498db; }
          .patch { background: #f39c12; }
          .delete { background: #e74c3c; }
          code {
            background: #eee;
            padding: 2px 5px;
            border-radius: 3px;
            font-family: monospace;
          }
          .note {
            background: #fffde7;
            padding: 15px;
            border-left: 4px solid #ffd600;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <h1>HWID API Service</h1>
        <p>Welcome to your hardware-protected API service. Below are the available endpoints:</p>
        
        <div class="endpoint">
          <span class="method post">POST</span>
          <strong>/api/keys</strong>
          <p>Create a new API key with HWID protection.</p>
          <p><em>Example:</em> <code>curl -X POST https://${req.get('host')}/api/keys -H "Content-Type: application/json" -d '{"hwid":"your-device-id"}'</code></p>
        </div>

        <div class="endpoint">
          <span class="method get">GET</span>
          <strong>/api/keys/:key</strong>
          <p>Retrieve key information (requires <code>X-API-Key</code> and <code>X-HWID</code> headers).</p>
        </div>

        <div class="endpoint">
          <span class="method patch">PATCH</span>
          <strong>/api/keys/:key</strong>
          <p>Update key metadata (requires headers).</p>
        </div>

        <div class="endpoint">
          <span class="method delete">DELETE</span>
          <strong>/api/keys/:key</strong>
          <p>Delete a key (requires headers).</p>
        </div>

        <div class="endpoint">
          <span class="method post">POST</span>
          <strong>/api/keys/validate</strong>
          <p>Validate a key/HWID pair.</p>
        </div>

        <div class="note">
          <strong>Note:</strong> All endpoints except <code>/</code> require these headers:
          <ul>
            <li><code>X-API-Key: your-api-key</code></li>
            <li><code>X-HWID: your-hardware-id</code></li>
          </ul>
        </div>
      </body>
      </html>
    `);
  } else {
    // Original JSON response for API clients
    res.json({
      message: "HWID API Service",
      endpoints: {
        createKey: "POST /api/keys",
        getKey: "GET /api/keys/:key",
        updateKey: "PATCH /api/keys/:key",
        deleteKey: "DELETE /api/keys/:key",
        validate: "POST /api/keys/validate"
      },
      note: "All endpoints except / require X-API-Key and X-HWID headers"
    });
  }
});

// API Endpoints (unchanged from your original)

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

app.get('/api/keys/:key', validateKeyAndHWID, (req, res) => {
  res.json(req.keyEntry);
});

app.patch('/api/keys/:key', validateKeyAndHWID, (req, res) => {
  const updates = req.body;
  Object.assign(req.keyEntry, updates);
  res.json(req.keyEntry);
});

app.delete('/api/keys/:key', validateKeyAndHWID, (req, res) => {
  database.keys = database.keys.filter(k => k.key !== req.keyEntry.key);
  res.json({ message: 'Key deleted successfully' });
});

app.post('/api/keys/validate', validateKeyAndHWID, (req, res) => {
  res.json({ valid: true, message: 'Key and HWID are valid' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Example HWID: ${generateHWID()}`);
});