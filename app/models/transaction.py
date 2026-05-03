from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.database import Base
from app.models.enums import TransactionType


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    description = Column(String)
    date = Column(DateTime, default=datetime.utcnow)

    type = Column(Enum(TransactionType), nullable=False)  # income / expense

    user_id = Column(Integer, ForeignKey("users.id"))
    category_id = Column(Integer, ForeignKey("categories.id"))

    user = relationship("User")
    category = relationship("Category", back_populates="transactions")