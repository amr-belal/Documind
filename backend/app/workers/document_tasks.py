from app.workers.celery_app import celery_app
from app.core.services.ingestion.document_service import DocumentService
from app.core.services.extraction.text_extractor import TextExtractor
from app.core.services.chunking.text_chunker import TextChunker
from app.core.services.ner.ner_service import SpacyNERService, GlinerNERService
from app.core.services.ner.ollama_ner_service import OllamaNERService
from app.infrastructure.cache.redis_client import RedisCache
from app.core.services.ner.entity_resolver import EntityResolver
from app.infrastructure.vector_store.qdrant_client import QdrantVectorStore
from app.core.services.embedding.embedding_service import EmbeddingService
from app.infrastructure.graph.neo4j_client import Neo4jClient
from app.core.services.extraction.section_extractor import SectionExtractor
from app.infrastructure.graph.graph_builder import GraphBuilder
from app.core.services.claims.claim_extractor import ClaimExtractor
from qdrant_client.models import PointStruct
import logging
import uuid



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
    
    # Step 2b: Extract important sections only
    try:
        section_extractor = SectionExtractor()
        text = section_extractor.extract_important_sections(text)
        logger.info(f"Extracted important sections: {len(text)} chars")
    except Exception as e:
        logger.warning(f"Section extraction failed, using full text: {e}")
    
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
        ner_service = OllamaNERService()
        logger.info(f"Starting async NER on {len(chunks)} chunks")
        all_entities = ner_service.extract_entities_all(chunks, batch_size=4)
        logger.info(f"Total entities: {len(all_entities)}")
    except Exception as e:
        logger.error(f"Error in NER: {e}", exc_info=True)
        return
            
    # Step 5: Combine chunks with their entities and store in Redis
    try:
        redis_cache = RedisCache()
        cache_key = redis_cache.combine_save_chunks_with_entities(chunks, all_entities)
        logger.info(f"Stored chunks and entities in Redis with key: {cache_key}")
    except Exception as e:
        logger.error(f"Error storing combined chunks and entities in Redis for {file_name}: {e}")
        return
    
    # Step 6: Entity Resolution (this will be done in a separate task that retrieves the combined data from Redis using the cache key)
    try:
        entity_resolver = EntityResolver()
        resolved_entities = entity_resolver.resolve_entities(cache_key)
        logger.info(f"Successfully resolved entities for {file_name}, total resolved entities: {len(resolved_entities)}")
    except Exception as e:
        logger.error(f"Error resolving entities for {file_name}: {e}")
        return
    
    # step 7 : Generate embeddings and store in Qdrant

    try:
        embedding_service = EmbeddingService()
        qdrant_client = QdrantVectorStore()
        qdrant_client.create_collection("papers", vector_size=768)  # Assuming 768 is the vector size for the chosen embedding model

        points = []

        for i, chunk in enumerate(chunks):
            vector = embedding_service.generate_embedding(chunk)
            points.append(PointStruct(
                id=str(uuid.uuid4()),
                vector=vector,
                payload={
                    "chunk_text": chunk,
                    "file_id": file_id,
                    "file_name": file_name,
                    "chunk_index": i
                }
            ))
        qdrant_client.add_vectors("papers", points)
        logger.info(f"Successfully added {len(points)} vectors to Qdrant for {file_name}")
    except Exception as e:
        logger.error(f"Error generating embeddings or adding to Qdrant for {file_name}: {e}")
        return
    
    # Step 8: Delete from Redis
    try:
        redis_cache.delete(cache_key)
        logger.info(f"Deleted cache key {cache_key} from Redis")
    except Exception as e:
        logger.error(f"Error deleting cache key {cache_key}: {e}")
    
    # Step 9: Build Knowledge Graph
    try:
        graph_builder = GraphBuilder()
        graph_builder.add_paper(file_id, file_name)
        for entity in resolved_entities:
            graph_builder.add_entity({"name": entity["text"], "label": entity["label"]})
            graph_builder.link_paper_to_entity(file_id, entity["text"])
        # لا تعمل close() هنا
        logger.info(f"Built knowledge graph for {file_name}")
    except Exception as e:
        logger.error(f"Error building graph: {e}")
        return


    # Step 10: Claims
    try:
        claim_extractor = ClaimExtractor()
        all_claims = []
        batch_size = 4
        
        for i in range(0, len(chunks), batch_size):
            batch = chunks[i:i+batch_size]
            
            # Skip لو مفيش entities في الـ batch
            batch_entities = [
                e for e in all_entities 
                if any(e["text"].lower() in c.lower() for c in batch)
            ]
            if not batch_entities:
                continue
            
            claims = claim_extractor.extract_claims_batch(batch, batch_entities)
            all_claims.extend(claims)
        
        for claim in all_claims:
            graph_builder.add_claim(file_id, claim)
        
        logger.info(f"Stored {len(all_claims)} claims in Neo4j")
    except Exception as e:
        logger.error(f"Error extracting/storing claims: {e}")
    finally:
        graph_builder.close()