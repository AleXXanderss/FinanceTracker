from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.transaction import Transaction
from app.models.category import Category
from app.models.enums import TransactionType
from app.models.user import User
from app.api.deps import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])


def shift_month(date_value: datetime, offset: int) -> datetime:
    month_index = (date_value.year * 12 + date_value.month - 1) + offset
    year = month_index // 12
    month = month_index % 12 + 1
    return date_value.replace(year=year, month=month, day=1)


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
        Transaction.type == TransactionType.income
    ).with_entities(func.sum(Transaction.amount)).scalar() or 0

    expense = base_query.filter(
        Transaction.type == TransactionType.expense
    ).with_entities(func.sum(Transaction.amount)).scalar() or 0

    transaction_count = base_query.with_entities(func.count(Transaction.id)).scalar() or 0

    avg_income = base_query.filter(
        Transaction.type == TransactionType.income
    ).with_entities(func.avg(Transaction.amount)).scalar() or 0

    avg_expense = base_query.filter(
        Transaction.type == TransactionType.expense
    ).with_entities(func.avg(Transaction.amount)).scalar() or 0

    return {
        "total_income": float(income),
        "total_expense": float(expense),
        "balance": float(income - expense),
        "transaction_count": int(transaction_count),
        "average_income": float(avg_income),
        "average_expense": float(avg_expense)
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
        Transaction.type == TransactionType.expense
    )

    if start_date:
        query = query.filter(Transaction.date >= start_date)

    if end_date:
        query = query.filter(Transaction.date <= end_date)

    results = query.group_by(Category.name).order_by(
        func.sum(Transaction.amount).desc(),
        Category.name.asc()
    ).all()

    return [
        {
            "category": r[0],
            "total": float(r[1])
        }
        for r in results
    ]


@router.get("/monthly")
def get_monthly_summary(
    months: int = Query(6, ge=1, le=24),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    current_month = datetime.utcnow().replace(
        day=1,
        hour=0,
        minute=0,
        second=0,
        microsecond=0
    )
    start_month = shift_month(current_month, -(months - 1))

    monthly_rows = db.query(
        func.date_trunc("month", Transaction.date).label("month"),
        Transaction.type,
        func.sum(Transaction.amount).label("total")
    ).filter(
        Transaction.user_id == current_user.id,
        Transaction.date >= start_month
    ).group_by(
        "month",
        Transaction.type
    ).order_by(
        "month"
    ).all()

    monthly_data: dict[str, dict[str, float]] = {}

    for offset in range(months):
        month_start = shift_month(start_month, offset)
        monthly_data[month_start.strftime("%Y-%m")] = {
            "income": 0.0,
            "expense": 0.0
        }

    for row in monthly_rows:
        month_key = row.month.strftime("%Y-%m")
        monthly_data.setdefault(month_key, {"income": 0.0, "expense": 0.0})
        monthly_data[month_key][row.type.value] = float(row.total)

    return [
        {
            "month": month_key,
            "income": values["income"],
            "expense": values["expense"],
            "balance": values["income"] - values["expense"]
        }
        for month_key, values in monthly_data.items()
    ]
