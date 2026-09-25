import time
import uuid

from celery import Celery
import redis
import httpx
from bs4 import BeautifulSoup
from qdrant_client import QdrantClient, models
from config import settings
import re
from google import genai
from config import settings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from fastembed import SparseTextEmbedding, TextEmbedding

gclient = genai.Client(api_key = settings.GEMINI)
client = QdrantClient(url= settings.DB, api_key= settings.API)
celeryT2 = Celery("process-file" , broker="redis://localhost:6379/1")
cache = redis.Redis(host="localhost" , port=6379 , db=2 , decode_responses=True)
sparse_model = SparseTextEmbedding(model_name="Qdrant/bm25")
dense_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
@celeryT2.task(queue="embed_queue")
def process_data(cik:str , acnum: str, doc:str , ticker: str):
    headers = {
            "User-Agent": "Priyanshu Joshi (priyanshujoshi10000@gmail.com)"
        }
    final_file = httpx.get(f'https://www.sec.gov/Archives/edgar/data/{cik}/{acnum}/{doc}' , headers= headers)
    text = final_file.text
    if final_file.status_code == 200:
        b = BeautifulSoup(text,"html.parser")
        for tag in b(["script", "style", "noscript", "meta", "head", "header", "footer"]):
            tag.decompose()
        cleaned = b.get_text(separator=" | ", strip=True)
        cleaned = re.sub(r'\s{2,}', ' ', cleaned)
        
        splitter = RecursiveCharacterTextSplitter(
            chunk_size = 1500,
            chunk_overlap = 150,
            separators=["\n\n", "\n", " ", ""]
        )

        chunks = splitter.split_text(cleaned)
        for i in range(0,len(chunks) , 100):
            batch = chunks[i:i+100]
            dense_embeddings = list(dense_model.embed(batch))
            sparse_embeddings = list(sparse_model.embed(batch))
            points = []
            for idx , vec in enumerate(dense_embeddings):
                points.append(
                    models.PointStruct(
                        id = str(uuid.uuid4()),
                        vector = {"dense": vec.tolist(),
                                  "sparse": models.SparseVector(
                                        indices=sparse_embeddings[idx].indices.tolist(),
                                        values=sparse_embeddings[idx].values.tolist()
                                  )},
                        payload = {
                            "ticker": ticker.upper(),
                            "text": batch[idx]
                        }
                    )
                    
                )
            client.upsert(
                collection_name="Fin-Data",
                points=points
            )

    print()
