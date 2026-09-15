# Solution Overview

## What We Built
**PRAVAHA** is an AI-powered intelligent power-grid monitoring and failure-prediction platform. It combines trained Machine Learning ensembles (Gradient Boosting & Random Forest) with IEEE/CIGRE physics-calibrated engineering rules to deliver real-time risk scores, remaining useful life predictions, weather-induced outage forecasting, and automated crew dispatch recommendations.

## How It Works

1. **Multi-Source Telemetry Ingestion:** Continuous ingestion of sensor readings (temperatures, load percentage, vibration, partial discharge, dielectric oil quality, voltage fluctuations) and regional meteorological data.
2. **DGA Physicochemical ML Inference:** Trained Gradient Boosting & Random Forest models evaluate Dissolved Gas Analysis profiles ($H_2$, $CH_4$, $CO$, $CO_2$, $C_2H_4$, Dielectric Rigidity) to predict equipment health index and remaining useful life (years).
3. **Regional Outage & Downtime Forecasting:** Multi-output classification models correlate wind gusts, storm intensity, grid load ratio, and upstream alert counts to predict specific fault types and expected repair downtime in hours.
4. **Explainable Risk Attribution:** Every score provides granular contributing factor breakdowns (e.g. "+25% Critical Thermal Stress", "+15% High Partial Discharge").
5. **Automated Advisory & Dispatch:** Instant generation of preventative maintenance directives and optimized field crew work-order planning.

## Architecture Flow

```
[IoT Sensors / SCADA] ──► [FastAPI Backend] ──► [DGA ML Ensembles / Outage Models]
                                 │
                                 ▼
                     [PostgreSQL Database] ──► [React 18 Glassmorphic Dashboard]
```

## Key Design Decisions

| Decision | Rationale |
|---|---|
| Hybrid ML + IEEE/CIGRE Calibrations | Combines data-driven pattern recognition from DGA datasets with deterministic engineering safety limits. |
| Per-Machine Isolated Calculations | Eliminates shared global metrics so every individual transformer displays its true independent health rate. |
| Multi-Output Outage Classification | Simultaneously predicts outage probability, fault type (Line Breakage / Transformer Failure / Overheating), and downtime hours. |
| Reactive Glassmorphic UI | High-contrast visual telemetry built for utility control room operators. |

## IBM Technologies Used

- **IBM Bob:** Utilized as the primary AI developer assistant for rapid model training, pipeline refactoring, and automated validation.
- **watsonx.ai Architecture Patterns:** Foundation for telemetry reasoning, root-cause explanation synthesis, and preventative maintenance action formulation.
