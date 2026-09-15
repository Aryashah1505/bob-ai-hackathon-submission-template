"""
Pravaha Feature Processing Module
Extracts, normalizes, and validates input features for Equipment Failure Risk
and Regional Power Outage Prediction.
"""

from typing import Dict, Any, Tuple

# Severe weather factors mapping
WEATHER_SEVERITY_FACTORS: Dict[str, float] = {
    "clear": 0.0,
    "sunny": 0.0,
    "cloudy": 0.05,
    "overcast": 0.05,
    "light rain": 0.20,
    "moderate rain": 0.35,
    "heavy rain": 0.60,
    "thunderstorm": 0.75,
    "severe thunderstorm": 0.90,
    "high winds": 0.70,
    "storm": 0.80,
    "snow / ice": 0.85,
    "heatwave": 0.65,
}

def get_weather_severity(weather_str: str) -> float:
    normalized = (weather_str or "").strip().lower()
    for key, val in WEATHER_SEVERITY_FACTORS.items():
        if key in normalized:
            return val
    return 0.25  # default moderate factor for unmapped weather conditions

def process_equipment_features(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Standardize equipment telemetry & history features:
    - age_years: 0 to 50
    - temperature_c: operating temperature in Celsius
    - load_percentage: 0 to 150%
    - voltage_kv: operating voltage vs nominal
    - current_a: operating current vs rated
    - previous_failures: count of past breakdown events
    - days_since_last_maintenance: integer days
    """
    age = float(data.get("age_years", 5.0))
    temperature = float(data.get("temperature_c", 45.0))
    load_pct = float(data.get("load_percentage", 65.0))
    voltage_dev_pct = abs(float(data.get("voltage_deviation_pct", 0.0)))
    previous_failures = int(data.get("previous_failures", 0))
    days_since_maint = int(data.get("days_since_last_maintenance", 90))

    return {
        "age_years": age,
        "temperature_c": temperature,
        "load_percentage": load_pct,
        "voltage_deviation_pct": voltage_dev_pct,
        "previous_failures": previous_failures,
        "days_since_last_maintenance": days_since_maint,
    }

def process_outage_features(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Standardize grid regional outage features:
    - weather_condition: string description
    - previous_outage_frequency_monthly: historical outages per month
    - grid_load_factor: current demand / capacity (0.0 to 1.5)
    - active_equipment_alerts: number of critical/warning equipment in region
    - wind_speed_mph: wind speed in mph
    """
    weather = str(data.get("weather_condition", "Clear"))
    weather_factor = get_weather_severity(weather)
    outage_freq = float(data.get("previous_outage_frequency_monthly", 1.0))
    grid_load_factor = float(data.get("grid_load_factor", 0.70))
    active_equipment_alerts = int(data.get("active_equipment_alerts", 0))
    wind_speed = float(data.get("wind_speed_mph", 10.0))

    return {
        "weather_condition": weather,
        "weather_factor": weather_factor,
        "previous_outage_frequency_monthly": outage_freq,
        "grid_load_factor": grid_load_factor,
        "active_equipment_alerts": active_equipment_alerts,
        "wind_speed_mph": wind_speed,
    }
