import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import HealthRisk from './pages/HealthRisk';
import SOS from './pages/SOS';
import Passport from './pages/Passport';
import PublicPassport from './pages/PublicPassport';
import Finder from './pages/Finder';
import RecoveryTracker from './pages/RecoveryTracker';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Protected route wrapper
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--teal)' }}>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup />} />
        <Route path="/passport/:passportId" element={<PublicPassport />} />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/health-risk" element={<PrivateRoute><HealthRisk /></PrivateRoute>} />
        <Route path="/sos" element={<PrivateRoute><SOS /></PrivateRoute>} />
        <Route path="/passport" element={<PrivateRoute><Passport /></PrivateRoute>} />
        <Route path="/finder" element={<PrivateRoute><Finder /></PrivateRoute>} />
        <Route path="/recovery" element={<PrivateRoute><RecoveryTracker /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}