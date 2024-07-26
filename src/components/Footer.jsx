import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <span>Email: user@example.com</span>
      <span>Address: 123 Main St, City, Country</span>
      <span><a href="/legal" className="footer-link">Mentions légales</a></span>
    </footer>
  );
};

export default Footer;
