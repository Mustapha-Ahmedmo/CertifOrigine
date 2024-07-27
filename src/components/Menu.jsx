import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../slices/authSlice';
import logo from '../assets/logo.jpg';
import './Menu.css';

const Menu = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="menu">
      <img src={logo} alt="Logo" className="logo" />
      <ul>
        <li><Link to="/">Accueil</Link></li>
        <li><Link to="/">Mes sociétés</Link></li>
        <li><Link to="/">Historique de mes commandes</Link></li>
        <li><Link to="/">CCD Certificat d'origine</Link></li>
        <li><button onClick={handleLogout} className="logout-button">Se déconnecter</button></li>
      </ul>
    </nav>
  );
};

export default Menu;
