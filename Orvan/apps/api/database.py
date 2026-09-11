from qdrant_client import QdrantClient
from .config import settings

def get_session():
    client = QdrantClient(
    url= settings.DB, 
    api_key= settings.API,
    )
    try:
        yield client
    finally:
        client.close()


