import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './ParkingMap.css';
import { Button, IconButton, Paper, Box, Snackbar, Alert, Typography, Chip } from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import MapIcon from '@mui/icons-material/Map';
import SatelliteIcon from '@mui/icons-material/Satellite';
import TerrainIcon from '@mui/icons-material/Terrain';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LayersIcon from '@mui/icons-material/Layers';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import LocalParking from '@mui/icons-material/LocalParking';
import DirectionsPopup from './DirectionsPopup';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for user's location
const userIcon = new L.DivIcon({
  className: 'custom-user-icon',
  html: `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      animation: pulse 2s infinite;
      z-index: 1000;
    ">
      <svg 
        viewBox="0 0 24 24" 
        style="
          width: 42px;
          height: 42px;
          fill: #D32F2F;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        "
      >
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
      <style>
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      </style>
    </div>
  `,
  iconSize: [42, 42],
  iconAnchor: [21, 21],
  popupAnchor: [0, -21]
});

// Custom icon for parking spaces
const parkingIcon = new L.DivIcon({
  className: 'custom-parking-icon',
  html: `
    <div style="
      background: linear-gradient(135deg, #1D2F6F 0%, #3A4F8C 100%);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      border: 2px solid white;
      position: relative;
    ">
      <svg 
        viewBox="0 0 24 24" 
        style="
          width: 24px;
          height: 24px;
          fill: white;
          filter: drop-shadow(0 2px 2px rgba(0,0,0,0.2));
        "
      >
        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.08 3.11H5.77L6.85 7zM19 17H5v-5h14v5z"/>
        <circle cx="7.5" cy="14.5" r="1.5"/>
        <circle cx="16.5" cy="14.5" r="1.5"/>
      </svg>
      <div style="
        position: absolute;
        bottom: -2px;
        right: -2px;
        width: 12px;
        height: 12px;
        background: #4CAF50;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      "></div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20]
});

// Component to handle map updates
const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center && map) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);

  return null;
};

// Component to handle tile layer updates
const TileLayerUpdater = ({ mapMode }) => {
  const map = useMap();
  const tileLayerRef = useRef(null);
  
  useEffect(() => {
    if (!map) return;

    try {
      // Remove existing tile layer if it exists
      if (tileLayerRef.current) {
        map.removeLayer(tileLayerRef.current);
      }

      // Create new tile layer based on mode
      let tileUrl, attribution;
      switch (mapMode) {
        case 'dark':
          tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
          attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
          break;
        case 'terrain':
          tileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
          attribution = '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors';
          break;
        case 'satellite':
          tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
          attribution = '&copy; <a href="https://www.esri.com/">Esri</a>';
          break;
        case 'hybrid':
          tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
          attribution = '&copy; <a href="https://www.esri.com/">Esri</a>';
          break;
        default: // roadmap
          tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
          attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
      }

      const newTileLayer = L.tileLayer(tileUrl, { attribution });
      newTileLayer.addTo(map);
      tileLayerRef.current = newTileLayer;

      // Add labels layer for hybrid mode
      if (mapMode === 'hybrid') {
        const labelsLayer = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
          { attribution: '&copy; <a href="https://www.esri.com/">Esri</a>' }
        );
        labelsLayer.addTo(map);
      }
    } catch (error) {
      console.error('Error updating tile layer:', error);
    }
  }, [mapMode, map]);

  return null;
};

const ParkingSpacePopup = ({ space, onBookNow, userLocation }) => {
  const [showDirections, setShowDirections] = useState(false);

  return (
    <div style={{ minWidth: '180px', padding: '8px' }}>
      <h3 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 'bold' }}>{space.name}</h3>
      <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666' }}>{space.address}</p>
      <p style={{ margin: '0 0 4px 0', fontSize: '12px' }}>Price: ${space.price}/hour</p>
      <p style={{ margin: '0 0 4px 0', fontSize: '12px' }}>Available Spots: {space.availableSpots}</p>
      {userLocation && (
        <p style={{ margin: '0 0 8px 0', fontSize: '12px' }}>
          Distance: {calculateDistance(
            userLocation[0],
            userLocation[1],
            space.coordinates.lat,
            space.coordinates.lng
          ).toFixed(1)} km
        </p>
      )}
      
      <Box sx={{ display: 'flex', gap: '4px', marginTop: '8px', alignItems: 'center' }}>
        {space.isAvailable && space.availableSpots > 0 && (
          <Button 
            variant="contained" 
            color="primary"
            size="small"
            fullWidth
            onClick={() => onBookNow(space)}
            sx={{ 
              padding: '4px 8px',
              fontSize: '12px',
              minHeight: '28px'
            }}
          >
            Book Now
          </Button>
        )}
        {userLocation && (
          <IconButton
            size="small"
            onClick={() => setShowDirections(true)}
            sx={{ 
              padding: '4px',
              color: '#1a237e',
              backgroundColor: 'rgba(26, 35, 126, 0.08)',
              '&:hover': {
                backgroundColor: 'rgba(26, 35, 126, 0.12)'
              }
            }}
          >
            <MyLocationIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <DirectionsPopup
        open={showDirections}
        onClose={() => setShowDirections(false)}
        parkingSpace={space}
        userLocation={userLocation}
      />
    </div>
  );
};

const ParkingSpotsSummary = ({ parkingSpaces }) => {
  const totalParkings = parkingSpaces.length;
  const availableParkings = parkingSpaces.filter(space => space.isAvailable).length;
  const occupiedParkings = totalParkings - availableParkings;

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        zIndex: 1000,
        backgroundColor: 'background.paper',
        borderRadius: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LocalParkingIcon color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          Parking Locations:
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Chip
          label={`Total: ${totalParkings}`}
          color="default"
          variant="outlined"
        />
        <Chip
          label={`Available: ${availableParkings}`}
          color="success"
          variant={availableParkings > 0 ? "filled" : "outlined"}
        />
        <Chip
          label={`Occupied: ${occupiedParkings}`}
          color="error"
          variant={occupiedParkings > 0 ? "filled" : "outlined"}
        />
      </Box>
    </Paper>
  );
};

const ParkingMap = ({ parkingSpaces, onMarkerClick, mapRef }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [mapMode, setMapMode] = useState('roadmap');
  const [mapInstance, setMapInstance] = useState(null);
  const [error, setError] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [initialLocationSet, setInitialLocationSet] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [showLocationLoader, setShowLocationLoader] = useState(true);
  const defaultCenter = [51.505, -0.09]; // Default center (London)
  const defaultZoom = 13;

  // Show loader for 3 seconds after component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLocationLoader(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Get initial location on component mount
  useEffect(() => {
    const getInitialLocation = async () => {
      try {
        setIsLocating(true);
        const location = await getCurrentLocation();
        setUserLocation(location);
        if (mapInstance && !initialLocationSet) {
          mapInstance.setView(location, 15);
          setInitialLocationSet(true);
        }
      } catch (error) {
        console.error('Error getting initial location:', error);
        setError('Failed to get your location. Please make sure location services are enabled.');
      } finally {
        setIsLocating(false);
      }
    };

    getInitialLocation();
  }, [mapInstance, initialLocationSet]);

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve([latitude, longitude]);
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  };

  const handleLocationClick = async () => {
    try {
      setIsLocating(true);
      setShowLocationLoader(true);
      setError(null);

      // Get current location
      const location = await getCurrentLocation();
      setUserLocation(location);

      // Center map on location
      if (mapInstance && isMapReady) {
        mapInstance.setView(location, 15);
      } else {
        // If map is not ready, wait for it to be ready
        const checkMapReady = setInterval(() => {
          if (mapInstance && isMapReady) {
            mapInstance.setView(location, 15);
            clearInterval(checkMapReady);
          }
        }, 100);

        // Clear interval after 5 seconds if map is still not ready
        setTimeout(() => {
          clearInterval(checkMapReady);
        }, 5000);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setError('Failed to get your location. Please make sure location services are enabled.');
    } finally {
      // Keep the loader visible for at least 2 seconds
      setTimeout(() => {
        setIsLocating(false);
        setShowLocationLoader(false);
      }, 2000);
    }
  };

  const handleMapCreated = (map) => {
    try {
      setMapInstance(map);
      if (mapRef) {
        mapRef.current = map;
      }
      // If we already have user location, center the map
      if (userLocation && !initialLocationSet) {
        map.setView(userLocation, 15);
        setInitialLocationSet(true);
      }
      setIsMapReady(true);
    } catch (error) {
      console.error('Error initializing map:', error);
      setError('Failed to initialize map. Please refresh the page.');
    }
  };

  const handleMapModeChange = (mode) => {
    try {
      setMapMode(mode);
    } catch (error) {
      console.error('Error changing map mode:', error);
      setError('Failed to change map mode. Please try again.');
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  // Calculate initial center based on parking spaces and user location
  const calculateInitialCenter = () => {
    if (userLocation) return userLocation;
    if (parkingSpaces.length === 0) return defaultCenter;
    
    const lats = parkingSpaces.map(space => space.coordinates.lat);
    const lngs = parkingSpaces.map(space => space.coordinates.lng);
    
    return [
      (Math.min(...lats) + Math.max(...lats)) / 2,
      (Math.min(...lngs) + Math.max(...lngs)) / 2
    ];
  };

  // Calculate bounds for all markers including user location
  const calculateBounds = () => {
    const points = [...parkingSpaces.map(space => [space.coordinates.lat, space.coordinates.lng])];
    if (userLocation) {
      points.push(userLocation);
    }
    
    if (points.length === 0) return null;
    
    const lats = points.map(point => point[0]);
    const lngs = points.map(point => point[1]);
    
    return [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)]
    ];
  };

  const handleBookNow = (space) => {
    onMarkerClick(space);
  };

  return (
    <div style={{ 
      height: '600px', 
      width: '100%', 
      position: 'relative',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
      border: '1px solid',
      borderColor: 'divider',
      background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
    }}>
      {/* Choose Parking Spots Display */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'white',
          color: 'primary.main',
          py: 0.5,
          px: 2,
          borderRadius: '0 0 8px 8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid',
          borderColor: 'divider',
          borderTop: 'none'
        }}
      >
        <LocalParking sx={{ mr: 1, fontSize: '1.2rem', color: 'primary.main' }} />
        <Typography 
          variant="subtitle1" 
          sx={{ 
            fontWeight: 'bold',
            fontSize: '0.9rem',
            color: 'primary.main'
          }}
        >
          Book Your Spots Now
        </Typography>
      </Box>

      <MapContainer
        center={calculateInitialCenter()}
        zoom={defaultZoom}
        style={{ 
          height: '100%', 
          width: '100%',
          borderRadius: '16px'
        }}
        bounds={calculateBounds()}
        boundsOptions={{ padding: [50, 50] }}
        whenCreated={handleMapCreated}
        ref={mapRef}
      >
        <MapUpdater center={userLocation} zoom={defaultZoom} />
        <TileLayerUpdater mapMode={mapMode} />
        
        {/* Render parking space markers */}
        {parkingSpaces.map((space) => (
          <Marker
            key={space._id}
            position={[space.coordinates.lat, space.coordinates.lng]}
            icon={parkingIcon}
            zIndexOffset={0}
          >
            <Popup>
              <ParkingSpacePopup 
                space={space} 
                onBookNow={handleBookNow}
                userLocation={userLocation}
              />
            </Popup>
          </Marker>
        ))}

        {/* Render user location marker last to ensure it's on top */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={userIcon}
            zIndexOffset={1000}
          >
            <Popup>
              <div style={{ 
                textAlign: 'center',
                padding: '8px',
                fontWeight: 'bold',
                color: '#D32F2F'
              }}>
                You are currently here
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Location Loading Overlay */}
      {showLocationLoader && (
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
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 1000,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <CircularProgress size={40} />
            <Typography variant="body1">Fetching your location...</Typography>
          </Paper>
        </Box>
      )}

      <ParkingSpotsSummary parkingSpaces={parkingSpaces} />

      <MapControls 
        onLocationClick={handleLocationClick}
        onMapModeChange={handleMapModeChange}
        currentMapMode={mapMode}
        isLocating={isLocating}
      />
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </div>
  );
};

// Helper function to convert degrees to radians
const deg2rad = (deg) => {
  return deg * (Math.PI/180);
};

// Helper function to calculate real-world distance between two points in kilometers using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; // Distance in kilometers
};

// MapControls component for current location and map mode buttons
const MapControls = ({ onLocationClick, onMapModeChange, currentMapMode, isLocating }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMapModeClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMapModeClose = () => {
    setAnchorEl(null);
  };

  const handleModeSelect = (mode) => {
    onMapModeChange(mode);
    handleMapModeClose();
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}
    >
      {/* Current Location Button */}
      <Paper
        elevation={3}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <IconButton
          onClick={onLocationClick}
          disabled={isLocating}
          sx={{
            bgcolor: 'background.paper',
            '&:hover': { bgcolor: 'action.hover' },
            '&.Mui-disabled': {
              color: 'text.disabled'
            }
          }}
        >
          <MyLocationIcon />
        </IconButton>
      </Paper>

      {/* Map Mode Button with Menu */}
      <Paper
        elevation={3}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <IconButton
          onClick={handleMapModeClick}
          sx={{
            bgcolor: 'background.paper',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <LayersIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMapModeClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              mt: 1.5,
              ml: 0.5,
              minWidth: 180,
            }
          }}
        >
          <MenuItem onClick={() => handleModeSelect('roadmap')} selected={currentMapMode === 'roadmap'}>
            <ListItemIcon>
              <MapIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Roadmap</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleModeSelect('satellite')} selected={currentMapMode === 'satellite'}>
            <ListItemIcon>
              <SatelliteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Satellite</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleModeSelect('hybrid')} selected={currentMapMode === 'hybrid'}>
            <ListItemIcon>
              <LayersIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Hybrid</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleModeSelect('terrain')} selected={currentMapMode === 'terrain'}>
            <ListItemIcon>
              <TerrainIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Terrain</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleModeSelect('dark')} selected={currentMapMode === 'dark'}>
            <ListItemIcon>
              <DarkModeIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Dark Mode</ListItemText>
          </MenuItem>
        </Menu>
      </Paper>
    </Box>
  );
};

export default ParkingMap; 