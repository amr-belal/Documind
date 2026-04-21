from app.core.services.embedding.BaseEmbedder import BaseEmbedder
from app.core.services.embedding.miniLm_embedder import MiniLmEmbedder
from app.core.services.embedding.bge_embeder import BGEEmbedder
from app.core.services.embedding.ollama_embedder import OllamaEmbedder


class EmbedderFactory:
    @staticmethod
    def get_embedder(model_name: str) -> BaseEmbedder:
        if model_name in ["all-MiniLM-L6-v2", "miniLm"]:
            return MiniLmEmbedder()
        elif model_name in ["BAAI/bge-small-en-v1.5", "bge"]:
            return BGEEmbedder()
        elif model_name in ["nomic-embed-text", "ollama"]:
            return OllamaEmbedder()
        else:
            raise ValueError(f"Unsupported model name: {model_name}")
        
