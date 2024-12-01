import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../slices/authSlice';
import './Login.css';
import logo from '../assets/logo.jpg';
import { Helmet } from 'react-helmet';
import { loginUser } from '../services/apiServices';
import { useMediaQuery } from 'react-responsive';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ query: '(max-width: 480px)' }); // Adjusted breakpoint for smaller devices

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Call the login API
      const response = await loginUser(username, password);

      // Dispatch the login action with user details
      const user = { id: response.user.id, username: response.user.username, token: response.token };
      dispatch(login(user));

      // Navigate to the dashboard on success
      navigate('/dashboard');
    } catch (error) {
      setErrorMessage(error.message || "Nom d'utilisateur ou mot de passe incorrect");
    }
  };

  return (
    <div className="login-page-wrapper">
      <Helmet>
        <title>Connexion</title>
        <meta name="description" content="Connectez-vous à votre compte." />
      </Helmet>
      <div className={`login-page-card ${isMobile ? 'mobile' : ''}`}>
        <img src={logo} alt="Logo" className={`login-page-logo ${isMobile ? 'mobile' : ''}`} />
        <h2 className={`login-page-title ${isMobile ? 'mobile' : ''}`}>Connexion</h2>
        <form onSubmit={handleSubmit} className={`login-form ${isMobile ? 'mobile' : ''}`}>
          {errorMessage && <p className="login-page-error-message">{errorMessage}</p>}
          <input
            type="text"
            placeholder="Nom d'utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className={`login-page-input-field ${isMobile ? 'mobile' : ''}`}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={`login-page-input-field ${isMobile ? 'mobile' : ''}`}
          />
          <button type="submit" className={`login-page-btn-login ${isMobile ? 'mobile' : ''}`}>
            Se connecter
          </button>
        </form>
        <Link to="/forgot-password" className={`login-page-forgot-password ${isMobile ? 'mobile' : ''}`}>
          Mot de passe oublié ?
        </Link>
        <div className={`login-page-no-account ${isMobile ? 'mobile' : ''}`}>
          Vous n'avez pas de compte ?{' '}
          <Link to="/register" className={`primary login-page-create-account-link ${isMobile ? 'mobile' : ''}`}>
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
