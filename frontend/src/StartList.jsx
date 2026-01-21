// frontend/src/StartList.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaUserAstronaut, FaCheck, FaHourglassHalf } from 'react-icons/fa';
import { API_BASE_URL } from './config';
export default function StartList() {
  const [racers, setRacers] = useState([]);

  const fetchData = () => {
    // 새로 만든 startlist API 호출
    axios.get(`${API_BASE_URL}/api/startlist/`)
      .then(res => setRacers(res.data));
  };

  useEffect(() => {
    fetchData();
    // 스타트 리스트는 자주 바뀔 일이 없으므로 5초마다 갱신 (부하 줄임)
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
      <div className="p-5 bg-black border-b border-gray-800 flex justify-between items-center">
        <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <FaUserAstronaut className="text-blue-500" /> START LIST
        </h2>
        <span className="text-xs text-gray-500 font-bold border border-gray-700 px-2 py-1 rounded">
            ORDER BY BIB
        </span>
      </div>

      <table className="w-full text-left">
        <thead className="bg-gray-900 text-gray-400 uppercase text-sm font-bold tracking-wider">
          <tr>
            <th className="p-5 w-24 text-center">Bib</th>
            <th className="p-5">Name</th>
            <th className="p-5 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {racers.map((r) => (
            <tr key={r.id} className="hover:bg-gray-700/50 transition-colors">
              <td className="p-5 text-center font-mono text-xl font-bold text-blue-400">
                {r.bib_number}
              </td>
              <td className="p-5 text-lg font-medium text-gray-200">
                {r.name || <span className="text-gray-600">-</span>}
              </td>
              <td className="p-5 text-right">
                {r.status === 'FINISH' ? (
                  <span className="inline-flex items-center gap-1 text-green-500 font-bold bg-green-900/30 px-3 py-1 rounded-full text-sm">
                    <FaCheck size={12} /> FINISHED ({r.record})
                  </span>
                ) : r.status === 'START' ? (
                  <span className="inline-flex items-center gap-1 text-gray-400 font-bold bg-gray-700 px-3 py-1 rounded-full text-sm">
                    <FaHourglassHalf size={12} /> READY
                  </span>
                ) : (
                   <span className="text-red-500 font-bold text-sm">{r.status}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {racers.length === 0 && (
        <div className="p-12 text-center text-gray-500">등록된 선수가 없습니다.</div>
      )}
    </div>
  );
}