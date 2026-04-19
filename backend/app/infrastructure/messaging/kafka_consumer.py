from kafka import KafkaConsumer
from workers.document_tasks import process_document
import config
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class KafkaConsumerClient:
    def __init__(self, topic:str, group_id:str):
        self.consumer = KafkaConsumer(
            topic,
            bootstrap_servers=config.KAFKA_BOOTSTRAP_SERVERS,
            group_id=group_id,
            value_deserializer=lambda m: json.loads(m.decode('utf-8'))
        )
        logger.info(f"Kafka consumer initialized for topic: {topic} with group ID: {group_id}")
    
    def consume(self):
        for message in self.consumer:
            logger.info(f"Received message: {message.value}")
            try:
                process_document.delay(
                    file_id=message.value["file_id"],
                    file_path=message.value["file_path"],
                    file_name=message.value["file_name"]
                )
            except Exception as e:
                logger.error(f"Failed to process message: {e}")
                