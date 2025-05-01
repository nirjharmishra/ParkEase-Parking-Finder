import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Send } from '@mui/icons-material';

const ContactDialog = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

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
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Reset form and show success
      setFormData({ name: '', email: '', message: '' });
      setIsSuccess(true);
      
      // Close dialog after 2 seconds
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          background: 'linear-gradient(135deg, #F8F9FF 0%, #E8ECFF 100%)',
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h5" component="div" sx={{ fontWeight: 600, color: 'primary.main' }}>
          Contact Support
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Our support team will get back to you as soon as possible
        </Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              required
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'white',
                },
              }}
            />
            <TextField
              required
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'white',
                },
              }}
            />
            <TextField
              required
              label="Message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'white',
                },
              }}
            />
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
            {isSuccess && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: 'success.light',
                  color: 'success.contrastText',
                }}
              >
                <Typography variant="body1">
                  Message sent successfully! Our team will contact you soon.
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={onClose}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <Send />}
            disabled={isSubmitting || isSuccess}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              background: 'linear-gradient(135deg, #1D2F6F 0%, #8390FA 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1D2F6F 0%, #8390FA 100%)',
                opacity: 0.9,
              },
            }}
          >
            {isSubmitting ? 'Sending...' : isSuccess ? 'Sent!' : 'Send Message'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ContactDialog; 