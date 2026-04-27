import uuid
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, DateTime, func, Enum as SQLEnum ,Text
from app. core.enums.source_type import SourceType
from app.core.enums.file_type import FileType
import enum

Base = declarative_base()

class DocumentStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"



class BaseModel(Base):
    __abstract__ = True
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class FileRecord(BaseModel):
    __tablename__ = 'file_records'

    file_name = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    file_path = Column(String, nullable=False)
    user_id = Column(String, nullable=False)
    
    
    file_type = Column(SQLEnum(FileType), nullable=False)
    source = Column(SQLEnum(SourceType), nullable=False)
    status = Column(SQLEnum(DocumentStatus), nullable=False, default=DocumentStatus.PENDING)

    hash = Column(String, index=True, nullable=True) 
    
