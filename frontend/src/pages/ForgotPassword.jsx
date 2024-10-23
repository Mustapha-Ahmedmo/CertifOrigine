import React from 'react';
import './ForgotPassword.css';  // Utiliser le nouveau fichier CSS
import { Link } from 'react-router-dom'; // Pour la navigation
import logo from '../assets/logo.jpg'; // Assurez-vous que le logo est dans le bon chemin

const ForgotPassword = () => {
  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <img src={logo} alt="Chambre de Commerce de Djibouti" className="forgot-password-logo" />
        <h2 className="forgot-password-title">MOT DE PASSE OUBLIÉ</h2>
        <p className="forgot-password-instruction-text">
          Indiquez l'adresse e-mail associée à votre Espace pour générer un nouveau mot de passe.
        </p>
        <form>
          <div className="forgot-password-form-group">
            <label htmlFor="email">Adresse email</label>
            <input type="email" id="email" name="email" required className="forgot-password-input-field" />
          </div>
          <button type="submit" className="forgot-password-btn-submit">Envoyer</button>
        </form>
        <div className="forgot-password-back-to-login">
          <Link to="/login">Revenir à la page de connexion</Link> {/* Lien vers la page de connexion */}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
