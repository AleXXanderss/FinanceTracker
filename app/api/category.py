from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.db.session import get_db
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryResponse
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.post("/", response_model=CategoryResponse)
def create_category(
    category: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if category.type not in ["income", "expense"]:
        raise HTTPException(status_code=400, detail="Invalid type")

    existing = db.query(Category).filter(
        Category.name == category.name,
        Category.type == category.type,
        Category.user_id == current_user.id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Already exists")

    new_category = Category(
        name=category.name,
        type=category.type,
        user_id=current_user.id
    )

    db.add(new_category)
    db.commit()
    db.refresh(new_category)

    return new_category


@router.get("/", response_model=list[CategoryResponse])
def get_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Category).filter(
        or_(
            Category.user_id == current_user.id,
            Category.user_id == None
        )
    ).all()