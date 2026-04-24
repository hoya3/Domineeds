from fastapi import APIRouter
from app.api.v1.endpoints import login, register

api_router = APIRouter()
api_router.include_router(login.router, tags=["login"])
api_router.include_router(register.router, prefix="/users", tags=["users"])
