import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faPhone, faMobileAlt, faEnvelope, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const RegisterContact = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    mobile: '',
    isPrimary: false,
  });

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation simple
    if (!formData.name || !formData.role || !formData.email) {
      setError('Tous les champs obligatoires doivent être remplis.');
      return;
    }

    setError('');
    setSuccessMessage('Contact créé avec succès !');
    setTimeout(() => navigate('/contacts/list'), 2000);
  };

  return (
    <div className="register-page-container">
      <div className="register-client-container">
        <h2>Créer un Contact</h2>
        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}

        <form onSubmit={handleSubmit} className="register-client-form">
          {/* Nom */}
          <div className="register-client-form-row">
            <div className="register-client-field register-client-half-width">
              <div className="register-client-input-wrapper">
                <FontAwesomeIcon icon={faUser} className="input-icon" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="register-client-input"
                  placeholder="Nom"
                  required
                />
              </div>
            </div>
          </div>

          {/* Fonction */}
          <div className="register-client-form-row">
            <div className="register-client-field register-client-half-width">
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="register-client-input"
                placeholder="Fonction"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="register-client-form-row">
            <div className="register-client-field register-client-half-width">
              <div className="register-client-input-wrapper">
                <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="register-client-input"
                  placeholder="Email"
                  required
                />
              </div>
            </div>
          </div>

          {/* Téléphone fixe */}
          <div className="register-client-form-row">
            <div className="register-client-field register-client-half-width">
              <div className="register-client-input-wrapper">
                <FontAwesomeIcon icon={faPhone} className="input-icon" />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="register-client-input"
                  placeholder="Téléphone fixe"
                />
              </div>
            </div>
          </div>

          {/* Téléphone portable */}
          <div className="register-client-form-row">
            <div className="register-client-field register-client-half-width">
              <div className="register-client-input-wrapper">
                <FontAwesomeIcon icon={faMobileAlt} className="input-icon" />
                <input
                  type="text"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="register-client-input"
                  placeholder="Téléphone portable"
                />
              </div>
            </div>
          </div>

          {/* Contact principal */}
          <div className="register-client-form-row">
            <div className="register-client-field register-client-full-width">
              <label className="register-client-checkbox-label">
                <input
                  type="checkbox"
                  name="isPrimary"
                  checked={formData.isPrimary}
                  onChange={handleChange}
                />
                <FontAwesomeIcon icon={faCheckCircle} className="icon" />
                Contact principal
              </label>
            </div>
          </div>

          {/* Bouton d'action */}
          <div className="register-client-form-actions">
            <button type="submit" className="register-client-button">
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterContact;
