// MainLayout.jsx
import React, { useState, useEffect } from 'react';
import Header from './Header';
import Menu from './Menu';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';
import './MainLayout.css'; // Make sure to create this CSS file

const MainLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Function to toggle the menu open/close state
  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
    console.log('Menu toggled:', !isMenuOpen); // Debugging statement
  };

  // Effect to add/remove a class on the body to prevent scrolling when menu is open on mobile
  useEffect(() => {
    if (isMenuOpen && window.innerWidth <= 768) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
  }, [isMenuOpen]);

  return (
    <div className={`main-layout ${isMenuOpen ? 'menu-open' : ''}`}>
      <Header toggleMenu={toggleMenu} isMenuOpen={isMenuOpen} />
      <Menu isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
      
      {/* Optional Overlay for Mobile */}
      {isMenuOpen && window.innerWidth <= 768 && (
        <div className="menu-overlay" onClick={toggleMenu} aria-hidden="true"></div>
      )}

      <div className="main-container">
        <div className="content">
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MainLayout;
