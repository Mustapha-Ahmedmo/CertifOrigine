import React, { useState } from 'react';
import './ResetPassword.css';  // Utiliser le nouveau fichier CSS spécifique
import { Link } from 'react-router-dom'; // Pour la navigation
import logo from '../assets/logo.jpg'; // Assurez-vous que le logo est dans le bon chemin

const ResetPassword = () => {
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleCheckboxChange = () => {
    setTermsAccepted(!termsAccepted);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!termsAccepted) {
      alert('Veuillez accepter les conditions générales de vente.');
      return;
    }
    // Logique de soumission du formulaire
    console.log('Formulaire soumis avec succès!');
    // Vous pouvez ajouter ici une redirection ou une notification de succès
  };

  return (
    <div className="reset-password-page-wrapper">
      <div className="reset-password-card">
        <img src={logo} alt="Chambre de Commerce de Djibouti" className="reset-password-logo" />
        <h2 className="reset-password-title">RÉINITIALISER LE MOT DE PASSE</h2>
        <form onSubmit={handleSubmit} className="reset-password-form">
          <div className="reset-password-form-group">
            <input
              type="text"
              id="verificationCode"
              name="verificationCode"
              required
              className="reset-password-input-field"
              placeholder="Code de vérification reçu par mail"
              aria-label="Code de vérification reçu par mail"
            />
          </div>
          <div className="reset-password-form-group">
            <input
              type="email"
              id="email"
              name="email"
              required
              className="reset-password-input-field"
              placeholder="Votre e-mail"
              aria-label="Votre e-mail"
            />
          </div>
          <div className="reset-password-form-group">
            <input
              type="password"
              id="password"
              name="password"
              required
              className="reset-password-input-field"
              placeholder="Nouveau mot de passe"
              aria-label="Nouveau mot de passe"
            />
          </div>
          <div className="reset-password-form-group">
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
              className="reset-password-input-field"
              placeholder="Confirmer le mot de passe"
              aria-label="Confirmer le mot de passe"
            />
          </div>
          <div className="reset-password-form-group reset-password-checkbox-group">
            <input 
              type="checkbox" 
              id="terms" 
              name="terms" 
              checked={termsAccepted} 
              onChange={handleCheckboxChange} 
              required 
              className="reset-password-checkbox"
              aria-label="Accepter les conditions générales de vente"
            />
            <label htmlFor="terms" className="reset-password-checkbox-label">
              J'ai pris connaissance et j'accepte les conditions générales de vente
            </label>
          </div>
          <button type="submit" className="reset-password-btn-submit">Réinitialiser</button>
        </form>
        <div className="reset-password-back-to-login">
          <Link to="/login" className="reset-password-back-link">Revenir à la page de connexion</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
