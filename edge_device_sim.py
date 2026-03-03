import os
import ssl
import time
import json
import random
import uuid
from datetime import datetime
import paho.mqtt.client as mqtt
from dotenv import load_dotenv

load_dotenv()

# --- Configuration ---
MQTT_BROKER_HOST = os.getenv("MQTT_BROKER_HOST")
MQTT_BROKER_PORT = int(os.getenv("MQTT_BROKER_PORT", "8883"))
MQTT_USERNAME = os.getenv("MQTT_USERNAME")
MQTT_PASSWORD = os.getenv("MQTT_PASSWORD")
CLIENT_ID = os.getenv("MQTT_CLIENT_ID", "EdgeNode_001")
TOPIC = os.getenv("MQTT_TOPIC", "forest/incidents")

# --- Classes from your MobileNetV2 ---
SPECIES_LIST = ["Elephant", "Boar", "Deer", "Leopard", "Human", "Unknown"]
LOCATIONS = ["Sector_A1", "Sector_B4", "River_Crossing"]

class SimulatedEdgeDevice:
    def __init__(self):
        # Initialize MQTT Client
        self.mqtt_client = mqtt.Client(client_id=CLIENT_ID)
        self.mqtt_client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)

        # TLS for port 8883
        self.mqtt_client.tls_set(cert_reqs=ssl.CERT_NONE)
        self.mqtt_client.tls_insecure_set(True)

        # Callbacks
        self.mqtt_client.on_connect = self._on_connect
        self.mqtt_client.on_disconnect = self._on_disconnect

    def _on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            print("Connected to MQTT broker successfully.")
        else:
            print(f"Connection failed with code {rc}")

    def _on_disconnect(self, client, userdata, rc):
        print(f"Disconnected from broker (rc={rc}). Reconnecting...")

    def connect(self):
        print(f"Connecting to {MQTT_BROKER_HOST}:{MQTT_BROKER_PORT}...")
        self.mqtt_client.connect(MQTT_BROKER_HOST, MQTT_BROKER_PORT, keepalive=60)
        self.mqtt_client.loop_start()

    def generate_mock_inference(self):
        """Simulates the output of your MobileNetV2 + Decide logic"""
        species = random.choice(SPECIES_LIST)
        
        # Logic to determine threat level
        if species in ["Leopard", "Elephant", "Human"]:
            threat_level = "HIGH"
        elif species == "Unknown":
            threat_level = "MEDIUM"
        else:
            threat_level = "LOW"

        payload = {
            "device_id": CLIENT_ID,
            "event_id": str(uuid.uuid4()),
            "timestamp": datetime.utcnow().isoformat(),
            "species": species,
            "location": random.choice(LOCATIONS),
            "threat_level": threat_level,
            "inference_time_ms": random.uniform(45, 55) # Simulating RPi 4 speed
        }
        return payload

    def run_simulation(self):
        self.connect()
        print("Simulation started. Press Ctrl+C to stop.")
        
        try:
            while True:
                # 1. Simulate Inference
                event = self.generate_mock_inference()
                
                # 2. Log & Send
                print(f"[{event['timestamp']}] Detected: {event['species']} ({event['threat_level']})")
                
                self.mqtt_client.publish(TOPIC, json.dumps(event), qos=1)
                
                # 3. Wait for next "detection" (Simulating real-world delay)
                time.sleep(random.randint(5, 15))
        except KeyboardInterrupt:
            self.mqtt_client.loop_stop()
            self.mqtt_client.disconnect()
            print("\nSimulation stopped.")

if __name__ == "__main__":
    sim = SimulatedEdgeDevice()
    sim.run_simulation()
