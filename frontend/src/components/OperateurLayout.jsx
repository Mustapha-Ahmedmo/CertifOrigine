import React, { useState, useEffect } from 'react';
import HeaderOP from './HeaderOP'; 
import Menu from './MenuOp';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';

const OperateurLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    if (isMenuOpen && window.innerWidth <= 768) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
  }, [isMenuOpen]);

  return (
    <>
      <HeaderOP toggleMenu={toggleMenu} isMenuOpen={isMenuOpen} />
      <Menu toggleMenu={toggleMenu} isMenuOpen={isMenuOpen} />
      
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
