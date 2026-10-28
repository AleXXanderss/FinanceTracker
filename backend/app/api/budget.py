from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.budget import Budget
from app.models.category import Category
from app.models.user import User
from app.schemas.budget import BudgetCreate, BudgetResponse

router = APIRouter(prefix="/budgets", tags=["Budgets"])


@router.post("/", response_model=BudgetResponse)
def create_budget(
    budget: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    category = db.query(Category).filter(
        Category.id == budget.category_id,
        Category.user_id == current_user.id,
    ).first()

    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    new_budget = Budget(
        user_id=current_user.id,
        category_id=budget.category_id,
        amount=budget.amount,
        period=budget.period,
        start_date=budget.start_date or __import__("datetime").datetime.utcnow(),
        end_date=budget.end_date,
    )

    db.add(new_budget)
    db.commit()
    db.refresh(new_budget)

    return new_budget


@router.get("/", response_model=list[BudgetResponse])
def get_budgets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Budget).filter(Budget.user_id == current_user.id).all()
