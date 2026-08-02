import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const isPegawai = user.role === 'pegawai';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
      {/* JUDUL APAPUN HALAMANNYA */}
      <div>
        <h1 className="text-lg font-bold text-slate-800">
          Sistem Manajemen Aset IT
        </h1>
        <p className="text-xs text-slate-500">
          SAMSAT IT Management Portal
        </p>
      </div>

      {/* PEGAWAI INFO & TOMBOL KELUAR */}
      <div className="flex items-center gap-3">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase ${
            isPegawai
              ? 'bg-blue-100 text-blue-600 border border-blue-200'
              : 'bg-purple-100 text-purple-600 border border-purple-200'
          }`}
        >
          {user.role || 'PEGAWAI'}
        </span>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 border border-red-200 text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-medium transition"
        >
          <LogOut size={14} /> Keluar
        </button>
      </div>
    </header>
  );
};

export default Navbar;