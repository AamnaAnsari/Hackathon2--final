"""
Kafka Consumer for task-events topic.
Listens for task creation events and sends notifications.
"""
import json
import os
import ssl
import asyncio
from aiokafka import AIOKafkaConsumer
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get Kafka configuration from environment variables
KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
KAFKA_USERNAME = os.getenv("KAFKA_USERNAME", "")
KAFKA_PASSWORD = os.getenv("KAFKA_PASSWORD", "")


class NotificationService:
    """
    Kafka consumer for task-events topic.
    Listens for task creation events and sends notifications.
    """
    
    def __init__(self, topic: str = "task-events", group_id: str = "notification-service"):
        self.topic = topic
        self.group_id = group_id
        self.consumer = None
        self.bootstrap_servers = KAFKA_BOOTSTRAP_SERVERS.split(",")
        self.running = False
    
    async def start(self):
        """Initialize and start the Kafka consumer."""
        kwargs = {
            "bootstrap_servers": self.bootstrap_servers,
            "group_id": self.group_id,
            "auto_offset_reset": "earliest",
            "value_deserializer": lambda m: m.decode("utf-8") if m else None,
        }
        
        # Add SASL authentication if credentials are provided
        if KAFKA_USERNAME and KAFKA_PASSWORD:
            ssl_context = ssl.create_default_context()
            
            kwargs.update({
                "security_protocol": "SASL_SSL",
                "sasl_mechanism": "SCRAM-SHA-256",
                "sasl_plain_username": KAFKA_USERNAME,
                "sasl_plain_password": KAFKA_PASSWORD,
                "ssl_context": ssl_context,
            })
        
        self.consumer = AIOKafkaConsumer(*[self.topic], **kwargs)
        await self.consumer.start()
        self.running = True
        print(f"✅ Notification Service started, listening to topic: {self.topic}")
    
    async def stop(self):
        """Stop the Kafka consumer."""
        self.running = False
        if self.consumer:
            await self.consumer.stop()
            print("✅ Notification Service stopped")
    
    async def consume_events(self):
        """
        Consume messages from the task-events topic and process them.
        """
        try:
            async for message in self.consumer:
                if message.value:
                    try:
                        # Parse JSON message
                        event_data = json.loads(message.value)
                        
                        # Check if it's a task creation event
                        if event_data.get("event_type") == "task_created":
                            title = event_data.get("title", "Unknown")
                            print(f"🔔 Notification: New Task Created - {title}")
                    except json.JSONDecodeError as e:
                        print(f"❌ Error parsing message: {e}")
        except asyncio.CancelledError:
            print("Consumer task cancelled")
        except Exception as e:
            print(f"❌ Error in consumer: {e}")
            raise


async def run_notification_service():
    """
    Main function to run the notification service.
    """
    service = NotificationService()
    
    try:
        await service.start()
        await service.consume_events()
    except KeyboardInterrupt:
        print("\n⏹️  Shutting down notification service...")
    finally:
        await service.stop()


if __name__ == "__main__":
    asyncio.run(run_notification_service())
