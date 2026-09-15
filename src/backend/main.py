from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import select, func, delete
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from database import engine, Base, get_db
import models
from services.company_search import search_company_info
from services.notification_service import send_threat_notification, get_notification_logs
from services.prediction_service import (
    predict_equipment_failure_risk,
    predict_outage_risk,
    calculate_asset_risk
)
from services.recommendation_service import (
    generate_equipment_recommendations,
    generate_outage_recommendations
)
from auth import (
    get_current_user,
    get_optional_current_user,
    require_company_access
)

app = FastAPI(
    title="Pravaha — Power Outage Prediction & Grid Equipment Failure Advisor API",
    description="Multi-Step Grid Infrastructure Setup, Verification, and Operational Threat Engine.",
    version="1.4.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Wizard & Setup Request Schemas -----------------

class CompanyPreviewRequest(BaseModel):
    company_name: str = Field(..., min_length=2)
    region: str = Field(..., min_length=2)

class SubstationSetupItem(BaseModel):
    name: str = Field(..., min_length=1)
    location: str = Field(..., min_length=1)

class AssetSetupItem(BaseModel):
    substation_temp_index: int = Field(0, description="Index of associated substation in array")
    name: str = Field(..., min_length=1)
    asset_type: str = Field("Transformer")
    capacity: Optional[str] = "50 MVA"
    installation_year: Optional[int] = 2015
    affected_customers: Optional[int] = 12000
    operating_condition: Optional[str] = "Good"
    previous_failure_count: Optional[int] = 0
    previous_maintenance_date: Optional[str] = None
    sensor_data_source: Optional[str] = "Simulated Live Data — demonstration only"
    temperature: Optional[float] = 65.0
    vibration: Optional[float] = 1.2
    partial_discharge: Optional[float] = 15.0
    oil_quality: Optional[float] = 90.0
    load_percentage: Optional[float] = 75.0

class WeatherSetupItem(BaseModel):
    source: Optional[str] = "Regional forecast"
    temperature: Optional[float] = 28.0
    rainfall: Optional[float] = 0.0
    wind_speed: Optional[float] = 15.0
    lightning_risk: Optional[float] = 0.1

class IncidentSetupItem(BaseModel):
    asset_temp_index: int = 0
    incident_type: str
    severity: str = "Medium"
    outage_duration: float = 1.5
    affected_customers: int = 1500
    incident_date: Optional[str] = None

class NotificationSettingsSetup(BaseModel):
    notification_mode: str = "Both"  # 'Dashboard Alert', 'SMS Notification', 'Both'
    phone_number: Optional[str] = None
    high_risk_threshold: float = 70.0

class CompanyOnboardingRequest(BaseModel):
    company_name: str
    region: str
    customer_count: int = 0
    description: Optional[str] = None
    website: Optional[str] = None
    substations: List[SubstationSetupItem] = []
    assets: List[AssetSetupItem] = []
    weather: Optional[WeatherSetupItem] = None
    incidents: List[IncidentSetupItem] = []
    notifications: Optional[NotificationSettingsSetup] = None

# Base Schemas
class IndustryResponse(BaseModel):
    id: int
    name: str
    region: str
    customer_count: int
    created_at: datetime

    class Config:
        from_attributes = True

class IndustryCreate(BaseModel):
    name: str
    region: str
    customer_count: int = 0

class ProfileSyncRequest(BaseModel):
    user_id: str
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    company_name: Optional[str] = None
    region: Optional[str] = None
    industry: Optional[str] = None

class CreateWorkspaceRequest(BaseModel):
    name: str
    region: str
    customer_count: Optional[int] = 0

# ----------------- Base Routes -----------------

@app.get("/")
async def root():
    return {
        "message": "Pravaha — Power Outage Prediction & Grid Equipment Advisor API is running",
        "engine": "Company-Scoped Grid Infrastructure Pipeline v1.4"
    }

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "Pravaha — Power Outage Prediction & Grid Equipment Advisor",
        "version": "1.4.0"
    }

# ----------------- Authentication & Workspace Sync -----------------

@app.post("/auth/sync-profile", tags=["Authentication"])
async def sync_user_profile(
    req: ProfileSyncRequest,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Creates or updates the user profile record in PostgreSQL.
    """
    uid = current_user["id"] if current_user else req.user_id
    res = await db.execute(select(models.Profile).where(models.Profile.id == uid))
    prof = res.scalar_one_or_none()
    if prof:
        if req.full_name:
            prof.full_name = req.full_name
        if req.phone_number:
            prof.phone_number = req.phone_number
    else:
        prof = models.Profile(
            id=uid,
            full_name=req.full_name,
            phone_number=req.phone_number,
            created_at=datetime.utcnow()
        )
        db.add(prof)
    await db.commit()
    return {"status": "success", "user_id": uid, "full_name": prof.full_name}

@app.get("/auth/workspaces", tags=["Authentication"])
async def list_user_workspaces(
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns companies the authenticated user belongs to along with their role.
    """
    if not current_user:
        # Fallback for unauthenticated dev view: return all companies as admin
        res_all = await db.execute(select(models.Industry).order_by(models.Industry.created_at.desc()))
        industries = res_all.scalars().all()
        return [
            {
                "id": ind.id,
                "name": ind.name,
                "region": ind.region,
                "customer_count": ind.customer_count,
                "role": "admin",
                "created_at": ind.created_at
            }
            for ind in industries
        ]

    uid = current_user["id"]
    # Query memberships joined with industries
    res = await db.execute(
        select(models.Industry, models.OrganizationMember.role)
        .join(models.OrganizationMember, models.OrganizationMember.company_id == models.Industry.id)
        .where(models.OrganizationMember.user_id == uid)
        .order_by(models.Industry.created_at.desc())
    )
    rows = res.all()
    workspaces = []
    seen_ids = set()

    for ind, role in rows:
        seen_ids.add(ind.id)
        workspaces.append({
            "id": ind.id,
            "name": ind.name,
            "region": ind.region,
            "customer_count": ind.customer_count,
            "role": role,
            "created_at": ind.created_at
        })

    # Also check if user created companies where membership row might be missing
    res_created = await db.execute(
        select(models.Industry)
        .where(models.Industry.created_by == uid)
    )
    for ind in res_created.scalars().all():
        if ind.id not in seen_ids:
            workspaces.append({
                "id": ind.id,
                "name": ind.name,
                "region": ind.region,
                "customer_count": ind.customer_count,
                "role": "admin",
                "created_at": ind.created_at
            })

    return workspaces

@app.post("/auth/create-workspace", tags=["Authentication"])
async def create_user_workspace(
    req: CreateWorkspaceRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Directly provisions a new company workspace and assigns creator as admin.
    """
    uid = current_user["id"]
    new_ind = models.Industry(
        name=req.name.strip(),
        region=req.region.strip(),
        customer_count=req.customer_count or 0,
        created_by=uid,
        created_at=datetime.utcnow()
    )
    db.add(new_ind)
    await db.flush()

    member = models.OrganizationMember(
        company_id=new_ind.id,
        user_id=uid,
        role="admin",
        joined_at=datetime.utcnow()
    )
    db.add(member)
    await db.commit()
    await db.refresh(new_ind)

    return {
        "status": "success",
        "company_id": new_ind.id,
        "company_name": new_ind.name,
        "role": "admin"
    }

# ----------------- Company Lookup & Onboarding -----------------

@app.post("/company-lookup", tags=["Company Setup"])
@app.post("/setup/preview-company", tags=["Company Setup"])
async def preview_company_endpoint(req: CompanyPreviewRequest):
    """
    Searches Google API for publicly available company/utility information
    and returns unconfirmed information for user verification.
    """
    info = await search_company_info(req.company_name.strip(), req.region.strip())
    return info

async def _save_company_pipeline(req: CompanyOnboardingRequest, db: AsyncSession, creator_user_id: Optional[str] = None):
    # 1. Insert Industry / Company
    new_industry = models.Industry(
        name=req.company_name.strip(),
        region=req.region.strip(),
        customer_count=req.customer_count,
        created_by=creator_user_id,
        created_at=datetime.utcnow()
    )
    db.add(new_industry)
    await db.flush()
    company_id = new_industry.id

    # 1b. Assign Creator as Admin in organization_members
    if creator_user_id:
        admin_member = models.OrganizationMember(
            company_id=company_id,
            user_id=creator_user_id,
            role="admin",
            joined_at=datetime.utcnow()
        )
        db.add(admin_member)

    # 2. Insert Substations
    substation_id_map = {}
    for idx, sub_item in enumerate(req.substations):
        new_sub = models.Substation(
            industry_id=company_id,
            name=sub_item.name.strip(),
            location=sub_item.location.strip()
        )
        db.add(new_sub)
        await db.flush()
        substation_id_map[idx] = new_sub.id

    # 3. Insert Assets & Sensor Readings
    asset_id_map = {}
    for a_idx, a_item in enumerate(req.assets):
        sub_id = substation_id_map.get(a_item.substation_temp_index)
        if not sub_id and len(substation_id_map) > 0:
            sub_id = list(substation_id_map.values())[0]

        new_asset = models.Asset(
            substation_id=sub_id,
            name=a_item.name.strip(),
            asset_type=a_item.asset_type,
            capacity=a_item.capacity,
            installation_year=a_item.installation_year,
            affected_customers=a_item.affected_customers or 0
        )
        db.add(new_asset)
        await db.flush()
        asset_id = new_asset.id
        asset_id_map[a_idx] = asset_id

        # Insert Sensor Readings if provided
        if a_item.temperature is not None:
            new_sensor = models.SensorReading(
                asset_id=asset_id,
                temperature=a_item.temperature,
                vibration=a_item.vibration,
                partial_discharge=a_item.partial_discharge,
                oil_quality=a_item.oil_quality,
                load_percentage=a_item.load_percentage,
                recorded_at=datetime.utcnow()
            )
            db.add(new_sensor)

    # 4. Insert Weather Data
    if req.weather:
        new_weather = models.WeatherData(
            region=req.region.strip(),
            temperature=req.weather.temperature,
            rainfall=req.weather.rainfall,
            wind_speed=req.weather.wind_speed,
            lightning_risk=req.weather.lightning_risk,
            recorded_at=datetime.utcnow()
        )
        db.add(new_weather)

    # 5. Insert Incidents
    for inc_item in req.incidents:
        t_asset_id = asset_id_map.get(inc_item.asset_temp_index)
        if not t_asset_id and len(asset_id_map) > 0:
            t_asset_id = list(asset_id_map.values())[0]

        if t_asset_id:
            new_inc = models.Incident(
                asset_id=t_asset_id,
                incident_type=inc_item.incident_type,
                severity=inc_item.severity,
                outage_duration=inc_item.outage_duration,
                affected_customers=inc_item.affected_customers,
                incident_date=datetime.utcnow()
            )
            db.add(new_inc)

    # 6. Evaluate initial threats using 8-factor rule-based scoring
    threshold = req.notifications.high_risk_threshold if req.notifications else 70.0
    phone = req.notifications.phone_number if req.notifications else None
    mode = req.notifications.notification_mode if req.notifications else "Both"

    for a_idx, a_item in enumerate(req.assets):
        aid = asset_id_map.get(a_idx)
        if not aid:
            continue
        
        # Sensor payload for this asset
        sensor_dict = {
            "temperature": a_item.temperature,
            "vibration": a_item.vibration,
            "partial_discharge": a_item.partial_discharge,
            "oil_quality": a_item.oil_quality,
            "load_percentage": a_item.load_percentage
        }

        # Incidents linked to this asset index
        asset_incidents = [inc for inc in req.incidents if inc.asset_temp_index == a_idx]

        # Call centralized rule-based risk calculation
        risk_res = calculate_asset_risk(
            asset={
                "id": aid,
                "name": a_item.name,
                "asset_type": a_item.asset_type,
                "installation_year": a_item.installation_year
            },
            latest_sensor_reading=sensor_dict,
            incidents=asset_incidents,
            weather=req.weather
        )

        risk_score = risk_res["risk_score"]
        risk_level = risk_res["risk_level"]
        threat_text = risk_res["threat"]
        explanation_str = risk_res["reason"]
        action = risk_res["recommended_action"]

        new_threat = models.Threat(
            asset_id=aid,
            threat_type=threat_text,
            risk_level=risk_level,
            risk_score=float(risk_score),
            explanation=explanation_str,
            recommended_action=action,
            created_at=datetime.utcnow()
        )
        db.add(new_threat)

        if risk_score >= threshold:
            await send_threat_notification(
                company_name=req.company_name,
                asset_name=a_item.name,
                threat_type=threat_text,
                risk_level=risk_level,
                risk_score=float(risk_score),
                reason=explanation_str,
                recommended_action=action,
                target_phone=phone,
                notification_mode=mode
            )

    await db.commit()
    await db.refresh(new_industry)
    return company_id, new_industry.name

@app.post("/companies/onboarding", tags=["Company Setup"])
@app.post("/setup/save", tags=["Company Setup"])
async def onboarding_company_endpoint(
    req: CompanyOnboardingRequest,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Atomic transaction saving all data scoped to the new company without affecting other companies.
    """
    try:
        user_id = current_user.get("id") if current_user else None
        company_id, company_name = await _save_company_pipeline(req, db, creator_user_id=user_id)
        return {
            "status": "success",
            "company_id": company_id,
            "company_name": company_name,
            "industry_id": company_id,
            "industry_name": company_name,
            "role": "admin",
            "message": "Company data saved successfully"
        }
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to persist company onboarding data: {str(e)}"
        )

# ----------------- Company-Scoped Analysis & Processing -----------------

@app.post("/companies/{company_id}/analyze", tags=["Company Analysis"])
async def analyze_company_grid(
    company_id: int,
    auth_ctx: Dict[str, Any] = Depends(require_company_access(min_role="engineer")),
    db: AsyncSession = Depends(get_db)
):
    """
    Triggers fresh company-scoped risk score recalculation and updates threat records for the given company.
    """
    res_ind = await db.execute(select(models.Industry).where(models.Industry.id == company_id))
    industry = res_ind.scalar_one_or_none()
    if not industry:
        raise HTTPException(status_code=404, detail=f"Company with ID {company_id} not found.")

    # Fetch company assets
    res_sub = await db.execute(
        select(models.Substation)
        .where(models.Substation.industry_id == company_id)
        .options(
            selectinload(models.Substation.assets)
            .selectinload(models.Asset.sensor_readings),
            selectinload(models.Substation.assets)
            .selectinload(models.Asset.incidents),
            selectinload(models.Substation.assets)
            .selectinload(models.Asset.threats)
        )
    )
    # Fetch latest weather for this region
    res_weather = await db.execute(
        select(models.WeatherData)
        .where(models.WeatherData.region == industry.region)
        .order_by(models.WeatherData.recorded_at.desc())
    )
    weather_entry = res_weather.scalars().first()
    substations = res_sub.scalars().all()

    evaluated_assets = 0
    updated_threats = 0

    for sub in substations:
        for asset in (sub.assets or []):
            evaluated_assets += 1
            latest_sensor = asset.sensor_readings[-1] if asset.sensor_readings else None
            
            # Call centralized 8-factor rule-based risk calculation
            risk_res = calculate_asset_risk(
                asset=asset,
                latest_sensor_reading=latest_sensor,
                incidents=asset.incidents,
                weather=weather_entry
            )

            risk_score = risk_res["risk_score"]
            risk_level = risk_res["risk_level"]
            threat_text = risk_res["threat"]
            explanation_str = risk_res["reason"]
            action = risk_res["recommended_action"]

            # Upsert or replace threats for this asset
            if asset.threats:
                for t in asset.threats:
                    t.threat_type = threat_text
                    t.risk_level = risk_level
                    t.risk_score = float(risk_score)
                    t.explanation = explanation_str
                    t.recommended_action = action
                    updated_threats += 1
            else:
                new_threat = models.Threat(
                    asset_id=asset.id,
                    threat_type=threat_text,
                    risk_level=risk_level,
                    risk_score=float(risk_score),
                    explanation=explanation_str,
                    recommended_action=action,
                    created_at=datetime.utcnow()
                )
                db.add(new_threat)
                updated_threats += 1

    await db.commit()

    return {
        "status": "success",
        "company_id": company_id,
        "company_name": industry.name,
        "evaluated_assets": evaluated_assets,
        "updated_threats": updated_threats,
        "analyzed_at": datetime.utcnow().isoformat()
    }

# ----------------- Company-Scoped Query Endpoints -----------------

@app.get("/companies/{company_id}/dashboard", tags=["Company Scoped Data"])
@app.get("/industries/{company_id}/dashboard", tags=["Company Scoped Data"])
async def get_company_dashboard(
    company_id: int,
    auth_ctx: Dict[str, Any] = Depends(require_company_access(min_role="viewer")),
    db: AsyncSession = Depends(get_db)
):
    res_ind = await db.execute(select(models.Industry).where(models.Industry.id == company_id))
    industry = res_ind.scalar_one_or_none()
    if not industry:
        raise HTTPException(status_code=404, detail=f"Company with ID {company_id} not found.")

    res_sub = await db.execute(
        select(models.Substation)
        .where(models.Substation.industry_id == company_id)
        .options(
            selectinload(models.Substation.assets)
            .selectinload(models.Asset.threats),
            selectinload(models.Substation.assets)
            .selectinload(models.Asset.sensor_readings),
            selectinload(models.Substation.assets)
            .selectinload(models.Asset.incidents)
        )
    )
    substations = res_sub.scalars().all()
    substations_count = len(substations)

    # Weather data for region
    res_weather = await db.execute(
        select(models.WeatherData)
        .where(models.WeatherData.region == industry.region)
        .order_by(models.WeatherData.recorded_at.desc())
    )
    weather_entry = res_weather.scalars().first()

    assets_count = 0
    transformers_count = 0
    other_equipment_count = 0
    all_threats = []
    critical_threats = 0
    medium_threats = 0
    all_assets_list = []
    all_incidents = []

    substations_payload = []
    for sub in substations:
        sub_assets = sub.assets or []
        assets_count += len(sub_assets)
        for asset in sub_assets:
            if asset.asset_type.lower() == "transformer":
                transformers_count += 1
            else:
                other_equipment_count += 1

            latest_sensor = asset.sensor_readings[-1] if asset.sensor_readings else None
            
            # Deterministic, unique rule-based calculation per asset using its actual data
            calc_res = calculate_asset_risk(
                asset=asset,
                latest_sensor_reading=latest_sensor,
                incidents=asset.incidents,
                weather=weather_entry
            )
            
            calculated_risk = calc_res["risk_score"]
            calculated_health = calc_res["health_score"]
            calculated_level = calc_res["risk_level"]
            calculated_action = calc_res["recommended_action"]
            calculated_reason = calc_res["reason"]
            calculated_threat = calc_res["threat"]

            all_assets_list.append({
                "id": asset.id,
                "name": asset.name,
                "equipment_id": f"EQ-{asset.id}",
                "substation_id": sub.id,
                "substation_name": sub.name,
                "location": sub.location,
                "asset_type": asset.asset_type,
                "capacity": asset.capacity,
                "installation_year": asset.installation_year,
                "affected_customers": asset.affected_customers,
                "health_score": calculated_health,
                "failure_risk": calculated_risk,
                "risk_level": calculated_level,
                "recommended_action": calculated_action,
                "explanation": calculated_reason,
                "sensor_readings": {
                    "temperature": latest_sensor.temperature if latest_sensor else 65.0,
                    "vibration": latest_sensor.vibration if latest_sensor else 1.2,
                    "partial_discharge": latest_sensor.partial_discharge if latest_sensor else 10.0,
                    "oil_quality": latest_sensor.oil_quality if latest_sensor else 90.0,
                    "load_percentage": latest_sensor.load_percentage if latest_sensor else 70.0,
                    "source": "Simulated Live Data — demonstration only"
                }
            })

            # Historical Incidents collection
            for inc in (asset.incidents or []):
                all_incidents.append({
                    "id": inc.id,
                    "asset_id": inc.asset_id,
                    "asset_name": asset.name,
                    "substation_name": sub.name,
                    "incident_type": inc.incident_type,
                    "failure_type": inc.incident_type,
                    "severity": inc.severity,
                    "outage_duration": inc.outage_duration,
                    "affected_customers": inc.affected_customers,
                    "incident_date": inc.incident_date.isoformat() if inc.incident_date else datetime.utcnow().isoformat(),
                    "status": "Logged Historical Failure"
                })

            # Threat listing
            if asset.threats:
                for threat in asset.threats:
                    all_threats.append({
                        "id": threat.id,
                        "asset_id": threat.asset_id,
                        "asset_name": asset.name,
                        "substation_name": sub.name,
                        "asset_type": asset.asset_type,
                        "threat_type": threat.threat_type,
                        "risk_level": threat.risk_level,
                        "risk_score": threat.risk_score,
                        "explanation": threat.explanation,
                        "recommended_action": threat.recommended_action,
                        "created_at": threat.created_at
                    })
                    if threat.risk_level.upper() in ["HIGH", "CRITICAL"] or threat.risk_score >= 70:
                        critical_threats += 1
                    elif threat.risk_level.upper() in ["MEDIUM", "WARNING"] or threat.risk_score >= 35:
                        medium_threats += 1
            else:
                # Dynamic threat entry from calculation
                all_threats.append({
                    "id": f"calc-{asset.id}",
                    "asset_id": asset.id,
                    "asset_name": asset.name,
                    "substation_name": sub.name,
                    "asset_type": asset.asset_type,
                    "threat_type": calculated_threat,
                    "risk_level": calculated_level,
                    "risk_score": calculated_risk,
                    "explanation": calculated_reason,
                    "recommended_action": calculated_action,
                    "created_at": datetime.utcnow()
                })
                if calculated_level.upper() in ["HIGH", "CRITICAL"] or calculated_risk >= 70:
                    critical_threats += 1
                elif calculated_level.upper() in ["MEDIUM", "WARNING"] or calculated_risk >= 35:
                    medium_threats += 1

        substations_payload.append({
            "id": sub.id,
            "name": sub.name,
            "location": sub.location,
            "assets_count": len(sub_assets)
        })

    # Calculate incident summary metrics
    crit_inc = sum(1 for i in all_incidents if str(i.get("severity", "")).lower() == "critical")
    high_inc = sum(1 for i in all_incidents if str(i.get("severity", "")).lower() == "high")
    med_inc = sum(1 for i in all_incidents if str(i.get("severity", "")).lower() == "medium")
    low_inc = sum(1 for i in all_incidents if str(i.get("severity", "")).lower() == "low")
    total_cust_affected = sum(int(i.get("affected_customers", 0) or 0) for i in all_incidents)
    total_outage_hrs = round(sum(float(i.get("outage_duration", 0) or 0.0) for i in all_incidents), 1)

    incidents_summary = {
        "total_incidents": len(all_incidents),
        "critical_count": crit_inc,
        "high_count": high_inc,
        "medium_count": med_inc,
        "low_count": low_inc,
        "total_customers_affected": total_cust_affected,
        "total_outage_hours": total_outage_hrs
    }

    # Weather data for region
    res_weather = await db.execute(
        select(models.WeatherData)
        .where(models.WeatherData.region == industry.region)
        .order_by(models.WeatherData.recorded_at.desc())
    )
    weather_entry = res_weather.scalars().first()
    weather_dict = {
        "region": industry.region,
        "temperature": weather_entry.temperature if weather_entry else 28.0,
        "rainfall": weather_entry.rainfall if weather_entry else 0.0,
        "wind_speed": weather_entry.wind_speed if weather_entry else 15.0,
        "lightning_risk": weather_entry.lightning_risk if weather_entry else 0.1,
        "source": "Regional forecast"
    }

    if critical_threats > 0:
        grid_status = "Critical Now"
    elif medium_threats > 0:
        grid_status = "Elevated Risk"
    else:
        grid_status = "Monitoring Active"

    return {
        "company": {
            "id": industry.id,
            "name": industry.name,
            "region": industry.region,
            "customer_count": industry.customer_count,
            "created_at": industry.created_at
        },
        "industry": industry,
        "substations_count": substations_count,
        "assets_count": assets_count,
        "transformers_count": transformers_count,
        "other_equipment_count": other_equipment_count,
        "grid_status": grid_status,
        "threats_summary": {
            "total_threats": len(all_threats),
            "critical_count": critical_threats,
            "medium_count": medium_threats,
            "low_count": max(0, len(all_threats) - critical_threats - medium_threats)
        },
        "incidents_summary": incidents_summary,
        "substations": substations_payload,
        "assets": all_assets_list,
        "threats": all_threats,
        "incidents": all_incidents,
        "weather": weather_dict
    }

@app.get("/companies/{company_id}/assets", tags=["Company Scoped Data"])
async def get_company_assets(
    company_id: int, 
    auth_ctx: Dict[str, Any] = Depends(require_company_access(min_role="viewer")),
    db: AsyncSession = Depends(get_db)
):
    dash = await get_company_dashboard(company_id=company_id, auth_ctx=auth_ctx, db=db)
    return dash["assets"]

@app.get("/companies/{company_id}/alerts", tags=["Company Scoped Data"])
async def get_company_alerts(
    company_id: int, 
    auth_ctx: Dict[str, Any] = Depends(require_company_access(min_role="viewer")),
    db: AsyncSession = Depends(get_db)
):
    dash = await get_company_dashboard(company_id=company_id, auth_ctx=auth_ctx, db=db)
    return {
        "company_id": company_id,
        "grid_status": dash["grid_status"],
        "threats_summary": dash["threats_summary"],
        "alerts": dash["threats"]
    }

@app.get("/companies/{company_id}/maintenance-plan", tags=["Company Scoped Data"])
async def get_company_maintenance_plan(
    company_id: int, 
    auth_ctx: Dict[str, Any] = Depends(require_company_access(min_role="viewer")),
    db: AsyncSession = Depends(get_db)
):
    dash = await get_company_dashboard(company_id=company_id, auth_ctx=auth_ctx, db=db)
    assets = dash["assets"]
    maintenance_tasks = []

    for a in assets:
        risk = a.get("failure_risk", 0.0)
        is_crit = risk >= 70.0
        is_med = risk >= 35.0
        if is_med or is_crit:
            maintenance_tasks.append({
                "asset_id": a["id"],
                "equipment_id": a["equipment_id"],
                "name": a["name"],
                "location": a["location"],
                "substation_name": a["substation_name"],
                "priority": "CRITICAL" if is_crit else "MEDIUM",
                "failure_risk": risk,
                "recommended_action": a["recommended_action"],
                "recommended_window": "Immediate (Next 24h)" if is_crit else "Next 7-14 Days",
                "status": "Dispatched / Queue"
            })

    return {
        "company_id": company_id,
        "total_tasks": len(maintenance_tasks),
        "tasks": maintenance_tasks
    }

@app.get("/companies/{company_id}/crew-plan", tags=["Company Scoped Data"])
async def get_company_crew_plan(
    company_id: int, 
    auth_ctx: Dict[str, Any] = Depends(require_company_access(min_role="viewer")),
    db: AsyncSession = Depends(get_db)
):
    dash = await get_company_dashboard(company_id=company_id, auth_ctx=auth_ctx, db=db)
    weather = dash["weather"]
    substations = dash["substations"]
    threats = dash["threats"]
    
    wind = weather.get("wind_speed", 0.0)
    rain = weather.get("rainfall", 0.0)
    lightning = weather.get("lightning_risk", 0.0)

    crew_allocations = []
    # If severe weather or critical threats exist
    is_severe_weather = wind >= 35.0 or rain >= 20.0 or lightning >= 0.6
    crit_threats = [t for t in threats if t["risk_score"] >= 70.0]

    for sub in substations:
        sub_crit = [t for t in crit_threats if t.get("substation_name") == sub["name"]]
        if is_severe_weather or len(sub_crit) > 0:
            crew_count = 2 if len(sub_crit) > 0 else 1
            readiness = "Level 1 Standby" if len(sub_crit) > 0 else "Pre-Positioned"
            crew_allocations.append({
                "substation_name": sub["name"],
                "location": sub["location"],
                "region": weather["region"],
                "risk_level": "CRITICAL" if len(sub_crit) > 0 else "HIGH",
                "allocated_crews": f"{crew_count} Field Crews",
                "readiness_state": readiness,
                "weather_condition": f"Wind {wind}mph, Rain {rain}mm, Lightning Hazard {lightning}",
                "justification": f"Severe condition in {weather['region']} affecting {sub['name']} ({len(sub_crit)} active critical asset risks)."
            })

    return {
        "company_id": company_id,
        "region": weather["region"],
        "is_severe_weather": is_severe_weather,
        "allocations": crew_allocations
    }

# ----------------- Company Management Endpoints -----------------

@app.get("/companies", response_model=List[IndustryResponse], tags=["Companies"])
@app.get("/industries", response_model=List[IndustryResponse], tags=["Companies"])
async def list_companies(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Industry).order_by(models.Industry.created_at.desc()))
    return result.scalars().all()

@app.get("/companies/{company_id}", response_model=IndustryResponse, tags=["Companies"])
@app.get("/industries/{company_id}", response_model=IndustryResponse, tags=["Companies"])
async def get_company(company_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Industry).where(models.Industry.id == company_id))
    industry = result.scalar_one_or_none()
    if not industry:
        raise HTTPException(status_code=404, detail=f"Company with ID {company_id} not found.")
    return industry

@app.delete("/companies/{company_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Companies"])
@app.delete("/industries/{company_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Companies"])
async def delete_company(
    company_id: int,
    auth_ctx: Dict[str, Any] = Depends(require_company_access(min_role="admin")),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(models.Industry).where(models.Industry.id == company_id))
    industry = result.scalar_one_or_none()
    if not industry:
        raise HTTPException(status_code=404, detail=f"Company with ID {company_id} not found.")
    await db.delete(industry)
    await db.commit()
    return None

# ----------------- Notification & Alert Endpoints -----------------

class NotificationTestRequest(BaseModel):
    phone_number: str
    company_name: Optional[str] = "Pravaha Grid Utility"

@app.post("/notifications/test", tags=["Notifications"])
async def test_notification_endpoint(req: NotificationTestRequest):
    result = await send_threat_notification(
        company_name=req.company_name,
        asset_name="Test Substation Transformer #1",
        threat_type="Dielectric Breakdown Stress",
        risk_level="Critical",
        risk_score=85.0,
        reason="Core winding temperature exceeded 92°C with high dissolved gas concentration.",
        recommended_action="Dispatch maintenance crew for immediate physical oil sampling.",
        target_phone=req.phone_number,
        notification_mode="Both"
    )
    return result

@app.get("/notifications/logs", tags=["Notifications"])
async def list_notification_logs():
    return get_notification_logs()

# ----------------- Legacy Endpoints (Fallback) -----------------

@app.get("/api/grid-equipment")
async def get_grid_equipment(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.GridEquipment).order_by(models.GridEquipment.created_at.desc()))
    return [
        {
            "id": item.id,
            "equipment_id": item.equipment_id,
            "name": item.name,
            "equipment_type": item.equipment_type,
            "status": item.status,
            "location": item.location,
            "health_score": item.health_score,
            "failure_risk": item.failure_risk,
            "recommended_action": item.recommended_action,
            "created_at": item.created_at
        }
        for item in result.scalars().all()
    ]

@app.get("/api/outage-predictions")
async def get_outage_predictions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.OutagePrediction).order_by(models.OutagePrediction.created_at.desc()))
    return [
        {
            "id": item.id,
            "region": item.region,
            "risk_level": item.risk_level,
            "probability": item.probability,
            "weather_condition": item.weather_condition,
            "affected_customers_estimated": item.affected_customers_estimated,
            "recommended_action": item.recommended_action,
            "created_at": item.created_at
        }
        for item in result.scalars().all()
    ]

@app.post("/api/predict/equipment-failure", tags=["Prediction Engine"])
async def predict_equipment_failure_endpoint(req: Dict[str, Any]):
    return predict_equipment_failure_risk(req)

@app.post("/api/predict/outage-risk", tags=["Prediction Engine"])
async def predict_outage_risk_endpoint(req: Dict[str, Any]):
    return predict_outage_risk(req)

@app.post("/api/recommendations/maintenance", tags=["Advisory Engine"])
async def get_maintenance_recommendations_endpoint(req: Dict[str, Any]):
    return generate_equipment_recommendations(
        equipment_type=req.get("equipment_type", "Transformer"),
        failure_risk=req.get("failure_risk", 50.0),
        factors=req.get("driving_factors", [])
    )
