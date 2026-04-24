import requests
import json
import logging
import re
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)

class OllamaNERService:
    
    def __init__(self, model: str = "qwen2.5:1.5b"):
        self.model = model
        self.url = "http://localhost:11434/api/generate"
    
    def _build_prompt(self, chunks: list[str]) -> str:
        combined = "\n\n---\n\n".join(
            [f"Chunk {i+1}:\n{chunk}" for i, chunk in enumerate(chunks)]
        )
        return f"""You are a scientific named entity recognition system.
Extract entities from ALL chunks below.

Entity types:
- MODEL: ML/AI models (BERT, GPT-4, ColBERT, Matryoshka)
- DATASET: Datasets (WANDS, BEIR, MS MARCO)
- METRIC: Evaluation metrics (NDCG, MRR, Precision@k, F1)
- ALGORITHM: Algorithms and techniques (BM25, RRF, HNSW)
- CONCEPT: Key concepts (hybrid search, dense retrieval, embeddings)
- ORGANIZATION: Companies and labs (Qdrant, Jina AI, Google)
- AUTHOR: Person names
- TASK: NLP/ML tasks (text classification, NER, retrieval)
- LIBRARY: Software libraries (PyTorch, HuggingFace, LangChain)
- PAPER: Research paper titles
- VENUE: Conferences and journals (ACL, NeurIPS, ICML)

Rules:
1. Return ONLY a valid JSON array
2. No duplicates across chunks
3. Each item must have "text" and "label" keys
4. Skip numbers, dates, URLs, and code snippets

Text:
{combined}

JSON:"""

    def _parse_response(self, result: str) -> list[dict]:
        match = re.search(r'\[.*\]', result, re.DOTALL)
        if match:
            result = match.group()
        
        try:
            entities = json.loads(result)
        except json.JSONDecodeError:
            result = re.sub(r'"\s+"', '", "', result)
            result = re.sub(r',\s*]', ']', result)   
            try:
                entities = json.loads(result)
            except:
                logger.error(f"Failed to parse JSON: {result[:100]}")
                return []
        
        validated = []
        for e in entities:
            if isinstance(e, dict) and "text" in e and "label" in e:
                validated.append(e)
            elif isinstance(e, str):
                validated.append({"text": e, "label": "UNKNOWN"})
        
        return validated

    def _extract_single_batch(self, chunks: list[str]) -> list[dict]:
        try:
            response = requests.post(self.url, json={
                "model": self.model,
                "prompt": self._build_prompt(chunks),
                "stream": False,
                "format": "json"
            })
            return self._parse_response(response.json()["response"].strip())
        
        except Exception as e:
            logger.error(f"Error: {e}")
            return []
    
    def extract_entities_all(self, chunks: list[str], batch_size: int = 3) -> list[dict]:
        batches = [chunks[i:i+batch_size] for i in range(0, len(chunks), batch_size)]
        
        with ThreadPoolExecutor(max_workers=4) as executor:
            results = list(executor.map(self._extract_single_batch, batches))
        
        return [entity for batch_result in results for entity in batch_result]
   