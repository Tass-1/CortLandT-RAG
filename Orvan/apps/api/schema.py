from .database import get_session
from qdrant import models, QdrantClient
from fastapi import Depends
def genrate_schema(qdrant: QdrantClient=Depends(get_session)):
    qdrant.create_collection(
        collection_name
    )