# DocuMind

Production-grade Retrieval-Augmented Generation pipeline built for deep document intelligence. DocuMind goes beyond naive retrieval by combining semantic chunking, hybrid vector and graph search, named entity recognition, entity resolution, knowledge graph construction, claim extraction, and automated contradiction detection — all wired through an event-driven async architecture.

---

## Architecture Overview

```
Frontend (React + TypeScript)
        |
        | HTTP
        v
FastAPI Backend
  /ingest/upload   /search/search   /analysis/analyze-contradictions   /graph/data
        |                |
        v                v
      Kafka          Query Service
  raw_documents    Qdrant + Neo4j + Groq LLM
        |
        v
  Celery Workers
    1. Download PDF from MinIO
    2. Extract text (PyMuPDF)
    3. Section extraction (Abstract, Conclusion)
    4. Chunking (LangChain RecursiveCharacterTextSplitter)
    5. NER (Ollama / Groq / OpenRouter)
    6. Entity resolution (exact match + fuzzy match via RapidFuzz)
    7. Embeddings -> Qdrant vector store
    8. Knowledge graph -> Neo4j
    9. Claim extraction -> Neo4j
   10. Contradiction detection (LLM-based, cross-paper)
        |
        v
Infrastructure
  MinIO | PostgreSQL | Redis | Qdrant | Neo4j | Kafka | Prometheus | Grafana
```

---

## Features

- **Semantic chunking** with configurable size and overlap
- **Multi-provider NER**: Ollama (local), Groq, OpenRouter, spaCy, GLiNER2
- **Entity resolution**: exact deduplication followed by fuzzy matching (RapidFuzz, threshold 85)
- **Knowledge graph**: Neo4j stores Papers, Entities, and Claims with typed relationships
- **Hybrid RAG query**: vector search (Qdrant) + graph claim retrieval (Neo4j) fused before LLM generation
- **Contradiction detection**: cross-paper claim comparison via LLM, stored as graph relationships
- **Deduplication**: MD5 hash check on upload prevents reprocessing identical files
- **Evaluation**: RAGAS faithfulness metric (score: 1.00 on test set)
- **Observability**: Prometheus metrics exposed via FastAPI instrumentator, Grafana dashboards
- **Event-driven**: Kafka decouples upload from processing; Celery handles async worker tasks

---

## Tech Stack

| Layer | Technology |
|---|---|
| API | FastAPI, Uvicorn |
| Task queue | Celery, Redis |
| Message broker | Apache Kafka, Zookeeper |
| Object storage | MinIO |
| Relational DB | PostgreSQL, SQLAlchemy (async), Alembic |
| Vector store | Qdrant |
| Graph DB | Neo4j |
| Cache | Redis |
| Embeddings | Ollama (nomic-embed-text), BGE-small, MiniLM |
| LLM inference | Groq (llama-3.1-8b-instant), OpenRouter, Ollama |
| NER | spaCy, GLiNER2, Ollama, Groq, OpenRouter |
| PDF extraction | PyMuPDF (fitz) |
| Text splitting | LangChain RecursiveCharacterTextSplitter |
| Fuzzy matching | RapidFuzz |
| Monitoring | Prometheus, Grafana |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, react-force-graph-2d |
| Containerization | Docker, Docker Compose |
| CI | GitHub Actions |

---

## Prerequisites

- Docker and Docker Compose
- Python 3.11 or 3.12
- Node.js 18 or later
- Ollama (for local LLM and embedding inference)

---

## Environment Variables

Copy `.env.example` to `.env` in the project root and fill in the values:

```env
POSTGRES_USER=root
POSTGRES_PASSWORD=root
POSTGRES_DB=documind

MINIO_ROOT_USER=root
MINIO_ROOT_PASSWORD=password

NEO4J_PASSWORD=password

GROQ_API_KEY=your_groq_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
```

---

## Running the Project

### Step 1 — Start infrastructure (all platforms)

```bash
docker compose up -d
```

This starts: PostgreSQL, MinIO, Kafka, Zookeeper, Redis, Neo4j, Qdrant, Prometheus, Grafana, pgAdmin.

---

### Step 2 — Backend setup

#### macOS / Linux

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

#### Windows

```cmd
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

---

### Step 3 — Pull Ollama models

```bash
ollama pull nomic-embed-text
ollama pull qwen2.5:1.5b
```

---

### Step 4 — Run database migrations

```bash
# from project root (not inside backend/)
alembic upgrade head
```

---

### Step 5 — Start FastAPI (Terminal 1)

#### macOS / Linux

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

#### Windows

```cmd
cd backend
venv\Scripts\activate
uvicorn main:app --reload
```

API available at: http://localhost:8000  
Interactive docs: http://localhost:8000/docs

---

### Step 6 — Start Celery worker (Terminal 2)

#### macOS

```bash
cd backend
source venv/bin/activate
export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES
celery -A app.workers.celery_app worker --pool=threads --loglevel=info
```

#### Linux

```bash
cd backend
source venv/bin/activate
celery -A app.workers.celery_app worker --loglevel=info
```

#### Windows

```cmd
cd backend
venv\Scripts\activate
celery -A app.workers.celery_app worker --pool=threads --loglevel=info
```

---

### Step 7 — Start Kafka consumer (Terminal 3)

#### macOS / Linux

```bash
cd backend
source venv/bin/activate
PYTHONPATH=/absolute/path/to/project/backend python -m app.workers.consumer_runner
```

#### Windows

```cmd
cd backend
venv\Scripts\activate
set PYTHONPATH=C:\absolute\path\to\project\backend
python -m app.workers.consumer_runner
```

---

### Step 8 — Start frontend (Terminal 4)

```bash
cd frontend
npm install
npm run dev
```

Frontend available at: http://localhost:5173

---

## Service URLs

| Service | URL |
|---|---|
| FastAPI | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| Frontend | http://localhost:5173 |
| MinIO Console | http://localhost:9001 |
| Neo4j Browser | http://localhost:7474 |
| Qdrant Dashboard | http://localhost:6333/dashboard |
| Grafana | http://localhost:3000 (admin / admin) |
| Prometheus | http://localhost:9090 |
| pgAdmin | http://localhost:5050 |

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /ingest/upload | Upload one or more PDF files |
| GET | /ingest/files | List all ingested files |
| POST | /search/search | RAG query over ingested documents |
| POST | /analysis/analyze-contradictions | Trigger async contradiction detection |
| GET | /graph/data | Retrieve graph nodes and edges for visualization |
| GET | /metrics | Prometheus metrics |

---

## Document Processing Pipeline (detail)

1. **Upload**: file is validated (extension, size), hashed (MD5), stored in MinIO, recorded in PostgreSQL, published to Kafka topic `raw_documents`.
2. **Consume**: Kafka consumer receives the message and dispatches a Celery task.
3. **Extract**: PyMuPDF pulls raw text; SectionExtractor isolates Abstract and Conclusion.
4. **Chunk**: LangChain splits text into 1000-character chunks with 200-character overlap.
5. **NER**: Ollama (qwen2.5) processes chunks in parallel batches using ThreadPoolExecutor. Returns typed entities: MODEL, DATASET, METRIC, ALGORITHM, CONCEPT, ORGANIZATION, AUTHOR, TASK, LIBRARY, PAPER, VENUE.
6. **Entity resolution**: exact lowercase match, then RapidFuzz ratio >= 85 deduplication. Result: significant reduction in entity noise (example: 246 raw -> 62 filtered -> 25 unique).
7. **Embeddings**: nomic-embed-text via Ollama generates 768-dimensional vectors; stored in Qdrant collection `papers`.
8. **Graph**: Neo4j receives Paper nodes, Entity nodes, MENTIONS relationships, and Claim nodes with MAKES_CLAIM relationships.
9. **Claims**: LLM extracts structured claims (text, about, type: OUTPERFORMS / PROPOSES / USES / EXTENDS) from chunks.
10. **Contradiction detection**: cross-paper claim pairs sharing the same `about` field are analyzed by Groq LLM and classified as CONTRADICTION, AGREEMENT, UNRELATED, or NOISE. Results stored as RELATES_TO edges in Neo4j.

---

## RAG Query Flow

1. User query is embedded with nomic-embed-text.
2. Qdrant returns top-4 closest chunks.
3. LLM extracts 2-3 keywords from the query.
4. Neo4j returns claims matching those keywords.
5. Both contexts are fused into a single prompt sent to Groq (llama-3.1-8b-instant).
6. Response is returned with source metadata.

---

## Evaluation

RAGAS evaluation run on a sample set:

| Metric | Score | Notes |
|---|---|---|
| Faithfulness | 1.00 / 1.00 | Zero hallucinations detected |
| Answer Relevancy | Skipped | Groq n=1 limitation pending |

---

## Project Structure

```
.documind/
    ├── README.md
    ├── alembic.ini
    ├── docker-compose.yml
    ├── hints.md
    ├── LICENSE
    ├── .env.example
    ├── alembic/
    │   ├── README
    │   ├── env.py
    │   └── script.py.mako
    ├── backend/
    │   ├── config.py
    │   ├── Dockerfile
    │   ├── main.py
    │   ├── requirements.txt
    │   ├── test_contradiction.py
    │   ├── app/
    │   │   ├── api/
    │   │   │   ├── __init__.py
    │   │   │   ├── routes/
    │   │   │   │   ├── __init__.py
    │   │   │   │   ├── contradiction.py
    │   │   │   │   ├── graph_viz.py
    │   │   │   │   ├── search.py
    │   │   │   │   └── upload.py
    │   │   │   └── schemas/
    │   │   │       ├── __init__.py
    │   │   │       ├── ingest.py
    │   │   │       └── search.py
    │   │   ├── core/
    │   │   │   ├── __init__.py
    │   │   │   ├── enums/
    │   │   │   │   ├── __init__.py
    │   │   │   │   ├── file_type.py
    │   │   │   │   └── source_type.py
    │   │   │   ├── rag/
    │   │   │   │   ├── __init__.py
    │   │   │   │   └── query_service.py
    │   │   │   └── services/
    │   │   │       ├── __init__.py
    │   │   │       ├── chunking/
    │   │   │       │   ├── __init__.py
    │   │   │       │   └── text_chunker.py
    │   │   │       ├── claims/
    │   │   │       │   ├── __init__.py
    │   │   │       │   └── claim_extractor.py
    │   │   │       ├── contradiction/
    │   │   │       │   ├── __init__.py
    │   │   │       │   └── contradiction_service.py
    │   │   │       ├── embedding/
    │   │   │       │   ├── __init__.py
    │   │   │       │   ├── BaseEmbedder.py
    │   │   │       │   ├── bge_embeder.py
    │   │   │       │   ├── embedder_factory.py
    │   │   │       │   ├── embedding_service.py
    │   │   │       │   ├── miniLm_embedder.py
    │   │   │       │   └── ollama_embedder.py
    │   │   │       ├── extraction/
    │   │   │       │   ├── __init__.py
    │   │   │       │   ├── section_extractor.py
    │   │   │       │   └── text_extractor.py
    │   │   │       ├── graph_builder/
    │   │   │       │   └── __init__.py
    │   │   │       ├── ingestion/
    │   │   │       │   ├── __init__.py
    │   │   │       │   ├── document_service.py
    │   │   │       │   ├── schemas.py
    │   │   │       │   └── validator.py
    │   │   │       └── ner/
    │   │   │           ├── __init__.py
    │   │   │           ├── entity_resolver.py
    │   │   │           ├── ner_service.py
    │   │   │           └── ollama_ner_service.py
    │   │   ├── infrastructure/
    │   │   │   ├── __init__.py
    │   │   │   ├── airflow/
    │   │   │   │   └── __init__.py
    │   │   │   ├── cache/
    │   │   │   │   ├── __init__.py
    │   │   │   │   └── redis_client.py
    │   │   │   ├── database/
    │   │   │   │   ├── __init__.py
    │   │   │   │   ├── database.py
    │   │   │   │   └── models.py
    │   │   │   ├── graph/
    │   │   │   │   ├── __init__.py
    │   │   │   │   ├── graph_builder.py
    │   │   │   │   └── neo4j_client.py
    │   │   │   ├── llm/
    │   │   │   │   ├── __init__.py
    │   │   │   │   ├── groq_client.py
    │   │   │   │   └── openrouter_client.py
    │   │   │   ├── messaging/
    │   │   │   │   ├── __init__.py
    │   │   │   │   ├── kafka_consumer.py
    │   │   │   │   └── kafka_producer.py
    │   │   │   ├── storage/
    │   │   │   │   ├── __init__.py
    │   │   │   │   └── minio_client.py
    │   │   │   └── vector_store/
    │   │   │       ├── __init__.py
    │   │   │       └── qdrant_client.py
    │   │   ├── tests/
    │   │   │   └── __init__.py
    │   │   └── workers/
    │   │       ├── __init__.py
    │   │       ├── celery_app.py
    │   │       ├── consumer_runner.py
    │   │       └── document_tasks.py
    │   ├── evaluation/
    │   │   ├── __init__.py
    │   │   └── run_eval.py
    │   └── monitoring/
    │       ├── __init__.py
    │       ├── grafana/
    │       │   └── __init__.py
    │       └── prometheus/
    │           └── prometheus.yml
    ├── frontend/
    │   ├── README.md
    │   ├── eslint.config.js
    │   ├── index.html
    │   ├── package.json
    │   ├── postcss.config.js
    │   ├── tailwind.config.js
    │   ├── tsconfig.app.json
    │   ├── tsconfig.json
    │   ├── tsconfig.node.json
    │   ├── vite.config.ts
    │   └── src/
    │       ├── App.css
    │       ├── App.tsx
    │       ├── index.css
    │       ├── main.tsx
    │       ├── api/
    │       │   └── axios.ts
    │       └── components/
    │           ├── GraphView.tsx
    │           └── Sidebar.tsx
    ├── monitoring/
    │   └── prometheus/
    │       └── prometheus.yml
    └── .github/
        └── workflows/
            └── ci.yml

```
## Archeticture
```

┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React/TS)                     │
│  ┌──────────┐  ┌─────────────┐  ┌──────────────────────────┐   │
│  │ Sidebar  │  │ Chat Agent  │  │ Knowledge Graph Viewer   │   │
│  │ Upload   │  │ RAG Query   │  │ (Neo4j Visualization)    │   │
│  └──────────┘  └─────────────┘  └──────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTP
┌─────────────────────────▼───────────────────────────────────────┐
│                      FASTAPI (Backend)                          │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────────┐  │
│  │ /upload    │  │ /search    │  │ /analyze-contradictions  │  │
│  │ /files     │  │ (RAG)      │  │ /arxiv (missing!)        │  │
│  └─────┬──────┘  └─────┬──────┘  └──────────────────────────┘  │
└────────┼───────────────┼─────────────────────────────────────────┘
         │               │
         ▼               ▼
┌────────────────┐  ┌──────────────────────────────────────────┐
│     KAFKA      │  │           QUERY SERVICE                  │
│  raw_documents │  │  Qdrant Search + Neo4j Graph + Groq LLM  │
└───────┬────────┘  └──────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────────┐
│                    CELERY WORKERS                             │
│                                                               │
│  process_document task:                                       │
│  1. Download PDF (MinIO)                                      │
│  2. Extract Text (PyMuPDF)                                    │
│  3. Section Extraction                                        │
│  4. Chunking (LangChain)                                      │
│  5. NER (Ollama/Groq/OpenRouter)                              │
│  6. Entity Resolution (Exact + Fuzzy)                         │
│  7. Embeddings → Qdrant                                       │
│  8. Knowledge Graph → Neo4j                                   │
│  9. Claim Extraction → Neo4j                                  │
│                                                               │
│  analyze_contradictions task:                                 │
│  1. Fetch claim pairs (Neo4j)                                 │
│  2. LLM Analysis (Groq)                                       │
│  3. Store CONTRADICTION/AGREEMENT (Neo4j)                     │
└───────────────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────────┐
│                      INFRASTRUCTURE                           │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐  │
│  │ MinIO    │  │ Postgres │  │  Redis   │  │   Qdrant    │  │
│  │ PDF Store│  │ Metadata │  │  Cache   │  │  Vectors    │  │
│  └──────────┘  └──────────┘  └──────────┘  └─────────────┘  │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────────┐   │
│  │  Neo4j   │  │Zookeeper │  │    Prometheus + Grafana   │   │
│  │  Graph   │  │  +Kafka  │  │       Monitoring          │   │
│  └──────────┘  └──────────┘  └──────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘

```
---

## License

MIT License. See [LICENSE](LICENSE) for details.