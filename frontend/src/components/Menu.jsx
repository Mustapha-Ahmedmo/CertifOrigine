import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faClipboardList, faShoppingCart, faHistory, faUser, faBuilding, faUsers } from '@fortawesome/free-solid-svg-icons';
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

  return (
    <nav className="menu">
      <ul>
        <li 
          onMouseEnter={() => handleMouseEnter('dashboard')}
          onMouseLeave={() => handleMouseLeave('dashboard')}
        >
          <Link to="/dashboard" className={`menu-title ${openMenu.dashboard ? 'open' : ''}`}>
            <FontAwesomeIcon icon={faTachometerAlt} className="icon" /> Tableau de bord
          </Link>
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
                <Link to="/" className={activeLink === '1mois' ? 'active' : ''} onClick={() => handleLinkClick('pastOrders', '1mois')}>1 mois</Link>
              </li>
            </ul>
          )}
        </li>
        <li 
          onMouseEnter={() => handleMouseEnter('clients')}
          onMouseLeave={() => handleMouseLeave('clients')}
        >
          <span className={`menu-title ${openMenu.clients ? 'open' : ''}`}>
            <FontAwesomeIcon icon={faUsers} className="icon" /> Mes clients
          </span>
          {openMenu.clients && (
            <ul className="submenu">
              <li>
                <Link to="/clients/list" className={activeLink === 'listClients' ? 'active' : ''} onClick={() => handleLinkClick('clients', 'listClients')}>Liste des clients</Link>
              </li>
            </ul>
          )}
        </li>
        <li 
          onMouseEnter={() => handleMouseEnter('myCCI')}
          onMouseLeave={() => handleMouseLeave('myCCI')}
        >
          <span className={`menu-title ${openMenu.myCCI ? 'open' : ''}`}>
            <FontAwesomeIcon icon={faBuilding} className="icon" /> Ma CCI
          </span>
        </li>
      </ul>
    </nav>
  );
};

export default Menu;
