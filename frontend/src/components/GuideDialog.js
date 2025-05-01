import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Paper,
} from '@mui/material';
import {
  DirectionsCar,
  Security,
  Speed,
  LocalParking,
  Help,
  ArrowForward,
} from '@mui/icons-material';

const steps = [
  {
    title: 'Getting Started',
    description: 'Welcome to ParkEase! Start by registering as a user or parking space owner.',
    icon: <DirectionsCar />,
  },
  {
    title: 'Find Parking',
    description: 'Search for available parking spaces in your desired location. Use filters to find the perfect spot.',
    icon: <LocalParking />,
  },
  {
    title: 'Book Your Space',
    description: 'Select your preferred parking space, choose the duration, and complete the booking process.',
    icon: <Speed />,
  },
  {
    title: 'Secure Payment',
    description: 'Make secure payments using various payment methods. Your transaction is protected.',
    icon: <Security />,
  },
  {
    title: 'Need Help?',
    description: 'Access our FAQ section or contact support for any assistance you may need.',
    icon: <Help />,
  },
];

const GuideDialog = ({ open, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleFinish = () => {
    setActiveStep(0);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
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
          Website Guide
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Follow these steps to make the most of our parking platform
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ width: '100%', mt: 2 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((step, index) => (
              <Step key={index}>
                <StepLabel>{step.title}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
        <Paper
          elevation={0}
          sx={{
            mt: 4,
            p: 3,
            borderRadius: 2,
            background: 'white',
            border: '1px solid rgba(26, 47, 111, 0.1)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #1D2F6F 0%, #8390FA 100%)',
                color: 'white',
              }}
            >
              {steps[activeStep].icon}
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
              {steps[activeStep].title}
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: '600px' }}>
              {steps[activeStep].description}
            </Typography>
          </Box>
        </Paper>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={activeStep === 0 ? onClose : handleBack}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          {activeStep === 0 ? 'Cancel' : 'Back'}
        </Button>
        <Button
          variant="contained"
          onClick={activeStep === steps.length - 1 ? handleFinish : handleNext}
          endIcon={activeStep === steps.length - 1 ? null : <ArrowForward />}
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
          {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GuideDialog; 