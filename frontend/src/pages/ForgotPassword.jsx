import React, { useState } from 'react';
import './ForgotPassword.css';  // Utiliser le nouveau fichier CSS
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'; // Pour la navigation
import logo from '../assets/logo3.jpeg'; // Assurez-vous que le logo est dans le bon chemin
import { requestPasswordReset, resetPassword } from '../services/apiServices';
import { homemadeHash } from '../utils/hashUtils';

const ForgotPassword = () => {

  const location = useLocation();
  const navigate = useNavigate();
  // Extract query parameters

  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token'); // Retrieves the 'token' query parameter


  // State for password reset request
  const [email, setEmail] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [requestError, setRequestError] = useState('');

  // State for password reset using token
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Loading states for better UX
  const [isRequesting, setIsRequesting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);


  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setRequestMessage('');
    setRequestError('');
    setIsRequesting(true);
    try {
      const response = await requestPasswordReset({ email });
      setRequestMessage(response.message);
    } catch (error) {
      setRequestError(error.message);
    } finally {
      setIsRequesting(false);
    }
  };
  // Handle password reset using token
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setResetMessage('');
    setResetError('');
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setResetError("Les mots de passe ne correspondent pas.");
      return;
    }
    const hPassword = homemadeHash(newPassword);
    setIsResetting(true);
    try {
      const response = await resetPassword({ token, hPassword });
      setResetMessage(response.message);
      // Optionally redirect to login after successful reset
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setResetError(error.message);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <img src={logo} alt="Chambre de Commerce de Djibouti" className="forgot-password-logo" />
        {!token ? (
          // Render password reset request form
          <>
            <h2 className="forgot-password-title">MOT DE PASSE OUBLIÉ</h2>
            <p className="forgot-password-instruction-text">
              Indiquez l'adresse e-mail associée à votre Espace pour générer un nouveau mot de passe.
            </p>
            <form onSubmit={handleRequestSubmit}>
                <div className="forgot-password-form-group">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder='Adresse email'
                    className="forgot-password-input-field"
                  />
                </div>
              <button type="submit" className="forgot-password-btn-submit" disabled={isRequesting}>
                {isRequesting ? 'Envoi...' : 'Envoyer'}
              </button>
            </form>
            {requestMessage && <p className="success-message">{requestMessage}</p>}
            {requestError && <p className="error-message">{requestError}</p>}
            <div className="forgot-password-back-to-login">
              <Link to="/login">Revenir à la page de connexion</Link>
            </div>
          </>
        ) : (
          // Render password reset form using token
          <>
            <h2 className="forgot-password-title">RÉINITIALISER MOT DE PASSE</h2>
            <p className="forgot-password-instruction-text">
              Entrez votre nouveau mot de passe.
            </p>
            <form onSubmit={handleResetSubmit}>
              <div className="forgot-password-form-group">
                <label htmlFor="newPassword">Nouveau mot de passe</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="forgot-password-input-field"
                />
              </div>
              <div className="forgot-password-form-group">
                <label htmlFor="confirmPassword">Confirmez le mot de passe</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="forgot-password-input-field"
                />
              </div>
              {passwordError && <p className="error-message">{passwordError}</p>}
              <button type="submit" className="forgot-password-btn-submit" disabled={isResetting}>
                {isResetting ? 'Réinitialisation...' : 'Réinitialiser'}
              </button>
            </form>
            {resetMessage && <p className="success-message">{resetMessage}</p>}
            {resetError && <p className="error-message">{resetError}</p>}
            <div className="forgot-password-back-to-login">
              <Link to="/login">Revenir à la page de connexion</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
