# Setup Guide

## Prerequisites

Before running PRAVAHA, ensure you have the following installed:

- Python 3.10 or higher
- Node.js 18 or higher (with npm)
- Git

## Environment Variables

Copy `.env.example` to `.env` in the repository root:

```bash
cp .env.example .env
```

| Variable | Description | Default | Required |
|---|---|---|---|
| `PORT` | Backend server port | `8000` | Yes |
| `SUPABASE_URL` | Supabase / PostgreSQL endpoint URL | `https://your-project.supabase.co` | No (Mock fallback supported) |
| `SUPABASE_KEY` | Supabase API key | `your-anon-key` | No (Mock fallback supported) |
| `VITE_API_URL` | Backend URL for frontend | `http://localhost:8000` | Yes |

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/Aryashah1505/bob-ai-hackathon-submission-template.git
cd bob-ai-hackathon-submission-template

# 2. Set up and activate Python virtual environment
cd src/backend
python3 -m venv .venv
source .venv/bin/activate

# 3. Install backend dependencies
pip install -r requirements.txt

# 4. Install frontend dependencies
cd ../frontend
npm install
```

## Running the Application

### 1. Start the Backend API Server
```bash
cd src/backend
source .venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
The FastAPI backend will be live at: `http://localhost:8000` (API Docs at `http://localhost:8000/docs`)

### 2. Start the Frontend Development Server
```bash
cd src/frontend
npm run dev
```
The React frontend dashboard will open at: `http://localhost:5173`

## Running Tests & Verifications

```bash
# Verify backend ML model inference
cd src/backend
python3 -c "from services.ml_prediction_engine import get_models; print('ML Models Loaded:', get_models() is not None)"

# Test frontend production build
cd ../frontend
npm run build
```

## Troubleshooting

| Issue | Solution |
|---|---|
| `ModuleNotFoundError: No module named 'sklearn'` | Ensure virtualenv is active and run `pip install -r requirements.txt` |
| `Port 8000 already in use` | Kill previous process: `lsof -ti:8000 | xargs kill -9` or change `PORT=8001` |
| `Frontend fails to connect to backend` | Verify backend is running on `http://localhost:8000` and check `VITE_API_URL` |
