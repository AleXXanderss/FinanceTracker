from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.category import Category
from app.models.tag import Tag
from app.models.transaction import Transaction
from app.models.transaction_tag import TransactionTag
from app.models.user import User
from app.schemas.transaction import TransactionCreate, TransactionResponse

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.post("/", response_model=TransactionResponse)
def create_transaction(
    transaction: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    category = db.query(Category).filter(
        Category.id == transaction.category_id,
        or_(Category.user_id == current_user.id, Category.user_id == None),
    ).first()

    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    if category.type != transaction.type:
        raise HTTPException(status_code=400, detail="Category type mismatch")

    tag_ids = transaction.tag_ids or []
    if tag_ids:
        valid_tags = db.query(Tag).filter(
            Tag.id.in_(tag_ids),
            Tag.user_id == current_user.id,
        ).all()
        if len(valid_tags) != len(set(tag_ids)):
            raise HTTPException(status_code=400, detail="Invalid tag ids")

    transaction_payload = {
        "amount": transaction.amount,
        "description": transaction.description,
        "type": transaction.type,
        "user_id": current_user.id,
        "category_id": transaction.category_id,
    }

    if transaction.date is not None:
        transaction_payload["date"] = transaction.date

    new_transaction = Transaction(**transaction_payload)
    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)

    if tag_ids:
        for tag_id in tag_ids:
            db.add(
                TransactionTag(
                    transaction_id=new_transaction.id,
                    tag_id=tag_id,
                )
            )
        db.commit()

    response = TransactionResponse(
        id=new_transaction.id,
        amount=new_transaction.amount,
        description=new_transaction.description,
        type=new_transaction.type,
        date=new_transaction.date,
        category_id=new_transaction.category_id,
        tag_ids=tag_ids,
    )
    return response


@router.get("/", response_model=list[TransactionResponse])
def get_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
    ).order_by(Transaction.date.desc(), Transaction.id.desc()).all()

    result = []
    for transaction in transactions:
        tag_ids = [item.tag_id for item in transaction.transaction_tags]
        result.append(
            TransactionResponse(
                id=transaction.id,
                amount=transaction.amount,
                description=transaction.description,
                type=transaction.type,
                date=transaction.date,
                category_id=transaction.category_id,
                tag_ids=tag_ids,
            )
        )

    return result


@router.delete("/{transaction_id}")
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id,
    ).first()

    if not transaction:
        raise HTTPException(status_code=404, detail="Not found")

    db.delete(transaction)
    db.commit()

    return {"message": "Deleted"}
