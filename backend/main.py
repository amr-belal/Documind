# from contextlib import asynccontextmanager
# from fastapi import FastAPI

# from prometheus_fastapi_instrumentator import Instrumentator

# from app.infrastructure.database.database import Database
# from app.infrastructure.database.models import Base


# from app.api.routes import upload , search



# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     Instrumentator().instrument(app).expose(app)

#     async with Database().engine.begin() as conn :
#         await conn.run_sync(Base.metadata.create_all)

#     yield
#     await Database().engine.dispose()

# app = FastAPI(
#     title="DocuMind API",
#     description="Document Ingestion and RAG Pipeline",
#     version="1.0.0",
#     lifespan=lifespan
# )
# Instrumentator().instrument(app).expose(app)
# @app.get("/")
# async def root():
#     return {"message": "DocuMind API is running"}

# app.include_router(upload.router, tags=["Documents"])
# app.include_router(search.router, tags=["Search"])

# @app.get("/")
# async def root():
#     return {"message": "Welcome to DocuMind API - Document Ingestion and RAG Pipeline"}


from contextlib import asynccontextmanager
from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator

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


Instrumentator().instrument(app).expose(app)


app.include_router(upload.router, tags=["Documents"])
app.include_router(search.router, tags=["Search"])

@app.get("/")
async def root():
    return {"message": "Welcome to DocuMind API - Document Ingestion and RAG Pipeline"}