from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router
from app.core.config import settings
from app.db.session import engine
from app.db.base import Base

# 서버 실행 시 DB 테이블 생성
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# CORS configuration
# ※ allow_credentials=True 와 allow_origins=["*"] 는 브라우저 스펙상 함께 사용 불가
#   → 프론트 개발 서버 출처를 명시적으로 허용
ALLOWED_ORIGINS = [
    "http://localhost:5173",   # Vite 기본 포트
    "http://localhost:3000",   # 기타 개발 서버
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {"message": "Domineeds Backend Server is Running!"}