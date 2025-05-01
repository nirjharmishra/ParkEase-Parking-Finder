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
  Snackbar,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UserRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    const { confirmPassword, ...userData } = formData;
    const result = await register(userData, 'user');

    if (result.success) {
      setOpenSnackbar(true);
      setTimeout(() => {
        navigate('/user-login', { state: { message: 'Registration successful. Please login to continue.' } });
      }, 2000);
    } else {
      setError(result.error);
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
              Create Account
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                placeholder="Enter your name"
                name="name"
                value={formData.name}
                onChange={handleChange}
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
                      👤
                    </Box>
                  ),
                }}
              />

              <TextField
                fullWidth
                placeholder="Enter your email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
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
                placeholder="Create password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
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
                      🔒
                    </Box>
                  ),
                }}
              />

              <TextField
                fullWidth
                placeholder="Confirm password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
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
                  mb: 2,
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
                Sign Up
              </Button>

              <Typography variant="body2" align="center" sx={{ color: 'text.secondary' }}>
                Already have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/user-login"
                  sx={{
                    color: '#1D2F6F',
                    textDecoration: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Login here
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
              background: 'linear-gradient(rgba(29, 47, 111, 0.9), rgba(74, 90, 154, 0.9)), url("/assets/images/parking-register-bg.jpg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <Typography variant="h4" align="center" sx={{ mb: 2, fontWeight: 600 }}>
              Start Your Journey
            </Typography>
            <Typography variant="h4" align="center" sx={{ mb: 3, fontWeight: 600 }}>
              with ParkEase
            </Typography>
            <Typography variant="body1" align="center" sx={{ opacity: 0.9 }}>
              Register now to find perfect parking spots
            </Typography>
          </Box>
        </Paper>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: '100%' }}
        >
          Registration successful! Redirecting to login...
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserRegister; 