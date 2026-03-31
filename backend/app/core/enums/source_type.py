from enum import Enum


class SourceType(str, Enum):
    UPLOAD = "upload"
    ARXIV = "arxiv"
    URL = "url"

