from qdrant_client import QdrantClient, models
from database import get_session
from embedder import emSession
from google import genai
from fastapi import APIRouter, Depends
import httpx
from services.celery import fetch_file
router = APIRouter()



@router.post("/ingest")
async def ingestion(ticker: str, qdrant: QdrantClient = Depends(get_session) , gclient: genai.Client = Depends(emSession)):
    g = gclient.models.embed_content(
        model = "gemini-embedding-2",
        contents=ticker
    )
    result = qdrant.query_points(
        collection_name="Fin-Data",
        query = g.embeddings[0].values,
        query_filter=models.Filter(
            must=[
                models.FieldCondition(
                    key = "ticker",
                    match= models.MatchValue(
                        value = ticker
                    )
                )
            ]
        )
    )
    if result.points:
        #send to chat
        print(result)
        print("There is teh ticker")
    else:
        fetch_file.delay(ticker)
        return {"tick" : 'f{ticker}'}
