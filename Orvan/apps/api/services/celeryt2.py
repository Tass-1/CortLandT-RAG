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

gclient = genai.Client(api_key = settings.GEMINI)
client = QdrantClient(url= settings.DB, api_key= settings.API)
celeryT2 = Celery("process-file" , broker="redis://localhost:6379/1")
cache = redis.Redis(host="localhost" , port=6379 , db=2 , decode_responses=True)

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
        for table in b.find_all("table"):
            table.decompose()
        cleaned = b.get_text(separator="\n\n", strip=True)
        cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)
        cleaned = cleaned.replace("\xa0", " ")
        cleaned = re.sub(r"[^\S\r\n]+", " ", cleaned)
        cleaned = re.sub(r"\s*\n\s*", "\n", cleaned)
        cleaned = re.sub(r"\s*\n\s*", "\n", cleaned)
        splitter = RecursiveCharacterTextSplitter(
            chunk_size = 1000,
            chunk_overlap = 100,
            separators=["\n\n", "\n", " ", ""]
        )

        chunks = splitter.split_text(cleaned)
        for i in range(0,len(chunks) , 25):
            batch = chunks[i:i+25]
            res = gclient.models.embed_content(
                model = "gemini-embedding-2",
                contents=batch
            )
            points = []
            for idx , vec in enumerate(res.embeddings):
                points.append(
                    models.PointStruct(
                        id = str(uuid.uuid4()),
                        vector = vec.values,
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
            time.sleep(9)

    print()
