import requests
from app.core.services.embedding.BaseEmbedder import BaseEmbedder

class OllamaEmbedder(BaseEmbedder):
    def __init__(self):
        self.url = "http://localhost:11434/api/embeddings"
        self.model = "nomic-embed-text"

    def generate_embedding(self, text: str) -> list[float]:
        response = requests.post(self.url, json={
            "model": self.model,
            "prompt": text
        })
        return response.json()["embedding"]