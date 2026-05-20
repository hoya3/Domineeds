from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.api.deps import get_current_active_superuser
from app.crud.crud_stayout import stayout as crud_stayout
from app.schemas.stayout import StayOut, StayOutCreate, StayOutUpdate, StayOutWithUser
from app.models.stayout import StayOutStatus
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=StayOut)
def create_stayout(
    *,
    db: Session = Depends(deps.get_db),
    stayout_in: StayOutCreate,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Create new stayout request.
    """
    from datetime import date
    
    # 1. 시작일이 오늘보다 이전인지 확인
    if stayout_in.start_date < date.today():
        raise HTTPException(
            status_code=400,
            detail="과거 날짜로 외박을 신청할 수 없습니다."
        )
    
    # 2. 종료일이 시작일보다 이전인지 확인
    if stayout_in.end_date < stayout_in.start_date:
        raise HTTPException(
            status_code=400,
            detail="종료일은 시작일보다 빠를 수 없습니다."
        )

    return crud_stayout.create_with_owner(
        db=db, obj_in=stayout_in, user_id=current_user.id
    )

@router.get("/me", response_model=List[StayOut])
def read_stayouts(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Retrieve stayout requests for current user.
    """
    return crud_stayout.get_multi_by_user(
        db=db, user_id=current_user.id, skip=skip, limit=limit
    )

@router.get("/all", response_model=List[StayOutWithUser])
def read_all_stayouts(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_superuser)
) -> Any:
    """
    Retrieve all stayout requests (Admin only).
    """
    return crud_stayout.get_multi(db=db, skip=skip, limit=limit)

@router.patch("/{stayout_id}/cancel", response_model=StayOut)
def cancel_stayout(
    *,
    db: Session = Depends(deps.get_db),
    stayout_id: int,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Cancel a stayout request.
    """
    # 1. 해당 신청건이 존재하는지 확인
    stayout_obj = crud_stayout.get(db, id=stayout_id)
    if not stayout_obj:
        raise HTTPException(status_code=404, detail="외박 신청 내역을 찾을 수 없습니다.")
    
    # 2. 본인의 신청건인지 확인
    if stayout_obj.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="본인의 신청건만 취소할 수 있습니다.")
    
    # 3. 상태 업데이트
    update_data = StayOutUpdate(status=StayOutStatus.CANCELLED)
    return crud_stayout.update(db, db_obj=stayout_obj, obj_in=update_data)
