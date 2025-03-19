import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import './HeaderLayout.css';

import logo from '../assets/logo_vect.png';

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
        <nav
          className="header-nav"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1rem',
            boxSizing: 'border-box',
          }}
        >
          {/* Section gauche : Logo */}
          <div
            className="header-left"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <img
              src={logo}
              alt="Logo"
              style={{
                height: '250px',
                width: 'auto',
              }}
            />
          </div>

          {/* Section centrale : Liens de navigation */}
          <div
            className="header-center"
            style={{ flexGrow: 1, textAlign: 'center' }}
          >
            <ul
              style={{
                display: 'inline-flex',
                gap: '2rem',
                listStyle: 'none',
                margin: 0,
                padding: 0,
              }}
            >
              <li>
                <Link
                  to="/guide"
                  style={{ color: 'white', textDecoration: 'none' }}
                >
                  Guide d'utilisation
                </Link>
              </li>
              <li>
                <Link
                  to="/conditions"
                  style={{ color: 'white', textDecoration: 'none' }}
                >
                  Les conditions de délivrance de certificats d'origine
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  style={{ color: 'white', textDecoration: 'none' }}
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Section droite : Bouton "Contactez-nous" */}
          <div
            className="header-right"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <Link
              to="/contact-us"
              className="contact-button"
              style={{ color: 'white', textDecoration: 'none' }}
            >
              Contactez-nous
            </Link>
          </div>
        </nav>
      </header>

      {/* Le contenu principal s'affiche juste en dessous (aucun offset marginTop) */}
      <main style={{ margin: 0, padding: 0 }}>
        <Outlet />
      </main>
    </div>
  );
};

export default HeaderLayout;
