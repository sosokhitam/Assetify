import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Laptop, 
  Wrench, 
  Users, 
  MapPin, 
  LogOut 
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  // Ambil data user dari localStorage
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const isPegawai = user.role === 'pegawai';

  // Menu Khusus Admin / Teknisi
  const adminMenus = [
    { title: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { title: 'Data Aset IT', path: '/aset', icon: <Laptop size={18} /> },
    { title: 'Pengajuan Perbaikan', path: '/perbaikan', icon: <Wrench size={18} /> },
    { title: 'Master Data', path: '/master', icon: <MapPin size={18} /> },
  ];

  // Menu Khusus Pegawai
  const pegawaiMenus = [
    { title: 'Dashboard', path: '/pegawai/dashboard', icon: <LayoutDashboard size={18} /> },
    { title: 'Data Aset IT', path: '/pegawai/aset', icon: <Laptop size={18} /> },
  ];

  const menuList = isPegawai ? pegawaiMenus : adminMenus;

  const handleLogout = () => {
    // 1. Hapus token & data user
    localStorage.clear();
    sessionStorage.clear();
    
    // 2. Redirect paksa ke halaman Home / Login Pegawai Publik
    window.location.href = '/';
  };

  return (
    <aside className="w-64 bg-[#0b1329] h-screen sticky top-0 p-4 flex flex-col justify-between text-slate-300 border-r border-slate-800/80 shadow-xl select-none">
      <div>
        {/* BRANDING LOGO */}
        <div className="mb-8 px-3 pt-2">
          <h1 className="text-xl font-bold text-blue-500 tracking-wide">SAMSAT IT</h1>
          <p className="text-[11px] text-slate-500">Asset Management System</p>
        </div>

        {/* MENU ROUTING DINAMIS */}
        <nav className="space-y-1.5">
          {menuList.map((menu, index) => {
            const isActive = location.pathname === menu.path;
            return (
              <Link
                key={index}
                to={menu.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                {menu.icon}
                <span>{menu.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* IDENTITAS AKUN & LOGOUT (BAGIAN BAWAH SIDEBAR) */}
      <div className="pt-4 border-t border-slate-800/80">
        <div className="bg-[#1e293b]/60 p-3 rounded-xl border border-slate-800 mb-3 flex items-center gap-3">
          {/* Avatar Inisial */}
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-sm border border-blue-500/30 shrink-0">
            {(user.nama_lengkap || user.nama || user.nip || 'P').charAt(0).toUpperCase()}
          </div>
          
          {/* Info Nama & NIP */}
          <div className="overflow-hidden min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">
              {user.nama_lengkap || user.nama || 'Pengguna'}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {user.nip ? `NIP: ${user.nip}` : user.email || '-'}
            </p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-[9px] font-semibold uppercase">
              {user.role || 'PEGAWAI'}
            </span>
          </div>
        </div>

        {/* Tombol Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-medium transition cursor-pointer"
        >
          <LogOut size={15} /> Logout Sesi
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;