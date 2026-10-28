from datetime import datetime

from pydantic import BaseModel, Field


class BudgetCreate(BaseModel):
    category_id: int
    amount: float = Field(gt=0)
    period: str
    start_date: datetime | None = None
    end_date: datetime | None = None


class BudgetResponse(BaseModel):
    id: int
    category_id: int
    amount: float
    period: str
    start_date: datetime
    end_date: datetime | None = None

    class Config:
        from_attributes = True
