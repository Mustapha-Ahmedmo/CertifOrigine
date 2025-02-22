// Header.jsx
import React, { useState } from 'react';
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
} from '@fortawesome/free-solid-svg-icons';

import logo from '../assets/logo.jpg';
// Pour modifier la photo de profil, changez le chemin ci-dessous :
import photo from '../assets/photo.jpeg';

import './Header.css';

const Header = ({ toggleMenu, isMenuOpen }) => {
  const { t, i18n } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [languageSwitch, setLanguageSwitch] = useState(i18n.language === 'fr');

  const cartItemCount = 3;
  const mailNotificationCount = 7;

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLanguageChange = (event) => {
    const isFr = event.target.checked;
    setLanguageSwitch(isFr);
    i18n.changeLanguage(isFr ? 'fr' : 'en');
  };

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
            badgeContent={mailNotificationCount} 
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

        {/* Profil avec Avatar */}
        <Box
          className="header-icon-container"
          sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}
        >
          {/* Pour modifier la photo de profil, changez le chemin dans l'import "photo" ou ici */}
          <Avatar
            alt="Profil"
            src={photo}
            className="header-avatar"
            onClick={toggleDropdown}
            sx={{ width: 32, height: 32 }}
          />
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
          {/* Le label "Profil" a été retiré */}
        </Box>

        {/* Sélecteur de langue avec Switch */}
        <Box
          className="language-container"
          sx={{ zIndex: 9999, ml: 2, display: 'flex', alignItems: 'center' }}
        >
          <Switch
            checked={languageSwitch}
            onChange={handleLanguageChange}
            inputProps={{ 'aria-label': 'language switch' }}
            size="small"
          />
          <Typography variant="caption" className="icon-label">
            {languageSwitch ? 'FR' : 'EN'}
          </Typography>
        </Box>
      </div>
    </header>
  );
};

export default Header;
