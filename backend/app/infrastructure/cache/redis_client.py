import redis
import config
import uuid 
import logging
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class RedisCache:

    """A simple Redis cache wrapper for storing and retrieving data.
        combine chunks with their entities and store in redis with a unique key (e.g., file_id) for later retrieval during entity resolution and graph building.
    """

    def __init__(self):
        self.client = redis.from_url(config.REDIS_URL)
        

    def set(self, key: str, value: str, expire: int = 3600):
        """Set a value in the cache with an optional expiration time."""
        try:
            self.client.set(key, value, ex=expire)
            logger.info(f"Set key {key} in Redis with expiration {expire} seconds")
        except Exception as e:
            logger.error(f"Error setting key {key} in Redis: {e}")

    def get(self, key: str) -> dict:
        value = self.client.get(key)
        if value:
            return json.loads(value.decode('utf-8'))
        return None
            
    def delete(self, key: str):
        """Delete a key from the cache."""
        try:
            self.client.delete(key)
            logger.info(f"Deleted key {key} from Redis")
        except Exception as e:
            logger.error(f"Error deleting key {key} from Redis: {e}")

    def generate_key(self) -> str:
        """Generate a unique key for storing data in Redis."""
        return str(uuid.uuid4())
    def combine_save_chunks_with_entities(self, chunks: list[str], entities: list[dict]) -> str:
        """Combine text chunks with their corresponding entities into a single string for storage."""
        combined_data = {
            "chunks": chunks,
            "entities": entities
        }

        # save to redis with a unique key
        key = self.generate_key()
        self.set(key, json.dumps(combined_data))  # Store the combined data as a string
        logger.info(f"Combined chunks and entities stored in Redis with key: {key}")

        return key  # Return the unique key for later retrieval
    