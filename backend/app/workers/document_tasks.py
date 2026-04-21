from app.workers.celery_app import celery_app
from app.core.services.ingestion.document_service import DocumentService
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@celery_app.task
def process_document(file_id:str , file_path:str , file_name:str):
    """  Celery task to process a document. This is where you would implement the logic to handle the document, such as extracting text, generating embeddings, etc."""
    logger.info(f"Processing document with ID: {file_id}, Path: {file_path}, Name: {file_name}")

    document_service = DocumentService()
    # Here you would add the actual processing logic, e.g., extracting text, generating embeddings, etc.
    # For demonstration, we'll just log the details.

    # Step 1: Download from MinIO
    # Step 2: Extract text  
    # Step 3: Chunk
    # Step 4: NER
    # Step 5: Store in Qdrant + Neo4j

    
    #step 1,2: Download from MinIO and extract text
    try:
        file_content = document_service.download_file(file_path)
        logger.info(f"Successfully downloaded file content for {file_name}")
        text = document_service.extract_text(file_content)
        logger.info(f"Successfully extracted text for {file_name}")
    except Exception as e:
        logger.error(f"Error downloading file {file_name}: {e}")
        return
