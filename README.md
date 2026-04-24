# Domineeds (도미니즈) 🏠

> **기숙사생을 위한 스마트한 외박 신청 및 관리 플랫폼**  
> "Dormitory + Needs" - 기숙사 생활의 필수적인 요구사항을 담았습니다.

---

## ✨ 주요 기능 (Key Features)

- 📅 **스마트 캘린더 외박 신청**: 직관적인 인터페이스를 통해 최대 7일 이내의 외박을 간편하게 신청할 수 있습니다.
- 📋 **공지사항 확인**: 기숙사 운영 지침, 방역 일정 등 중요한 소식을 한눈에 확인합니다.
- 👤 **프로필 관리**: 학생의 소속 학과, 학번, 기숙사 정보를 기반으로 맞춤형 서비스를 제공합니다.
- 🔒 **안전한 인증**: JWT 기반의 보안 인증 시스템을 통해 개인 정보를 안전하게 보호합니다.

---

## 🛠 기술 스택 (Tech Stack)

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, PostCSS
- **Design Strategy**: Modern & Premium UI (Glassmorphism, High Contrast)

### Backend
- **Framework**: FastAPI
- **Database**: SQLite (SQLAlchemy ORM)
- **Validation**: Pydantic v2
- **Authentication**: JWT (python-jose, passlib)
- **Environment**: Python 3.13+

---

## 🚀 시작하기 (Getting Started)

### Prerequisites
- Python 3.13+
- Node.js 18+ & npm

### 1. Backend 설정
```bash
cd backend
# 가상환경 생성 및 활성화
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# 환경 변수 설정
cp .env.example .env  # Windows: copy .env.example .env

# 서버 실행
uvicorn app.main:app --reload
```

### 2. Frontend 설정
```bash
cd frontend
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

---

## 📁 프로젝트 구조 (Project Structure)

```text
Domineeds/
├── backend/            # FastAPI 기반 백엔드 서버
│   ├── app/            # 애플리케이션 코어
│   │   ├── api/        # API 라우트
│   │   ├── core/       # 설정 및 보안
│   │   ├── models/     # DB 모델
│   │   └── schemas/    # Pydantic 스키마
│   └── tests/          # 테스트 코드
├── frontend/           # React + Vite 기반 프론트엔드
│   ├── src/            # 소스 코드
│   │   ├── assets/     # 정적 파일
│   │   └── components/ # UI 컴포넌트
│   └── public/         # 공용 리소스
└── README.md           # 프로젝트 문서
```

---

## 📄 라이선스 (License)

이 프로젝트는 개인 학습 및 기숙사 관리 효율화를 목적으로 제작되었습니다.
