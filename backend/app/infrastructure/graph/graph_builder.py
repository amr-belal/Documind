from app.infrastructure.graph.neo4j_client import Neo4jClient


class GraphBuilder:

    def __init__(self):
        self.client = Neo4jClient()

    def get_entity_id(self, entity_name):
        with self.client.driver.session() as session:
            result = session.run(
                "MATCH (e:Entity {name: $name}) RETURN id(e) AS id",
                name=entity_name
            )
            record = result.single()
            return record["id"] if record else None

    def close(self):
        self.client.close()

    def add_paper(self, file_id: str, file_name: str):
        with self.client.driver.session() as session:
            session.run(
                "MERGE (p:Paper {id: $file_id}) SET p.name = $file_name",
                file_id=file_id,
                file_name=file_name
            )
    def add_entity(self, entity: dict):
        self.client.create_entity(entity["name"], {"label": entity.get("label", "")})

    def add_relationship(self, entity1_name: str, entity2_name: str, relationship_type: str):
        entity1_id = self.get_entity_id(entity1_name)
        entity2_id = self.get_entity_id(entity2_name)
        if entity1_id and entity2_id:
            self.client.create_relationship(entity1_id, entity2_id, relationship_type)

    def link_paper_to_entity(self, file_id: str, entity_name: str):
        with self.client.driver.session() as session:
            session.run(
                "MATCH (p:Paper {id: $file_id}) "
                "MATCH (e:Entity {name: $entity_name}) "
                "MERGE (p)-[:MENTIONS]->(e)",
                file_id=file_id,
                entity_name=entity_name
            )
    def add_claim(self, file_id: str, claim: dict):
        with self.client.driver.session() as session:
            session.run(
                "MATCH (p:Paper {id: $file_id}) "
                "MERGE (c:Claim {text: $claim_text}) "
                "SET c.type = $claim_type, c.about = $claim_about "
                "MERGE (p)-[:MAKES_CLAIM]->(c)",
                file_id=file_id,
                claim_text=claim["claim"],
                claim_type=claim.get("type", "UNKNOWN"),
                claim_about=claim.get("about", "")
            )
            
            # Link claim to entity
            if "about" in claim:
                session.run(
                    "MATCH (c:Claim {text: $claim_text}) "
                    "MATCH (e:Entity {name: $entity_name}) "
                    "MERGE (c)-[:ABOUT]->(e)",
                    claim_text=claim["claim"],
                    entity_name=claim["about"]
                )