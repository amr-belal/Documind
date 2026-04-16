import os


MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_FILE_TYPES = ['pdf', 'docx', 'txt', 'xlsx']

MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "localhost:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ROOT_USER", "root")
MINIO_SECRET_KEY = os.getenv("MINIO_ROOT_PASSWORD", "password") 
MINIO_BUCKET_NAME = "papers"