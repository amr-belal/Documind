"""
Document Service Module 
This module contains the DocumentService class which provides functionalities for handling document ingestion and processing. It includes methods for generating unique file names, downloading files from a given URL, and extracting text from file content. The service is designed to work with various file types and can be extended to support additional formats as needed.
"""


import uuid
import fitz  # PyMuPDF
from app.infrastructure.storage.minio_client import MinioClient
import logging

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

class DocumentService:
    """ Service class for handling document ingestion and processing.
    """
    
    def generate_unique_name(self ,extension: str) -> str:
        """ Generate a unique file name based on the original file name and a timestamp.
        """
        
        unique_name = f"{uuid.uuid4()}.{extension}"
        return unique_name
    
    def download_file(self, url: str) -> bytes:
        """ Download a file from the given URL and return its content as bytes.
        """
        minio_client = MinioClient()
        # Implement the logic to download the file from the URL
        # You can use libraries like requests or aiohttp for this purpose
        try:
            object_name = url.split("/")[-1]
            logger.info(f"Downloading file from MinIO: {object_name}")
            return minio_client.download_file(object_name)
            
        except Exception as e:
            logger.error(f"Error occurred while downloading file: {e}")
            return b""

    def extract_text(self, file_content: bytes) -> str:
        """ Extract text from the given file content.
        """
        
        try:
            doc = fitz.open(stream=file_content, filetype="pdf")
            text = ""
            for page in doc:
                text += page.get_text()
            return text
        except Exception as e:
            logger.error(f"Error occurred while extracting text: {e}")
            return ""
        