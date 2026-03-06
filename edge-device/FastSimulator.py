import os
import ssl
import time
import json
import random
import uuid
import threading
from datetime import datetime
from typing import List
from fastapi import FastAPI
import paho.mqtt.client as mqtt
from dotenv import load_dotenv

load_dotenv()

# --- Configuration ---
MQTT_BROKER_HOST = os.getenv("MQTT_BROKER_HOST", "13.214.202.131")
MQTT_BROKER_PORT = int(os.getenv("MQTT_BROKER_PORT", "8883"))
MQTT_USERNAME = os.getenv("MQTT_USERNAME", "SuperUser")
MQTT_PASSWORD = os.getenv("MQTT_PASSWORD", "rd@2804")
CLIENT_ID = os.getenv("MQTT_CLIENT_ID", "EdgeNode_001")
TOPIC = os.getenv("MQTT_TOPIC", "forest/incidents")

SPECIES_LIST = ["Elephant", "Boar", "Deer", "Leopard", "Human", "Unknown"]
LOCATIONS = ["Sector_A1", "Sector_B4", "River_Crossing"]

app = FastAPI()

# In-memory storage (for demo)
incidents: List[dict] = []
devices = {
    CLIENT_ID: {
        "id": CLIENT_ID,
        "name": "Farm Block A – North Gate",
        "location": "Sector A",
        "status": "ONLINE",
        "lastSeen": None
    }
}

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
            "id": str(uuid.uuid4()),
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "species": species,
            "location": random.choice(LOCATIONS),
            "threat_level": threat_level,
            "device_id": CLIENT_ID,
            "confidence": round(random.uniform(0.75, 0.99), 2)
        }

    def run(self):
        self.running = True
        self.connect()

        while self.running:
            event = self.generate_event()

            # store locally
            incidents.append(event)
            devices[CLIENT_ID]["lastSeen"] = event["timestamp"]

            # publish to MQTT
            self.mqtt_client.publish(TOPIC, json.dumps(event), qos=1)

            time.sleep(random.randint(5, 15))

    def stop(self):
        self.running = False
        self.mqtt_client.loop_stop()
        self.mqtt_client.disconnect()


simulator = SimulatedEdgeDevice()
thread = None

# --- API ENDPOINTS ---

@app.get("/incidents")
def get_incidents():
    return incidents

@app.get("/devices")
def get_devices():
    return list(devices.values())

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