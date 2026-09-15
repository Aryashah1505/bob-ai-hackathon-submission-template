# ⚡ PRAVAHA — Power Grid Outage Prediction & Machine Health Advisory

> Intelligent AI-powered failure prediction, Dissolved Gas Analysis (DGA) machine learning, and weather-induced outage mitigation for electrical utility grids.

---

## 👥 Team

| Field | Value |
|---|---|
| **Team Name** | VoltVision |
| **Track** | AI |
| **Team Lead** | Arya Shah — aryashah1505@gmail.com |
| **Members** | Arya Shah (aryashah1505@gmail.com) |

---

## 🎯 Problem Statement

Modern electrical distribution grids suffer from catastrophic unpredicted transformer failures and storm-induced outages, causing millions in industrial downtime and grid instability. Utility dispatchers lack unified real-time telemetry analytics and physics-informed ML risk scoring to proactively prevent critical asset breakdowns before blackouts occur.

---

## 💡 Solution

PRAVAHA is an AI-powered intelligent power-grid monitoring and failure-prediction platform. It combines trained Gradient Boosting and Random Forest Dissolved Gas Analysis (DGA) ML ensembles with multi-output regional outage risk classifiers, automated maintenance dispatch planning, and real-time SCADA telemetry visualization.

---

## ✨ Key Features

- **Trained DGA ML Ensemble:** Gradient Boosting & Random Forest models predicting transformer Health Index (R² = 0.968) and Remaining Useful Life in years.
- **Multi-Output Outage Risk Predictor:** Random Forest classifier predicting specific fault types (Line Breakage, Transformer Failure, Overheating) and downtime hours.
- **Individual Asset Reliability Scoring:** Unique, isolated IEEE/CIGRE risk calculations for every machine on the grid.
- **Explainable Degradation Factors:** Factor attribution (e.g. +25% Critical Thermal Stress, +15% Partial Discharge) for transparent operator decisions.
- **Automated Preventative Maintenance & Crew Dispatch:** Direct translation of diagnostic risks into field crew work orders.

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Languages** | Python 3.11+, JavaScript (ES6+), SQL |
| **Frameworks** | FastAPI, React 18, Vite, Scikit-Learn |
| **IBM Technologies** | IBM Bob, watsonx.ai Architecture |
| **Databases** | PostgreSQL, Supabase |
| **Other** | Pandas, NumPy, Joblib, TailwindCSS Tokens, Docker |

---

## 📁 Repository Structure

```
├── src/                  # All source code (backend + frontend)
│   ├── backend/          # FastAPI server, ML models (.joblib), services
│   ├── frontend/         # React 18 dashboard, components, pages
│   ├── infra/            # Database schema and Docker setup
│   └── README.md         # Source code organization details
├── docs/                 # Detailed documentation
│   ├── problem-statement.md
│   ├── solution-overview.md
│   ├── architecture.md
│   └── setup-guide.md
├── demo/                 # Demo artifacts
│   ├── screenshots/      # App screenshots
│   ├── demo-video-link.txt  # Link to demo video
│   └── live-demo-url.txt    # Live URL or local instructions
├── presentation/         # Slide deck
└── submission.yaml       # Structured submission metadata
```

---

## ⚡ How to Run

> Copy of steps from [`docs/setup-guide.md`](docs/setup-guide.md):

```bash
# 1. Clone the repository
git clone https://github.com/Aryashah1505/bob-ai-hackathon-submission-template.git
cd bob-ai-hackathon-submission-template

# 2. Setup & start Backend
cd src/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# 3. Setup & start Frontend (in another terminal)
cd src/frontend
npm install
npm run dev
```

---

## 🖥️ Demo

| Artifact | Link |
|---|---|
| 📹 Demo Video | [See demo/demo-video-link.txt](demo/demo-video-link.txt) |
| 🌐 Live Demo | [See demo/live-demo-url.txt](demo/live-demo-url.txt) |
| 🖼️ Screenshots | [See demo/screenshots/](demo/screenshots/) |
| 📊 Presentation | [See presentation/](presentation/) |

---

## ⚠️ Known Limitations

- Real-time sensor streaming is currently driven by realistic utility simulation cycles at configurable intervals; full hardware DNP3 / Modbus protocol bridge is planned for physical utility pilot testing.

---

## 🏅 What We're Most Proud Of

The end-to-end integration of trained Dissolved Gas Analysis (DGA) physicochemical machine learning models with real-time transformer telemetry and multi-machine asset isolation, giving power grid operators explainable risk attribution and automated crew dispatch recommendations.

---
