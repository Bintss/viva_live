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
    // 서버 부하 관리를 위해 5초(5000ms) 주기로 설정
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

  const getRankBadge = (rank, status) => {
    if (status !== 'FINISH') return <span className="text-gray-600">-</span>;
    if (rank === 1) return <FaMedal className="text-yellow-500 drop-shadow-lg" size={24} />;
    if (rank === 2) return <FaMedal className="text-gray-300 drop-shadow-lg" size={24} />;
    if (rank === 3) return <FaMedal className="text-orange-600 drop-shadow-lg" size={24} />;
    return <span className="text-sm sm:text-xl font-bold text-gray-500">{rank}</span>;
  };

  const renderResult = (r) => {
    switch (r.status) {
      case 'FINISH':
        return <span className="text-2xl sm:text-4xl font-mono font-extrabold text-red-600 tracking-tighter leading-none drop-shadow-md">{r.record}</span>;
      case 'DNS': return <span className="inline-flex items-center gap-1 bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs sm:text-lg font-bold"><FaBan /> DNS</span>;
      case 'DNF': return <span className="inline-flex items-center gap-1 bg-orange-900/50 text-orange-500 px-2 py-1 rounded text-xs sm:text-lg font-bold border border-orange-900"><FaTimesCircle /> DNF</span>;
      case 'DSQ': return <span className="inline-flex items-center gap-1 bg-red-900/50 text-red-500 px-2 py-1 rounded text-xs sm:text-lg font-bold border border-red-900"><FaExclamationTriangle /> DQ</span>;
      default: return <span className="inline-flex items-center gap-1 text-gray-600 text-xs sm:text-sm font-bold border border-gray-800 px-2 py-1 rounded">READY</span>;
    }
  };

  return (
    <div className="bg-black rounded-xl shadow-2xl overflow-hidden border border-gray-800 flex flex-col h-[calc(100vh-140px)]">
      {/* 헤더 (고정) */}
      <div className="p-3 sm:p-5 bg-gray-900 border-b border-gray-800 flex justify-between items-center shrink-0">
        <h2 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <FaFlagCheckered className="text-red-600" /> LIVE RANKING
        </h2>
        <div className="flex items-center gap-2">
            <span className="animate-pulse inline-block h-2 w-2 rounded-full bg-red-600"></span>
            <span className="text-[10px] sm:text-xs text-gray-500 font-bold">REAL-TIME</span>
        </div>
      </div>

      {/* 리스트 영역 (스크롤 가능) */}
      <div className="overflow-y-auto flex-1 custom-scrollbar relative">
        <table className="w-full text-left table-fixed">
          {/* Sticky Header */}
          <thead className="bg-black text-gray-500 uppercase text-[10px] sm:text-sm font-bold tracking-wider sticky top-0 z-10 shadow-md">
            <tr>
              <th className="p-2 sm:p-5 text-center w-[12%] bg-black">Rank</th>
              <th className="p-2 sm:p-5 text-center w-[12%] bg-black">Bib</th>
              <th className="p-2 sm:p-5 w-[26%] bg-black">Name</th>
              <th className="p-2 sm:p-5 w-[20%] bg-black text-center">Div</th>
              <th className="p-2 sm:p-5 text-right w-[30%] bg-black">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {racers.map((r) => (
              <tr key={r.id} className={`transition-all duration-300 ${getRowStyle(r.rank, r.status)}`}>
                <td className="p-2 sm:p-5 text-center align-middle"><div className="flex justify-center items-center">{getRankBadge(r.rank, r.status)}</div></td>
                <td className="p-2 sm:p-5 text-center"><span className="font-mono text-sm sm:text-2xl font-bold text-gray-300">{r.bib_number}</span></td>
                
                <td className="p-2 sm:p-5 overflow-hidden">
                    <span className="text-sm sm:text-xl font-semibold text-white whitespace-nowrap truncate block">{r.name || <span className="text-gray-700 text-xs">-</span>}</span>
                </td>

                {/* 부서 (Category) */}
                <td className="p-2 sm:p-5 text-center overflow-hidden">
                     <span className="text-[10px] sm:text-sm font-bold text-gray-400 bg-gray-800 px-2 py-1 rounded whitespace-nowrap truncate block">
                        {r.category || '-'}
                     </span>
                </td>

                <td className="p-2 sm:p-5 text-right">{renderResult(r)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {racers.length === 0 && (
          <div className="p-10 text-center text-gray-600 font-bold text-sm">경기 대기 중...</div>
        )}
      </div>
    </div>
  );
}