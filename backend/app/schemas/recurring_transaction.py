from datetime import datetime

from pydantic import BaseModel, Field

from app.models.enums import TransactionType


class RecurringTransactionCreate(BaseModel):
    category_id: int
    amount: float = Field(gt=0)
    type: TransactionType
    description: str | None = None
    frequency: str
    next_run_date: datetime
    is_active: bool = True


class RecurringTransactionResponse(BaseModel):
    id: int
    category_id: int
    amount: float
    type: TransactionType
    description: str | None = None
    frequency: str
    next_run_date: datetime
    is_active: bool

    class Config:
        from_attributes = True
