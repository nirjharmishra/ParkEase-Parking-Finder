import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import { Dialog, DialogTitle, DialogContent, IconButton, Box, CircularProgress, Typography } from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const DirectionsPopup = ({ open, onClose, parkingSpace, userLocation }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const routingControlRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const initializeRouting = () => {
      if (!isMounted) return;

      try {
        // Validate required data
        if (!open || !userLocation || !parkingSpace || !parkingSpace.coordinates) {
          return;
        }

        setLoading(true);
        setError(null);

        // Ensure map is initialized
        if (!mapRef.current) {
          throw new Error('Map not initialized');
        }

        // Clean up existing routing control
        if (routingControlRef.current) {
          routingControlRef.current.remove();
          routingControlRef.current = null;
        }

        // Create waypoints
        const startPoint = L.latLng(userLocation[0], userLocation[1]);
        const endPoint = L.latLng(parkingSpace.coordinates.lat, parkingSpace.coordinates.lng);
        const waypoints = [startPoint, endPoint];

        // Create custom icons
        const parkingIcon = L.divIcon({
          className: 'custom-parking-icon',
          html: `
            <div style="
              position: relative;
              display: flex;
              flex-direction: column;
              align-items: center;
            ">
              <div style="
                position: absolute;
                top: -22px;
                background: white;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 9px;
                font-weight: 500;
                color: #1D2F6F;
                white-space: nowrap;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                text-transform: uppercase;
                letter-spacing: 0.3px;
                font-family: 'Inter', sans-serif;
                border: 1px solid rgba(29, 47, 111, 0.1);
              ">
                Destination
                <div style="
                  position: absolute;
                  bottom: -4px;
                  left: 50%;
                  transform: translateX(-50%);
                  width: 0;
                  height: 0;
                  border-left: 4px solid transparent;
                  border-right: 4px solid transparent;
                  border-top: 4px solid white;
                "></div>
              </div>
              <div style="
                background: #f44336;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
              ">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const currentLocationIcon = L.divIcon({
          className: 'custom-location-icon',
          html: `
            <div style="
              position: relative;
              display: flex;
              flex-direction: column;
              align-items: center;
            ">
              <div style="
                position: absolute;
                top: -22px;
                background: white;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 9px;
                font-weight: 500;
                color: #1D2F6F;
                white-space: nowrap;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                text-transform: uppercase;
                letter-spacing: 0.3px;
                font-family: 'Inter', sans-serif;
                border: 1px solid rgba(29, 47, 111, 0.1);
              ">
                Your Location
                <div style="
                  position: absolute;
                  bottom: -4px;
                  left: 50%;
                  transform: translateX(-50%);
                  width: 0;
                  height: 0;
                  border-left: 4px solid transparent;
                  border-right: 4px solid transparent;
                  border-top: 4px solid white;
                "></div>
              </div>
              <div style="
                background: #4CAF50;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
              ">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        // Create markers with custom icons
        const startMarker = L.marker(startPoint, {
          icon: currentLocationIcon,
          title: 'Your Current Location'
        });

        const endMarker = L.marker(endPoint, {
          icon: parkingIcon,
          title: 'Parking Space Destination'
        });

        // Initialize routing control with custom markers
        const routingControl = L.Routing.control({
          waypoints: waypoints,
          routeWhileDragging: false,
          show: true,
          addWaypoints: false,
          draggableWaypoints: false,
          fitSelectedRoutes: true,
          showAlternatives: false,
          createMarker: function(i, waypoint, n) {
            return i === 0 ? startMarker : endMarker;
          },
          router: L.Routing.osrmv1({
            serviceUrl: 'https://router.project-osrm.org/route/v1',
            timeout: 30000
          }),
          lineOptions: {
            styles: [
              {
                color: '#1D2F6F',
                opacity: 0.8,
                weight: 5,
                dashArray: '5, 10',
                lineCap: 'round',
                lineJoin: 'round'
              }
            ]
          },
          plan: L.Routing.plan(waypoints, {
            createMarker: function(i, waypoint, n) {
              return i === 0 ? startMarker : endMarker;
            },
            routeLine: function(route) {
              return L.polyline(route.coordinates, {
                color: '#1D2F6F',
                opacity: 0.8,
                weight: 5,
                dashArray: '5, 10',
                lineCap: 'round',
                lineJoin: 'round',
                className: 'route-line'
              });
            }
          })
        });

        // Add routing control to map
        routingControl.addTo(mapRef.current);
        routingControlRef.current = routingControl;

        // Handle route calculation
        routingControl.on('routesfound', (e) => {
          if (isMounted) {
            setLoading(false);
            const routes = e.routes;
            if (routes && routes.length > 0) {
              const route = routes[0];
              const time = Math.round(route.summary.totalTime / 60); // Convert to minutes
              const distance = Math.round(route.summary.totalDistance / 1000); // Convert to kilometers

              // Remove any existing info box
              const existingInfoBox = document.querySelector('.route-info-box');
              if (existingInfoBox) {
                existingInfoBox.remove();
              }

              // Create and add the info box
              const infoBox = L.control({ position: 'bottomleft' });
              infoBox.onAdd = function() {
                const div = L.DomUtil.create('div', 'route-info-box');
                div.innerHTML = `
                  <div style="
                    background: white;
                    padding: 8px 12px;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    font-family: 'Inter', sans-serif;
                    display: flex;
                    gap: 16px;
                    align-items: center;
                  ">
                    <div style="display: flex; align-items: center; gap: 4px;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#1D2F6F">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                      <span style="color: #1D2F6F; font-weight: 500;">${distance} km</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 4px;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#1D2F6F">
                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                        <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                      </svg>
                      <span style="color: #1D2F6F; font-weight: 500;">${time} min</span>
                    </div>
                    <div style="
                      margin-left: auto;
                      display: flex;
                      align-items: center;
                      gap: 4px;
                      cursor: pointer;
                      padding: 4px 8px;
                      border-radius: 4px;
                      transition: all 0.2s ease;
                    " onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${parkingSpace.coordinates.lat},${parkingSpace.coordinates.lng}', '_blank')">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#1D2F6F">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                      <span style="color: #1D2F6F; font-weight: 500; font-size: 0.8rem;">View on Google Maps</span>
                    </div>
                  </div>
                `;
                return div;
              };
              infoBox.addTo(mapRef.current);
            }
          }
        });

        routingControl.on('routingerror', (e) => {
          console.error('Routing error:', e);
          if (isMounted) {
            setError('Failed to calculate route. Please try again.');
            setLoading(false);
          }
        });

        // Add custom styles for the route line
        const style = document.createElement('style');
        style.textContent = `
          .route-line {
            filter: drop-shadow(0 0 2px rgba(29, 47, 111, 0.3));
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0% {
              opacity: 0.8;
            }
            50% {
              opacity: 0.6;
            }
            100% {
              opacity: 0.8;
            }
          }
          .leaflet-routing-container {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .leaflet-routing-container::-webkit-scrollbar {
            display: none;
          }
        `;
        document.head.appendChild(style);

      } catch (err) {
        console.error('Error initializing routing:', err);
        if (isMounted) {
          setError('Failed to load directions. Please try again.');
          setLoading(false);
        }
      }
    };

    // Initialize routing after a short delay to ensure map is ready
    const timer = setTimeout(initializeRouting, 100);

    // Cleanup function
    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (routingControlRef.current) {
        routingControlRef.current.remove();
        routingControlRef.current = null;
      }
    };
  }, [open, userLocation, parkingSpace]);

  const handleClose = () => {
    if (routingControlRef.current) {
      routingControlRef.current.remove();
      routingControlRef.current = null;
    }
    onClose();
  };

  if (!parkingSpace || !userLocation) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          height: '85vh',
          borderRadius: 3,
          overflow: 'hidden',
          border: 'none',
          boxShadow: '0 8px 32px rgba(29, 47, 111, 0.15)',
          position: 'relative',
          background: 'white',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 'inherit',
            padding: '1px',
            background: 'linear-gradient(135deg, #1D2F6F 0%, #8390FA 50%, #1D2F6F 100%)',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            pointerEvents: 'none'
          }
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        bgcolor: 'white',
        color: 'primary.main',
        py: 2,
        px: 3,
        borderBottom: '1px solid',
        borderColor: 'rgba(29, 47, 111, 0.1)',
        boxShadow: '0 2px 8px rgba(29, 47, 111, 0.08)',
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '40%',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #1D2F6F, transparent)'
        }
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          '& .MuiSvgIcon-root': {
            fontSize: '1.5rem',
            color: 'primary.main'
          }
        }}>
          <MyLocationIcon />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              Directions to {parkingSpace.name}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {parkingSpace.address}
            </Typography>
          </Box>
        </Box>
        <IconButton
          edge="end"
          color="primary"
          onClick={handleClose}
          aria-label="close"
          size="medium"
          sx={{
            backgroundColor: 'rgba(29, 47, 111, 0.1)',
            borderRadius: '8px',
            padding: '8px',
            '&:hover': {
              backgroundColor: 'rgba(29, 47, 111, 0.2)',
            },
            '& .MuiSvgIcon-root': {
              fontSize: '1.25rem',
              color: '#1D2F6F'
            }
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
          </svg>
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ 
        p: 0, 
        position: 'relative',
        height: 'calc(100% - 80px)'
      }}>
        {loading && (
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
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              zIndex: 1000,
              backdropFilter: 'blur(2px)'
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress size={40} thickness={4} />
              <Typography variant="body1" sx={{ mt: 2, color: 'primary.main' }}>
                Calculating route...
              </Typography>
            </Box>
          </Box>
        )}
        {error && (
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
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              zIndex: 1000,
              backdropFilter: 'blur(2px)',
              p: 3
            }}
          >
            <Box sx={{ 
              textAlign: 'center',
              maxWidth: '400px'
            }}>
              <Typography color="error" variant="h6" sx={{ mb: 2 }}>
                Unable to calculate route
              </Typography>
              <Typography color="text.secondary">
                {error}
              </Typography>
            </Box>
          </Box>
        )}
        <MapContainer
          ref={mapRef}
          center={userLocation}
          zoom={13}
          style={{ 
            height: '100%', 
            width: '100%'
          }}
          whenCreated={(map) => {
            mapRef.current = map;
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
        </MapContainer>
      </DialogContent>
    </Dialog>
  );
};

export default DirectionsPopup; 