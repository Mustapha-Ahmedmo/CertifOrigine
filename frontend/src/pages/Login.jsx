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
  const [showChoices, setShowChoices] = useState(false); // État pour afficher les choix
  const [isDisappearing, setIsDisappearing] = useState(false); // État pour l'animation de disparition

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

  const handleShowChoices = () => {
    if (showChoices) {
      // Si les options sont déjà affichées, déclenche l'animation de disparition
      setIsDisappearing(true);
      // Après la durée de l'animation (0.5s), on masque complètement les options
      setTimeout(() => {
        setShowChoices(false);
        setIsDisappearing(false); // Réinitialise l'animation
      }, 500);
    } else {
      setShowChoices(true); // Affiche les options avec animation d'apparition
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-page-card">
        <img src={logo} alt="Logo" className="login-page-logo" />
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
          <a href="/forgot-password" className="login-page-forgot-password">Mot de passe oublié ?</a>
          <button type="submit" className="login-page-btn-login">Connexion</button>
        </form>
        <div className="login-page-divider">ou</div>
        <button onClick={handleShowChoices} className="login-page-btn-register">
          Ouvrir un compte
        </button>

        {/* Si showChoices est true, on affiche les options, sinon animation de disparition */}
        {showChoices && (
          <div className={`register-options ${isDisappearing ? 'disappearing' : ''}`}>
            <button
              onClick={() => navigate('/register')}
              className="register-option-btn"
            >
              Inscription Client
            </button>
            <button
              onClick={() => navigate('/registerop')}
              className="register-option-btn"
            >
              Inscription Opérateur
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
