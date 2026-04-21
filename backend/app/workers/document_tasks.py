from app.workers.celery_app import celery_app
from app.core.services.ingestion.document_service import DocumentService
from app.core.services.extraction.text_extractor import TextExtractor
from app.core.services.chunking.text_chunker import TextChunker
from app.core.services.ner.ner_service import SpacyNERService, GlinerNERService
from app.infrastructure.cache.redis_client import RedisCache
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@celery_app.task
def process_document(file_id:str , file_path:str , file_name:str):
    """  Celery task to process a document. This is where you would implement the logic to handle the document, such as extracting text, generating embeddings, etc."""
    logger.info(f"Processing document with ID: {file_id}, Path: {file_path}, Name: {file_name}")

    document_service = DocumentService()
    text_extractor = TextExtractor()
    
    # Here you would add the actual processing logic, e.g., extracting text, generating embeddings, etc.
    # For demonstration, we'll just log the details.

    # Step 1: Download from MinIO
    # Step 2: Extract text  
    # Step 3: Chunk
    # Step 4: NER
    # Step 5: Store raw in Redis  
    # Step 6: Entity Resolution
    # Step 7: Store in Qdrant + Neo4j
    #Step 8: Delete in Redis

    
    #step 1,2: Download from MinIO and extract text
    try:
        file_content = document_service.download_file(file_path)
        logger.info(f"Successfully downloaded file content for {file_name}")
        text = text_extractor.extract_text(file_content)
        logger.info(f"Successfully extracted text for {file_name}")
    except Exception as e:
        logger.error(f"Error downloading file {file_name}: {e}")
        return
    
    # Step 3: Chunk the extracted text
    try:
        text_chunker = TextChunker()
        chunks = text_chunker.chunk_text(text)
        logger.info(f"Successfully chunked text for {file_name} into {len(chunks)} chunks")
    except Exception as e:
        logger.error(f"Error chunking text for {file_name}: {e}")
        return
    
    # Step 4: Perform NER on the chunks
    try:
        ner_service = SpacyNERService()
        all_entities = []
        logger.info(f"Starting NER on {len(chunks)} chunks")
        for chunk in chunks:
            entities = ner_service.extract_entities_spacy(chunk)
            logger.info(f"Chunk entities: {entities}")
            all_entities.extend(entities)
        logger.info(f"Successfully extracted entities for {file_name}, total entities: {len(all_entities)}")
    except Exception as e:
        logger.error(f"Error extracting entities for {file_name}: {e}", exc_info=True)
        return
    
    # Step 5: Combine chunks with their entities and store in Redis
    try:
        redis_cache = RedisCache()
        cache_key = redis_cache.combine_save_chunks_with_entities(chunks, all_entities)
        logger.info(f"Stored chunks and entities in Redis with key: {cache_key}")
    except Exception as e:
        logger.error(f"Error storing combined chunks and entities in Redis for {file_name}: {e}")
        return