import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../slices/authSlice';
import './Login.css';
import logo from '../assets/logo3.jpeg';
import { Helmet } from 'react-helmet';
import { loginUser } from '../services/apiServices';
import { useMediaQuery } from 'react-responsive';
import { homemadeHash } from '../utils/hashUtils';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ query: '(max-width: 480px)' });

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await loginUser(username, homemadeHash(password));
      dispatch(
        login({
          user: response.user,
          token: response.token,
        })
      );
      navigate('/dashboard');
    } catch (error) {
      setErrorMessage("Certaines de vos informations sont incorrectes. Réessayez.");
    }
  };

  return (
    <div className="login-page-wrapper">
      <Helmet>
        <title>Connexion</title>
        <meta name="description" content="Connectez-vous à votre compte." />
      </Helmet>

      {/* Colonne GAUCHE */}
      <div className="login-page-left">
        <h1 className="certificate-title">Certificat d'origine Électronique</h1>
        <p>
          La Chambre de Commerce de Djibouti (CCD) est habilitée
          à effectuer une partie des formalités requises par les activités à
          l'international des entreprises. La CCD délivre les Certificats d'origine et légalise 
          les documents commerciaux : Facture commerciales, Contrats, Licences de vente, etc.
        </p>
        <button className="btn-readmore">Lire plus</button>
      </div>

      {/* Colonne DROITE : Carte de connexion */}
      <div className={`login-page-card ${isMobile ? 'mobile' : ''}`}>
        <img
          src={logo}
          alt="Logo"
          className={`login-page-logo ${isMobile ? 'mobile' : ''}`}
        />
        <h2 className={`login-page-title ${isMobile ? 'mobile' : ''}`}>
          CONNEXION
        </h2>
        <form
          onSubmit={handleSubmit}
          className={`login-form ${isMobile ? 'mobile' : ''}`}
        >
          <input
            type="text"
            placeholder="E-mail"
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

          {/* Message d'erreur éventuel */}
          {errorMessage && (
            <p className="login-page-error-message">{errorMessage}</p>
          )}

          {/* Mot de passe oublié -> au-dessus du bouton Se connecter */}
          <Link
            to="/forgot-password"
            className={`login-page-forgot-password ${isMobile ? 'mobile' : ''}`}
          >
            Mot de passe oublié ?
          </Link>

          {/* Conteneur des 2 boutons : "Créer un compte" et "Se connecter" */}
          <div className="login-page-buttons-container">
            <Link
              to="/register"
              className="login-page-create-account-btn"
            >
              Créer un compte
            </Link>
            <button
              type="submit"
              className={`login-page-btn-login ${isMobile ? 'mobile' : ''}`}
            >
              Se connecter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
