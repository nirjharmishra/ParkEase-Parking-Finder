import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Snackbar, Alert } from '@mui/material';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const fetchUserData = useCallback(async (token) => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/me', {
        headers: {
          'x-auth-token': token
        },
      });
      
      if (!response.data || !response.data.role) {
        throw new Error('Invalid user data: missing role');
      }
      
      setUserData(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching user data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setUserData(null);
      }
      setError(error.response?.data?.message || 'Failed to fetch user data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserData(token);
    } else {
      setIsLoading(false);
    }
  }, [fetchUserData]);

  const register = async (userData, role) => {
    try {
      const endpoint = role === 'user' ? '/register/user' : '/register/owner';
      const response = await axios.post(`http://localhost:5000/api/auth${endpoint}`, userData);
      
      setError(null);
      return { success: true, message: response.data.message };
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const login = async (email, password, role) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
        role
      });
      
      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }
      
      localStorage.setItem('token', token);
      setUserData(user);
      setError(null);
      showSnackbar('Login successful!');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Login failed');
      showSnackbar(error.response?.data?.message || 'Login failed', 'error');
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const logout = useCallback(() => {
    try {
      localStorage.removeItem('token');
      setUserData(null);
      setError(null);
      showSnackbar('Logged out successfully!');
      setTimeout(() => {
        window.location.replace('/');
      }, 2000);
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to logout. Please try again.');
      showSnackbar('Failed to logout. Please try again.', 'error');
      return false;
    }
  }, []);

  const isAuthenticated = useCallback(() => {
    return !!userData && !!localStorage.getItem('token');
  }, [userData]);

  const isOwner = useCallback(() => {
    return userData?.role === 'owner';
  }, [userData]);

  const isUser = useCallback(() => {
    return userData?.role === 'user';
  }, [userData]);

  const getDashboardPath = useCallback(() => {
    if (isOwner()) {
      return '/owner/dashboard';
    } else if (isUser()) {
      return '/user/dashboard';
    }
    return '/';
  }, [isOwner, isUser]);

  return (
    <AuthContext.Provider
      value={{
        userData,
        isLoading,
        error,
        register,
        login,
        logout,
        isAuthenticated,
        isOwner,
        isUser,
        getDashboardPath,
      }}
    >
      {children}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 