from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class User(Base):
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean(), default=True)
    is_superuser = Column(Boolean(), default=False)
    
    # Student specific fields
    student_id = Column(String, unique=True, index=True)
    room_number = Column(String)
    dorm_name   = Column(String)   # 기숙사 이름

    # Relationships
    stayouts = relationship("StayOut", back_populates="user")
