import React, { createContext, useEffect, useState } from 'react';
import API from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    const validateUser = async () => {
      if (!token) return;
      try {
        const response = await API.get('/auth/me');
        if (response.data?.success) {
          setUser(response.data.user);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      } catch (err) {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    };

    validateUser();
  }, [token]);

  // 1. Simpan State & LocalStorage
  const loginContext = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // 2. Fungsi Login Pegawai (Menggunakan NIP)
  const loginWithNip = async (nip, password) => {
    try {
      const response = await API.post('/auth/login', { nip, password });
      const { user: userData, token: userToken } = response.data;

      loginContext(userData, userToken);
      return userData; // Mengembalikan data user termasuk Role
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Gagal login. Cek koneksi server Anda.';
      throw new Error(errorMessage);
    }
  };

  // 3. Fungsi Login Admin (Menggunakan Email)
  const loginAdmin = async (email, password) => {
    try {
      const response = await API.post('/auth/admin/login', { email, password });
      const { user: userData, token: userToken } = response.data;

      loginContext(userData, userToken);
      return userData; // Mengembalikan data admin termasuk Role
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Gagal login admin. Periksa kembali Email & Password.';
      throw new Error(errorMessage);
    }
  };

  // 4. Logout
  const logoutContext = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token, 
        loginWithNip, 
        loginAdmin, 
        loginContext, 
        logoutContext 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};