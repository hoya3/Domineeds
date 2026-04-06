# Domineeds (도미니즈)
> **기숙사 외박 신청 최적화 프로젝트**

기존의 복잡하고 번거로운 기숙사 외박 신청 프로세스를 현대적이고 직관적인 UI/UX로 재해석하여 학생들의 편의성을 극대화합니다.

## 주요 기능
- **스마트 캘린더**: 클릭만으로 외박 시작일과 종료일을 간편하게 선택
- **신청 간소화**: 학생 정보 자동 매칭 및 빠른 행선지 등록
- **실시간 공지**: 기숙사 주요 공지사항을 대시보드에서 즉시 확인
- **최적화된 UI**: 토스(Toss) 스타일의 깔끔하고 프리미엄한 디자인

## 기술 스택
### Frontend
- **React**: 컴포넌트 기반 UI 개발
- **Custom CSS**: 높은 자유도의 프리미엄 디자인 구현

### Backend
- **FastAPI**: 빠르고 효율적인 Python 웹 프레임워크
- **Pydantic**: 엄격한 데이터 검증 및 스키마 관리

## 프로젝트 구조
- `backend/`: FastAPI 기반 RESTful API 서버
- `frontend/`: React 기반 사용자 인터페이스

## 시작하기
### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
