import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import './HeaderLayout.css';

const HeaderLayout = () => {
  return (
    <div>
      <header className="page-header">
        <nav className="header-nav">
          <ul>
            <li>
              <Link to="/guide">Guide d'utilisation</Link>
            </li>
            <li>
              <Link to="/conditions">Les conditions de délivrance des certificats</Link>
            </li>
            <li>
              <Link to="/faq">FAQ</Link>
            </li>
          </ul>
          <button className="contact-button">
            Contactez-nous
          </button>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default HeaderLayout;
