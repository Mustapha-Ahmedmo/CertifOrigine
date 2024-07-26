import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.jpg';
import './Menu.css';

const Menu = () => {
  return (
    <nav className="menu">
      <img src={logo} alt="Logo" className="logo" />
      <ul>
        <li><Link to="/">Acceuil</Link></li>
        <li><Link to="/">Mes sociétés</Link></li>
        <li><Link to="/">Historique de mes commandes</Link></li>
        <li><Link to="/">CCD Certificat d'origine</Link></li>
        <li><Link to="/">Se déconnecter</Link></li>
      </ul>
    </nav>
  );
};

export default Menu;
