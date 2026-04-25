import json
import logging
from app.infrastructure.graph.neo4j_client import Neo4jClient
from app.infrastructure.llm.groq_client import GroqClient 

logger = logging.getLogger(__name__)

class ContradictionDetector:
    def __init__(self):
        self.neo4j_client = Neo4jClient()
        self.llm_client = GroqClient() 

    def fetch_potential_pairs(self, limit: int = 20):
        
        query = """
        MATCH (p1:Paper)-[:MAKES_CLAIM]->(c1:Claim)-[:ABOUT]->(e:Entity)<-[:ABOUT]-(c2:Claim)<-[:MAKES_CLAIM]-(p2:Paper)
        WHERE elementId(p1) <> elementId(p2) AND elementId(c1) > elementId(c2)
        RETURN c1.text AS claim1, c2.text AS claim2, e.name AS entity, p1.name AS paper1, p2.name AS paper2
        LIMIT $limit
        """
        with self.neo4j_client.driver.session() as session:
            result = session.run(query, limit=limit)
            return [record.data() for record in result]

    def analyze_pair(self, claim1: str, claim2: str, entity: str) -> dict:
        
        prompt = f"""
        Analyze these two claims from different scientific papers about the entity '{entity}'.
        
        Claim 1: "{claim1}"
        Claim 2: "{claim2}"
        
        Classify the relationship between them into EXACTLY ONE of these categories:
        1. CONTRADICTION (They say opposite things)
        2. AGREEMENT (They support each other)
        3. UNRELATED (They talk about different aspects, no conflict)
        4. NOISE (One or both claims are garbage, nonsensical, or prompt leakage)
        
        Return ONLY a JSON object in this format, nothing else:
        {{"relationship": "CONTRADICTION", "reason": "brief explanation"}}
        """
        
        response = self.llm_client.generate(prompt)
        
        try:
            
            start_idx = response.find('{')
            end_idx = response.rfind('}') + 1
            if start_idx != -1 and end_idx != 0:
                clean_json = response[start_idx:end_idx]
                return json.loads(clean_json)
            return {"relationship": "ERROR", "reason": "Failed to parse JSON"}
        except Exception as e:
            logger.error(f"Failed to analyze pair: {e}")
            return {"relationship": "ERROR", "reason": str(e)}

    def save_relationship(self, claim1_text: str, claim2_text: str, relationship: str, reason: str):
        
        if relationship in ["NOISE", "ERROR", "UNRELATED"]:
            return

        query = """
        MATCH (c1:Claim {text: $claim1})
        MATCH (c2:Claim {text: $claim2})
        MERGE (c1)-[r:RELATES_TO {type: $rel_type}]->(c2)
        SET r.reason = $reason
        """
        with self.neo4j_client.driver.session() as session:
            session.run(query, claim1=claim1_text, claim2=claim2_text, rel_type=relationship, reason=reason)
            logger.info(f"Created {relationship} link between claims in Neo4j.")

    def run_detection_job(self):
        
        logger.info("🔍 Starting Contradiction Detection Job...")
        pairs = self.fetch_potential_pairs(limit=50)
        
        if not pairs:
            logger.info("No overlapping claims found.")
            return

        for pair in pairs:
            logger.info(f"Analyzing claims about: {pair['entity']}")
            analysis = self.analyze_pair(pair['claim1'], pair['claim2'], pair['entity'])
            
            logger.info(f"Result: {analysis.get('relationship')} - {analysis.get('reason')}")
            
            self.save_relationship(
                pair['claim1'], 
                pair['claim2'], 
                analysis.get('relationship', 'ERROR'), 
                analysis.get('reason', '')
            )
        logger.info("✅ Contradiction Detection Job Completed.")