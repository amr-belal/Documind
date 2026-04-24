import re
import logging

logger = logging.getLogger(__name__)

IMPORTANT_SECTIONS = [
    "abstract",
    # "introduction", 
    "conclusion",
    # "related work"
]
class SectionExtractor:
    
    def extract_important_sections(self, text: str) -> str:
        lines = text.split('\n')
        result = []
        current_section = None
        capture = False
        
        for line in lines:
            line_lower = line.lower().strip()
            
            # Check if line is a section header
            is_header = any(section in line_lower for section in IMPORTANT_SECTIONS)
            
            if is_header and len(line.strip()) < 50:
                current_section = line_lower
                capture = True
                result.append(line)
                continue
            
            # Stop capturing if new section starts
            if capture and re.match(r'^[0-9]+\.?\s+[A-Z]', line):
                if not any(s in line.lower() for s in IMPORTANT_SECTIONS):
                    capture = False
            
            if capture:
                result.append(line)
        
        extracted = '\n'.join(result)
        
        # لو مفيش sections اتلاقت — رجع الأول 2000 حرف بس
        if len(extracted) < 100:
            logger.warning("No important sections found, using first 2000 chars")
            return text[:2000]
        
        return extracted