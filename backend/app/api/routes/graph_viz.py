from fastapi import APIRouter
from app.infrastructure.graph.neo4j_client import Neo4jClient

router = APIRouter()
neo4j_client = Neo4jClient()

@router.get("/data")
async def get_graph_data():
    query = """
    MATCH (n)-[r]->(m)
    RETURN n, r, m LIMIT 550
    """
    with neo4j_client.driver.session() as session:
        result = session.run(query)
        nodes = {}
        links = []
        
        for record in result:
            source = record['n']
            target = record['m']
            rel = record['r']
            
            
            for node in [source, target]:
                node_id = node.element_id
                if node_id not in nodes:
                    nodes[node_id] = {
                        "id": node_id,
                        "label": list(node.labels)[0],
                        "name": node.get('name') or node.get('text') or node.get('id', 'Unknown')
                    }
            
          
            links.append({
                "source": source.element_id,
                "target": target.element_id,
                "type": rel.type
            })
            
    return {"nodes": list(nodes.values()), "links": links}