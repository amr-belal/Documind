from config import MINIO_BUCKET_NAME
from typing import List
from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.enums.source_type import SourceType
from app.core.services.ingestion.schemas import FileSchema
from app.core.services.ingestion.validator import ValidateFile
from app.core.services.ingestion.document_service import DocumentService
from app.infrastructure.storage.minio_client  import MinioClient
from app.infrastructure.database.database import get_db
from app.infrastructure.database.models import FileRecord
from app.infrastructure.messaging.kafka_producer import KafkaProducerClient
import hashlib
from sqlalchemy import select

router = APIRouter()


minio_client = MinioClient()
kafka_producer = KafkaProducerClient()

@router.post("/upload")
async def upload_file(
    files: List[UploadFile] = File(...),
    session: AsyncSession = Depends(get_db)
):
    results = []
    document_service = DocumentService()
    
    for file in files:
        validator = ValidateFile(file)
        try:
            content = await file.read()
           
            file_hash = hashlib.md5(content).hexdigest()

            
            query = select(FileRecord).where(FileRecord.hash == file_hash)
            existing_record = await session.execute(query)
            duplicate = existing_record.scalar_one_or_none()

            if duplicate:
               
                results.append({
                    "id": duplicate.id,
                    "file_name": duplicate.file_name,
                    "status": "cached", 
                    "file_path": duplicate.file_path,
                    "message": "File already processed. Retrieved from storage."
                })
                continue 

            extension = validator.validate()
            unique_filename = document_service.generate_unique_name(extension)

        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

        try:
            minio_client.upload_file(content, unique_filename)
        except Exception as e:
            raise HTTPException(status_code=500, detail="Failed to upload file")

        file_schema = FileSchema(
            file_type=extension,
            file_name=file.filename,
            file_size=len(content),
            hash=file_hash,
            source=SourceType.UPLOAD,
            file_path=f"minio://{MINIO_BUCKET_NAME}/{unique_filename}",
            user_id="user_id_placeholder"
        )

        data_to_insert = file_schema.model_dump(exclude={"file_id", "upload_time"})
        new_record = FileRecord(**data_to_insert)
        session.add(new_record)
        await session.commit()
        await session.refresh(new_record)

        try:
            kafka_producer.publish("raw_documents", {
                "file_id": new_record.id,
                "file_path": new_record.file_path,
                "file_name": new_record.file_name
            })
        except Exception as e:
            raise HTTPException(status_code=500, detail="Failed to publish to Kafka")

        results.append({
            "id": new_record.id,
            "file_name": new_record.file_name,
            "status": new_record.status,
            "file_path": new_record.file_path
        })

    
    return {
        "message": "File uploaded successfully", 
        "files": results
    }