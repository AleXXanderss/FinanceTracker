from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.tag import Tag
from app.models.user import User
from app.schemas.tag import TagCreate, TagResponse

router = APIRouter(prefix="/tags", tags=["Tags"])


@router.post("/", response_model=TagResponse)
def create_tag(
    tag: TagCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = db.query(Tag).filter(Tag.user_id == current_user.id, Tag.name == tag.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Tag already exists")

    new_tag = Tag(user_id=current_user.id, name=tag.name)
    db.add(new_tag)
    db.commit()
    db.refresh(new_tag)

    return new_tag


@router.get("/", response_model=list[TagResponse])
def get_tags(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Tag).filter(Tag.user_id == current_user.id).all()
