from datetime import datetime

from pydantic import BaseModel, Field

from app.models.enums import TransactionType


class TransactionCreate(BaseModel):
    amount: float = Field(gt=0)
    description: str | None = None
    type: TransactionType
    category_id: int
    date: datetime | None = None
    tag_ids: list[int] | None = None


class TransactionResponse(BaseModel):
    id: int
    amount: float
    description: str | None
    type: TransactionType
    date: datetime
    category_id: int
    tag_ids: list[int] = []

    class Config:
        from_attributes = True
