import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { 
  Shield, 
  KeyRound, 
  Lock, 
  UserCheck, 
  HelpCircle, 
  AlertCircle, 
  ArrowRight, 
  X,
  Sparkles,
  Activity,
  CheckCircle2,
  Boxes
} from 'lucide-react';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nip, setNip] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { token, user, loginWithNip } = useAuth();
  const navigate = useNavigate();

  // Redirect otomatis jika pengguna sudah memiliki sesi aktif
  if (token && user) {
    if (user.role === 'admin' || user.role === 'teknisi') {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/pegawai/dashboard" replace />;
  }

  // Handler Proses Login Pegawai via NIP
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const userData = await loginWithNip(nip, password);

      // Routing sesuai role yang dikembalikan
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
    <div className="relative min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col justify-between overflow-x-hidden selection:bg-indigo-500 selection:text-white font-sans">
      
      {/* BACKGROUND DEKORATIF 3D GLOW & GRID */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Animated Radial Glows */}
        <div className="absolute -top-20 -left-20 sm:-top-40 sm:-left-40 w-64 h-64 sm:w-96 sm:h-96 bg-indigo-600/20 rounded-full blur-[96px] sm:blur-[128px] animate-pulse"></div>
        <div className="absolute top-1/3 -right-20 sm:-right-40 w-64 h-64 sm:w-96 sm:h-96 bg-purple-600/15 rounded-full blur-[96px] sm:blur-[128px] animate-pulse delay-700"></div>
        <div className="absolute -bottom-20 left-1/3 w-64 h-64 sm:w-96 sm:h-96 bg-blue-600/15 rounded-full blur-[96px] sm:blur-[128px] animate-pulse delay-1000"></div>
        
        {/* Subtle Grid Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: '24px 24px' 
          }}
        ></div>
      </div>

      {/* NAVBAR */}
      <nav className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 sm:gap-3 group cursor-pointer">
          <div className="p-2 sm:p-2.5 bg-gradient-to-tr from-indigo-600 to-indigo-500 rounded-xl sm:rounded-2xl shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-300 shrink-0">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <span className="text-lg sm:text-xl font-bold tracking-tight text-white">
            Assetify<span className="text-indigo-400 font-extrabold">.IT</span>
          </span>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="group relative flex items-center gap-1.5 sm:gap-2 bg-slate-800/80 hover:bg-indigo-600 text-white font-medium px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl border border-slate-700/80 hover:border-indigo-500 transition-all duration-300 shadow-lg hover:shadow-indigo-500/25 active:scale-95 cursor-pointer backdrop-blur-md"
        >
          <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400 group-hover:text-white transition-colors" />
          <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">Login Pegawai</span>
        </button>
      </nav>

      {/* HERO SECTION */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 flex flex-col items-center text-center my-auto">
        
        {/* BADGE CATEGORY */}
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-indigo-950/50 border border-indigo-500/30 text-indigo-300 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-6 sm:mb-8 backdrop-blur-md shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" /> 
          <span className="truncate">Sistem Manajemen Aset & Service Desk IT</span>
        </div>

        {/* HERO TITLE */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight max-w-5xl leading-[1.2] sm:leading-[1.15] text-white">
          Kelola & Laporkan Kendala Aset IT Perusahaan Dengan{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 inline-block drop-shadow-sm">
            Mudah & Cepat
          </span>
        </h1>

        <p className="mt-4 sm:mt-6 text-slate-400 text-sm sm:text-base md:text-lg lg:text-xl max-w-2xl leading-relaxed font-normal px-2">
          Platform terpusat untuk pemeliharaan inventaris, pengajuan perbaikan perangkat kerja, dan pencatatan aset digital secara efisien.
        </p>

        {/* ACTION BUTTON */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto px-4 sm:px-0">
          <button
            onClick={() => setIsModalOpen(true)}
            className="group relative inline-flex items-center justify-center gap-2.5 sm:gap-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl transition-all duration-300 shadow-xl shadow-indigo-600/30 hover:shadow-indigo-500/50 text-sm sm:text-base active:scale-95 cursor-pointer w-full sm:w-auto"
          >
            <span>Masuk Portal Pegawai</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
          </button>
        </div>

        {/* STATS STRIP / TRUST METRICS */}
        <div className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 w-full max-w-3xl text-center">
          <div className="flex flex-col items-center p-2">
            <span className="text-lg sm:text-2xl font-bold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" /> Fast Response
            </span>
            <span className="text-xs text-slate-500 mt-0.5 sm:mt-1">Penanganan Tiket Cepat</span>
          </div>
          <div className="flex flex-col items-center p-2">
            <span className="text-lg sm:text-2xl font-bold text-white flex items-center gap-1.5">
              <Boxes className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" /> Real-Time
            </span>
            <span className="text-xs text-slate-500 mt-0.5 sm:mt-1">Sistem Terintegrasi Hub</span>
          </div>
          <div className="flex flex-col items-center p-2">
            <span className="text-lg sm:text-2xl font-bold text-white flex items-center gap-1.5">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" /> 24/7 Monitoring
            </span>
            <span className="text-xs text-slate-500 mt-0.5 sm:mt-1">Pencatatan Aset Akurat</span>
          </div>
        </div>

        {/* FITUR HIGHLIGHT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-16 w-full max-w-5xl text-left">
          
          {/* CARD 1 */}
          <div className="group relative bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 p-6 sm:p-8 rounded-2xl sm:rounded-3xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10">
            <div className="p-2.5 sm:p-3 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-xl sm:rounded-2xl w-fit mb-4 sm:mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
              <UserCheck className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Akses Terkontrol</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Akun terdaftar resmi oleh Tim IT menggunakan NIP Pegawai tanpa pendaftaran mandiri demi keamanan data.
            </p>
          </div>

          {/* CARD 2 */}
          <div className="group relative bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/50 p-6 sm:p-8 rounded-2xl sm:rounded-3xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2 shadow-xl hover:shadow-2xl hover:shadow-purple-500/10">
            <div className="p-2.5 sm:p-3 bg-purple-600/10 border border-purple-500/20 text-purple-400 rounded-xl sm:rounded-2xl w-fit mb-4 sm:mb-6 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
              <KeyRound className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Pengajuan Perbaikan</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Laporkan kerusakan laptop, printer, atau jaringan langsung ke teknisi IT internal dalam hitungan detik.
            </p>
          </div>

          {/* CARD 3 */}
          <div className="group relative bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-pink-500/50 p-6 sm:p-8 rounded-2xl sm:rounded-3xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2 shadow-xl hover:shadow-2xl hover:shadow-pink-500/10">
            <div className="p-2.5 sm:p-3 bg-pink-600/10 border border-pink-500/20 text-pink-400 rounded-xl sm:rounded-2xl w-fit mb-4 sm:mb-6 group-hover:scale-110 group-hover:bg-pink-600 group-hover:text-white transition-all duration-300">
              <Shield className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Pelacakan Real-time</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Pantau progres tiket perbaikan perangkat kerja Anda secara transparan dari dashboard pribadi.
            </p>
          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-slate-800/80 py-6 sm:py-8 text-center text-xs text-slate-500 bg-[#080b11]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div>
            &copy; {new Date().getFullYear()} <strong className="text-slate-400">Assetify IT Service Desk</strong>. All rights reserved.
          </div>
          <div className="flex items-center gap-4 sm:gap-6 text-slate-400 text-[11px] sm:text-xs">
            <span className="hover:text-indigo-400 transition cursor-pointer">SAMSAT IT Center</span>
            <span>•</span>
            <span className="hover:text-indigo-400 transition cursor-pointer">Internal System</span>
          </div>
        </div>
      </footer>

      {/* MODAL LOGIN PEGAWAI MOBILE RESPONSIVE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md transition-opacity overflow-y-auto">
          <div className="bg-[#121824] border border-slate-800 w-full max-w-md rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl shadow-indigo-500/10 relative overflow-hidden my-auto max-h-[90vh] overflow-y-auto">
            
            {/* Modal Glow Accent */}
            <div className="absolute top-0 right-0 w-28 h-28 sm:w-32 sm:h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 text-slate-400 hover:text-white p-1.5 sm:p-2 rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5 sm:mb-6">
              <div className="inline-flex p-3 sm:p-3.5 bg-indigo-600/10 text-indigo-400 rounded-2xl mb-2 sm:mb-3 border border-indigo-500/20">
                <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">Login Portal Pegawai</h2>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-1">Masukkan NIP dan Password resmi akun Anda</p>
            </div>

            {/* ERROR ALERT */}
            {errorMessage && (
              <div className="mb-4 p-3 sm:p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl sm:rounded-2xl flex items-start gap-2.5 sm:gap-3 text-rose-400 text-xs leading-relaxed">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-3.5 sm:space-y-4">
              <div>
                <label className="block text-[10px] sm:text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 sm:mb-2">
                  NIP (Nomor Induk Pegawai)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 199501012024011001"
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-[#0b0f17] border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 sm:mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-[#0b0f17] border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-xs font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 text-white font-bold py-3 sm:py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-600/30 text-xs mt-2 sm:mt-3 flex justify-center items-center gap-2 cursor-pointer active:scale-98"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  'Masuk ke Portal Pegawai'
                )}
              </button>
            </form>

            {/* INFO CATATAN LUPA PASSWORD / DAFTAR AKUN */}
            <div className="mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-slate-800/80 text-center">
              <p className="text-[11px] sm:text-xs text-slate-400 flex items-center justify-center gap-1.5 font-medium">
                <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />
                Belum punya akun / Lupa password?
              </p>
              <p className="text-[10px] sm:text-[11px] text-slate-500 mt-1 leading-relaxed">
                Hubungi <strong className="text-slate-300 font-semibold">Divisi IT Center</strong> untuk verifikasi & pembuatan kredensial NIP Anda.
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}