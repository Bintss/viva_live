import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaMedal, FaFlagCheckered, FaBan, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';
import { API_BASE_URL } from './config';

export default function Leaderboard() {
  const [racers, setRacers] = useState([]);

  const fetchData = () => {
    axios.get(`${API_BASE_URL}/api/racers/`)
      .then(res => setRacers(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const getRowStyle = (rank, status) => {
    if (status === 'DNS' || status === 'DNF' || status === 'DSQ') return "bg-gray-900 border-b border-gray-800 opacity-70";
    if (rank === 1) return "bg-gray-800/60 border-l-4 border-yellow-500"; 
    if (rank === 2) return "bg-gray-800/40 border-l-4 border-gray-400";   
    if (rank === 3) return "bg-gray-800/20 border-l-4 border-orange-500"; 
    return "bg-black border-b border-gray-800 hover:bg-gray-900";     
  };

  // 뱃지 크기도 모바일엔 작게, PC엔 크게 조절 (size 속성 대신 클래스로 제어 불가하므로 조건부 렌더링 혹은 적당한 중간값 사용)
  // 여기서는 모바일에 맞춰 사이즈를 조금 줄였습니다 (32 -> 20~24)
  const getRankBadge = (rank, status) => {
    if (status !== 'FINISH') return <span className="text-gray-600">-</span>;
    // 아이콘 크기를 24로 줄임 (모바일 최적화)
    if (rank === 1) return <FaMedal className="text-yellow-500 drop-shadow-lg" size={24} />;
    if (rank === 2) return <FaMedal className="text-gray-300 drop-shadow-lg" size={24} />;
    if (rank === 3) return <FaMedal className="text-orange-600 drop-shadow-lg" size={24} />;
    return <span className="text-sm sm:text-xl font-bold text-gray-500">{rank}</span>;
  };

  const renderResult = (r) => {
    switch (r.status) {
      case 'FINISH':
        return (
          // ★ 수정됨: 모바일 text-2xl, PC(sm이상) text-4xl
          <span className="text-2xl sm:text-4xl font-mono font-extrabold text-red-600 tracking-tighter leading-none drop-shadow-md">
            {r.record}
          </span>
        );
      case 'DNS':
        return (
          <span className="inline-flex items-center gap-1 bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs sm:text-lg font-bold">
            <FaBan /> DNS
          </span>
        );
      case 'DNF':
        return (
          <span className="inline-flex items-center gap-1 bg-orange-900/50 text-orange-500 px-2 py-1 rounded text-xs sm:text-lg font-bold border border-orange-900">
            <FaTimesCircle /> DNF
          </span>
        );
      case 'DSQ':
        return (
          <span className="inline-flex items-center gap-1 bg-red-900/50 text-red-500 px-2 py-1 rounded text-xs sm:text-lg font-bold border border-red-900">
            <FaExclamationTriangle /> DQ
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-gray-600 text-xs sm:text-sm font-bold border border-gray-800 px-2 py-1 rounded">
             READY
          </span>
        );
    }
  };

  return (
    <div className="bg-black rounded-xl shadow-2xl overflow-hidden border border-gray-800 mb-10">
      {/* 헤더 */}
      <div className="p-3 sm:p-5 bg-gray-900 border-b border-gray-800 flex justify-between items-center">
        <h2 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <FaFlagCheckered className="text-red-600" /> LIVE RANKING
        </h2>
        <div className="flex items-center gap-2">
            <span className="animate-pulse inline-block h-2 w-2 rounded-full bg-red-600"></span>
            <span className="text-[10px] sm:text-xs text-gray-500 font-bold">REAL-TIME</span>
        </div>
      </div>

      <table className="w-full text-left table-fixed"> {/* table-fixed 추가: 너비 고정 */}
        <thead className="bg-black text-gray-500 uppercase text-[10px] sm:text-sm font-bold tracking-wider border-b border-gray-800">
          <tr>
            {/* 너비 비율 조정 (w-값) */}
            <th className="p-2 sm:p-5 text-center w-[15%]">Rank</th>
            <th className="p-2 sm:p-5 text-center w-[15%]">Bib</th>
            <th className="p-2 sm:p-5 w-[30%]">Name</th>
            <th className="p-2 sm:p-5 text-right w-[40%]">Result</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {racers.map((r) => (
            <tr key={r.id} className={`transition-all duration-300 ${getRowStyle(r.rank, r.status)}`}>
              
              {/* 순위 */}
              <td className="p-2 sm:p-5 text-center align-middle">
                <div className="flex justify-center items-center">
                    {getRankBadge(r.rank, r.status)}
                </div>
              </td>
              
              {/* 비브 번호 (모바일 text-sm / PC text-2xl) */}
              <td className="p-2 sm:p-5 text-center">
                <span className="font-mono text-sm sm:text-2xl font-bold text-gray-300">
                  {r.bib_number}
                </span>
              </td>
              
              {/* 이름 (줄바꿈 방지 whitespace-nowrap 추가) */}
              <td className="p-2 sm:p-5 overflow-hidden">
                <span className="text-sm sm:text-xl font-semibold text-white whitespace-nowrap truncate block">
                  {r.name || <span className="text-gray-700 text-xs">-</span>}
                </span>
              </td>
              
              {/* 기록 */}
              <td className="p-2 sm:p-5 text-right">
                {renderResult(r)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {racers.length === 0 && (
        <div className="p-10 text-center text-gray-600 font-bold text-sm bg-black">
          경기 대기 중...
        </div>
      )}
    </div>
  );
}