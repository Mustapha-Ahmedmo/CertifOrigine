import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faClipboardList,
  faFileInvoiceDollar,
  faHistory,
  faCog,
  faBuilding,
  faShoppingCart,
  faDownload,
  faUsers,
  faUserTie,
  faHandshake,
  faFileContract,
  faMoneyBillWave,
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
          <Link to="/home" className={`menu-title ${activeLink === 'home' ? 'active' : ''}`} data-main-title onClick={() => handleLinkClick('home', 'home')}>
            <FontAwesomeIcon icon={faHome} className="icon" /> Accueil
          </Link>
        </li>

        {/* Commandes & Factures */}
        <li>
          <span className={`menu-title ${openMenu.orders ? 'open' : ''}`} data-main-title onClick={() => toggleMenu('orders')}>
            <FontAwesomeIcon icon={faClipboardList} className="icon" /> Commandes & Factures
          </span>
          {openMenu.orders && (
            <ul className="submenu">
              <li>
                <span className={`menu-title ${openMenu.currentOrders ? 'open' : ''}`} onClick={() => toggleMenu('currentOrders')}>
                  <FontAwesomeIcon icon={faShoppingCart} className="icon" /> Commandes en cours
                </span>
              </li>
              <li>
                <span className={`menu-title ${openMenu.searchOrders ? 'open' : ''}`} onClick={() => toggleMenu('searchOrders')}>
                  <FontAwesomeIcon icon={faClipboardList} className="icon" /> Recherches de commande
                </span>
              </li>
              <li>
                <span className={`menu-title ${openMenu.orderHistory ? 'open' : ''}`} onClick={() => toggleMenu('orderHistory')}>
                  <FontAwesomeIcon icon={faHistory} className="icon" /> Historiques de commandes
                </span>
                {openMenu.orderHistory && (
                  <ul className="submenu">
                    <li>
                      <Link to="/orders/history/current-year" className={activeLink === 'historyCurrentYear' ? 'active' : ''} onClick={() => handleLinkClick('orderHistory', 'historyCurrentYear')}>
                        {currentYear}
                      </Link>
                    </li>
                    <li>
                      <Link to="/orders/history/previous-year" className={activeLink === 'historyPreviousYear' ? 'active' : ''} onClick={() => handleLinkClick('orderHistory', 'historyPreviousYear')}>
                        {previousYear}
                      </Link>
                    </li>
                    <li>
                      <Link to="/orders/history/before-previous-year" className={activeLink === 'historyBeforePreviousYear' ? 'active' : ''} onClick={() => handleLinkClick('orderHistory', 'historyBeforePreviousYear')}>
                        Avant {previousYear}
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
              <li>
                <span className={`menu-title ${openMenu.invoiceHistory ? 'open' : ''}`} onClick={() => toggleMenu('invoiceHistory')}>
                  <FontAwesomeIcon icon={faFileInvoiceDollar} className="icon" /> Historiques des factures
                </span>
                {openMenu.invoiceHistory && (
                  <ul className="submenu">
                    <li>
                      <Link to="/invoices/history/2024" className={activeLink === 'invoiceHistory2024' ? 'active' : ''} onClick={() => handleLinkClick('invoiceHistory', 'invoiceHistory2024')}>
                        2024
                      </Link>
                    </li>
                    <li>
                      <Link to="/invoices/history/2023" className={activeLink === 'invoiceHistory2023' ? 'active' : ''} onClick={() => handleLinkClick('invoiceHistory', 'invoiceHistory2023')}>
                        2023
                      </Link>
                    </li>
                    <li>
                      <Link to="/invoices/history/before-2023" className={activeLink === 'invoiceHistoryBefore2023' ? 'active' : ''} onClick={() => handleLinkClick('invoiceHistory', 'invoiceHistoryBefore2023')}>
                        Avant 2023
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
              <li>
                <span className={`menu-title ${openMenu.exportEntries ? 'open' : ''}`} onClick={() => toggleMenu('exportEntries')}>
                  <FontAwesomeIcon icon={faDownload} className="icon" /> Export des écritures
                </span>
              </li>
            </ul>
          )}
        </li>

        {/* Administration */}
        <li>
          <span className={`menu-title ${openMenu.administration ? 'open' : ''}`} data-main-title onClick={() => toggleMenu('administration')}>
            <FontAwesomeIcon icon={faCog} className="icon" /> Administration
          </span>
          {openMenu.administration && (
            <ul className="submenu">
              <li>
                <span className={`menu-title ${openMenu.clients ? 'open' : ''}`} onClick={() => toggleMenu('clients')}>
                  <FontAwesomeIcon icon={faUsers} className="icon" /> Clients
                </span>
              </li>
              <li>
                <span className={`menu-title ${openMenu.operators ? 'open' : ''}`} onClick={() => toggleMenu('operators')}>
                  <FontAwesomeIcon icon={faUserTie} className="icon" /> Opérateurs
                </span>
              </li>
              <li>
                <span className={`menu-title ${openMenu.services ? 'open' : ''}`} onClick={() => toggleMenu('services')}>
                  <FontAwesomeIcon icon={faHandshake} className="icon" /> Prestations de services
                </span>
              </li>
            </ul>
          )}
        </li>

        {/* Ma CCD */}
        <li>
          <span className={`menu-title ${openMenu.myCCD ? 'open' : ''}`} data-main-title onClick={() => toggleMenu('myCCD')}>
            <FontAwesomeIcon icon={faBuilding} className="icon" /> Ma CCD
          </span>
          {openMenu.myCCD && (
            <ul className="submenu">
              <li>
                <Link to="/my-ccd/cgv" className={activeLink === 'cgv' ? 'active' : ''} onClick={() => handleLinkClick('myCCD', 'cgv')}>
                  <FontAwesomeIcon icon={faFileContract} className="icon" /> Les C.G.V
                </Link>
              </li>
              <li>
                <Link to="/my-ccd/tarifs" className={activeLink === 'tarifs' ? 'active' : ''} onClick={() => handleLinkClick('myCCD', 'tarifs')}>
                  <FontAwesomeIcon icon={faMoneyBillWave} className="icon" /> Tarifs des prestations
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
