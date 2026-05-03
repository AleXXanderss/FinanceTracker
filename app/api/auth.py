from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from app.db.session import get_db
from app.models.user import User
from app.core.security import verify_password
from app.core.jwt import create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()

    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Wrong password")

    access_token = create_access_token(data={"sub": user.id})

    return {"access_token": access_token, "token_type": "bearer"}