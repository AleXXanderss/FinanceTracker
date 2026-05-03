from pydantic import BaseModel
from app.models.enums import TransactionType


class CategoryCreate(BaseModel):
    name: str
    type: TransactionType


class CategoryResponse(BaseModel):
    id: int
    name: str
    type: str

    class Config:
        from_attributes = True