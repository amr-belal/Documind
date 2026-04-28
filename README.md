# Documind
DocuMind — Production-grade RAG pipeline that goes beyond naive retrieval. Features semantic chunking, hybrid search, query transformation, reranking, and real-time evaluation metrics.



source venv/bin/activate    

uvicorn main:app --reload



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


  cd backend
uvicorn main:app --reload

kafka :

python -m app.workers.consumer_runner

or 
(prefered)
PYTHONPATH=/Users/mac/Amrbelal/Documind/Documind/backend python -m app.workers.consumer_runner


```

Terminal 1 — Docker:

cd /Users/mac/Amrbelal/Documind/Documind
docker-compose up -d

Terminal 2 — FastAPI:

cd /Users/mac/Amrbelal/Documind/Documind/backend
source venv/bin/activate
uvicorn main:app --reload

Terminal 3 — Celery Worker:

cd /Users/mac/Amrbelal/Documind/Documind/backend
PYTHONPATH=/Users/mac/Amrbelal/Documind/Documind/backend celery -A app.workers.celery_app worker --loglevel=info

or 

(prefered)
export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES
celery -A app.workers.celery_app  worker --pool=threads --loglevel=info


Terminal 4 — Kafka Consumer:

cd /Users/mac/Amrbelal/Documind/Documind/backend
source venv/bin/activate
PYTHONPATH=/Users/mac/Amrbelal/Documind/Documind/backend python -m app.workers.consumer_runner



```


entity resolution feature 

246 entities → 62 entities ✅ (remove noise entites)

62 entities → 27 unique ✅ (exact match)

27 entities → 25 unique ✅ ( exact -> fuzzy match)


Metric,Score,Status,Interpretation
Faithfulness,1.00 / 1.00,✅ Passed,Zero hallucinations detected. The answer is 100% derived from the retrieved context.
Answer Relevancy,N/A,⚠️ Skipped,Pending Groq API 'n=1' limitation handling.


npm run dev