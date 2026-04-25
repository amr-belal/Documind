import logging
from app.infrastructure.vector_store.qdrant_client import QdrantVectorStore
from app.core.services.embedding.embedding_service import EmbeddingService
from app.infrastructure.graph.neo4j_client import Neo4jClient
from app.infrastructure.llm.groq_client import GroqClient
from app.infrastructure.llm.openrouter_client import OpenRouterClient

logger = logging.getLogger(__name__)

class QueryService:

    def __init__(self):
        self.vector_store = QdrantVectorStore()
        self.embedding_service = EmbeddingService()
        self.neo4j_client = Neo4jClient()
        self.llm_client = GroqClient()

    def _get_vector_context(self  ,query: str, top_k: int = 4) -> str:

        logger.info("🔍 Searching Vector Store (Qdrant)...")
        try:
            query_vector = self.embedding_service.generate_embedding(query)
            results = self.vector_store.search_vectors("papers", query_vector, top_k)
            
            context = []
            for res in results:
                text = res.payload.get("chunk_text", "")
                paper_name = res.payload.get("file_name", "Unknown Paper")
                context.append(f"[Source: {paper_name}]\n{text}")
                
            return "\n\n---\n\n".join(context)
        except Exception as e:
            logger.error(f"Error in Vector Search: {e}")
            return ""
        
    def _get_graph_context(self, query: str) -> str:
        
        logger.info("🕸️ Searching Knowledge Graph (Neo4j)...")
        
       
        prompt = f"Extract 2-3 main keywords or entities from this query. Return ONLY a comma-separated list, no intro text. Query: {query}"
        keywords_str = self.llm_client.generate(prompt)
        keywords = [k.strip() for k in keywords_str.split(',') if k.strip()]
        
        graph_context = []
        try:
            with self.neo4j_client.driver.session() as session:
                for kw in keywords:
                    
                    cypher_query = """
                    MATCH (e:Entity)<-[:ABOUT]-(c:Claim)<-[:MAKES_CLAIM]-(p:Paper)
                    WHERE toLower(e.name) CONTAINS toLower($keyword)
                    RETURN p.name AS paper, c.text AS claim, c.type AS type
                    LIMIT 5
                    """
                    res = session.run(cypher_query, keyword=kw)
                    for record in res:
                        graph_context.append(f"[{record['paper']}] {record['type']}: {record['claim']}")
                        
            if not graph_context:
                return "No specific claims found in the graph."
                
            return "\n".join(graph_context)
        except Exception as e:
            logger.error(f"Error in Graph Search: {e}")
            return ""
    def answer_query(self, query: str) -> dict:
        
        logger.info(f"🧠 Processing User Query: '{query}'")
        
        vector_context = self._get_vector_context(query)
        
        
        graph_context = self._get_graph_context(query)
        
       
        logger.info("✍️ Generating final answer via LLM...")
        final_prompt = f"""
        You are an expert AI research assistant. Answer the user's query using ONLY the provided context.
        
        User Query: {query}
        
        ==== Vector Store Context (Text Chunks) ====
        {vector_context}
        
        ==== Knowledge Graph Context (Extracted Claims) ====
        {graph_context}
        
        Instructions:
        1. Answer thoroughly and synthesize the information.
        2. Explicitly cite the paper names provided in the context (e.g., "According to [Paper Name]...").
        3. If the context does not contain the answer, say "I don't have enough information based on the uploaded documents."
        """

        answer = self.llm_client.generate(final_prompt)
        
        return {
            "query": query,
            "answer": answer,
            "sources_used": {
                "graph_claims_found": len(graph_context.split('\n')) if "No specific claims" not in graph_context else 0,
                "vector_chunks_used": 4
            }
        }