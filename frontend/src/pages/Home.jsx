import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { Shield, KeyRound, Lock, UserCheck, HelpCircle, AlertCircle, ArrowRight, X } from 'lucide-react';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nip, setNip] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { token, user, loginWithNip } = useAuth();
  const navigate = useNavigate();

  if (token && user) {
    if (user.role === 'admin' || user.role === 'teknisi') {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/pegawai/dashboard" replace />;
  }

  // Handler Process Login via NIP
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const userData = await loginWithNip(nip, password);

      if (userData.role === 'admin' || userData.role === 'teknisi') {
        navigate('/dashboard');
      } else {
        navigate('/pegawai/dashboard');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Gagal masuk. Periksa kembali NIP dan Password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      
      {/* NAVBAR */}
      <nav className="max-w-7xl w-full mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Assetify<span className="text-indigo-400">.IT</span>
          </span>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/20 active:scale-95"
        >
          <Lock className="w-4 h-4" />
          Login Sistem
        </button>
      </nav>

      {/* HERO SECTION */}
      <main className="max-w-7xl mx-auto px-6 py-12 flex flex-col items-center text-center my-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 border border-slate-700/60 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-8">
          <Shield className="w-4 h-4" /> Sistem Manajemen Aset & Layanan IT Internal
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-4xl leading-tight">
          Kelola & Laporkan Kendala Aset IT Perusahaan Dengan <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Mudah & Cepat</span>
        </h1>

        <p className="mt-6 text-slate-400 text-base md:text-lg max-w-2xl leading-relaxed">
          Platform terpusat untuk pemeliharaan inventaris, pengajuan perbaikan perangkat kerja, dan inventarisasi aset digital secara efisien.
        </p>

        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-7 py-3.5 rounded-xl transition shadow-xl shadow-indigo-500/25 text-base active:scale-95"
          >
            Masuk Portal Pegawai <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* FITUR HIGHLIGHT */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full max-w-5xl text-left">
          <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl backdrop-blur-sm">
            <UserCheck className="w-8 h-8 text-indigo-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Akses Terkontrol</h3>
            <p className="text-sm text-slate-400">Akun terdaftar resmi oleh Tim IT menggunakan NIP Pegawai tanpa pendaftaran mandiri.</p>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl backdrop-blur-sm">
            <KeyRound className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Pengajuan Perbaikan</h3>
            <p className="text-sm text-slate-400">Laporkan kerusakan laptop, printer, atau jaringan langsung ke teknisi IT dalam hitungan detik.</p>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl backdrop-blur-sm">
            <Shield className="w-8 h-8 text-pink-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Pelacakan Real-time</h3>
            <p className="text-sm text-slate-400">Pantau status tiket perbaikan perangkat kerja Anda secara langsung dari dashboard.</p>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 py-6 text-center text-sm text-slate-500">
        &copy; {new Date().getFullYear()} Assetify IT Service Desk. All rights reserved.
      </footer>

      {/* MODAL LOGIN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl p-6 md:p-8 shadow-2xl relative">
            
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex p-3 bg-indigo-600/20 text-indigo-400 rounded-2xl mb-3 border border-indigo-500/30">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white">Login Portal Assetify</h2>
              <p className="text-sm text-slate-400 mt-1">Masukkan NIP dan Password akun Anda</p>
            </div>

            {/* ERROR ALERT */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-rose-400 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  NIP (Nomor Induk Pegawai)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 199501012024011001"
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-indigo-600/30 text-sm mt-2 flex justify-center items-center gap-2"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  'Masuk ke Sistem'
                )}
              </button>
            </form>

            {/* INFO CATATAN LUPA PASSWORD / DAFTAR AKUN */}
            <div className="mt-6 pt-4 border-t border-slate-700/60 text-center">
              <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-indigo-400" />
                Belum punya akun / Lupa password?
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Hubungi **Divisi IT Center** untuk pendaftaran & pembuatan kredensial NIP Anda.
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}