import React, { useState } from 'react';
import './Register.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faBuilding,
  faAddressCard,
  faGlobe,
  faPhone,
  faMobileAlt,
  faEnvelope,
  faLock,
} from '@fortawesome/free-solid-svg-icons';
import logo from '../assets/logo.jpg'; // Importation du logo
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom'; // Importer Link
import { registerUser } from '../services/apiServices';

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
    address: '',
    city: '',
    country: '',
    companyCategory: '',
    isFreeZoneCompany: false,
    isOtherCompany: false,
    licenseNumber: '',
    licenseFile: null,
    nif: '',
    patenteFile: null,
    rchNumber: '',
    rchFile: null,
    acceptsConditions: false,
    acceptsDataProcessing: false,
  });

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      if (name === 'isFreeZoneCompany' || name === 'isOtherCompany') {
        // S'assurer qu'une seule case est cochée à la fois
        setFormData({
          ...formData,
          isFreeZoneCompany: name === 'isFreeZoneCompany' ? checked : false,
          isOtherCompany: name === 'isOtherCompany' ? checked : false,
        });
      } else {
        setFormData({
          ...formData,
          [name]: checked,
        });
      }
    } else if (type === 'file') {
      setFormData({
        ...formData,
        [name]: files[0],
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const toggleGender = () => {
    setFormData((prevState) => ({
      ...prevState,
      gender: prevState.gender === 'Mr' ? 'Mme' : 'Mr',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate formData (example for password confirmation)
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // Prepare the data to send
      const userData = {
        username: formData.email,
        gender: formData.gender,
        name: formData.name,
        position: formData.position,
        phoneFixed: formData.phoneFixed,
        phoneMobile: formData.phoneMobile,
        email: formData.email,
        password: formData.password,
        companyName: formData.companyName,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        companyCategory: formData.companyCategory,
        isFreeZoneCompany: formData.isFreeZoneCompany,
        isOtherCompany: formData.isOtherCompany,
        licenseNumber: formData.licenseNumber,
        nif: formData.nif,
        rchNumber: formData.rchNumber,
        acceptsConditions: formData.acceptsConditions,
        acceptsDataProcessing: formData.acceptsDataProcessing,
      };

      // Send the registration data to the backend
      const response = await registerUser(userData);
      setSuccessMessage('User registered successfully');
      setError('');
      console.log('Registration success:', response);
    } catch (err) {
      setError(err.message);
      setSuccessMessage('');
    }
  };

  return (
    <div className="register-page-container">
      <Helmet>
        <title>Créer un Compte</title>
        <meta name="description" content="Inscrivez-vous pour créer un compte." />
      </Helmet>
      {/* Logo en dehors du formulaire */}
      <div className="register-logo-container">
        <img src={logo} alt="Logo" className="register-logo" />
      </div>

      <div className="register-client-container">
        <h2>Créer un Compte</h2>
        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
        <form onSubmit={handleSubmit} className="register-client-form">
          {/* Section Information Entreprise */}
          <div className="register-client-form-section">
            <h3>Information Entreprise</h3>
            <div className="register-client-form-row">
              {/* Catégorie */}
              <div className="register-client-field register-client-half-width">
                <div className="register-client-input-wrapper">
                  <FontAwesomeIcon icon={faBuilding} className="input-icon" />
                  <select
                    name="companyCategory"
                    value={formData.companyCategory}
                    onChange={handleChange}
                    required
                    className={`register-client-input ${
                      formData.companyCategory === '' ? 'grayed' : ''
                    }`}
                  >
                    <option value="" disabled>
                      Catégorie
                    </option>
                    <option value="Auto-entrepreneur">Auto-entrepreneur</option>
                    <option value="Entreprise individuelle">Entreprise individuelle</option>
                    <option value="EIRL">EIRL (Entreprise Individuelle à Responsabilité Limitée)</option>
                    <option value="EURL">EURL (Entreprise Unipersonnelle à Responsabilité Limitée)</option>
                    <option value="SARL">SARL (Société à Responsabilité Limitée)</option>
                    <option value="SAS">SAS (Société par Actions Simplifiée)</option>
                    <option value="SASU">SASU (Société par Actions Simplifiée Unipersonnelle)</option>
                    <option value="SA">SA (Société Anonyme)</option>
                    <option value="SNC">SNC (Société en Nom Collectif)</option>
                    <option value="SCS">SCS (Société en Commandite Simple)</option>
                    <option value="Autre">Autre</option>
                  </select>
                  <span className="register-client-required-asterisk">*</span>
                </div>
              </div>

              {/* Raison sociale */}
              <div className="register-client-field register-client-half-width">
                <div className="register-client-input-wrapper">
                  <FontAwesomeIcon icon={faAddressCard} className="input-icon" />
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    className="register-client-input"
                    placeholder="Nom de l'entreprise"
                  />
                  <span className="register-client-required-asterisk">*</span>
                </div>
              </div>
            </div>

            <div className="register-client-form-row">
              {/* Adresse complète */}
              <div className="register-client-field register-client-half-width">
                <div className="register-client-input-wrapper">
                  <FontAwesomeIcon icon={faAddressCard} className="input-icon" />
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

              {/* Pays */}
              <div className="register-client-field register-client-half-width">
                <div className="register-client-input-wrapper">
                  <FontAwesomeIcon icon={faGlobe} className="input-icon" />
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
            </div>

            {/* Cases à cocher pour le type d'entreprise */}
            <div className="register-client-form-row">
              <div className="register-client-field register-client-half-width">
                <label className="register-client-checkbox-label">
                  <input
                    type="checkbox"
                    name="isFreeZoneCompany"
                    checked={formData.isFreeZoneCompany}
                    onChange={handleChange}
                  />
                  Entreprise en zone franche
                </label>
              </div>
              <div className="register-client-field register-client-half-width">
                <label className="register-client-checkbox-label">
                  <input
                    type="checkbox"
                    name="isOtherCompany"
                    checked={formData.isOtherCompany}
                    onChange={handleChange}
                  />
                  Autre Entreprise
                </label>
              </div>
            </div>

            {/* Champs conditionnels basés sur le type d'entreprise */}
            {formData.isFreeZoneCompany && (
              <div className="register-client-form-row">
                {/* Numéro de licence */}
                <div className="register-client-field register-client-half-width">
                  <div className="register-client-input-wrapper">
                    <FontAwesomeIcon icon={faAddressCard} className="input-icon" />
                    <input
                      type="text"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      required
                      className="register-client-input"
                      placeholder="Numéro de licence"
                    />
                    <span className="register-client-required-asterisk">*</span>
                  </div>
                </div>

                {/* Télécharger la licence */}
                <div className="register-client-field register-client-half-width">
                  <label className="register-client-file-label">
                    Télécharger la licence de zone franche
                    <input
                      type="file"
                      name="licenseFile"
                      onChange={handleChange}
                      required
                      className="register-client-file-input"
                    />
                  </label>
                  <span className="register-client-required-asterisk">*</span>
                </div>
              </div>
            )}

            {formData.isOtherCompany && (
              <>
                <div className="register-client-form-row">
                  {/* NIF */}
                  <div className="register-client-field register-client-half-width">
                    <div className="register-client-input-wrapper">
                      <FontAwesomeIcon icon={faAddressCard} className="input-icon" />
                      <input
                        type="text"
                        name="nif"
                        value={formData.nif}
                        onChange={handleChange}
                        required
                        className="register-client-input"
                        placeholder="NIF"
                      />
                      <span className="register-client-required-asterisk">*</span>
                    </div>
                  </div>

                  {/* Télécharger patente */}
                  <div className="register-client-field register-client-half-width">
                    <label className="register-client-file-label">
                      Télécharger patente
                      <input
                        type="file"
                        name="patenteFile"
                        onChange={handleChange}
                        required
                        className="register-client-file-input"
                      />
                    </label>
                    <span className="register-client-required-asterisk">*</span>
                  </div>
                </div>

                <div className="register-client-form-row">
                  {/* Numéro d'immatriculation RCH */}
                  <div className="register-client-field register-client-half-width">
                    <div className="register-client-input-wrapper">
                      <FontAwesomeIcon icon={faAddressCard} className="input-icon" />
                      <input
                        type="text"
                        name="rchNumber"
                        value={formData.rchNumber}
                        onChange={handleChange}
                        className="register-client-input"
                        placeholder="Numéro d'immatriculation RCS"
                      />
                      {/* Pas d'astérisque car le champ n'est plus obligatoire */}
                    </div>
                  </div>

                  {/* Télécharger le numéro d'immatriculation RCH */}
                  <div className="register-client-field register-client-half-width">
                    <label className="register-client-file-label">
                      Télécharger le numéro d'immatriculation RCS
                      <input
                        type="file"
                        name="rchFile"
                        onChange={handleChange}
                        className="register-client-file-input"
                      />
                    </label>
                    {/* Pas d'astérisque car le champ n'est plus obligatoire */}
                  </div>
                </div>
              </>
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
                <div className="register-client-input-wrapper">
                  <FontAwesomeIcon icon={faUser} className="input-icon" />
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
            </div>

            <div className="register-client-form-row">
              {/* Fonction */}
              <div className="register-client-field register-client-half-width">
                <div className="register-client-input-wrapper">
                  <FontAwesomeIcon icon={faBuilding} className="input-icon" />
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
            </div>

            <div className="register-client-form-row">
              {/* Téléphone (fixe) */}
              <div className="register-client-field register-client-half-width">
                <div className="register-client-input-wrapper">
                  <FontAwesomeIcon icon={faPhone} className="input-icon" />
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
              </div>

              {/* Téléphone (portable) */}
              <div className="register-client-field register-client-half-width">
                <div className="register-client-input-wrapper">
                  <FontAwesomeIcon icon={faMobileAlt} className="input-icon" />
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
            </div>

            <div className="register-client-form-row">
              {/* Email */}
              <div className="register-client-field register-client-half-width">
                <div className="register-client-input-wrapper">
                  <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
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
            </div>

            <div className="register-client-form-row">
              {/* Mot de passe */}
              <div className="register-client-field register-client-half-width">
                <div className="register-client-input-wrapper">
                  <FontAwesomeIcon icon={faLock} className="input-icon" />
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
              </div>

              {/* Confirmer le mot de passe */}
              <div className="register-client-field register-client-half-width">
                <div className="register-client-input-wrapper">
                  <FontAwesomeIcon icon={faLock} className="input-icon" />
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

        {/* Lien vers la page de connexion */}
        <div className="register-client-login-link">
          <Link to="/login">Revenir à la page de connexion</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
