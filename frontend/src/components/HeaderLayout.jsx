import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import './HeaderLayout.css';

import logo from '../assets/logo_vect2.png';

const HeaderLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <div style={{ margin: 0, padding: 0 }}>
      <header
        className="page-header"
        style={{
          width: '100%',
          backgroundColor: 'transparent',
          margin: 0,
          padding: 0,
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 999,
        }}
      >
        <nav className="header-nav">
          {/* Section gauche : Logo */}
          <div className="header-left">
            <button className="hamburger-button" onClick={toggleMenu}>
              ☰
            </button>
            <img src={logo} alt="Logo" className="logo" />
          </div>

          {/* Section centrale : Liens de navigation */}
          <div className="header-center">
            <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
              <li>
                <Link to="/guide">Guide d'utilisation</Link>
              </li>
              <li>
                <Link to="/conditions">Conditions de délivrance</Link>
              </li>
              <li>
                <Link to="/faq">FAQ</Link>
              </li>
            </ul>
          </div>

          {/* Section droite : Contactez-nous */}
          <div className="header-right">
            <Link to="/contact-us" className="contact-button">
              Contactez-nous
            </Link>
          </div>
        </nav>
      </header>

      {/* Le contenu principal :
          on décale vers le bas pour pas être masqué par le header */}
      <main
        style={{
          margin: 0,
          padding: 0,
        
        }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default HeaderLayout;
