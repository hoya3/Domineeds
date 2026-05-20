from fastapi import APIRouter
from app.api.v1.endpoints import login, register, users, stayout

api_router = APIRouter()
api_router.include_router(login.router, tags=["login"])
api_router.include_router(register.router, tags=["register"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(stayout.router, prefix="/stayout", tags=["stayout"])
