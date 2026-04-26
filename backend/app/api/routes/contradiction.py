from fastapi import APIRouter
from app.workers.document_tasks import analyze_contradictions_task

router = APIRouter()

@router.post("/analyze-contradictions")
async def analyze_contradictions():
    analyze_contradictions_task.delay()
    return {"message": "Contradiction analysis started in background"}