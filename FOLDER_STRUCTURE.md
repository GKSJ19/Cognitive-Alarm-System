# Folder Structure — Milestone 2

```text
Milestone_2_Code/
├── backend/
│   ├── app/
│   │   ├── config/              # Application settings & env parsing
│   │   ├── core/                # Exception handlers, logging, security
│   │   ├── database/            # PostgreSQL & MongoDB connection setup
│   │   ├── dependencies/        # FastAPI dependencies (JWT Auth)
│   │   ├── middleware/          # Request logging middleware
│   │   ├── models/              # SQLAlchemy database ORM models
│   │   ├── routers/             # FastAPI route handlers
│   │   ├── schemas/             # Pydantic data schemas
│   │   ├── services/            # Cognitive Challenge Engine & services
│   │   └── main.py              # Application entrypoint & lifespan
│   ├── tests/                   # Automated pytest test suites
│   ├── migrations/              # Database schema migration scripts
│   ├── Dockerfile               # Multi-stage production container setup
│   └── pyproject.toml           # Package dependencies & configuration
├── docker-compose.yml           # Multi-container orchestration config
├── .env.example                 # Template for environment variables
└── cognitive_challenge_engine.py # Standalone, portable challenge engine
```
