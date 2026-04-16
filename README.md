# Documind-
DocuMind — Production-grade RAG pipeline that goes beyond naive retrieval. Features semantic chunking, hybrid search, query transformation, reranking, and real-time evaluation metrics.



source venv/bin/activate    

```

backend/
  ├── .github/
  │   ├── workflows/ci.yml           ← CI Pipeline (Linting, Tests)
  │   └── PULL_REQUEST_TEMPLATE.md   ← PR Standards
  ├── api/
  │   ├── routes/
  │   │   └── upload.py              ← FastAPI Endpoint للـ Upload
  │   └── schemas/
  │       └── ingest.py              ← HTTP Request Schemas (Factory Pattern)
  ├── core/
  │   ├── enums/
  │   │   ├── file_type.py           ← PDF, TXT, etc.
  │   │   └── source_type.py         ← UPLOAD, ARXIV, URL
  │   └── services/
  │       ├── ingestion/
  │       │   ├── schemas.py         ← FileSchema (Business Logic Schema)
  │       │   ├── validator.py       ← Extension & Size Validation
  │       │   └── document_service.py← Unique Naming Logic
  │       ├── extraction/
  │       ├── graph_builder/
  │       └── contradiction/
  ├── infrastructure/
  │   ├── database/                  ← PostgreSQL clients
  │   ├── graph/                     ← Neo4j clients
  │   ├── llm/                       ← Ollama clients
  │   ├── messaging/                 ← Kafka producers/consumers
  │   ├── storage/                   ← MinIO clients
  │   ├── vector_store/              ← Qdrant clients
  │   └── airflow/                   ← DAGs
  ├── monitoring/
  ├── workers/                       ← Celery Tasks
  └── tests/
  

  ```