import os
from celery import Celery
import config

celery_app = Celery("file_processing")

celery_app.conf.broker_url = config.CELERY_BROKER_URL
celery_app.conf.result_backend = config.CELERY_RESULT_BACKEND

