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
            {/* Bouton hamburger */}
            <button
              className="hamburger-button"
              onClick={toggleMenu}
              style={{
                /* Tu peux enlever ce style si tu veux, 
                   la classe s’occupe déjà de l’affichage */
              }}
            >
              ☰
            </button>

            {/* Logo (sera masqué en mobile via CSS) */}
            <img
              src={logo}
              alt="Logo"
              className="logo"
              style={{
                height: '80px',
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
              className={`nav-links ${menuOpen ? 'open' : ''}`}
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                gap: '2rem',
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
                  Conditions de délivrance
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
              <li>
                <Link
                  to="/contact-us"
                  className="contact-button"
                  style={{
                    color: 'white',
                    textDecoration: 'none',
                  }}
                >
                  Contactez-nous
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </header>

      {/* Le contenu principal :
          on décale vers le bas pour pas être masqué par le header */}
      <main
        style={{
          margin: 0,
          padding: 0,
          marginTop: '100px', // Ajuste en fonction de la hauteur désirée
        }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default HeaderLayout;
