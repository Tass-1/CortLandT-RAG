from datetime import datetime
from fastembed import SparseTextEmbedding
from qdrant_client import models, QdrantClient
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from generators import emSession, get_session, mongo, get_post
from google import genai
import motor.motor_asyncio
from dependencies import verify_jwt
from sqlalchemy.orm import Session
from schema.postgresql import Messages, User, Chatsession

sparse_model = SparseTextEmbedding(model_name="Qdrant/bm25")

router = APIRouter()

@router.post("/chat")
async def chat(ticker: str, session_id: str | None= None , prompt: str | None = None,  email: str = Depends(verify_jwt), gclient: genai.Client = Depends(emSession), qdrant: QdrantClient = Depends(get_session) , mongodb: motor.motor_asyncio.AsyncIOMotorClient = Depends(mongo) , postdb: Session = Depends(get_post)):
    prevchats = ""

    if session_id:
        chats = await postdb.execute(select(Messages).where(Messages.sessionId == session_id).order_by(Messages.id.desc()).limit(6))
        res = chats.scalars().all()[::-1]
        for chats in res:
            prevchats += f"{chats.role} : {chats.content}\n"
    else:
        user = (await postdb.execute(select(User).where(User.email == email))).scalars().first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        id = user.id
        new_session = Chatsession(userId = id, ticker= ticker, createdAt = datetime.now())
        postdb.add(new_session)
        await postdb.flush()
        session_id = new_session.id

    vec = gclient.models.embed_content(
        model = "gemini-embedding-2",
        contents=prompt
    )
    Densevector = vec.embeddings[0].values
    Sparsevector = list(sparse_model.embed(prompt))[0]
    
    search = qdrant.query_points(
        collection_name="Fin-Data",
        prefetch=[
            models.Prefetch(
                query=models.SparseVector(
                    indices=Sparsevector.indices.tolist(),
                    values=Sparsevector.values.tolist()),
                using="sparse",
                limit=20,
            ),
            models.Prefetch(
                query=Densevector,  
                using="dense",
                limit=20,
            ),
        ],
        query=models.RrfQuery(rrf=models.Rrf()),
        limit=10,
    )
    context_text = "\n\n".join([hit.payload["text"] for hit in search.points])

    master_prompt = f"""You are an expert financial AI assistant.
    Answer the user's question using ONLY the provided CONTEXT. 
    If the CONTEXT does not contain the answer, say "I do not have enough information to answer that." 
    Do not make up external facts. Use the PREVIOUS CONVERSATION HISTORY for context if the user asks a follow-up question.

    CONTEXT:
    {context_text}

    PREVIOUS CONVERSATION HISTORY:
    {prevchats}

    CURRENT USER QUESTION:
    {prompt}
    """
    llm_response = gclient.models.generate_content(
        model="gemini-2.5-flash", 
        contents=master_prompt
    )
    final_answer = llm_response.text
    
    new_message = Messages(sessionId = session_id, content=prompt, role= "User")
    new_prompt = Messages(sessionId = session_id, content=final_answer, role= "LLM")
    postdb.add_all([new_message, new_prompt])
    await postdb.commit()
    
    return {
        "session_id": session_id,
        "response": final_answer
    }