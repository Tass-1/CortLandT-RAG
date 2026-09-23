

from fastembed import SparseTextEmbedding
from qdrant_client import models, QdrantClient
from fastapi import APIRouter, Depends
from qdrant_client.http import model
from sqlalchemy import select
from generators import emSession, get_session, mongo, get_post
from google import genai
import motor.motor_asyncio
from dependencies import verify_jwt
from sqlalchemy.orm import Session
from schema.postgresql import Messages


sparse_model = SparseTextEmbedding(model_name="Qdrant/bm25")

router = APIRouter()

@router.post("/chat")
async def chat(session_id: str | None= None , prompt: str | None = None,  email: str = Depends(verify_jwt), gclient: genai.Client = Depends(emSession), qdrant: QdrantClient = Depends(get_session) , mongodb: motor.motor_asyncio.AsyncIOMotorClient = Depends(mongo) , postdb: Session = Depends(get_post)):
    if session_id:
        try:
            chats = await postdb.execute(select(Messages).where(Messages.sessionId == session_id).limit(6))
            res = chats.scalars().all()[::-1]
            vec = gclient.models.embed_content(
                            model = "gemini-embedding-2",
                            contents=prompt
                        )
            Densevector = vec.embeddings[0].values
            Sparsevector = list(sparse_model.embed(prompt))[0]
            qdrant.query_points(
                collection_name="Fin-Data",
                prefetch=[
                    models.Prefetch(
                        query=models.SparseVector(
                            indices=Sparsevector.indices.tolist(),
                            values=Sparsevector.values.tolist()),
                        using="sparse",
                        limit=20,
                    ),
                    models.Prefetch(
                        query=Densevector,  
                        using="dense",
                        limit=20,
                    ),
                ],
                query=models.RrfQuery(rrf=models.Rrf()),
                limit=10,
            )


        
    return "ok"
    