from qdrant_client import QdrantClient, models
from generators import get_session , emSession

from google import genai
from fastapi import APIRouter, Depends
import httpx
from services.celery import fetch_file
router = APIRouter()



@router.post("/ingest")
async def ingestion(ticker: str, qdrant: QdrantClient = Depends(get_session) , gclient: genai.Client = Depends(emSession)):
    result , off = qdrant.scroll(
            collection_name="Fin-Data",
            scroll_filter=models.Filter(
                must=[
                    models.FieldCondition(key="ticker", match=models.MatchValue(value=ticker.upper())),
                ]
            ),
            limit=1,
            with_payload=True,
            with_vectors=False,
    )
    if result:
        #send to chat
        print(result)
        print("There is teh ticker")
        return {
            "status": "exists", 
            "ticker": ticker.upper(), 
            "message": "Data already present in vector store."
        }
    else:
        fetch_file.delay(ticker.upper())
        return {
            "status": "processing", 
            "ticker": ticker.upper(), 
            "message": "Ingestion task dispatched to Celery."
        }
