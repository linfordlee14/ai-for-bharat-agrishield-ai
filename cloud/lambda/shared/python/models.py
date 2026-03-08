# SQLAlchemy models for AgriShield — PostgreSQL on VPS

from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from db import Base


class Device(Base):
    __tablename__ = "devices"

    id = Column(String(100), primary_key=True)
    name = Column(String(255), nullable=False)
    location = Column(String(255))
    status = Column(String(20))  # ONLINE, OFFLINE, DEGRADED
    last_seen = Column(DateTime)
    config = Column(Text)  # JSON config string

    incidents = relationship("Incident", back_populates="device")
    telemetry = relationship("Telemetry", back_populates="device")


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(UUID(as_uuid=True), primary_key=True)
    timestamp = Column(DateTime, nullable=False)
    species = Column(String(100))
    location = Column(String(255))
    threat_level = Column(String(20))  # LOW, MEDIUM, HIGH
    device_id = Column(String(100), ForeignKey("devices.id"))
    confidence = Column(Float)
    latitude = Column(Float)
    longitude = Column(Float)
    media_url = Column(Text)
    processed = Column(String(10), default="false")

    device = relationship("Device", back_populates="incidents")


class Telemetry(Base):
    __tablename__ = "telemetry"

    id = Column(UUID(as_uuid=True), primary_key=True)
    device_id = Column(String(100), ForeignKey("devices.id"))
    timestamp = Column(DateTime, nullable=False)
    cpu_temp = Column(Float)
    battery_level = Column(Float)
    signal_strength = Column(Float)
    memory_usage = Column(Float)
    disk_usage = Column(Float)
    uptime_seconds = Column(Integer)

    device = relationship("Device", back_populates="telemetry")


class MovementEvent(Base):
    __tablename__ = "movement_events"

    id = Column(UUID(as_uuid=True), primary_key=True)
    species = Column(String(100))
    from_device_id = Column(String(100), ForeignKey("devices.id"))
    to_device_id = Column(String(100), ForeignKey("devices.id"))
    from_lat = Column(Float)
    from_lng = Column(Float)
    to_lat = Column(Float)
    to_lng = Column(Float)
    first_seen = Column(DateTime)
    last_seen = Column(DateTime)
    movement_type = Column(String(50))  # approaching, retreating, passing
    distance_km = Column(Float)
