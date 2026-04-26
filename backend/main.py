
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator
from app.api.routes.contradiction import router as contradiction_router
from app.infrastructure.database.database import Database
from app.infrastructure.database.models import Base
from app.api.routes import upload, search



@asynccontextmanager
async def lifespan(app: FastAPI):
   
    async with Database().engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield
    

    await Database().engine.dispose()

app = FastAPI(
    title="DocuMind API",
    description="Document Ingestion and RAG Pipeline",
    version="1.0.0",
    lifespan=lifespan
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


Instrumentator().instrument(app).expose(app)

app.include_router(upload.router, prefix="/ingest", tags=["Documents"]) 
app.include_router(search.router, prefix="/search", tags=["Search"])
app.include_router(contradiction_router, prefix="/analysis")

@app.get("/")
async def root():
    return {"message": "Welcome to DocuMind API - Document Ingestion and RAG Pipeline"}