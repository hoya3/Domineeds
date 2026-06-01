import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { loginApi, registerApi, getUserMe } from './api/auth';
import { createStayout, getMyStayouts, cancelStayout, getAllStayouts } from './api/stayout';

// ── 날짜 → YYYY-MM-DD 변환 ─────────────────────────────────
const toApiDate = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day   = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const fmt = (d) => d ? `${d.getMonth() + 1}월 ${d.getDate()}일` : '날짜 선택';

// ── 상태 배지 설정 ────────────────────────────────────────
const STATUS_CONFIG = {
  pending:   { label: '신청 완료', cls: 'bg-blue-50  text-blue-600  border-blue-200'  },
  cancelled: { label: '취소됨',   cls: 'bg-slate-50 text-slate-400 border-slate-200' },
};

// ── 기숙사 리스트 ──────────────────────────────────────────────────
const DORMS = ['참인재관', '다솜관', '세르비레관', '성김대건관', '효성관', '아마레관'];

// ─────────────────────────────────────────────────────────────
const DormitoryApp = () => {

  // ── 인증 상태 ─────────────────────────────────────────────
  const [authToken,      setAuthToken]      = useState(() => localStorage.getItem('access_token'));
  const [currentUser,    setCurrentUser]    = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // ── 인증 모드 ('login' | 'register') ────────────────────────
  const [authMode, setAuthMode] = useState('login');

  // ── 로그인 폼 ─────────────────────────────────────────────
  const [loginEmail,    setLoginEmail]    = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPw,   setShowLoginPw]   = useState(false);
  const [loginError,    setLoginError]    = useState('');
  const [loginLoading,  setLoginLoading]  = useState(false);

  // ── 회원가입 폼 ───────────────────────────────────────────
  const [regName,      setRegName]      = useState('');
  const [regEmail,     setRegEmail]     = useState('');
  const [regStudentId, setRegStudentId] = useState('');
  const [regDormName,  setRegDormName]  = useState('');
  const [regRoom,      setRegRoom]      = useState('');
  const [regPassword,  setRegPassword]  = useState('');
  const [regConfirm,   setRegConfirm]   = useState('');
  const [showRegPw,    setShowRegPw]    = useState(false);
  const [regError,     setRegError]     = useState('');
  const [regSuccess,   setRegSuccess]   = useState(false);
  const [regLoading,   setRegLoading]   = useState(false);

  // ── UI 상태 ───────────────────────────────────────────────
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [modalType,  setModalType]  = useState(null); // 'notice' | 'history' | null

  // ── 공지사항 (정적) ───────────────────────────────────────
  const notices = [
    { id: 1, title: '2026년 1학기 중간고사 기간 외박 지침 안내', date: '2026-03-25' },
    { id: 2, title: '기숙사 점검 및 방역 실시 공고',              date: '2026-03-20' },
  ];

  // ── 달력 상태 ─────────────────────────────────────────────
  const todayObj = new Date();
  todayObj.setHours(0, 0, 0, 0);

  const [calYear,  setCalYear]  = useState(todayObj.getFullYear());
  const [calMonth, setCalMonth] = useState(todayObj.getMonth());
  const [startDate, setStartDate] = useState(null);
  const [endDate,   setEndDate]   = useState(null);

  const limitDate = new Date(todayObj);
  limitDate.setDate(todayObj.getDate() + 6);

  const daysInMonth    = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay();
  const monthLabel     = `${calYear}년 ${calMonth + 1}월`;

  const toDateObj = (year, month, day) => {
    const d = new Date(year, month, day);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const isDisabled    = (day) => { const d = toDateObj(calYear, calMonth, day); return d < todayObj || d > limitDate; };
  const isTodayCell   = (day) => calYear === todayObj.getFullYear() && calMonth === todayObj.getMonth() && day === todayObj.getDate();
  const isSelected    = (day) => { const d = toDateObj(calYear, calMonth, day); return (startDate && d.getTime() === startDate.getTime()) || (endDate && d.getTime() === endDate.getTime()); };
  const isInRange     = (day) => { if (!startDate || !endDate) return false; const d = toDateObj(calYear, calMonth, day); return d > startDate && d < endDate; };
  const isSubmitted   = (day) => { const d = toDateObj(calYear, calMonth, day); return submittedRanges.some(r => d >= r.start && d <= r.end); };

  const handleDateClick = (day) => {
    if (isDisabled(day)) return;
    const clicked = toDateObj(calYear, calMonth, day);
    if (!startDate || (startDate && endDate)) { setStartDate(clicked); setEndDate(null); }
    else if (clicked < startDate) { setStartDate(clicked); }
    else { setEndDate(clicked); }
  };

  const prevMonth = () => { if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); } else setCalMonth(m => m - 1); setStartDate(null); setEndDate(null); };
  const nextMonth = () => { if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); } else setCalMonth(m => m + 1); setStartDate(null); setEndDate(null); };

  // ── 신청 폼 ───────────────────────────────────────────────
  const [destination,     setDestination]     = useState('');
  const [reason,          setReason]          = useState('');
  const [submitting,      setSubmitting]      = useState(false);
  const [submitError,     setSubmitError]     = useState('');
  const [submitSuccess,   setSubmitSuccess]   = useState(false);
  const [submittedRanges, setSubmittedRanges] = useState([]);

  // ── 신청 내역 ─────────────────────────────────────────────
  const [myStayouts,     setMyStayouts]     = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyFilter,  setHistoryFilter]  = useState('all');

  // ── 관리자 대시보드 ────────────────────────────────────────
  const [adminStayouts,  setAdminStayouts]  = useState([]);
  const [adminLoading,   setAdminLoading]   = useState(false);
  const [adminSearch,    setAdminSearch]    = useState('');
  const [adminDorm,      setAdminDorm]      = useState('all');
  const [adminStatus,    setAdminStatus]    = useState('all');

  // ── 초기 인증 확인 ────────────────────────────────────────
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) { setIsInitializing(false); return; }
      try {
        const user = await getUserMe();
        setCurrentUser(user);
      } catch {
        localStorage.removeItem('access_token');
        setAuthToken(null);
      } finally {
        setIsInitializing(false);
      }
    };
    initAuth();
  }, []);

  // ── 내역 조회 ─────────────────────────────────────────────
  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const data = await getMyStayouts();
      setMyStayouts(data);
    } catch (e) {
      console.error('내역 조회 실패:', e);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (modalType === 'history') fetchHistory();
  }, [modalType, fetchHistory]);

  // ── 관리자 전체 내역 조회 ────────────────────────────────────
  const fetchAllStayouts = useCallback(async () => {
    setAdminLoading(true);
    try {
      const data = await getAllStayouts();
      setAdminStayouts(data);
    } catch (e) {
      console.error('글로므 조회 실패:', e);
    } finally {
      setAdminLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser?.is_superuser) fetchAllStayouts();
  }, [currentUser, fetchAllStayouts]);

  // ── 로그인 핸들러 ─────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const data = await loginApi(loginEmail, loginPassword);
      localStorage.setItem('access_token', data.access_token);
      setAuthToken(data.access_token);
      const user = await getUserMe();
      setCurrentUser(user);
    } catch (err) {
      setLoginError(err.response?.data?.detail || '이메일 또는 비밀번호를 확인해주세요.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setAuthToken(null);
    setCurrentUser(null);
    setIsMenuOpen(false);
  };

  // ── 회원가입 핸들러 ───────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError('');
    if (regPassword !== regConfirm) {
      setRegError('비밀번호가 일치하지 않습니다.'); return;
    }
    if (regPassword.length < 6) {
      setRegError('비밀번호는 6자 이상이어야 합니다.'); return;
    }
    setRegLoading(true);
    try {
      await registerApi({ email: regEmail, password: regPassword, full_name: regName, student_id: regStudentId, dorm_name: regDormName, room_number: regRoom });
      setRegSuccess(true);
      setTimeout(() => {
        setAuthMode('login');
        setLoginEmail(regEmail);
        setRegSuccess(false);
        setRegName(''); setRegEmail(''); setRegStudentId('');
        setRegRoom(''); setRegPassword(''); setRegConfirm('');
      }, 1500);
    } catch (err) {
      setRegError(err.response?.data?.detail || '회원가입에 실패했습니다.');
    } finally {
      setRegLoading(false);
    }
  };

  // ── 외박 신청 핸들러 ──────────────────────────────────────
  const handleSubmit = async () => {
    if (!startDate || !endDate || !destination.trim()) return;
    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);
    try {
      await createStayout({
        start_date:  toApiDate(startDate),
        end_date:    toApiDate(endDate),
        destination: destination.trim(),
        reason:      reason.trim() || undefined,
      });
      setSubmittedRanges(prev => [...prev, { start: startDate, end: endDate }]);
      setSubmitSuccess(true);
      setStartDate(null);
      setEndDate(null);
      setDestination('');
      setReason('');
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      setSubmitError(err.response?.data?.detail || '신청 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── 신청 취소 핸들러 ──────────────────────────────────────
  const handleCancelStayout = async (id) => {
    if (!window.confirm('이 외박 신청을 취소하시겠습니까?')) return;
    try {
      await cancelStayout(id);
      fetchHistory();
    } catch (err) {
      alert(err.response?.data?.detail || '취소 중 오류가 발생했습니다.');
    }
  };

  // ── 렌더: 초기화 중 ───────────────────────────────────────
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── 렌더: 로그인 / 회원가입 화면 ─────────────────────────
  if (!authToken || !currentUser) {
    const inputCls = 'w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-800 placeholder-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all text-sm';

    return (
      <div className="min-h-screen flex font-['Noto_Sans_KR']">

        {/* 왼쪽 — 브랜딩 패널 */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 flex-col justify-between p-16 relative overflow-hidden">
          {/* 배경 장식 */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/10 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <h1 className="text-4xl font-black text-white tracking-tight">Domineeds</h1>
            <p className="text-blue-300 mt-2 font-bold text-sm tracking-widest">기숙사 외박 신청 시스템</p>
          </div>

          <div className="relative z-10 space-y-8">
            {[
              { icon: '📅', title: '간편한 날짜 선택', desc: '달력에서 날짜를 클릭하는 것만으로 외박 신청 완료' },
              { icon: '📋', title: '실시간 신청 내역', desc: '승인 여부를 언제든지 확인하고 취소 가능' },
              { icon: '🔒', title: '안전한 인증', desc: 'JWT 기반 보안 인증으로 개인정보 보호' },
            ].map(f => (
              <div key={f.title} className="flex items-start gap-4">
                <span className="text-2xl flex-shrink-0 mt-0.5">{f.icon}</span>
                <div>
                  <p className="text-white font-black text-sm">{f.title}</p>
                  <p className="text-blue-300 text-xs font-bold mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="relative z-10 text-blue-400 text-xs font-bold">© 2026 Domineeds. All rights reserved.</p>
        </div>

        {/* 오른쪽 — 폼 패널 */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-md">

            {/* 모바일 브랜딩 */}
            <div className="lg:hidden text-center mb-8">
              <h1 className="text-3xl font-black text-slate-900">Domineeds</h1>
              <p className="text-slate-400 mt-1 font-bold text-sm">기숙사 외박 신청 시스템</p>
            </div>

            {/* 탭 전환 */}
            <div className="flex bg-slate-100 rounded-2xl p-1 mb-8">
              {[['login', '로그인'], ['register', '회원가입']].map(([mode, label]) => (
                <button key={mode}
                  onClick={() => { setAuthMode(mode); setLoginError(''); setRegError(''); }}
                  className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${
                    authMode === mode
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >{label}</button>
              ))}
            </div>

            {/* ── 로그인 폼 ── */}
            {authMode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 mb-1.5 ml-1">이메일</label>
                  <input type="email" placeholder="student@university.ac.kr" value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)} required className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 mb-1.5 ml-1">비밀번호</label>
                  <div className="relative">
                    <input type={showLoginPw ? 'text' : 'password'} placeholder="비밀번호 입력" value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)} required className={`${inputCls} pr-12`} />
                    <button type="button" onClick={() => setShowLoginPw(v => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 text-lg transition-colors">
                      {showLoginPw ? '🙈' : '👁'}
                    </button>
                  </div>
                </div>
                {loginError && <p className="text-red-500 text-sm font-bold text-center py-1">{loginError}</p>}
                <button type="submit" disabled={loginLoading}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black rounded-2xl transition-all active:scale-95 tracking-widest mt-2">
                  {loginLoading ? '로그인 중...' : '로그인'}
                </button>
                <p className="text-center text-slate-400 text-sm font-bold pt-2">
                  계정이 없으신가요?{' '}
                  <button type="button" onClick={() => setAuthMode('register')}
                    className="text-blue-500 hover:text-blue-700 font-black">회원가입</button>
                </p>
              </form>
            )}

            {/* ── 회원가입 폼 ── */}
            {authMode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3">
                {regSuccess ? (
                  <div className="py-12 text-center">
                    <div className="text-5xl mb-4">✅</div>
                    <p className="font-black text-slate-800 text-lg">회원가입 완료!</p>
                    <p className="text-slate-400 text-sm font-bold mt-2">잠시 후 로그인 화면으로 이동합니다.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-black text-slate-400 mb-1.5 ml-1">이름 *</label>
                        <input type="text" placeholder="홍길동" value={regName}
                          onChange={e => setRegName(e.target.value)} required className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-400 mb-1.5 ml-1">학번 *</label>
                        <input type="text" placeholder="20240001" value={regStudentId}
                          onChange={e => setRegStudentId(e.target.value)} required className={inputCls} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 mb-1.5 ml-1">이메일 *</label>
                      <input type="email" placeholder="student@university.ac.kr" value={regEmail}
                        onChange={e => setRegEmail(e.target.value)} required className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 mb-1.5 ml-1">기숙사 *</label>
                      <select value={regDormName} onChange={e => setRegDormName(e.target.value)} required
                        className={`${inputCls} cursor-pointer`}>
                        <option value="">기숙사를 선택하세요</option>
                        {DORMS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 mb-1.5 ml-1">호실 (선택)</label>
                      <input type="text" placeholder="예: A동 302호" value={regRoom}
                        onChange={e => setRegRoom(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 mb-1.5 ml-1">비밀번호 * (6자 이상)</label>
                      <div className="relative">
                        <input type={showRegPw ? 'text' : 'password'} placeholder="비밀번호 설정" value={regPassword}
                          onChange={e => setRegPassword(e.target.value)} required className={`${inputCls} pr-12`} />
                        <button type="button" onClick={() => setShowRegPw(v => !v)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 text-lg transition-colors">
                          {showRegPw ? '🙈' : '👁'}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 mb-1.5 ml-1">비밀번호 확인 *</label>
                      <input type="password" placeholder="비밀번호 재입력" value={regConfirm}
                        onChange={e => setRegConfirm(e.target.value)} required className={`${inputCls} ${regConfirm && regConfirm !== regPassword ? 'border-red-300 ring-1 ring-red-300' : ''}`} />
                      {regConfirm && regConfirm !== regPassword && (
                        <p className="text-red-400 text-xs font-bold mt-1 ml-1">비밀번호가 일치하지 않습니다.</p>
                      )}
                    </div>
                    {regError && <p className="text-red-500 text-sm font-bold text-center py-1">{regError}</p>}
                    <button type="submit" disabled={regLoading || (!!regConfirm && regConfirm !== regPassword)}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black rounded-2xl transition-all active:scale-95 tracking-widest mt-1">
                      {regLoading ? '가입 중...' : '회원가입'}
                    </button>
                    <p className="text-center text-slate-400 text-sm font-bold pt-1">
                      이미 계정이 있으신가요?{' '}
                      <button type="button" onClick={() => setAuthMode('login')}
                        className="text-blue-500 hover:text-blue-700 font-black">로그인</button>
                    </p>
                  </>
                )}
              </form>
            )}

          </div>
        </div>
      </div>
    );
  }

  // ── 렌더: 메인 대시보드 ───────────────────────────────────
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
          <h1 className="text-xl font-black text-slate-900">{currentUser.full_name}님 반갑습니다</h1>
        </div>
        <div className="text-sm font-bold text-slate-400">{currentUser.student_id}</div>
      </header>

      {/* 플로팅 메뉴 */}
      {isMenuOpen && (
        <div className="absolute top-20 left-10 w-64 bg-white shadow-2xl border border-slate-100 rounded-[24px] z-50 py-3">
          <ul className="p-2 py-3 text-slate-700 font-bold">
            <li className="p-4 hover:bg-blue-50 rounded-2xl cursor-pointer" onClick={() => { setModalType('notice'); setIsMenuOpen(false); }}>공지사항</li>
            <li className="p-4 bg-blue-50 text-blue-600 rounded-2xl cursor-pointer" onClick={() => setIsMenuOpen(false)}>외박 신청</li>
            <li className="p-4 hover:bg-blue-50 rounded-2xl cursor-pointer" onClick={() => { setModalType('history'); setIsMenuOpen(false); }}>신청 내역</li>
            <li className="p-4 hover:bg-red-50 text-red-400 rounded-2xl cursor-pointer" onClick={handleLogout}>로그아웃</li>
          </ul>
        </div>
      )}

      {/* 메인 */}
      <main className="max-w-7xl mx-auto p-10 flex flex-col lg:flex-row gap-8 items-stretch">

        {/* 달력 */}
        <div className="lg:w-2/3 bg-white p-12 rounded-[40px] shadow-lg border border-slate-100 flex flex-col">
          <div className="mb-10 flex items-center justify-between">
            <button onClick={prevMonth} className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-slate-100 transition-all text-slate-400 text-xl font-black">‹</button>
            <h2 className="text-3xl font-black text-slate-900">{monthLabel}</h2>
            <button onClick={nextMonth} className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-slate-100 transition-all text-slate-400 text-xl font-black">›</button>
          </div>
          <div className="grid grid-cols-7 text-center text-xs font-black text-slate-300 uppercase mb-6">
            <div className="text-red-400">Sun</div><div>Mon</div><div>Tue</div>
            <div>Wed</div><div>Thu</div><div>Fri</div><div className="text-blue-400">Sat</div>
          </div>
          <div className="grid grid-cols-7 gap-[10px] flex-1">
            {[...Array(firstDayOfWeek)].map((_, i) => <div key={`e-${i}`} className="h-20" />)}
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              const disabled  = isDisabled(day);
              const selected  = isSelected(day);
              const inRange   = isInRange(day);
              const today     = isTodayCell(day);
              const submitted = isSubmitted(day);
              return (
                <div key={day} onClick={() => handleDateClick(day)}
                  className={`h-20 flex flex-col items-center justify-center rounded-[15px] transition-all relative
                    ${disabled ? 'bg-[#f8fafc] opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-[#f1f5f9]'}
                    ${selected ? 'bg-[#2563eb] !text-white !border-[#2563eb] z-10' : 'text-slate-600'}
                    ${inRange  ? 'bg-[#eff6ff] !text-[#1d4ed8] !rounded-none' : ''}
                    ${submitted && !selected ? '!bg-green-100 !text-green-700 !border-green-300' : ''}
                    ${today && !selected ? '!border-2 !border-yellow-300' : 'border border-[#f1f5f9]'}
                    font-black text-lg`}
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

              {/* 사용자 정보 — API에서 가져온 실제 데이터 */}
              <div className="mb-8 space-y-3 p-6 bg-slate-50 rounded-3xl border border-slate-100 font-bold">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>성명 / 학번</span>
                  <span className="text-slate-700 text-sm">{currentUser.full_name} / {currentUser.student_id}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400 pt-3 border-t">
                  <span>기숙사</span>
                  <span className="text-slate-700 text-sm">{currentUser.dorm_name || '-'}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400 pt-3 border-t">
                  <span>호실</span>
                  <span className="text-slate-700 text-sm">{currentUser.room_number || '-'}</span>
                </div>
              </div>

              <div className="space-y-4">
                {/* 선택된 날짜 */}
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

                {/* 행선지 입력 */}
                <input
                  type="text"
                  placeholder="행선지 주소 입력"
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[24px] outline-none font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                />

                {/* 외박 사유 입력 */}
                <textarea
                  placeholder="외박 사유 입력 (선택)"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  rows={2}
                  className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[24px] outline-none font-bold focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                />

                {/* 성공/오류 메시지 */}
                {submitSuccess && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-green-600 text-sm font-bold text-center">
                    ✅ 외박 신청이 완료되었습니다!
                  </div>
                )}
                {submitError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-500 text-sm font-bold text-center">
                    {submitError}
                  </div>
                )}
              </div>
            </div>

            {/* 신청 버튼 */}
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

      {/* ──────── 관리자 대시보드 ──────── */}
      {currentUser.is_superuser && (() => {
        const nights = (item) => Math.max(0, Math.round((new Date(item.end_date) - new Date(item.start_date)) / 86400000));
        const filtered = adminStayouts.filter(item => {
          const matchDorm   = adminDorm   === 'all' || item.user?.dorm_name === adminDorm;
          const matchStatus = adminStatus === 'all' || item.status === adminStatus;
          const q = adminSearch.toLowerCase();
          const matchSearch = !q ||
            item.user?.full_name?.toLowerCase().includes(q) ||
            item.user?.student_id?.toLowerCase().includes(q);
          return matchDorm && matchStatus && matchSearch;
        });
        return (
          <div className="fixed inset-0 bg-[#f8fafc] z-[100] overflow-y-auto font-['Noto_Sans_KR']">
            {/* 관리자 헤더 */}
            <div className="bg-white border-b shadow-sm px-10 py-5 flex justify-between items-center sticky top-0 z-10">
              <div>
                <h2 className="text-2xl font-black text-slate-900">관리자 대시보드</h2>
                <p className="text-slate-400 text-xs font-bold mt-0.5">전체 외박 신청 현황</p>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={fetchAllStayouts}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black rounded-2xl text-sm transition-all">
                  새로고침
                </button>
                <button onClick={handleLogout}
                  className="px-5 py-2.5 bg-red-50 hover:bg-red-500 text-red-400 hover:text-white font-black rounded-2xl text-sm transition-all border border-red-200">
                  로그아웃
                </button>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-10 py-8">
              {/* 통계 */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: '전체 신청', value: adminStayouts.length, cls: 'text-slate-700 bg-white border-slate-200' },
                  { label: '신청 완료', value: adminStayouts.filter(i => i.status === 'pending').length, cls: 'text-blue-700 bg-blue-50 border-blue-200' },
                  { label: '취소됨',   value: adminStayouts.filter(i => i.status === 'cancelled').length, cls: 'text-slate-600 bg-slate-50 border-slate-200' },
                ].map(s => (
                  <div key={s.label} className={`p-5 rounded-2xl border shadow-sm text-center ${s.cls}`}>
                    <p className="text-3xl font-black">{s.value}</p>
                    <p className="text-xs font-bold mt-1 opacity-70">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* 필터 */}
              <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm p-6 mb-6 flex flex-wrap gap-4">
                <input
                  type="text" placeholder="이름 또는 학번 검색"
                  value={adminSearch} onChange={e => setAdminSearch(e.target.value)}
                  className="flex-1 min-w-[200px] px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <select value={adminDorm} onChange={e => setAdminDorm(e.target.value)}
                  className="px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 text-sm cursor-pointer">
                  <option value="all">전체 기숙사</option>
                  {DORMS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={adminStatus} onChange={e => setAdminStatus(e.target.value)}
                  className="px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 text-sm cursor-pointer">
                  <option value="all">전체 상태</option>
                  <option value="pending">신청 완료</option>
                  <option value="cancelled">취소됨</option>
                </select>

                <span className="self-center text-slate-400 font-black text-sm">{filtered.length}건</span>
              </div>

              {/* 신청 리스트 */}
              {adminLoading ? (
                <div className="flex justify-center py-20">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-20 text-slate-300">
                  <div className="text-6xl mb-4">📋</div>
                  <p className="font-black text-slate-400">합에 맞는 신청이 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map(item => {
                    const st = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
                    return (
                      <div key={item.id} className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-start justify-between gap-6">
                          {/* 학생 정보 */}
                          <div className="flex items-center gap-4 w-56 flex-shrink-0">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 font-black text-lg flex-shrink-0">
                              {item.user?.full_name?.[0] || '?'}
                            </div>
                            <div>
                              <p className="font-black text-slate-800">{item.user?.full_name || '미상'}</p>
                              <p className="text-xs text-slate-400 font-bold">{item.user?.student_id}</p>
                              <p className="text-xs text-blue-500 font-bold mt-0.5">{item.user?.dorm_name} {item.user?.room_number && `· ${item.user.room_number}`}</p>
                            </div>
                          </div>

                          {/* 날짜 */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-xs font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">출발</span>
                              <span className="font-black text-slate-800 text-sm">{item.start_date}</span>
                              <span className="text-slate-300">→</span>
                              <span className="text-xs font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">복귀</span>
                              <span className="font-black text-slate-800 text-sm">{item.end_date}</span>
                              <span className="text-xs font-black text-blue-500 bg-blue-50 px-2 py-1 rounded-full border border-blue-100">{nights(item)}박</span>
                            </div>
                            <p className="text-sm text-slate-500 font-bold">📍 {item.destination}</p>
                            {item.reason && <p className="text-xs text-slate-400 font-bold mt-1">💬 {item.reason}</p>}
                          </div>

                          {/* 상태 + 날짜 */}
                          <div className="text-right flex-shrink-0">
                            <span className={`text-xs font-black px-3 py-1.5 rounded-full border ${st.cls}`}>{st.label}</span>
                            <p className="text-xs text-slate-300 font-bold mt-2">{item.created_at?.slice(0, 10)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* 공지사항 모달 */}
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

      {/* 신청 내역 모달 */}
      {modalType === 'history' && (() => {
        const countOf = (s) => myStayouts.filter(i => i.status === s).length;
        const nightsOf = (item) => {
          const ms = new Date(item.end_date) - new Date(item.start_date);
          return Math.max(0, Math.round(ms / 86400000));
        };
        const filtered = historyFilter === 'all'
          ? myStayouts
          : myStayouts.filter(i => i.status === historyFilter);

        const FILTER_TABS = [
          { key: 'all',       label: '전체',   count: myStayouts.length },
          { key: 'pending',   label: '신청 완료', count: countOf('pending')   },
          { key: 'cancelled', label: '취소됨',  count: countOf('cancelled') },
        ];

        const EMPTY_MESSAGES = {
          all:       '아직 외박 신청 내역이 없습니다.',
          pending:   '신청 완료된 내역이 없습니다.',
          cancelled: '취소된 신청이 없습니다.',
        };

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-6 lg:p-10">
            <div className="bg-white w-full max-w-3xl h-[90%] rounded-[40px] shadow-2xl flex flex-col overflow-hidden">

              {/* 헤더 */}
              <div className="px-10 pt-10 pb-6 border-b border-slate-100 flex justify-between items-center flex-shrink-0">
                <div>
                  <h4 className="text-3xl font-black text-slate-900">신청 내역</h4>
                  <p className="text-slate-400 text-sm font-bold mt-1">총 {myStayouts.length}건의 신청</p>
                </div>
                <button onClick={() => { setModalType(null); setHistoryFilter('all'); }}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-slate-100 text-slate-400 hover:text-slate-900 text-3xl font-light transition-all">×</button>
              </div>

              {historyLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {/* 통계 카드 */}
                  <div className="px-10 py-6 grid grid-cols-3 gap-4 flex-shrink-0">
                    {[
                      { label: '전체',     value: myStayouts.length,    color: 'bg-slate-50 border-slate-200 text-slate-700' },
                      { label: '신청 완료', value: countOf('pending'),   color: 'bg-blue-50  border-blue-200  text-blue-600'  },
                      { label: '취소됨',   value: countOf('cancelled'), color: 'bg-slate-50 border-slate-200 text-slate-400' },
                    ].map(s => (
                      <div key={s.label} className={`p-4 rounded-2xl border text-center ${s.color}`}>
                        <p className="text-2xl font-black">{s.value}</p>
                        <p className="text-xs font-bold mt-1 opacity-70">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* 필터 탭 */}
                  <div className="px-10 pb-4 flex gap-2 flex-shrink-0 overflow-x-auto">
                    {FILTER_TABS.map(tab => (
                      <button key={tab.key}
                        onClick={() => setHistoryFilter(tab.key)}
                        className={`flex-shrink-0 px-4 py-2 rounded-full font-black text-sm border transition-all ${
                          historyFilter === tab.key
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        {tab.label}
                        {tab.count > 0 && (
                          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                            historyFilter === tab.key ? 'bg-white/20' : 'bg-slate-100'
                          }`}>{tab.count}</span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* 내역 리스트 */}
                  <div className="flex-1 overflow-y-auto px-10 pb-10 space-y-3">
                    {filtered.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                        <div className="text-6xl mb-4">📋</div>
                        <p className="font-black text-lg text-slate-400">{EMPTY_MESSAGES[historyFilter]}</p>
                      </div>
                    ) : (
                      filtered.map(item => {
                        const st     = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
                        const nights = nightsOf(item);
                        return (
                          <div key={item.id}
                            className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm hover:shadow-md transition-all"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                {/* 상태 + 신청일 */}
                                <div className="flex items-center gap-3 mb-3">
                                  <span className={`text-xs font-black px-3 py-1.5 rounded-full border ${st.cls}`}>
                                    {st.label}
                                  </span>
                                  <span className="text-slate-300 text-xs font-bold">
                                    신청일 {item.created_at?.slice(0, 10)}
                                  </span>
                                </div>

                                {/* 날짜 범위 */}
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">출발</span>
                                    <span className="font-black text-slate-800">{item.start_date}</span>
                                  </div>
                                  <span className="text-slate-300 font-black">→</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">복귀</span>
                                    <span className="font-black text-slate-800">{item.end_date}</span>
                                  </div>
                                  <span className="ml-auto text-xs font-black text-blue-500 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                                    {nights}박
                                  </span>
                                </div>

                                {/* 행선지 */}
                                <p className="text-sm text-slate-500 font-bold">📍 {item.destination}</p>
                              </div>

                              {/* 취소 버튼 (검토 중일 때만) */}
                              {item.status === 'pending' && (
                                <button
                                  onClick={() => handleCancelStayout(item.id)}
                                  className="ml-6 px-5 py-2 bg-red-50 text-red-400 border border-red-200 rounded-2xl font-black text-sm hover:bg-red-500 hover:text-white transition-all flex-shrink-0"
                                >
                                  취소
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default DormitoryApp;
