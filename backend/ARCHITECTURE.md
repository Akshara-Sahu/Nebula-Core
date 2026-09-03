```
NEBULA IDE - COMPLETE ARCHITECTURE
═════════════════════════════════════════════════════════════════════════

FRONTEND (e:\Project_1\frontend)
┌─────────────────────────────────────────────────────────────────────┐
│ Next.js 16.2 + React 19 (Port 3000)                                 │
│                                                                      │
│ ┌──────────────────────────────────────────────────────────────┐   │
│ │ Nebula Core - Interactive Visual Playground                 │   │
│ │                                                              │   │
│ │ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │   │
│ │ │   Monaco     │  │  Mermaid     │  │   D3 Graph   │       │   │
│ │ │   Editor     │  │   Charts     │  │ Visualization│       │   │
│ │ └──────────────┘  └──────────────┘  └──────────────┘       │   │
│ │                                                              │   │
│ │ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │   │
│ │ │  Plotly      │  │  Three.js    │  │  vis-network │       │   │
│ │ │   Charts     │  │  3D WebGL    │  │  Graphs      │       │   │
│ │ └──────────────┘  └──────────────┘  └──────────────┘       │   │
│ │                                                              │   │
│ │ State: Zustand + React Query                                │   │
│ │ Styling: Tailwind CSS + Framer Motion + Lucide Icons        │   │
│ └──────────────────────────────────────────────────────────────┘   │
│                            ↓↑                                       │
│                       CORS (Port 3000 ↔ 5000)                      │
└─────────────────────────────────────────────────────────────────────┘


BACKEND (e:\Project_1\backend)
┌─────────────────────────────────────────────────────────────────────┐
│ Node.js + Express.js (Port 5000)                                    │
│                                                                      │
│ ┌──────────────────────────────────────────────────────────────┐   │
│ │ API ENDPOINTS                                                │   │
│ │                                                              │   │
│ │ POST /api/analyze    → Code Analysis Engine                 │   │
│ │ POST /api/visualize  → Visualization Generator              │   │
│ │ POST /api/explain    → AI Explanation (Claude)              │   │
│ │ POST /api/save       → Progress Tracking                    │   │
│ │ GET  /api/history    → Analysis History                     │   │
│ │ GET  /api/health     → Health Check                         │   │
│ └──────────────────────────────────────────────────────────────┘   │
│                            ↓↑                                       │
│ ┌──────────────────────────────────────────────────────────────┐   │
│ │ SERVICES                                                     │   │
│ │                                                              │   │
│ │ • codeAnalysisService    • visualizationService             │   │
│ │ • explanationService     • cachingService                    │   │
│ └──────────────────────────────────────────────────────────────┘   │
│                            ↓↑                                       │
│ ┌──────────────────────────────────────────────────────────────┐   │
│ │ MIDDLEWARE                                                   │   │
│ │                                                              │   │
│ │ • Authentication    • Validation (Joi)  • Error Handler     │   │
│ │ • Rate Limiting     • CORS              • Request Logger    │   │
│ └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘


EXTERNAL SERVICES & INTEGRATIONS
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│ ┌─────────────────────────────────────────────────────────────┐    │
│ │ ANTHROPIC CLAUDE API                                        │    │
│ │ • Code explanations                                         │    │
│ │ • Key point extraction                                      │    │
│ │ • Multi-level explanations (summary/detailed/educational)   │    │
│ └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│ ┌─────────────────────────────────────────────────────────────┐    │
│ │ AST PARSERS                                                 │    │
│ │ • @babel/parser - JavaScript/TypeScript parsing             │    │
│ │ • acorn - Alternative JS parser                             │    │
│ │ • @babel/traverse - AST navigation                          │    │
│ └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│ ┌─────────────────────────────────────────────────────────────┐    │
│ │ VISUALIZATION LIBRARIES                                     │    │
│ │ • Mermaid - Diagrams and flowcharts                          │    │
│ │ • D3.js - Force-directed graphs                             │    │
│ │ • Three.js - 3D WebGL scenes                                │    │
│ │ • Plotly.js - Interactive charts                            │    │
│ │ • vis-network - Network topologies                          │    │
│ └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘


DATA LAYER
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│ ┌──────────────────────────┐  ┌──────────────────────────────────┐ │
│ │ POSTGRESQL (Relational)  │  │ MONGODB (Flexible Schema)        │ │
│ │ Port 5432                │  │ Port 27017                       │ │
│ │                          │  │                                  │ │
│ │ • users                  │  │ • users (profiles)               │ │
│ │ • code_analyses          │  │ • analyses (full results)        │ │
│ │ • visualizations         │  │ • visualizations (metadata)      │ │
│ │ • explanations           │  │ • explanations (complete)        │ │
│ │ • user_progress          │  │ • user_progress (achievements)   │ │
│ │                          │  │                                  │ │
│ │ Connections: Pooled      │  │ Connections: Native Driver       │ │
│ │ Queries: SQL             │  │ Queries: MongoQL                 │ │
│ │ Indexes: Automated       │  │ Schema: Auto-create              │ │
│ └──────────────────────────┘  └──────────────────────────────────┘ │
│                                                                      │
│ ┌──────────────────────────┐  ┌──────────────────────────────────┐ │
│ │ REDIS (Cache)            │  │ ELASTICSEARCH (Search)           │ │
│ │ Port 6379                │  │ Port 9200                        │ │
│ │                          │  │                                  │ │
│ │ • Analysis cache         │  │ • Code indexing                  │ │
│ │ • Explanation cache      │  │ • Full-text search               │ │
│ │ • Session data           │  │ • Query capabilities             │ │
│ │ • Rate limit counters    │  │ • Analytics                      │ │
│ │                          │  │                                  │ │
│ │ TTL: Short (5m)          │  │ Index: Auto-sync                 │ │
│ │ TTL: Long (1h)           │  │ Status: Optional                 │ │
│ └──────────────────────────┘  └──────────────────────────────────┘ │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘


DEPLOYMENT ARCHITECTURE
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│ ┌──────────────────────────────────────────────────────────────┐   │
│ │ LOCAL DEVELOPMENT (Docker Compose)                           │   │
│ │                                                              │   │
│ │ services:                                                    │   │
│ │  - postgres:15-alpine   (PostgreSQL)                        │   │
│ │  - mongo:7              (MongoDB)                           │   │
│ │  - redis:7-alpine       (Redis)                             │   │
│ │  - elasticsearch:8      (Elasticsearch)                     │   │
│ │                                                              │   │
│ │ All services have:                                           │   │
│ │  ✓ Health checks        ✓ Volume persistence                │   │
│ │  ✓ Port exposure        ✓ Startup order                     │   │
│ └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│ ┌──────────────────────────────────────────────────────────────┐   │
│ │ PRODUCTION DEPLOYMENT OPTIONS                                │   │
│ │                                                              │   │
│ │ • AWS (EC2/ECS/Lambda with RDS, DynamoDB, ElastiCache)     │   │
│ │ • DigitalOcean (App Platform + Managed Databases)          │   │
│ │ • Azure (App Service + Cosmos DB + Cache for Redis)        │   │
│ │ • Google Cloud (Cloud Run + Cloud SQL + Memorystore)       │   │
│ │ • Heroku (Procfile ready)                                   │   │
│ │ • Fly.io (Docker-native)                                    │   │
│ │ • Self-hosted (Docker + Docker Compose)                     │   │
│ └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘


FILE STRUCTURE
═════════════════════════════════════════════════════════════════════

backend/
├── src/
│   ├── config/
│   │   ├── database.js          (PostgreSQL, MongoDB, Elasticsearch)
│   │   └── redis.js             (Redis cache & helpers)
│   ├── controllers/
│   │   └── index.js             (API endpoint handlers)
│   ├── middleware/
│   │   └── index.js             (Auth, validation, error handling)
│   ├── models/
│   │   ├── mongoModels.js       (Mongoose schemas)
│   │   └── postgresModels.js    (SQL tables & queries)
│   ├── routes/
│   │   └── api.js               (API routes with validation)
│   ├── services/
│   │   └── index.js             (Business logic)
│   ├── utils/
│   │   └── logger.js            (Winston logger)
│   └── index.js                 (Express app)
├── logs/                        (Log files)
├── docker-compose.yml           (Docker services)
├── package.json                 (Dependencies)
├── .env                         (Development config)
├── .env.example                 (Config template)
├── .eslintrc.json               (Linting)
├── .prettierrc                  (Formatting)
├── .gitignore                   (Git patterns)
├── README.md                    (API docs)
└── SETUP.md                     (Setup guide)


KEY STATISTICS
═════════════════════════════════════════════════════════════════════

Dependencies: 21 production + 8 development
API Endpoints: 6 main routes
Database Tables: 5 PostgreSQL + 5 MongoDB collections
Cache System: Redis with configurable TTL
Services: 3 core (Analysis, Visualization, Explanation)
Middleware: 6 types (Auth, Validation, Errors, Logs, Rate Limit, CORS)
External APIs: 1 (Anthropic Claude)
AST Parsers: 2 (Babel, Acorn)
Lines of Code: 1000+ application code
Documentation: Complete with setup guide

═════════════════════════════════════════════════════════════════════
```
