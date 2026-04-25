# import os
# import requests
# import json
# import logging
# import re
# from dotenv import load_dotenv

# load_dotenv()

# logger = logging.getLogger(__name__)

# class OpenRouterClient:
    
#     def __init__(self, model: str = "meta-llama/llama-3.1-8b-instruct:free"):
#         self.api_key = os.getenv("OPENROUTER_API_KEY")
#         self.model = model
#         self.url = "https://openrouter.ai/api/v1/chat/completions"
    
#     def generate(self, prompt: str) -> str:
#         try:
#             response = requests.post(
#                 self.url,
#                 headers={
#                     "Authorization": f"Bearer {self.api_key}",
#                     "Content-Type": "application/json"
#                 },
#                 json={
#                     "model": self.model,
#                     "messages": [{"role": "user", "content": prompt}]
#                 }
#             )
#             return response.json()["choices"][0]["message"]["content"]
#         except Exception as e:
#             logger.error(f"OpenRouter error: {e}")
#             return ""


import os
import requests
import json
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

class OpenRouterClient:
    
    def __init__(self, model: str = "minimax/minimax-m2.5:free"):
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.model = model
        self.url = "https://openrouter.ai/api/v1/chat/completions"
    
    def generate(self, prompt: str) -> str:
        # 1. نتأكد إن الـ API Key موجود أصلاً
        if not self.api_key:
            logger.error("🚨 OPENROUTER_API_KEY is missing! Please check your .env file.")
            return ""

        try:
            response = requests.post(
                self.url,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:8000", # OpenRouter بيحب الهيدر ده
                    "X-Title": "DocuMind"
                },
                json={
                    "model": self.model,
                    "messages": [{"role": "user", "content": prompt}]
                }
            )
            
            response_data = response.json()
            
            # 2. لو OpenRouter رجع Error (زي Rate Limit أو API مفيهوش رصيد)
            if "error" in response_data:
                logger.error(f"🚨 OpenRouter API Error: {response_data['error']}")
                return ""
                
            # 3. لو مفيش choices لأي سبب تاني
            if "choices" not in response_data:
                logger.error(f"🚨 Unexpected OpenRouter response: {response_data}")
                return ""
                
            return response_data["choices"][0]["message"]["content"]
            
        except Exception as e:
            logger.error(f"❌ OpenRouter request failed: {e}")
            return ""