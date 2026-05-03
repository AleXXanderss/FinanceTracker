from pydantic import BaseModel
from datetime import datetime


class TransactionCreate(BaseModel):
    amount: float
    description: str | None = None
    type: str  # income / expense
    category_id: int


class TransactionResponse(BaseModel):
    id: int
    amount: float
    description: str | None
    type: str
    date: datetime
    category_id: int

    class Config:
        from_attributes = True