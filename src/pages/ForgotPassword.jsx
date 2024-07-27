import React from 'react';
import '../components/Login.css';  // Réutiliser les styles de la page de login
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
        <footer>
          <p>&copy;2023 Chambre de Commerce de Djibouti</p>
        </footer>
      </div>
    </div>
  );
};

export default ForgotPassword;

