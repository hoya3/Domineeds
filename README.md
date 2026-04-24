# Domineeds (도미니즈) 🏠

> **기숙사생을 위한 스마트한 외박 신청 및 관리 플랫폼**  
> 기존의 번거로운 외박 신청 프로세스를 토스(Toss) 스타일의 직관적인 UI/UX로 재해석하여 편리함을 극대화했습니다.

---

## ✨ 주요 기능 (Key Features)

- 📅 **스마트 캘린더 외박 신청**: 클릭만으로 시작일과 종료일을 선택하는 직관적인 인터페이스를 제공합니다.
- 📋 **실시간 공지사항**: 기숙사 운영 지침, 방역 일정 등 중요한 소식을 대시보드에서 즉시 확인합니다.
- 👤 **프로필 자동 매칭**: 학생의 학과, 학번, 기숙사 정보를 기반으로 맞춤형 신청 양식을 구성합니다.
- 🔒 **안전한 보안**: JWT 기반 인증 시스템을 통해 개인 정보를 안전하게 보호합니다.

---

## 🛠 기술 스택 (Tech Stack)

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, PostCSS (Premium Custom Design)
- **Design Concept**: Modern & Premium UI (Glassmorphism)

### Backend
- **Framework**: FastAPI
- **Database**: SQLite (SQLAlchemy ORM)
- **Validation**: Pydantic v2
- **Authentication**: JWT (python-jose, passlib)

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
├── backend/            # FastAPI 기반 RESTful API 서버
│   ├── app/            # 애플리케이션 코어 (API, Models, Schemas)
│   └── tests/          # 테스트 코드
├── frontend/           # React + Vite 기반 사용자 인터페이스
│   ├── src/            # 소스 코드 및 스타일링
│   └── public/         # 정적 리소스
└── README.md           # 프로젝트 통합 문서
```

---

## 📄 라이선스 (License)

이 프로젝트는 개인 학습 및 기숙사 관리 효율화를 목적으로 제작되었습니다.
