from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from routers.ingest import router as ingest_router
from routers.auth import router as auth_router
from routers.chat import router as chat_router
from routers.sessions import router as session_router
app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
]
app.add_middleware(CORSMiddleware,
               allow_origins = origins,
               allow_headers = ["*"],
               allow_credentials = True,
               allow_methods = ["*"])

@app.get("/home" , tags=['home'])
def read_root():
    return {"message" : "Hello bsdk"}

app.include_router(ingest_router)
app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(session_router)