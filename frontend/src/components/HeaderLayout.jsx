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
        className="hl-page-header"
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
        <nav className="hl-header-nav">
          {/* Section gauche : Logo */}
          <div className="hl-header-left">
            <button className="hl-hamburger-button" onClick={toggleMenu}>
              ☰
            </button>
            <img src={logo} alt="Logo" className="hl-logo" />
          </div>

          {/* Section centrale : Liens de navigation */}
          <div className="hl-header-center">
            <ul className={`hl-nav-links ${menuOpen ? 'open' : ''}`}>
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
          <div className="hl-header-right">
            <Link to="/contact-us" className="hl-contact-button">
              Contactez-nous
            </Link>
          </div>
        </nav>
      </header>

      <main style={{ margin: 0, padding: 0 }}>
        <Outlet />
      </main>
    </div>
  );
};

export default HeaderLayout;
