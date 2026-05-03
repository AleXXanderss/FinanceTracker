from fastapi import FastAPI
from app.db.database import engine, Base
from app.models.category import Category
from app.models.user import User
from app.api.user import router as user_router
from app.models.category import Category
from app.models.transaction import Transaction
from app.api.category import router as category_router

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(user_router)

app.include_router(category_router)

@app.get("/")
def root():
    return {"message": "Finance Tracker API is running"}