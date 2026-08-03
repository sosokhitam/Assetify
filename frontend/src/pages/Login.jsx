import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth.js';
import API from '../services/api.js';
import { Lock, Mail, ShieldAlert, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // State Error
  const [errorMsg, setErrorMsg] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const [loading, setLoading] = useState(false);
  
  const { token, loginContext } = useAuth();
  const navigate = useNavigate();

  // Jika sudah login, lempar langsung ke Dashboard
  if (token) {
    return <Navigate to="/" replace />;
  }

  // Fungsi Validasi Client-side
  const validateForm = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');

    const cleanEmail = email.trim();

    // 1. Validasi Email
    if (!cleanEmail) {
      setEmailError('Email instansi wajib diisi.');
      isValid = false;
    } else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(cleanEmail)) {
        setEmailError('Format email tidak valid (contoh: nama@samsat.go.id).');
        isValid = false;
      }
    }

    // 2. Validasi Password
    if (!password) {
      setPasswordError('Password wajib diisi.');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password minimal harus 6 karakter.');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Jalankan validasi sebelum mengirim ke API
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await API.post('/auth/login', { 
        email: email.trim(), 
        password 
      });
      
      if (response.data.success) {
        const user = response.data.user;
        const userToken = response.data.token;

        loginContext(user, userToken);

        // Redirect sesuai role
        if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/pegawai/dashboard');
        }
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Gagal terhubung ke server.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0f172a] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Container Utama Form Login */}
      <div className="w-full max-w-md bg-[#1e293b] border border-slate-700/60 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* Header / Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 mb-1">
            <Lock className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
            SAMSAT IT Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Masukan kredensial akun instansi Anda
          </p>
        </div>
        
        {/* Error Alert Global dari Server */}
        {errorMsg && (
          <div className="p-3.5 text-xs sm:text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit} noValidate>
          
          {/* Input Email */}
          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-medium text-slate-300">
              Email Instansi
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail size={18} />
              </div>
              <input 
                type="email" 
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError('');
                }}
                className={`w-full pl-10 pr-4 py-2.5 bg-[#0f172a] border rounded-xl focus:outline-none focus:ring-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 transition ${
                  emailError 
                    ? 'border-red-500/80 focus:ring-red-500/30' 
                    : 'border-slate-700/80 focus:border-blue-500 focus:ring-blue-500/20'
                }`} 
                placeholder="nama@samsat.go.id" 
              />
            </div>
            {emailError && (
              <p className="text-[11px] sm:text-xs text-red-400 pl-1">{emailError}</p>
            )}
          </div>

          {/* Input Password */}
          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-medium text-slate-300">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock size={18} />
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError('');
                }}
                className={`w-full pl-10 pr-4 py-2.5 bg-[#0f172a] border rounded-xl focus:outline-none focus:ring-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 transition ${
                  passwordError 
                    ? 'border-red-500/80 focus:ring-red-500/30' 
                    : 'border-slate-700/80 focus:border-blue-500 focus:ring-blue-500/20'
                }`} 
                placeholder="••••••••" 
              />
            </div>
            {passwordError && (
              <p className="text-[11px] sm:text-xs text-red-400 pl-1">{passwordError}</p>
            )}
          </div>

          {/* Tombol Submit */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2.5 sm:py-3 px-4 font-semibold text-xs sm:text-sm text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.99] rounded-xl transition shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              'Masuk Akun'
            )}
          </button>
        </form>

        {/* Footer Info */}
        <p className="text-[11px] sm:text-xs text-center text-slate-500 pt-2 border-t border-slate-800">
          Sistem Informasi Manajemen Aset & Layanan IT
        </p>

      </div>
    </div>
  );
}