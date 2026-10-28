from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.category import Category
from app.models.recurring_transaction import RecurringTransaction
from app.models.user import User
from app.schemas.recurring_transaction import (
    RecurringTransactionCreate,
    RecurringTransactionResponse,
)

router = APIRouter(prefix="/recurring-transactions", tags=["Recurring Transactions"])


@router.post("/", response_model=RecurringTransactionResponse)
def create_recurring_transaction(
    item: RecurringTransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    category = db.query(Category).filter(
        Category.id == item.category_id,
        Category.user_id == current_user.id,
    ).first()

    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    if category.type != item.type:
        raise HTTPException(status_code=400, detail="Category type mismatch")

    new_item = RecurringTransaction(
        user_id=current_user.id,
        category_id=item.category_id,
        amount=item.amount,
        type=item.type,
        description=item.description,
        frequency=item.frequency,
        next_run_date=item.next_run_date,
        is_active=item.is_active,
    )

    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    return new_item


@router.get("/", response_model=list[RecurringTransactionResponse])
def get_recurring_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(RecurringTransaction).filter(
        RecurringTransaction.user_id == current_user.id
    ).all()
