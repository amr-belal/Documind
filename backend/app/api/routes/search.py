from fastapi import APIRouter, HTTPException
from app.api.schemas.search import SearchRequest, SearchResponse
from app.core.rag.query_service import QueryService
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

query_service = QueryService()

@router.post("/search", response_model=SearchResponse)
async def search_documents(request: SearchRequest):
    logger.info(f"Received search request: {request.query}")
    try:
        result = query_service.answer_query(request.query)
        return SearchResponse(**result)
    except Exception as e:
        logger.error(f"Search endpoint error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="An error occurred while processing your search query.")
    