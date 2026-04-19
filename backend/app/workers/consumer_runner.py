from app.infrastructure.messaging.kafka_consumer import KafkaConsumerClient

if __name__ == "__main__":
    consumer = KafkaConsumerClient(topic="raw_documents", group_id="documind_group")
    consumer.consume()