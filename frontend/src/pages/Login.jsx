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
      const response = await loginUser(username, password);

      dispatch(
        login({
          user: {
            id: response.user.id,
            full_name: response.user.full_name,
            email: response.user.email,
            role: response.user.role_user,
          },
          token: response.token,
        })
      );

    // Navigate based on isAdmin check
    if (response.user.isadmin_login) {
      navigate('/home-operateur'); // Admin route
    } else {
      navigate('/dashboard'); // Regular user route
    }
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
