from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, Float, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String(64), primary_key=True, index=True) # Supabase UUID as string
    full_name = Column(String(255), nullable=True)
    phone_number = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Industry(Base):
    __tablename__ = "industries"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    region = Column(String(255), nullable=False)
    customer_count = Column(Integer, default=0, nullable=False)
    created_by = Column(String(64), nullable=True) # User UUID
    created_at = Column(DateTime, default=datetime.utcnow)

    substations = relationship("Substation", back_populates="industry", cascade="all, delete-orphan")
    members = relationship("OrganizationMember", back_populates="industry", cascade="all, delete-orphan")

class OrganizationMember(Base):
    __tablename__ = "organization_members"

    company_id = Column(Integer, ForeignKey("industries.id", ondelete="CASCADE"), primary_key=True)
    user_id = Column(String(64), primary_key=True, index=True)
    role = Column(String(50), nullable=False, default="admin") # 'admin', 'engineer', 'viewer'
    joined_at = Column(DateTime, default=datetime.utcnow)

    industry = relationship("Industry", back_populates="members")

class Substation(Base):
    __tablename__ = "substations"

    id = Column(Integer, primary_key=True, index=True)
    industry_id = Column(Integer, ForeignKey("industries.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    location = Column(String(255), nullable=False)

    industry = relationship("Industry", back_populates="substations")
    assets = relationship("Asset", back_populates="substation", cascade="all, delete-orphan")

class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    substation_id = Column(Integer, ForeignKey("substations.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False, default="Asset")
    asset_type = Column(String(100), nullable=False)
    capacity = Column(String(100), nullable=True)
    installation_year = Column(Integer, nullable=True)
    affected_customers = Column(Integer, default=0)

    substation = relationship("Substation", back_populates="assets")
    sensor_readings = relationship("SensorReading", back_populates="asset", cascade="all, delete-orphan")
    incidents = relationship("Incident", back_populates="asset", cascade="all, delete-orphan")
    threats = relationship("Threat", back_populates="asset", cascade="all, delete-orphan")

class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id", ondelete="CASCADE"), nullable=False)
    temperature = Column(Float, nullable=True)
    vibration = Column(Float, nullable=True)
    partial_discharge = Column(Float, nullable=True)
    oil_quality = Column(Float, nullable=True)
    load_percentage = Column(Float, nullable=True)
    recorded_at = Column(DateTime, default=datetime.utcnow)

    asset = relationship("Asset", back_populates="sensor_readings")

class WeatherData(Base):
    __tablename__ = "weather_data"

    id = Column(Integer, primary_key=True, index=True)
    region = Column(String(255), index=True, nullable=False)
    temperature = Column(Float, nullable=True)
    rainfall = Column(Float, nullable=True)
    wind_speed = Column(Float, nullable=True)
    lightning_risk = Column(Float, nullable=True)
    recorded_at = Column(DateTime, default=datetime.utcnow)

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id", ondelete="CASCADE"), nullable=False)
    incident_type = Column(String(100), nullable=False)
    severity = Column(String(50), default="Medium")
    outage_duration = Column(Float, default=0.0) # hours
    affected_customers = Column(Integer, default=0)
    incident_date = Column(DateTime, default=datetime.utcnow)

    asset = relationship("Asset", back_populates="incidents")

class Threat(Base):
    __tablename__ = "threats"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id", ondelete="CASCADE"), nullable=False)
    threat_type = Column(String(100), nullable=False)
    risk_level = Column(String(50), default="Low") # Low, Medium, High, Critical
    risk_score = Column(Float, default=0.0)
    explanation = Column(Text, nullable=True)
    recommended_action = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    asset = relationship("Asset", back_populates="threats")

# Legacy models preserved for backward compatibility
class TestItem(Base):
    __tablename__ = "test_items"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class GridEquipment(Base):
    __tablename__ = "grid_equipment"
    id = Column(Integer, primary_key=True, index=True)
    equipment_id = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    equipment_type = Column(String(100), nullable=False)
    location = Column(String(255), nullable=False)
    health_score = Column(Float, default=100.0)
    failure_risk = Column(Float, default=0.0)
    status = Column(String(50), default="Operational")
    last_inspected = Column(DateTime, default=datetime.utcnow)
    recommended_action = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class OutagePrediction(Base):
    __tablename__ = "outage_predictions"
    id = Column(Integer, primary_key=True, index=True)
    region = Column(String(255), nullable=False)
    risk_level = Column(String(50), nullable=False)
    probability = Column(Float, nullable=False)
    weather_condition = Column(String(100), nullable=True)
    affected_customers_estimated = Column(Integer, default=0)
    predicted_time = Column(DateTime, default=datetime.utcnow)
    recommended_action = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
