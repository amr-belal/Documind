from pydantic import BaseModel, Field
from typing import Dict, Any

class SearchRequest(BaseModel):
    
    query: str = Field(..., description="The user's question about the documents")

class SearchResponse(BaseModel):
    query: str
    answer: str
    sources_used: Dict[str, Any]