import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import cartIcon from '../assets/cart.jpg';
import profileIcon from '../assets/profile.jpg';
import mailIcon from '../assets/mail.jpg'; // Importez l'icône de mail
import './Header.css';

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(3); // Nombre d'articles dans le panier
  const [mailNotificationCount, setMailNotificationCount] = useState(7); // Nombre de notifications de mail

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <header className="header">
      <div className="icon-container">
        <img src={mailIcon} alt="Mail" className="mail-icon" />
        {mailNotificationCount > 0 && <span className="badge mail-badge">{mailNotificationCount}</span>}
      </div>
      <div className="icon-container">
        <img src={cartIcon} alt="Cart" className="cart-icon" />
        {cartItemCount > 0 && <span className="badge cart-badge">{cartItemCount}</span>}
      </div>
      <img src={profileIcon} alt="Profile" className="profile-icon" onClick={toggleDropdown} />
      {dropdownOpen && (
        <div className={`dropdown ${dropdownOpen ? 'show' : ''}`}>
          <Link to="/profile">Profile</Link>
          <Link to="/settings">Settings</Link>
          <Link to="/login">Logout</Link>
        </div>
      )}
    </header>
  );
};

export default Header;
