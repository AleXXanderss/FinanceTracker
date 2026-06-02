from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.transaction import Transaction
from app.models.category import Category
from app.schemas.transaction import TransactionCreate, TransactionResponse
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.post("/", response_model=TransactionResponse)
def create_transaction(
    transaction: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    category = db.query(Category).filter(
        Category.id == transaction.category_id,
        or_(
            Category.user_id == current_user.id,
            Category.user_id == None
        )
    ).first()

    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    if category.type != transaction.type:
        raise HTTPException(status_code=400, detail="Category type mismatch")

    transaction_payload = {
        "amount": transaction.amount,
        "description": transaction.description,
        "type": transaction.type,
        "user_id": current_user.id,
        "category_id": transaction.category_id,
    }

    if transaction.date is not None:
        transaction_payload["date"] = transaction.date

    new_transaction = Transaction(
        **transaction_payload
    )

    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)

    return new_transaction


@router.get("/", response_model=list[TransactionResponse])
def get_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).order_by(
        Transaction.date.desc(),
        Transaction.id.desc()
    ).all()


@router.delete("/{transaction_id}")
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()

    if not transaction:
        raise HTTPException(status_code=404, detail="Not found")

    db.delete(transaction)
    db.commit()

    return {"message": "Deleted"}
