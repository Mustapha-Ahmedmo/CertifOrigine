import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faPhone, faMobileAlt, faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import countryCodes from '../components/countryCodes';
import { createOperator, getOperatorList } from '../services/apiServices';
import { homemadeHash } from '../utils/hashUtils';

// MUI imports
import {
  Box,
  TextField,
  Button,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormLabel,
  Select,
  InputLabel,
  Checkbox,
  Snackbar,
  Alert
} from '@mui/material';

const isValidLocalNumber = (number) => {
  return /^[0-9]{6,15}$/.test(number);
};

const RegisterOP = ({ onClose }) => {
  const { id } = useParams();
  const navigate = useNavigate();

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
    role: 'Opérateur',
    isAdmin: false,
  });

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Gestionnaire de touche pour les selects natifs avec cycle
  const handleCountryKeyDown = (field) => (event) => {
    const key = event.key.toLowerCase();
    if (key.length === 1 && /[a-z]/.test(key)) {
      const matchingCountries = countryCodes.filter(country =>
        country.name.toLowerCase().startsWith(key)
      );
      if (matchingCountries.length > 0) {
        const currentCode = formData[field];
        const currentIndex = matchingCountries.findIndex(country => country.code === currentCode);
        const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % matchingCountries.length : 0;
        setFormData((prev) => ({ ...prev, [field]: matchingCountries[nextIndex].code }));
      }
    }
  };

  useEffect(() => {
    const preloadOperatorData = async () => {
      if (id) {
        try {
          const response = await getOperatorList(`${id}`, null, null);
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
              password: '',
              confirmPassword: '',
              role: operator.roles === 1 ? 'Administrateur' : 'Opérateur avec pouvoir',
              isAdmin: operator.roles === 1,
            });
          }
        } catch (err) {
          setError('Erreur lors du chargement des données de l’opérateur.');
        }
      }
    };

    preloadOperatorData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if ((name === 'phoneFixedNumber' || name === 'phoneMobileNumber') && value !== '') {
      if (!isValidLocalNumber(value)) {
        setError(
          `Le champ ${name === 'phoneFixedNumber' ? 'téléphone fixe' : 'téléphone portable'} est invalide (6 à 15 chiffres).`
        );
      } else {
        setError('');
      }
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const toggleGender = () => {
    setFormData((prev) => ({
      ...prev,
      gender: prev.gender === 'Mr' ? 'Mme' : 'Mr',
    }));
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const totalFixed = formData.phoneFixedCountryCode + formData.phoneFixedNumber;
    const totalMobile = formData.phoneMobileCountryCode + formData.phoneMobileNumber;
    if (totalFixed.length > 12) {
      setSnackbarMessage('Le numéro de téléphone fixe dépasse la limite de 12 caractères.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    if (totalMobile.length > 12) {
      setSnackbarMessage('Le numéro de téléphone portable dépasse la limite de 12 caractères.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setSnackbarMessage('Les mots de passe ne correspondent pas');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    if (!formData.role) {
      setSnackbarMessage('Veuillez sélectionner un rôle (Administrateur ou Opérateur).');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    try {
      const operatorData = {
        id_op_user: id || 0,
        gender: formData.gender === 'Mr' ? 1 : 2,
        fullName: formData.name,
        roles: formData.role === 'Administrateur' ? 1 : 2,
        isAdmin: formData.role === 'Administrateur',
        email: formData.email,
        password: homemadeHash(formData.password, 'md5'),
        phoneNumber: totalFixed,
        mobileNumber: totalMobile,
        idLoginInsert: 1
      };

      await createOperator(operatorData);
      setSuccessMessage('Inscription de l’opérateur réussie !');
      setSnackbarMessage("L'utilisateur opérateur a bien été créé.");
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      setTimeout(() => {
        if (onClose) {
          onClose();
        } else {
          navigate('/login');
        }
      }, 2000);
    } catch (err) {
      setError(err.message);
      setSnackbarMessage(err.message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/login');
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Helmet>
        <title>Créer un Compte (Opérateur)</title>
        <meta name="description" content="Inscrivez un opérateur." />
      </Helmet>

      <Box sx={{ mb: 2, textAlign: 'center' }}>
        <h2>Créer un Compte Opérateur</h2>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button variant="outlined" onClick={toggleGender} sx={{ minWidth: 100 }}>
            {formData.gender}
          </Button>
          <TextField
            label="Nom *"
            variant="outlined"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <FormControl fullWidth variant="outlined">
            <InputLabel htmlFor="phoneFixedCountryCode-native">Indicatif fixe</InputLabel>
            <Select
              native
              label="Indicatif fixe"
              inputProps={{
                name: 'phoneFixedCountryCode',
                id: 'phoneFixedCountryCode-native',
                onKeyDown: handleCountryKeyDown('phoneFixedCountryCode')
              }}
              value={formData.phoneFixedCountryCode}
              onChange={handleChange}
            >
              {countryCodes.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.name} ({country.code})
                </option>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Téléphone fixe *"
            variant="outlined"
            name="phoneFixedNumber"
            value={formData.phoneFixedNumber}
            onChange={handleChange}
            fullWidth
            inputProps={{ maxLength: 9 }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <FormControl fullWidth variant="outlined">
            <InputLabel htmlFor="phoneMobileCountryCode-native">Indicatif portable</InputLabel>
            <Select
              native
              label="Indicatif portable"
              inputProps={{
                name: 'phoneMobileCountryCode',
                id: 'phoneMobileCountryCode-native',
                onKeyDown: handleCountryKeyDown('phoneMobileCountryCode')
              }}
              value={formData.phoneMobileCountryCode}
              onChange={handleChange}
            >
              {countryCodes.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.name} ({country.code})
                </option>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Téléphone portable *"
            variant="outlined"
            name="phoneMobileNumber"
            value={formData.phoneMobileNumber}
            onChange={handleChange}
            fullWidth
            inputProps={{ maxLength: 9 }}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <TextField
            label="Email *"
            variant="outlined"
            name="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Mot de passe *"
            variant="outlined"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Confirmer mot de passe *"
            variant="outlined"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            fullWidth
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <FormControl component="fieldset" fullWidth>
            <FormLabel component="legend">Rôle *</FormLabel>
            <RadioGroup row name="role" value={formData.role} onChange={handleChange}>
              <FormControlLabel value="Opérateur" control={<Radio />} label="Opérateur" />
              <FormControlLabel value="Opérateur avec pouvoir" control={<Radio />} label="Opérateur avec pouvoir" />
            </RadioGroup>
          </FormControl>
        </Box>

        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                name="isAdmin"
                checked={formData.isAdmin}
                onChange={handleCheckboxChange}
              />
            }
            label={formData.isAdmin ? 'Administrateur' : 'Non Administrateur'}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button variant="outlined" onClick={handleCancel}>
            Annuler
          </Button>
          <Button variant="contained" type="submit">
            {id ? 'Modifier' : 'Créer'}
          </Button>
        </Box>
      </form>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RegisterOP;
