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
        Category(name="Еда", type=TransactionType.expense, user_id=new_user.id),
        Category(name="Транспорт", type=TransactionType.expense, user_id=new_user.id),
        Category(name="Развлечения", type=TransactionType.expense, user_id=new_user.id),
        Category(name="Здоровье", type=TransactionType.expense, user_id=new_user.id),
        Category(name="Покупки", type=TransactionType.expense, user_id=new_user.id),
        Category(name="Прочие расходы", type=TransactionType.expense, user_id=new_user.id),

        Category(name="Зарплата", type=TransactionType.income, user_id=new_user.id),
        Category(name="Фриланс", type=TransactionType.income, user_id=new_user.id),
        Category(name="Бизнес", type=TransactionType.income, user_id=new_user.id),
        Category(name="Прочие доходы", type=TransactionType.income, user_id=new_user.id),
    ]

    db.add_all(default_categories)
    db.commit()

    return new_user
