from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.transaction import Transaction
from app.models.category import Category
from app.schemas.transaction import TransactionCreate, TransactionResponse

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.post("/", response_model=TransactionResponse)
def create_transaction(
    transaction: TransactionCreate,
    db: Session = Depends(get_db)
):
    # проверяем, что категория существует
    category = db.query(Category).filter(
        Category.id == transaction.category_id
    ).first()

    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    # проверка типа
    if transaction.type not in ["income", "expense"]:
        raise HTTPException(status_code=400, detail="Invalid type")

    new_transaction = Transaction(
        amount=transaction.amount,
        description=transaction.description,
        type=transaction.type,
        user_id=1,  # временно
        category_id=transaction.category_id
    )

    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)

    return new_transaction


@router.get("/", response_model=list[TransactionResponse])
def get_transactions(db: Session = Depends(get_db)):
    return db.query(Transaction).all()