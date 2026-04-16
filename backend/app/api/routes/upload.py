from backend.config import MINIO_BUCKET_NAME
from fastapi import APIRouter, File, UploadFile , HTTPException
from core.enums.source_type import SourceType
from core.services.ingestion.schemas import FileSchema
from core.services.ingestion.validator import ValidateFile
from core.services.ingestion.document_service import DocumentService
from infrastructure.storage.minio_client  import MinioClient

router = APIRouter()


minio_client = MinioClient()


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """ Endpoint to handle file uploads. Accepts a file and processes it for ingestion.
    """
    validator = ValidateFile(file)
    document_service = DocumentService()
    try:
        # Validate the uploaded file
        content = await file.read()
        extension = validator.validate()
        unique_filename = document_service.generate_unique_name(extension)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


    # Read the file content
    
    minio_client.upload_file(content, unique_filename)
    
    # Create a FileSchema instance with the uploaded file's details
    file_schema = FileSchema(
        file_type=extension,
        file_name=file.filename,
        file_size=len(content),
        hash=None,  # You can implement a hash function to compute the hash of the file content if needed
        source=SourceType.UPLOAD,
        file_path= f"minio://{MINIO_BUCKET_NAME}/{unique_filename}",
        user_id= "user_id_placeholder"  # In a real application, you would get this from the authenticated user context


    )
    
    # Here you would typically process the file_schema, e.g., save it to storage or pass it to an ingestion service.
    
    return {"message": "File uploaded successfully", "file_details": file_schema.model_dump()}