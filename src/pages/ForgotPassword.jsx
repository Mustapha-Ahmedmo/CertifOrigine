import React from 'react';
import './Login.css';  // Réutiliser les styles de la page de login
import { Link } from 'react-router-dom'; // Utilisation de Link pour la navigation
import logo from '../assets/logo.jpg'; // Assurez-vous que le logo est dans le bon chemin

const ForgotPassword = () => {
  return (
    <div className="login-container">
      <div className="login-card">
        <img src={logo} alt="Chambre de Commerce de Djibouti" className="logo" />
        <h2>MOT DE PASSE OUBLIÉ</h2>
        <p className="instruction-text">Indiquez l'adresse e-mail associée à votre Espace pour générer un nouveau mot de passe.</p>
        <form>
          <div className="form-group">
            <label htmlFor="email">Adresse email</label>
            <input type="email" id="email" name="email" required />
          </div>
          <button type="submit" className="btn-login">Envoyer</button>
        </form>
        <div className="back-to-login">
          <Link to="/login">Revenir à la page de connexion</Link> {/* Lien vers la page de connexion */}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
