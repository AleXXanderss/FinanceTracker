from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.db.database import Base


class TransactionTag(Base):
    __tablename__ = "transaction_tags"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=False)
    tag_id = Column(Integer, ForeignKey("tags.id"), nullable=False)

    transaction = relationship("Transaction", back_populates="transaction_tags")
    tag = relationship("Tag", back_populates="transaction_tags")
