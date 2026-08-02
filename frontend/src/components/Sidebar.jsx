import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth.js';

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  // Tentukan path Dashboard sesuai Role
  const dashboardPath = user?.role === 'pegawai' ? '/pegawai/dashboard' : '/dashboard';

  const menuItems = [
    { name: 'Dashboard', path: dashboardPath, roles: ['admin', 'teknisi', 'pegawai'] },
    { name: 'Data Aset IT', path: '/aset', roles: ['admin', 'teknisi', 'pegawai'] },
    { name: 'Master Lokasi & Kategori', path: '/master', roles: ['admin'] },
    { name: 'Pengajuan Perbaikan', path: '/perbaikan', roles: ['admin', 'teknisi', 'pegawai'] },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 min-h-screen flex flex-col justify-between">
      <div>
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold text-blue-400 tracking-wide">SAMSAT IT</h1>
          <p className="text-xs text-slate-400 mt-1">Asset Management System</p>
        </div>

        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            if (!item.roles.includes(user?.role)) return null;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition duration-150 ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        SAMSAT IT v1.0 &copy; 2026
      </div>
    </aside>
  );
}