from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session 
from dependencies import verify_jwt
from schema.postgresql import Chatsession, Messages, User
from generators import get_post
from sqlalchemy import select
router = APIRouter()

@router.get("/get-sessions")
async def session(email: str = Depends(verify_jwt) , postdb: Session = Depends(get_post)):
    user = postdb.execute(select(User).where(User.email == email)).scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    res = postdb.execute(
        select(Chatsession)
        .where(Chatsession.userId == user.id)
        .order_by(Chatsession.createdAt.desc())
    )
    sessions = res.scalars().all()
    return {
        "sessions": [
            {
                "session_id": session.id,
                "ticker": session.ticker,
                "created_at": session.createdAt
            }
            for session in sessions
        ]
    }

@router.get("/session")
async def nomorecodeplease(session_id: str, email: str = Depends(verify_jwt), postdb: Session = Depends(get_post)):
    user = postdb.execute(
        select(User).
        where(User.email == email)
    ).scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    chat = postdb.execute(
        select(Chatsession).
        where(Chatsession.userId == user.id)
        .where(Chatsession.id == session_id)
    )
    if not chat:
        raise HTTPException(status_code=403, detail="Not authorized to see this nigga")
    message = postdb.execute(
        select(Messages).
        where(Messages.sessionId == session_id)
    )
    res = message.scalars().all()
    return {
        "messages": [
            {
                "id": msg.id,
                "role": msg.role,
                "content": msg.content
            }
            for msg in res
        ]
    }