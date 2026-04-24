from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash
from app.crud.crud_user import user as crud_user
from app.schemas.user import UserCreate

def init_db():
    db = SessionLocal()
    
    # Create the tables if they don't exist
    from app.db.base_class import Base
    from app.models.user import User
    Base.metadata.create_all(bind=db.get_bind())
    
    # Create a test user
    email = "test@example.com"
    password = "password123"
    user = crud_user.get_by_email(db, email=email)
    if not user:
        user_in = UserCreate(
            email=email,
            password=password,
            full_name="Test User",
            student_id="20240001",
            room_number="301",
            is_superuser=True
        )
        crud_user.create(db, obj_in=user_in)
        print(f"Test user created: {email} / {password}")
    else:
        print(f"User {email} already exists.")
    
    db.close()

if __name__ == "__main__":
    init_db()
