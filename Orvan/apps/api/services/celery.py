from celery import Celery
import httpx
import redis
celeryApp = Celery("fetch-file" , broker="redis://localhost:6379/1")
cache = redis.Redis(host="localhost" , port=6379, db=1 ,decode_responses=True)
@celeryApp.task
def fetch_file(ticker:str):
    headers = {
        "User-Agent": "Priyanshu Joshi (priyanshujoshi10000@gmail.com)"
    }
    ticker = ticker.upper()
    ticker_cik = cache.get(ticker)
    
    if not ticker_cik:
        print("Getting teh cache")
        cik_file = httpx.get("https://www.sec.gov/files/company_tickers.json" , headers=headers)
        if cik_file:
            data = cik_file.json()
            pipe = cache.pipeline()
            
            for comp in data.values():
                tic = comp["ticker"].upper()
                name = str(comp["cik_str"]).zfill(10)
                pipe.set(tic,name,raw_cik)
            pipe.execute()
            ticker_cik = cache.get(ticker)
    if ticker_cik:
        print("getting the location")
        print(ticker_cik)
        file_location = httpx.get(f'https://data.sec.gov/submissions/CIK{ticker_cik}.json', headers=headers).json()
        recent_files = file_location['filings']['recent']
        tgi = 0
        for i, form in enumerate(recent_files['form']):
            if form == "10-K":
                tgi = i
                break

        acession = recent_files["accessionNumber"][tgi].replace("-","")
        doc = recent_files["primaryDocument"][tgi]
        report = recent_files["reportDate"][tgi]
        raw_cik = ticker_cik.strip("0")
        final_file = httpx.get(f'https://www.sec.gov/Archives/edgar/data/{raw_cik}/{acession}/{doc}' , headers= headers).text
        print(final_file)



            
    