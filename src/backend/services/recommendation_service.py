"""
Pravaha Recommendation Service
Generates maintenance actions and advisory guidelines based on failure risk scores,
operating anomalies, and risk factor explanations.
"""

from typing import List, Dict, Any

def generate_equipment_recommendations(
    equipment_type: str,
    failure_risk: float,
    factors: List[str]
) -> Dict[str, Any]:
    """
    Produce actionable maintenance directives according to component type & risk breakdown.
    """
    eq_type = (equipment_type or "Equipment").lower()
    recommendations = []
    urgency = "Routine"

    if failure_risk >= 70.0:
        urgency = "Immediate / Emergency"
        if "transformer" in eq_type:
            recommendations.append("Initiate emergency oil dielectric breakdown & dissolved gas analysis (DGA).")
            recommendations.append("Transfer peak load to auxiliary substation circuits immediately.")
        elif "breaker" in eq_type:
            recommendations.append("Perform urgent trip coil and SF6 gas pressure test.")
            recommendations.append("Inspect vacuum interrupter contacts for contact erosion.")
        elif "line" in eq_type or "feeder" in eq_type:
            recommendations.append("Deploy thermal drone inspection team to locate hot spots on conductors.")
            recommendations.append("Initiate emergency vegetation clearance on critical spans.")
        else:
            recommendations.append("Dispatch emergency maintenance crew for immediate physical diagnostic.")
            recommendations.append("Isolate unit if operating temperature exceeds thermal threshold.")

    elif failure_risk >= 35.0:
        urgency = "Priority (Next 7-14 Days)"
        if "transformer" in eq_type:
            recommendations.append("Schedule infrared thermography and inspect winding temperature indicators.")
            recommendations.append("Check silica gel breather condition and oil level gauge.")
        elif "breaker" in eq_type:
            recommendations.append("Schedule contact timing test and lubricate mechanical linkage.")
        elif "line" in eq_type or "feeder" in eq_type:
            recommendations.append("Schedule routine patrol of insulator strings and ground clearance.")
        else:
            recommendations.append("Perform standard diagnostic test during next scheduled maintenance window.")

    else:
        urgency = "Routine Monitoring"
        recommendations.append("Continue standard telemetry data polling and telemetry logging.")
        recommendations.append("Follow standard annual preventative maintenance cycle.")

    # Tailor based on specific driving factors
    factor_actions = []
    for factor in factors:
        f_lower = factor.lower()
        if "temperature" in f_lower or "thermal" in f_lower:
            factor_actions.append("Inspect active cooling fans, radiators, or ventilation subsystems.")
        if "load" in f_lower or "overload" in f_lower:
            factor_actions.append("Review regional load balancing to prevent prolonged peak overload.")
        if "maintenance" in f_lower:
            factor_actions.append("Overdue maintenance milestone: Schedule full comprehensive overhaul.")

    # Combine unique recommendations
    all_recs = recommendations + [fa for fa in factor_actions if fa not in recommendations]

    return {
        "urgency": urgency,
        "primary_action": all_recs[0] if all_recs else "Continue routine monitoring",
        "action_items": all_recs
    }

def generate_outage_recommendations(
    risk_level: str,
    probability: float,
    weather_condition: str,
    factors: List[str]
) -> Dict[str, Any]:
    """
    Produce regional grid operational directives for outage prevention and mitigation.
    """
    actions = []
    preparedness = "Standard"

    if risk_level == "High":
        preparedness = "Level 1 Grid Alert (High Readiness)"
        actions.append("Pre-stage mobile emergency diesel generators and repair crews at regional depots.")
        actions.append("Enable automatic feeder reconfiguration and inter-tie load shedding protocols.")
        if "wind" in weather_condition.lower() or "storm" in weather_condition.lower():
            actions.append("Place rapid-response vegetation & tree clearing crews on high standby.")
    elif risk_level == "Medium":
        preparedness = "Level 2 Grid Advisory"
        actions.append("Increase supervisory SCADA polling rates across regional feeder lines.")
        actions.append("Notify distribution field teams to prepare for localized switching operations.")
    else:
        preparedness = "Nominal Grid State"
        actions.append("Maintain baseline automated dispatch and economic load dispatch.")

    return {
        "preparedness_level": preparedness,
        "primary_action": actions[0] if actions else "Maintain nominal grid state",
        "action_items": actions
    }
