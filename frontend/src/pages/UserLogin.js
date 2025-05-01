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
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UserLogin = () => {
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
      const result = await login(email, password, 'user');
      if (result.success) {
        navigate('/user/dashboard');
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
          {/* Left Section - Form */}
          <Box
            sx={{
              flex: '1 1 50%',
              bgcolor: '#fff',
              p: 6,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 500 }}>
              Login
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                placeholder="Enter your email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                variant="standard"
                sx={{
                  mb: 3,
                  '& .MuiInput-underline:before': {
                    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
                  },
                  '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
                    borderBottomColor: '#1D2F6F',
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <Box component="span" sx={{ color: '#1D2F6F', mr: 1 }}>
                      ✉
                    </Box>
                  ),
                }}
              />

              <TextField
                fullWidth
                placeholder="Enter your password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                variant="standard"
                sx={{
                  mb: 4,
                  '& .MuiInput-underline:before': {
                    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
                  },
                  '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
                    borderBottomColor: '#1D2F6F',
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <Box component="span" sx={{ color: '#1D2F6F', mr: 1 }}>
                      🔒
                    </Box>
                  ),
                }}
              />

              <Button
                fullWidth
                type="submit"
                sx={{
                  py: 1.5,
                  mb: 3,
                  background: 'linear-gradient(to right, #1D2F6F, #4A5A9A)',
                  color: 'white',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  '&:hover': {
                    background: 'linear-gradient(to right, #162554, #3F4D84)',
                  },
                }}
              >
                Login
              </Button>

              <Typography variant="body2" align="center" sx={{ color: 'text.secondary' }}>
                Don't have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/user-register"
                  sx={{
                    color: '#1D2F6F',
                    textDecoration: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Signup now
                </Link>
              </Typography>
            </form>
          </Box>

          {/* Right Section - Image */}
          <Box
            sx={{
              flex: '1 1 50%',
              p: 6,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'white',
              background: 'linear-gradient(rgba(29, 47, 111, 0.9), rgba(74, 90, 154, 0.9)), url("/assets/images/parking-bg.jpg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <Typography variant="h4" align="center" sx={{ mb: 2, fontWeight: 600 }}>
              Welcome Back to
            </Typography>
            <Typography variant="h4" align="center" sx={{ mb: 3, fontWeight: 600 }}>
              ParkEase
            </Typography>
            <Typography variant="body1" align="center" sx={{ opacity: 0.9 }}>
              Your trusted parking solution
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default UserLogin; 