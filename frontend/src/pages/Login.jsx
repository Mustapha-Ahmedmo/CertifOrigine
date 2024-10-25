import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../slices/authSlice';
import './Login.css';
import logo from '../assets/logo.jpg';
import { Helmet } from 'react-helmet';
import '@fontsource/poppins'; // Cela importe la police Poppins

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'password') {
      const user = { username };
      dispatch(login(user));
      navigate('/dashboard');
    } else {
      alert('Nom d\'utilisateur ou mot de passe incorrect');
    }
  };

  return (
    <div className="login-page-wrapper">
      <Helmet>
        <title>Connexion</title> {/* Titre de la page */}
        <meta name="description" content="Connectez-vous à votre compte." /> {/* Description de la page */}
      </Helmet>
      <div className="login-page-card">
        <img src={logo} alt="Logo" className="login-page-logo" />
        <h2 className="login-page-title">Connexion</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="login-page-input-field"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="login-page-input-field"
          />
          <button type="submit" className="login-page-btn-login">Se connecter</button>
        </form>
        <a href="/forgot-password" className="login-page-forgot-password">Mot de passe oublié ?</a>
        <div className="login-page-no-account">
          Vous n'avez pas de compte ?{' '}
          <a href="register" className="login-page-create-account-link">
            Créer un compte
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
