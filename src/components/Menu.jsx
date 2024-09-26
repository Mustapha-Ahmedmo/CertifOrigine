import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../slices/authSlice';
import logo from '../assets/logo.jpg';
import './Menu.css';

const Menu = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

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
      <img src={logo} alt="Logo" className="logo" />
      <ul>
        <li onClick={() => toggleMenu('dashboard')}>
          <span className={`menu-title ${openMenu.dashboard ? 'open' : ''}`}>
            Tableau de bord <span className="arrow">▼</span>
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
                  Commandes retourné
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard/completed-orders-this-year"
                  className={activeLink === 'completedThisYear' ? 'active' : ''}
                  onClick={() => handleLinkClick('dashboard', 'completedThisYear')}
                >
                  Commandes complété cette année
                </Link>
              </li>
            </ul>
          )}
        </li>

        <hr />

        <li onClick={() => toggleMenu('newOrder')}>
          <span className={`menu-title ${openMenu.newOrder ? 'open' : ''}`}>
            Nouvelle Commande <span className="arrow">▼</span>
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
            Mes commandes passées <span className="arrow">▼</span>
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

        <li onClick={() => toggleMenu('myInfo')}>
          <span className={`menu-title ${openMenu.myInfo ? 'open' : ''}`}>
            Mes Informations <span className="arrow">▼</span>
          </span>
          {openMenu.myInfo && (
            <ul className="submenu">
              <li>
                <Link
                  to="/"
                  className={activeLink === 'choix1' ? 'active' : ''}
                  onClick={() => handleLinkClick('myInfo', 'choix1')}
                >
                  Choix 1
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className={activeLink === 'choix2' ? 'active' : ''}
                  onClick={() => handleLinkClick('myInfo', 'choix2')}
                >
                  Choix 2
                </Link>
              </li>
            </ul>
          )}
        </li>

        <hr />

        <li onClick={() => toggleMenu('myCCI')}>
          <span className={`menu-title ${openMenu.myCCI ? 'open' : ''}`}>
            Ma CCI <span className="arrow">▼</span>
          </span>
        </li>

        <hr />
      </ul>
      <button onClick={handleLogout} className="logout-button">Se déconnecter</button>
    </nav>
  );
};

export default Menu;
