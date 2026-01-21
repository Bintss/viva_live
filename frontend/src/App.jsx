// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import { FaTrophy, FaBullhorn, FaCog, FaListOl, FaClipboardList } from 'react-icons/fa';
import Admin from './Admin';
import Leaderboard from './Leaderboard';
import vivaLogo from './assets/logo.jpg';
import StartList from './StartList';

function App() {
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/notices/');
        if (res.data.length > 0) {
          setNotice(res.data[0].content);
        } else {
          setNotice(null);
        }
      } catch (e) { console.error(e); }
    };
    fetchNotice();
    const interval = setInterval(fetchNotice, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900 flex flex-col font-sans text-gray-100">
        
        {/* 1. 상단 공지사항 바 (빨간색 배경) */}
        {notice && (
          <div className="bg-red-600 text-white px-4 py-3 flex items-center justify-center shadow-md z-50 animate-pulse">
            <FaBullhorn className="mr-2 text-xl" />
            <span className="font-bold text-lg tracking-wide">{notice}</span>
          </div>
        )}

        {/* 2. 메인 헤더 (검은색 배경) */}
        <header className="bg-black text-white shadow-lg sticky top-0 z-40 border-b border-gray-800">
          <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
            {/* 로고 영역 */}
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition">
              {/* 로고 이미지가 있다면 아래 주석을 풀고 사용하세요 */}
              {<img src={vivaLogo} alt="VIVA365 Logo" className="h-12 w-12 rounded-full border-2 border-red-600" />}
              
              
              <div className="flex flex-col">
                {/* VIVA는 빨간색으로 강조 */}
                <span className="font-extrabold text-2xl leading-none tracking-tighter">
                  <span className="text-red-600">VIVA</span>365
                </span>
                <span className="text-xs text-gray-300 tracking-[0.2em] font-bold">SPORTS KOREA</span>
              </div>
            </Link>

            {/* 네비게이션 메뉴 */}
            <nav className="flex gap-6">
              <Link to="/startlist" className="flex items-center gap-2 text-gray-300 hover:text-red-500 transition font-semibold text-sm sm:text-base">
                <FaClipboardList /> <span className="hidden sm:inline">START LIST</span>
              </Link>
              <Link to="/" className="flex items-center gap-2 text-gray-300 hover:text-red-500 transition font-semibold">
                <FaListOl size={18} /> <span className="hidden sm:inline">RANKING</span>
              </Link>
              <Link to="/admin" className="flex items-center gap-2 text-gray-300 hover:text-red-500 transition font-semibold">
                <FaCog size={18} /> <span className="hidden sm:inline">ADMIN</span>
              </Link>
            </nav>
          </div>
        </header>

        {/* 3. 본문 영역 */}
        <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8">
          <Routes>
            <Route path="/" element={<Leaderboard />} />
            <Route path="/startlist" element={<StartList />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>

        {/* 4. 푸터 */}
        <footer className="bg-black text-gray-500 text-center py-8 text-sm border-t border-gray-800">
          <p>© 2026 <span className="text-red-600 font-bold">VIVA365 SPORTS KOREA</span>. All rights reserved.</p>
          <p className="mt-2">Official Timing System built by Shin Jeong Woo</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}
export default App;