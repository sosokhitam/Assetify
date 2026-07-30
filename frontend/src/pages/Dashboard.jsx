import { useAuth } from '../context/useAuth'; // <-- DIUBAH KE SINI (perhatikan titiknya ada dua '../')

export default function Dashboard() {
  const { user, logoutContext } = useAuth();

  return (
    <div className="p-8">
      <div className="max-w-4xl p-6 mx-auto bg-white rounded-xl shadow-md">
        <h1 className="text-3xl font-bold text-slate-800">Selamat Datang, {user?.nama_lengkap || 'Pegawai'}!</h1>
        <p className="mt-2 text-slate-600">Anda masuk dengan hak akses sebagai: <span className="font-semibold uppercase text-blue-600">{user?.role}</span></p>
        <button 
          onClick={logoutContext} 
          className="mt-6 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition">
          Keluar Aplikasi
        </button>
      </div>
    </div>
  );
}