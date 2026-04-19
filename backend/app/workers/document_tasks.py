from workers.celery_app import celery_app
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
@celery_app.task
def process_document(file_id:str , file_path:str , file_name:str):
    """  Celery task to process a document. This is where you would implement the logic to handle the document, such as extracting text, generating embeddings, etc."""
    logger.info(f"Processing document with ID: {file_id}, Path: {file_path}, Name: {file_name}")
    # Here you would add the actual processing logic, e.g., extracting text, generating embeddings, etc.
    # For demonstration, we'll just log the details.

    # Step 1: Download from MinIO
    # Step 2: Extract text
    # Step 3: Chunk
    # Step 4: NER
    # Step 5: Store in Qdrant + Neo4j
    
    pass