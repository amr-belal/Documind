import os
from celery import Celery
import config

celery_app = Celery(
    "file_processing",
    broker=config.CELERY_BROKER_URL,
    backend=config.CELERY_RESULT_BACKEND,
    include=["app.workers.document_tasks"]
)

celery_app.conf.broker_url = config.CELERY_BROKER_URL
celery_app.conf.result_backend = config.CELERY_RESULT_BACKEND

celery_app.autodiscover_tasks(['app.workers'])