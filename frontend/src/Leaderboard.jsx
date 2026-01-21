import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaMedal, FaFlagCheckered, FaBan, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';
import { API_BASE_URL } from './config';
export default function Leaderboard() {
  const [racers, setRacers] = useState([]);

  const fetchData = () => {
    axios.get(`${API_BASE_URL}/api/racers/`)
      .then(res => setRacers(res.data));
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000); // 2초마다 갱신
    return () => clearInterval(interval);
  }, []);

  // 순위별 행 스타일 (배경색 및 테두리)
  const getRowStyle = (rank, status) => {
    // 실격/미출발/포기 선수는 배경을 약간 어둡게 처리
    if (status === 'DNS' || status === 'DNF' || status === 'DSQ') return "bg-gray-900 border-b border-gray-800 opacity-70";
    
    // 랭킹권 선수 강조
    if (rank === 1) return "bg-gray-800/60 border-l-4 border-yellow-500"; 
    if (rank === 2) return "bg-gray-800/40 border-l-4 border-gray-400";   
    if (rank === 3) return "bg-gray-800/20 border-l-4 border-orange-500"; 
    
    // 일반 선수
    return "bg-black border-b border-gray-800 hover:bg-gray-900";     
  };

  // 순위 뱃지 (1,2,3등 메달)
  const getRankBadge = (rank, status) => {
    // 기록이 없는 상태면 순위 표시 안 함 (-)
    if (status !== 'FINISH') return <span className="text-gray-600">-</span>;

    if (rank === 1) return <FaMedal className="text-yellow-500 drop-shadow-lg" size={32} />;
    if (rank === 2) return <FaMedal className="text-gray-300 drop-shadow-lg" size={32} />;
    if (rank === 3) return <FaMedal className="text-orange-600 drop-shadow-lg" size={32} />;
    return <span className="text-xl font-bold text-gray-500">{rank}</span>;
  };

  // ★ 핵심: 상태별 표시 디자인 (기록 vs 뱃지)
  const renderResult = (r) => {
    switch (r.status) {
      case 'FINISH':
        return (
          <span className="text-4xl font-mono font-extrabold text-red-600 tracking-tighter leading-none drop-shadow-md">
            {r.record}
          </span>
        );
      case 'DNS':
        return (
          <span className="inline-flex items-center gap-1 bg-gray-700 text-gray-300 px-3 py-1 rounded-lg text-lg font-bold">
            <FaBan /> DNS
          </span>
        );
      case 'DNF':
        return (
          <span className="inline-flex items-center gap-1 bg-orange-900/50 text-orange-500 px-3 py-1 rounded-lg text-lg font-bold border border-orange-900">
            <FaTimesCircle /> DNF
          </span>
        );
      case 'DSQ':
        return (
          <span className="inline-flex items-center gap-1 bg-red-900/50 text-red-500 px-3 py-1 rounded-lg text-lg font-bold border border-red-900">
            <FaExclamationTriangle /> DQ
          </span>
        );
      default: // START (대기 중)
        return (
          <span className="inline-flex items-center gap-1 text-gray-600 text-sm font-bold border border-gray-800 px-2 py-1 rounded">
             READY
          </span>
        );
    }
  };

  return (
    <div className="bg-black rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
      {/* 테이블 헤더 */}
      <div className="p-5 bg-gray-900 border-b border-gray-800 flex justify-between items-center">
        <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <FaFlagCheckered className="text-red-600" /> LIVE RANKING
        </h2>
        <div className="flex items-center gap-2">
            <span className="animate-pulse inline-block h-2 w-2 rounded-full bg-red-600"></span>
            <span className="text-xs text-gray-500 font-bold">REAL-TIME</span>
        </div>
      </div>

      <table className="w-full text-left">
        <thead className="bg-black text-gray-500 uppercase text-sm font-bold tracking-wider border-b border-gray-800">
          <tr>
            <th className="p-5 text-center w-24">Rank</th>
            <th className="p-5 w-28 text-center">Bib</th>
            <th className="p-5">Name</th>
            <th className="p-5 text-right">Result</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {racers.map((r) => (
            <tr key={r.id} className={`transition-all duration-300 ${getRowStyle(r.rank, r.status)}`}>
              {/* 순위 */}
              <td className="p-5 text-center align-middle">
                <div className="flex justify-center items-center">
                    {getRankBadge(r.rank, r.status)}
                </div>
              </td>
              
              {/* 비브 번호 */}
              <td className="p-5 text-center">
                <span className="font-mono text-2xl font-bold text-gray-300">
                  {r.bib_number}
                </span>
              </td>
              
              {/* 이름 */}
              <td className="p-5">
                <span className="text-xl font-semibold text-white">
                  {r.name || <span className="text-gray-700 text-sm">-</span>}
                </span>
              </td>
              
              {/* 기록 또는 상태(DQ/DNS/DNF) 표시 */}
              <td className="p-5 text-right">
                {renderResult(r)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {racers.length === 0 && (
        <div className="p-16 text-center text-gray-600 font-bold text-lg bg-black">
          경기 대기 중...
        </div>
      )}
    </div>
  );
}