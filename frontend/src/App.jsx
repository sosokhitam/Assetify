import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { useAuth } from './context/useAuth.js';

// Import Halaman
import Home from './pages/Home.jsx';
import AdminLogin from './pages/AdminLogin.jsx'; // Halaman Khusus Login Admin
import Dashboard from './pages/Dashboard.jsx';
import MasterData from './pages/MasterData.jsx';
import Aset from './pages/Aset.jsx';
import Perbaikan from './pages/Perbaikan.jsx';
import PegawaiDashboard from './pages/PegawaiDashboard.jsx'; // Halaman khusus pegawai biasa
import Layout from './components/Layout.jsx';

// Protected Route yang Aman & Mencegah Race Condition Sync State
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, user } = useAuth();
  const savedToken = token || localStorage.getItem('token');
  const savedUser = user || JSON.parse(localStorage.getItem('user') || 'null');

  if (!savedToken) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && (!savedUser || !allowedRoles.includes(savedUser.role))) {
    return <Navigate to="/" replace />;
  }

  return <Layout>{children}</Layout>;
};

function AppRoutes() {
  return (
    <Routes>
      {/* 1. Halaman Public */}
      <Route path="/" element={<Home />} />
      <Route path="/admin/login" element={<AdminLogin />} /> {/* Login khusus Email Admin */}

      {/* Redirect /login ke Home jika ada yang mengakses manual */}
      <Route path="/login" element={<Navigate to="/" replace />} />

      {/* 2. Halaman Protected (Admin & Teknisi) */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'teknisi']}>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/master" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <MasterData />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/aset" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'teknisi']}>
            <Aset />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/perbaikan" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'teknisi']}>
            <Perbaikan />
          </ProtectedRoute>
        } 
      />

      {/* 3. Halaman Protected (Pegawai Biasa) */}
      <Route 
        path="/pegawai/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['pegawai']}>
            <PegawaiDashboard />
          </ProtectedRoute>
        } 
      />

      {/* 4. Fallback jika URL tidak ditemukan */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}