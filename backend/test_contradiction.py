import logging
from app.core.services.contradiction.contradiction_service import ContradictionDetector

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

if __name__ == "__main__":
    print("🚀 Starting Contradiction Test...")
    detector = ContradictionDetector()
    detector.run_detection_job()