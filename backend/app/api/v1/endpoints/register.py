from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.crud.crud_user import user as crud_user
from app.schemas.user import User, UserCreate

router = APIRouter()

@router.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
def register(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate
) -> Any:
    """
    Register a new user
    """
    # 1. 이메일 중복 체크
    user = crud_user.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="이미 존재하는 이메일입니다.",
        )
    
    # 2. 학번 중복 체크
    user_by_student_id = crud_user.get_by_student_id(db, student_id=user_in.student_id)
    if user_by_student_id:
        raise HTTPException(
            status_code=400,
            detail="이미 등록된 학번입니다.",
        )
    
    # 3. 사용자 생성 및 반환
    return crud_user.create(db, obj_in=user_in)