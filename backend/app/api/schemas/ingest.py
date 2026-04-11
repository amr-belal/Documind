"""
Schemas for ingesting data from various sources.
"""

from pydantic import BaseModel
from core.enums.source_type import SourceType

class BaseIngestRequest(BaseModel):
    source :  SourceType

class UploadRequest(BaseIngestRequest):
    # file_name : str
    # file_size : int
    # YAGNI — You Aren't Gonna Need It — let's just accept the file directly 
    pass 

class UrlRequest(BaseIngestRequest):
    url: str
    
class ArxivRequest(BaseIngestRequest):
    arxiv_id: str