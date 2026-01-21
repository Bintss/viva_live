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
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700 mb-10">
      {/* 헤더 */}
      <div className="p-3 sm:p-5 bg-black border-b border-gray-800 flex justify-between items-center">
        <h2 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <FaUserAstronaut className="text-blue-500" /> START LIST
        </h2>
        <span className="text-[10px] sm:text-xs text-gray-500 font-bold border border-gray-700 px-2 py-1 rounded">
            ORDER BY BIB
        </span>
      </div>

      <table className="w-full text-left table-fixed">
        <thead className="bg-gray-900 text-gray-400 uppercase text-[10px] sm:text-sm font-bold tracking-wider">
          <tr>
            <th className="p-2 sm:p-5 w-[20%] text-center">Bib</th>
            <th className="p-2 sm:p-5 w-[45%]">Name</th>
            <th className="p-2 sm:p-5 w-[35%] text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {racers.map((r) => (
            <tr key={r.id} className="hover:bg-gray-700/50 transition-colors">
              
              {/* 비브 번호 */}
              <td className="p-2 sm:p-5 text-center font-mono text-sm sm:text-xl font-bold text-blue-400">
                {r.bib_number}
              </td>
              
              {/* 이름 (줄바꿈 방지) */}
              <td className="p-2 sm:p-5 overflow-hidden">
                <span className="text-sm sm:text-lg font-medium text-gray-200 whitespace-nowrap truncate block">
                  {r.name || <span className="text-gray-600">-</span>}
                </span>
              </td>
              
              {/* 상태 표시 */}
              <td className="p-2 sm:p-5 text-right">
                {r.status === 'FINISH' ? (
                  <span className="inline-flex items-center gap-1 text-green-400 font-bold bg-green-900/30 px-2 py-1 rounded text-xs sm:text-sm border border-green-800">
                    <FaCheck size={10} /> DONE
                  </span>
                ) : r.status === 'START' ? (
                  <span className="inline-flex items-center gap-1 text-gray-400 font-bold bg-gray-700 px-2 py-1 rounded text-xs sm:text-sm">
                    <FaHourglassHalf size={10} /> READY
                  </span>
                ) : (
                  // DNS, DNF, DSQ 등
                   <span className="inline-flex items-center text-red-400 font-bold bg-red-900/20 px-2 py-1 rounded text-xs sm:text-sm border border-red-900/50">
                     {r.status}
                   </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {racers.length === 0 && (
        <div className="p-10 text-center text-gray-500 font-bold text-sm">
          등록된 선수가 없습니다.
        </div>
      )}
    </div>
  );
}