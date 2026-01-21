import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { 
  FaStopwatch, FaBullhorn, FaCheckCircle, 
  FaUserPlus, FaTrash, FaList, 
  FaBan, FaTimesCircle, FaExclamationTriangle, FaPaperPlane,
  FaLock, FaUnlock 
} from 'react-icons/fa';
// 배포 환경에 따라 API 주소 자동 설정 (config.js가 있다면 import해서 쓰셔도 됩니다)
import { API_BASE_URL } from './config'; // config.js가 없다면 아래 줄 주석 해제 후 직접 입력
// const API_BASE_URL = 'http://127.0.0.1:8000'; 


// ★ 설정: 여기서 비밀번호를 바꾸세요!
const ADMIN_PASSWORD = "viva"; 
const API_BASE = `${API_BASE_URL}/api`;

export default function Admin() {
  // --- 0. 로그인 상태 관리 (보안 기능 추가) ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  // 탭 상태
  const [activeTab, setActiveTab] = useState('timing');

  // 계측 모드 상태
  const [bib, setBib] = useState('');
  const [record, setRecord] = useState('');
  const bibRef = useRef(null);
  
  // 공지사항 상태
  const [noticeMsg, setNoticeMsg] = useState('');

  // 선수 관리 모드 상태
  const [regBib, setRegBib] = useState('');
  const [regName, setRegName] = useState('');
  const [racerList, setRacerList] = useState([]);
  const regBibRef = useRef(null);

  // 컴포넌트 마운트 시 로그인 여부 확인 (새로고침 해도 유지)
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('viva_admin_auth');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // 로그인 핸들러
  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('viva_admin_auth', 'true'); // 세션에 저장
    } else {
      alert('비밀번호가 틀렸습니다!');
      setPasswordInput('');
    }
  };

  // 로그아웃 핸들러
  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('viva_admin_auth');
  };

  // 알림 함수
  const notify = (msg, isError = false) => {
    alert(isError ? `❌ ${msg}` : `✅ ${msg}`);
  };

  // --- 기존 로직들 (API 호출) ---
  const submitStatus = async (bibNo, timeVal, statusVal) => {
    try {
      await axios.post(`${API_BASE}/racers/input_record/`, { 
        bib: bibNo, record: timeVal, status: statusVal 
      });
      setBib(''); setRecord(''); bibRef.current?.focus();
      if(statusVal === 'FINISH') notify(`${bibNo}번 기록 저장 완료`);
      else notify(`${bibNo}번 ${statusVal} 처리 완료`, true);
    } catch (err) { notify('전송 실패', true); }
  };

  const handleRecordSubmit = async (e) => {
    e.preventDefault();
    if (!bib || !record) return;
    submitStatus(bib, record, 'FINISH');
  };

  const handleException = (statusType) => {
    if (!bib) { notify('비브 번호를 입력해주세요!', true); bibRef.current?.focus(); return; }
    if (window.confirm(`${bib}번 선수를 [${statusType}] 처리하시겠습니까?`)) {
      submitStatus(bib, null, statusType);
    }
  };

  const handleNoticeSubmit = async (e) => {
    e.preventDefault();
    if (!noticeMsg) return;
    try {
      await axios.post(`${API_BASE}/notices/`, { content: noticeMsg, is_active: true });
      setNoticeMsg(''); notify('공지 등록 완료!');
    } catch (err) { notify('공지 등록 실패', true); }
  };

  const fetchRacers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/startlist/`);
      setRacerList(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (isAuthenticated && activeTab === 'management') fetchRacers();
  }, [isAuthenticated, activeTab]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regBib || !regName) return;
    try {
      await axios.post(`${API_BASE}/racers/`, { bib_number: regBib, name: regName, status: 'START' });
      setRegBib(''); setRegName(''); regBibRef.current?.focus();
      fetchRacers(); 
    } catch (err) { notify('등록 실패 (중복 번호)', true); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try { await axios.delete(`${API_BASE}/racers/${id}/`); fetchRacers(); } 
    catch (err) { notify('삭제 실패', true); }
  };

  // ============================================================
  // 🔒 로그인 화면 (인증되지 않았을 때 표시)
  // ============================================================
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700 text-center max-w-md w-full">
          <FaLock className="text-red-600 text-5xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">관리자 접속 제한</h2>
          <p className="text-gray-400 mb-6">관계자 외 기록 입력을 제한합니다.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="비밀번호 입력" 
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full p-4 text-xl bg-gray-900 text-white border border-gray-600 rounded-xl focus:border-red-600 focus:outline-none text-center"
              autoFocus
            />
            <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition">
              접속하기
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ============================================================
  // 🔓 관리자 콘솔 (인증되었을 때 표시 - 기존 코드)
  // ============================================================
  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          관리자 콘솔 <span className="text-red-600">.</span>
        </h1>
        
        <div className="flex gap-2">
          {/* 탭 버튼들 */}
          <div className="bg-gray-800 p-1 rounded-lg flex">
            <button onClick={() => setActiveTab('timing')} className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${activeTab === 'timing' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}>
              <FaStopwatch className="inline mb-1 mr-1" /> 계측
            </button>
            <button onClick={() => setActiveTab('management')} className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${activeTab === 'management' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>
              <FaUserPlus className="inline mb-1 mr-1" /> 관리
            </button>
          </div>
          {/* 로그아웃 버튼 */}
          <button onClick={handleLogout} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg ml-2">
            <FaUnlock />
          </button>
        </div>
      </div>

      {/* ... (이하 탭별 UI는 기존과 동일) ... */}
      
      {activeTab === 'timing' && (
        <div className="space-y-8 animate-fade-in-up">
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border-l-4 border-red-600">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <FaStopwatch className="text-red-500" size={28} /> 경기 기록 입력
            </h2>
            <form onSubmit={handleRecordSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <input ref={bibRef} type="number" placeholder="Bib" value={bib} onChange={e => setBib(e.target.value)} autoFocus
                    className="w-full p-4 text-3xl font-mono font-bold bg-gray-900 text-white border-2 border-gray-700 rounded-xl focus:border-red-600 focus:outline-none text-center" />
                  <span className="absolute top-2 left-4 text-gray-500 text-sm font-bold">BIB</span>
                </div>
                <div className="flex-1 relative">
                  <input type="number" step="0.01" placeholder="00.00" value={record} onChange={e => setRecord(e.target.value)}
                    className="w-full p-4 text-3xl font-mono font-bold bg-gray-900 text-white border-2 border-gray-700 rounded-xl focus:border-red-600 focus:outline-none text-center" />
                  <span className="absolute top-2 left-4 text-gray-500 text-sm font-bold">TIME</span>
                </div>
              </div>
              <button type="submit" className="w-full bg-red-600 text-white px-8 py-4 rounded-xl font-bold text-xl hover:bg-red-700 transition shadow-lg flex items-center justify-center gap-2 active:scale-95">
                <FaCheckCircle /> 완주 (FINISH) 기록 전송
              </button>
              <div className="grid grid-cols-3 gap-3 mt-2">
                <button type="button" onClick={() => handleException('DNS')} className="bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-lg font-bold flex flex-col items-center justify-center gap-1 active:scale-95 border border-gray-500"><FaBan className="text-xl"/> DNS</button>
                <button type="button" onClick={() => handleException('DNF')} className="bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-lg font-bold flex flex-col items-center justify-center gap-1 active:scale-95 border border-orange-500"><FaTimesCircle className="text-xl"/> DNF</button>
                <button type="button" onClick={() => handleException('DSQ')} className="bg-red-900 hover:bg-red-800 text-white py-3 rounded-lg font-bold flex flex-col items-center justify-center gap-1 active:scale-95 border border-red-500"><FaExclamationTriangle className="text-xl"/> DQ</button>
              </div>
            </form>
          </div>
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border-l-4 border-white">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3"><FaBullhorn className="text-white" size={28} /> 실시간 공지</h2>
            <form onSubmit={handleNoticeSubmit} className="flex gap-4">
              <input type="text" placeholder="공지 내용 입력..." value={noticeMsg} onChange={e => setNoticeMsg(e.target.value)} className="flex-1 p-4 bg-gray-900 text-white border-2 border-gray-700 rounded-xl focus:border-white focus:outline-none" />
              <button type="submit" className="bg-white text-gray-900 px-8 rounded-xl font-bold hover:bg-gray-100 transition shadow-lg flex items-center gap-2"><FaPaperPlane /> 등록</button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'management' && (
        <div className="space-y-8 animate-fade-in-up">
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border-l-4 border-blue-500">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3"><FaUserPlus className="text-blue-500" size={28} /> 선수 등록</h2>
            <form onSubmit={handleRegister} className="flex gap-4">
              <input ref={regBibRef} type="number" placeholder="번호" value={regBib} onChange={e => setRegBib(e.target.value)} autoFocus className="w-24 p-3 text-xl font-bold bg-gray-900 text-white border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none text-center" />
              <input type="text" placeholder="이름 (예: 홍길동)" value={regName} onChange={e => setRegName(e.target.value)} className="flex-1 p-3 text-xl font-bold bg-gray-900 text-white border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none" />
              <button type="submit" className="bg-blue-600 text-white px-6 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg active:scale-95">추가</button>
            </form>
          </div>
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
            <h3 className="text-gray-400 font-bold mb-4 flex items-center gap-2"><FaList /> 등록된 선수 목록 ({racerList.length}명)</h3>
            <div className="max-h-96 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {racerList.length === 0 ? <div className="text-gray-500 text-center py-4">등록된 선수가 없습니다.</div> : racerList.map((r) => (
                <div key={r.id} className="flex justify-between items-center bg-gray-900 p-3 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-4">
                    <span className="text-blue-400 font-mono font-bold text-xl w-12 text-center">{r.bib_number}</span>
                    <span className="text-white font-bold text-lg">{r.name}</span>
                    {r.status === 'FINISH' && <span className="text-xs bg-green-900 text-green-400 px-2 py-1 rounded">완주</span>}
                    {(r.status === 'DNS' || r.status === 'DNF' || r.status === 'DSQ') && <span className="text-xs bg-red-900 text-red-400 px-2 py-1 rounded">{r.status}</span>}
                  </div>
                  <button onClick={() => handleDelete(r.id)} className="text-gray-500 hover:text-red-500 transition p-2"><FaTrash /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}