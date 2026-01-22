import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaUserAstronaut, FaCheck, FaHourglassHalf } from 'react-icons/fa';
import { API_BASE_URL } from './config';

export default function StartList() {
  const [racers, setRacers] = useState([]);

  const fetchData = () => {
    axios.get(`${API_BASE_URL}/api/startlist/`)
      .then(res => setRacers(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchData();
    // 스타트리스트는 자주 바뀌지 않으므로 10초(10000ms) 주기로 설정해 서버 부하 최소화
    const interval = setInterval(fetchData, 10000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700 flex flex-col h-[calc(100vh-140px)]">
      {/* 헤더 (고정) */}
      <div className="p-3 sm:p-5 bg-black border-b border-gray-800 flex justify-between items-center shrink-0">
        <h2 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <FaUserAstronaut className="text-blue-500" /> START LIST
        </h2>
        <span className="text-[10px] sm:text-xs text-gray-500 font-bold border border-gray-700 px-2 py-1 rounded">
            ORDER BY BIB
        </span>
      </div>

      {/* 리스트 영역 (스크롤 가능) */}
      <div className="overflow-y-auto flex-1 custom-scrollbar relative">
        <table className="w-full text-left table-fixed">
          {/* Sticky Header */}
          <thead className="bg-gray-900 text-gray-400 uppercase text-[10px] sm:text-sm font-bold tracking-wider sticky top-0 z-10 shadow-md">
            <tr>
              <th className="p-2 sm:p-5 w-[15%] text-center bg-gray-900">Bib</th>
              <th className="p-2 sm:p-5 w-[35%] bg-gray-900">Name</th>
              <th className="p-2 sm:p-5 w-[25%] text-center bg-gray-900">Div</th>
              <th className="p-2 sm:p-5 w-[25%] text-right bg-gray-900">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {racers.map((r) => (
              <tr key={r.id} className="hover:bg-gray-700/50 transition-colors">
                <td className="p-2 sm:p-5 text-center font-mono text-sm sm:text-xl font-bold text-blue-400">{r.bib_number}</td>
                
                <td className="p-2 sm:p-5 overflow-hidden">
                    <span className="text-sm sm:text-lg font-medium text-gray-200 whitespace-nowrap truncate block">{r.name || <span className="text-gray-600">-</span>}</span>
                </td>

                {/* 부서 (Category) */}
                <td className="p-2 sm:p-5 text-center overflow-hidden">
                    <span className="text-[10px] sm:text-sm font-bold text-gray-400 bg-gray-800 px-2 py-1 rounded whitespace-nowrap truncate block">
                        {r.category || '-'}
                    </span>
                </td>

                <td className="p-2 sm:p-5 text-right">
                  {r.status === 'FINISH' ? (
                    <span className="inline-flex items-center gap-1 text-green-400 font-bold bg-green-900/30 px-2 py-1 rounded text-xs sm:text-sm border border-green-800"><FaCheck size={10} /> DONE</span>
                  ) : r.status === 'START' ? (
                    <span className="inline-flex items-center gap-1 text-gray-400 font-bold bg-gray-700 px-2 py-1 rounded text-xs sm:text-sm"><FaHourglassHalf size={10} /> READY</span>
                  ) : (
                     <span className="inline-flex items-center text-red-400 font-bold bg-red-900/20 px-2 py-1 rounded text-xs sm:text-sm border border-red-900/50">{r.status}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {racers.length === 0 && (
          <div className="p-10 text-center text-gray-500 font-bold text-sm">등록된 선수가 없습니다.</div>
        )}
      </div>
    </div>
  );
}