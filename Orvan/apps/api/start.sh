#!/bin/bash
echo "Starting Celery Workers..."


uv run celery -A services.celery.celeryApp worker --loglevel=info -Q sec_queue --pool=solo &
uv run celery -A services.celeryt2.celeryT2 worker --loglevel=info -Q embed_queue --pool=solo &

echo "Starting FastAPI Server..."

uv run uvicorn main:app --host 0.0.0.0 --port $PORT --workers 1