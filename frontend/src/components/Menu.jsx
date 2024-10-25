import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faClipboardList, faShoppingCart, faHistory, faUsers, faHome } from '@fortawesome/free-solid-svg-icons';
import './Menu.css';


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

  // Nouvelles fonctions pour gérer l'affichage du sous-menu sur le survol
  const handleMouseEnter = (menu) => {
    setOpenMenu((prevState) => ({
      ...prevState,
      [menu]: true,
    }));
  };

  const handleMouseLeave = (menu) => {
    setOpenMenu((prevState) => ({
      ...prevState,
      [menu]: false,
    }));
  };

  // Calcul des années
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  return (
    <nav className="menu">
      <ul>
        <li>
          <Link to="/dashboard" className={`menu-title`} onClick={() => handleLinkClick('home', 'home')}>
            <FontAwesomeIcon icon={faHome} className="icon" /> Accueil {/* Icône de maison */}
          </Link>
        </li>
        <li 
          onMouseEnter={() => handleMouseEnter('dashboard')}
          onMouseLeave={() => handleMouseLeave('dashboard')}
        >
          <span className={`menu-title ${openMenu.dashboard ? 'open' : ''}`}>
            <FontAwesomeIcon icon={faTachometerAlt} className="icon" /> Tableau de bord
          </span>
          {openMenu.dashboard && (
            <ul className="submenu">
              <li>
                <Link to="/dashboard/to-complete" className={activeLink === 'completer' ? 'active' : ''} onClick={() => handleLinkClick('dashboard', 'completer')}>Commandes à compléter</Link>
              </li>
              <li>
                <Link to="/dashboard/to-pay" className={activeLink === 'payer' ? 'active' : ''} onClick={() => handleLinkClick('dashboard', 'payer')}>Commandes à payer</Link>
              </li>
              <li>
                <Link to="/dashboard/returned-orders" className={activeLink === 'returned' ? 'active' : ''} onClick={() => handleLinkClick('dashboard', 'returned')}>Commandes retournées</Link>
              </li>
            </ul>
          )}
        </li>
        <li 
          onMouseEnter={() => handleMouseEnter('newOrder')}
          onMouseLeave={() => handleMouseLeave('newOrder')}
        >
          <span className={`menu-title ${openMenu.newOrder ? 'open' : ''}`}>
            <FontAwesomeIcon icon={faShoppingCart} className="icon" /> Nouvelle Commande
          </span>
          {openMenu.newOrder && (
            <ul className="submenu">
              <li>
                <Link to="/dashboard/create-order" className={activeLink === 'certificat' ? 'active' : ''} onClick={() => handleLinkClick('newOrder', 'certificat')}>Certificat d'origine</Link>
              </li>
              <li>
                <Link to="/dashboard/legalization" className={activeLink === 'legalisation' ? 'active' : ''} onClick={() => handleLinkClick('newOrder', 'legalisation')}>Légalisation de commande</Link>
              </li>
              <li>
                <Link to="/dashboard/commercial-invoice" className={activeLink === 'facture' ? 'active' : ''} onClick={() => handleLinkClick('newOrder', 'facture')}>Facture commerciale</Link>
              </li>
            </ul>
          )}
        </li>
        <li 
          onMouseEnter={() => handleMouseEnter('pastOrders')}
          onMouseLeave={() => handleMouseLeave('pastOrders')}
        >
          <span className={`menu-title ${openMenu.pastOrders ? 'open' : ''}`}>
            <FontAwesomeIcon icon={faHistory} className="icon" /> Mes commandes passées
          </span>
          {openMenu.pastOrders && (
            <ul className="submenu">
              <li>
                <Link to="/" className={activeLink === `${currentYear}` ? 'active' : ''} onClick={() => handleLinkClick('pastOrders', `${currentYear}`)}>{currentYear}</Link>
              </li>
              <li>
                <Link to="/" className={activeLink === `${previousYear}` ? 'active' : ''} onClick={() => handleLinkClick('pastOrders', `${previousYear}`)}>{previousYear}</Link>
              </li>
              <li>
                <Link to="/" className={activeLink === 'before-2023' ? 'active' : ''} onClick={() => handleLinkClick('pastOrders', 'before-2023')}>Avant {previousYear}</Link>
              </li>
            </ul>
          )}
        </li>
        <li 
          onMouseEnter={() => handleMouseEnter('clients')}
          onMouseLeave={() => handleMouseLeave('clients')}
        >
          <span className={`menu-title ${openMenu.clients ? 'open' : ''}`}>
            <FontAwesomeIcon icon={faUsers} className="icon" /> Mes destinataires
          </span>
          {openMenu.clients && (
            <ul className="submenu">
              <li>
                <Link to="/clients/list" className={activeLink === 'listClients' ? 'active' : ''} onClick={() => handleLinkClick('clients', 'listClients')}>Liste des destinataires</Link>
              </li>
            </ul>
          )}
        </li>
      </ul>
    </nav>
  );
};

export default Menu;
