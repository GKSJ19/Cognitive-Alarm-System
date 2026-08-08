# Folder Structure

Below is the high-level physical directory structure representing the Milestone 1 codebase.

```text
Milestone_1_Code/
├── backend/                  # FastAPI Application
│   ├── app/                  # Application Source
│   │   ├── config/           # Pydantic settings & env loading
│   │   ├── core/             # Security, exceptions, global logging
│   │   ├── database/         # Async engine, session maker, DB seeding
│   │   ├── dependencies/     # FastAPI Depends (Auth, RBAC)
│   │   ├── middleware/       # Custom request interceptors
│   │   ├── models/           # SQLAlchemy declarative classes
│   │   ├── repositories/     # Database CRUD abstractions
│   │   ├── routers/          # API endpoint definitions
│   │   ├── schemas/          # Pydantic validation models
│   │   ├── services/         # Business logic layer
│   │   ├── utils/            # Helper functions
│   │   ├── __init__.py
│   │   └── main.py           # Application entry point
│   ├── migrations/           # Alembic database migration scripts
│   ├── tests/                # Pytest directory
│   ├── .env                  # Local environment variables
│   ├── alembic.ini           # Alembic configuration
│   ├── Dockerfile            # Backend container definition
│   └── pyproject.toml        # Python dependencies and build system
│
└── frontend/                 # React SPA
    ├── src/                  # Source Code
    │   ├── assets/           # Static files (images, icons)
    │   ├── components/       # Reusable UI components
    │   ├── constants/        # Application-wide constants
    │   ├── contexts/         # React context providers (AuthContext)
    │   ├── hooks/            # Custom React hooks (useAsync)
    │   ├── layouts/          # Page wrappers (AppLayout)
    │   ├── pages/            # Top-level route components
    │   ├── routes/           # Routing configuration
    │   ├── services/         # Axios API clients
    │   ├── store/            # Global state management
    │   ├── styles/           # Global CSS and Tailwind directives
    │   ├── types/            # TypeScript interface definitions
    │   ├── utils/            # Helper functions
    │   ├── App.tsx           # Router provider
    │   └── main.tsx          # React DOM entry point
    ├── index.html            # Base HTML template
    ├── package.json          # Node dependencies and scripts
    ├── tailwind.config.ts    # Tailwind CSS configuration
    ├── tsconfig.json         # TypeScript configuration
    └── vite.config.ts        # Vite build configuration
```
