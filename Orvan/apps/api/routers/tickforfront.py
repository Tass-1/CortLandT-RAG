from fastapi import APIRouter, Depends
from generators import mongo

router = APIRouter()

@router.get("/get-tickers")
async def get_tickers(mongodb = Depends(mongo)):
    cursor = mongodb["orvan"]["Fin-Data"].find(
        {}, 
        {"ticker": 1, "entityName": 1, "_id": 0}
    )
    docs = await cursor.to_list(length=None)
    
    unique_nodes = {}
    for doc in docs:
        if "ticker" in doc:
            raw_name = doc.get("entityName", "Unknown Entity")
            unique_nodes[doc["ticker"]] = raw_name.title()
            
    output = [{"ticker": k, "name": v} for k, v in unique_nodes.items()]
    return {"nodes": output}