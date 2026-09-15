"""
Pravaha Machine Learning Engine
Loads trained Scikit-Learn / GradientBoosting / RandomForest models
and provides high-performance inference for equipment health and grid outages.
"""

import os
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, Optional

MODELS_DIR = os.path.join(os.path.dirname(__file__), "ml_models")

_health_model = None
_life_model = None
_fault_model = None
_comp_model = None
_dt_model = None
_metadata = None

def get_models():
    global _health_model, _life_model, _fault_model, _comp_model, _dt_model, _metadata
    if _health_model is None:
        try:
            _health_model = joblib.load(os.path.join(MODELS_DIR, "transformer_health_model.joblib"))
            _life_model = joblib.load(os.path.join(MODELS_DIR, "transformer_life_model.joblib"))
            _fault_model = joblib.load(os.path.join(MODELS_DIR, "grid_fault_type_model.joblib"))
            _comp_model = joblib.load(os.path.join(MODELS_DIR, "grid_component_health_model.joblib"))
            _dt_model = joblib.load(os.path.join(MODELS_DIR, "grid_downtime_model.joblib"))
            _metadata = joblib.load(os.path.join(MODELS_DIR, "model_metadata.joblib"))
        except Exception as e:
            print(f"[ML Engine] Warning: Could not load ML models: {e}")
    return _health_model, _life_model, _fault_model, _comp_model, _dt_model, _metadata

def predict_equipment_ml(telemetry: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Inference with DGA Transformer ML models.
    Maps telemetry to DGA feature representation:
    [Hydrogen, Oxigen, Nitrogen, Methane, CO, CO2, Ethylene, Ethane, Acethylene, DBDS, Power factor, Interfacial V, Dielectric rigidity, Water content]
    """
    health_m, life_m, _, _, _, _ = get_models()
    if not health_m or not life_m:
        return None

    # Derive DGA features from direct DGA fields or synthesize from physical telemetry
    temp = float(telemetry.get("temperature_c") or telemetry.get("temperature") or 65.0)
    load = float(telemetry.get("load_percentage") or 70.0)
    age = float(telemetry.get("age_years") or 10.0)
    pd_val = float(telemetry.get("partial_discharge") or 12.0)
    oil_q = float(telemetry.get("oil_quality") or 82.0)

    # If explicit DGA concentrations are given, use them; otherwise estimate with engineering correlation
    hydrogen = float(telemetry.get("hydrogen") or telemetry.get("Hydrogen") or (100 + pd_val * 40 + (temp - 50) * 15))
    oxygen = float(telemetry.get("oxigen") or telemetry.get("Oxigen") or 4500)
    nitrogen = float(telemetry.get("nitrogen") or telemetry.get("Nitrogen") or 25000)
    methane = float(telemetry.get("methane") or telemetry.get("Methane") or (15 + max(0, temp - 60) * 1.8))
    co = float(telemetry.get("co") or telemetry.get("CO") or (250 + age * 12 + max(0, load - 75) * 4))
    co2 = float(telemetry.get("co2") or telemetry.get("CO2") or (2000 + age * 80 + max(0, load - 75) * 20))
    ethylene = float(telemetry.get("ethylene") or telemetry.get("Ethylene") or (5 + max(0, temp - 70) * 1.5))
    ethane = float(telemetry.get("ethane") or telemetry.get("Ethane") or (4 + max(0, temp - 65) * 0.8))
    acetylene = float(telemetry.get("acethylene") or telemetry.get("Acethylene") or (0.2 + (pd_val / 30.0) * 1.2))
    dbds = float(telemetry.get("dbds") or telemetry.get("DBDS") or 0.0)
    power_factor = float(telemetry.get("power_factor") or telemetry.get("Power factor") or (0.3 + (100 - oil_q) * 0.03))
    interfacial_v = float(telemetry.get("interfacial_v") or telemetry.get("Interfacial V") or (oil_q * 0.45))
    dielectric_rigidity = float(telemetry.get("dielectric_rigidity") or telemetry.get("Dielectric rigidity") or (oil_q * 0.65))
    water_content = float(telemetry.get("water_content") or telemetry.get("Water content") or (max(5, (100 - oil_q) * 0.4)))

    features_df = pd.DataFrame([{
        'Hydrogen': hydrogen,
        'Oxigen': oxygen,
        'Nitrogen': nitrogen,
        'Methane': methane,
        'CO': co,
        'CO2': co2,
        'Ethylene': ethylene,
        'Ethane': ethane,
        'Acethylene': acetylene,
        'DBDS': dbds,
        'Power factor': power_factor,
        'Interfacial V': interfacial_v,
        'Dielectric rigidity': dielectric_rigidity,
        'Water content': water_content
    }])

    predicted_health_index = float(health_m.predict(features_df)[0])
    predicted_health_index = max(1.0, min(100.0, round(predicted_health_index, 1)))

    predicted_life_exp = float(life_m.predict(features_df)[0])
    predicted_life_exp = max(0.5, min(40.0, round(predicted_life_exp, 1)))

    # Compute ML failure risk from health index
    ml_failure_risk = round(max(1.0, min(99.0, 100.0 - (predicted_health_index * 0.98))), 1)

    return {
        "ml_model_used": "GradientBoosting & RandomForest DGA Ensemble",
        "predicted_health_index": predicted_health_index,
        "predicted_life_expectancy_years": predicted_life_exp,
        "ml_failure_risk": ml_failure_risk,
        "dga_profile": {
            "hydrogen_ppm": round(hydrogen, 1),
            "methane_ppm": round(methane, 1),
            "co_ppm": round(co, 1),
            "co2_ppm": round(co2, 1),
            "ethylene_ppm": round(ethylene, 1),
            "dielectric_rigidity_kv": round(dielectric_rigidity, 1),
            "water_content_ppm": round(water_content, 1)
        }
    }

def predict_grid_outage_ml(data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Inference with Grid Fault & Outage ML models.
    Inputs: Voltage (V), Current (A), Power Load (MW), Temperature (°C), Wind Speed (km/h), Weather Condition, Maintenance Status
    Outputs: Fault Type classification, Component Health classification, Expected Downtime (hrs)
    """
    _, _, fault_m, comp_m, dt_m, meta = get_models()
    if not fault_m or not comp_m or not dt_m:
        return None

    # Standardize values
    voltage_v = float(data.get("voltage_v") or 220000.0)
    current_a = float(data.get("current_a") or 850.0)
    load_factor = float(data.get("grid_load_factor") or 0.85)
    power_load_mw = float(data.get("power_load_mw") or (load_factor * 200.0))
    temp_c = float(data.get("temperature_c") or 32.0)

    wind_mph = float(data.get("wind_speed_mph") or 15.0)
    wind_kmh = float(data.get("wind_speed_kmh") or (wind_mph * 1.60934))

    weather_raw = str(data.get("weather_condition") or "Clear")
    maintenance_status = str(data.get("maintenance_status") or "Operational")

    features_df = pd.DataFrame([{
        'Voltage (V)': voltage_v,
        'Current (A)': current_a,
        'Power Load (MW)': power_load_mw,
        'Temperature (°C)': temp_c,
        'Wind Speed (km/h)': wind_kmh,
        'Weather Condition': weather_raw,
        'Maintenance Status': maintenance_status
    }])

    pred_fault_type = str(fault_m.predict(features_df)[0])
    fault_classes = list(fault_m.classes_)
    fault_probs = fault_m.predict_proba(features_df)[0]
    fault_prob_dict = {cls: round(float(prob), 3) for cls, prob in zip(fault_classes, fault_probs)}

    pred_comp_health = str(comp_m.predict(features_df)[0])
    pred_downtime_hrs = float(dt_m.predict(features_df)[0])
    pred_downtime_hrs = max(0.5, round(pred_downtime_hrs, 1))

    return {
        "ml_model_used": "Multi-Output Random Forest & Gradient Boosting Grid Outage Pipeline",
        "predicted_fault_type": pred_fault_type,
        "fault_type_probabilities": fault_prob_dict,
        "predicted_component_health": pred_comp_health,
        "predicted_downtime_hours": pred_downtime_hrs
    }
