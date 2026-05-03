from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime

from app.db.session import get_db
from app.models.transaction import Transaction
from app.models.category import Category
from app.models.user import User
from app.api.deps import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/summary")
def get_summary(
    start_date: datetime | None = Query(None),
    end_date: datetime | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    base_query = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    )

    if start_date:
        base_query = base_query.filter(Transaction.date >= start_date)

    if end_date:
        base_query = base_query.filter(Transaction.date <= end_date)

    income = base_query.filter(
        Transaction.type == "income"
    ).with_entities(func.sum(Transaction.amount)).scalar() or 0

    expense = base_query.filter(
        Transaction.type == "expense"
    ).with_entities(func.sum(Transaction.amount)).scalar() or 0

    return {
        "total_income": float(income),
        "total_expense": float(expense),
        "balance": float(income - expense)
    }


@router.get("/by-category")
def get_by_category(
    start_date: datetime | None = Query(None),
    end_date: datetime | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(
        Category.name,
        func.sum(Transaction.amount)
    ).join(
        Transaction, Transaction.category_id == Category.id
    ).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == "expense"
    )

    if start_date:
        query = query.filter(Transaction.date >= start_date)

    if end_date:
        query = query.filter(Transaction.date <= end_date)

    results = query.group_by(Category.name).all()

    return [
        {
            "category": r[0],
            "total": float(r[1])
        }
        for r in results
    ]