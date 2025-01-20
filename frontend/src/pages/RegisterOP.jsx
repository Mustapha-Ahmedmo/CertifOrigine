import React, { useState, forwardRef, useEffect } from 'react';
import './Register.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faPhone,
  faMobileAlt,
  faEnvelope,
  faLock,
} from '@fortawesome/free-solid-svg-icons';
import logo from '../assets/logo.jpg';
import { Helmet } from 'react-helmet';
import { Link, useNavigate, useParams } from 'react-router-dom';

// IMPORT DU FICHIER DES INDICATIFS
import countryCodes from '../components/countryCodes';

// Exemple d'API ou utilitaires si vous en avez besoin
// import { registerUser } from '../services/apiServices';

// MUI
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { createOperator, getOperatorList } from '../services/apiServices';
import { homemadeHash } from '../utils/hashUtils';

// ↓↓↓ FONCTION DE VALIDATION SIMPLIFIÉE POUR LES NUMÉROS ↓↓↓
const isValidLocalNumber = (number) => {
  // Vérifie que le numéro contient entre 6 et 15 chiffres
  return /^[0-9]{6,15}$/.test(number);
};

const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const RegisterOP = () => {
  const { id } = useParams(); // Get the operator ID from the URL

  const navigate = useNavigate();
  
  // État du formulaire (UNIQUEMENT la partie Contact)
  const [formData, setFormData] = useState({
    gender: 'Mr',
    name: '',
    phoneFixedCountryCode: '+33',
    phoneFixedNumber: '',
    phoneMobileCountryCode: '+33',
    phoneMobileNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Opérateur', // Opérateur par défaut
    isAdmin: false,    // Admin ou non
  });

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Gère la fermeture du snackbar
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };


  
  useEffect(() => {
    const preloadOperatorData = async () => {
      if (id) {
        try {
          const response = await getOperatorList(`${id}`, null, null); // Pass '1' as a string
          if (response.data && response.data.length > 0) {
            const operator = response.data[0];
            setFormData({
              gender: operator.gender === 1 ? 'Mr' : 'Mme',
              name: operator.full_name,
              phoneFixedCountryCode: operator.phone_number.slice(0, 3),
              phoneFixedNumber: operator.phone_number.slice(3),
              phoneMobileCountryCode: operator.mobile_number.slice(0, 3),
              phoneMobileNumber: operator.mobile_number.slice(3),
              email: operator.email,
              password: '', // Leave blank for security
              confirmPassword: '', // Leave blank for security
              role: operator.roles === 1 ? 'Administrateur' : 'Opérateur avec pouvoir',
            });
          }
        } catch (err) {
          setError('Erreur lors du chargement des données de l’opérateur.');
        }
      }
    };

    preloadOperatorData();
  }, [id]);

  // Gère le changement des champs du formulaire
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Si c’est un bouton radio ou checkbox
    if (type === 'checkbox' || type === 'radio') {
      setFormData((prev) => ({ ...prev, [name]: checked ? value : '' }));
      return;
    }

    // Pour les champs "phoneFixedNumber" ou "phoneMobileNumber"
    if (name === 'phoneFixedNumber' || name === 'phoneMobileNumber') {
      if (!isValidLocalNumber(value) && value !== '') {
        setError(
          `Le champ ${
            name === 'phoneFixedNumber' ? 'téléphone fixe' : 'téléphone portable'
          } est invalide (6 à 15 chiffres).`
        );
      } else {
        setError('');
      }
    }

    // Mise à jour générique
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

    // Vérification du champ "role" (obligatoire)
    if (!formData.role) {
      setSnackbarMessage('Veuillez sélectionner un rôle (Administrateur ou Opérateur).');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      // Exemple : construire un objet userData
      const operatorData = {
        id_op_user: id || 0, // Use ID for update or 0 for new creation
        gender: formData.gender === 'Mr' ? 1 : 2, // Convert to 1 (Mr) or 2 (Mme)
        fullName: formData.name,
        roles: formData.role === 'Administrateur' ? 1 : 2, // 1 for Admin, 2 for Operator
        isAdmin: formData.role === 'Administrateur',
        email: formData.email,
        password: homemadeHash(formData.password, 'md5'),
        phoneNumber: formData.phoneFixedCountryCode + formData.phoneFixedNumber,
        mobileNumber: formData.phoneMobileCountryCode + formData.phoneMobileNumber,
        idLoginInsert: 1
      };

      await createOperator(operatorData);

      // Appel API à adapter
      // const response = await registerUser(userData);
      // console.log('registerUser response:', response);

      setSuccessMessage('Inscription de l’opérateur réussie !');
      setSnackbarMessage("L'utilisateur opérateur a bien été créé.");
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      // Redirection (à adapter)
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message);
      setSnackbarMessage(err.message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleCancel = () => {
    navigate('/login'); // Redirect to the operators list without saving
  };

  return (
    <div className="register-page-container">
      <Helmet>
        <title>Créer un Compte (Opérateur)</title>
        <meta name="description" content="Inscrivez un opérateur." />
      </Helmet>

      {/* Logo en dehors du formulaire */}
      <div className="register-logo-container">
        <img src={logo} alt="Logo" className="register-logo" />
      </div>

      <div className="register-client-container">
        <h2>Créer un Compte Opérateur</h2>
        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}

        <form onSubmit={handleSubmit} className="register-client-form">
          {/* Section Contact UNIQUEMENT */}
          <div className="register-client-form-section">
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

            <div className="register-client-form-row">
              <div className="register-client-toggle-switch">
                <input
                  type="checkbox"
                  id="admin-toggle"
                  name="isAdmin"
                  checked={formData.isAdmin}
                  onChange={() =>
                    setFormData((prev) => ({
                      ...prev,
                      isAdmin: !prev.isAdmin, // Basculer entre true et false
                    }))
                  }
                />
                <label htmlFor="admin-toggle" className="register-client-toggle-label">
                  <span className="register-client-toggle-slider"></span>
                </label>
                <label htmlFor="admin-toggle" className="register-client-role-label">
                  {formData.isAdmin ? 'Administrateur' : 'Non Administrateur'}
                </label>
              </div>
            </div>



            {/* Choix obligatoire Rôle */}
            <div className="register-client-form-row">
              <div className="register-client-field register-client-full-width">
                <label style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                  Rôle  
                </label>
                <span className="register-client-required-asterisk">*</span>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <label className="register-client-radio-label">
                    <input
                      type="radio"
                      name="role"
                      value="Opérateur"
                      checked={formData.role === 'Opérateur'}
                      onChange={handleChange}
                      required
                    />
                    Opérateur
                  </label>
                  <label className="register-client-radio-label">
                    <input
                      type="radio"
                      name="role"
                      value="Opérateur avec pouvoir"
                      checked={formData.role === 'Opérateur avec pouvoir'}
                      onChange={handleChange}
                      required
                    />
                    Opérateur avec pouvoir
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="register-client-form-actions">
            <button type="submit" className="register-client-button">
              {id ? 'Modifier' : 'Créer'}
            </button>

            <button
              type="button"
              className="registerOP-client-button cancel-button"
              onClick={handleCancel}
            >
              Annuler
            </button>
          </div>
        </form>


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

export default RegisterOP;
