from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import jwt
from config import settings

sec = HTTPBearer()

def verify_jwt(creds: HTTPAuthorizationCredentials = Depends(sec)):
    token = creds.credentials
    try:
        payload = jwt.decode(token , settings.JWT_KEY, algorithms=[settings.JWT_ALGO])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid Token"
            )
        return email
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Token has expired sign in again"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=401,
            detail="Token is Invalid"
        )
