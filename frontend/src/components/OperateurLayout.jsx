import React, { useState, useEffect } from 'react';
import Header from './HeaderOp'; // Assurez-vous que ce nom correspond à votre composant
import Menu from './MenuOp';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';

const OperateurLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  // Empêche le scroll du body quand le menu est ouvert sur mobile, si souhaité
  useEffect(() => {
    if (isMenuOpen && window.innerWidth <= 768) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
  }, [isMenuOpen]);

  return (
    <>
      <Header toggleMenu={toggleMenu} isMenuOpen={isMenuOpen} />
      <Menu toggleMenu={toggleMenu} isMenuOpen={isMenuOpen} />
      
      {/* Overlay pour fermer le menu sur mobile en cliquant à côté, similaire au premier layout */}
      {isMenuOpen && window.innerWidth <= 768 && (
        <div className="menu-overlay" onClick={toggleMenu} aria-hidden="true"></div>
      )}

      <div className="main-container">
        <div className="content">
          <Outlet />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OperateurLayout;
