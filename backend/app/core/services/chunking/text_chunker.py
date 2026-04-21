from langchain_text_splitters import RecursiveCharacterTextSplitter
import logging

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


class TextChunker:
    """ TextChunker class is responsible for splitting large text into smaller chunks using the RecursiveCharacterTextSplitter from the langchain library. 
    This is useful for processing large documents in manageable pieces, especially when generating embeddings or performing natural language processing tasks.
    """

    def chunk_text(self, text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> list:
        """
          Split the input text into smaller chunks based on the specified chunk size and overlap.
        """
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap
            )
        logger.info(f"Chunking text into chunks of size {chunk_size} with overlap {chunk_overlap}")
        logger.info(f"Text to chunk: {text[:50]}...")  # Log first 50 characters of the text
        return text_splitter.split_text(text)