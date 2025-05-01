import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  IconButton,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Snackbar,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import AddParkingSpace from '../components/AddParkingSpace';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  AccessTime,
  DirectionsCar,
  Person,
  LocalParking,
  Cancel,
  Payment,
} from '@mui/icons-material';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// LocationMarker component for handling map clicks
const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position ? <Marker position={position} /> : null;
};

const ParkingSpaceCard = ({ space, onEdit, onDelete, onToggleActive }) => {
  const availabilityPercentage = (space.availableSpots / space.totalSpots) * 100;
  const getAvailabilityColor = (percentage) => {
    if (percentage >= 70) return 'success';
    if (percentage >= 30) return 'warning';
    return 'error';
  };

  return (
    <Card 
      sx={{ 
        mb: 2, 
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': { 
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
        },
        boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: 2,
        opacity: space.isActive ? 1 : 0.7
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            {space.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label={space.isAvailable ? 'Available' : 'Full'}
              color={space.isAvailable ? 'success' : 'error'}
              size="small"
              sx={{ 
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                border: '1px solid rgba(0,0,0,0.1)'
              }}
            />
            <Chip
              label={space.isActive ? 'Active' : 'Inactive'}
              color={space.isActive ? 'success' : 'error'}
              size="small"
              sx={{ 
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                border: '1px solid rgba(0,0,0,0.1)'
              }}
            />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationOnIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {space.address}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
            <Payment sx={{ color: '#1D2F6F', fontSize: 18 }} />
            <Typography variant="body2" color="text.secondary">
              ₹{space.price}/hour
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              Parking Spots
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {space.availableSpots}/{space.totalSpots} available
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={availabilityPercentage}
            color={getAvailabilityColor(availabilityPercentage)}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        {space.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {space.description}
          </Typography>
        )}
      </CardContent>
      <CardActions 
        sx={{ 
          justifyContent: 'flex-end', 
          p: 2, 
          pt: 0,
          borderTop: '1px solid rgba(0,0,0,0.08)'
        }}
      >
        <Tooltip title={space.isActive ? "Deactivate Parking Space" : "Activate Parking Space"}>
          <IconButton
            color={space.isActive ? "success" : "error"}
            onClick={() => onToggleActive(space)}
            sx={{ 
              mr: 1,
              '&:hover': {
                backgroundColor: space.isActive ? 'rgba(46, 125, 50, 0.08)' : 'rgba(211, 47, 47, 0.08)'
              }
            }}
          >
            <PowerSettingsNewIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit Parking Space">
          <IconButton
            color="primary"
            onClick={() => onEdit(space)}
            sx={{ 
              mr: 1,
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)'
              }
            }}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete Parking Space">
          <IconButton
            color="error"
            onClick={() => onDelete(space)}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(211, 47, 47, 0.08)'
              }
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

const OwnerDashboard = () => {
  const { userData } = useAuth();
  const [spaces, setSpaces] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [spaceToDelete, setSpaceToDelete] = useState(null);
  const [spaceToEdit, setSpaceToEdit] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [markerPosition, setMarkerPosition] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [toggleActiveDialogOpen, setToggleActiveDialogOpen] = useState(false);
  const [spaceToToggle, setSpaceToToggle] = useState(null);

  // Form state for editing
  const [editForm, setEditForm] = useState({
    name: '',
    address: '',
    price: '',
    description: '',
    coordinates: null,
    totalSpots: 1
  });

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/owner/parking-spaces', {
          headers: {
            'x-auth-token': token
          }
        });
        setSpaces(response.data);
      } catch (error) {
        console.error('Error fetching spaces:', error);
      }
    };

    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/owner/bookings', {
          headers: {
            'x-auth-token': token
          }
        });
        setBookings(response.data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    };

    fetchSpaces();
    fetchBookings();
  }, []);

  const handleDeleteClick = (space) => {
    setSpaceToDelete(space);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (space) => {
    setSpaceToEdit(space);
    setEditForm({
      name: space.name,
      address: space.address,
      price: space.price,
      description: space.description,
      coordinates: space.coordinates,
      totalSpots: space.totalSpots
    });
    setMarkerPosition(space.coordinates ? [space.coordinates.lat, space.coordinates.lng] : null);
    setEditDialogOpen(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const updatedData = {
        ...editForm,
        coordinates: markerPosition ? {
          lat: markerPosition.lat,
          lng: markerPosition.lng
        } : null
      };

      const response = await axios.put(
        `http://localhost:5000/api/owner/parking-spaces/${spaceToEdit._id}`,
        updatedData,
        {
          headers: {
            'x-auth-token': token
          }
        }
      );

      if (response.data) {
        setSpaces(spaces.map(space => 
          space._id === spaceToEdit._id ? response.data : space
        ));
        setSuccessMessage('Parking space updated successfully');
        setEditDialogOpen(false);
        setSpaceToEdit(null);
        setMarkerPosition(null);
      }
    } catch (error) {
      console.error('Error updating space:', error);
      if (error.response?.data?.msg?.includes('Cannot reduce total spots below')) {
        setError(error.response.data.msg);
      } else if (error.response?.data?.msg) {
        setError(error.response.data.msg);
      } else {
        setError('Error updating parking space. Please try again.');
      }
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`http://localhost:5000/api/owner/parking-spaces/${spaceToDelete._id}`, {
        headers: {
          'x-auth-token': token
        }
      });

      if (response.data.msg === 'Parking space deleted successfully') {
        setSpaces(spaces.filter((space) => space._id !== spaceToDelete._id));
        setSuccessMessage('Parking space deleted successfully');
        setDeleteDialogOpen(false);
        setSpaceToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting space:', error);
      if (error.response?.data?.msg === 'Cannot delete parking space with active bookings') {
        setError('Unable to delete parking space as there are active bookings. Please wait until all bookings are completed or cancelled.');
      } else {
        setError(error.response?.data?.msg || 'Error deleting parking space. Please try again.');
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSpaceToDelete(null);
  };

  const handleEditCancel = () => {
    setEditDialogOpen(false);
    setSpaceToEdit(null);
    setMarkerPosition(null);
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
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
        `http://localhost:5000/api/owner/bookings/${bookingToCancel._id}/cancel`,
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
        const spacesResponse = await axios.get('http://localhost:5000/api/owner/parking-spaces', {
          headers: {
            'x-auth-token': token
          }
        });
        setSpaces(spacesResponse.data);
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

  const handleToggleActive = async (space) => {
    setSpaceToToggle(space);
    setToggleActiveDialogOpen(true);
  };

  const handleToggleActiveConfirm = async () => {
    if (!spaceToToggle) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `http://localhost:5000/api/owner/parking-spaces/${spaceToToggle._id}/toggle-active`,
        {},
        {
          headers: {
            'x-auth-token': token
          }
        }
      );

      setSpaces(spaces.map(space => 
        space._id === spaceToToggle._id ? response.data.parkingSpace : space
      ));
      setSuccessMessage(response.data.msg);
    } catch (error) {
      console.error('Error toggling parking space active status:', error);
      setError(error.response?.data?.msg || 'Failed to toggle parking space status');
    } finally {
      setToggleActiveDialogOpen(false);
      setSpaceToToggle(null);
    }
  };

  const handleToggleActiveClose = () => {
    setToggleActiveDialogOpen(false);
    setSpaceToToggle(null);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome, {userData?.name}!
      </Typography>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {userData?.businessName}
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedTab} onChange={handleTabChange}>
          <Tab label="Parking Spaces" />
          <Tab label="Add New Space" />
          <Tab label="Bookings" />
        </Tabs>
      </Box>

      {selectedTab === 0 && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Your Parking Spaces
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {spaces.length} parking space{spaces.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {spaces.map((space) => (
              <Grid item xs={12} md={6} key={space._id}>
                <ParkingSpaceCard
                  space={space}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  onToggleActive={handleToggleActive}
                />
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {selectedTab === 1 && <AddParkingSpace />}

      {selectedTab === 2 && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Parking Space Bookings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
            </Typography>
          </Box>

          {bookings.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 8,
              bgcolor: 'background.paper',
              borderRadius: 2,
              border: '1px dashed',
              borderColor: 'divider'
            }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Bookings Yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No bookings have been made for your parking spaces yet
              </Typography>
            </Box>
          ) : (
            <Box>
              {/* Active Bookings */}
              {bookings.filter(b => b.status === 'confirmed').length > 0 ? (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: 'success.main' }}>
                    Active Bookings
                  </Typography>
                  <Grid container spacing={3}>
                    {bookings
                      .filter(b => b.status === 'confirmed')
                      .map((booking) => (
                        <Grid item xs={12} key={booking._id}>
                          <Card>
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <LocalParking sx={{ color: 'primary.main' }} />
                                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                                      {booking.parkingSpace.name}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                    <Typography variant="body2" color="text.secondary">
                                      {booking.parkingSpace.address}
                                    </Typography>
                                  </Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Chip
                                    label={booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                    color={
                                      booking.status === 'confirmed' ? 'success' :
                                      booking.status === 'cancelled' ? 'error' :
                                      booking.status === 'completed' ? 'info' : 'warning'
                                    }
                                    size="small"
                                  />
                                  {booking.status === 'confirmed' && (
                                    <IconButton 
                                      size="small" 
                                      color="error"
                                      onClick={() => handleCancelClick(booking)}
                                    >
                                      <Cancel />
                                    </IconButton>
                                  )}
                                </Box>
                              </Box>

                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <Person sx={{ color: 'text.secondary' }} />
                                    <Box>
                                      <Typography variant="body2" color="text.secondary">
                                        Booked By
                                      </Typography>
                                      <Typography variant="body1">
                                        {booking.user?.name || 'Unknown User'}
                                      </Typography>
                                      {booking.user?.email && (
                                        <Typography variant="body2" color="text.secondary">
                                          {booking.user.email}
                                        </Typography>
                                      )}
                                      {booking.user?.phone && (
                                        <Typography variant="body2" color="text.secondary">
                                          {booking.user.phone}
                                        </Typography>
                                      )}
                                    </Box>
                                  </Box>
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
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <LocalParking sx={{ color: 'text.secondary' }} />
                                    <Box>
                                      <Typography variant="body2" color="text.secondary">
                                        Parking Space Details
                                      </Typography>
                                      <Typography variant="body1">
                                        {booking.parkingSpace.availableSpots}/{booking.parkingSpace.totalSpots} spots available
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        ₹{booking.parkingSpace.price}/hour
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
              ) : (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 4,
                  mb: 4,
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  border: '1px dashed',
                  borderColor: 'divider'
                }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Active Bookings
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    There are currently no active bookings for your parking spaces
                  </Typography>
                </Box>
              )}

              {/* Other Bookings */}
              {bookings.filter(b => b.status !== 'confirmed').length > 0 && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
                    Other Bookings
                  </Typography>
                  <Grid container spacing={3}>
                    {bookings
                      .filter(b => b.status !== 'confirmed')
                      .map((booking) => (
                        <Grid item xs={12} key={booking._id}>
                          <Card>
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <LocalParking sx={{ color: 'primary.main' }} />
                                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                                      {booking.parkingSpace.name}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                    <Typography variant="body2" color="text.secondary">
                                      {booking.parkingSpace.address}
                                    </Typography>
                                  </Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Chip
                                    label={booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                    color={
                                      booking.status === 'confirmed' ? 'success' :
                                      booking.status === 'cancelled' ? 'error' :
                                      booking.status === 'completed' ? 'info' : 'warning'
                                    }
                                    size="small"
                                  />
                                  {booking.status === 'confirmed' && (
                                    <IconButton 
                                      size="small" 
                                      color="error"
                                      onClick={() => handleCancelClick(booking)}
                                    >
                                      <Cancel />
                                    </IconButton>
                                  )}
                                </Box>
                              </Box>

                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <Person sx={{ color: 'text.secondary' }} />
                                    <Box>
                                      <Typography variant="body2" color="text.secondary">
                                        Booked By
                                      </Typography>
                                      <Typography variant="body1">
                                        {booking.user?.name || 'Unknown User'}
                                      </Typography>
                                      {booking.user?.email && (
                                        <Typography variant="body2" color="text.secondary">
                                          {booking.user.email}
                                        </Typography>
                                      )}
                                      {booking.user?.phone && (
                                        <Typography variant="body2" color="text.secondary">
                                          {booking.user.phone}
                                        </Typography>
                                      )}
                                    </Box>
                                  </Box>
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
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <LocalParking sx={{ color: 'text.secondary' }} />
                                    <Box>
                                      <Typography variant="body2" color="text.secondary">
                                        Parking Space Details
                                      </Typography>
                                      <Typography variant="body1">
                                        {booking.parkingSpace.availableSpots}/{booking.parkingSpace.totalSpots} spots available
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        ₹{booking.parkingSpace.price}/hour
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
        </Paper>
      )}

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Parking Space</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this parking space? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleEditCancel}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Parking Space</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={editForm.name}
                onChange={handleEditFormChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={editForm.address}
                onChange={handleEditFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price per hour"
                name="price"
                type="number"
                value={editForm.price}
                onChange={handleEditFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total Spots"
                name="totalSpots"
                type="number"
                value={editForm.totalSpots}
                onChange={handleEditFormChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                multiline
                rows={4}
                value={editForm.description}
                onChange={handleEditFormChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Location
              </Typography>
              <Box sx={{ height: 300, width: '100%' }}>
                <MapContainer
                  center={markerPosition || [51.505, -0.09]}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <LocationMarker 
                    position={markerPosition} 
                    setPosition={setMarkerPosition} 
                  />
                </MapContainer>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditCancel}>Cancel</Button>
          <Button onClick={handleEditSubmit} color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Booking Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={handleCancelClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to cancel this booking?
          </Typography>
          {bookingToCancel && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Booking Details
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LocalParking sx={{ color: 'primary.main' }} />
                <Typography>{bookingToCancel.parkingSpace.name}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LocationOnIcon sx={{ color: 'text.secondary' }} />
                <Typography color="text.secondary">
                  {bookingToCancel.parkingSpace.address}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTime sx={{ color: 'text.secondary' }} />
                <Typography color="text.secondary">
                  {new Date(bookingToCancel.startTime).toLocaleString()} - {new Date(bookingToCancel.endTime).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelClose}>No, Keep Booking</Button>
          <Button onClick={handleCancelConfirm} color="error" variant="contained">
            Yes, Cancel Booking
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toggle Active Dialog */}
      <Dialog
        open={toggleActiveDialogOpen}
        onClose={handleToggleActiveClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {spaceToToggle?.isActive ? 'Deactivate Parking Space' : 'Activate Parking Space'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to {spaceToToggle?.isActive ? 'deactivate' : 'activate'} this parking space?
          </Typography>
          {spaceToToggle && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Parking Space Details
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LocalParking sx={{ color: 'primary.main' }} />
                <Typography>{spaceToToggle.name}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LocationOnIcon sx={{ color: 'text.secondary' }} />
                <Typography color="text.secondary">
                  {spaceToToggle.address}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleToggleActiveClose}>Cancel</Button>
          <Button 
            onClick={handleToggleActiveConfirm} 
            color={spaceToToggle?.isActive ? "error" : "success"}
          >
            {spaceToToggle?.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </DialogActions>
      </Dialog>

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

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default OwnerDashboard; 