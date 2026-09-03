# Nebula Backend API

A comprehensive backend infrastructure for the Nebula IDE - providing code analysis, visualization generation, and AI-powered code explanations.

## Overview

The Nebula Backend is built with **Node.js + Express.js** and integrates with multiple services:

- **Claude AI API** - AI-powered code explanations
- **AST Parsers** - Babel, Acorn for JavaScript/TypeScript
- **Caching** - Redis for fast result retrieval
- **Databases** - PostgreSQL for structured data, MongoDB for flexible schemas
- **Search** - Elasticsearch for code search capabilities

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- MongoDB 5+
- Redis 6+
- Anthropic API Key

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Update .env with your configuration
nano .env

# Start development server
npm run dev
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # PostgreSQL, MongoDB, Elasticsearch
│   │   └── redis.js             # Redis cache configuration
│   ├── controllers/
│   │   └── index.js             # API endpoint handlers
│   ├── middleware/
│   │   └── index.js             # Express middleware (auth, validation, errors)
│   ├── models/
│   │   ├── mongoModels.js       # MongoDB schemas
│   │   └── postgresModels.js    # PostgreSQL tables
│   ├── routes/
│   │   └── api.js               # API route definitions
│   ├── services/
│   │   └── index.js             # Business logic (analysis, visualization, explanations)
│   ├── utils/
│   │   └── logger.js            # Winston logger configuration
│   └── index.js                 # Main Express app
├── logs/                         # Application logs
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## API Endpoints

### Code Analysis
```bash
POST /api/analyze
Content-Type: application/json

{
  "code": "function hello() { console.log('hello'); }",
  "language": "javascript",
  "analysisType": "general"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "analysis-123",
    "metrics": {
      "linesOfCode": 1,
      "functions": 1,
      "complexity": 1
    },
    "issues": [],
    "executionTime": 45
  }
}
```

### Visualization Generation
```bash
POST /api/visualize
Content-Type: application/json

{
  "code": "function hello() { return 'world'; }",
  "language": "javascript",
  "visualizationType": "mermaid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "type": "mermaid",
    "visualization": "graph TD\n    A[Code Structure]\n    B[Functions]",
    "language": "javascript"
  }
}
```

### AI Code Explanation
```bash
POST /api/explain
Content-Type: application/json

{
  "code": "const sum = (a, b) => a + b;",
  "language": "javascript",
  "explainType": "summary"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "explanation": "This is an arrow function that takes two parameters and returns their sum.",
    "language": "javascript",
    "model": "claude-3-5-sonnet-20241022",
    "tokensUsed": 50
  }
}
```

### Save Progress
```bash
POST /api/save
Content-Type: application/json

{
  "analysisId": "123",
  "visualizationId": "456",
  "progressData": { "score": 100 }
}
```

### Get Analysis History
```bash
GET /api/history?limit=50&offset=0
```

### Health Check
```bash
GET /api/health
```

## Database Schemas

### PostgreSQL Tables

- **users** - User account information
- **code_analyses** - Stored code analysis results
- **visualizations** - Generated visualizations
- **explanations** - AI-generated explanations
- **user_progress** - User learning progress

### MongoDB Collections

- **users** - Extended user profiles
- **analyses** - Flexible analysis data
- **visualizations** - Visualization metadata
- **explanations** - Detailed explanations
- **user_progress** - Detailed progress tracking

## Configuration

### Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Claude API
ANTHROPIC_API_KEY=your_key_here

# PostgreSQL
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=postgres
PG_DATABASE=nebula_db

# MongoDB
MONGODB_URI=mongodb://localhost:27017/nebula_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Elasticsearch
ELASTICSEARCH_HOST=localhost
ELASTICSEARCH_PORT=9200

# Cache TTL (seconds)
CACHE_TTL_SHORT=300
CACHE_TTL_LONG=3600
```

## Features

### Code Analysis
- **AST Parsing** - Parse JavaScript/TypeScript code structure
- **Metrics Extraction** - LOC, complexity, function count
- **Issue Detection** - Security issues, console statements, empty catches
- **Caching** - Redis caching for frequently analyzed code

### Visualization Generation
- **Mermaid Diagrams** - Flowcharts and sequence diagrams
- **D3 Graphs** - Interactive force-directed graphs
- **Multiple Types** - Flowchart, tree, graph, sequence

### AI Explanations
- **Claude Integration** - Using Anthropic Claude API
- **Multiple Levels** - Summary, detailed, educational
- **Key Points** - Automatic key point extraction
- **Caching** - Cache explanations for reuse

### Caching & Performance
- **Redis Caching** - Fast result retrieval
- **Configurable TTL** - Short and long-term caches
- **Pattern Deletion** - Batch cache invalidation

### Database Integration
- **PostgreSQL** - Structured, relational data
- **MongoDB** - Flexible schema for complex data
- **Elasticsearch** - Full-text code search

## Development

### Run Development Server
```bash
npm run dev
```

### Run Linting
```bash
npm run lint
```

### Run Tests
```bash
npm test
```

## Error Handling

The API implements comprehensive error handling:

- **Validation Errors** (400) - Invalid request data
- **Authentication Errors** (401) - Missing/invalid auth token
- **Rate Limiting** (429) - Too many requests
- **Server Errors** (500) - Internal server errors

All errors return consistent JSON format:
```json
{
  "success": false,
  "error": {
    "status": 400,
    "message": "Validation error",
    "details": []
  }
}
```

## Performance Optimizations

1. **Request Caching** - Redis caching for analysis results
2. **Rate Limiting** - Prevent API abuse (100 req/15min)
3. **Connection Pooling** - PostgreSQL connection pool
4. **Async Operations** - Non-blocking I/O throughout
5. **GZIP Compression** - Automatic response compression

## Security

- **Helmet.js** - HTTP security headers
- **CORS** - Cross-Origin Resource Sharing configured
- **Input Validation** - Joi schema validation
- **Rate Limiting** - Prevent brute force attacks
- **API Key Support** - Optional API key authentication

## Future Enhancements

- [ ] JWT authentication
- [ ] User registration/login
- [ ] Advanced AST analysis
- [ ] Multi-language support (Python, Java, C++)
- [ ] Real-time collaboration
- [ ] Code search with Elasticsearch
- [ ] Performance profiling
- [ ] GitHub integration
- [ ] Docker deployment
- [ ] GraphQL API

## Deployment

### Docker

```bash
docker build -t nebula-backend .
docker run -p 5000:5000 --env-file .env nebula-backend
```

### Environment Setup (Production)

1. Use PostgreSQL managed service (AWS RDS, DigitalOcean, etc.)
2. Use MongoDB Atlas for managed MongoDB
3. Use Redis Cloud for managed Redis
4. Use Elasticsearch Cloud for managed Elasticsearch
5. Set `NODE_ENV=production`
6. Use strong `ANTHROPIC_API_KEY`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT

## Support

For issues, questions, or suggestions, please open an issue in the repository.
