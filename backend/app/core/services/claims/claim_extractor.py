import requests
import json
import logging
import re
from app.infrastructure.llm.openrouter_client import OpenRouterClient

logger = logging.getLogger(__name__)

class ClaimExtractor:
    
    def __init__(self, model: str = "qwen2.5:0.5b"):
        self.model = model
        self.url = "http://localhost:11434/api/generate"
    
    def extract_claims_batch(self, chunks: list[str], entities: list[dict]) -> list[dict]:
        entity_names = [e["text"] for e in entities]
        combined = "\n\n---\n\n".join(
            [f"Chunk {i+1}:\n{chunk}" for i, chunk in enumerate(chunks)]
        )
        
        prompt = f"""Read the text below and extract the main claims.
Focus on these entities: {entity_names}

Text:
{combined}

For each claim found, return:
- claim: the actual statement from the text
- about: the main subject  
- type: OUTPERFORMS, PROPOSES, USES, or EXTENDS

Return as JSON array only. If no claims found, return [].

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
                claims = json.loads(result)
            except json.JSONDecodeError:
                result = re.sub(r',\s*]', ']', result)
                result = re.sub(r',\s*}', '}', result)
                try:
                    claims = json.loads(result)
                except:
                    logger.error(f"Failed to parse claims JSON: {result[:100]}")
                    return []
            
            return [c for c in claims if isinstance(c, dict) and "claim" in c]
            
        except Exception as e:
            logger.error(f"Error extracting claims batch: {e}")
            return []
        

class OpenRouterClaimExtractor:
    
    def __init__(self):
        self.client = OpenRouterClient()
    
    def _parse(self, result: str) -> list[dict]:
        match = re.search(r'\[.*\]', result, re.DOTALL)
        if match:
            result = match.group()
        try:
            claims = json.loads(result)
        except json.JSONDecodeError:
            result = re.sub(r',\s*]', ']', result)
            result = re.sub(r',\s*}', '}', result)
            try:
                claims = json.loads(result)
            except:
                logger.error(f"Failed to parse claims: {result[:100]}")
                return []
        return [c for c in claims if isinstance(c, dict) and "claim" in c]

    def extract_claims_batch(self, chunks: list[str], entities: list[dict]) -> list[dict]:
        entity_names = [e["text"] for e in entities]
        combined = "\n\n---\n\n".join(
            [f"Chunk {i+1}:\n{chunk}" for i, chunk in enumerate(chunks)]
        )
        
        prompt = f"""Read the text below and extract the main claims.
Focus on these entities: {entity_names}

Text:
{combined}

For each claim found return:
- claim: the actual statement from the text
- about: the main subject
- type: OUTPERFORMS, PROPOSES, USES, or EXTENDS

Return as JSON array only. If no claims found return [].

JSON:"""
        
        result = self.client.generate(prompt)
        return self._parse(result)