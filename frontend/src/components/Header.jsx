// Header.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Importation des composants MUI pour l'Avatar, le Switch, etc.
import Avatar from '@mui/material/Avatar';
import Switch from '@mui/material/Switch';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Badge from '@mui/material/Badge';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faShoppingCart,
  faBars,      // Icône hamburger
  faTimes,     // Icône de fermeture
  faUser,      // Icône de profil
} from '@fortawesome/free-solid-svg-icons';

import logo from '../assets/logo.jpg';
// La photo de profil est supprimée

import './Header.css';
import { useSelector } from 'react-redux';
import { getMemo } from '../services/apiServices';

const Header = ({ toggleMenu, isMenuOpen }) => {
  const { t, i18n } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [languageSwitch, setLanguageSwitch] = useState(i18n.language === 'fr');

  const [notificationsCount, setNotificationsCount] = useState(0);


  const user = useSelector((state) => state.auth.user);
  const idLogin = user?.id_login_user;
  const custAccountId = user?.id_cust_account;

  const cartItemCount = 3;

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLanguageChange = (event) => {
    const isFr = event.target.checked;
    setLanguageSwitch(isFr);
    i18n.changeLanguage(isFr ? 'fr' : 'en');
  };

  useEffect(() => {
    const fetchMemos = async () => {

      if (custAccountId) {

        const params = {
          p_isAck: 'false',               // unacknowledged memos
          p_id_cust_account: custAccountId, // customer account ID
          p_isopuser: 'false'             // for non-operator users
        };
        try {
          const result = await getMemo(params);
          if (result && result.data) {
            setNotificationsCount(result.data.length);
          }
        } catch (error) {
          console.error('Error fetching memos:', error);
        }
      }
    };
  
    fetchMemos();
  }, [custAccountId], []);

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
        <FontAwesomeIcon 
          icon={isMenuOpen ? faTimes : faBars} 
          style={{ fontSize: '1rem' }} 
        />
      </div>

      <div className="logo-container">
        <img src={logo} alt="Chambre de Commerce de Djibouti" className="logo" />
      </div>

      <div className="header-right">
        {/* Notifications */}
        <Box
          className="header-icon-container"
          sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <Badge 
            badgeContent={notificationsCount} 
            color="error"
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <FontAwesomeIcon icon={faBell} style={{ fontSize: '1rem' }} />
          </Badge>
          <Typography variant="caption" className="icon-label">
            Notifications
          </Typography>
        </Box>

        {/* Panier */}
        <Box
          className="header-icon-container"
          sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <Badge 
            badgeContent={cartItemCount} 
            color="error"
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <FontAwesomeIcon icon={faShoppingCart} style={{ fontSize: '1rem' }} />
          </Badge>
          <Typography variant="caption" className="icon-label">
            Panier
          </Typography>
        </Box>

        {/* Profil avec Avatar remplacé par une icône */}
        <Box
          className="header-icon-container"
          sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}
        >
          <Avatar
            className="header-avatar"
            onClick={toggleDropdown}
            sx={{ width: 32, height: 32, backgroundColor: '#DDAF26' }}
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
              <Link to="/profile">{t('header.profile')}</Link>
              <Link to="/settings">{t('header.settings')}</Link>
              <Link to="/login">{t('header.logout')}</Link>
            </Box>
          )}
        </Box>
      </div>
    </header>
  );
};

export default Header;
