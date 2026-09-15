# ⚡ PRAVAHA — Power Grid Outage Prediction & Machine Health Advisory

> Intelligent AI-powered failure prediction, Dissolved Gas Analysis (DGA) machine learning, and weather-induced outage mitigation for electrical utility grids.

---

## 👥 Team

| Field | Value |
|---|---|
| **Team Name** | VoltVision |
| **Track** | AI |
| **Team Lead** | Arya Shah — 25ce107@charusat.edu.in |
| **Members** | Arya Shah (25ce107@charusat.edu.in), Shakshi Chaudhary (25ce014@charusat.edu.in), Bhavishya Ladani (25ce050@charusat.edu.in), Tanvi Patel (25ce092@charusat.edu.in) |

---

## 🎯 Problem Statement

Modern electrical distribution grids suffer from catastrophic unpredicted transformer failures and storm-induced outages, causing millions in industrial downtime and grid instability. Utility dispatchers lack unified real-time telemetry analytics and physics-informed ML risk scoring to proactively prevent critical asset breakdowns before blackouts occur.

---

## 💡 Solution

PRAVAHA combines machine data, weather data, and past failure data to detect risky transformers and substations early. It gives each asset its own risk score and then suggests alerts, maintenance, and crew planning before a failure becomes an outage.

### Architecture Overview

```text
Machine Data
     +
Weather Data
     +
Failure History
     ↓
  PRAVAHA
     ↓
Risk Analysis
     ↓
Asset-wise Risk Score
     ↓
┌────────┬──────────────┬─────────────┐
↓        ↓              ↓
Alert    Maintenance    Crew Planning
└────────┴──────────────┴─────────────┘
                ↓
         Preventive Action
```

---

## ✨ Key Features

- **Company & Region Setup:** Multi-tenant organization scoping and regional grid sector mapping.
- **Substation & Transformer Management:** Complete hierarchical asset registry and machine configuration.
- **Sensor Data Entry & Telemetry Stream:** Ingestion of core temperatures, load levels, vibration, and partial discharge.
- **Weather Data Monitoring:** Real-time tracking of wind speeds, storm conditions, rainfall, and thermal heatwaves.
- **Historical Failure Records:** Outage intelligence tracking past breakdown counts, root causes, and trip history.
- **Asset-wise Risk Prediction:** Individualized reliability calculations so every machine exhibits its own genuine score.
- **ML + Threshold-based Analysis:** Hybrid Gradient Boosting / Random Forest models combined with IEEE/CIGRE standards.
- **Failure Alerts & Notifications:** Real-time classification of critical vs. moderate warnings with operational actions.
- **Maintenance Recommendations:** Prescribed engineering work-orders based on physical degradation factors.
- **Crew Pre-positioning:** Weather-aware field crew staging and emergency logistics checklists.
- **Grid Monitoring Dashboard:** Modern high-contrast glassmorphic operational console.
- **Supabase Database Integration:** PostgreSQL database with secure multi-tenant isolation.

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Languages** | Python 3.11+, JavaScript (ES6+), SQL |
| **Frameworks** | FastAPI, React 18, Vite, Scikit-Learn |
| **IBM Technologies** | IBM Bob, watsonx.ai Architecture |
| **Databases** | PostgreSQL, Supabase Database Integration |
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

- **Prototype Data:** The system currently uses entered/stored asset, sensor, weather, and failure data rather than live grid sensors.
- **Real-World Validation:** The risk model has not yet been validated on large-scale real utility datasets.
- **IBM Integration:** IBM watsonx.ai is not currently integrated into the submitted prototype.
- **Production Readiness:** The application is a hackathon prototype and is not yet hardened for large-scale production deployment.
- **Prediction Accuracy:** Risk scores depend on the quality and completeness of the available asset data.

---

## 🏅 What We're Most Proud Of

We are most proud of **PRAVAHA's asset-wise risk intelligence**.
Instead of giving every machine the same risk value, PRAVAHA analyzes each transformer using its own available data and identifies:

```text
Machine Data
     ↓
Risk Analysis
     ↓
Asset-specific Risk Score
     ↓
Alert
     ↓
Maintenance Action
     ↓
Crew Planning
```

> **Different machine → Different data → Different risk → Different action**  
> This helps operators focus on the equipment that needs attention first.

---

