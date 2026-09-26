from datetime import datetime
import json
from fastembed import SparseTextEmbedding, TextEmbedding
from groq import Groq
from qdrant_client import models, QdrantClient
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from generators import emSession, get_session, mongo, get_post , get_groq
from google import genai
import motor.motor_asyncio
from dependencies import verify_jwt
from sqlalchemy.orm import Session
from schema.postgresql import Messages, User, Chatsession
from pydantic import BaseModel
sparse_model = SparseTextEmbedding(model_name="Qdrant/bm25")

router = APIRouter()

class Req(BaseModel):
    prompt: str
    ticker:str

dense_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")

@router.post("/chat")
async def chat(payload: Req, session_id: str | None= None,  email: str = Depends(verify_jwt), groq: Groq = Depends(get_groq), qdrant: QdrantClient = Depends(get_session) , mongodb: motor.motor_asyncio.AsyncIOMotorClient = Depends(mongo) , postdb: Session = Depends(get_post)):
    prevchats = ""
    res = []
    if session_id:
        chats = postdb.execute(select(Messages).where(Messages.sessionId == session_id).order_by(Messages.id.desc()).limit(5))
        res = chats.scalars().all()[::-1]
        for chats in res:
            prevchats += f"{chats.role} : {chats.content}\n"
    else:
        user = postdb.execute(select(User).where(User.email == email)).scalars().first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        id = user.id
        new_session = Chatsession(userId = id, ticker= payload.ticker, createdAt = datetime.now())
        postdb.add(new_session)
        postdb.flush()
        session_id = new_session.id
    query_filter = models.Filter(
        must=[
            models.FieldCondition(
                key="ticker",
                match=models.MatchValue(value=payload.ticker.upper())
            )
        ]
    )

    Densevector = list(dense_model.embed(payload.prompt))[0].tolist()
    Sparsevector = list(sparse_model.embed(payload.prompt))[0]
    
    search = qdrant.query_points(
        collection_name="Fin-Data",
        query_filter=query_filter,
        prefetch=[
            models.Prefetch(
                query=models.SparseVector(
                    indices=Sparsevector.indices.tolist(),
                    values=Sparsevector.values.tolist()),
                using="sparse",
                limit=10,
            ),
            models.Prefetch(
                query=Densevector,  
                using="dense",
                limit=10,
            ),
        ],
        query=models.RrfQuery(rrf=models.Rrf()),
        limit=5,
    )
    context_text = "\n\n".join([hit.payload["text"] for hit in search.points])
    print("\n--- RETRIEVED CONTEXT ---")
    print(context_text)
    print("-------------------------\n")

    master_prompt = f"""You are an expert financial AI assistant.
    You have two sources of information: the CONTEXT below (from SEC documents) and a database tool.
    
    INSTRUCTIONS:
    1. If the user asks for exact financial financialss (like revenue, total assets, net income) that are missing from the CONTEXT, you MUST call the 'get_exact_financial_figure' tool.
    2. If you use the tool, use the tool's result to answer the question.
    3. If neither the CONTEXT nor the tool can answer the question, say "I do not have enough information to answer that."
    4. Do not make up external facts.

    CONTEXT:
    {context_text}

    PREVIOUS CONVERSATION HISTORY:
    {prevchats}
    """
    
    formatted_messages = [
        {"role": "system", "content": master_prompt}
    ]

    if session_id:
        for chat in res:
            mapped_role = "user" if chat.role.lower() == "user" else "assistant"
            formatted_messages.append({"role": mapped_role, "content": chat.content})
            
    formatted_messages.append({"role": "user", "content": payload.prompt})

    tools = [
        {
            "type": "function",
            "function": {
                "name": "get_exact_financial_figure",
                "description": "Fetches precise financial financialss from the structured MongoDB database. Use this ONLY when the user asks for exact numbers like revenue, total assets, or net income.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "ticker": {
                            "type": "string",
                            "description": "The stock ticker symbol (e.g., 'MSFT', 'AAPL')"
                        },
                        "financials": {
                            "type": "string",
                            "description": "The requested financial financials (e.g., 'total_assets', 'revenue', 'net_income')"
                        }
                    },
                    "required": ["ticker", "financials"]
                }
            }
        }
    ]

    llm_response = groq.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=formatted_messages,
        tools= tools,
        tool_choice= "auto",
        temperature=0.0
    )
    final_answer = llm_response.choices[0].message
    if final_answer.tool_calls:
        print("Mongo is fetched")
        formatted_messages.append(final_answer)
        for tc in final_answer.tool_calls: # just to see if there are more than 1 tool call idk why there would be but there are
            if tc.function.name == "get_exact_financial_figure": # halucinates the tool name dumb ai
                import json
                args = json.loads(tc.function.arguments)
                
                db = mongodb["orvan"]
                coll = db["Fin-Data"]
                doc = await coll.find_one({"ticker": args["ticker"].upper()})
                
                if not doc:
                    function_response = f"Database Error: Ticker {args['ticker']} not found."
                else:
                    financials = doc.get("financials", {})
                    
                    
                    req_metric = str(args).lower()
                    db_key = None
                    
                    if "asset" in req_metric:
                        db_key = "Assets"
                    elif "revenue" in req_metric or "sales" in req_metric:
                        db_key = "Revenues"
                    elif "income" in req_metric or "loss" in req_metric:
                        db_key = "NetIncomeLoss"
                    elif "profit" in req_metric:
                        db_key = "GrossProfit"
                    elif "share" in req_metric or "eps" in req_metric:
                        db_key = "EarningsPerShareBasic"
                    elif "liabilit" in req_metric: # for some reason it does not know the spelling of liabiltoes took a while to figure thiis out 
                        db_key = "Liabilities"
                    
                    
                    if db_key and db_key in financials:
                        try:
                            
                            recent_history = financials[db_key]["units"]["USD"][-5:]
                            function_response = f"Success. Most recent {db_key} records: {json.dumps(recent_history)}"
                        except KeyError:
                            
                            function_response = f"Raw Database Result: {json.dumps(financials[db_key])}"
                    else:
                        available_keys = list(financials.keys())
                        function_response = f"db err: '{req_metric}' not found. Available keys: {available_keys}"
                
                print(f"\n[SYSTEM] Tool Result: {function_response}\n")
                
                formatted_messages.append({
                    "tool_call_id": tc.id,
                    "role": "tool",
                    "name": "get_exact_financial_figure",
                    "content": function_response,
                })
                second_response = groq.chat.completions.create(
                    model="openai/gpt-oss-120b",
                    messages=formatted_messages,
                    tools=tools, 
                    temperature=0.0
                )
                fa = second_response.choices[0].message.content
    else:
        fa = final_answer.content
    if not fa:
        fa = "I was unable to retrieve that specific metric from the database."
    new_message = Messages(sessionId = session_id, content=payload.prompt, role= "User")
    new_prompt = Messages(sessionId = session_id, content=fa, role= "LLM")
    postdb.add_all([new_message, new_prompt])
    postdb.commit()
    
    return {
        "session_id": session_id,
        "response": fa
    }