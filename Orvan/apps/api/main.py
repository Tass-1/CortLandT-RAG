from fastapi import FastAPI, APIRouter
from routers.ingest import router as ingest_router
from routers.auth import router as auth_router
from routers.chat import router as chat_router
app = FastAPI()



@app.get("/home" , tags=['home'])
def read_root():
    return {"message" : "Hello bsdk"}

app.include_router(ingest_router)
app.include_router(auth_router)
app.include_router(chat_router)