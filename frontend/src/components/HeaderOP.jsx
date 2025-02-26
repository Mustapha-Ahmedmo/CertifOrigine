import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import Typography from '@mui/material/Typography';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faUser,
  faBars,
  faTimes,
  faUserPlus,
} from '@fortawesome/free-solid-svg-icons';

import logo from '../assets/logo.jpg';
import './HeaderOP.css';
import { getCustAccountInfo } from '../services/apiServices';

const HeaderOP = ({ toggleMenu, isMenuOpen }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mailNotificationCount] = useState(7);
  const [inscriptionNotificationCount, setInscriptionNotificationCount] = useState(1);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  useEffect(() => {
    const fetchInscriptionCount = async () => {
      try {
        const response = await getCustAccountInfo(null, 1, true);
        const pendingCount = response.data.filter((account) => account.statut_flag === 1).length;
        setInscriptionNotificationCount(pendingCount);
      } catch (err) {
        console.error('Failed to fetch inscription count:', err);
      }
    };

    window.addEventListener('updateInscriptionCount', fetchInscriptionCount);
    fetchInscriptionCount();

    return () => window.removeEventListener('updateInscriptionCount', fetchInscriptionCount);
  }, []);

  return (
    <header className="header">
      {/* Bouton de menu mobile */}
      <div
        className="mobile-menu-button"
        onClick={toggleMenu}
        aria-label="Toggle menu"
        role="button"
        tabIndex="0"
        onKeyDown={(e) => {
          if (e.key === 'Enter') toggleMenu();
        }}
      >
        <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} style={{ fontSize: '1rem' }} />
      </div>

      <Box className="logo-container">
        <img src={logo} alt="Chambre de Commerce de Djibouti" className="logo" />
      </Box>

      <Box className="header-right">
        {/* Notifications */}
        <Box
          className="header-icon-container"
          sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <Badge badgeContent={mailNotificationCount} color="error" anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
            <FontAwesomeIcon icon={faBell} style={{ fontSize: '1rem' }} />
          </Badge>
          <Typography variant="caption" className="icon-label">
            Notifications
          </Typography>
        </Box>

        {/* Inscriptions */}
        <Box
          className="header-icon-container"
          sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <Link to="/dashboard/operator/inscriptions" className="icon-link">
            <Badge badgeContent={inscriptionNotificationCount} color="error" anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
              <FontAwesomeIcon icon={faUserPlus} style={{ fontSize: '1rem' }} />
            </Badge>
            <Typography variant="caption" className="icon-label">
              Nouvelles inscriptions
            </Typography>
          </Link>
        </Box>

        {/* Profil */}
        <Box className="header-icon-container" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
          <Avatar 
            sx={{ width: 32, height: 32, backgroundColor: '#DDAF26' }}
            onClick={toggleDropdown}
          >
            <FontAwesomeIcon icon={faUser} style={{ color: 'white', fontSize: '1rem' }} />
          </Avatar>
          {dropdownOpen && (
            <Box
              className="dropdown"
              sx={{
                position: 'absolute',
                top: '100%',
                right: 0,
                backgroundColor: 'white',
                boxShadow: 3,
                p: 1,
                mt: 1,
                zIndex: 1000,
              }}
            >
              <Link to="/profile">Profil</Link>
              <Link to="/settings">Réglages</Link>
              <Link to="/login">Déconnexion</Link>
            </Box>
          )}
        </Box>
      </Box>
    </header>
  );
};

export default HeaderOP;
