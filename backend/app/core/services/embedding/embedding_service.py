from sentence_transformers import SentenceTransformer
from app.core.services.embedding.embedder_factory import EmbedderFactory


class EmbeddingService:

    _instance = None
    _model = None

    def __new__(cls, model_name="ollama"):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._model = EmbedderFactory.get_embedder(model_name)
        return cls._instance

    def generate_embedding(self, text: str) -> list[float]:
        return self._model.generate_embedding(text)
    
    