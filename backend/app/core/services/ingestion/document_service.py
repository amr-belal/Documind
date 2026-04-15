"""
Docstring for backend.app.core.services.ingestion.document_service

"""


import uuid

class DocumentService:
    """ Service class for handling document ingestion and processing.
    """
    
    def generate_unique_name(self ,extension: str) -> str:
        """ Generate a unique file name based on the original file name and a timestamp.
        """
        
        unique_name = f"{uuid.uuid4()}.{extension}"
        return unique_name
    