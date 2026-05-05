from fastapi import FastAPI
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from app.db.database import engine, Base

from app.models.user import User
from app.models.category import Category
from app.models.transaction import Transaction

from app.api.user import router as user_router
from app.api.category import router as category_router
from app.api.transaction import router as transaction_router
from app.api.auth import router as auth_router
from app.api.analytics import router as analytics_router

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router)
app.include_router(category_router)
app.include_router(transaction_router)
app.include_router(auth_router)
app.include_router(analytics_router)


@app.get("/")
def root():
    return {"message": "Finance Tracker API is running"}