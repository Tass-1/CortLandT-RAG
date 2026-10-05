#!/bin/bash
echo "Starting Celery Workers..."
uv run celery -A services.celery.celeryApp worker --loglevel=info -Q sec_queue &
uv run celery -A services.celeryt2.celeryT2 worker --loglevel=info -Q embed_queue &

echo "Starting FastAPI Server..."
uv run uvicorn main:app --host 0.0.0.0 --port $PORT