from celery import Celery
import redis
import httpx
from bs4 import BeautifulSoup
from qdrant_client import QdrantClient
from config import settings
import re

client = QdrantClient(url= settings.DB, api_key= settings.API)
celeryT2 = Celery("process-file" , broker="redis://localhost:6379/1")
cache = redis.Redis(host="localhost" , port=6379 , db=2 , decode_responses=True)

@celeryT2.task
def process_data(cik:str , acnum: str, doc:str):
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
        


    print(cleaned)

    print()
