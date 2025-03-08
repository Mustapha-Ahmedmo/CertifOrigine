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
// Il doit commencer par '+' suivi uniquement de chiffres et ne pas dépasser 12 caractères.
const isValidInternationalPhone = (number) => {
  return /^\+[0-9]+$/.test(number) && number.length <= 12;
};

const RegisterOP = ({ onClose }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  // On conserve dans l'état le numéro complet international et on ajoute un champ pour le statut admin.
  const [formData, setFormData] = useState({
    gender: 'Mr', // "Mr" ou "Mme"
    name: '',
    phoneFixedNumber: '',
    phoneMobileNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Pour le rôle, les options sont "Opérateur" et "Opérateur avec pouvoir"
    role: 'Opérateur',
    // Pour le statut admin, les options sont "Administrateur" et "Non Administrateur"
    adminStatus: 'Non Administrateur',
  });

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Calcul des indicateurs d'erreur pour les champs de téléphone
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
              // On suppose que les numéros stockés sont déjà au format international.
              phoneFixedNumber: operator.phone_number,
              phoneMobileNumber: operator.mobile_number,
              email: operator.email,
              password: '',
              confirmPassword: '',
              // Pour le rôle, on garde l'option initiale "Opérateur"
              role: 'Opérateur',
              // Pour le statut admin, on déduit en fonction de operator.roles : ici on suppose que 1 signifie administrateur.
              adminStatus: operator.roles === 1 ? 'Administrateur' : 'Non Administrateur',
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
    // Pour les champs de téléphone, validation du format international
    if ((name === 'phoneFixedNumber' || name === 'phoneMobileNumber') && value !== '') {
      if (!isValidInternationalPhone(value)) {
        setError(
          `Le champ ${name === 'phoneFixedNumber' ? 'téléphone fixe' : 'téléphone portable'} est invalide. Format international requis (doit commencer par '+' suivi uniquement de chiffres et ne pas dépasser 12 caractères).`
        );
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

    // Validation des numéros de téléphone
    if (!isValidInternationalPhone(formData.phoneFixedNumber)) {
      setSnackbarMessage('Le numéro de téléphone fixe est invalide. Format international requis (doit commencer par "+" suivi uniquement de chiffres et ne pas dépasser 12 caractères).');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    if (!isValidInternationalPhone(formData.phoneMobileNumber)) {
      setSnackbarMessage('Le numéro de téléphone portable est invalide. Format international requis (doit commencer par "+" suivi uniquement de chiffres et ne pas dépasser 12 caractères).');
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
      const operatorData = {
        id_op_user: id || 0,
        gender: formData.gender === 'Mr' ? 1 : 2,
        fullName: formData.name,
        // On définit "roles" en fonction du rôle sélectionné :
        // Par exemple, "Opérateur" = 2, "Opérateur avec pouvoir" = 3.
        roles: formData.role === 'Opérateur' ? 2 : 3,
        // Le statut administrateur est défini à partir du radio group adminStatus.
        isAdmin: formData.adminStatus === 'Administrateur',
        email: formData.email,
        password: homemadeHash(formData.password, 'md5'),
        phoneNumber: formData.phoneFixedNumber,
        mobileNumber: formData.phoneMobileNumber,
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
        {/* Genre via RadioGroup */}
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

        {/* Téléphone fixe */}
        <Box sx={{ mb: 2 }}>
          <TextField
            label="Téléphone fixe * (format international)"
            variant="outlined"
            name="phoneFixedNumber"
            value={formData.phoneFixedNumber}
            onChange={handleChange}
            fullWidth
            inputProps={{ maxLength: 12 }}
            error={phoneFixedError}
            helperText={
              phoneFixedError
                ? "Format incorrect. Doit commencer par '+' suivi uniquement de chiffres et ne pas dépasser 12 caractères."
                : ""
            }
          />
        </Box>

        {/* Téléphone portable */}
        <Box sx={{ mb: 2 }}>
          <TextField
            label="Téléphone portable * (format international)"
            variant="outlined"
            name="phoneMobileNumber"
            value={formData.phoneMobileNumber}
            onChange={handleChange}
            fullWidth
            inputProps={{ maxLength: 12 }}
            error={phoneMobileError}
            helperText={
              phoneMobileError
                ? "Format incorrect. Doit commencer par '+' suivi uniquement de chiffres et ne pas dépasser 12 caractères."
                : ""
            }
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

        {/* Rôle via RadioGroup */}
        <Box sx={{ mb: 2 }}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Rôle</FormLabel>
            <RadioGroup
              row
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <FormControlLabel value="Opérateur" control={<Radio />} label="Opérateur" />
              <FormControlLabel value="Opérateur avec pouvoir" control={<Radio />} label="Opérateur avec pouvoir" />
            </RadioGroup>
          </FormControl>
        </Box>

        {/* Statut administrateur via RadioGroup */}
        <Box sx={{ mb: 2 }}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Statut Administrateur</FormLabel>
            <RadioGroup
              row
              name="adminStatus"
              value={formData.adminStatus}
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
