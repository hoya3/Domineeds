from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional
from app.models.stayout import StayOutStatus

# 공통 필드
class StayOutBase(BaseModel):
    start_date: date
    end_date: date
    destination: str
    reason: Optional[str] = None

# 생성 시 필요한 데이터
class StayOutCreate(StayOutBase):
    pass

# 수정 시 필요한 데이터
class StayOutUpdate(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    destination: Optional[str] = None
    reason: Optional[str] = None
    status: Optional[StayOutStatus] = None

# 조회 시 반환할 데이터 규격
class StayOut(StayOutBase):
    id: int
    user_id: int
    status: StayOutStatus
    created_at: datetime

    class Config:
        from_attributes = True

# 관리자용 — 학생 정보 포함
class UserBasic(BaseModel):
    id: int
    full_name: Optional[str] = None
    student_id: Optional[str] = None
    dorm_name: Optional[str] = None
    room_number: Optional[str] = None

    class Config:
        from_attributes = True

class StayOutWithUser(StayOut):
    user: Optional[UserBasic] = None
