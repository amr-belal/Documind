import spacy
import logging
from gliner2 import GLiNER2
import config

logger = logging.getLogger(__name__)


class SpacyNERService:
    """
    NERService uses spaCy to extract Named Entities from text chunks.
    This prepares the chunks for graph building and entity resolution.
    """

    def __init__(self , model_name :str = "en_core_web_sm"):
        """
        Initializes the NERService with a specified spaCy model.
        :param model_name: The name of the spaCy model to load (default is "en_core_web_sm").
        """
        try:
            self.nlp = spacy.load(model_name)
            logger.info(f"Loaded spaCy model: {model_name}")
        except Exception as e:
            logger.error(f"Error loading spaCy model '{model_name}': {e}")
            raise

    def extract_entities_spacy(self, text: str) -> list[dict]:
        """
        Extract entities from text.
        Returns a list of dictionaries containing the entity text and its label.
        """

        doc = self.nlp(text)
        entities = []

        
        
        for ent in doc.ents:
            if ent.label_ in config.USEFUL_LABELS:  # Ensure we don't include empty entities
                entities.append({
                        "text": ent.text.strip(),
                        "label": ent.label_  # e.g., ORG, PERSON, DATE, GPE
                    })
        return entities
    

class GlinerNERService:
    """
    NERService uses GLiNER2 to extract Named Entities from text chunks.
    This prepares the chunks for graph building and entity resolution.
    """

    def __init__(self):
        """
        Initializes the NERService with GLiNER2 model.
        """
        try:
            
            self.model = GLiNER2.from_pretrained("fastino/gliner2-base-v1")
    
            logger.info("Initialized GLiNER2 model")
        except Exception as e:
            logger.error(f"Error initializing GLiNER2 model: {e}")
            raise

    def extract_entities_gliner(self, text: str) -> list[dict]:
        """
        Extract entities from text using GLiNER2.
        Returns a list of dictionaries containing the entity text and its label.
        """

        labels = [
            "research method", "model", "dataset",
            "metric", "technology", "concept", "author"
        ]
        results = self.model.predict_entities(text, labels)
        return [{"text": e["text"], "label": e["label"]} for e in results]