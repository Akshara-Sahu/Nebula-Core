# Backend Setup Guide

## Quick Start (with Docker)

The easiest way to get the backend running locally is with Docker Compose, which sets up all required services.

### Prerequisites
- Docker & Docker Compose installed
- Node.js 18+ (for running the backend locally)
- Git

### Step 1: Start Services with Docker Compose

```bash
cd backend
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- MongoDB on port 27017  
- Redis on port 6379
- Elasticsearch on port 9200

Wait for all services to be healthy (watch the logs):
```bash
docker-compose logs -f
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

The `.env` file is already configured for local development. If needed, update it:

```bash
# Edit .env if you need to change any values
nano .env
```

Key configuration:
- `ANTHROPIC_API_KEY` - Set your Claude API key here (required for /api/explain)
- `REDIS_HOST` - Should be `localhost` if running Docker
- Database credentials - Already set for local development

### Step 4: Start the Backend Server

```bash
# Development mode (with hot reload)
npm run dev

# Or production mode
npm run start
```

You should see:
```
╔════════════════════════════════════════════════════╗
║                                                    ║
║    Nebula Backend API Server Started              ║
║                                                    ║
║    Port: 5000
║    Environment: development
║    API URL: http://localhost:5000/api            ║
║                                                    ║
║    Routes:                                         ║
║    • POST /api/analyze     - Code Analysis        ║
║    • POST /api/visualize   - Generate Diagrams    ║
║    • POST /api/explain     - AI Explanations      ║
║    • POST /api/save        - Save Progress        ║
║    • GET  /api/history     - Analysis History     ║
║    • GET  /api/health      - Health Check         ║
║                                                    ║
╚════════════════════════════════════════════════════╝
```

## Manual Setup (without Docker)

If you prefer to run services manually:

### PostgreSQL
```bash
# macOS with Homebrew
brew install postgresql
brew services start postgresql

# Or download from https://www.postgresql.org/download/
```

Create database:
```bash
createdb nebula_db
```

### MongoDB
```bash
# macOS with Homebrew
brew install mongodb-community
brew services start mongodb-community

# Or download from https://www.mongodb.com/try/download/community
```

### Redis
```bash
# macOS with Homebrew
brew install redis
brew services start redis

# Or download from https://redis.io/download
```

### Elasticsearch
```bash
# Download from https://www.elastic.co/downloads/elasticsearch
# Start with: ./bin/elasticsearch
```

Then run: `npm install && npm run dev`

## Testing the API

### Test Health Check
```bash
curl http://localhost:5000/api/health
```

### Test Code Analysis
```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "code": "const add = (a, b) => a + b;",
    "language": "javascript"
  }'
```

### Test Visualization
```bash
curl -X POST http://localhost:5000/api/visualize \
  -H "Content-Type: application/json" \
  -d '{
    "code": "function hello() { return \"world\"; }",
    "language": "javascript",
    "visualizationType": "mermaid"
  }'
```

### Test Code Explanation (requires ANTHROPIC_API_KEY)
```bash
curl -X POST http://localhost:5000/api/explain \
  -H "Content-Type: application/json" \
  -d '{
    "code": "const sum = (a, b) => a + b;",
    "language": "javascript",
    "explainType": "summary"
  }'
```

## Stopping Services

### Stop Docker Services
```bash
docker-compose down
```

Remove volumes if you want to reset databases:
```bash
docker-compose down -v
```

### Stop Services Started with Homebrew
```bash
brew services stop postgresql
brew services stop mongodb-community
brew services stop redis
```

## Logs

Application logs are written to:
- `logs/error.log` - Error logs
- `logs/combined.log` - All logs
- Console output - Real-time logs

## Troubleshooting

### Redis Connection Error
```
Error: Redis connection refused
```
Make sure Redis is running on port 6379. If using Docker: `docker ps | grep redis`

### MongoDB Connection Error
```
Error: MongoDB connection failed
```
Make sure MongoDB is running on port 27017. Check: `docker ps | grep mongodb`

### PostgreSQL Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
Make sure PostgreSQL is running and has database `nebula_db`. Check: `docker ps | grep postgres`

### Port Already in Use
If port 5000 is already in use, change in `.env`:
```env
PORT=5001
```

### API Returns 500 Errors
Check the logs:
```bash
# If using Docker
docker-compose logs backend

# Or check log files
tail -f logs/error.log
```

## Next Steps

1. Test all API endpoints
2. Verify database connections
3. Set up your Anthropic API key for AI features
4. Connect frontend to backend (update FRONTEND_URL in .env)
5. Deploy to production when ready

## Integration with Frontend

In the frontend `.env`, add:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Then in your frontend components:
```javascript
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analyze`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ code, language })
});
```

## Documentation

- API Documentation: See README.md
- Database Schema: See src/models/
- Service Implementation: See src/services/index.js
- Configuration: See .env and src/config/

