import React, { useState } from 'react';
import cartIcon from '../assets/cart.jpg';
import profileIcon from '../assets/profile.jpg';
import './Header.css';

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <header className="header">
      <span className="company-name">Company Name</span>
      <select className="select-company">
        <option>Change Company</option>
        <option>Company A</option>
        <option>Company B</option>
      </select>
      <img src={cartIcon} alt="Cart" className="icon" />
      <img src={profileIcon} alt="Profile" className="icon" onClick={toggleDropdown} />
      {dropdownOpen && (
        <div className={`dropdown ${dropdownOpen ? 'show' : ''}`}>
          <a href="/profile">Profile</a>
          <a href="/settings">Settings</a>
          <a href="/logout">Logout</a>
        </div>
      )}
    </header>
  );
};

export default Header;
