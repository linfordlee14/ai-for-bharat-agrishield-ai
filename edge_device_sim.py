import time
import json
import random
import uuid
from datetime import datetime
from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient

# --- Configuration ---
# Replace these with your actual AWS IoT endpoint and certificate paths
AWS_ENDPOINT = "your-endpoint-ats.iot.us-east-1.amazonaws.com"
CLIENT_ID = "EdgeNode_001"
PATH_TO_ROOT_CA = "root-CA.crt"
PATH_TO_CERT = "device.cert.pem"
PATH_TO_KEY = "private.key"
TOPIC = "forest/incidents"

# --- Classes from your MobileNetV2 ---
SPECIES_LIST = ["Elephant", "Boar", "Deer", "Leopard", "Human", "Unknown"]
LOCATIONS = ["Sector_A1", "Sector_B4", "River_Crossing"]

class SimulatedEdgeDevice:
    def __init__(self):
        # Initialize MQTT Client
        self.mqtt_client = AWSIoTMQTTClient(CLIENT_ID)
        self.mqtt_client.configureEndpoint(AWS_ENDPOINT, 8883)
        self.mqtt_client.configureCredentials(PATH_TO_ROOT_CA, PATH_TO_KEY, PATH_TO_CERT)
        
        # Connection settings
        self.mqtt_client.configureAutoReconnectBackoffTime(1, 32, 20)
        self.mqtt_client.configureOfflinePublishQueueing(-1)  # Infinite offline queue
        self.mqtt_client.configureDrainingFrequency(2)
        self.mqtt_client.configureConnectDisconnectTimeout(10)
        self.mqtt_client.configureMQTTOperationTimeout(5)

    def connect(self):
        print(f"Connecting to {AWS_ENDPOINT}...")
        return self.mqtt_client.connect()

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
                
                # AWS IoT handles the 'ConnectivityManager' queuing internally 
                # if you configure OfflinePublishQueueing.
                self.mqtt_client.publish(TOPIC, json.dumps(event), 1)
                
                # 3. Wait for next "detection" (Simulating real-world delay)
                time.sleep(random.randint(5, 15))
        except KeyboardInterrupt:
            self.mqtt_client.disconnect()
            print("\nSimulation stopped.")

if __name__ == "__main__":
    sim = SimulatedEdgeDevice()
    sim.run_simulation()
