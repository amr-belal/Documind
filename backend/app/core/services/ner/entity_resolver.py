from app.infrastructure.cache.redis_client import RedisCache
import logging
from rapidfuzz import fuzz


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class EntityResolver:
    """
    EntityResolver is responsible for resolving entities extracted from text chunks.
    It retrieves the combined chunks and entities from Redis, performs resolution, and prepares data for graph building.

    1. Exact Match (lowercase)
    2. Fuzzy Matching (using libraries like fuzzywuzzy or rapidfuzz)
    3. Contextual Analysis (using embeddings to compare entity contexts) (future enhancement)
    """

    def __init__(self):
        self.redis_cache = RedisCache()

    
    def _fuzzy_match(self, entity_text: str, seen: dict, threshold: int = 85) -> str:
        """
        Returns the key of the matching entity if found, else None.
        """
        for key in seen:
            score = fuzz.ratio(entity_text.lower(), key)
            if score >= threshold:
                return key
        return None

    def _deduplicate_entities(self, entities: list[dict]) -> list[dict]:
        seen = {}
        for entity in entities:
            key = entity["text"].lower()

            # First check for exact match
            if key in seen:
                continue

            # If no exact match, check for fuzzy match
            fuzzy_key = self._fuzzy_match(entity["text"], seen)
            if fuzzy_key:
                continue

            # If no match found, add to seen
            seen[key] = entity
            
        return list(seen.values())
    
    
    def resolve_entities(self, cache_key: str) -> list[dict]:
        """
        Resolves entities by retrieving combined chunks and entities from Redis using the provided cache key.
        Returns a list of resolved entities with their corresponding chunks.
        """

        data = self.redis_cache.get(cache_key)

        if not data:
            logger.warning(f"No data found in Redis for key: {cache_key}")
            return []
        
        entities = data.get("entities", [])

        resolved = self._deduplicate_entities(entities)

        logger.info(f"Resolved {len(resolved)} unique entities from Redis key: {cache_key}")

        return resolved
    

        