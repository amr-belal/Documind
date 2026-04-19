from kafka import KafkaProducer
import json
import logging
import config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class KafkaProducerClient:
    def __init__(self):
        self.producer = KafkaProducer(
            bootstrap_servers=config.KAFKA_BOOTSTRAP_SERVERS,
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )
    
    def publish(self , topic:str , message:dict):

        try:
            future = self.producer.send(topic, message)
            result = future.get(timeout=10)  # Wait for the send to complete
            logger.info(f"Message sent to topic {topic}: {message}")
            return result
        except Exception as e:
            logger.error(f"Failed to send message to topic {topic}: {e}")
            raise e 