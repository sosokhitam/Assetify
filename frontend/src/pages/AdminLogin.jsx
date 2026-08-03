import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { Shield, AlertCircle, ArrowLeft, Mail, Lock, Sparkles } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();
  const { token, user, loginAdmin } = useAuth(); // Menggunakan fungsi loginAdmin dari AuthContext

  if (token && user) {
    if (user.role === 'admin' || user.role === 'teknisi') {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/pegawai/dashboard" replace />;
  }

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      // 1. Memanggil loginAdmin di AuthContext
      await loginAdmin(email, password);

      // 2. Redirect ke Dashboard setelah sukses
      navigate('/dashboard');
    } catch (err) {
      setErrorMessage(err.message || 'Gagal masuk sebagai Admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 overflow-hidden selection:bg-indigo-500 selection:text-white font-sans">
      
      {/* BACKGROUND DEKORATIF GLOW & GRID */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-20 sm:-left-32 w-64 h-64 sm:w-96 sm:h-96 bg-indigo-600/20 rounded-full blur-[96px] sm:blur-[128px] animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 sm:-right-32 w-64 h-64 sm:w-96 sm:h-96 bg-purple-600/15 rounded-full blur-[96px] sm:blur-[128px] animate-pulse delay-700"></div>
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: '24px 24px' 
          }}
        ></div>
      </div>

      {/* CONTAINER FORM (RESPONSIVE CARD) */}
      <div className="relative z-10 w-full max-w-md bg-[#121824]/90 border border-slate-800/80 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl my-auto">
        
        {/* Glow Accent di Sudut Card */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Tombol Kembali ke Home */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white mb-6 p-1.5 sm:p-0 rounded-lg hover:bg-slate-800/50 sm:hover:bg-transparent transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-indigo-400" /> 
          <span>Kembali ke Portal Utama</span>
        </button>

        {/* HEADER SECTION */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex p-3 sm:p-3.5 bg-indigo-600/10 text-indigo-400 rounded-2xl mb-3 border border-indigo-500/20">
            <Shield className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[10px] sm:text-xs font-semibold text-indigo-400 uppercase tracking-widest">Akses Terbatas</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Administrator Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Masuk dengan kredensial email resmi Tim IT
          </p>
        </div>

        {/* ALERT ERROR */}
        {errorMessage && (
          <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl sm:rounded-2xl flex items-start gap-3 text-rose-400 text-xs sm:text-sm leading-relaxed">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* FORM LOGIN */}
        <form onSubmit={handleAdminLogin} className="space-y-4 sm:space-y-5">
          
          {/* FIELD EMAIL */}
          <div>
            <label className="block text-[10px] sm:text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 sm:mb-2">
              Email Administrator
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                placeholder="admin@samsat.go.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-[#0b0f17] border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-xs sm:text-sm font-mono"
              />
            </div>
          </div>

          {/* FIELD PASSWORD */}
          <div>
            <label className="block text-[10px] sm:text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 sm:mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-[#0b0f17] border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-xs sm:text-sm font-mono"
              />
            </div>
          </div>

          {/* TOMBOL SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 text-white font-bold py-3 sm:py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-600/30 text-xs sm:text-sm mt-2 flex justify-center items-center gap-2 cursor-pointer active:scale-98"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              'Login Administrator'
            )}
          </button>
        </form>

        {/* FOOTER CARD INFO */}
        <div className="mt-6 sm:mt-8 pt-4 border-t border-slate-800/80 text-center">
          <p className="text-[10px] sm:text-xs text-slate-500">
            Sistem Terintegrasi IT Infrastructure Management &copy; {new Date().getFullYear()}
          </p>
        </div>

      </div>
    </div>
  );
}