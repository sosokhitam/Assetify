import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth.js';
import API from '../services/api.js';

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
          navigate('/user/dashboard');
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
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center text-slate-800">SAMSAT IT Management</h2>
        <p className="text-sm text-center text-slate-500">Silakan masuk ke akun Anda</p>
        
        {/* Error Alert Global dari Server */}
        {errorMsg && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
            {errorMsg}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          {/* Input Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700">Email Instansi</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError('');
              }}
              className={`w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:outline-none text-slate-800 transition ${
                emailError 
                  ? 'border-red-500 focus:ring-red-400' 
                  : 'border-slate-300 focus:ring-blue-500'
              }`} 
              placeholder="nama@samsat.go.id" 
            />
            {emailError && (
              <p className="mt-1 text-xs text-red-500">{emailError}</p>
            )}
          </div>

          {/* Input Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError('');
              }}
              className={`w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:outline-none text-slate-800 transition ${
                passwordError 
                  ? 'border-red-500 focus:ring-red-400' 
                  : 'border-slate-300 focus:ring-blue-500'
              }`} 
              placeholder="••••••••" 
            />
            {passwordError && (
              <p className="mt-1 text-xs text-red-500">{passwordError}</p>
            )}
          </div>

          {/* Tombol Submit */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2.5 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition duration-200 disabled:bg-blue-400"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}