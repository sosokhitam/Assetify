import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Laptop, 
  Wrench, 
  MapPin, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false); // State untuk kontrol Sidebar Mobile

  // Ambil data user dari localStorage secara aman
  const getUserData = () => {
    try {
      return JSON.parse(localStorage.getItem('user')) || {};
    } catch (e) {
      return {};
    }
  };

  const user = getUserData();
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
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* 1. TOP NAVBAR HEADER UNTUK MOBILE (Layar < md) */}
      <div className="md:hidden bg-[#0b1329] border-b border-slate-800 text-slate-300 p-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-blue-500 tracking-wide">SAMSAT IT</h1>
          <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-semibold uppercase">
            {user.role || 'PEGAWAI'}
          </span>
        </div>
        
        {/* Tombol Hamburger Toggle */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl bg-slate-800/80 text-slate-200 hover:text-white hover:bg-slate-700 transition focus:outline-none"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* 2. OVERLAY BACKDROP UNTUK MOBILE */}
      {isOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* 3. SIDEBAR CONTAINER */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 z-50 md:z-auto
          w-64 h-screen bg-[#0b1329] text-slate-300 
          border-r border-slate-800/80 shadow-xl select-none 
          p-4 flex flex-col justify-between overflow-y-auto
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div>
          {/* BRANDING LOGO & CLOSE BUTTON MOBILE */}
          <div className="mb-8 px-3 pt-2 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-blue-500 tracking-wide">SAMSAT IT</h1>
              <p className="text-[11px] text-slate-500">Asset Management System</p>
            </div>
            
            {/* Tombol Tutup Khusus Layar Mobile */}
            <button 
              onClick={closeSidebar}
              className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* MENU ROUTING DINAMIS */}
          <nav className="space-y-1.5">
            {menuList.map((menu, index) => {
              const isActive = location.pathname === menu.path;
              return (
                <Link
                  key={index}
                  to={menu.path}
                  onClick={closeSidebar} // Tutup drawer saat menu diklik di mobile
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
        <div className="pt-4 mt-6 border-t border-slate-800/80 shrink-0">
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
    </>
  );
};

export default Sidebar;