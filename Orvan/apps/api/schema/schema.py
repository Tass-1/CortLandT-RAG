
from qdrant_client import models, QdrantClient
from fastapi import Depends
from config import settings
def genrate_schema(qdrant: QdrantClient):
    
    if not qdrant.collection_exists("Fin-Data"):
        
        qdrant.create_collection(
            collection_name = "Fin-Data",
            vectors_config = {"dense": models.VectorParams(
                size = 3072,
                distance = models.Distance.COSINE
                )
            },
            sparse_vectors_config={
                "sparse": models.SparseVectorParams(
                    modifier=models.Modifier.IDF
                )
            }
        )
        qdrant.create_payload_index(
            collection_name="Fin-Data",
            field_name="ticker",
            field_schema=models.PayloadSchemaType.KEYWORD,
)

        print("Collection made")
        
    else:
        print("Colletion there moving ahead")
    
if __name__ == "__main__":
    qdrant = QdrantClient(
        url= settings.DB, 
        api_key= settings.API,
        )
    genrate_schema(qdrant)