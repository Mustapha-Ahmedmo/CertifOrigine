import React, { useState } from 'react';
import './RegisterOP.css';

const RegisterOP = () => {
  const [formData, setFormData] = useState({
    gender: 'Mr',
    name: '',
    phoneFixed: '',
    phoneMobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptsConditions: false,
    // ... autres champs si nécessaire
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const toggleGender = () => {
    setFormData((prevState) => ({
      ...prevState,
      gender: prevState.gender === 'Mr' ? 'Mme' : 'Mr',
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    // Ajoutez ici votre logique de soumission du formulaire
  };

  return (
    <div className="register-op-container">
      <h2>Créer un Compte Opérateur</h2>
      <form onSubmit={handleSubmit} className="register-op-form">
        {/* Section Contact */}
        <div className="register-op-form-section">
         
          <div className="register-op-form-row">
            {/* Civilité */}
            <div className="register-op-field register-op-half-width">
              <div className="register-op-toggle-switch">
                <input
                  type="checkbox"
                  id="gender-toggle"
                  name="gender"
                  checked={formData.gender === 'Mme'}
                  onChange={toggleGender}
                />
                <label htmlFor="gender-toggle" className="register-op-toggle-label">
                  <span className="register-op-toggle-slider"></span>
                </label>
                <label htmlFor="gender-toggle" className="register-op-gender-label">
                  {formData.gender}
                </label>
              </div>
              <span className="register-op-required-asterisk">*</span>
            </div>

            {/* Nom */}
            <div className="register-op-field register-op-half-width">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="register-op-input"
                placeholder="Nom"
              />
              <span className="register-op-required-asterisk">*</span>
            </div>
          </div>

          <div className="register-op-form-row">
            {/* Téléphone (fixe) */}
            <div className="register-op-field register-op-half-width">
              <input
                type="text"
                name="phoneFixed"
                value={formData.phoneFixed}
                onChange={handleChange}
                required
                className="register-op-input"
                placeholder="Téléphone (fixe)"
              />
              <span className="register-op-required-asterisk">*</span>
            </div>

            {/* Téléphone (portable) */}
            <div className="register-op-field register-op-half-width">
              <input
                type="text"
                name="phoneMobile"
                value={formData.phoneMobile}
                onChange={handleChange}
                required
                className="register-op-input"
                placeholder="Téléphone (portable)"
              />
              <span className="register-op-required-asterisk">*</span>
            </div>
          </div>

          <div className="register-op-form-row">
            {/* Email */}
            <div className="register-op-field register-op-half-width">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="register-op-input"
                placeholder="Email"
              />
              <span className="register-op-required-asterisk">*</span>
            </div>
          </div>

          <div className="register-op-form-row">
            {/* Mot de passe */}
            <div className="register-op-field register-op-half-width">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="register-op-input"
                placeholder="Mot de passe"
              />
              <span className="register-op-required-asterisk">*</span>
            </div>

            {/* Confirmer mot de passe */}
            <div className="register-op-field register-op-half-width">
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="register-op-input"
                placeholder="Confirmer mot de passe"
              />
              <span className="register-op-required-asterisk">*</span>
            </div>
          </div>
        </div>

        {/* Conditions */}
        <div className="register-op-form-section">
          <label className="register-op-checkbox-label">
            <input
              type="checkbox"
              name="acceptsConditions"
              checked={formData.acceptsConditions}
              onChange={handleChange}
              required
            />
            J'accepte les conditions générales de vente
            <span className="register-op-required-asterisk">*</span>
          </label>
        </div>

        {/* Bouton d'action */}
        <div className="register-op-form-actions">
          <button type="submit" className="register-op-button">
            Créer
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterOP;
