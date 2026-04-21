from abc import ABC , abstractmethod

class BaseEmbedder(ABC):
    @abstractmethod
    def generate_embedding(self, text: str) -> list[float]:
        pass