import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Divider,
  Chip,
  Avatar,
  Tooltip,
  Snackbar,
  Alert,
  LinearProgress,
  List,
  IconButton,
  CircularProgress,
  Checkbox,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import ParkingMap from '../components/ParkingMap';
import {
  LocationOn,
  AccessTime,
  DirectionsCar,
  Cancel,
  CheckCircle,
  LocalParking,
  Directions,
  Map,
  EventSeat,
  Error,
  Payment,
  InfoOutlined,
  KeyboardArrowUp,
  Close,
  Description,
} from '@mui/icons-material';
import DirectionsPopup from '../components/DirectionsPopup';

const TimeSelector = ({ label, value, onChange, error, isEndTime, startTime }) => {
  const [hours, setHours] = useState(value ? value.split(':')[0] : '00');
  const [minutes, setMinutes] = useState(value ? value.split(':')[1] : '00');

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':');
      setHours(h);
      setMinutes(m);
    }
  }, [value]);

  const handleHoursChange = (e) => {
    const newHours = e.target.value;
    setHours(newHours);
    const formattedTime = `${newHours.padStart(2, '0')}:${minutes}`;
    onChange(formattedTime);
  };

  const handleMinutesChange = (e) => {
    const newMinutes = e.target.value;
    setMinutes(newMinutes);
    const formattedTime = `${hours.padStart(2, '0')}:${newMinutes}`;
    onChange(formattedTime);
  };

  // Calculate valid hours for end time
  const getValidHours = () => {
    if (!isEndTime || !startTime) {
      return Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    }

    const [startHour, startMinute] = startTime.split(':');
    const startTotalMinutes = parseInt(startHour) * 60 + parseInt(startMinute);
    
    return Array.from({ length: 24 }, (_, i) => {
      const hour = i.toString().padStart(2, '0');
      const hourTotalMinutes = i * 60;
      return hourTotalMinutes > startTotalMinutes ? hour : null;
    }).filter(Boolean);
  };

  // Calculate valid minutes for end time
  const getValidMinutes = () => {
    if (!isEndTime || !startTime) {
      return ['00', '15', '30', '45'];
    }

    const [startHour, startMinute] = startTime.split(':');
    const startTotalMinutes = parseInt(startHour) * 60 + parseInt(startMinute);
    const currentTotalMinutes = parseInt(hours) * 60;
    
    if (currentTotalMinutes > startTotalMinutes) {
      return ['00', '15', '30', '45'];
    }

    const startMinuteIndex = ['00', '15', '30', '45'].findIndex(m => parseInt(m) >= parseInt(startMinute));
    return ['00', '15', '30', '45'].slice(startMinuteIndex);
  };

  return (
    <Box sx={{ 
      border: error ? '1px solid #f44336' : '1px solid rgba(0, 0, 0, 0.23)',
      borderRadius: 1,
      p: 1,
      '&:hover': {
        borderColor: error ? '#f44336' : 'rgba(0, 0, 0, 0.87)',
      }
    }}>
      <Typography variant="caption" color={error ? 'error' : 'text.secondary'} sx={{ ml: 1 }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <FormControl size="small">
          <Select
            value={hours}
            onChange={handleHoursChange}
            sx={{ minWidth: 80 }}
          >
            {getValidHours().map((hour) => (
              <MenuItem key={hour} value={hour}>{hour}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography>:</Typography>
        <FormControl size="small">
          <Select
            value={minutes}
            onChange={handleMinutesChange}
            sx={{ minWidth: 80 }}
          >
            {getValidMinutes().map((minute) => (
              <MenuItem key={minute} value={minute}>{minute}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
};

const UserDashboard = () => {
  const { userData } = useAuth();
  const [parkingSpaces, setParkingSpaces] = useState([]);
  const [filteredSpaces, setFilteredSpaces] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [openBookingDialog, setOpenBookingDialog] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    date: '',
    startTime: '',
    endTime: '',
    vehicleNumber: '',
  });
  const [timeError, setTimeError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);
  const mapRef = useRef(null);
  const [bookingSuccessDialogOpen, setBookingSuccessDialogOpen] = useState(false);
  const [newBooking, setNewBooking] = useState(null);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [showDirections, setShowDirections] = useState(false);
  const [directionsSpace, setDirectionsSpace] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        
        const [spacesResponse, bookingsResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/user/parking-spaces', {
            headers: { 'x-auth-token': token }
          }),
          axios.get('http://localhost:5000/api/user/bookings', {
            headers: { 'x-auth-token': token }
          })
        ]);

        setParkingSpaces(spacesResponse.data);
        setFilteredSpaces(spacesResponse.data);
        setBookings(bookingsResponse.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.msg || 'Failed to load data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get user's location and sort parking spaces
  useEffect(() => {
    const getLocationAndSort = async () => {
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          setUserLocation([userLat, userLng]);

          // Calculate distance for each space using Haversine formula
          const spacesWithDistance = parkingSpaces.map(space => {
            const R = 6371; // Earth's radius in kilometers
            const dLat = (space.coordinates.lat - userLat) * Math.PI / 180;
            const dLon = (space.coordinates.lng - userLng) * Math.PI / 180;
            const a = 
              Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(userLat * Math.PI / 180) * Math.cos(space.coordinates.lat * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2); 
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
            const distance = R * c; // Distance in kilometers
            return { ...space, distance };
          }).sort((a, b) => {
            // First sort by availability (available spaces first)
            if (a.availableSpots > 0 && b.availableSpots === 0) return -1;
            if (a.availableSpots === 0 && b.availableSpots > 0) return 1;
            // Then sort by distance
            return a.distance - b.distance;
          });

          setFilteredSpaces(spacesWithDistance);
        } catch (error) {
          console.error('Error getting location:', error);
        }
      }
    };

    if (parkingSpaces.length > 0) {
      getLocationAndSort();
    }
  }, [parkingSpaces]);

  const handleParkingCardClick = (space) => {
    setSelectedSpace(space);
    setOpenDetailsDialog(true);
  };

  const handleBookNow = () => {
    setOpenDetailsDialog(false);
    setOpenBookingDialog(true);
  };

  const handleMarkerClick = (space) => {
    setSelectedSpace(space);
    setOpenBookingDialog(true);
  };

  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = parkingSpaces.filter(space => 
      space.name.toLowerCase().includes(searchTerm) ||
      space.address.toLowerCase().includes(searchTerm)
    );
    setFilteredSpaces(filtered);
  };

  const validateTimes = () => {
    if (!bookingDetails.date || !bookingDetails.startTime || !bookingDetails.endTime) {
      return false;
    }

    const startDateTime = new Date(`${bookingDetails.date}T${bookingDetails.startTime}`);
    const endDateTime = new Date(`${bookingDetails.date}T${bookingDetails.endTime}`);
    const currentDateTime = new Date();

    if (startDateTime < currentDateTime) {
      setTimeError('Start time cannot be in the past');
      return false;
    }

    if (endDateTime <= startDateTime) {
      setTimeError('End time must be after start time');
      return false;
    }

    setTimeError('');
    return true;
  };

  const handleTimeChange = (field, value) => {
    setBookingDetails({ ...bookingDetails, [field]: value });
    if (bookingDetails.startTime && bookingDetails.endTime) {
      validateTimes();
    }
  };

  const handleConfirmBooking = () => {
    if (!validateTimes()) {
      return;
    }
    if (!termsAccepted) {
      setError('Please accept the terms and conditions to proceed');
      return;
    }
    handleBookingSubmit();
  };

  const handleBookingSubmit = async () => {
    try {
      setIsBookingLoading(true);
      const token = localStorage.getItem('token');
      const startDateTime = new Date(`${bookingDetails.date}T${bookingDetails.startTime}`);
      const endDateTime = new Date(`${bookingDetails.date}T${bookingDetails.endTime}`);

      const response = await axios.post(
        'http://localhost:5000/api/user/bookings',
        {
          parkingSpaceId: selectedSpace._id,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          vehicleNumber: bookingDetails.vehicleNumber,
        },
        {
          headers: {
            'x-auth-token': token
          }
        }
      );

      if (response.data) {
        setNewBooking(response.data);
        setOpenBookingDialog(false);
        setBookingSuccessDialogOpen(true);
        
        // Clear the booking form
        setBookingDetails({
          date: '',
          startTime: '',
          endTime: '',
          vehicleNumber: '',
        });
        
        // Refresh bookings and parking spaces
        const [bookingsResponse, spacesResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/user/bookings', {
            headers: { 'x-auth-token': token }
          }),
          axios.get('http://localhost:5000/api/user/parking-spaces', {
            headers: { 'x-auth-token': token }
          })
        ]);
        setBookings(bookingsResponse.data);
        setParkingSpaces(spacesResponse.data);
        setFilteredSpaces(spacesResponse.data);
        setError('');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      if (error.response) {
        setError(error.response.data.msg || 'Error creating booking');
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setIsBookingLoading(false);
    }
  };

  const handleCancelClick = (booking) => {
    setBookingToCancel(booking);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!bookingToCancel) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `http://localhost:5000/api/user/bookings/${bookingToCancel._id}/cancel`,
        {},
        {
          headers: {
            'x-auth-token': token
          }
        }
      );

      if (response.data.msg === 'Booking cancelled successfully') {
        // Update the bookings list
        setBookings(bookings.map(booking => 
          booking._id === bookingToCancel._id ? { ...booking, status: 'cancelled' } : booking
        ));
        
        // Show success message
        setSuccessMessage('Booking cancelled successfully');
        
        // Refresh parking spaces to update availability
        const spacesResponse = await axios.get('http://localhost:5000/api/user/parking-spaces', {
          headers: {
            'x-auth-token': token
          }
        });
        setParkingSpaces(spacesResponse.data);
        setFilteredSpaces(spacesResponse.data);
      }
    } catch (error) {
      console.error('Error canceling booking:', error);
      setError(error.response?.data?.msg || 'Failed to cancel booking');
    } finally {
      setCancelDialogOpen(false);
      setBookingToCancel(null);
    }
  };

  const handleCancelClose = () => {
    setCancelDialogOpen(false);
    setBookingToCancel(null);
  };

  const calculateDuration = (startTime, endTime, date) => {
    if (!startTime || !endTime || !date) return 0;
    
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    const durationInHours = (end - start) / (1000 * 60 * 60);
    return durationInHours;
  };

  const formatDuration = (hours) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    
    if (wholeHours === 0) {
      return `${minutes} minutes`;
    } else if (minutes === 0) {
      return `${wholeHours} ${wholeHours === 1 ? 'hour' : 'hours'}`;
    } else {
      return `${wholeHours} ${wholeHours === 1 ? 'hour' : 'hours'} ${minutes} minutes`;
    }
  };

  const calculateTotalCost = () => {
    if (!selectedSpace || !bookingDetails.startTime || !bookingDetails.endTime || !bookingDetails.date) {
      return 0;
    }

    const durationInHours = calculateDuration(
      bookingDetails.startTime,
      bookingDetails.endTime,
      bookingDetails.date
    );
    
    return (durationInHours * selectedSpace.price).toFixed(2);
  };

  const checkAndUpdateCompletedBookings = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const now = new Date();
      
      // Update bookings that have ended
      const updatedBookings = bookings.map(booking => {
        if (booking.status === 'confirmed' && new Date(booking.endTime) < now) {
          return { ...booking, status: 'completed' };
        }
        return booking;
      });

      // If any bookings were updated, save to backend
      const completedBookings = updatedBookings.filter(
        (booking, index) => booking.status === 'completed' && bookings[index].status !== 'completed'
      );

      if (completedBookings.length > 0) {
        await Promise.all(
          completedBookings.map(booking =>
            axios.patch(
              `http://localhost:5000/api/user/bookings/${booking._id}/complete`,
              {},
              {
                headers: {
                  'x-auth-token': token
                }
              }
            )
          )
        );
        
        // Update local state
        setBookings(updatedBookings);
        
        // Refresh parking spaces to update availability
        const spacesResponse = await axios.get('http://localhost:5000/api/user/parking-spaces', {
          headers: {
            'x-auth-token': token
          }
        });
        setParkingSpaces(spacesResponse.data);
        setFilteredSpaces(spacesResponse.data);
      }
    } catch (error) {
      console.error('Error updating completed bookings:', error);
    }
  }, [bookings]);

  useEffect(() => {
    const interval = setInterval(checkAndUpdateCompletedBookings, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [checkAndUpdateCompletedBookings]);

  const handleShowDirections = (space) => {
    setDirectionsSpace(space);
    setShowDirections(true);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: 'background.default',
      py: 2,
      overflow: 'hidden',
      '& .success-animation': {
        animation: 'scaleIn 0.5s ease-out'
      }
    }}>
      <style>
        {`
          @keyframes scaleIn {
            0% {
              transform: scale(0);
              opacity: 0;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}
      </style>
      
      <Container maxWidth="xl" sx={{ height: '100%' }}>
        {/* Header Section with Tabs */}
        <Box sx={{ 
          mb: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2
        }}>
          <Box>
            <Typography variant="h5" component="h1" sx={{ 
              fontWeight: 'bold',
              color: 'primary.main',
              mb: 0.5
            }}>
              Welcome back, {userData?.name}!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Find and book your parking space
            </Typography>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 2
          }}>
            <Box sx={{ 
              display: 'flex',
              bgcolor: 'background.paper',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              p: 0.5
            }}>
              <Tabs 
                value={activeTab} 
                onChange={(e, newValue) => setActiveTab(newValue)}
                TabIndicatorProps={{
                  sx: {
                    backgroundColor: 'primary.main',
                    height: 2,
                    bottom: 0
                  }
                }}
                sx={{
                  minHeight: 'auto',
                  '& .MuiTab-root': {
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    minWidth: '100px',
                    textTransform: 'none',
                    color: 'text.primary',
                    py: 1,
                    px: 2,
                    minHeight: 'auto',
                    '&.Mui-selected': {
                      color: 'primary.main',
                    }
                  }
                }}
              >
                <Tab 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Map sx={{ fontSize: 18 }} />
                      Map
                    </Box>
                  } 
                />
                <Tab 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <EventSeat sx={{ fontSize: 18 }} />
                      Bookings
                    </Box>
                  } 
                />
              </Tabs>
            </Box>

            <Avatar 
              sx={{ 
                width: 40, 
                height: 40,
                bgcolor: 'primary.main',
                fontSize: '1.2rem'
              }}
            >
              {userData?.name?.charAt(0)}
            </Avatar>
          </Box>
        </Box>
        
        {activeTab === 0 && (
          <Grid container spacing={2}>
            {/* Left Panel */}
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ 
                p: 2, 
                height: 'calc(100vh - 120px)', 
                display: 'flex', 
                flexDirection: 'column',
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider'
              }}>
                <Typography variant="subtitle1" gutterBottom sx={{ 
                  fontWeight: 'bold',
                  color: 'text.primary',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <LocalParking sx={{ color: '#1D2F6F', fontSize: 24 }} />
                  Available Parking Spaces
                </Typography>
                
                {/* Search Box */}
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search parking spaces..."
                  size="small"
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                      bgcolor: 'background.default'
                    }
                  }}
                  onChange={handleSearch}
                />

                {/* Parking Spaces List */}
                {filteredSpaces.length === 0 ? (
                  <Box
                    sx={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      p: 3,
                      gap: 2
                    }}
                  >
                    <LocalParking 
                      sx={{ 
                        fontSize: 48, 
                        color: 'text.secondary',
                        opacity: 0.5
                      }} 
                    />
                    <Typography 
                      variant="h6" 
                      color="text.secondary"
                      sx={{ fontWeight: 'medium' }}
                    >
                      No Parking Spaces Available
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ maxWidth: '80%' }}
                    >
                      There are currently no parking spaces available in your area. Please try again later or check back soon.
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ 
                    flexGrow: 1, 
                    overflow: 'auto',
                    pr: 1,
                    '&::-webkit-scrollbar': {
                      width: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: 'rgba(0,0,0,0.1)',
                      borderRadius: '3px',
                      '&:hover': {
                        background: 'rgba(0,0,0,0.2)',
                      }
                    }
                  }}>
                    {filteredSpaces.map((space, index) => (
                      <Card 
                        key={space._id}
                        sx={{ 
                          mb: 1.5,
                          transition: 'all 0.2s',
                          bgcolor: 'background.default',
                          border: '1px solid',
                          borderColor: index === 0 && userLocation ? 'primary.main' : 'divider',
                          borderRadius: 1.5,
                          position: 'relative',
                          cursor: 'pointer',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                            borderColor: 'primary.main'
                          }
                        }}
                        onClick={() => handleParkingCardClick(space)}
                      >
                        {index === 0 && userLocation && (
                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: -1,
                              left: 16,
                              bgcolor: '#E8F0FE',
                              color: '#1D2F6F',
                              px: 1,
                              py: 0.25,
                              borderRadius: '4px 4px 0 0',
                              fontSize: '0.7rem',
                              fontWeight: 'bold',
                              border: '1px solid',
                              borderColor: 'primary.main',
                              borderBottom: 'none',
                              zIndex: 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5
                            }}
                          >
                            Recommended
                            <Tooltip title="Nearest parking around you" arrow placement="top">
                              <InfoOutlined sx={{ fontSize: '0.8rem' }} />
                            </Tooltip>
                          </Box>
                        )}
                        <CardContent sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.75 }}>
                            <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                              {space.name}
                            </Typography>
                            <Chip
                              label={space.availableSpots > 0 ? 'Available' : 'Not Available'}
                              color={space.availableSpots > 0 ? 'success' : 'error'}
                              size="small"
                              sx={{ 
                                fontWeight: 'bold',
                                borderRadius: 1,
                                height: 22,
                                fontSize: '0.75rem'
                              }}
                            />
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
                            <LocationOn sx={{ fontSize: 15, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                              {space.address}
                            </Typography>
                          </Box>

                          {userLocation && space.distance !== undefined && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
                              <Directions sx={{ fontSize: 15, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                                {space.distance?.toFixed(1)} km away
                              </Typography>
                            </Box>
                          )}

                          <Box sx={{ mb: 0.75 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                                Available Spots
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                                {space.availableSpots}/{space.totalSpots}
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={(space.availableSpots / space.totalSpots) * 100}
                              color={
                                (space.availableSpots / space.totalSpots) >= 0.7 ? 'success' :
                                (space.availableSpots / space.totalSpots) >= 0.3 ? 'warning' : 'error'
                              }
                              sx={{ 
                                height: 5, 
                                borderRadius: 2.5,
                                bgcolor: 'background.paper'
                              }}
                            />
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
                            <Payment sx={{ color: '#1D2F6F', fontSize: 17 }} />
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                              ₹{space.price}/hour
                            </Typography>
                          </Box>

                          <CardActions sx={{ p: 0, justifyContent: 'flex-end', gap: 0.5 }}>
                            <Tooltip title="Show Directions">
                              <IconButton 
                                color="primary"
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleShowDirections(space);
                                }}
                                sx={{
                                  bgcolor: '#E8F0FE',
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    background: 'linear-gradient(135deg, #1D2F6F 0%, #8390FA 100%)',
                                    color: 'white',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                  }
                                }}
                              >
                                <Directions sx={{ fontSize: 19, color: '#1D2F6F' }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="View on Map">
                              <IconButton 
                                color="primary"
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (mapRef && mapRef.current) {
                                    const map = mapRef.current;
                                    const lat = parseFloat(space.coordinates.lat);
                                    const lng = parseFloat(space.coordinates.lng);
                                    if (!isNaN(lat) && !isNaN(lng)) {
                                      map.flyTo([lat, lng], 15, {
                                        duration: 1,
                                        easeLinearity: 0.25
                                      });
                                    }
                                  }
                                }}
                                sx={{
                                  bgcolor: '#E8F0FE',
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    background: 'linear-gradient(135deg, #1D2F6F 0%, #8390FA 100%)',
                                    color: 'white',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                  }
                                }}
                              >
                                <Map sx={{ fontSize: 19, color: '#1D2F6F' }} />
                              </IconButton>
                            </Tooltip>
                            {space.availableSpots > 0 && (
                              <Tooltip title="Book Now">
                                <IconButton 
                                  color="primary"
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedSpace(space);
                                    setOpenBookingDialog(true);
                                  }}
                                  sx={{
                                    bgcolor: '#E8F0FE',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      background: 'linear-gradient(135deg, #1D2F6F 0%, #8390FA 100%)',
                                      color: 'white',
                                      transform: 'translateY(-2px)',
                                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                    }
                                  }}
                                >
                                  <CheckCircle sx={{ fontSize: 19, color: '#1D2F6F' }} />
                                </IconButton>
                              </Tooltip>
                            )}
                          </CardActions>
                        </CardContent>
                      </Card>
                    ))}
                  </List>
                )}
              </Paper>
            </Grid>

            {/* Map View */}
            <Grid item xs={12} md={8}>
              <Paper elevation={0} sx={{ 
                p: 2, 
                height: 'calc(100vh - 120px)',
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider'
              }}>
                <ParkingMap 
                  parkingSpaces={filteredSpaces} 
                  onMarkerClick={handleMarkerClick}
                  mapRef={mapRef}
                />
              </Paper>
            </Grid>
          </Grid>
        )}

        {activeTab === 1 && (
          <Box sx={{ 
            height: 'calc(100vh - 120px)',
            overflow: 'auto',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(0,0,0,0.1)',
              borderRadius: '3px',
              '&:hover': {
                background: 'rgba(0,0,0,0.2)',
              }
            }
          }}>
            {/* Summary Section */}
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              mb: 3,
              flexWrap: 'wrap'
            }}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  flex: 1,
                  minWidth: '200px',
                  bgcolor: 'primary.light',
                  color: 'white',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <Avatar sx={{ bgcolor: 'white', color: 'primary.main' }}>
                  <LocalParking />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {bookings.length}
                  </Typography>
                  <Typography variant="body2">
                    Total Bookings
                  </Typography>
                </Box>
              </Paper>

              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  flex: 1,
                  minWidth: '200px',
                  bgcolor: 'success.light',
                  color: 'white',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <Avatar sx={{ bgcolor: 'white', color: 'success.main' }}>
                  <CheckCircle />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {bookings.filter(b => b.status === 'confirmed').length}
                  </Typography>
                  <Typography variant="body2">
                    Active Bookings
                  </Typography>
                </Box>
              </Paper>

              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  flex: 1,
                  minWidth: '200px',
                  bgcolor: 'info.light',
                  color: 'white',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <Avatar sx={{ bgcolor: 'white', color: 'info.main' }}>
                  <AccessTime />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {bookings.filter(b => b.status === 'completed').length}
                  </Typography>
                  <Typography variant="body2">
                    Completed Bookings
                  </Typography>
                </Box>
              </Paper>

              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  flex: 1,
                  minWidth: '200px',
                  bgcolor: 'error.light',
                  color: 'white',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <Avatar sx={{ bgcolor: 'white', color: 'error.main' }}>
                  <Cancel />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {bookings.filter(b => b.status === 'cancelled').length}
                  </Typography>
                  <Typography variant="body2">
                    Cancelled Bookings
                  </Typography>
                </Box>
              </Paper>
            </Box>

            {/* Bookings List */}
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            ) : bookings.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  p: 6,
                  gap: 2,
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  border: '1px dashed',
                  borderColor: 'divider',
                  mt: 2
                }}
              >
                <EventSeat 
                  sx={{ 
                    fontSize: 48, 
                    color: 'text.secondary',
                    opacity: 0.5
                  }} 
                />
                <Typography 
                  variant="h6" 
                  color="text.secondary"
                  sx={{ fontWeight: 'medium' }}
                >
                  No Bookings Yet
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ maxWidth: '80%' }}
                >
                  You haven't made any bookings yet. Find a parking space and make your first booking!
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Map />}
                  onClick={() => setActiveTab(0)}
                  sx={{ mt: 2 }}
                >
                  Find Parking Spaces
                </Button>
              </Box>
            ) : (
              <Box>
                {/* Active Bookings */}
                {bookings.filter(b => b.status === 'confirmed').length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: 'success.main' }}>
                      Active Bookings
                    </Typography>
                    <Grid container spacing={2}>
                      {bookings
                        .filter(b => b.status === 'confirmed')
                        .map((booking) => (
                          <Grid item xs={12} key={booking._id}>
                            <Card sx={{ 
                              transition: 'transform 0.2s, box-shadow 0.2s',
                              '&:hover': { 
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                              },
                              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 2
                            }}>
                              <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar 
                                      sx={{ 
                                        bgcolor: 'success.main',
                                        width: 40,
                                        height: 40
                                      }}
                                    >
                                      <CheckCircle />
                                    </Avatar>
                                    <Box>
                                      <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                                        {booking.parkingSpace?.name || 'Unknown Parking Space'}
                                      </Typography>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                                        <Typography variant="body2" color="text.secondary">
                                          {booking.parkingSpace?.address || 'Address not available'}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </Box>
                                  <Chip
                                    label="Active"
                                    color="success"
                                    size="small"
                                    sx={{ 
                                      fontWeight: 'bold',
                                      borderRadius: 1
                                    }}
                                  />
                                </Box>

                                <Grid container spacing={2} sx={{ mt: 1 }}>
                                  <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                      <AccessTime sx={{ color: 'text.secondary' }} />
                                      <Box>
                                        <Typography variant="body2" color="text.secondary">
                                          Start Time
                                        </Typography>
                                        <Typography variant="body1">
                                          {new Date(booking.startTime).toLocaleString()}
                                        </Typography>
                                      </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <AccessTime sx={{ color: 'text.secondary' }} />
                                      <Box>
                                        <Typography variant="body2" color="text.secondary">
                                          End Time
                                        </Typography>
                                        <Typography variant="body1">
                                          {new Date(booking.endTime).toLocaleString()}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </Grid>
                                  <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                      <DirectionsCar sx={{ color: 'text.secondary' }} />
                                      <Box>
                                        <Typography variant="body2" color="text.secondary">
                                          Vehicle Number
                                        </Typography>
                                        <Typography variant="body1">
                                          {booking.vehicleNumber}
                                        </Typography>
                                      </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Payment sx={{ color: 'text.secondary' }} />
                                      <Box>
                                        <Typography variant="body2" color="text.secondary">
                                          Total Price
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                          ₹{booking.totalPrice.toFixed(2)}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </Grid>
                                </Grid>
                              </CardContent>
                              <CardActions sx={{ 
                                p: 2, 
                                borderTop: '1px solid',
                                borderColor: 'divider',
                                justifyContent: 'flex-end'
                              }}>
                                <Tooltip title="Cancel Booking">
                                  <span>
                                    <Button 
                                      variant="outlined" 
                                      color="error"
                                      startIcon={<Cancel />}
                                      onClick={() => handleCancelClick(booking)}
                                      sx={{ 
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        '&:hover': {
                                          backgroundColor: 'error.light',
                                          color: 'white'
                                        }
                                      }}
                                    >
                                      Cancel Booking
                                    </Button>
                                  </span>
                                </Tooltip>
                              </CardActions>
                            </Card>
                          </Grid>
                        ))}
                    </Grid>
                  </Box>
                )}

                {/* Completed Bookings */}
                {bookings.filter(b => b.status === 'completed').length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: 'info.main' }}>
                      Completed Bookings
                    </Typography>
                    <Grid container spacing={2}>
                      {bookings
                        .filter(b => b.status === 'completed')
                        .map((booking) => (
                          <Grid item xs={12} key={booking._id}>
                            <Card sx={{ 
                              transition: 'transform 0.2s, box-shadow 0.2s',
                              '&:hover': { 
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                              },
                              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 2
                            }}>
                              <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar 
                                      sx={{ 
                                        bgcolor: 'info.main',
                                        width: 40,
                                        height: 40
                                      }}
                                    >
                                      <CheckCircle />
                                    </Avatar>
                                    <Box>
                                      <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                                        {booking.parkingSpace?.name || 'Unknown Parking Space'}
                                      </Typography>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                                        <Typography variant="body2" color="text.secondary">
                                          {booking.parkingSpace?.address || 'Address not available'}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </Box>
                                  <Chip
                                    label="Completed"
                                    color="info"
                                    size="small"
                                    sx={{ 
                                      fontWeight: 'bold',
                                      borderRadius: 1
                                    }}
                                  />
                                </Box>

                                <Grid container spacing={2} sx={{ mt: 1 }}>
                                  <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                      <AccessTime sx={{ color: 'text.secondary' }} />
                                      <Box>
                                        <Typography variant="body2" color="text.secondary">
                                          Start Time
                                        </Typography>
                                        <Typography variant="body1">
                                          {new Date(booking.startTime).toLocaleString()}
                                        </Typography>
                                      </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <AccessTime sx={{ color: 'text.secondary' }} />
                                      <Box>
                                        <Typography variant="body2" color="text.secondary">
                                          End Time
                                        </Typography>
                                        <Typography variant="body1">
                                          {new Date(booking.endTime).toLocaleString()}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </Grid>
                                  <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                      <DirectionsCar sx={{ color: 'text.secondary' }} />
                                      <Box>
                                        <Typography variant="body2" color="text.secondary">
                                          Vehicle Number
                                        </Typography>
                                        <Typography variant="body1">
                                          {booking.vehicleNumber}
                                        </Typography>
                                      </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Payment sx={{ color: 'text.secondary' }} />
                                      <Box>
                                        <Typography variant="body2" color="text.secondary">
                                          Total Price
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                          ₹{booking.totalPrice.toFixed(2)}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </Grid>
                                </Grid>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                    </Grid>
                  </Box>
                )}

                {/* Cancelled Bookings */}
                {bookings.filter(b => b.status === 'cancelled').length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: 'error.main' }}>
                      Cancelled Bookings
                    </Typography>
                    <Grid container spacing={2}>
                      {bookings
                        .filter(b => b.status === 'cancelled')
                        .map((booking) => (
                          <Grid item xs={12} key={booking._id}>
                            <Card sx={{ 
                              transition: 'transform 0.2s, box-shadow 0.2s',
                              '&:hover': { 
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                              },
                              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 2
                            }}>
                              <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar 
                                      sx={{ 
                                        bgcolor: 'error.main',
                                        width: 40,
                                        height: 40
                                      }}
                                    >
                                      <Cancel />
                                    </Avatar>
                                    <Box>
                                      <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                                        {booking.parkingSpace?.name || 'Unknown Parking Space'}
                                      </Typography>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                                        <Typography variant="body2" color="text.secondary">
                                          {booking.parkingSpace?.address || 'Address not available'}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </Box>
                                  <Chip
                                    label="Cancelled"
                                    color="error"
                                    size="small"
                                    sx={{ 
                                      fontWeight: 'bold',
                                      borderRadius: 1
                                    }}
                                  />
                                </Box>

                                <Grid container spacing={2} sx={{ mt: 1 }}>
                                  <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                      <AccessTime sx={{ color: 'text.secondary' }} />
                                      <Box>
                                        <Typography variant="body2" color="text.secondary">
                                          Start Time
                                        </Typography>
                                        <Typography variant="body1">
                                          {new Date(booking.startTime).toLocaleString()}
                                        </Typography>
                                      </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <AccessTime sx={{ color: 'text.secondary' }} />
                                      <Box>
                                        <Typography variant="body2" color="text.secondary">
                                          End Time
                                        </Typography>
                                        <Typography variant="body1">
                                          {new Date(booking.endTime).toLocaleString()}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </Grid>
                                  <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                      <DirectionsCar sx={{ color: 'text.secondary' }} />
                                      <Box>
                                        <Typography variant="body2" color="text.secondary">
                                          Vehicle Number
                                        </Typography>
                                        <Typography variant="body1">
                                          {booking.vehicleNumber}
                                        </Typography>
                                      </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Payment sx={{ color: 'text.secondary' }} />
                                      <Box>
                                        <Typography variant="body2" color="text.secondary">
                                          Total Price
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                          ₹{booking.totalPrice.toFixed(2)}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </Grid>
                                </Grid>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                    </Grid>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}

        {/* Parking Details Dialog */}
        <Dialog
          open={openDetailsDialog}
          onClose={() => setOpenDetailsDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              Parking Space Details
            </Typography>
            <IconButton
              onClick={() => setOpenDetailsDialog(false)}
              sx={{ 
                position: 'absolute',
                right: 8,
                top: 8,
                color: 'text.secondary'
              }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {selectedSpace && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {selectedSpace.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LocationOn sx={{ color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {selectedSpace.address}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Payment sx={{ color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      ₹{selectedSpace.price}/hour
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <DirectionsCar sx={{ color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {selectedSpace.availableSpots}/{selectedSpace.totalSpots} spots available
                    </Typography>
                  </Box>
                </Box>

                {selectedSpace.description && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Description
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedSpace.description}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleBookNow}
                  >
                    Book Now
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    onClick={() => handleShowDirections(selectedSpace)}
                  >
                    Get Directions
                  </Button>
                </Box>
              </Box>
            )}
          </DialogContent>
        </Dialog>

        {/* Booking Dialog */}
        <Dialog 
          open={openBookingDialog} 
          onClose={() => {
            setOpenBookingDialog(false);
            setError('');
          }}
          maxWidth="sm"
          fullWidth
          onClick={(e) => e.stopPropagation()}
          PaperProps={{
            sx: {
              position: 'relative',
              zIndex: 1300,
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              '& .MuiDialogContent-root': {
                position: 'relative',
                zIndex: 1300,
                padding: '16px'
              }
            }
          }}
          BackdropProps={{
            sx: {
              position: 'fixed',
              zIndex: 1299,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)'
            }
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: 'primary.main',
            color: 'white',
            py: 1.5,
            px: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <LocalParking sx={{ fontSize: 20 }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              Book Parking Space
            </Typography>
          </DialogTitle>
          <DialogContent onClick={(e) => e.stopPropagation()}>
            <Grid container spacing={2}>
              {/* Space Info */}
              <Grid item xs={12}>
                {selectedSpace && (
                  <Box sx={{ 
                    p: 1.5, 
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5, fontSize: '1rem' }}>{selectedSpace.name}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>{selectedSpace.address}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Payment sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>₹{selectedSpace.price}/hour</Typography>
                    </Box>
                  </Box>
                )}
              </Grid>

              {/* Booked By */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Booked By"
                  value={userData?.name || ''}
                  size="small"
                  disabled
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                      bgcolor: 'background.paper'
                    }
                  }}
                />
              </Grid>

              {/* Date and Vehicle Number */}
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date"
                  value={bookingDetails.date}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, date: e.target.value })}
                  size="small"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    min: new Date().toISOString().split('T')[0]
                  }}
                  onClick={(e) => e.stopPropagation()}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                      bgcolor: 'background.paper'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Vehicle Number"
                  value={bookingDetails.vehicleNumber}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, vehicleNumber: e.target.value })}
                  size="small"
                  placeholder="Enter vehicle number"
                  required
                  onClick={(e) => e.stopPropagation()}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                      bgcolor: 'background.paper'
                    }
                  }}
                />
              </Grid>

              {/* Time Selection */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  Select Time
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <TimeSelector
                      label="Start Time"
                      value={bookingDetails.startTime}
                      onChange={(value) => handleTimeChange('startTime', value)}
                      error={!!timeError}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TimeSelector
                      label="End Time"
                      value={bookingDetails.endTime}
                      onChange={(value) => handleTimeChange('endTime', value)}
                      error={!!timeError}
                      isEndTime={true}
                      startTime={bookingDetails.startTime}
                    />
                  </Grid>
                </Grid>
                {timeError && (
                  <Alert severity="error" sx={{ mt: 0.5, borderRadius: 1 }}>
                    {timeError}
                  </Alert>
                )}
              </Grid>

              {/* Price Summary */}
              {selectedSpace && bookingDetails.startTime && bookingDetails.endTime && !timeError && (
                <Grid item xs={12}>
                  <Box sx={{ 
                    p: 1.5, 
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Price Summary
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Duration:</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" align="right">
                          {formatDuration(calculateDuration(
                            bookingDetails.startTime,
                            bookingDetails.endTime,
                            bookingDetails.date
                          ))}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Rate:</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" align="right">₹{selectedSpace.price}/hour</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Divider sx={{ my: 0.5 }} />
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Total Cost:</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" align="right" color="primary" sx={{ fontWeight: 'bold' }}>
                          ₹{calculateTotalCost()}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              )}

              {/* Terms and Conditions */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Checkbox
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    color="primary"
                  />
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    I agree to the Terms and Conditions
                  </Typography>
                  <Button
                    variant="text"
                    color="primary"
                    size="small"
                    startIcon={<Description />}
                    onClick={() => setTermsDialogOpen(true)}
                    sx={{ 
                      p: 0, 
                      minWidth: 'auto',
                      '& .MuiButton-startIcon': {
                        marginRight: 0,
                        marginLeft: 0.5
                      }
                    }}
                  >
                    View
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ 
            p: 1.5, 
            borderTop: '1px solid',
            borderColor: 'divider',
            gap: 1
          }}>
            <Button 
              onClick={() => setOpenBookingDialog(false)}
              variant="outlined"
              sx={{ 
                borderRadius: 1,
                textTransform: 'none',
                minWidth: '100px',
                py: 0.5
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmBooking}
              variant="contained" 
              color="primary" 
              disabled={!bookingDetails.date || !bookingDetails.startTime || !bookingDetails.endTime || !bookingDetails.vehicleNumber || !termsAccepted || isBookingLoading}
              startIcon={isBookingLoading ? <CircularProgress size={20} color="inherit" /> : null}
              sx={{ 
                borderRadius: 1,
                textTransform: 'none',
                minWidth: '100px',
                py: 0.5,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                '&:hover': {
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                }
              }}
            >
              {isBookingLoading ? 'Processing...' : 'Book Now'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Cancel Booking Dialog */}
        <Dialog
          open={cancelDialogOpen}
          onClose={handleCancelClose}
          PaperProps={{
            sx: {
              borderRadius: 2,
              minWidth: '400px'
            }
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: 'error.light',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Error sx={{ fontSize: 24 }} />
            Cancel Booking
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Are you sure you want to cancel this booking?
            </Typography>
            {bookingToCancel && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Booking Details
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LocalParking sx={{ color: 'primary.main' }} />
                    <Typography>
                      {bookingToCancel.parkingSpace?.name || 'Unknown Parking Space'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LocationOn sx={{ color: 'text.secondary' }} />
                    <Typography color="text.secondary">
                      {bookingToCancel.parkingSpace?.address || 'Address not available'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <AccessTime sx={{ color: 'text.secondary' }} />
                    <Typography color="text.secondary">
                      {new Date(bookingToCancel.startTime).toLocaleDateString()} • {new Date(bookingToCancel.startTime).toLocaleTimeString()} - {new Date(bookingToCancel.endTime).toLocaleTimeString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Payment sx={{ color: 'text.secondary' }} />
                    <Typography color="text.secondary">
                      Total: ₹{bookingToCancel.totalPrice.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
                <Alert severity="warning" sx={{ mt: 2 }}>
                  This action cannot be undone. The parking spot will be made available for other users.
                </Alert>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button 
              onClick={handleCancelClose}
              variant="outlined"
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                minWidth: '120px'
              }}
            >
              Keep Booking
            </Button>
            <Button 
              onClick={handleCancelConfirm} 
              color="error"
              variant="contained"
              startIcon={<Cancel />}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                minWidth: '120px'
              }}
            >
              Cancel Booking
            </Button>
          </DialogActions>
        </Dialog>

        {/* Booking Success Dialog */}
        <Dialog
          open={bookingSuccessDialogOpen}
          onClose={() => setBookingSuccessDialogOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: 2,
              minWidth: '400px',
              overflow: 'hidden'
            }
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: 'success.light',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            py: 2
          }}>
            <CheckCircle sx={{ fontSize: 28 }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              Booking Successful!
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              mb: 2
            }}>
              <CheckCircle sx={{ 
                fontSize: 64, 
                color: 'success.main',
                mb: 2,
                animation: 'scaleIn 0.5s ease-out'
              }} />
              <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                Your booking has been confirmed
              </Typography>
              <Typography variant="body1" color="text.secondary">
                We've sent the details to your email
              </Typography>
            </Box>
            {newBooking && (
              <Box sx={{ 
                mt: 2,
                p: 2, 
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}>
                <Typography variant="subtitle1" sx={{ 
                  fontWeight: 'bold', 
                  mb: 2,
                  color: 'primary.main'
                }}>
                  Booking Details
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: 2
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalParking sx={{ color: 'primary.main' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Parking Space</Typography>
                      <Typography>{selectedSpace?.name || 'Unknown Parking Space'}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn sx={{ color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Address</Typography>
                      <Typography>{selectedSpace?.address || 'Address not available'}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTime sx={{ color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Time</Typography>
                      <Typography>
                        {new Date(newBooking.startTime).toLocaleDateString()} • {new Date(newBooking.startTime).toLocaleTimeString()} - {new Date(newBooking.endTime).toLocaleTimeString()}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Payment sx={{ color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Total Amount</Typography>
                      <Typography variant="h6" color="primary.main">
                        ₹{newBooking.totalPrice.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ 
            p: 2, 
            gap: 2,
            borderTop: '1px solid',
            borderColor: 'divider'
          }}>
            <Button 
              onClick={() => {
                setBookingSuccessDialogOpen(false);
                setActiveTab(1);
              }}
              variant="contained"
              color="primary"
              startIcon={<EventSeat />}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                minWidth: '160px',
                py: 1,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                '&:hover': {
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s'
              }}
            >
              View Bookings
            </Button>
            <Button 
              onClick={() => {
                setBookingSuccessDialogOpen(false);
                window.location.reload();
              }}
              variant="outlined"
              startIcon={<Map />}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                minWidth: '160px',
                py: 1,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s'
              }}
            >
              Continue Browsing
            </Button>
          </DialogActions>
        </Dialog>

        {/* Success Snackbar */}
        <Snackbar
          open={!!successMessage}
          autoHideDuration={6000}
          onClose={() => setSuccessMessage('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
            {successMessage}
          </Alert>
        </Snackbar>

        {/* Error Snackbar */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>

        {/* Go to Top Button */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mt: 4,
          mb: 2
        }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            startIcon={<KeyboardArrowUp />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
              py: 1,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Go to Top
          </Button>
        </Box>

        {/* Directions Popup */}
        <DirectionsPopup
          open={showDirections}
          onClose={() => setShowDirections(false)}
          parkingSpace={directionsSpace}
          userLocation={userLocation}
        />

        {/* Terms and Conditions Dialog */}
        <Dialog
          open={termsDialogOpen}
          onClose={() => setTermsDialogOpen(false)}
          fullScreen
          PaperProps={{
            sx: {
              borderRadius: 0,
              bgcolor: 'background.default'
            }
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: 'primary.main',
            color: 'white',
            py: 2,
            px: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 1
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Description sx={{ fontSize: 24 }} />
              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                Terms and Conditions
              </Typography>
            </Box>
            <IconButton
              onClick={() => setTermsDialogOpen(false)}
              sx={{ color: 'white' }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            <Box sx={{ 
              height: '100%',
              overflow: 'auto',
              p: 3,
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(0,0,0,0.1)',
                borderRadius: '3px',
                '&:hover': {
                  background: 'rgba(0,0,0,0.2)',
                }
              }
            }}>
              <Container maxWidth="md">
                <Typography variant="h4" sx={{ mb: 4, color: 'primary.main', fontWeight: 'bold' }}>
                  Parking Space Booking Terms and Conditions
                </Typography>
                
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: 'text.primary' }}>
                    1. Booking and Payment
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                    <Typography component="li" sx={{ mb: 1.5, fontSize: '1.1rem' }}>
                      All bookings are subject to availability and must be made through our official platform.
                    </Typography>
                    <Typography component="li" sx={{ mb: 1.5, fontSize: '1.1rem' }}>
                      Payment must be made in full at the time of booking confirmation.
                    </Typography>
                    <Typography component="li" sx={{ mb: 1.5, fontSize: '1.1rem' }}>
                      Prices are subject to change without notice, but confirmed bookings will be honored at the agreed rate.
                    </Typography>
                    <Typography component="li" sx={{ mb: 1.5, fontSize: '1.1rem' }}>
                      We accept all major credit/debit cards and digital payment methods.
                    </Typography>
                    <Typography component="li" sx={{ fontSize: '1.1rem' }}>
                      A booking confirmation email will be sent upon successful payment.
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: 'text.primary' }}>
                    2. Cancellation and Refund Policy
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                    <Typography component="li" sx={{ mb: 1.5, fontSize: '1.1rem' }}>
                      Cancellations made 24 hours or more before the booking time will receive a full refund.
                    </Typography>
                    <Typography component="li" sx={{ mb: 1.5, fontSize: '1.1rem' }}>
                      Cancellations made less than 24 hours before the booking time will not be eligible for a refund.
                    </Typography>
                    <Typography component="li" sx={{ mb: 1.5, fontSize: '1.1rem' }}>
                      No-shows will be charged the full booking amount.
                    </Typography>
                    <Typography component="li" sx={{ mb: 1.5, fontSize: '1.1rem' }}>
                      Refunds will be processed within 5-7 business days to the original payment method.
                    </Typography>
                    <Typography component="li" sx={{ fontSize: '1.1rem' }}>
                      In case of technical issues, please contact our support team for assistance.
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: 'text.primary' }}>
                    3. Vehicle and Parking Guidelines
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                    <Typography component="li" sx={{ mb: 1.5, fontSize: '1.1rem' }}>
                      The parking space must be used for the registered vehicle only.
                    </Typography>
                    <Typography component="li" sx={{ mb: 1.5, fontSize: '1.1rem' }}>
                      Vehicles must be parked within the designated space markings.
                    </Typography>
                    <Typography component="li" sx={{ mb: 1.5, fontSize: '1.1rem' }}>
                      Oversized vehicles may require special arrangements and additional fees.
                    </Typography>
                    <Typography component="li" sx={{ mb: 1.5, fontSize: '1.1rem' }}>
                      Please ensure your vehicle is properly locked and secured.
                    </Typography>
                    <Typography component="li" sx={{ fontSize: '1.1rem' }}>
                      Any damage to the parking facility must be reported immediately.
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: 'text.primary' }}>
                    4. Safety and Security
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                    <Typography component="li" sx={{ mb: 1.5, fontSize: '1.1rem' }}>
                      The parking space owner is not responsible for any loss or damage to vehicles or their contents.
                    </Typography>
                    <Typography component="li" sx={{ mb: 1.5, fontSize: '1.1rem' }}>
                      Users park at their own risk and should take appropriate security measures.
                    </Typography>
                    <Typography component="li" sx={{ mb: 1.5, fontSize: '1.1rem' }}>
                      CCTV surveillance may be in operation for security purposes.
                    </Typography>
                    <Typography component="li" sx={{ fontSize: '1.1rem' }}>
                      Please report any suspicious activity to the parking facility staff.
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: 'text.primary' }}>
                    5. General Terms
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                    <Typography component="li" sx={{ mb: 1.5, fontSize: '1.1rem' }}>
                      The parking space owner reserves the right to refuse service to any user.
                    </Typography>
                    <Typography component="li" sx={{ mb: 1.5, fontSize: '1.1rem' }}>
                      Users must comply with all posted parking rules and regulations.
                    </Typography>
                    <Typography component="li" sx={{ mb: 1.5, fontSize: '1.1rem' }}>
                      We reserve the right to modify these terms and conditions at any time.
                    </Typography>
                    <Typography component="li" sx={{ fontSize: '1.1rem' }}>
                      By booking a parking space, you agree to abide by these terms and conditions.
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ 
                  p: 3, 
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  mt: 4
                }}>
                  <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic', fontSize: '1.1rem' }}>
                    For any questions or concerns regarding these terms and conditions, please contact our customer support team.
                  </Typography>
                </Box>
              </Container>
            </Box>
          </DialogContent>
          <DialogActions sx={{ 
            p: 2, 
            borderTop: '1px solid',
            borderColor: 'divider',
            gap: 1,
            position: 'sticky',
            bottom: 0,
            bgcolor: 'background.default',
            zIndex: 1
          }}>
            <Button 
              onClick={() => setTermsDialogOpen(false)}
              variant="outlined"
              sx={{ 
                borderRadius: 1,
                textTransform: 'none',
                minWidth: '120px',
                py: 1
              }}
            >
              Close
            </Button>
            <Button 
              onClick={() => {
                setTermsAccepted(true);
                setTermsDialogOpen(false);
              }}
              variant="contained"
              color="primary"
              sx={{ 
                borderRadius: 1,
                textTransform: 'none',
                minWidth: '120px',
                py: 1
              }}
            >
              Accept Terms
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default UserDashboard; 
