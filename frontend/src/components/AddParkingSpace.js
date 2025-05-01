import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import axios from 'axios';

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Add a component to handle map updates
const MapUpdater = ({ center, zoom, isInitialLoad }) => {
  const map = useMap();
  
  useEffect(() => {
    if (isInitialLoad && center && center[0] !== 0 && center[1] !== 0) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map, isInitialLoad]);

  return null;
};

const steps = ['Basic Information', 'Location', 'Review & Submit'];

const AddParkingSpace = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    price: '',
    description: '',
    totalSpots: 1
  });
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const mapRef = useRef(null);

  // Function to get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setUserLocation({ lat: 0, lng: 0 });
      setIsLocating(false);
      return;
    }

    const options = {
      enableHighAccuracy: true,
      maximumAge: 0
    };

    const success = (pos) => {
      const { latitude, longitude, accuracy } = pos.coords;
      console.log('Geolocation success:', { latitude, longitude, accuracy });
      
      setUserLocation({
        lat: latitude,
        lng: longitude,
        accuracy: accuracy
      });
      setIsLocating(false);
      setIsInitialLoad(true); // Reset initial load state
    };

    const error = (err) => {
      console.error('Geolocation error:', err);
      setError('Unable to get your location. Please try again or select a location manually.');
      setUserLocation({ lat: 0, lng: 0 });
      setIsLocating(false);
    };

    navigator.geolocation.getCurrentPosition(success, error, options);
  };

  // Get location when component mounts
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        setPosition(e.latlng);
        setIsInitialLoad(false);
      },
    });
    return null;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate basic information
      if (!formData.name || !formData.address || !formData.price || !formData.totalSpots) {
        setError('Please fill in all required fields');
        return;
      }
    } else if (activeStep === 1) {
      // Validate location
      if (!position) {
        setError('Please select a location on the map');
        return;
      }
    }
    setError('');
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to add a parking space');
        return;
      }

      const config = {
        headers: {
          'x-auth-token': token
        }
      };

      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      await axios.post(`${API_URL}/api/owner/parking-spaces`, {
        ...formData,
        coordinates: {
          lat: position.lat,
          lng: position.lng,
        },
      }, config);

      setSuccessMessage('Parking space added successfully!');
      
      // Reset form
      setFormData({
        name: '',
        address: '',
        price: '',
        description: '',
        totalSpots: 1
      });
      setPosition(null);
      setActiveStep(0);

      // Reload the page after 1 second
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (err) {
      console.error('Error adding parking space:', err);
      if (err.response) {
        if (err.response.status === 401) {
          setError('Please log in to add a parking space');
        } else if (err.response.status === 403) {
          setError('You do not have permission to add parking spaces');
        } else {
          setError(err.response.data?.msg || 'Error adding parking space');
        }
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Parking Space Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                variant="outlined"
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Price per hour"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Total Parking Spots"
                name="totalSpots"
                type="number"
                value={formData.totalSpots}
                onChange={handleChange}
                required
                variant="outlined"
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                multiline
                rows={4}
                value={formData.description}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">
                Click on the map to set the location
              </Typography>
              <Button
                variant="outlined"
                onClick={getCurrentLocation}
                startIcon={<MyLocationIcon />}
                disabled={isLocating}
              >
                {isLocating ? 'Getting Location...' : 'Center on My Location'}
              </Button>
            </Box>
            <Box sx={{ height: 400, width: '100%', borderRadius: 1, overflow: 'hidden', position: 'relative' }}>
              {isLocating && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    zIndex: 1000,
                  }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress />
                    <Typography variant="body1" sx={{ mt: 2 }}>
                      Getting your current location...
                    </Typography>
                  </Box>
                </Box>
              )}
              <MapContainer
                ref={mapRef}
                center={userLocation ? [userLocation.lat, userLocation.lng] : [0, 0]}
                zoom={userLocation ? 15 : 2}
                style={{ height: '100%', width: '100%' }}
              >
                <MapUpdater 
                  center={userLocation ? [userLocation.lat, userLocation.lng] : [0, 0]} 
                  zoom={userLocation ? 15 : 2}
                  isInitialLoad={isInitialLoad}
                />
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {userLocation && !position && (
                  <Marker 
                    position={[userLocation.lat, userLocation.lng]}
                    title="Your current location"
                  />
                )}
                {position && <Marker position={position} />}
                <MapClickHandler />
              </MapContainer>
            </Box>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Parking Space Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Basic Information
                  </Typography>
                  <Typography variant="body2">Name: {formData.name}</Typography>
                  <Typography variant="body2">Address: {formData.address}</Typography>
                  <Typography variant="body2">Price: ₹{formData.price}/hour</Typography>
                  <Typography variant="body2">Total Spots: {formData.totalSpots}</Typography>
                  {formData.description && (
                    <Typography variant="body2">Description: {formData.description}</Typography>
                  )}
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Location
                  </Typography>
                  {position ? (
                    <Typography variant="body2">
                      Coordinates: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="error">
                      No location selected
                    </Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        Add New Parking Space
      </Typography>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {renderStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ArrowBack />}
          >
            Back
          </Button>
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                Add Parking Space
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForward />}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={2000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSuccessMessage('')} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddParkingSpace; 