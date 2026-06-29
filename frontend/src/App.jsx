import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Divisi from './pages/Divisi';
import Anggaran from './pages/Anggaran';
import Pengajuan from './pages/Pengajuan';
import Riwayat from './pages/Riwayat';
import ApprovalList from './pages/ApprovalList';

const Layout = ({ children }) => (
  <div className="flex min-h-screen bg-gray-50">
    <Sidebar />
    <main className="flex-1 overflow-auto">{children}</main>
  </div>
);

const PrivateRoute = ({ children, adminOnly }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" />;
  return <Layout>{children}</Layout>;
};

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/divisi" element={<PrivateRoute adminOnly><Divisi /></PrivateRoute>} />
      <Route path="/anggaran" element={<PrivateRoute adminOnly><Anggaran /></PrivateRoute>} />
      <Route path="/approval" element={<PrivateRoute adminOnly><ApprovalList /></PrivateRoute>} />
      <Route path="/pengajuan" element={<PrivateRoute><Pengajuan /></PrivateRoute>} />
      <Route path="/riwayat" element={<PrivateRoute><Riwayat /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
