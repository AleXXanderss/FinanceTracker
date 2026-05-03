from fastapi import Depends, HTTPException, status
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
import os

from app.db.session import get_db
from app.models.user import User

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    print("RAW TOKEN:", token)

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials"
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print("PAYLOAD:", payload)

        user_id = payload.get("sub")
        print("SUB:", user_id)

        if user_id is None:
            print("SUB IS NONE")
            raise credentials_exception

        user_id = int(user_id)

    except Exception as e:
        print("DECODE ERROR:", e)
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    print("USER FROM DB:", user)

    if not user:
        print("USER NOT FOUND")
        raise credentials_exception

    return user