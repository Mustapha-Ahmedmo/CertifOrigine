// RegisterContact.js
import React, { useState, useEffect, forwardRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faPhone,
  faMobileAlt,
  faEnvelope,
  faCheckCircle,
  faLock,
} from '@fortawesome/free-solid-svg-icons';
import './Register.css';
import logo from '../assets/logo.jpg';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { getCustUsersByAccount, setCustUser } from '../services/apiServices';
import { homemadeHash } from '../utils/hashUtils';

const RegisterContact = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // contact id from URL (for modification)
  
  // Form state including password fields
  const [formData, setFormData] = useState({
    name: '',
    role: '', // This will be used as the contact's "position"
    email: '',
    phone: '',
    mobile: '',
    isPrimary: false,
    password: '',        // New password field
    confirmPassword: '', // Confirm new password
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Retrieve custAccountId from localStorage (or via Redux if available)
  const user = JSON.parse(localStorage.getItem('user'));
  const custAccountId = user ? user.id_cust_account : null;

  // Preload data when modifying (if id exists)
  useEffect(() => {
    const fetchContact = async () => {
      try {
        const response = await getCustUsersByAccount(
          custAccountId,
          null,
          'true',
          'true',
          null // Adjust as needed (retrieving main user contacts)
        );
        if (response.data && response.data.length > 0) {
          // Find the contact whose id_cust_user matches the id from URL.
          const contact = response.data.find(
            (c) => c.id_cust_user === parseInt(id, 10)
          );
          if (contact) {
            setFormData({
              name: contact.full_name || '',
              role: contact.position || '',
              email: contact.email || '',
              phone: contact.phone_number || '',
              mobile: contact.mobile_number || '',
              isPrimary: contact.ismain_user || false,
              password: '',        // Leave empty for security
              confirmPassword: '', // Leave empty for security
            });
          } else {
            setError('Contact non trouvé.');
          }
        }
      } catch (err) {
        console.error('Erreur lors du chargement du contact:', err);
        setError('Erreur lors de la récupération du contact.');
      }
    };

    if (id && custAccountId) {
      fetchContact();
    }
  }, [id, custAccountId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation for required fields
    if (!formData.name || !formData.role || !formData.email) {
      setError('Tous les champs obligatoires doivent être remplis.');
      return;
    }

    // If creating a new contact, password fields are required.
    if (!id && (!formData.password || !formData.confirmPassword)) {
      setError('Le mot de passe et sa confirmation sont requis pour créer un contact.');
      return;
    }

    // For updating, check if provided password matches confirm password.
    if (formData.password || formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        setError('Les mots de passe ne correspondent pas.');
        return;
      }
    }

    setError('');

    // Construct userData to be sent to setCustUser.
    // When updating and no new password is provided, pass null for the password.
    const userData = {
      id_cust_user: id ? parseInt(id, 10) : 0, // 0 for new contact, or existing id for modification
      id_cust_account: custAccountId,
      gender: 1, // Defaulting to 1 (adjust as needed)
      full_name: formData.name,
      ismain_user: formData.isPrimary,
      email: formData.email,
      phone_number: formData.phone,
      mobile_number: formData.mobile,
      idlogin: user ? user.id_login_user : 0, // Using current user's login id if available
      position: formData.role,
      // If editing and password fields are empty, send null so as not to update the password.
      password: id ? (formData.password.trim() === '' ? null : homemadeHash(formData.password)) : homemadeHash(formData.password),
    };

    try {
      const result = await setCustUser(userData);
      console.log('setCustUser result:', result);
      setSuccessMessage(
        id ? 'Contact modifié avec succès !' : 'Contact créé avec succès !'
      );
      setTimeout(() => {
        navigate('/contacts/list');
      }, 2000);
    } catch (err) {
      console.error('Erreur lors de setCustUser:', err);
      setError(err.message || 'Erreur lors de l\'enregistrement du contact.');
    }
  };

  return (
    <div className="register-page-container">
      <Helmet>
        <title>{id ? 'Modifier un Contact' : 'Créer un Contact'}</title>
        <meta name="description" content="Formulaire pour créer ou modifier un contact." />
      </Helmet>

      <div className="register-logo-container">
        <img src={logo} alt="Logo" className="register-logo" />
      </div>

      <div className="register-client-container">
        <h2>{id ? 'Modifier un Contact' : 'Créer un Contact'}</h2>
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

          {/* Fonction (role) */}
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

          {/* Mot de passe */}
          <div className="register-client-form-row">
            <div className="register-client-field register-client-half-width">
              <div className="register-client-input-wrapper">
                <FontAwesomeIcon icon={faLock} className="input-icon" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="register-client-input"
                  placeholder={id ? 'Nouveau mot de passe (facultatif)' : 'Mot de passe'}
                  required={!id} // Required when creating a new contact
                />
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
                  className="register-client-input"
                  placeholder={id ? 'Confirmer nouveau mot de passe' : 'Confirmer mot de passe'}
                  required={!id} // Required when creating a new contact
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
              {id ? 'Enregistrer les modifications' : 'Enregistrer'}
            </button>
          </div>
        </form>
        <div className="register-client-login-link">
          <Link to="/login">Revenir à la page de connexion</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterContact;