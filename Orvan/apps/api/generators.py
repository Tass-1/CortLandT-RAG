import motor.motor_asyncio
from config import settings
from google import genai
from config import settings
from qdrant_client import QdrantClient
from config import settings
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from config import settings

engine = create_engine(settings.POSTGRES)
session = sessionmaker(autocommit=False, autoflush=False, bind=engine )
base = declarative_base()


gclient = genai.Client(api_key = settings.GEMINI)
def mongo():
    client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URI)
    try:
        yield client
    finally:
        client.close()

def emSession():
    yield gclient

def get_session():
    client = QdrantClient(
    url= settings.DB, 
    api_key= settings.API,
    )
    try:
        yield client
    finally:
        client.close()

def get_post():
    db = session()
    try:
        yield db
    finally:
        db.close()

