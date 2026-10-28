import os
import time
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./finance_tracker.db")

engine_kwargs = {}
if DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}

for i in range(10):
    try:
        engine = create_engine(DATABASE_URL, **engine_kwargs)
        conn = engine.connect()
        conn.close()
        print("Database connected")
        break
    except Exception:
        print("Waiting for database...")
        time.sleep(2)
else:
    raise Exception("Database not available")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()