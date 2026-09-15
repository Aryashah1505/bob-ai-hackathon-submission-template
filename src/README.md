# PRAVAHA Source Code Directory

This directory contains the full application source code for **PRAVAHA — Power Grid Outage Prediction & Machine Health Advisory**.

## Directory Layout

```
src/
├── backend/                  # FastAPI Application & AI/ML Inference Services
│   ├── main.py               # REST API endpoints & CORS middleware
│   ├── models.py             # Pydantic schemas & data models
│   ├── database.py           # Supabase / PostgreSQL database engine
│   ├── auth.py               # Authentication & session verification
│   ├── requirements.txt      # Python dependencies (scikit-learn, fastapi, pandas, etc.)
│   └── services/             # Core ML and Business Logic
│       ├── ml_prediction_engine.py  # Model loader & DGA/Outage inference
│       ├── ml_models/               # Serialized .joblib trained models
│       ├── prediction_service.py    # Hybrid ML + IEEE engineering calculators
│       ├── feature_processing.py    # Telemetry normalization & feature vectors
│       ├── recommendation_service.py # Preventative maintenance advisory
│       └── company_search.py        # Industry isolation & search
│
├── frontend/                 # React 18 + Vite Web Application
│   ├── src/
│   │   ├── App.jsx           # Main router & application shell
│   │   ├── api/              # API clients (FastAPI + Supabase)
│   │   ├── components/       # UI Components (Sidebar, TopBar, RiskBadge, SummaryCard)
│   │   ├── context/          # Multi-tenant Auth Context
│   │   ├── pages/            # Views (Dashboard, Prediction, Assets, Alerts, Maintenance, Crew)
│   │   └── styles/           # Modern Glassmorphic Cyber-Grid Design System
│   ├── package.json          # Node dependencies
│   └── vite.config.js        # Vite build configuration
│
└── infra/                    # Deployment & Database Migrations
    ├── docker-compose.yml    # Multi-container orchestration
    └── schema.sql            # PostgreSQL schema & historical incident tables
```
