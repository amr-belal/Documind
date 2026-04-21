from sentence_transformers import SentenceTransformer
from app.core.services.embedding.BaseEmbedder import BaseEmbedder
from fastembed import TextEmbedding

# class BGEEmbedder(BaseEmbedder):
#     def __init__(self):
#         self.model = SentenceTransformer("BAAI/bge-small-en-v1.5" ,device="cpu")

#     def generate_embedding(self, text: str) -> list[float]:
#         return self.model.encode(text).tolist()


class BGEEmbedder(BaseEmbedder):
    def __init__(self):
        self.model = TextEmbedding("BAAI/bge-small-en-v1.5")

    def generate_embedding(self, text: str) -> list[float]:
        embeddings = list(self.model.embed([text]))
        return embeddings[0].tolist()