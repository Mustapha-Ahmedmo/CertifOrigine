import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faUser, faBars, faTimes, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import logo from '../assets/logo.jpg';
import { useTranslation } from 'react-i18next';
import './HeaderOP.css';
import { getCustAccountInfo } from '../services/apiServices';

const HeaderOP = ({ toggleMenu, isMenuOpen }) => {
  const { t, i18n } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mailNotificationCount] = useState(7);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [inscriptionNotificationCount, setInscriptionNotificationCount] = useState(1);

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const toggleLanguageDropdown = () => {
    setLanguageDropdownOpen(!languageDropdownOpen);
  };

  useEffect(() => {
    const fetchInscriptionCount = async () => {
      try {
        const response = await getCustAccountInfo(null, 1, true);
        const pendingCount = response.data.filter((account) => account.statut_flag === 1).length;
        console.log(pendingCount);
        setInscriptionNotificationCount(pendingCount);
      } catch (err) {
        console.error('Failed to fetch inscription count:', err);
      }
    };

    fetchInscriptionCount();
  }, []);

  return (
    <header className="header">
      {/* Bouton menu mobile */}
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
        <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
      </div>
      
      <div className="header-left">
        <div className="logo-container">
          <img src={logo} alt="Chambre de Commerce de Djibouti" className="logo" />
        </div>
      </div>

      <div className="header-right">
        <div className="header-icon-container">
          <FontAwesomeIcon icon={faBell} className="header-icon" />
          {mailNotificationCount > 0 && (
            <span className="badge mail-badge">{mailNotificationCount}</span>
          )}
          <div className="icon-label">Notifications</div>
        </div>

        {/* Nouveau bouton Inscriptions avec badge */}
        <div className="header-icon-container">
          <Link to="/dashboard/operator/inscriptions" className="icon-link">
            <FontAwesomeIcon icon={faUserPlus} className="header-icon" />
            {inscriptionNotificationCount > 0 && (
              <span className="badge inscription-badge">
                {inscriptionNotificationCount}
              </span>
            )}
            <div className="icon-label">Inscriptions</div>
          </Link>
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

export default HeaderOP;
