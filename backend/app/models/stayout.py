from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base
import enum

class StayOutStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"

class StayOut(Base):
    __tablename__ = "stayout"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    
    # 외박 정보
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    destination = Column(String, nullable=False)  # 사용자가 입력할 지역
    reason = Column(String, nullable=True)
    
    # 상태 및 기록
    status = Column(String, default=StayOutStatus.PENDING)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 관계 설정 (누가 신청했는지 바로 알 수 있게)
    user = relationship("User", back_populates="stayouts")
