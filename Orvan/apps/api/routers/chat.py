

from qdrant_client import models, QdrantClient
from fastapi import APIRouter, Depends
from qdrant_client.http import model
from generators import emSession, get_session, mongo, get_post
from google import genai
import motor.motor_asyncio
from dependencies import verify_jwt

router = APIRouter()

@router.post("/chat")
async def chat(email: str = Depends(verify_jwt)):
    return {"user":email}
    