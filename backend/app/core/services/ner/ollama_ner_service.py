import requests
import json
import logging
import re

logger = logging.getLogger(__name__)

class OllamaNERService:
    
    def __init__(self, model: str = "llama3.2"):
        self.model = model
        self.url = "http://localhost:11434/api/generate"
    
    def extract_entities(self, text: str) -> list[dict]:
        prompt = f"""You are a scientific named entity recognition system.
Extract entities from the research text below.

Entity types:
- MODEL: ML/AI models (BERT, GPT-4, ColBERT, Matryoshka)
- DATASET: Datasets (WANDS, BEIR, MS MARCO)
- METRIC: Evaluation metrics (NDCG, MRR, Precision@k, F1)
- ALGORITHM: Algorithms and techniques (BM25, RRF, HNSW)
- CONCEPT: Key concepts (hybrid search, dense retrieval, embeddings)
- ORGANIZATION: Companies and labs (Qdrant, Jina AI, Google)
- AUTHOR: Person names (Kacper Łukawski)
- TASK: NLP/ML tasks (text classification, NER, retrieval)
- LIBRARY: Software libraries (PyTorch, HuggingFace, LangChain)
- PAPER: Research paper titles
- VENUE: Conferences and journals (ACL, NeurIPS, ICML)

Rules:
1. Return ONLY a valid JSON array
2. No explanation, no markdown, no extra text
3. Each item must have "text" and "label" keys
4. Skip numbers, dates, URLs, and code snippets

Text:
{text}

JSON:"""
        
        try:
            response = requests.post(self.url, json={
                "model": self.model,
                "prompt": prompt,
                "stream": False
            })
            
            result = response.json()["response"].strip()
            
            match = re.search(r'\[.*\]', result, re.DOTALL)
            if match:
                result = match.group()
            
            try:
                entities = json.loads(result)
            except json.JSONDecodeError:
                result = re.sub(r'"\s+"', '", "', result)
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
            
        except Exception as e:
            logger.error(f"Error extracting entities: {e}")
            return []