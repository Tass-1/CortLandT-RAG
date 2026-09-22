from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
import jwt
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session
from schema.postgresql import User 
from generators import get_post
from pwdlib import PasswordHash

from config import settings
router = APIRouter()
pass_hash = PasswordHash.recommended()
class Req(BaseModel):
    email: str
    password: str
    name:str

@router.post("/signup")
async def auth(data: Req , db: Session = Depends(get_post)):
    email = data.email
    passw = data.password
    name = data.name
    ex = db.execute(select(User).where(User.email == email)).scalars().first()
    if ex:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already Exists"
        )
    else:
        hashed = pass_hash.hash(passw)
        enc = {
            "sub": email,
            "exp": datetime.now(timezone.utc) + timedelta(days=2)
        }
        encoded_jwt = jwt.encode( enc , settings.JWT_KEY, algorithm=settings.JWT_ALGO)
        new_user = User(
            name = name,
            email = email,
            password = hashed
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    return {
        "status":"200 OK",
        "userID": new_user.id,
        "JWT": encoded_jwt
    }

class SReq(BaseModel):
    email: str
    password: str

@router.post("/signin")
async def signin(data: SReq, db: Session = Depends(get_post)):
    user = db.execute(select(User).where(User.email == data.email)).scalars().first()
    if not user or not pass_hash.verify(data.password , user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    enc = {
        "sub": data.email,
        "exp": datetime.now(timezone.utc) + timedelta(days=2)
    }
    token = jwt.encode(enc, settings.JWT_KEY, algorithm=settings.JWT_ALGO)

    return {
        "status" : "Signed In",
        "JWT" : token,

    }