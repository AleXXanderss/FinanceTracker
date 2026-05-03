from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.transaction import Transaction
from app.models.category import Category
from app.models.user import User
from app.schemas.transaction import TransactionCreate, TransactionResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.post("/", response_model=TransactionResponse)
def create_transaction(
    transaction: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # проверяем, что категория существует И принадлежит пользователю
    category = db.query(Category).filter(
        Category.id == transaction.category_id,
        Category.user_id == current_user.id
    ).first()

    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    new_transaction = Transaction(
        amount=transaction.amount,
        description=transaction.description,
        type=transaction.type,
        user_id=current_user.id,
        category_id=transaction.category_id
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
    ).all()