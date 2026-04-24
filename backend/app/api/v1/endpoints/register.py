from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api import deps
from app.crud.crud_user import user as crud_user
from app.schemas.user import User, UserCreate
from app.schemas.token import Token
from app.core import security
from datetime import timedelta
from app.core.config import settings

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
    # Check if user with this email already exists
    user = crud_user.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="A user with this email already exists"
        )
    
    # Check if student_id already exists (if provided)
    if user_in.student_id:
        user = crud_user.get_by_student_id(db, student_id=user_in.student_id)
        if user:
            raise HTTPException(
                status_code=400,
                detail="A user with this student ID already exists"
            )
    
    # Create new user
    user = crud_user.create(db, obj_in=user_in)
    return user


@router.post("/login/access-token", response_model=Token)
def login_access_token(
    db: Session = Depends(deps.get_db), 
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    from fastapi.security import OAuth2PasswordRequestForm
    
    user = crud_user.authenticate(
        db, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }