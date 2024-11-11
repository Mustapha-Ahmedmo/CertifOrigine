import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
} from '@fortawesome/free-solid-svg-icons';
import './Menu.css';
import '@fontsource/poppins'; // Cela importe la police Poppins

const Menu = () => {
  const [openMenu, setOpenMenu] = useState({});
  const [activeLink, setActiveLink] = useState('');

  const toggleMenu = (menu) => {
    setOpenMenu((prevState) => ({
      ...prevState,
      [menu]: !prevState[menu],
    }));
  };

  const handleLinkClick = (menu, link) => {
    setActiveLink(link);
    setOpenMenu((prevState) => ({
      ...prevState,
      [menu]: true, // Garde le menu ouvert
    }));
  };

  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  return (
    <nav className="menu">
      <ul>
        {/* Accueil */}
        <li>
          <Link to="/dashboard" className={`menu-title main-title ${activeLink === 'home' ? 'active' : ''}`} onClick={() => handleLinkClick('home', 'home')}>
            <FontAwesomeIcon icon={faHome} className="icon" /> Accueil
          </Link>
        </li>

        {/* Tableau de bord */}
        <li>
          <span className={`menu-title main-title ${openMenu.dashboard ? 'open' : ''}`} onClick={() => toggleMenu('dashboard')}>
            <FontAwesomeIcon icon={faTachometerAlt} className="icon" /> Tableau de bord
          </span>
          {openMenu.dashboard && (
            <ul className="submenu">
              <li>
                <Link to="/dashboard/to-complete" className={activeLink === 'completer' ? 'active' : ''} onClick={() => handleLinkClick('dashboard', 'completer')}>
                  <FontAwesomeIcon icon={faCheckCircle} className="icon" /> Commandes à compléter
                </Link>
              </li>
              <li>
                <Link to="/dashboard/to-pay" className={activeLink === 'payer' ? 'active' : ''} onClick={() => handleLinkClick('dashboard', 'payer')}>
                  <FontAwesomeIcon icon={faDollarSign} className="icon" /> Commandes à payer
                </Link>
              </li>
              <li>
                <Link to="/dashboard/returned-orders" className={activeLink === 'returned' ? 'active' : ''} onClick={() => handleLinkClick('dashboard', 'returned')}>
                  <FontAwesomeIcon icon={faArrowCircleLeft} className="icon" /> Commandes retournées
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* Nouvelle Commande */}
        <li>
          <span className={`menu-title main-title ${openMenu.newOrder ? 'open' : ''}`} onClick={() => toggleMenu('newOrder')}>
            <FontAwesomeIcon icon={faShoppingCart} className="icon" /> Nouvelle Commande
          </span>
          {openMenu.newOrder && (
            <ul className="submenu">
              <li>
                <Link to="/dashboard/create-order" className={activeLink === 'certificat' ? 'active' : ''} onClick={() => handleLinkClick('newOrder', 'certificat')}>
                  <FontAwesomeIcon icon={faCertificate} className="icon" /> Certificat d'origine
                </Link>
              </li>
              <li>
                <Link to="/dashboard/legalization" className={activeLink === 'legalisation' ? 'active' : ''} onClick={() => handleLinkClick('newOrder', 'legalisation')}>
                  <FontAwesomeIcon icon={faGavel} className="icon" /> Légalisation de commande
                </Link>
              </li>
              <li>
                <Link to="/dashboard/commercial-invoice" className={activeLink === 'facture' ? 'active' : ''} onClick={() => handleLinkClick('newOrder', 'facture')}>
                  <FontAwesomeIcon icon={faFileInvoice} className="icon" /> Facture commerciale
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* Mes commandes passées */}
        <li>
          <span className={`menu-title main-title ${openMenu.pastOrders ? 'open' : ''}`} onClick={() => toggleMenu('pastOrders')}>
            <FontAwesomeIcon icon={faHistory} className="icon" /> Mes commandes passées
          </span>
          {openMenu.pastOrders && (
            <ul className="submenu">
              <li>
                <Link to="/" className={activeLink === `${currentYear}` ? 'active' : ''} onClick={() => handleLinkClick('pastOrders', `${currentYear}`)}>
                  <FontAwesomeIcon icon={faHistory} className="icon" /> {currentYear}
                </Link>
              </li>
              <li>
                <Link to="/" className={activeLink === `${previousYear}` ? 'active' : ''} onClick={() => handleLinkClick('pastOrders', `${previousYear}`)}>
                  <FontAwesomeIcon icon={faHistory} className="icon" /> {previousYear}
                </Link>
              </li>
              <li>
                <Link to="/" className={activeLink === 'before-2023' ? 'active' : ''} onClick={() => handleLinkClick('pastOrders', 'before-2023')}>
                  <FontAwesomeIcon icon={faHistory} className="icon" /> Avant {previousYear}
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* Mes destinataires */}
        <li>
          <span className={`menu-title main-title ${openMenu.clients ? 'open' : ''}`} onClick={() => toggleMenu('clients')}>
            <FontAwesomeIcon icon={faUsers} className="icon" /> Mes destinataires
          </span>
          {openMenu.clients && (
            <ul className="submenu">
              <li>
                <Link to="/clients/list" className={activeLink === 'listClients' ? 'active' : ''} onClick={() => handleLinkClick('clients', 'listClients')}>
                  <FontAwesomeIcon icon={faUsers} className="icon" /> Liste des destinataires
                </Link>
              </li>
            </ul>
          )}
        </li>
      </ul>
    </nav>
  );
};

export default Menu;
