import React from 'react';
import '../components/Login.css';
import logo from '../assets/logo.jpg'; // Assurez-vous que le logo est dans le bon chemin

const Login = () => {
  return (
    <div className="login-container">
      <div className="login-card">
        <img src={logo} alt="Chambre de Commerce de Djibouti" className="logo" />
        <h2>CONNEXION</h2>
        <form>
          <div className="form-group">
            <label htmlFor="username">Nom d'utilisateur</label>
            <input type="text" id="username" name="username" required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input type="password" id="password" name="password" required />
          </div>
          <div className="form-group">
            <a href="/forgot-password" className="forgot-password">Mot de passe oublié?</a>
          </div>
          <button type="submit" className="btn-login">Se connecter</button>
          <div className="register-link">
            <p>Vous n'avez pas de compte? <a href="/register">Inscription</a></p>
          </div>
        </form>
        <footer>
          <p>&copy;2023 Chambre de Commerce de Djibouti</p>
        </footer>
      </div>
    </div>
  );
};

export default Login;
