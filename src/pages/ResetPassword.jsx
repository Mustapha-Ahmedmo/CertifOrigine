import React, { useState } from 'react';
import '../components/Login.css';  // Réutiliser les styles de la page de login
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
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <img src={logo} alt="Chambre de Commerce de Djibouti" className="logo" />
        <h2>RÉINITIALISER LE MOT DE PASSE</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="verificationCode">Code de vérification reçu par mail</label>
            <input type="text" id="verificationCode" name="verificationCode" required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Votre e-mail</label>
            <input type="email" id="email" name="email" required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Nouveau mot de passe</label>
            <input type="password" id="password" name="password" required />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
            <input type="password" id="confirmPassword" name="confirmPassword" required />
          </div>
          <div className="form-group checkbox-group">
            <input 
              type="checkbox" 
              id="terms" 
              name="terms" 
              checked={termsAccepted} 
              onChange={handleCheckboxChange} 
              required 
            />
            <label htmlFor="terms">J'ai pris connaissance et j'accepte les conditions générales de vente</label>
          </div>
          <button type="submit" className="btn-login">Réinitialiser</button>
        </form>
        <footer>
          <p>&copy;2023 Chambre de Commerce de Djibouti</p>
        </footer>
      </div>
    </div>
  );
};

export default ResetPassword;
