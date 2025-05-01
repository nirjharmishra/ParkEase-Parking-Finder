import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Grid, Paper, useTheme, useMediaQuery, Button, Rating, Avatar } from '@mui/material';
import { DirectionsCar, Security, Speed, Download, Help, ArrowForward, PhoneAndroid, PhoneIphone, LocalParking } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ContactDialog from '../components/ContactDialog';
import GuideDialog from '../components/GuideDialog';

const FeatureCard = ({ icon: Icon, title, description }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      transition: 'all 0.3s ease',
      background: 'rgba(255, 255, 255, 0.9)',
      border: '1px solid rgba(26, 47, 111, 0.1)',
      '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: '0 12px 24px rgba(26, 47, 111, 0.1)',
        backgroundColor: '#FFFFFF',
      },
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
        mb: 2,
      }}
    >
      <Icon sx={{ fontSize: 32, color: '#FFFFFF' }} />
    </Box>
    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
      {title}
    </Typography>
    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
      {description}
    </Typography>
  </Paper>
);

const ReviewCard = ({ name, rating, comment, avatar }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(255, 255, 255, 0.9)',
      border: '1px solid rgba(26, 47, 111, 0.1)',
      borderRadius: 2,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Avatar src={avatar} sx={{ mr: 2 }} />
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{name}</Typography>
        <Rating value={rating} readOnly size="small" />
      </Box>
    </Box>
    <Typography variant="body2" sx={{ color: 'text.secondary' }}>{comment}</Typography>
  </Paper>
);

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isAuthenticated, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [guideDialogOpen, setGuideDialogOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      navigate(getDashboardPath());
    }
  }, [isAuthenticated, getDashboardPath, navigate]);

  const features = [
    {
      icon: DirectionsCar,
      title: 'Easy Parking Space Booking',
      description: 'Find and book parking spaces in just a few clicks with our intuitive interface.',
    },
    {
      icon: Speed,
      title: 'Real-time Availability',
      description: 'Get instant updates on parking space availability and make quick decisions.',
    },
    {
      icon: Security,
      title: 'Secure Payment Processing',
      description: 'Safe and secure payment methods with multiple options to choose from.',
    },
    {
      icon: LocalParking,
      title: 'Parking Space Management',
      description: 'Comprehensive tools for managing and monitoring parking spaces efficiently.',
    },
  ];

  const reviews = [
    {
      name: 'Rajesh Kumar',
      rating: 5,
      comment: 'बहुत बढ़िया ऐप! भीड़-भाड़ वाले इलाकों में तुरंत पार्किंग स्पॉट मिल जाता है।',
      avatar: 'https://i.pravatar.cc/150?img=1',
    },
    {
      name: 'Priya Sharma',
      rating: 5,
      comment: 'Very convenient and user-friendly. Saved me a lot of time during my daily commute!',
      avatar: 'https://i.pravatar.cc/150?img=2',
    },
    {
      name: 'Amit Patel',
      rating: 5,
      comment: 'The best parking solution I\'ve ever used. Highly recommended for all drivers!',
      avatar: 'https://i.pravatar.cc/150?img=3',
    },
    {
      name: 'Neha Gupta',
      rating: 4,
      comment: 'मैं इस ऐप से बहुत खुश हूं। पार्किंग की समस्या अब बीते दिनों की बात हो गई है।',
      avatar: 'https://i.pravatar.cc/150?img=4',
    },
    {
      name: 'Vikram Singh',
      rating: 5,
      comment: 'Excellent service! The real-time availability feature is a game-changer.',
      avatar: 'https://i.pravatar.cc/150?img=5',
    },
    {
      name: 'Ananya Reddy',
      rating: 5,
      comment: 'As a working professional, this app has made my life so much easier. Thank you!',
      avatar: 'https://i.pravatar.cc/150?img=6',
    }
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #F8F9FF 0%, #E8ECFF 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          minHeight: { xs: '80vh', md: '90vh' },
          background: 'linear-gradient(135deg, #1D2F6F 0%, #8390FA 100%)',
          color: 'white',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '150px',
            background: 'linear-gradient(to bottom right, transparent 49%, #F8F9FF 50%)',
          },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  height: '100%',
                  textAlign: { xs: 'center', md: 'left' },
                  position: 'relative',
                  zIndex: 1,
                  pt: { xs: 4, md: 0 },
                }}
              >
                <Typography
                  variant={isMobile ? 'h2' : 'h1'}
                  component="h1"
                  gutterBottom
                  sx={{
                    fontWeight: 800,
                    mb: 3,
                    color: 'white',
                    lineHeight: 1.2,
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                >
                  Smart Parking Management
                </Typography>
                <Typography
                  variant={isMobile ? 'h5' : 'h4'}
                  component="h2"
                  gutterBottom
                  sx={{ 
                    mb: 4, 
                    color: 'rgba(255, 255, 255, 0.9)',
                    lineHeight: 1.5,
                    fontWeight: 400,
                  }}
                >
                  Find and book parking spaces with ease. Experience seamless parking management with our advanced platform.
                </Typography>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    gap: 3, 
                    justifyContent: { xs: 'center', md: 'flex-start' },
                    flexWrap: 'wrap',
                    mb: { xs: 4, md: 0 },
                  }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/user-register')}
                    sx={{
                      px: 5,
                      py: 2,
                      borderRadius: 3,
                      background: 'white',
                      color: 'primary.main',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.9)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 20px rgba(0,0,0,0.15)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Get Started
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/owner-register')}
                    sx={{
                      px: 5,
                      py: 2,
                      borderRadius: 3,
                      borderWidth: 2,
                      borderColor: 'white',
                      color: 'white',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: 'white',
                        background: 'rgba(255, 255, 255, 0.1)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    List Your Space
                  </Button>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  position: 'relative',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '500px',
                      height: '500px',
                      background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)',
                      borderRadius: '50%',
                    },
                  }}
                >
                  <Box
                    component="img"
                    src="/hero-image.svg"
                    alt="Smart Parking"
                    sx={{
                      width: '100%',
                      height: 'auto',
                      maxWidth: '500px',
                      display: 'block',
                      margin: '0 auto',
                      filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.2))',
                      animation: 'float 6s ease-in-out infinite',
                      '@keyframes float': {
                        '0%': { transform: 'translateY(0px)' },
                        '50%': { transform: 'translateY(-20px)' },
                        '100%': { transform: 'translateY(0px)' },
                      },
                    }}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Why Choose Us Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, background: '#F8F9FF' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{
              mb: 6,
              fontWeight: 700,
              color: 'primary.main',
            }}
          >
            Why Choose Us?
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <FeatureCard {...feature} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Reviews Section */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{
              mb: 6,
              fontWeight: 700,
              color: 'primary.main',
            }}
          >
            What Our Users Say
          </Typography>
          <Grid container spacing={4}>
            {reviews.map((review, index) => (
              <Grid item xs={12} md={4} key={index}>
                <ReviewCard {...review} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Download App Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, background: '#F8F9FF' }}>
        <Container maxWidth="lg">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              background: 'linear-gradient(135deg, #1D2F6F 0%, #8390FA 100%)',
              color: 'white',
              borderRadius: 2,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <Grid container alignItems="center" spacing={4}>
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      mb: 4,
                      '& > *': {
                        mx: 2,
                        fontSize: '4rem',
                        color: 'white',
                        opacity: 0.9,
                      },
                    }}
                  >
                    <PhoneIphone />
                    <PhoneAndroid />
                  </Box>
                  <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
                    Download Our App
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                    Get the best parking experience on your mobile device. Available for iOS and Android.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      startIcon={<Download />}
                      sx={{
                        background: 'white',
                        color: 'primary.main',
                        px: 5,
                        py: 1.5,
                        borderRadius: 2,
                        fontSize: '1.1rem',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.9)',
                        },
                      }}
                    >
                      App Store
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Download />}
                      sx={{
                        background: 'white',
                        color: 'primary.main',
                        px: 5,
                        py: 1.5,
                        borderRadius: 2,
                        fontSize: '1.1rem',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.9)',
                        },
                      }}
                    >
                      Play Store
                    </Button>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>

      {/* Help Section */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{
              mb: 6,
              fontWeight: 700,
              color: 'primary.main',
            }}
          >
            Need Help?
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  background: 'white',
                  border: '1px solid rgba(26, 47, 111, 0.1)',
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(26, 47, 111, 0.1)',
                  },
                }}
              >
                <Help sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  FAQs
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                  Find answers to common questions about our parking services.
                </Typography>
                <Button
                  variant="contained"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/faq')}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    background: 'white',
                    color: 'primary.main',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.9)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  View FAQs
                </Button>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  background: 'white',
                  border: '1px solid rgba(26, 47, 111, 0.1)',
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(26, 47, 111, 0.1)',
                  },
                }}
              >
                <Help sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  Contact Support
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                  Our support team is available 24/7 to assist you with any issues.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                  <Button
                    variant="contained"
                    onClick={() => setContactDialogOpen(true)}
                    endIcon={<ArrowForward />}
                    sx={{
                      borderRadius: 2,
                      px: 3,
                      py: 1,
                      background: 'white',
                      color: 'primary.main',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.9)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Contact Support
                  </Button>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  background: 'white',
                  border: '1px solid rgba(26, 47, 111, 0.1)',
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(26, 47, 111, 0.1)',
                  },
                }}
              >
                <Help sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  User Guides
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                  Learn how to make the most of our parking platform with detailed guides.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                  <Button
                    variant="contained"
                    onClick={() => setGuideDialogOpen(true)}
                    endIcon={<ArrowForward />}
                    sx={{
                      borderRadius: 2,
                      px: 3,
                      py: 1,
                      background: 'white',
                      color: 'primary.main',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.9)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    View Guides
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <ContactDialog
        open={contactDialogOpen}
        onClose={() => setContactDialogOpen(false)}
      />
      <GuideDialog
        open={guideDialogOpen}
        onClose={() => setGuideDialogOpen(false)}
      />
    </Box>
  );
};

export default Home; 