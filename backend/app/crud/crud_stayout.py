from typing import List, Any
from sqlalchemy.orm import Session, joinedload
from app.models.stayout import StayOut
from app.schemas.stayout import StayOutCreate, StayOutUpdate

class CRUDStayOut:
    def create_with_owner(
        self, db: Session, *, obj_in: StayOutCreate, user_id: int
    ) -> StayOut:
        db_obj = StayOut(
            start_date=obj_in.start_date,
            end_date=obj_in.end_date,
            destination=obj_in.destination,
            reason=obj_in.reason,
            user_id=user_id
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_multi_by_user(
        self, db: Session, *, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[StayOut]:
        return (
            db.query(StayOut)
            .filter(StayOut.user_id == user_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_multi(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> List[StayOut]:
        return (
            db.query(StayOut)
            .options(joinedload(StayOut.user))  # 사용자 정보 eager load
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get(self, db: Session, id: Any) -> StayOut:
        return db.query(StayOut).filter(StayOut.id == id).first()

    def update(
        self, db: Session, *, db_obj: StayOut, obj_in: StayOutUpdate
    ) -> StayOut:
        obj_data = db_obj.__dict__
        update_data = obj_in.model_dump(exclude_unset=True)
        for field in obj_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

stayout = CRUDStayOut()
