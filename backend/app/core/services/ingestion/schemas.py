from pydantic import BaseModel , Field 
from typing import List
from datetime import datetime
import uuid
from app.core.enums.file_type import FileType
from app.core.enums.source_type import SourceType

class FileSchema(BaseModel):
    file_type :FileType = Field(..., description="Type of the file, e.g., 'pdf'")
    file_name :str = Field(..., description="Name of the file")
    file_size :int = Field(..., description="Size of the file in bytes")
    file_path :str = Field(..., description="Path where the file is stored on the server")
    file_id :str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique identifier for the file")
    upload_time :datetime = Field(default_factory=datetime.now, description="Timestamp when the file was uploaded")
    source :SourceType = Field(..., description="Source of the file, e.g., 'user_upload' or 'email_attachment'")
    metadata :dict = Field(default_factory=dict, description="Additional metadata about the file, e.g., {'author': 'John Doe', 'pages': 10}")
    hash :str = Field(default=None, description="Hash of md5 of the file content for integrity verification")
    user_id :str = Field(..., description="Identifier of the user who uploaded the file")
    
    