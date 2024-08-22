import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About Us</a></li>
            <li><a href="/services">Services</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/faq">FAQ</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Contact Us</h4>
          <p>123 Business Ave, Suite 100</p>
          <p>City, Country 12345</p>
          <p>Email: info@yourcompany.com</p>
          <p>Phone: (123) 456-7890</p>
        </div>
        <div className="footer-section">
          <h4>Our Services</h4>
          <ul>
            <li><a href="/consulting">Consulting</a></li>
            <li><a href="/support">Support</a></li>
            <li><a href="/custom-development">Custom Development</a></li>
            <li><a href="/training">Training</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 Your Company. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
