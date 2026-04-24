import requests
import json
import logging
import re

logger = logging.getLogger(__name__)

class ClaimExtractor:
    
    def __init__(self, model: str = "qwen2.5:0.5b"):
        self.model = model
        self.url = "http://localhost:11434/api/generate"
    
    def extract_claims(self, chunk: str, entities: list[dict]) -> list[dict]:
        entity_names = [e["text"] for e in entities]
        
        prompt = f"""Extract key claims from this research text.
Focus on these entities: {entity_names}

A claim is a statement the authors make.
Return ONLY a JSON array:
[{{"claim": "X outperforms Y", "about": "entity name", "type": "OUTPERFORMS/PROPOSES/CONTRADICTS/EXTENDS/USES"}}]

Text:
{chunk}

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
            logger.error(f"Error extracting claims: {e}")
            return []
        
    