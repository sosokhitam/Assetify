import { useAuth } from '../context/useAuth.js';

export default function Navbar() {
  const { user, logoutContext } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">Sistem Manajemen Aset IT</h2>
      </div>

      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-800">{user?.nama_lengkap || user?.email}</p>
          <span className="inline-block px-2 py-0.5 text-xs font-semibold uppercase text-blue-700 bg-blue-100 rounded-full">
            {user?.role}
          </span>
        </div>

        <button
          onClick={logoutContext}
          className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition duration-150"
        >
          Keluar
        </button>
      </div>
    </header>
  );
}