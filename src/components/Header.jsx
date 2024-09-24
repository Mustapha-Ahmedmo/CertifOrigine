import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import cartIcon from '../assets/cart.jpg';
import profileIcon from '../assets/profile.jpg';
import mailIcon from '../assets/mail.jpg'; 
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
      <div className="icon-container">
        <img src={mailIcon} alt="Mail" className="mail-icon" />
        {mailNotificationCount > 0 && <span className="badge mail-badge">{mailNotificationCount}</span>}
      </div>
      <div className="icon-container">
        <img src={cartIcon} alt="Cart" className="cart-icon" />
        {cartItemCount > 0 && <span className="badge cart-badge">{cartItemCount}</span>}
      </div>
      <img src={profileIcon} alt="Profile" className="profile-icon" onClick={toggleDropdown} />
      {dropdownOpen && (
        <div className={`dropdown ${dropdownOpen ? 'show' : ''}`}>
          <Link to="/profile">{t('header.profile')}</Link>
          <Link to="/settings">{t('header.settings')}</Link>
          <Link to="/login">{t('header.logout')}</Link>
        </div>
      )}

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
    </header>
  );
};

export default Header;