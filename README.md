# Domineeds (도미니즈)

> 기숙사생을 위한 외박 신청 및 관리 플랫폼

---

## 주요 기능

- **캘린더 외박 신청**: 달력에서 시작일·종료일 클릭으로 신청 완료
- **신청 완료 날짜 시각화**: 신청된 날짜 범위를 달력에 초록색으로 표시
- **신청 내역 조회**: 본인 신청 이력 확인 및 취소 가능
- **공지사항**: 기숙사 운영 공지 확인
- **관리자 대시보드**: 슈퍼유저 계정으로 전체 신청 현황 조회 및 필터링
- **JWT 인증**: 로그인·회원가입, 토큰 기반 보안

---

## 기술 스택

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS

### Backend
- **Framework**: FastAPI
- **Database**: SQLite (SQLAlchemy ORM)
- **Validation**: Pydantic v2
- **Authentication**: JWT (python-jose, passlib)

---

## 시작하기

### 요구사항
- Python 3.10+
- Node.js 18+ & npm

### 1. Backend

```bash
cd backend

# 가상환경 생성 및 활성화
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# 환경 변수 설정
cp .env.example .env             # Windows: copy .env.example .env
# .env 파일에서 SECRET_KEY 등 값 수정

# 서버 실행
uvicorn app.main:app --reload
```

### 2. Frontend

```bash
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

---

## 프로젝트 구조

```
Domineeds/
├── backend/
│   ├── app/
│   │   ├── api/          # 라우터 (login, register, stayout, users)
│   │   ├── core/         # 설정, 보안 (JWT)
│   │   ├── crud/         # DB CRUD 로직
│   │   ├── db/           # 세션, 베이스 모델
│   │   ├── models/       # SQLAlchemy 모델
│   │   ├── schemas/      # Pydantic 스키마
│   │   └── main.py       # FastAPI 앱 진입점
│   ├── tests/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/          # axios 클라이언트 (auth, stayout)
│   │   ├── App.jsx       # 메인 컴포넌트 (달력, 신청폼, 모달)
│   │   └── main.jsx
│   └── package.json
└── README.md
```

---

## 기숙사 목록

참인재관 · 다솜관 · 세르비레관 · 성김대건관 · 효성관 · 아마레관
