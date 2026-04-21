from qdrant_client import QdrantClient, models
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class QdrantVectorStore:
    def __init__(self, host: str = "localhost", port: int = 6333):
        self.client = QdrantClient(host=host, port=port)

    def create_collection(self, collection_name: str, vector_size: int):
        try:

            if not self.client.collection_exists(collection_name):

                self.client.create_collection(
                    collection_name=collection_name,
                    vectors_config=models.VectorParams(size=vector_size, distance=models.Distance.COSINE)
                )

            logger.info(f"Collection '{collection_name}' created successfully.")
        except Exception as e:
            logger.error(f"Error creating collection '{collection_name}': {e}")
            raise

    def add_vectors(self, collection_name: str, vectors: list[dict]):
        try:
            self.client.upsert(collection_name=collection_name, points=vectors)
            logger.info(f"Vectors added to collection '{collection_name}' successfully.")
        except Exception as e:
            logger.error(f"Error adding vectors to collection '{collection_name}': {e}")
            raise

    def search_vectors(self, collection_name: str, query_vector: list[float], top_k: int = 5):
        try:
            results = self.client.search(
                collection_name=collection_name,
                query_vector=query_vector,
                limit=top_k
            )
            logger.info(f"Search in collection '{collection_name}' completed successfully.")
            return results
        except Exception as e:
            logger.error(f"Error searching in collection '{collection_name}': {e}")
            raise
    def delete_collection(self, collection_name: str):  
        try:
            self.client.delete_collection(collection_name=collection_name)
            logger.info(f"Collection '{collection_name}' deleted successfully.")
        except Exception as e:
            logger.error(f"Error deleting collection '{collection_name}': {e}")
            raise