import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../slices/authSlice';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import Typography from '@mui/material/Typography';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
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
  const [inscriptionNotificationCount, setInscriptionNotificationCount] = useState(1);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = (e) => {
    e.preventDefault();
    dispatch(logout());
    setDropdownOpen(false);
    navigate('/login');
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
    <header className="headerop">
      {/* Bouton de menu mobile */}
      <div
        className="headerop__mobile-menu-button"
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

      <Box className="headerop__logo-container">
        <img src={logo} alt="Chambre de Commerce de Djibouti" className="headerop__logo" />
      </Box>

      <Box className="headerop__right">
        {/* Inscriptions */}
        <Box
          className="headerop__icon-container"
          sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <Link to="/operator/inscriptions" className="headerop__icon-link">
            <Badge
              badgeContent={inscriptionNotificationCount}
              color="error"
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <FontAwesomeIcon icon={faUserPlus} style={{ fontSize: '1rem' }} />
            </Badge>
            <Typography variant="caption" className="icon-label">
              Nouvelles inscriptions
            </Typography>
          </Link>
        </Box>

        {/* Profil */}
        <Box
          className="headerop__icon-container"
          sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}
        >
          <Avatar
            sx={{ width: 32, height: 32, backgroundColor: '#DDAF26' }}
            onClick={toggleDropdown}
          >
            <FontAwesomeIcon icon={faUser} style={{ color: 'white', fontSize: '1rem' }} />
          </Avatar>

          {dropdownOpen && (
            <Box
              className="headerop__dropdown"
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
              <Link to="/profile" onClick={() => setDropdownOpen(false)}>Profil</Link>
              <Link to="/settings" onClick={() => setDropdownOpen(false)}>Réglages</Link>

              {/* Déconnexion (même logique que MenuOP) */}
              <a href="/login" onClick={handleLogout} style={{ color: 'red' }}>
                Déconnexion
              </a>
            </Box>
          )}
        </Box>
      </Box>
    </header>
  );
};

export default HeaderOP;
