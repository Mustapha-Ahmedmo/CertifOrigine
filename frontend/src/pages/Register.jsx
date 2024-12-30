// Register.jsx

import React, { useState, forwardRef, useEffect } from 'react';
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
  faIndustry,
} from '@fortawesome/free-solid-svg-icons';
import logo from '../assets/logo.jpg';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';

// IMPORT DU FICHIER DES INDICATIFS
import countryCodes from '../components/countryCodes';

// Import des services et utilitaires
import {
  registerUser,
  fetchSectors,
  fetchCountries,
  setCustAccount,
  setCustUser,
  addSubscription,
  addSubscriptionWithFile,
} from '../services/apiServices';

import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { homemadeHash } from '../utils/hashUtils';

// ↓↓↓ NOUVELLE FONCTION DE VALIDATION SIMPLIFIÉE ↓↓↓
const isValidLocalNumber = (number) => {
  // Vérifie que le numéro contient entre 6 et 15 chiffres
  return /^[0-9]{6,15}$/.test(number);
};

const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Register = () => {
  const allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    gender: 'Mr',
    name: '',
    position: '',
    // On remplace phoneFixed et phoneMobile par :
    phoneFixedCountryCode: '+33',
    phoneFixedNumber: '',

    phoneMobileCountryCode: '+33',
    phoneMobileNumber: '',

    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    address: '',
    city: '',
    country: '',
    companyCategory: '',
    sector: '',
    otherSector: '',
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
    companyType: '',
  });

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [sectors, setSectors] = useState([]);
  const [countries, setCountries] = useState([]);

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  useEffect(() => {
    // Fetch sectors and countries
    const fetchData = async () => {
      try {
        const sectorData = await fetchSectors();
        setSectors(sectorData);
        const countryData = await fetchCountries();
        setCountries(countryData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Échec du chargement des secteurs ou des pays');
        setSnackbarMessage('Échec du chargement des secteurs ou des pays');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    };

    fetchData();
  }, []);

  // Validation du type de fichier
  const validateFileType = (file) => {
    if (!file) return true; // Aucun fichier sélectionné => OK
    return allowedFileTypes.includes(file.type);
  };

  // Gère le changement des champs du formulaire
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    // Checkbox
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    // Fichier
    if (type === 'file') {
      const file = files[0];
      if (file && !validateFileType(file)) {
        setSnackbarMessage(`Seulement les fichiers JPEG, JPG, PNG et PDF sont autorisés pour ${name}.`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      setFormData((prev) => ({ ...prev, [name]: file }));
      return;
    }

    // Sélection du type d'entreprise (zoneFranche / autre)
    if (name === 'companyType') {
      setFormData((prev) => ({
        ...prev,
        companyType: value,
        isFreeZoneCompany: value === 'zoneFranche',
        isOtherCompany: value === 'autre',
      }));
      return;
    }

    // Pour les champs "phoneFixedNumber" ou "phoneMobileNumber"
    if (name === 'phoneFixedNumber' || name === 'phoneMobileNumber') {
      if (!isValidLocalNumber(value) && value !== '') {
        setError(`Le champ ${name === 'phoneFixedNumber' ? 'téléphone fixe' : 'téléphone portable'} est invalide (6 à 15 chiffres).`);
      } else {
        setError('');
      }
    }

    // MàJ générique
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Toggle entre Mr / Mme
  const toggleGender = () => {
    setFormData((prev) => ({
      ...prev,
      gender: prev.gender === 'Mr' ? 'Mme' : 'Mr',
    }));
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Vérif des fichiers
    const filesToValidate = [
      { name: 'licenseFile', file: formData.licenseFile },
      { name: 'patenteFile', file: formData.patenteFile },
      { name: 'rchFile', file: formData.rchFile },
    ];
    for (const { name, file } of filesToValidate) {
      if (file && !validateFileType(file)) {
        setSnackbarMessage(`Seulement les fichiers JPEG, JPG, PNG et PDF sont autorisés pour ${name}.`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
    }

    // Vérification du numéro fixe
    if (!isValidLocalNumber(formData.phoneFixedNumber)) {
      setSnackbarMessage('Le numéro de téléphone fixe est invalide (6 à 15 chiffres).');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    // Vérification du numéro mobile
    if (!isValidLocalNumber(formData.phoneMobileNumber)) {
      setSnackbarMessage('Le numéro de téléphone portable est invalide (6 à 15 chiffres).');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    // Vérification de la correspondance des mots de passe
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setSnackbarMessage('Les mots de passe ne correspondent pas');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      // Concatène l’indicatif et le numéro saisi
      const fullPhoneFixed = formData.phoneFixedCountryCode + formData.phoneFixedNumber;
      const fullPhoneMobile = formData.phoneMobileCountryCode + formData.phoneMobileNumber;

      // Prépare les données pour l'inscription
      const userData = {
        username: formData.email,
        gender: formData.gender,
        name: formData.name,
        position: formData.position,
        phoneFixed: fullPhoneFixed,
        phoneMobile: fullPhoneMobile,
        email: formData.email,
        password: formData.password,
        companyName: formData.companyName,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        companyCategory: formData.companyCategory,
        sector: formData.sector === 'Autres' ? formData.otherSector : formData.sector,
        isFreeZoneCompany: formData.isFreeZoneCompany,
        isOtherCompany: formData.isOtherCompany,
        licenseNumber: formData.licenseNumber,
        nif: formData.nif,
        rchNumber: formData.rchNumber,
        acceptsConditions: formData.acceptsConditions,
        acceptsDataProcessing: formData.acceptsDataProcessing,
      };

      // Sélection du secteur et pays (pour usage dans l’API)
      const selectedSector = sectors.find((s) => s.symbol_fr === formData.sector);
      const selectedCountry = countries.find((c) => c.symbol_fr === formData.country);

      // Prépare les données pour l'abonnement
      const subscriptionData = {
        uploadType: 'inscriptions',
        legal_form: formData.companyCategory,
        cust_name: formData.companyName,
        trade_registration_num: formData.trade_registration_num || '12345',
        in_free_zone: formData.isFreeZoneCompany,
        identification_number: formData.identification_number || 'ID123',
        register_number: formData.register_number || 'RN456',
        full_address: formData.address,
        id_sector: selectedSector ? selectedSector.id_sector : null,
        other_sector: formData.otherSector || null,
        id_country: selectedCountry ? selectedCountry.id_country : null,
        statut_flag: 1,
        idlogin: 1,
        billed_cust_name: formData.billed_cust_name || 'ABC Billing',
        bill_full_address: formData.bill_full_address || '456 Billing St',
        // Données utilisateur
        gender: formData.gender === 'Mr' ? 0 : 1,
        full_name: formData.name,
        ismain_user: true,
        email: formData.email,
        pwd: homemadeHash(formData.password, 'md5'),
        phone_number: fullPhoneFixed,
        mobile_number: fullPhoneMobile,
        position: formData.position,
        // Fichiers
        licenseFile: formData.isFreeZoneCompany ? formData.licenseFile : null,
        patenteFile: formData.isOtherCompany ? formData.patenteFile : null,
        rchFile: formData.isOtherCompany ? formData.rchFile : null,
      };

      // Appel API avec envoi de fichiers
      const response = await addSubscriptionWithFile(subscriptionData);
      console.log('Add Subscription with File response:', response);

      setSnackbarMessage('Inscription réussie');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      navigate('/account-created');
    } catch (err) {
      setError(err.message);
      setSnackbarMessage(err.message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      // Ajouter un délai avant la redirection
      setTimeout(() => {
        navigate('/account-created'); // Redirection après un délai
      }, 2000);
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
            <h3 className="primary">Information Entreprise</h3>
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
                      formData.companyCategory === '' ? 'placeholder' : ''
                    }`}
                  >
                    <option value="" disabled hidden>
                      Catégorie
                    </option>
                    <option value="Auto-entrepreneur">Auto-entrepreneur</option>
                    <option value="Entreprise individuelle">Entreprise individuelle</option>
                    <option value="EIRL">EIRL</option>
                    <option value="EURL">EURL</option>
                    <option value="SARL">SARL</option>
                    <option value="SAS">SAS</option>
                    <option value="SASU">SASU</option>
                    <option value="SA">SA</option>
                    <option value="SNC">SNC</option>
                    <option value="SCS">SCS</option>
                    <option value="Autre">Autre</option>
                  </select>
                  <span className="register-client-required-asterisk">*</span>
                </div>
              </div>

              {/* Secteur */}
              <div className="register-client-field register-client-half-width">
                <div className="register-client-input-wrapper">
                  <FontAwesomeIcon icon={faIndustry} className="input-icon" />
                  <select
                    name="sector"
                    value={formData.sector}
                    onChange={handleChange}
                    required
                    className={`register-client-input ${
                      formData.sector === '' ? 'placeholder' : ''
                    }`}
                  >
                    <option value="" disabled hidden>
                      Secteur
                    </option>
                    {sectors.map((sector) => (
                      <option key={sector.id_sector} value={sector.symbol_fr}>
                        {sector.symbol_fr.charAt(0).toUpperCase() +
                          sector.symbol_fr.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                  <span className="register-client-required-asterisk">*</span>
                </div>
              </div>
            </div>

            {/* Champ pour 'Autres' secteur */}
            {formData.sector === 'Autres' && (
              <div className="register-client-form-row">
                <div className="register-client-field register-client-full-width">
                  <div className="register-client-input-wrapper">
                    <FontAwesomeIcon icon={faIndustry} className="input-icon" />
                    <input
                      type="text"
                      name="otherSector"
                      value={formData.otherSector}
                      onChange={handleChange}
                      required
                      className="register-client-input"
                      placeholder="Veuillez préciser votre secteur d'activité"
                    />
                    <span className="register-client-required-asterisk">*</span>
                  </div>
                </div>
              </div>
            )}

            {/* Raison sociale et autre champs */}
            <div className="register-client-form-row">
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
            </div>

            <div className="register-client-form-row">
              {/* Pays */}
              <div className="register-client-field register-client-half-width">
                <div className="register-client-input-wrapper">
                  <FontAwesomeIcon icon={faGlobe} className="input-icon" />
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className={`register-client-input ${
                      formData.country === '' ? 'placeholder' : ''
                    }`}
                  >
                    <option value="" disabled hidden>
                      Pays
                    </option>
                    {countries.map((country) => (
                      <option key={country.id_country} value={country.symbol_fr}>
                        {country.symbol_fr.charAt(0).toUpperCase() +
                          country.symbol_fr.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                  <span className="register-client-required-asterisk">*</span>
                </div>
              </div>
            </div>

            {/* Liste déroulante pour le type d'entreprise */}
            <div className="register-client-form-row">
              <div className="register-client-field register-client-half-width">
                <div className="register-client-input-wrapper">
                  <FontAwesomeIcon icon={faBuilding} className="input-icon" />
                  <select
                    name="companyType"
                    value={formData.companyType}
                    onChange={handleChange}
                    required
                    className={`register-client-input ${
                      formData.companyType === '' ? 'placeholder' : ''
                    }`}
                  >
                    <option value="" disabled hidden>
                      Type d'entreprise
                    </option>
                    <option value="zoneFranche">Entreprise en zone franche</option>
                    <option value="autre">Autre Entreprise</option>
                  </select>
                  <span className="register-client-required-asterisk">*</span>
                </div>
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
                  {/* Numéro d'immatriculation RCS */}
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
                    </div>
                  </div>

                  {/* Télécharger le numéro d'immatriculation RCS */}
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
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Section Contact */}
          <div className="register-client-form-section">
            <h3 className="primary">Contact</h3>
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

            {/* Téléphone fixe + indicatif */}
            <div className="register-client-form-row">
              <div className="register-client-field register-client-half-width">
                <label className="register-client-label">Téléphone (fixe)</label>
                <div className="register-client-input-wrapper phone-wrapper">
                  <FontAwesomeIcon icon={faPhone} className="input-icon" />
                  <select
                    name="phoneFixedCountryCode"
                    value={formData.phoneFixedCountryCode}
                    onChange={handleChange}
                    className="register-client-input country-code-select"
                  >
                    {countryCodes.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.name} ({country.code})
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    name="phoneFixedNumber"
                    value={formData.phoneFixedNumber}
                    onChange={handleChange}
                    required
                    className="register-client-input phone-number-input"
                    placeholder="612345678"
                  />
                  <span className="register-client-required-asterisk">*</span>
                </div>
              </div>

              {/* Téléphone portable + indicatif */}
              <div className="register-client-field register-client-half-width">
                <label className="register-client-label">Téléphone (portable)</label>
                <div className="register-client-input-wrapper phone-wrapper">
                  <FontAwesomeIcon icon={faMobileAlt} className="input-icon" />
                  <select
                    name="phoneMobileCountryCode"
                    value={formData.phoneMobileCountryCode}
                    onChange={handleChange}
                    className="register-client-input country-code-select"
                  >
                    {countryCodes.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.name} ({country.code})
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    name="phoneMobileNumber"
                    value={formData.phoneMobileNumber}
                    onChange={handleChange}
                    required
                    className="register-client-input phone-number-input"
                    placeholder="712345678"
                  />
                  <span className="register-client-required-asterisk">*</span>
                </div>
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
                    required
                    className="register-client-input"
                    placeholder="Email"
                  />
                  <span className="register-client-required-asterisk">*</span>
                </div>
              </div>
            </div>

            {/* Mot de passe + confirmation */}
            <div className="register-client-form-row">
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

      {/* Snackbar Component */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Register;
