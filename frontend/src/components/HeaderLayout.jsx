import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import './HeaderLayout.css';

const HeaderLayout = () => {
  // État pour contrôler l’ouverture/fermeture du menu
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div>
      <header className="page-header">
        <nav className="header-nav">
          {/* Bloc gauche : hamburger + UL */}
          <div className="header-nav-left">
            <button className="hamburger-button" onClick={toggleMenu}>
              &#9776; {/* Icône hamburger (CSS) */}
            </button>

            {/* On applique la classe "open" si menuOpen === true */}
            <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
              <li>
                <Link to="/guide">Guide d'utilisation</Link>
              </li>
              <li>
                <Link to="/conditions">
                  Les conditions de délivrance des certificats
                </Link>
              </li>
              <li>
                <Link to="/faq">FAQ</Link>
              </li>
            </ul>
          </div>

          {/* Bouton contact à droite (toujours visible) */}
          <Link to="/contact-us" className="contact-button">
            Contactez-nous
          </Link>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default HeaderLayout;
