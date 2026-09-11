from qdrant_client import QdrantClient
from database import get_session
from embedder import emSession
from fastapi import APIRouter, Depends

router = APIRouter()



@router.post("/ingest")
def ingestion(ticker: str, qdrant: QdrantClient = Depends(get_session) , gclient= Depends(emSession)):
    return {"tick" : 'f{ticker}'}
