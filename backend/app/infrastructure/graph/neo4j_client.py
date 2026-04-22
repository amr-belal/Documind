from neo4j import GraphDatabase
import config

class Neo4jClient:
    def __init__(self):
        self.driver = GraphDatabase.driver(
            config.NEO4J_URI,
            auth=(config.NEO4J_USER, config.NEO4J_PASSWORD)
        )
    def close(self):
        self.driver.close()

    def create_entity(self, entity_name, properties):
        with self.driver.session() as session:
            result = session.run(
                "MERGE (e:Entity {name: $name}) SET e.label = $label RETURN e",
                name=entity_name,
                label=properties.get("label")   
            )
            return result.single()[0]

    def create_relationship(self, entity1_id, entity2_id, relationship_type):
        with self.driver.session() as session:
            result = session.run(
                "MATCH (e1:Entity), (e2:Entity) "
                "WHERE id(e1) = $entity1_id AND id(e2) = $entity2_id "
                "CREATE (e1)-[r:%s]->(e2) RETURN r" % relationship_type,
                entity1_id=entity1_id,
                entity2_id=entity2_id
            )
            return result.single()[0]