import React, { useState, useEffect, useCallback } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { 
  AccountCircle, 
  Home, 
  ArrowDropDown, 
  Menu as MenuIcon,
  DirectionsCar,
  Person,
  Warning,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { userData, isAuthenticated, isOwner, isUser, logout, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  
  const [userAnchorEl, setUserAnchorEl] = useState(null);
  const [ownerAnchorEl, setOwnerAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [backDialogOpen, setBackDialogOpen] = useState(false);

  const handleUserMenu = (event) => {
    setUserAnchorEl(event.currentTarget);
  };

  const handleOwnerMenu = (event) => {
    setOwnerAnchorEl(event.currentTarget);
  };

  const handleProfileMenu = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setUserAnchorEl(null);
    setOwnerAnchorEl(null);
    setProfileAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = () => {
    try {
      if (logout()) {
        setLogoutDialogOpen(false);
        navigate('/');
      }
    } catch (error) {
      console.error('Logout confirmation error:', error);
      setLogoutDialogOpen(false);
    }
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  const handleHome = () => {
    if (isAuthenticated()) {
      navigate(getDashboardPath());
    } else {
      navigate('/');
    }
  };

  const handleBack = useCallback((e) => {
    if (isAuthenticated()) {
      e.preventDefault();
      setBackDialogOpen(true);
    } else {
      window.history.back();
    }
  }, [isAuthenticated]);

  const handleBackConfirm = () => {
    try {
      logout();
      setBackDialogOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Back navigation error:', error);
      setBackDialogOpen(false);
    }
  };

  const handleBackCancel = () => {
    setBackDialogOpen(false);
    window.history.pushState(null, '', window.location.href);
  };

  useEffect(() => {
    const isUserAuthenticated = isAuthenticated();
    if (isUserAuthenticated) {
      window.history.pushState(null, '', window.location.href);
      window.addEventListener('popstate', handleBack);
    }
    return () => {
      if (isUserAuthenticated) {
        window.removeEventListener('popstate', handleBack);
        setLogoutDialogOpen(false);
        setBackDialogOpen(false);
      }
    };
  }, [handleBack, isAuthenticated]);

  const renderLogoutDialog = () => (
    <Dialog
      open={logoutDialogOpen}
      onClose={handleLogoutCancel}
      PaperProps={{
        sx: {
          borderRadius: 2,
          minWidth: 300,
          maxWidth: '90%',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Warning color="warning" />
        Confirm Logout
      </DialogTitle>
      <DialogContent>
        Are you sure you want to logout?
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button 
          onClick={handleLogoutCancel} 
          color="primary"
          variant="outlined"
          sx={{ mr: 1 }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleLogoutConfirm} 
          color="error" 
          variant="contained"
          autoFocus
        >
          Logout
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderBackDialog = () => (
    <Dialog
      open={backDialogOpen}
      onClose={handleBackCancel}
      PaperProps={{
        sx: {
          borderRadius: 2,
          minWidth: 300,
          maxWidth: '90%',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Warning color="warning" />
        Leave Page?
      </DialogTitle>
      <DialogContent>
        Are you sure you want to leave? You will be logged out.
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button 
          onClick={handleBackCancel} 
          color="primary"
          variant="outlined"
          sx={{ mr: 1 }}
        >
          Stay
        </Button>
        <Button 
          onClick={handleBackConfirm} 
          color="error" 
          variant="contained"
          autoFocus
        >
          Leave
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderMobileMenu = () => (
    <Drawer
      anchor="right"
      open={mobileMenuOpen}
      onClose={() => setMobileMenuOpen(false)}
      PaperProps={{
        sx: {
          width: 280,
          background: 'linear-gradient(135deg, #1D2F6F 0%, #4A5A9A 100%)',
          color: 'white',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {userData?.profilePicture ? (
            <Avatar 
              src={userData.profilePicture} 
              alt={userData.name}
              sx={{
                width: 40,
                height: 40,
                border: '2px solid rgba(255, 255, 255, 0.5)',
                mr: 2,
              }}
            />
          ) : (
            <AccountCircle sx={{ fontSize: 40, mr: 2 }} />
          )}
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {userData?.name || userData?.email || 'Guest'}
            </Typography>
            {isAuthenticated() && (
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {isOwner() ? 'Owner' : isUser() ? 'User' : ''}
              </Typography>
            )}
          </Box>
        </Box>
        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', mb: 2 }} />
        <List>
          <ListItem 
            button 
            onClick={handleHome}
            sx={{
              borderRadius: 1,
              mb: 1,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <ListItemIcon>
              <Home sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary={isAuthenticated() ? (isOwner() ? 'Owner Dashboard' : 'User Dashboard') : 'Home'} />
          </ListItem>
          
          {!isAuthenticated() && (
            <>
              <ListItem 
                button 
                onClick={() => { setMobileMenuOpen(false); navigate('/user-login'); }}
                sx={{
                  borderRadius: 1,
                  mb: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <ListItemIcon>
                  <Person sx={{ color: 'white' }} />
                </ListItemIcon>
                <ListItemText primary="User Login" />
              </ListItem>
              <ListItem 
                button 
                onClick={() => { setMobileMenuOpen(false); navigate('/owner-login'); }}
                sx={{
                  borderRadius: 1,
                  mb: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <ListItemIcon>
                  <DirectionsCar sx={{ color: 'white' }} />
                </ListItemIcon>
                <ListItemText primary="Owner Login" />
              </ListItem>
            </>
          )}
          
          {isAuthenticated() && (
            <ListItem 
              button 
              onClick={handleLogout}
              sx={{
                borderRadius: 1,
                color: 'error.light',
                '&:hover': {
                  backgroundColor: 'rgba(211, 47, 47, 0.1)',
                },
              }}
            >
              <ListItemText primary="Logout" />
            </ListItem>
          )}
        </List>
      </Box>
    </Drawer>
  );

  const renderDesktopMenu = () => {
    if (isAuthenticated()) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Home />}
            onClick={handleHome}
            sx={{
              color: 'white',
              borderColor: 'rgba(255, 255, 255, 0.5)',
              cursor: 'default',
              '&:hover': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
                backgroundColor: 'transparent',
              },
            }}
          >
            {isOwner() ? 'Owner Dashboard' : 'User Dashboard'}
          </Button>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 1,
              borderRadius: 2,
              background: 'rgba(255, 255, 255, 0.1)',
              cursor: 'default',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>
              {userData?.name || userData?.email}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'white',
                background: 'rgba(255, 255, 255, 0.2)',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontWeight: 500,
                cursor: 'default',
              }}
            >
              {isOwner() ? 'Owner' : isUser() ? 'User' : ''}
            </Typography>
          </Box>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleProfileMenu}
            sx={{
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            {userData?.profilePicture ? (
              <Avatar 
                src={userData.profilePicture} 
                alt={userData.name}
                sx={{
                  width: 40,
                  height: 40,
                  border: '2px solid rgba(255, 255, 255, 0.5)',
                }}
              />
            ) : (
              <AccountCircle sx={{ fontSize: 40 }} />
            )}
          </IconButton>
          <Menu
            id="profile-menu"
            anchorEl={profileAnchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(profileAnchorEl)}
            onClose={handleClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                borderRadius: 2,
                minWidth: 200,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              },
            }}
          >
            <MenuItem 
              onClick={handleLogout}
              sx={{
                py: 1.5,
                color: 'error.main',
                '&:hover': {
                  backgroundColor: 'rgba(211, 47, 47, 0.05)',
                },
              }}
            >
              Logout
            </MenuItem>
          </Menu>
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<Home />}
          onClick={handleHome}
          sx={{
            color: 'white',
            borderColor: 'rgba(255, 255, 255, 0.5)',
            cursor: isAuthenticated() ? 'default' : 'pointer',
            '&:hover': {
              borderColor: 'rgba(255, 255, 255, 0.5)',
              backgroundColor: isAuthenticated() ? 'transparent' : 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          Home
        </Button>
        
        {/* User Menu */}
        <Button
          variant="contained"
          endIcon={<ArrowDropDown />}
          onClick={handleUserMenu}
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
            },
          }}
        >
          User
        </Button>
        <Menu
          id="user-menu"
          anchorEl={userAnchorEl}
          open={Boolean(userAnchorEl)}
          onClose={handleClose}
          PaperProps={{
            sx: {
              mt: 1.5,
              borderRadius: 2,
              minWidth: 200,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            },
          }}
        >
          <MenuItem 
            onClick={() => { handleClose(); navigate('/user-login'); }}
            sx={{
              py: 1.5,
              '&:hover': {
                backgroundColor: 'rgba(26, 47, 111, 0.05)',
              },
            }}
          >
            Sign In
          </MenuItem>
          <MenuItem 
            onClick={() => { handleClose(); navigate('/user-register'); }}
            sx={{
              py: 1.5,
              '&:hover': {
                backgroundColor: 'rgba(26, 47, 111, 0.05)',
              },
            }}
          >
            Register
          </MenuItem>
        </Menu>

        {/* Owner Menu */}
        <Button
          variant="contained"
          endIcon={<ArrowDropDown />}
          onClick={handleOwnerMenu}
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
            },
          }}
        >
          Parking Owner
        </Button>
        <Menu
          id="owner-menu"
          anchorEl={ownerAnchorEl}
          open={Boolean(ownerAnchorEl)}
          onClose={handleClose}
          PaperProps={{
            sx: {
              mt: 1.5,
              borderRadius: 2,
              minWidth: 200,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            },
          }}
        >
          <MenuItem 
            onClick={() => { handleClose(); navigate('/owner-login'); }}
            sx={{
              py: 1.5,
              '&:hover': {
                backgroundColor: 'rgba(26, 47, 111, 0.05)',
              },
            }}
          >
            Sign In
          </MenuItem>
          <MenuItem 
            onClick={() => { handleClose(); navigate('/owner-register'); }}
            sx={{
              py: 1.5,
              '&:hover': {
                backgroundColor: 'rgba(26, 47, 111, 0.05)',
              },
            }}
          >
            Register
          </MenuItem>
        </Menu>
      </Box>
    );
  };

  return (
    <>
      <AppBar 
        position="static" 
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #1D2F6F 0%, #4A5A9A 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 0,
          '& .MuiToolbar-root': {
            minHeight: 64,
            paddingLeft: 3,
            paddingRight: 3,
          },
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 800,
              letterSpacing: '1px',
              color: 'white',
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              textTransform: 'uppercase',
              '&:hover': {
                opacity: 0.9,
              },
              transition: 'opacity 0.2s ease',
            }}
          >
            ParkEase
          </Typography>
          {isMobile ? (
            <IconButton
              edge="end"
              color="inherit"
              onClick={() => setMobileMenuOpen(true)}
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            renderDesktopMenu()
          )}
        </Toolbar>
      </AppBar>
      {renderMobileMenu()}
      {renderLogoutDialog()}
      {renderBackDialog()}
    </>
  );
};

export default Navbar; 