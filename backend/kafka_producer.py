"""
Kafka producer for publishing task events.
Uses aiokafka for async message publishing with SASL_SSL authentication.
"""
import json
import os
import ssl
from aiokafka import AIOKafkaProducer
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get Kafka configuration from environment variables
KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
KAFKA_USERNAME = os.getenv("KAFKA_USERNAME", "")
KAFKA_PASSWORD = os.getenv("KAFKA_PASSWORD", "")


class KafkaProducer:
    """
    Async Kafka producer for publishing events.
    Uses SASL_SSL authentication if credentials are provided.
    """
    
    def __init__(self):
        self.producer = None
        self.bootstrap_servers = KAFKA_BOOTSTRAP_SERVERS.split(",")
    
    async def start(self):
        """Initialize and start the Kafka producer."""
        kwargs = {
            "bootstrap_servers": self.bootstrap_servers,
        }
        
        # Add SASL authentication if credentials are provided
        if KAFKA_USERNAME and KAFKA_PASSWORD:
            # Create default SSL context for SASL_SSL
            ssl_context = ssl.create_default_context()
            
            kwargs.update({
                "security_protocol": "SASL_SSL",
                "sasl_mechanism": "SCRAM-SHA-256",
                "sasl_plain_username": KAFKA_USERNAME,
                "sasl_plain_password": KAFKA_PASSWORD,
                "ssl_context": ssl_context,
            })
        
        self.producer = AIOKafkaProducer(**kwargs)
        await self.producer.start()
        print("✅ Kafka Producer started successfully")
    
    async def stop(self):
        """Stop the Kafka producer."""
        if self.producer:
            await self.producer.stop()
            print("✅ Kafka Producer stopped")
    
    async def send_event(self, topic: str, event_data: dict):
        """
        Publish an event to a Kafka topic.
        
        Args:
            topic: Kafka topic name
            event_data: Event data as a dictionary (will be JSON serialized)
        
        Returns:
            Kafka RecordMetadata with offset, partition, timestamp info
        """
        if not self.producer:
            raise RuntimeError("Kafka producer not initialized. Call start() first.")
        
        try:
            # Serialize event data to JSON
            message = json.dumps(event_data).encode("utf-8")
            
            # Send message to topic
            result = await self.producer.send_and_wait(topic, value=message)
            print(f"✅ Event published to topic '{topic}': {event_data}")
            return result
        except Exception as e:
            print(f"❌ Error sending event to topic '{topic}': {e}")
            raise


# Global producer instance
kafka_producer = KafkaProducer()
