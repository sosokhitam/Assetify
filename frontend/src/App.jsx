import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { useAuth } from './context/useAuth.js';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import MasterData from './pages/MasterData.jsx';
import Aset from './pages/Aset.jsx';
import Perbaikan from './pages/Perbaikan.jsx';
import Layout from './components/Layout.jsx';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/master" 
        element={
          <ProtectedRoute>
            <MasterData />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/aset" 
        element={
          <ProtectedRoute>
            <Aset />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/perbaikan" 
        element={
          <ProtectedRoute>
            <Perbaikan />
          </ProtectedRoute>
        } 
      />
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