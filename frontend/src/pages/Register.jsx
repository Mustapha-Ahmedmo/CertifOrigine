import React, { useState, forwardRef, useEffect } from 'react';
import './Register.css';
import logo from '../assets/logo3.jpeg';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';

// IMPORT DU FICHIER DES INDICATIFS
import countryCodes from '../components/countryCodes';

// Import des services et utilitaires
import {
  fetchSectors,
  fetchCountries,
  addSubscriptionWithFile,
} from '../services/apiServices';

import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { homemadeHash } from '../utils/hashUtils';

/** Vérifie que le numéro contient entre 6 et 15 chiffres */
const isValidLocalNumber = (number) => {
  return /^[0-9]{6,15}$/.test(number);
};

const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Register = () => {
  const allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  const navigate = useNavigate();

  // ÉTAT LOCAL DU FORMULAIRE
  const [formData, setFormData] = useState({
    // Champs "Contact"
    gender: 'Mr',
    name: '',
    position: '',
    phoneFixedCountryCode: '+33',
    phoneFixedNumber: '',
    phoneMobileCountryCode: '+33',
    phoneMobileNumber: '',
    email: '',
    password: '',
    confirmPassword: '',

    // Champs "Entreprise"
    companyName: '',
    companyCategory: '',           // Statut juridique (select principal)
    companyCategoryOther: '',      // Champ libre si "Autre" est sélectionné
    sector: '',                    // Secteur (select principal)
    otherSector: '',               // Champ libre si "Autre" est sélectionné
    companyResidenceCountry: '',
    companyOriginCountry: '',
    companyType: '', // "zoneFranche" ou "autre"
    address: '',

    isFreeZoneCompany: false,
    isOtherCompany: false,
    licenseNumber: '',
    licenseFile: null,
    nif: '',
    patenteFile: null,
    rchNumber: '',
    rchFile: null,

    // Acceptation conditions
    acceptsConditions: false,
    acceptsDataProcessing: false,
  });

  // Pour afficher le nom des fichiers sélectionnés
  const [selectedLicenseFileName, setSelectedLicenseFileName] = useState('');
  const [selectedPatenteFileName, setSelectedPatenteFileName] = useState('');
  const [selectedRchFileName, setSelectedRchFileName] = useState('');

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Pour les données récupérées (sectors, countries)
  const [sectors, setSectors] = useState([]);
  const [countries, setCountries] = useState([]);

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  // Au chargement, on récupère la liste des secteurs et des pays
  useEffect(() => {
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

  /** Vérifie si le type de fichier est autorisé */
  const validateFileType = (file) => {
    if (!file) return true; // Aucun fichier => OK
    return allowedFileTypes.includes(file.type);
  };

  /**
   * Gère tous les changements de champs (texte, checkbox, file, select, radio)
   */
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    // Cases à cocher
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    // Fichiers (upload)
    if (type === 'file') {
      const file = files[0];
      if (file && !validateFileType(file)) {
        setSnackbarMessage(`Fichier non autorisé pour ${name} (JPEG, PNG, PDF)`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      // On stocke le fichier dans formData
      setFormData((prev) => ({ ...prev, [name]: file || null }));

      // On met à jour le nom du fichier dans un état séparé (pour l'affichage)
      switch (name) {
        case 'licenseFile':
          setSelectedLicenseFileName(file ? file.name : '');
          break;
        case 'patenteFile':
          setSelectedPatenteFileName(file ? file.name : '');
          break;
        case 'rchFile':
          setSelectedRchFileName(file ? file.name : '');
          break;
        default:
          break;
      }
      return;
    }

    // Sélection du type d'entreprise
    if (name === 'companyType') {
      setFormData((prev) => ({
        ...prev,
        companyType: value,
        isFreeZoneCompany: value === 'zoneFranche',
        isOtherCompany: value === 'autre',
      }));
      return;
    }

    // Si on change le statut juridique
    if (name === 'companyCategory') {
      // Si ce n'est plus "Autre", on vide la valeur du champ "companyCategoryOther"
      if (value !== 'Autre') {
        setFormData((prev) => ({
          ...prev,
          companyCategory: value,
          companyCategoryOther: '',
        }));
      } else {
        // Sinon on stocke "Autre" et on ne vide pas le champ "companyCategoryOther"
        setFormData((prev) => ({
          ...prev,
          companyCategory: value,
        }));
      }
      return;
    }

    // Si on change le secteur
    if (name === 'sector') {
      // Si ce n'est plus "Autre", on vide la valeur du champ "otherSector"
      if (value !== 'Autre') {
        setFormData((prev) => ({
          ...prev,
          sector: value,
          otherSector: '',
        }));
      } else {
        // Sinon on stocke "Autre" et on ne vide pas le champ "otherSector"
        setFormData((prev) => ({
          ...prev,
          sector: value,
        }));
      }
      return;
    }

    // Contrôle basique du numéro de téléphone (fixe / mobile)
    if (name === 'phoneFixedNumber' || name === 'phoneMobileNumber') {
      if (!isValidLocalNumber(value) && value !== '') {
        setError(
          `Le numéro ${
            name === 'phoneFixedNumber' ? 'fixe' : 'portable'
          } est invalide (6 à 15 chiffres).`
        );
      } else {
        setError('');
      }
    }

    // Mise à jour générique des autres champs
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Soumission du formulaire
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Vérif formats des fichiers
    const filesToValidate = [
      { name: 'licenseFile', file: formData.licenseFile },
      { name: 'patenteFile', file: formData.patenteFile },
      { name: 'rchFile', file: formData.rchFile },
    ];
    for (const { name, file } of filesToValidate) {
      if (file && !validateFileType(file)) {
        setSnackbarMessage(`Fichier non autorisé pour ${name} (JPEG, PNG, PDF)`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
    }

    // Vérification numéro fixe
    if (!isValidLocalNumber(formData.phoneFixedNumber)) {
      setSnackbarMessage('Le numéro de téléphone fixe est invalide (6-15 chiffres).');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    // Vérification numéro mobile
    if (!isValidLocalNumber(formData.phoneMobileNumber)) {
      setSnackbarMessage('Le numéro de téléphone portable est invalide (6-15 chiffres).');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    // Vérification correspondance mots de passe
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setSnackbarMessage('Les mots de passe ne correspondent pas');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    // Construire les champs téléphone complets
    const fullPhoneFixed = formData.phoneFixedCountryCode + formData.phoneFixedNumber;
    const fullPhoneMobile = formData.phoneMobileCountryCode + formData.phoneMobileNumber;

    try {
      // --- Gérer le secteur : si Autre => selectedSector = null
      let selectedSector = null;
      if (formData.sector !== 'Autre') {
        selectedSector = sectors.find((s) => s.symbol_fr === formData.sector);
      }

      // Récupérer Pays de résidence/origine
      const selectedResidenceCountry = countries.find(
        (c) => c.symbol_fr === formData.companyResidenceCountry
      );
      const selectedOriginCountry = countries.find(
        (c) => c.symbol_fr === formData.companyOriginCountry
      );

      // Préparer la valeur finale pour le statut juridique
      const finalLegalForm =
        formData.companyCategory === 'Autre'
          ? formData.companyCategoryOther // le champ libre si "Autre"
          : formData.companyCategory;

      // Préparer l'objet pour l'API
      const subscriptionData = {
        uploadType: 'inscriptions',

        // Statut juridique final
        legal_form: finalLegalForm,
        cust_name: formData.companyName,
        licenseNumber: formData.licenseNumber,
        in_free_zone: formData.isFreeZoneCompany,
        nif: formData.nif,
        rchNumber: formData.rchNumber,
        full_address: formData.address,

        // id_sector si ce n'est pas "Autre", sinon null
        id_sector: selectedSector ? selectedSector.id_sector : null,
        // other_sector si c'est "Autre"
        other_sector: formData.sector === 'Autre' ? formData.otherSector : null,

        id_country: selectedResidenceCountry
          ? selectedResidenceCountry.id_country
          : null,
        id_country_origin: selectedOriginCountry
          ? selectedOriginCountry.id_country
          : null,

        statut_flag: 1,
        idlogin: 1,

        // Civilité : 0 pour Mr, 1 pour Mme
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

      // Appel API
      const response = await addSubscriptionWithFile(subscriptionData);
      console.log('Add Subscription with File response:', response);

      setSnackbarMessage('Inscription réussie');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      // Redirection en cas de succès
      navigate('/account-created');
    } catch (err) {
      setError(err.message);
      setSnackbarMessage(err.message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);

      // Redirection après un délai (si souhaité)
      setTimeout(() => {
        navigate('/account-created');
      }, 2000);
    }
  };

  return (
    <div className="register-page-container">
      <Helmet>
        <title>Créer un Compte</title>
        <meta name="description" content="Inscrivez-vous pour créer un compte." />
      </Helmet>

      {/* Logo */}
      <div className="register-logo-container">
        <img src={logo} alt="Logo" className="register-logo" />
      </div>

      <div className="register-client-container">
        <h2>Créer son compte</h2>
        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}

        <form onSubmit={handleSubmit} className="register-client-form">
          {/* SECTION ENTREPRISE */}
          <div className="register-client-form-section">
            <h3 className="primary">Information(s) Entreprise</h3>

            {/* Nom de l'entreprise */}
            <div className="register-client-form-row">
              <div className="register-client-field register-client-full-width">
                <div className="register-client-input-wrapper">
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

            {/* Statut juridique + Secteur */}
            <div className="register-client-form-row">
              {/* Statut juridique */}
              <div className="register-client-field register-client-half-width">
                <div className="register-client-input-wrapper">
                  <select
                    name="companyCategory"
                    value={formData.companyCategory}
                    onChange={handleChange}
                    required
                    className={`register-client-input ${
                      !formData.companyCategory ? 'placeholder' : ''
                    }`}
                  >
                    <option value="" disabled hidden>
                      Statut juridique
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
                  <select
                    name="sector"
                    value={formData.sector}
                    onChange={handleChange}
                    required
                    className={`register-client-input ${
                      !formData.sector ? 'placeholder' : ''
                    }`}
                  >
                    <option value="" disabled hidden>
                      Secteur
                    </option>
                    {sectors.map((s) => (
                      <option key={s.id_sector} value={s.symbol_fr}>
                        {s.symbol_fr.charAt(0).toUpperCase() +
                          s.symbol_fr.slice(1).toLowerCase()}
                      </option>
                    ))}
                    {/* On ajoute l'option "Autre" */}
                    <option value="Autre">Autre</option>
                  </select>
                  <span className="register-client-required-asterisk">*</span>
                </div>
              </div>
            </div>

            {/* Champ libre si "Autre" est sélectionné pour Statut juridique */}
            {formData.companyCategory === 'Autre' && (
              <div className="register-client-form-row">
                <div className="register-client-field register-client-full-width">
                  <div className="register-client-input-wrapper">
                    <input
                      type="text"
                      name="companyCategoryOther"
                      value={formData.companyCategoryOther}
                      onChange={handleChange}
                      required
                      className="register-client-input"
                      placeholder="Précisez votre statut juridique"
                    />
                    <span className="register-client-required-asterisk">*</span>
                  </div>
                </div>
              </div>
            )}

            {/* Champ libre si "Autre" est sélectionné pour Secteur */}
            {formData.sector === 'Autre' && (
              <div className="register-client-form-row">
                <div className="register-client-field register-client-full-width">
                  <div className="register-client-input-wrapper">
                    <input
                      type="text"
                      name="otherSector"
                      value={formData.otherSector}
                      onChange={handleChange}
                      required
                      className="register-client-input"
                      placeholder="Précisez votre secteur"
                    />
                    <span className="register-client-required-asterisk">*</span>
                  </div>
                </div>
              </div>
            )}

            {/* Pays de résidence + Pays d'origine */}
            <div className="register-client-form-row">
              <div className="register-client-field register-client-half-width">
                <div className="register-client-input-wrapper">
                  <select
                    name="companyResidenceCountry"
                    value={formData.companyResidenceCountry}
                    onChange={handleChange}
                    required
                    className={`register-client-input ${
                      !formData.companyResidenceCountry ? 'placeholder' : ''
                    }`}
                  >
                    <option value="" disabled hidden>
                      Pays de résidence de l'entreprise
                    </option>
                    {countries.map((c) => (
                      <option key={c.id_country} value={c.symbol_fr}>
                        {c.symbol_fr.charAt(0).toUpperCase() +
                          c.symbol_fr.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                  <span className="register-client-required-asterisk">*</span>
                </div>
              </div>

              <div className="register-client-field register-client-half-width">
                <div className="register-client-input-wrapper">
                  <select
                    name="companyOriginCountry"
                    value={formData.companyOriginCountry}
                    onChange={handleChange}
                    required
                    className={`register-client-input ${
                      !formData.companyOriginCountry ? 'placeholder' : ''
                    }`}
                  >
                    <option value="" disabled hidden>
                      Pays d'origine de l'entreprise
                    </option>
                    {countries.map((c) => (
                      <option key={c.id_country} value={c.symbol_fr}>
                        {c.symbol_fr.charAt(0).toUpperCase() +
                          c.symbol_fr.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                  <span className="register-client-required-asterisk">*</span>
                </div>
              </div>
            </div>

            {/* Type d'entreprise + Adresse complète */}
            <div className="register-client-form-row">
              <div className="register-client-field register-client-half-width">
                <div className="register-client-input-wrapper">
                  <select
                    name="companyType"
                    value={formData.companyType}
                    onChange={handleChange}
                    required
                    className={`register-client-input ${
                      !formData.companyType ? 'placeholder' : ''
                    }`}
                  >
                    <option value="" disabled hidden>
                      Type d'entreprise
                    </option>
                    <option value="zoneFranche">Entreprise en zone franche</option>
                    <option value="autre">Entreprise Hors Zone franche</option>
                  </select>
                  <span className="register-client-required-asterisk">*</span>
                </div>
              </div>

              <div className="register-client-field register-client-half-width">
                <div className="register-client-input-wrapper">
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

            {/* ENTREPRISE : ZONE FRANCHE */}
            {formData.isFreeZoneCompany && (
              <div className="register-client-form-row">
                <div className="register-client-field register-client-half-width">
                  <div className="register-client-input-wrapper">
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

                <div className="register-client-field register-client-half-width">
                  <label htmlFor="licenseFile" className="custom-file-btn">
                    {selectedLicenseFileName ||
                      'Upload'}
                  </label>
                  <input
                    type="file"
                    id="licenseFile"
                    name="licenseFile"
                    onChange={handleChange}
                    required
                    className="real-file-input"
                  />
                  <span className="register-client-required-asterisk">*</span>
                </div>
              </div>
            )}

            {/* ENTREPRISE : AUTRE */}
            {formData.isOtherCompany && (
              <>
                <div className="register-client-form-row">
                  <div className="register-client-field register-client-half-width">
                    <div className="register-client-input-wrapper">
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

                  <div className="register-client-field register-client-half-width">
                    <label htmlFor="patenteFile" className="custom-file-btn">
                      {selectedPatenteFileName || 'Upload'}
                    </label>
                    <input
                      type="file"
                      id="patenteFile"
                      name="patenteFile"
                      onChange={handleChange}
                      required
                      className="real-file-input"
                    />
                    <span className="register-client-required-asterisk">*</span>
                  </div>
                </div>

                <div className="register-client-form-row">
                  <div className="register-client-field register-client-half-width">
                    <div className="register-client-input-wrapper">
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

                  <div className="register-client-field register-client-half-width">
                    <label htmlFor="rchFile" className="custom-file-btn">
                      {selectedRchFileName ||
                        "Upload"}
                    </label>
                    <input
                      type="file"
                      id="rchFile"
                      name="rchFile"
                      onChange={handleChange}
                      className="real-file-input"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
          {/* FIN SECTION ENTREPRISE */}

          {/* SECTION CONTACT */}
          <div className="register-client-form-section">
            <h3 className="primary">Contact</h3>

            <div className="register-client-form-row">
              {/* Civilité */}
              <div className="register-client-field register-client-half-width">
                <label className="register-client-label">Civilité</label>
                <div>
                  <label className="register-client-radio-label">
                    <input
                      type="radio"
                      name="gender"
                      value="Mr"
                      checked={formData.gender === 'Mr'}
                      onChange={handleChange}
                      required
                    />
                    Mr
                  </label>
                  <label className="register-client-radio-label">
                    <input
                      type="radio"
                      name="gender"
                      value="Mme"
                      checked={formData.gender === 'Mme'}
                      onChange={handleChange}
                      required
                    />
                    Mme
                  </label>
                </div>
                <span className="register-client-required-asterisk">*</span>
              </div>

              {/* Nom */}
              <div className="register-client-field register-client-half-width">
                <div className="register-client-input-wrapper">
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

            {/* Fonction */}
            <div className="register-client-form-row">
              <div className="register-client-field register-client-half-width">
                <div className="register-client-input-wrapper">
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

            {/* Téléphone fixe + portable */}
            <div className="register-client-form-row">
              <div className="register-client-field register-client-half-width">
                <div className="register-client-input-wrapper phone-wrapper">
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
                    placeholder="Téléphone (fixe)"
                  />
                  <span className="register-client-required-asterisk">*</span>
                </div>
              </div>

              <div className="register-client-field register-client-half-width">
                <div className="register-client-input-wrapper phone-wrapper">
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
                    placeholder="Téléphone (portable)"
                  />
                  <span className="register-client-required-asterisk">*</span>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="register-client-form-row">
              <div className="register-client-field register-client-half-width">
                <div className="register-client-input-wrapper">
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

            {/* Mots de passe */}
            <div className="register-client-form-row">
              <div className="register-client-field register-client-half-width">
                <div className="register-client-input-wrapper">
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
          {/* FIN SECTION CONTACT */}

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

      {/* Snackbar */}
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
