import React, { useState } from 'react';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    // États du formulaire
    gender: 'Mr',
    name: '',
    position: '',
    phoneFixed: '',
    phoneMobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    registrationNumber: '',
    address: '',
    city: '',
    country: '',
    companyType: '',
    taxId: '',
    freeZoneDetails: '',
    acceptsConditions: false,
    acceptsDataProcessing: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'companyType') {
      setFormData({
        ...formData,
        companyType: value,
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value,
      });
    }
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
    <div className="register-client-container">
      <h2>Créer un Compte Client</h2>
      <form onSubmit={handleSubmit} className="register-client-form">
        {/* Section Information Entreprise */}
        <div className="register-client-form-section">
          <h3>Information Entreprise</h3>
          <div className="register-client-form-row">
            {/* Statut */}
            <div className="register-client-field register-client-half-width">
              <select
                name="companyType"
                value={formData.companyType}
                onChange={handleChange}
                required
                className={`register-client-input ${
                  formData.companyType === '' ? 'grayed' : ''
                }`}
              >
                <option value="" disabled>
                  Statut
                </option>
                <option value="Entreprise">Entreprise</option>
                <option value="Entreprise de zone franche">Entreprise de zone franche</option>
              </select>
              <span className="register-client-required-asterisk">*</span>
            </div>

            {/* Raison sociale */}
            <div className="register-client-field register-client-half-width">
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                className="register-client-input"
                placeholder="Raison sociale"
              />
              <span className="register-client-required-asterisk">*</span>
            </div>
          </div>

          <div className="register-client-form-row">
            {/* N° d'immatriculation */}
            <div className="register-client-field register-client-half-width">
              <input
                type="text"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                required
                className="register-client-input"
                placeholder="N° d'immatriculation"
              />
              <span className="register-client-required-asterisk">*</span>
            </div>

            {/* Adresse complète */}
            <div className="register-client-field register-client-half-width">
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="register-client-input"
                placeholder="Adresse complète"
              />
              <span className="register-client-required-asterisk">*</span>
            </div>
          </div>

          <div className="register-client-form-row">
            {/* Pays */}
            <div className="register-client-field register-client-half-width">
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                className="register-client-input"
                placeholder="Pays"
              />
              <span className="register-client-required-asterisk">*</span>
            </div>
          </div>

          {/* Champs conditionnels basés sur le Statut */}
          {formData.companyType === 'Entreprise de zone franche' && (
            <div className="register-client-field register-client-full-width">
              <input
                type="text"
                name="freeZoneDetails"
                value={formData.freeZoneDetails || ''}
                onChange={handleChange}
                className="register-client-input"
                placeholder="N° Patente"
                required
              />
              <span className="register-client-required-asterisk">*</span>
            </div>
          )}

          {formData.companyType === 'Entreprise' && (
            <div className="register-client-field register-client-full-width">
              <input
                type="text"
                name="taxId"
                value={formData.taxId}
                onChange={handleChange}
                className="register-client-input"
                placeholder="N° d'identification fiscale"
                required
              />
              <span className="register-client-required-asterisk">*</span>
            </div>
          )}
        </div>

        {/* Section Contact */}
        <div className="register-client-form-section">
          <h3>Contact</h3>
          <div className="register-client-form-row">
            {/* Civilité */}
            <div className="register-client-field register-client-half-width">
              <div className="register-client-toggle-switch">
                <input
                  type="checkbox"
                  id="gender-toggle"
                  name="gender"
                  checked={formData.gender === 'Mme'}
                  onChange={toggleGender}
                />
                <label htmlFor="gender-toggle" className="register-client-toggle-label">
                  <span className="register-client-toggle-slider"></span>
                </label>
                <label htmlFor="gender-toggle" className="register-client-gender-label">
                  {formData.gender}
                </label>
              </div>
              <span className="register-client-required-asterisk">*</span>
            </div>

            {/* Nom */}
            <div className="register-client-field register-client-half-width">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="register-client-input"
                placeholder="Nom"
              />
              <span className="register-client-required-asterisk">*</span>
            </div>
          </div>

          <div className="register-client-form-row">
            {/* Fonction */}
            <div className="register-client-field register-client-half-width">
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
                className="register-client-input"
                placeholder="Fonction"
              />
              <span className="register-client-required-asterisk">*</span>
            </div>
          </div>

          <div className="register-client-form-row">
            {/* Téléphone (fixe) */}
            <div className="register-client-field register-client-half-width">
              <input
                type="text"
                name="phoneFixed"
                value={formData.phoneFixed}
                onChange={handleChange}
                required
                className="register-client-input"
                placeholder="Téléphone (fixe)"
              />
              <span className="register-client-required-asterisk">*</span>
            </div>

            {/* Téléphone (portable) */}
            <div className="register-client-field register-client-half-width">
              <input
                type="text"
                name="phoneMobile"
                value={formData.phoneMobile}
                onChange={handleChange}
                required
                className="register-client-input"
                placeholder="Téléphone (portable)"
              />
              <span className="register-client-required-asterisk">*</span>
            </div>
          </div>

          <div className="register-client-form-row">
            {/* Email */}
            <div className="register-client-field register-client-half-width">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="register-client-input"
                placeholder="Email"
              />
              <span className="register-client-required-asterisk">*</span>
            </div>
          </div>

          <div className="register-client-form-row">
            {/* Mot de passe */}
            <div className="register-client-field register-client-half-width">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="register-client-input"
                placeholder="Mot de passe"
              />
              <span className="register-client-required-asterisk">*</span>
            </div>

            {/* Confirmer le mot de passe */}
            <div className="register-client-field register-client-half-width">
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="register-client-input"
                placeholder="Confirmer mot de passe"
              />
              <span className="register-client-required-asterisk">*</span>
            </div>
          </div>
        </div>

        {/* Conditions */}
        <div className="register-client-form-section">
          <label className="register-client-checkbox-label">
            <input
              type="checkbox"
              name="acceptsConditions"
              checked={formData.acceptsConditions}
              onChange={handleChange}
              required
            />
            Je certifie être habilité à faire des formalités export pour la société que je viens de désigner ci-dessus.
            <span className="register-client-required-asterisk">*</span>
          </label>
          <label className="register-client-checkbox-label">
            <input
              type="checkbox"
              name="acceptsDataProcessing"
              checked={formData.acceptsDataProcessing}
              onChange={handleChange}
              required
            />
            J'accepte les conditions générales de vente
            <span className="register-client-required-asterisk">*</span>
          </label>
        </div>

        {/* Bouton d'action */}
        <div className="register-client-form-actions">
          <button type="submit" className="register-client-button">
            Créer
          </button>
        </div>
      </form>
    </div>
  );
};

export default Register;
