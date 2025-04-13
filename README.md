# 🔑 HWID-Protected API Server

A Node.js API server that manages keys with Hardware ID (HWID) validation.

## 🚀 **Quick Start**
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   node server.js
   ```
3. The API will run at `http://localhost:3000`.

## 🌐 **API Endpoints**
| Endpoint                | Method | Description                          | Required Headers          |
|-------------------------|--------|--------------------------------------|---------------------------|
| `/api/keys`             | POST   | Create a new API key (with HWID)     | None                      |
| `/api/keys/:key`        | GET    | Retrieve key details                | `X-API-Key`, `X-HWID`     |
| `/api/keys/:key`        | PATCH  | Update key metadata                 | `X-API-Key`, `X-HWID`     |
| `/api/keys/:key`        | DELETE | Delete a key                        | `X-API-Key`, `X-HWID`     |
| `/api/keys/validate`    | POST   | Validate a key + HWID pair          | `X-API-Key`, `X-HWID`     |

## 📝 **Example Requests**
### Create a Key
```bash
curl -X POST http://localhost:3000/api/keys -H "Content-Type: application/json" -d '{"hwid":"my-device-hwid"}'
```

### Validate a Key
```bash
curl -X POST http://localhost:3000/api/keys/validate -H "X-API-Key: YOUR_KEY" -H "X-HWID: YOUR_HWID"
```

## ⚠️ **Important Notes**
- This uses an **in-memory database** (data resets when server stops).
- For production, add a real database (e.g., MongoDB).
- HWID validation is simulated—replace with actual hardware fingerprinting in real apps.

## 📜 **License**
[MIT](LICENSE) (or specify your license)