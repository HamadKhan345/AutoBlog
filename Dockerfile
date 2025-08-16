FROM python:3.13.3-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# OS deps: keep postgresql-client for psql checks; avoid build-essential/libpq-dev because we use psycopg[binary]
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
    postgresql-client curl \
 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Collect static files at build time
RUN python manage.py collectstatic --noinput

# Make entrypoint executable and set it as ENTRYPOINT
RUN chmod +x ./entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]

EXPOSE 8000

# Default command uses Gunicorn + Uvicorn worker
CMD ["gunicorn", "-c", "gunicorn.conf.py", "AutoBlog.asgi:application"]
