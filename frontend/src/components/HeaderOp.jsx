import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faShoppingCart, faUser } from '@fortawesome/free-solid-svg-icons'; // Icônes pour le header
import logo from '../assets/logo.jpg'; // Importer le logo
import { useTranslation } from 'react-i18next';
import './Header.css';

const Header = () => {
  const { t, i18n } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(3);
  const [mailNotificationCount, setMailNotificationCount] = useState(7);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const toggleLanguageDropdown = () => {
    setLanguageDropdownOpen(!languageDropdownOpen);
  };

  return (
    <header className="header">
      <div className="logo-container">
        <img src={logo} alt="Chambre de Commerce de Djibouti" className="logo" />
      </div>
      <div className="header-right">
        <div className="header-icon-container">
          <FontAwesomeIcon icon={faBell} className="header-icon" />
          {mailNotificationCount > 0 && <span className="badge mail-badge">{mailNotificationCount}</span>}
          <div className="icon-label">Notifications</div>
        </div>
        <div className="header-icon-container">
          <FontAwesomeIcon icon={faUser} className="header-icon" onClick={toggleDropdown} />
          {dropdownOpen && (
            <div className={`dropdown ${dropdownOpen ? 'show' : ''}`}>
              <Link to="/profile">{t('header.profile')}</Link>
              <Link to="/settings">{t('header.settings')}</Link>
              <Link to="/login">{t('header.logout')}</Link>
            </div>
          )}
          <div className="icon-label">Profil</div>
        </div>

        <div className="language-container">
          <button onClick={toggleLanguageDropdown} className="language-button">
            🌐 {i18n.language.toUpperCase()}
          </button>
          {languageDropdownOpen && (
            <div className="language-dropdown">
              <button onClick={() => changeLanguage('fr')}>Français</button>
              <button onClick={() => changeLanguage('en')}>English</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
