from sqlalchemy import Column, Integer, String, ForeignKey, Enum
from sqlalchemy.orm import relationship

from app.db.database import Base
from app.models.enums import TransactionType


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(Enum(TransactionType), nullable=False)

    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User")
    transactions = relationship("Transaction", back_populates="category")