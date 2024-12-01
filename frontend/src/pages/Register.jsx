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
import { Link } from 'react-router-dom';
import { registerUser, fetchSectors, fetchCountries, setCustAccount } from '../services/apiServices';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Register = () => {
  const [formData, setFormData] = useState({
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
      setError('Les mots de passe ne correspondent pas');
      setSnackbarMessage('Les mots de passe ne correspondent pas');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
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
        sector:
          formData.sector === 'Autres' ? formData.otherSector : formData.sector,
        isFreeZoneCompany: formData.isFreeZoneCompany,
        isOtherCompany: formData.isOtherCompany,
        licenseNumber: formData.licenseNumber,
        nif: formData.nif,
        rchNumber: formData.rchNumber,
        acceptsConditions: formData.acceptsConditions,
        acceptsDataProcessing: formData.acceptsDataProcessing,
      };

      // Send the registration data to the backend
     // const response = await registerUser(userData);

     const selectedSector = sectors.find(
      (sector) => sector.symbol_fr === formData.sector
    );

    const selectedCountry = countries.find(
      (country) => country.symbol_fr === formData.country
    );    

      // Prepare customer account data (if needed)
      const custAccountData = {
        legal_form: formData.companyCategory, // This will be mapped to legal_form in controller
        cust_name: formData.companyName,
        trade_registration_num: formData.trade_registration_num || '12345', // Ensure trade_registration_num is collected
        in_free_zone: formData.isFreeZoneCompany,
        identification_number: formData.identification_number || 'ID123', // Ensure identification_number is collected
        register_number: formData.register_number || 'RN456', // Ensure register_number is collected
        full_address: formData.address,
        id_sector: selectedSector ? selectedSector.id_sector : null,
        other_sector: formData.otherSector || null,
        id_country: selectedCountry ? selectedCountry.id_country : null,
        statut_flag: 1, // Example value; set accordingly
        idlogin:  1, // Assuming registerUser returns userId
        billed_cust_name: formData.billed_cust_name || 'ABC Billing', // Collect from form or set default
        bill_full_address: formData.bill_full_address || '456 Billing St', // Collect from form or set default
        id_cust_account: null, // INOUT parameter; will be set by the procedure
      };

      // Set Customer Account
      const accountResponse = await setCustAccount(custAccountData);
      console.log('Set Cust Account response:', accountResponse);

      setSnackbarMessage('Inscription réussie');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      setError(err.message);
      setSnackbarMessage(err.message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
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
