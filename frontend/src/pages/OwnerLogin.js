import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Link,
  Alert,
  IconButton,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginIcon from '@mui/icons-material/Login';

const OwnerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const result = await login(email, password, 'owner');
      if (result.success) {
        navigate('/owner/dashboard');
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
    }
  };

  return (
    <Container maxWidth="md" sx={{ height: '100vh' }}>
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            width: '100%',
            minHeight: '500px',
            display: 'flex',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          {/* Left Section */}
          <Box
            sx={{
              flex: '0 0 35%',
              background: 'linear-gradient(135deg, #1D2F6F 0%, #4A5A9A 100%)',
              color: 'white',
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconButton
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                mb: 3,
                p: 2,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              <LoginIcon sx={{ fontSize: 40, color: 'white' }} />
            </IconButton>
            <Typography variant="h4" component="h1" align="center" sx={{ fontWeight: 600, mb: 2 }}>
              WELCOME BACK
            </Typography>
            <Typography variant="body1" align="center" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 3 }}>
              Access your parking space dashboard
            </Typography>
          </Box>

          {/* Right Section */}
          <Box
            sx={{
              flex: '1 1 65%',
              bgcolor: '#fff',
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: '#1D2F6F', fontWeight: 600, mb: 1 }}>
                Parking Owner Portal
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to manage your parking spaces and bookings
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3, backgroundColor: 'rgba(211, 47, 47, 0.1)' }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={{ mb: 2.5 }}
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={{ mb: 3 }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                sx={{
                  py: 1.5,
                  backgroundColor: '#1D2F6F',
                  fontSize: '1rem',
                  '&:hover': {
                    backgroundColor: '#4A5A9A',
                  },
                }}
              >
                Sign In
              </Button>

              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Typography variant="body2" color="textSecondary">
                  Don't have an account?{' '}
                  <Link
                    component={RouterLink}
                    to="/owner-register"
                    sx={{
                      color: '#1D2F6F',
                      textDecoration: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Register here
                  </Link>
                </Typography>
              </Box>
            </form>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default OwnerLogin; 