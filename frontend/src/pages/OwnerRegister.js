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
  IconButton,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const OwnerRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    businessName: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

    const { confirmPassword, ...ownerData } = formData;
    const result = await register(ownerData, 'owner');

    if (result.success) {
      setSuccessMessage('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/owner-login', { state: { message: 'Registration successful. Please login to continue.' } });
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
              <PersonAddIcon sx={{ fontSize: 40, color: 'white' }} />
            </IconButton>
            <Typography variant="h4" component="h1" align="center" sx={{ fontWeight: 600, mb: 2 }}>
              REGISTER
            </Typography>
            <Typography variant="body1" align="center" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 3 }}>
              Join our community of parking space owners
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
                Parking Owner Registration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create your account to start listing and managing parking spaces
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3, backgroundColor: 'rgba(211, 47, 47, 0.1)' }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <TextField
                  fullWidth
                  label="Business Name"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                />
              </Box>

              <TextField
                fullWidth
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                sx={{ mb: 2 }}
              />

              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </Box>

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
                Create Account
              </Button>

              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Typography variant="body2" color="textSecondary">
                  Already have an account?{' '}
                  <Link
                    component={RouterLink}
                    to="/owner-login"
                    sx={{
                      color: '#1D2F6F',
                      textDecoration: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Login here
                  </Link>
                </Typography>
              </Box>
            </form>
          </Box>
        </Paper>
      </Box>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={2000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default OwnerRegister; 