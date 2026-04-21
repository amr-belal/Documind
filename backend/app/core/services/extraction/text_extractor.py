import fitz  # PyMuPDF
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TextExtractor:
    """
    TextExtractor class is responsible for extracting text from various file formats. 
    Currently, it supports PDF files using the PyMuPDF library. 
    The class can be extended to support additional file formats in the future as needed.
    """

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
        