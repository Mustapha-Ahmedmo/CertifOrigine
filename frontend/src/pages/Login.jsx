import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../slices/authSlice';
import './Login.css';
import logo from '../assets/logo.jpg';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logique de connexion (vous pouvez remplacer ceci par votre logique réelle)
    if (username === 'admin' && password === 'password') {
      const user = { username }; // Vous pouvez ajouter plus de détails utilisateur ici
      dispatch(login(user));
      // Rediriger vers la page d'accueil
      navigate('/dashboard');
    } else {
      alert('Nom d\'utilisateur ou mot de passe incorrect');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <img src={logo} alt="Chambre de Commerce de Djibouti" className="logo" />
        <h2>CONNEXION</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Nom d'utilisateur</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <a href="/forgot-password" className="forgot-password">Mot de passe oublié?</a>
          </div>
          <button type="submit" className="btn-login">Se connecter</button>
          <div className="register-link">
            <p>Vous n'avez pas de compte? <a href="/register">Inscription</a></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
