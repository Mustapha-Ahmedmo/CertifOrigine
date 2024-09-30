import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faClipboardList, faShoppingCart, faHistory, faUser, faBuilding, faUsers, faFileInvoiceDollar } from '@fortawesome/free-solid-svg-icons'; // Importation des nouvelles icônes
import './Menu.css';

const Menu = () => {
  const currentYear = new Date().getFullYear();
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

  return (
    <nav className="menu">
      <ul>
        <li onClick={() => toggleMenu('dashboard')}>
          <span className={`menu-title ${openMenu.dashboard ? 'open' : ''}`}>
            <FontAwesomeIcon icon={faTachometerAlt} className="icon" /> Tableau de bord <span className="arrow">▼</span>
          </span>
          {openMenu.dashboard && (
            <ul className="submenu">
              <li>
                <Link
                  to="/dashboard/to-complete"
                  className={activeLink === 'completer' ? 'active' : ''}
                  onClick={() => handleLinkClick('dashboard', 'completer')}
                >
                  Commandes à compléter
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard/to-pay"
                  className={activeLink === 'payer' ? 'active' : ''}
                  onClick={() => handleLinkClick('dashboard', 'payer')}
                >
                  Commandes à payer
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard/returned-orders"
                  className={activeLink === 'retourne' ? 'active' : ''}
                  onClick={() => handleLinkClick('dashboard', 'retourne')}
                >
                  Commandes retournées
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard/completed-orders-this-year"
                  className={activeLink === 'completedThisYear' ? 'active' : ''}
                  onClick={() => handleLinkClick('dashboard', 'completedThisYear')}
                >
                  Commandes complétées cette année
                </Link>
              </li>
            </ul>
          )}
        </li>

        <hr />

        <li onClick={() => toggleMenu('newOrder')}>
          <span className={`menu-title ${openMenu.newOrder ? 'open' : ''}`}>
            <FontAwesomeIcon icon={faShoppingCart} className="icon" /> Nouvelle Commande <span className="arrow">▼</span>
          </span>
          {openMenu.newOrder && (
            <ul className="submenu">
              <li><Link to="/dashboard/create-order" className={activeLink === 'certificat' ? 'active' : ''} onClick={() => handleLinkClick('newOrder', 'certificat')}>Certificat d'origine</Link></li>
              <li><Link to="/dashboard/create-order" className={activeLink === 'legalisation' ? 'active' : ''} onClick={() => handleLinkClick('newOrder', 'legalisation')}>Document de légalisation</Link></li>
            </ul>
          )}
        </li>

        <hr />

        <li onClick={() => toggleMenu('pastOrders')}>
          <span className={`menu-title ${openMenu.pastOrders ? 'open' : ''}`}>
            <FontAwesomeIcon icon={faHistory} className="icon" /> Mes commandes passées <span className="arrow">▼</span>
          </span>
          {openMenu.pastOrders && (
            <ul className="submenu">
              <li>
                <Link
                  to="/"
                  className={activeLink === '1mois' ? 'active' : ''}
                  onClick={() => handleLinkClick('pastOrders', '1mois')}
                >
                  1 mois
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className={activeLink === '3mois' ? 'active' : ''}
                  onClick={() => handleLinkClick('pastOrders', '3mois')}
                >
                  3 mois
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className={activeLink === '6mois' ? 'active' : ''}
                  onClick={() => handleLinkClick('pastOrders', '6mois')}
                >
                  6 mois
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className={activeLink === 'currentYear' ? 'active' : ''}
                  onClick={() => handleLinkClick('pastOrders', 'currentYear')}
                >
                  {currentYear}
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className={activeLink === 'lastYear' ? 'active' : ''}
                  onClick={() => handleLinkClick('pastOrders', 'lastYear')}
                >
                  {currentYear - 1}
                </Link>
              </li>
            </ul>
          )}
        </li>

        <hr />

        <li onClick={() => toggleMenu('clients')}>
          <span className={`menu-title ${openMenu.clients ? 'open' : ''}`}>
            <FontAwesomeIcon icon={faUsers} className="icon" /> Mes clients <span className="arrow">▼</span>
          </span>
          {openMenu.clients && (
            <ul className="submenu">
              <li>
                <Link
                  to="/clients/list"
                  className={activeLink === 'listClients' ? 'active' : ''}
                  onClick={() => handleLinkClick('clients', 'listClients')}
                >
                  Liste des clients
                </Link>
              </li>
            </ul>
          )}
        </li>

        <hr />  {/* Séparateur ajouté entre "Mes clients" et "Mes facturations" */}

        <li onClick={() => toggleMenu('facturations')}>
          <span className={`menu-title ${openMenu.facturations ? 'open' : ''}`}>
            <FontAwesomeIcon icon={faFileInvoiceDollar} className="icon" /> Mes facturations <span className="arrow">▼</span>
          </span>
          {openMenu.facturations && (
            <ul className="submenu">
              <li>
                <Link
                  to="/facturations/list"
                  className={activeLink === 'listFacturations' ? 'active' : ''}
                  onClick={() => handleLinkClick('facturations', 'listFacturations')}
                >
                  Liste des factures
                </Link>
              </li>
            </ul>
          )}
        </li>

        <hr />

        <li onClick={() => toggleMenu('myCCI')}>
          <span className={`menu-title ${openMenu.myCCI ? 'open' : ''}`}>
            <FontAwesomeIcon icon={faBuilding} className="icon" /> Ma CCI <span className="arrow">▼</span>
          </span>
        </li>

        <hr />
      </ul>
    </nav>
  );
};

export default Menu;
