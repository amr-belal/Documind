from config import MINIO_BUCKET_NAME
from fastapi import APIRouter, File, UploadFile , HTTPException , Depends 
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.enums.source_type import SourceType
from app.core.services.ingestion.schemas import FileSchema
from app.core.services.ingestion.validator import ValidateFile
from app.core.services.ingestion.document_service import DocumentService
from app.infrastructure.storage.minio_client  import MinioClient
from app.infrastructure.database.database import get_db
from app.infrastructure.database.models import FileRecord

router = APIRouter()


minio_client = MinioClient()


@router.post("/upload")
async def upload_file(file: UploadFile = File(...), session:AsyncSession = Depends(get_db)):
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
        hash="",  # You can implement a hash function to compute the hash of the file content if needed
        source=SourceType.UPLOAD,
        file_path= f"minio://{MINIO_BUCKET_NAME}/{unique_filename}",
        user_id= "user_id_placeholder"  # In a real application, you would get this from the authenticated user context


    )

    # Create a new FileRecord instance

    data_to_insert = file_schema.model_dump(exclude={"file_id", "hash", "upload_time"})
    
    new_record = FileRecord(**data_to_insert)

    session.add(new_record)
    await session.commit()
    await session.refresh(new_record)

    
    # Here you would typically process the file_schema, e.g., save it to storage or pass it to an ingestion service.
    
    return {
        "message": "File uploaded successfully", 
        "file_details": {
            "id": new_record.id,
            "file_name": new_record.file_name,
            "status": new_record.status,
            "file_path": new_record.file_path,
            "created_at": new_record.created_at
        }
    }