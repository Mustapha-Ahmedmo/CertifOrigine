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
  FormLabel,
  RadioGroup,
  Radio,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Snackbar,
  Alert
} from '@mui/material';

// Fonction de validation pour un numéro de téléphone international : 
// Il doit commencer par '+' suivi uniquement de chiffres et ne pas dépasser 16 caractères.
const isValidInternationalPhone = (number) => {
  return /^(?:\+|00)[1-9][0-9]*$/.test(number) && number.length >= 8 && number.length <= 16;
};

// Fonction de validation d'un email selon le format standard
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};


// Générer un mot de passe aléatoire si nécessaire
const generateRandomPassword = (length = 12) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const RegisterOP = ({ onClose }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    gender: 'Mr', // "Mr" ou "Mme"
    name: '',
    phoneFixedNumber: '',
    phoneMobileNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: null,
    adminStatus: null,
  });

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const phoneFixedError =
    formData.phoneFixedNumber !== '' && !isValidInternationalPhone(formData.phoneFixedNumber);
  const phoneMobileError =
    formData.phoneMobileNumber !== '' && !isValidInternationalPhone(formData.phoneMobileNumber);

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
              phoneFixedNumber: operator.phone_number,
              phoneMobileNumber: operator.mobile_number,
              email: operator.email,
              password: '',
              confirmPassword: '',
              adminStatus: operator.isadmin ? 'Administrateur' : 'Non Administrateur',
              role: operator.roles === 0 ? 'Opérateur' : 'Opérateur avec pouvoir',
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
      if (!isValidInternationalPhone(value)) {
        setError(
          `Le champ ${name === 'phoneFixedNumber' ? 'téléphone fixe' : 'téléphone portable'} est invalide. Format international requis (doit commencer par '+' suivi uniquement de chiffres et ne pas dépasser 16 caractères).`
        );
      } else {
        setError('');
      }
    }
    if (name === 'email' && value !== '') {
      if (!isValidEmail(value)) {
        setError('Le format de l’email est invalide.');
      } else {
        setError('');
      }
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidEmail(formData.email)) {
      setSnackbarMessage('Le format de l’email est invalide.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    if (!isValidInternationalPhone(formData.phoneFixedNumber)) {
      setSnackbarMessage('Le numéro de téléphone fixe est invalide. Format international requis.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    if (!isValidInternationalPhone(formData.phoneMobileNumber)) {
      setSnackbarMessage('Le numéro de téléphone portable est invalide. Format international requis.');
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
      setSnackbarMessage('Veuillez sélectionner un rôle (Opérateur ou Opérateur avec pouvoir).');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    try {

      const tempPassword = generateRandomPassword(12);

      const operatorData = {
        id_op_user: id || 0,
        gender: formData.gender === 'Mr' ? 1 : 2,
        fullName: formData.name,
        roles: formData.role.trim() === 'Opérateur' ? 0 : 1,
        isAdmin: formData.adminStatus === 'Administrateur',
        email: formData.email,
        password: id ? null : homemadeHash(tempPassword, 'md5'),
        phoneNumber: formData.phoneFixedNumber,
        mobileNumber: formData.phoneMobileNumber,
        idLoginInsert: 1,
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
          navigate('/operator/operatorslist');
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
      navigate('/dashboard/operator/operatorslist');
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Helmet>
        <title>Créer un Compte (Opérateur)</title>
        <meta name="description" content="Inscrivez un opérateur." />
      </Helmet>

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
        <Box sx={{ mb: 2 }}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Genre</FormLabel>
            <RadioGroup
              row
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <FormControlLabel value="Mr" control={<Radio />} label="Mr" />
              <FormControlLabel value="Mme" control={<Radio />} label="Mme" />
            </RadioGroup>
          </FormControl>
        </Box>

        <Box sx={{ mb: 2 }}>
          <TextField
            label="Nom *"
            variant="outlined"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <TextField
            label="Téléphone fixe * (format international)"
            variant="outlined"
            name="phoneFixedNumber"
            value={formData.phoneFixedNumber}
            onChange={handleChange}
            fullWidth
            inputProps={{ maxLength: 16 }}
            error={phoneFixedError}
            helperText={
              phoneFixedError
                ? "Format incorrect. Doit commencer par '+' suivi uniquement de chiffres."
                : ""
            }
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <TextField
            label="Téléphone portable * (format international)"
            variant="outlined"
            name="phoneMobileNumber"
            value={formData.phoneMobileNumber}
            onChange={handleChange}
            fullWidth
            inputProps={{ maxLength: 16 }}
            error={phoneMobileError}
            helperText={
              phoneMobileError
                ? "Format incorrect. Doit commencer par '+' suivi uniquement de chiffres."
                : ""
            }
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <TextField
            label="Email *"
            variant="outlined"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            disabled={!!id}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Rôle</FormLabel>
            <RadioGroup
              row
              name="role"
              value={formData.role || ''}
              onChange={handleChange}
            >
              <FormControlLabel value="Opérateur" control={<Radio />} label="Opérateur" />
              <FormControlLabel value="Opérateur avec pouvoir" control={<Radio />} label="Opérateur avec pouvoir" />
            </RadioGroup>
          </FormControl>
        </Box>

        <Box sx={{ mb: 2 }}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Statut Administrateur</FormLabel>
            <RadioGroup
              row
              name="adminStatus"
              value={formData.adminStatus || ''}
              onChange={handleChange}
            >
              <FormControlLabel value="Administrateur" control={<Radio />} label="Administrateur" />
              <FormControlLabel value="Non Administrateur" control={<Radio />} label="Non Administrateur" />
            </RadioGroup>
          </FormControl>
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
