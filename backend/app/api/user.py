from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.enums import TransactionType
from app.db.session import get_db
from app.models.user import User
from app.models.category import Category
from app.schemas.user import UserCreate, UserResponse
from app.core.security import get_password_hash

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    # проверка на существующего пользователя
    existing_user = db.query(User).filter(
        User.username == user.username
    ).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")


    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=get_password_hash(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    default_categories = [
        Category(name="Food", type=TransactionType.expense, user_id=new_user.id),
        Category(name="Transport", type=TransactionType.expense, user_id=new_user.id),
        Category(name="Entertainment", type=TransactionType.expense, user_id=new_user.id),
        Category(name="Health", type=TransactionType.expense, user_id=new_user.id),
        Category(name="Shopping", type=TransactionType.expense, user_id=new_user.id),
        Category(name="Other Expense", type=TransactionType.expense, user_id=new_user.id),

        Category(name="Salary", type=TransactionType.income, user_id=new_user.id),
        Category(name="Freelance", type=TransactionType.income, user_id=new_user.id),
        Category(name="Business", type=TransactionType.income, user_id=new_user.id),
        Category(name="Other Income", type=TransactionType.income, user_id=new_user.id),
    ]

    db.add_all(default_categories)
    db.commit()

    return new_user