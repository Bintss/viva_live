import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { 
  FaStopwatch, FaBullhorn, FaCheckCircle, 
  FaUserPlus, FaTrash, FaList, 
  FaBan, FaTimesCircle, FaExclamationTriangle, FaPaperPlane,
  FaLock, FaUnlock 
} from 'react-icons/fa';

import { API_BASE_URL } from './config'; 

const ADMIN_PASSWORD = "viva365"; 
const API_BASE = `${API_BASE_URL}/api`;

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [activeTab, setActiveTab] = useState('timing');
  

  // 계측 상태
  const [bib, setBib] = useState('');
  const [record, setRecord] = useState('');
  const bibRef = useRef(null);
  const [runType, setRunType] = useState('1');
  
  // 공지 상태
  const [noticeMsg, setNoticeMsg] = useState('');

  // 선수 관리 상태
  const [regBib, setRegBib] = useState('');
  const [regName, setRegName] = useState('');
  const [regCategory, setRegCategory] = useState(''); // ✅ 부서 상태 추가
  const [racerList, setRacerList] = useState([]);
  const regBibRef = useRef(null);

  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('viva_admin_auth');
    if (sessionAuth === 'true') setIsAuthenticated(true);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('viva_admin_auth', 'true');
    } else {
      alert('비밀번호가 틀렸습니다!');
      setPasswordInput('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('viva_admin_auth');
  };

  const notify = (msg, isError = false) => {
    alert(isError ? `❌ ${msg}` : `✅ ${msg}`);
  };

  // --- API 로직 ---
  const submitStatus = async (bibNo, timeVal, statusVal) => {
    try {
      await axios.post(`${API_BASE}/racers/input_record/`, { 
        bib: bibNo, record: timeVal, status: statusVal, run_type: runType 
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
      // ✅ category 필드 추가 전송
      await axios.post(`${API_BASE}/racers/`, { 
        bib_number: regBib, 
        name: regName, 
        category: regCategory, 
        status: 'START' 
      });
      setRegBib(''); setRegName(''); setRegCategory(''); // 초기화
      regBibRef.current?.focus();
      fetchRacers(); 
    } catch (err) { notify('등록 실패 (중복 번호)', true); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try { await axios.delete(`${API_BASE}/racers/${id}/`); fetchRacers(); } 
    catch (err) { notify('삭제 실패', true); }
  };

  // ... (로그인 UI 생략 - 기존과 동일)
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="bg-gray-800 p-6 md:p-8 rounded-2xl shadow-2xl border border-gray-700 text-center w-full max-w-sm">
          <FaLock className="text-red-600 text-4xl md:text-5xl mx-auto mb-4" />
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">관리자 접속 제한</h2>
          <p className="text-gray-400 text-sm md:text-base mb-6">관계자 외 기록 입력을 제한합니다.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" placeholder="비밀번호" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full p-3 md:p-4 text-lg md:text-xl bg-gray-900 text-white border border-gray-600 rounded-xl focus:border-red-600 focus:outline-none text-center" autoFocus />
            <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 md:py-4 rounded-xl transition text-lg">접속하기</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 px-2 md:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          Admin <span className="text-red-600 text-sm bg-gray-800 px-2 py-1 rounded">CONSOLE</span>
        </h1>
        <div className="flex w-full sm:w-auto gap-2">
          <div className="bg-gray-800 p-1 rounded-lg flex flex-1 sm:flex-none">
            <button onClick={() => setActiveTab('timing')} className={`flex-1 sm:flex-none justify-center px-3 py-2 rounded-md font-bold text-xs md:text-sm transition-all flex items-center ${activeTab === 'timing' ? 'bg-red-600 text-white' : 'text-gray-400'}`}><FaStopwatch className="mr-1" /> 계측</button>
            <button onClick={() => setActiveTab('management')} className={`flex-1 sm:flex-none justify-center px-3 py-2 rounded-md font-bold text-xs md:text-sm transition-all flex items-center ${activeTab === 'management' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}><FaUserPlus className="mr-1" /> 관리</button>
          </div>
          <button onClick={handleLogout} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg"><FaUnlock /></button>
        </div>
      </div>
      
      {activeTab === 'timing' && (
        <div className="space-y-6 animate-fade-in-up">
           {/* ... (계측 UI는 기존과 동일하므로 그대로 사용하시면 됩니다) ... */}
           <div className="bg-gray-800 p-4 md:p-6 rounded-xl shadow-lg border-l-4 border-red-600">
           <div className="flex justify-center mb-6 bg-gray-900 p-1 rounded-lg w-fit mx-auto">
            <button 
              type="button"
              onClick={() => setRunType('1')}
              className={`px-6 py-2 rounded-md font-bold transition-all ${runType === '1' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
            >
              RUN 1 (1차)
            </button>
            <button 
              type="button"
              onClick={() => setRunType('2')}
              className={`px-6 py-2 rounded-md font-bold transition-all ${runType === '2' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
            >
              RUN 2 (2차)
            </button>
           </div>

          <h2 className="text-lg md:text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <FaStopwatch className="text-red-500" /> 
            기록 입력 ({runType}차전) {/* 현재 몇 차전인지 표시 */}
          </h2>
            <h2 className="text-lg md:text-2xl font-bold text-white mb-4 flex items-center gap-2"><FaStopwatch className="text-red-500" /> 기록 입력</h2>
            <form onSubmit={handleRecordSubmit} className="flex flex-col gap-3">
              <div className="flex gap-3">
                <div className="relative w-[35%]">
                  <input ref={bibRef} type="number" placeholder="Bib" value={bib} onChange={e => setBib(e.target.value)} autoFocus className="w-full p-3 md:p-4 text-2xl md:text-3xl font-mono font-bold bg-gray-900 text-white border-2 border-gray-700 rounded-xl focus:border-red-600 focus:outline-none text-center" />
                  <span className="absolute top-1 left-2 text-gray-500 text-[10px] md:text-sm font-bold">BIB</span>
                </div>
                <div className="relative w-[65%]">
                  <input type="number" step="0.01" placeholder="00.00" value={record} onChange={e => setRecord(e.target.value)} className="w-full p-3 md:p-4 text-2xl md:text-3xl font-mono font-bold bg-gray-900 text-white border-2 border-gray-700 rounded-xl focus:border-red-600 focus:outline-none text-center" />
                  <span className="absolute top-1 left-2 text-gray-500 text-[10px] md:text-sm font-bold">TIME</span>
                </div>
              </div>
              <button type="submit" className="w-full bg-red-600 text-white py-3 md:py-4 rounded-xl font-bold text-lg md:text-xl shadow-lg flex items-center justify-center gap-2 active:scale-95"><FaCheckCircle /> 전송 (FINISH)</button>
              <div className="grid grid-cols-3 gap-2 mt-1">
                <button type="button" onClick={() => handleException('DNS')} className="bg-gray-600 text-white py-3 rounded-lg font-bold text-sm md:text-base flex flex-col items-center justify-center active:scale-95 border border-gray-500"><FaBan className="mb-1 text-lg"/> DNS</button>
                <button type="button" onClick={() => handleException('DNF')} className="bg-orange-600 text-white py-3 rounded-lg font-bold text-sm md:text-base flex flex-col items-center justify-center active:scale-95 border border-orange-500"><FaTimesCircle className="mb-1 text-lg"/> DNF</button>
                <button type="button" onClick={() => handleException('DSQ')} className="bg-red-900 text-white py-3 rounded-lg font-bold text-sm md:text-base flex flex-col items-center justify-center active:scale-95 border border-red-500"><FaExclamationTriangle className="mb-1 text-lg"/> DQ</button>
              </div>
            </form>
          </div>
          <div className="bg-gray-800 p-4 md:p-6 rounded-xl shadow-lg border-l-4 border-white">
            <h2 className="text-lg md:text-2xl font-bold text-white mb-4 flex items-center gap-2"><FaBullhorn /> 실시간 공지</h2>
            <form onSubmit={handleNoticeSubmit} className="flex gap-2">
              <input type="text" placeholder="공지 내용..." value={noticeMsg} onChange={e => setNoticeMsg(e.target.value)} className="flex-1 p-3 bg-gray-900 text-white border-2 border-gray-700 rounded-xl focus:border-white focus:outline-none text-sm md:text-base" />
              <button type="submit" className="bg-white text-gray-900 px-4 py-3 rounded-xl font-bold text-sm md:text-base shadow-lg flex items-center gap-1"><FaPaperPlane /> 등록</button>
            </form>
          </div>
        </div>
      )}

      {/* 탭 2: 선수 관리 모드 (수정됨) */}
      {activeTab === 'management' && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="bg-gray-800 p-4 md:p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
            <h2 className="text-lg md:text-2xl font-bold text-white mb-4 flex items-center gap-2"><FaUserPlus className="text-blue-500" /> 선수 등록</h2>
            <form onSubmit={handleRegister} className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input ref={regBibRef} type="number" placeholder="번호" value={regBib} onChange={e => setRegBib(e.target.value)} autoFocus className="w-20 p-3 text-lg font-bold bg-gray-900 text-white border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none text-center" />
                <input type="text" placeholder="이름" value={regName} onChange={e => setRegName(e.target.value)} className="flex-1 p-3 text-lg font-bold bg-gray-900 text-white border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none" />
              </div>
              {/* ✅ 부서 입력칸 추가 */}
              <div className="flex gap-2">
                <input type="text" placeholder="부서 (예: 1-2학년부)" value={regCategory} onChange={e => setRegCategory(e.target.value)} className="flex-1 p-3 text-lg font-bold bg-gray-900 text-white border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none" />
                <button type="submit" className="bg-blue-600 text-white px-6 rounded-lg font-bold shadow-lg active:scale-95 text-sm md:text-base whitespace-nowrap">추가</button>
              </div>
            </form>
          </div>
          
          <div className="bg-gray-800 p-4 md:p-6 rounded-xl shadow-lg border border-gray-700">
            <h3 className="text-gray-400 font-bold mb-4 flex items-center gap-2 text-sm md:text-base"><FaList /> 선수 목록 ({racerList.length})</h3>
            <div className="max-h-96 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {racerList.length === 0 ? <div className="text-gray-500 text-center py-4 text-sm">등록된 선수가 없습니다.</div> : racerList.map((r) => (
                <div key={r.id} className="flex justify-between items-center bg-gray-900 p-3 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-3">
                    <span className="text-blue-400 font-mono font-bold text-lg w-8 text-center">{r.bib_number}</span>
                    <div className="flex flex-col">
                        <span className="text-white font-bold text-base md:text-lg">{r.name}</span>
                        {/* ✅ 목록에도 부서 표시 */}
                        {r.category && <span className="text-gray-500 text-xs font-bold">{r.category}</span>}
                    </div>
                  </div>
                   <div className="flex items-center gap-2">
                    {r.status !== 'START' && <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${r.status === 'FINISH' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>{r.status}</span>}
                    <button onClick={() => handleDelete(r.id)} className="text-gray-500 hover:text-red-500 p-2"><FaTrash /></button>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}