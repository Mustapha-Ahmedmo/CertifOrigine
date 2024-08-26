import React, { useState } from 'react';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gender: 'Mr',
    companyName: '',
    registrationNumber: '',
    address: '',
    city: '',
    country: '',
    companyType: 'SARL',
    taxId: '',
    acceptsConditions: false,
    acceptsDataProcessing: false,
    isInFreeZone: false,
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
    // Add your form submission logic here
  };

  return (
    <div className="register-container">
      <h2>Nouvelle Inscription</h2>
      <form onSubmit={handleSubmit} className="register-form">
        <div className="form-section">
          <h3>Contact</h3>
          <div className="form-row">
            <label className="small-label">
              Civilité:
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  id="gender-toggle"
                  checked={formData.gender === 'Mme'}
                  onChange={toggleGender}
                />
                <label htmlFor="gender-toggle" className="toggle-label">
                  <span className="toggle-slider"></span>
                </label>
                <span className="gender-label">{formData.gender}</span>
              </div>
            </label>
            <label className="large-label">
              Nom complet:
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </label>
            <label className="large-label">
              Téléphone:
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </label>
          </div>
          <div className="form-row">
            <label className="large-label">
              E-mail:
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </label>
            <label className="large-label">
              Mot de passe:
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </label>
            <label className="large-label">
              Confirmer le Mot de passe:
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </label>
          </div>
        </div>

        <div className="form-section">
          <h3>Société</h3>
          <div className="form-row">
            <label className="small-label">
              Catégorie:
              <select
                name="companyType"
                value={formData.companyType}
                onChange={handleChange}
                required
              >
                <option value="SARL">SARL</option>
                <option value="SA">SA</option>
                {/* Add other company types as needed */}
              </select>
            </label>
            <label className="large-label">
              Raison sociale / Nom:
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
              />
            </label>
            <label className="large-label">
              N° d'immatriculation au RCS:
              <input
                type="text"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                required
              />
            </label>
          </div>
          <div className="form-row">
            <label className="large-label">
              Adresse complète:
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </label>
            <label className="large-label">
              Pays:
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
              />
            </label>
          </div>
          <div className="form-row-vertical">
            <label>
              <input
                type="radio"
                name="zoneStatus"
                value="freeZone"
                checked={formData.isInFreeZone}
                onChange={handleChange}
              />
              Société en zone franche
            </label>
            <label>
              <input
                type="radio"
                name="zoneStatus"
                value="other"
                checked={!formData.isInFreeZone}
                onChange={handleChange}
              />
              Autre N° d’identification fiscale:
              <input
                type="text"
                name="taxId"
                value={formData.taxId}
                onChange={handleChange}
                disabled={!formData.isInFreeZone}
                className="inline-input"
              />
            </label>
          </div>
        </div>

        <div className="form-section">
          <label>
            <input
              type="checkbox"
              name="acceptsConditions"
              checked={formData.acceptsConditions}
              onChange={handleChange}
              required
            />
            J’accepte les conditions générales de vente.
          </label>
          <label>
            <input
              type="checkbox"
              name="acceptsDataProcessing"
              checked={formData.acceptsDataProcessing}
              onChange={handleChange}
              required
            />
            J’autorise la collecte, le traitement, et la conservation de mes
            données personnelles.
          </label>
        </div>

        <div className="form-actions">
          <button type="submit">Créer</button>
          <button type="button" onClick={() => console.log('Cancelled')}>
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};

export default Register;
