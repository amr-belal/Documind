from fastapi import APIRouter, File, UploadFile
from api.schemas.ingest import UploadRequest, UrlRequest, ArxivRequest
from core.enums.source_type import SourceType
from core.services.ingestion.schemas import FileSchema


router = APIRouter()

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """ Endpoint to handle file uploads. Accepts a file and processes it for ingestion.
    """
    # Read the file content
    content = await file.read()
    
    # Create a FileSchema instance with the uploaded file's details
    file_schema = FileSchema(
        filename=file.filename,
        content=content,
        source_type=SourceType.UPLOAD
    )
    
    # Here you would typically process the file_schema, e.g., save it to storage or pass it to an ingestion service.
    
    return {"message": f"File '{file.filename}' uploaded successfully."}