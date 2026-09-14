import motor.motor_asyncio
from config import settings

def mongo():
    client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URI)
    try:
        yield client
    finally:
        client.close()
