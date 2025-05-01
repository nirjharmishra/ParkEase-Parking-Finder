import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import theme from './theme';
import UserLogin from './pages/UserLogin';
import OwnerLogin from './pages/OwnerLogin';
import UserRegister from './pages/UserRegister';
import OwnerRegister from './pages/OwnerRegister';
import UserDashboard from './pages/UserDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import Home from './pages/Home';
import FAQ from './pages/FAQ';
import Navbar from './components/Navbar';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, isOwner, isUser, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole === 'owner' && !isOwner()) {
    return <Navigate to="/user/dashboard" replace />;
  }

  if (requiredRole === 'user' && !isUser()) {
    return <Navigate to="/owner/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/user-login" element={isAuthenticated() ? <Navigate to="/user/dashboard" replace /> : <UserLogin />} />
      <Route path="/owner-login" element={isAuthenticated() ? <Navigate to="/owner/dashboard" replace /> : <OwnerLogin />} />
      <Route path="/user-register" element={isAuthenticated() ? <Navigate to="/user/dashboard" replace /> : <UserRegister />} />
      <Route path="/owner-register" element={isAuthenticated() ? <Navigate to="/owner/dashboard" replace /> : <OwnerRegister />} />
      <Route path="/faq" element={<FAQ />} />
      <Route
        path="/user/dashboard"
        element={
          <ProtectedRoute requiredRole="user">
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/dashboard"
        element={
          <ProtectedRoute requiredRole="owner">
            <OwnerDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Navbar />
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 