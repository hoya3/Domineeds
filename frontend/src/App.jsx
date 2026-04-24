import React, { useState } from 'react';
import './App.css';

const DormitoryApp = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [destination, setDestination] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // ── 달력 계산 (서버 요청 없이 순수 JS) ──────────────────
  const todayObj = new Date();
  todayObj.setHours(0, 0, 0, 0);

  const [calYear, setCalYear] = useState(todayObj.getFullYear());
  const [calMonth, setCalMonth] = useState(todayObj.getMonth()); // 0-indexed

  const limitDate = new Date(todayObj);
  limitDate.setDate(todayObj.getDate() + 6); // 오늘 포함 7일

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay(); // 0=일
  const monthLabel = `${calYear}년 ${calMonth + 1}월`;

  const toDateObj = (year, month, day) => {
    const d = new Date(year, month, day);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const isDisabled = (day) => {
    const d = toDateObj(calYear, calMonth, day);
    return d < todayObj || d > limitDate;
  };

  const isTodayCell = (day) =>
    calYear === todayObj.getFullYear() &&
    calMonth === todayObj.getMonth() &&
    day === todayObj.getDate();

  const isSelected = (day) => {
    const d = toDateObj(calYear, calMonth, day);
    return (startDate && d.getTime() === startDate.getTime()) ||
           (endDate   && d.getTime() === endDate.getTime());
  };

  const isInRange = (day) => {
    if (!startDate || !endDate) return false;
    const d = toDateObj(calYear, calMonth, day);
    return d > startDate && d < endDate;
  };

  const handleDateClick = (day) => {
    if (isDisabled(day)) return;
    const clicked = toDateObj(calYear, calMonth, day);

    if (!startDate || (startDate && endDate)) {
      setStartDate(clicked);
      setEndDate(null);
    } else {
      if (clicked < startDate) {
        setStartDate(clicked);
      } else {
        setEndDate(clicked);
      }
    }
  };

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
    setStartDate(null); setEndDate(null);
  };

  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
    setStartDate(null); setEndDate(null);
  };

  const fmt = (d) => d ? `${d.getMonth() + 1}월 ${d.getDate()}일` : '날짜 선택';

  // ── 신청하기 (중복 제출 방지) ────────────────────────────
  const handleSubmit = async () => {
    if (!startDate || !endDate || !destination.trim()) return;
    setSubmitting(true);
    // TODO: 백엔드 API 연동 시 여기에 fetch/axios 추가
    await new Promise(r => setTimeout(r, 800)); // 임시 딜레이
    alert('외박 신청이 완료되었습니다.');
    setStartDate(null); setEndDate(null); setDestination('');
    setSubmitting(false);
  };

  // ── 가상 데이터 ──────────────────────────────────────────
  const userInfo = { name: "이규인", studentId: "22114161", major: "컴퓨터공학전공", dormName: "다솜관" };
  const notices = [
    { id: 1, title: "2026년 1학기 중간고사 기간 외박 지침 안내", date: "2026-03-25" },
    { id: 2, title: "기숙사 점검 및 방역 실시 공고", date: "2026-03-20" }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-['Noto_Sans_KR']">
      {/* 헤더 */}
      <header className="bg-white border-b p-4 px-10 flex justify-between items-center shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-4 hover:bg-slate-100 rounded-xl transition-all">
            <div className="w-6 h-[18px] flex flex-col justify-between cursor-pointer">
              {[0,1,2].map(i => <div key={i} className="w-full h-[2.5px] bg-[#1e293b] rounded-full" />)}
            </div>
          </button>
          <h1 className="text-xl font-black text-slate-900">{userInfo.name}님 반갑습니다</h1>
        </div>
        <div className="text-sm font-bold text-slate-400">{userInfo.major}</div>
      </header>

      {/* 플로팅 메뉴 */}
      {isMenuOpen && (
        <div className="absolute top-20 left-10 w-64 bg-white shadow-2xl border border-slate-100 rounded-[24px] z-50 py-3">
          <ul className="p-2 py-3 text-slate-700 font-bold">
            <li className="p-4 hover:bg-blue-50 rounded-2xl cursor-pointer"
                onClick={() => { setModalType('notice'); setIsMenuOpen(false); }}>공지사항</li>
            <li className="p-4 bg-blue-50 text-blue-600 rounded-2xl cursor-pointer"
                onClick={() => setIsMenuOpen(false)}>외박 신청</li>
          </ul>
        </div>
      )}

      {/* 메인 */}
      <main className="max-w-7xl mx-auto p-10 flex flex-col lg:flex-row gap-8 items-stretch">

        {/* 달력 — 서버 요청 0, 순수 프론트 계산 */}
        <div className="lg:w-2/3 bg-white p-12 rounded-[40px] shadow-lg border border-slate-100 flex flex-col">

          {/* 월 네비게이션 */}
          <div className="mb-10 flex items-center justify-between">
            <button onClick={prevMonth}
              className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-slate-100 transition-all text-slate-400 text-xl font-black">
              ‹
            </button>
            <div className="text-center">
              <h2 className="text-3xl font-black text-slate-900">{monthLabel}</h2>
            </div>
            <button onClick={nextMonth}
              className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-slate-100 transition-all text-slate-400 text-xl font-black">
              ›
            </button>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 text-center text-xs font-black text-slate-300 uppercase mb-6">
            <div className="text-red-400">Sun</div><div>Mon</div><div>Tue</div>
            <div>Wed</div><div>Thu</div><div>Fri</div><div className="text-blue-400">Sat</div>
          </div>

          {/* 날짜 — JS Date로 자체 계산 */}
          <div className="grid grid-cols-7 gap-[10px] flex-1">
            {[...Array(firstDayOfWeek)].map((_, i) => <div key={`e-${i}`} className="h-20" />)}
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              const disabled = isDisabled(day);
              const selected = isSelected(day);
              const inRange = isInRange(day);
              const today = isTodayCell(day);

              return (
                <div key={day} onClick={() => handleDateClick(day)}
                  className={`
                    h-20 flex flex-col items-center justify-center rounded-[15px] transition-all relative
                    ${disabled ? 'bg-[#f8fafc] opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-[#f1f5f9]'}
                    ${selected ? 'bg-[#2563eb] !text-white !border-[#2563eb] z-10' : 'text-slate-600'}
                    ${inRange ? 'bg-[#eff6ff] !text-[#1d4ed8] !rounded-none' : ''}
                    ${today && !selected ? '!border-2 !border-yellow-300' : 'border border-[#f1f5f9]'}
                    font-black text-lg
                  `}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>

        {/* 신청 폼 */}
        <aside className="lg:w-1/3 flex">
          <div className="bg-white p-10 rounded-[40px] shadow-lg border border-blue-50 w-full flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-black mb-8 text-slate-800">신청 정보</h3>
              <div className="mb-8 space-y-3 p-6 bg-slate-50 rounded-3xl border border-slate-100 font-bold">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>성명 / 학번</span>
                  <span className="text-slate-700 text-sm">{userInfo.name} / {userInfo.studentId}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400 pt-3 border-t">
                  <span>소속 학과</span>
                  <span className="text-slate-700 text-sm">{userInfo.major}</span>
                </div>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-center font-black">
                  <div className="p-5 bg-blue-50 rounded-3xl border border-blue-100">
                    <p className="text-[10px] text-blue-400 mb-1 font-black">시작일</p>
                    <p className="text-sm text-blue-700">{fmt(startDate)}</p>
                  </div>
                  <div className="p-5 bg-blue-50 rounded-3xl border border-blue-100">
                    <p className="text-[10px] text-blue-400 mb-1 font-black">종료일</p>
                    <p className="text-sm text-blue-700">{fmt(endDate)}</p>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="행선지 주소 입력"
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[24px] outline-none font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting || !startDate || !endDate || !destination.trim()}
              className="w-full py-4 mt-8 bg-blue-50 hover:bg-blue-600 text-blue-400 hover:text-white font-black rounded-[24px] border border-blue-100 transition-all active:scale-95 disabled:cursor-not-allowed tracking-widest"
            >
              {submitting ? '처리중...' : '신청하기'}
            </button>
          </div>
        </aside>
      </main>

      {/* 공지사항 모달만 유지 (내역 조회 제거) */}
      {modalType === 'notice' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-10">
          <div className="bg-white w-[80%] h-[80%] rounded-[50px] shadow-2xl flex flex-col overflow-hidden">
            <div className="p-10 border-b flex justify-between items-center bg-white sticky top-0">
              <h4 className="text-3xl font-black text-slate-900">공지사항</h4>
              <button onClick={() => setModalType(null)} className="text-slate-300 hover:text-slate-900 text-5xl font-light">×</button>
            </div>
            <div className="p-10 flex-1 overflow-y-auto bg-slate-50 space-y-6">
              {notices.map(n => (
                <div key={n.id} className="p-8 bg-white rounded-[32px] border border-slate-100 shadow-sm">
                  <p className="text-xl font-black text-slate-800">{n.title}</p>
                  <p className="text-sm text-slate-400 mt-2 font-bold">{n.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DormitoryApp;
