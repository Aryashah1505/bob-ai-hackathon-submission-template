# Solution Overview

## What We Built
**PRAVAHA** combines machine data, weather data, and past failure data to detect risky transformers and substations early. It gives each asset its own risk score and then suggests alerts, maintenance, and crew planning before a failure becomes an outage.

## Architecture Flow

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

## Core Modules & Features

1. **Company & Region Setup:** Multi-tenant organization scoping, region management, and territory isolation.
2. **Substation & Transformer Management:** Hierarchical tree of electrical assets, tag IDs, and equipment lifecycle tracking.
3. **Sensor Data Entry:** Ingestion of continuous telemetry including core temperatures, load levels, vibration, and partial discharge.
4. **Weather Data Monitoring:** Regional meteorological hazard tracking (wind gusts, rainfall, thunderstorms, and heatwaves).
5. **Historical Failure Records:** Detailed incident logging (root causes, trip duration, customers affected).
6. **Asset-wise Risk Prediction:** Individualized reliability calculations ensuring every transformer exhibits its own true rate.
7. **ML + Threshold-based Analysis:** Trained Gradient Boosting & Random Forest DGA ensembles calibrated with IEEE/CIGRE standards.
8. **Failure Alerts & Notifications:** Real-time priority classification into Critical vs. Warning states.
9. **Maintenance Recommendations:** Prescribed preventative engineering work-orders targeting identified stress factors.
10. **Crew Pre-positioning:** Automated standby field crew staging and storm readiness checklists.
11. **Grid Monitoring Dashboard:** Real-time glassmorphic control room overview with high-contrast telemetry charts.
12. **Supabase Database Integration:** PostgreSQL database with secure row-level security and persistent storage.

## Key Design Decisions

| Decision | Rationale |
|---|---|
| Isolated Asset Health Scoring | Prevents shared global variables; each machine calculates its reliability from its own sensor and incident records. |
| Multi-Modal Risk Integration | Integrates machine telemetry, weather hazards, and incident history into a unified risk metric. |
| Deterministic Advisory Generation | Provides concrete, actionable engineering steps instead of opaque risk numbers. |
| Cloud Database Integration | Supabase PostgreSQL backend ensures real-time synchronization and data persistence. |
