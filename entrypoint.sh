#!/bin/sh
set -e

MAX_ATTEMPTS=${DB_WAIT_ATTEMPTS:-60}
ATTEMPT=1

if [ -n "$DATABASE_HOST" ]; then
  until PGPASSWORD="$DATABASE_PASSWORD" psql -h "$DATABASE_HOST" -U "$DATABASE_USER" -c '\q' >/dev/null 2>&1; do
    echo "Waiting for Postgres at $DATABASE_HOST... (attempt $ATTEMPT/$MAX_ATTEMPTS)"
    ATTEMPT=$((ATTEMPT+1))
    if [ "$ATTEMPT" -gt "$MAX_ATTEMPTS" ]; then
      echo "Postgres did not become available in time, exiting."
      exit 1
    fi
    sleep 1
  done
fi

python manage.py migrate --noinput
python manage.py collectstatic --noinput

exec "$@"
