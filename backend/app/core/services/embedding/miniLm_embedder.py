from sentence_transformers import SentenceTransformer
from app.core.services.embedding.BaseEmbedder import BaseEmbedder


class MiniLmEmbedder(BaseEmbedder):
    def __init__(self):
        self.model = SentenceTransformer("all-MiniLM-L6-v2" ,device="cpu")

    def generate_embedding(self, text: str) -> list[float]:
        return self.model.encode(text).tolist()