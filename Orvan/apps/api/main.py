from fastapi import FastAPI, APIRouter
from routers.ingest import router as ingest_router
app = FastAPI()



@app.get("/home" , tags=['home'])
def read_root():
    return {"message" : "Hello bsdk"}

app.include_router(ingest_router)