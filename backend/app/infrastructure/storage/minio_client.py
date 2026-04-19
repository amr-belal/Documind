import minio
from config import MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY, MINIO_BUCKET_NAME
import io

class MinioClient:
    def __init__(self):
        self.client = minio.Minio(
            MINIO_ENDPOINT,
            access_key=MINIO_ACCESS_KEY,
            secret_key=MINIO_SECRET_KEY,
            secure=False  # Set to True if using HTTPS
        )
        self._ensure_bucket_exists()

    def _ensure_bucket_exists(self):
        if not self.client.bucket_exists(MINIO_BUCKET_NAME):
            self.client.make_bucket(MINIO_BUCKET_NAME)

    def upload_file(self, file_content: bytes, object_name: str):
        data_stream = io.BytesIO(file_content)
        data_length = len(file_content)


        self.client.put_object(
            bucket_name=MINIO_BUCKET_NAME, 
            object_name=object_name, 
            data=data_stream, 
            length=data_length
        )

    def get_file_url(self, object_name: str) -> str:
        return self.client.presigned_get_object(MINIO_BUCKET_NAME, object_name)
    

    def download_file(self, object_name: str) -> bytes:
        response = self.client.get_object(MINIO_BUCKET_NAME, object_name)
        try:
            return response.read()
        finally:
            response.close()
            response.release_conn()