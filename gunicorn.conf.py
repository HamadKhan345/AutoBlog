import os

workers = int(os.getenv("GUNICORN_WORKERS", "1"))
worker_class = os.getenv("GUNICORN_WORKER_CLASS", "uvicorn.workers.UvicornWorker")
bind = os.getenv("GUNICORN_BIND", "0.0.0.0:8000")
