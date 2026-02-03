import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import './HeaderLayout.css';
import logo from '../assets/logo_vect2.png';

const HeaderLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);

  const location = useLocation();

  // Pages où on force le texte du menu en noir
  const darkTextPages = ['/login', '/faq', '/conditions', '/contact-us'];
  const forceDarkText = darkTextPages.includes(location.pathname);

  return (
    <div style={{ margin: 0, padding: 0 }}>
      <header
        className={`hl-page-header ${forceDarkText ? 'hl-dark-text' : ''}`}
        style={{
          width: '100%',
          margin: 0,
          padding: 0,
          position: 'fixed',
          top: 0,
          left: 0,
        }}
      >
        <nav className="hl-header-nav">
          {/* Section gauche : Logo */}
          <div className="hl-header-left">
            <button className="hl-hamburger-button" onClick={toggleMenu} type="button">
              ☰
            </button>
            <img src={logo} alt="Logo" className="hl-logo" />
          </div>

          {/* Section centrale : Liens de navigation */}
          <div className="hl-header-center">
            <ul className={`hl-nav-links ${menuOpen ? 'open' : ''}`}>
              <li>
                <a
                  href="/docs/guide_utilisateur.pdf"
                  download
                  onClick={() => setMenuOpen(false)}
                >
                  Guide d'utilisation
                </a>
              </li>

              <li>
                <Link to="/conditions" onClick={() => setMenuOpen(false)}>
                  Conditions de délivrance
                </Link>
              </li>
              <li>
                <Link to="/faq" onClick={() => setMenuOpen(false)}>
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Section droite : Contactez-nous */}
          <div className="hl-header-right">
            <Link to="/contact-us" className="hl-contact-button" onClick={() => setMenuOpen(false)}>
              Contactez-nous
            </Link>
          </div>
        </nav>
      </header>

      <main style={{ margin: 0, padding: 0, position: 'relative', zIndex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
};

export default HeaderLayout;
