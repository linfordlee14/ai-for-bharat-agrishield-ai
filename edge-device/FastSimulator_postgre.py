import os
import ssl
import time
import json
import random
import uuid
import threading
from datetime import datetime

from fastapi import FastAPI
from dotenv import load_dotenv
import paho.mqtt.client as mqtt

from sqlalchemy import create_engine, Column, String, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

# Load environment variables
load_dotenv()

# ==========================
# DATABASE CONFIG
# ==========================

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:password@localhost:5432/forest_db"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

# ==========================
# DATABASE MODELS
# ==========================

class Device(Base):
    __tablename__ = "devices"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    location = Column(String)
    status = Column(String)
    last_seen = Column(DateTime)

    incidents = relationship("Incident", back_populates="device")


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(UUID(as_uuid=True), primary_key=True)
    timestamp = Column(DateTime, nullable=False)
    species = Column(String)
    location = Column(String)
    threat_level = Column(String)
    device_id = Column(String, ForeignKey("devices.id"))
    confidence = Column(Float)

    device = relationship("Device", back_populates="incidents")


# Create tables automatically
Base.metadata.create_all(bind=engine)

# ==========================
# MQTT CONFIG
# ==========================

MQTT_BROKER_HOST = os.getenv("MQTT_BROKER_HOST", "13.214.202.131")
MQTT_BROKER_PORT = int(os.getenv("MQTT_BROKER_PORT", "8883"))
MQTT_USERNAME = os.getenv("MQTT_USERNAME", "SuperUser")
MQTT_PASSWORD = os.getenv("MQTT_PASSWORD", "rd@2804")
CLIENT_ID = os.getenv("MQTT_CLIENT_ID", "EdgeNode_001")
TOPIC = os.getenv("MQTT_TOPIC", "forest/incidents")

SPECIES_LIST = ["Elephant", "Boar", "Deer", "Leopard", "Human", "Unknown"]
LOCATIONS = ["Sector_A1", "Sector_B4", "River_Crossing"]

app = FastAPI()

# ==========================
# SIMULATOR CLASS
# ==========================

class SimulatedEdgeDevice:
    def __init__(self):
        self.running = False
        self.mqtt_client = mqtt.Client(client_id=CLIENT_ID)
        self.mqtt_client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)
        self.mqtt_client.tls_set(cert_reqs=ssl.CERT_NONE)
        self.mqtt_client.tls_insecure_set(True)

    def connect(self):
        self.mqtt_client.connect(MQTT_BROKER_HOST, MQTT_BROKER_PORT, 60)
        self.mqtt_client.loop_start()

    def generate_event(self):
        species = random.choice(SPECIES_LIST)

        if species in ["Leopard", "Elephant", "Human"]:
            threat_level = "HIGH"
        elif species == "Unknown":
            threat_level = "MEDIUM"
        else:
            threat_level = "LOW"

        return {
            "id": uuid.uuid4(),
            "timestamp": datetime.utcnow(),
            "species": species,
            "location": random.choice(LOCATIONS),
            "threat_level": threat_level,
            "device_id": CLIENT_ID,
            "confidence": round(random.uniform(0.75, 0.99), 2)
        }

    def run(self):
        self.running = True
        self.connect()

        # Ensure device exists
        db = SessionLocal()
        if not db.query(Device).filter(Device.id == CLIENT_ID).first():
            device = Device(
                id=CLIENT_ID,
                name="Farm Block A – North Gate",
                location="Sector A",
                status="ONLINE",
                last_seen=datetime.utcnow()
            )
            db.add(device)
            db.commit()
        db.close()

        while self.running:
            event = self.generate_event()

            # Save to PostgreSQL
            db = SessionLocal()

            incident = Incident(
                id=event["id"],
                timestamp=event["timestamp"],
                species=event["species"],
                location=event["location"],
                threat_level=event["threat_level"],
                device_id=event["device_id"],
                confidence=event["confidence"]
            )

            db.add(incident)

            # Update device last_seen
            device = db.query(Device).filter(Device.id == CLIENT_ID).first()
            device.last_seen = event["timestamp"]

            db.commit()
            db.close()

            # Publish MQTT
            self.mqtt_client.publish(
                TOPIC,
                json.dumps({
                    **event,
                    "id": str(event["id"]),
                    "timestamp": event["timestamp"].isoformat() + "Z"
                }),
                qos=1
            )

            time.sleep(random.randint(5, 15))

    def stop(self):
        self.running = False
        self.mqtt_client.loop_stop()
        self.mqtt_client.disconnect()


simulator = SimulatedEdgeDevice()
thread = None

# ==========================
# API ENDPOINTS
# ==========================

@app.get("/incidents")
def get_incidents():
    db = SessionLocal()
    data = db.query(Incident).all()
    db.close()
    return data


@app.get("/devices")
def get_devices():
    db = SessionLocal()
    data = db.query(Device).all()
    db.close()
    return data


@app.post("/start")
def start_simulation():
    global thread
    if not simulator.running:
        thread = threading.Thread(target=simulator.run)
        thread.start()
        return {"message": "Simulation started"}
    return {"message": "Already running"}


@app.post("/stop")
def stop_simulation():
    simulator.stop()
    return {"message": "Simulation stopped"}