import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faClipboardList,
  faFileInvoiceDollar,
  faHistory,
  faCog,
  faBuilding,
  faShoppingCart,
  faSignOutAlt,
  faDownload,
  faUsers,
  faUserTie,
  faHandshake,
  faFileContract,
  faMoneyBillWave,
  faUserPlus,
} from '@fortawesome/free-solid-svg-icons';
import './Menu.css';
import '@fontsource/poppins';
import { useDispatch } from 'react-redux';
import { logout } from '../slices/authSlice';

const MenuOP = ({ isMenuOpen, toggleMenu }) => {
  const [openMenu, setOpenMenu] = useState({});
  const [activeLink, setActiveLink] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const toggleSubMenu = (menu) => {
    setOpenMenu((prevState) => ({
      ...prevState,
      [menu]: !prevState[menu],
    }));
  };

  const handleLinkClick = (menu, link) => {
    setActiveLink(link);
    setOpenMenu((prevState) => ({
      ...prevState,
      [menu]: true,
    }));
    // Ferme le menu sur mobile
    if (window.innerWidth <= 768) {
      toggleMenu();
    }
  };

  const handleLogout = () => {
    // Dispatch Redux logout action
    dispatch(logout());
    // Redirige l'utilisateur vers la page de connexion
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
            to="/dashboard/operator"
            className={`menu-title ${activeLink === 'home' ? 'active' : ''}`}
            data-main-title
            onClick={() => handleLinkClick('home', 'home')}
          >
            <FontAwesomeIcon icon={faHome} className="icon" /> Accueil
          </Link>
        </li>

        {/* Commandes & Factures */}
        <li>
          <span
            className={`menu-title ${openMenu.orders ? 'open' : ''}`}
            data-main-title
            onClick={() => toggleSubMenu('orders')}
          >
            <FontAwesomeIcon icon={faClipboardList} className="icon" /> Commandes & Factures
          </span>
          {openMenu.orders && (
            <ul className="submenu">
              <li>
                <span
                  className={`menu-title ${openMenu.currentOrders ? 'open' : ''}`}
                  onClick={() => toggleSubMenu('currentOrders')}
                >
                  <FontAwesomeIcon icon={faShoppingCart} className="icon" /> Commandes en cours
                </span>
              </li>
              <li>
                <span
                  className={`menu-title ${openMenu.searchOrders ? 'open' : ''}`}
                  onClick={() => toggleSubMenu('searchOrders')}
                >
                  <FontAwesomeIcon icon={faClipboardList} className="icon" /> Recherches de commande
                </span>
              </li>
              <li>
                <span
                  className={`menu-title ${openMenu.orderHistory ? 'open' : ''}`}
                  onClick={() => toggleSubMenu('orderHistory')}
                >
                  <FontAwesomeIcon icon={faHistory} className="icon" /> Historiques de commandes
                </span>
                {openMenu.orderHistory && (
                  <ul className="submenu">
                    <li>
                      <Link
                        to="/orders/history/current-year"
                        className={activeLink === 'historyCurrentYear' ? 'active' : ''}
                        onClick={() => handleLinkClick('orderHistory', 'historyCurrentYear')}
                      >
                        {currentYear}
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/orders/history/previous-year"
                        className={activeLink === 'historyPreviousYear' ? 'active' : ''}
                        onClick={() => handleLinkClick('orderHistory', 'historyPreviousYear')}
                      >
                        {previousYear}
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/orders/history/before-previous-year"
                        className={activeLink === 'historyBeforePreviousYear' ? 'active' : ''}
                        onClick={() => handleLinkClick('orderHistory', 'historyBeforePreviousYear')}
                      >
                        Avant {previousYear}
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
              <li>
                <span
                  className={`menu-title ${openMenu.invoiceHistory ? 'open' : ''}`}
                  onClick={() => toggleSubMenu('invoiceHistory')}
                >
                  <FontAwesomeIcon icon={faFileInvoiceDollar} className="icon" /> Historiques des factures
                </span>
                {openMenu.invoiceHistory && (
                  <ul className="submenu">
                    <li>
                      <Link
                        to="/invoices/history/2024"
                        className={activeLink === 'invoiceHistory2024' ? 'active' : ''}
                        onClick={() => handleLinkClick('invoiceHistory', 'invoiceHistory2024')}
                      >
                        2024
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/invoices/history/2023"
                        className={activeLink === 'invoiceHistory2023' ? 'active' : ''}
                        onClick={() => handleLinkClick('invoiceHistory', 'invoiceHistory2023')}
                      >
                        2023
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/invoices/history/before-2023"
                        className={activeLink === 'invoiceHistoryBefore2023' ? 'active' : ''}
                        onClick={() => handleLinkClick('invoiceHistory', 'invoiceHistoryBefore2023')}
                      >
                        Avant 2023
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
              <li>
                <span
                  className={`menu-title ${openMenu.exportEntries ? 'open' : ''}`}
                  onClick={() => toggleSubMenu('exportEntries')}
                >
                  <FontAwesomeIcon icon={faDownload} className="icon" /> Export des écritures
                </span>
              </li>
            </ul>
          )}
        </li>

        {/* Administration */}
        <li>
          <span
            className={`menu-title ${openMenu.administration ? 'open' : ''}`}
            data-main-title
            onClick={() => toggleSubMenu('administration')}
          >
            <FontAwesomeIcon icon={faCog} className="icon" /> Administration
          </span>
          {openMenu.administration && (
            <ul className="submenu">
              {/* Sous-menu "Clients" */}
              <li>
                <span
                  className={`menu-title ${openMenu.clients ? 'open' : ''}`}
                  onClick={() => toggleSubMenu('clients')}
                >
                  <FontAwesomeIcon icon={faUsers} className="icon" /> Clients
                </span>

                {openMenu.clients && (
                  <ul className="submenu">
                    <li>
                      <Link
                        to="/dashboard/operator/inscriptions"
                        className={activeLink === 'inscriptions' ? 'active' : ''}
                        onClick={() => handleLinkClick('clients', 'inscriptions')}
                      >
                        <FontAwesomeIcon icon={faUserPlus} className="icon" /> Nouvelles inscriptions
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/dashboard/operator/clientvalides"
                        className={activeLink === 'clientsvalides' ? 'active' : ''}
                        onClick={() => handleLinkClick('clients', 'clientsvalides')}
                      >
                        <FontAwesomeIcon icon={faUsers} className="icon" /> Clients validés
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              {/* Sous-menu "Opérateurs" */}
              <li>
                <span
                  className={`menu-title ${openMenu.operators ? 'open' : ''}`}
                  onClick={() => toggleSubMenu('operators')}
                >
                  <FontAwesomeIcon icon={faUserTie} className="icon" /> Opérateurs
                </span>
                {openMenu.operators && (
                  <ul className="submenu">
                    {/* Lien vers la nouvelle page OperatorsList */}
                    <li>
                      <Link
                        to="/dashboard/operator/operatorslist"
                        className={activeLink === 'operatorslist' ? 'active' : ''}
                        onClick={() => handleLinkClick('operators', 'operatorslist')}
                      >
                        <FontAwesomeIcon icon={faUsers} className="icon" /> Liste des opérateurs
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              <li>
                <span
                  className={`menu-title ${openMenu.services ? 'open' : ''}`}
                  onClick={() => toggleSubMenu('services')}
                >
                  <FontAwesomeIcon icon={faHandshake} className="icon" /> Prestations de services
                </span>
              </li>
            </ul>
          )}
        </li>

        {/* Ma CCD */}
        <li>
          <span
            className={`menu-title ${openMenu.myCCD ? 'open' : ''}`}
            data-main-title
            onClick={() => toggleSubMenu('myCCD')}
          >
            <FontAwesomeIcon icon={faBuilding} className="icon" /> Ma CCD
          </span>
          {openMenu.myCCD && (
            <ul className="submenu">
              <li>
                <Link
                  to="/my-ccd/cgv"
                  className={activeLink === 'cgv' ? 'active' : ''}
                  onClick={() => handleLinkClick('myCCD', 'cgv')}
                >
                  <FontAwesomeIcon icon={faFileContract} className="icon" /> Les C.G.V
                </Link>
              </li>
              <li>
                <Link
                  to="/my-ccd/tarifs"
                  className={activeLink === 'tarifs' ? 'active' : ''}
                  onClick={() => handleLinkClick('myCCD', 'tarifs')}
                >
                  <FontAwesomeIcon icon={faMoneyBillWave} className="icon" /> Tarifs des prestations
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* Bouton de déconnexion */}
        <li>
          <button
            className="menu-title logout-button"
            onClick={handleLogout}
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="icon" /> Se déconnecter
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default MenuOP;
