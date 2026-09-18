@echo off
echo Starting SEC Fetching Worker (Queue: sec_queue)...
start cmd /k "celery -A services.celery.celeryApp worker --loglevel=info --pool=solo -Q sec_queue -n sec_worker@%%h"

echo Starting Embedding Worker (Queue: embed_queue)...
start cmd /k "celery -A services.celeryt2.celeryT2 worker --loglevel=info --pool=solo -Q embed_queue -n embed_worker@%%h"

echo Both workers have been launched in separate windows.