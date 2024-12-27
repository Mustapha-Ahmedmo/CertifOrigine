// Menu.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTachometerAlt,
  faClipboardList,
  faShoppingCart,
  faHistory,
  faUsers,
  faHome,
  faCheckCircle,
  faDollarSign,
  faArrowCircleLeft,
  faCertificate,
  faGavel,
  faFileInvoice,
  faSignOutAlt, // Icone pour la déconnexion
} from '@fortawesome/free-solid-svg-icons';
import './Menu.css';
import '@fontsource/poppins'; // Import Poppins font
import { useDispatch } from 'react-redux';
import { logout } from '../slices/authSlice';

const Menu = ({ isMenuOpen, toggleMenu }) => {
  const [openSubmenus, setOpenSubmenus] = useState({});
  const [activeLink, setActiveLink] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const toggleSubMenu = (menu) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const handleLinkClick = (menu, link) => {
    setActiveLink(link);
    setOpenSubmenus((prev) => ({
      ...prev,
      [menu]: true,
    }));
    if (window.innerWidth <= 768) {
      toggleMenu(); // Close menu on mobile after link click
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  return (
    <nav className={`menu ${isMenuOpen ? 'menu-open' : ''}`}>
      <ul>
        {/* Accueil */}
        <li>
          <Link
            to="/dashboard"
            className={`menu-title main-title ${activeLink === 'home' ? 'active' : ''}`}
            onClick={() => handleLinkClick('home', 'home')}
          >
            <FontAwesomeIcon icon={faHome} className="icon" /> Accueil
          </Link>
        </li>

        {/* Tableau de bord */}
        <li>
          <span
            className={`menu-title main-title ${openSubmenus.dashboard ? 'open' : ''}`}
            onClick={() => toggleSubMenu('dashboard')}
          >
            <FontAwesomeIcon icon={faTachometerAlt} className="icon" /> Tableau de bord
          </span>
          {openSubmenus.dashboard && (
            <ul className="submenu">
              <li>
                <Link
                  to="/dashboard/to-complete"
                  className={activeLink === 'completer' ? 'active' : ''}
                  onClick={() => handleLinkClick('dashboard', 'completer')}
                >
                  <FontAwesomeIcon icon={faCheckCircle} className="icon" /> Commandes à compléter
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard/to-pay"
                  className={activeLink === 'payer' ? 'active' : ''}
                  onClick={() => handleLinkClick('dashboard', 'payer')}
                >
                  <FontAwesomeIcon icon={faDollarSign} className="icon" /> Commandes à payer
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard/returned-orders"
                  className={activeLink === 'returned' ? 'active' : ''}
                  onClick={() => handleLinkClick('dashboard', 'returned')}
                >
                  <FontAwesomeIcon icon={faArrowCircleLeft} className="icon" /> Commandes retournées
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* Nouvelle Commande */}
        <li>
          <span
            className={`menu-title main-title ${openSubmenus.newOrder ? 'open' : ''}`}
            onClick={() => toggleSubMenu('newOrder')}
          >
            <FontAwesomeIcon icon={faShoppingCart} className="icon" /> Nouvelle Commande
          </span>
          {openSubmenus.newOrder && (
            <ul className="submenu">
              <li>
                <Link
                  to="/dashboard/create-order"
                  className={activeLink === 'certificat' ? 'active' : ''}
                  onClick={() => handleLinkClick('newOrder', 'certificat')}
                >
                  <FontAwesomeIcon icon={faCertificate} className="icon" /> Certificat d'origine
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard/legalization"
                  className={activeLink === 'legalisation' ? 'active' : ''}
                  onClick={() => handleLinkClick('newOrder', 'legalisation')}
                >
                  <FontAwesomeIcon icon={faGavel} className="icon" /> Légalisation de commande
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard/commercial-invoice"
                  className={activeLink === 'facture' ? 'active' : ''}
                  onClick={() => handleLinkClick('newOrder', 'facture')}
                >
                  <FontAwesomeIcon icon={faFileInvoice} className="icon" /> Facture commerciale
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* Mes commandes passées */}
        <li>
          <span
            className={`menu-title main-title ${openSubmenus.pastOrders ? 'open' : ''}`}
            onClick={() => toggleSubMenu('pastOrders')}
          >
            <FontAwesomeIcon icon={faHistory} className="icon" /> Mes commandes passées
          </span>
          {openSubmenus.pastOrders && (
            <ul className="submenu">
              <li>
                <Link
                  to="/"
                  className={activeLink === `${currentYear}` ? 'active' : ''}
                  onClick={() => handleLinkClick('pastOrders', `${currentYear}`)}
                >
                  <FontAwesomeIcon icon={faHistory} className="icon" /> {currentYear}
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className={activeLink === `${previousYear}` ? 'active' : ''}
                  onClick={() => handleLinkClick('pastOrders', `${previousYear}`)}
                >
                  <FontAwesomeIcon icon={faHistory} className="icon" /> {previousYear}
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className={activeLink === 'before-2023' ? 'active' : ''}
                  onClick={() => handleLinkClick('pastOrders', 'before-2023')}
                >
                  <FontAwesomeIcon icon={faHistory} className="icon" /> Avant {previousYear}
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* Mes destinataires */}
        <li>
          <span
            className={`menu-title main-title ${openSubmenus.clients ? 'open' : ''}`}
            onClick={() => toggleSubMenu('clients')}
          >
            <FontAwesomeIcon icon={faUsers} className="icon" /> Mes destinataires
          </span>
          {openSubmenus.clients && (
            <ul className="submenu">
              <li>
                <Link
                  to="/clients/list"
                  className={activeLink === 'listClients' ? 'active' : ''}
                  onClick={() => handleLinkClick('clients', 'listClients')}
                >
                  <FontAwesomeIcon icon={faUsers} className="icon" /> Liste des destinataires
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* Déconnexion */}
        <li>
          <button className="menu-title logout-button" onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} className="icon" /> Déconnexion
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Menu;
