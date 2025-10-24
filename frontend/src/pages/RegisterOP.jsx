import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useParams } from 'react-router-dom';
import Autocomplete from '@mui/material/Autocomplete';
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
  Snackbar,
  Alert,
} from '@mui/material';

// --- Helpers ---
// chiffres uniquement
const onlyDigits = (s='') => String(s).replace(/\D/g, '');

// local: 4–13 chiffres
const isValidLocalPhone = (v) => /^\d{4,13}$/.test(onlyDigits(v));

// téléphone international (édition)
const isValidInternationalPhone = (number) => {
  return /^(?:\+|00)[1-9][0-9]*$/.test(number) && number.length >= 8 && number.length <= 16;
};
// email
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
// mot de passe aléatoire
const generateRandomPassword = (length = 12) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) password += chars.charAt(Math.floor(Math.random() * chars.length));
  return password;
};
// normalisation recherche (pays)
const normalize = (s) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
// options indicatifs
const dialOptions = countryCodes.map((c) => ({ name: c.name, code: c.code, flag: c.flag }));

const RegisterOP = ({ onClose }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    gender: 'Mr',
    name: '',

    // --- Edition (format international) ---
    phoneFixedNumber: '',
    phoneMobileNumber: '',

    // --- Création (indicatif + local) ---
    phoneFixedCode: '+253',
    phoneFixedLocal: '',
    phoneMobileCode: '+253',
    phoneMobileLocal: '',

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

  // erreurs (édition)
  const phoneFixedError =
    formData.phoneFixedNumber !== '' && !isValidInternationalPhone(formData.phoneFixedNumber);
  const phoneMobileError =
    formData.phoneMobileNumber !== '' && !isValidInternationalPhone(formData.phoneMobileNumber);

  // erreurs (création)
  const localFixedError =
  formData.phoneFixedLocal !== '' && !isValidLocalPhone(formData.phoneFixedLocal);
const localMobileError =
  formData.phoneMobileLocal !== '' && !isValidLocalPhone(formData.phoneMobileLocal);

  // Préchargement en mode édition
  useEffect(() => {
    const preloadOperatorData = async () => {
      if (!id) return;
      try {
        const response = await getOperatorList(`${id}`, null, null);
        if (response.data && response.data.length > 0) {
          const operator = response.data[0];
          setFormData((prev) => ({
            ...prev,
            gender: operator.gender === 1 ? 'Mr' : 'Mme',
            name: operator.full_name,
            phoneFixedNumber: operator.phone_number,
            phoneMobileNumber: operator.mobile_number,
            email: operator.email,
            password: '',
            confirmPassword: '',
            adminStatus: operator.isadmin ? 'Administrateur' : 'Non Administrateur',
            role: operator.roles === 0 ? 'Opérateur' : 'Opérateur avec pouvoir',
          }));
        }
      } catch {
        setError('Erreur lors du chargement des données de l’opérateur.');
      }
    };
    preloadOperatorData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // contrôles "live"
    if ((name === 'phoneFixedNumber' || name === 'phoneMobileNumber') && value !== '') {
      setError(
        isValidInternationalPhone(value)
          ? ''
          : `Le champ ${name === 'phoneFixedNumber' ? 'téléphone fixe' : 'téléphone portable'} est invalide. Format international requis (doit commencer par '+' ou '00', uniquement des chiffres).`
      );
    }
    if (name === 'email' && value !== '') {
      setError(isValidEmail(value) ? '' : 'Le format de l’email est invalide.');
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // email commun
    if (!isValidEmail(formData.email)) {
      setSnackbarMessage('Le format de l’email est invalide.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    // validations selon mode
    if (id) {
      // --- Edition : international ---
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
    } else {
      // --- Création : indicatif + local ---
      if (!isValidLocalPhone(formData.phoneFixedLocal)) {
        setSnackbarMessage('Numéro fixe invalide : 4 à 13 chiffres (sans indicatif).');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      if (!isValidLocalPhone(formData.phoneMobileLocal)) {
        setSnackbarMessage('Numéro portable invalide : 4 à 13 chiffres (sans indicatif).');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
    }

    if (!formData.role) {
      setSnackbarMessage('Veuillez sélectionner un rôle (Opérateur ou Opérateur avec pouvoir).');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      // concat selon mode
      const stripTrunk = (s) => onlyDigits(s).replace(/^0+/, '');

      const phoneFixedToSend  = id ? formData.phoneFixedNumber  : `${formData.phoneFixedCode}${stripTrunk(formData.phoneFixedLocal)}`;
const phoneMobileToSend = id ? formData.phoneMobileNumber : `${formData.phoneMobileCode}${stripTrunk(formData.phoneMobileLocal)}`;
      const tempPassword = generateRandomPassword(12);

      const operatorData = {
        id_op_user: id || 0,
        gender: formData.gender === 'Mr' ? 1 : 2,
        fullName: formData.name,
        roles: formData.role.trim() === 'Opérateur' ? 0 : 1,
        isAdmin: formData.adminStatus === 'Administrateur',
        email: formData.email,
        password: id ? null : homemadeHash(tempPassword, 'md5'),
        phoneNumber: phoneFixedToSend,
        mobileNumber: phoneMobileToSend,
        idLoginInsert: 1,
      };

      await createOperator(operatorData);

      setSuccessMessage('Inscription de l’opérateur réussie !');
      setSnackbarMessage("L'utilisateur opérateur a bien été créé.");
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      setTimeout(() => {
        if (onClose) onClose();
        else navigate('/operator/operatorslist');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Erreur lors de la création.');
      setSnackbarMessage(err.message || 'Erreur lors de la création.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleCancel = () => {
    if (onClose) onClose();
    else navigate('/dashboard/operator/operatorslist');
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
            <RadioGroup row name="gender" value={formData.gender} onChange={handleChange}>
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

        {/* --- Téléphones --- */}
        {id ? (
          // ======= MODE EDITION : champs internationaux =======
          <>
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
                    ? "Format incorrect. Doit commencer par '+' ou '00' et contenir uniquement des chiffres."
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
                    ? "Format incorrect. Doit commencer par '+' ou '00' et contenir uniquement des chiffres."
                    : ""
                }
              />
            </Box>
          </>
        ) : (
          // ======= MODE CREATION : Autocomplete d'indicatif + numéro local =======
          <>
            {/* Fixe — Indicatif */}
            <Box sx={{ mb: 2 }}>
              <Autocomplete
                options={dialOptions}
                value={dialOptions.find((o) => o.code === formData.phoneFixedCode) || null}
                onChange={(_, val) => {
                  if (val) setFormData((p) => ({ ...p, phoneFixedCode: val.code }));
                }}
                getOptionLabel={(opt) => (opt ? opt.code : '')}
                filterOptions={(options, state) => {
                  const q = state.inputValue.trim();
                  const nq = normalize(q.replace('+', ''));
                  return options.filter((o) => {
                    const name = normalize(o.name);
                    const digits = o.code.replace('+', '');
                    return name.includes(nq) || digits.startsWith(nq) || (`+${digits}`).startsWith(q);
                  });
                }}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Box display="flex" alignItems="center" gap={8}>
                      <span>{option.flag}</span>
                      <span>{option.name}</span>
                      <span>({option.code})</span>
                    </Box>
                  </li>
                )}
                isOptionEqualToValue={(o, v) => o.code === v.code}
                renderInput={(params) => {
                  const current = dialOptions.find((o) => o.code === formData.phoneFixedCode);
                  return (
                    <TextField
                      {...params}
                      label="Indicatif (fixe)"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: current ? <Box mr={1}>{current.flag}</Box> : params.InputProps.startAdornment,
                      }}
                      fullWidth
                    />
                  );
                }}
                autoHighlight
                disableClearable
                fullWidth
              />
            </Box>

            {/* Fixe — Numéro local */}
            <Box sx={{ mb: 2 }}>
            <TextField
  label="Numéro fixe *"
  name="phoneFixedLocal"
  value={formData.phoneFixedLocal}
  onChange={(e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 13);
    setFormData((p) => ({ ...p, phoneFixedLocal: digits }));
  }}
  fullWidth
  inputProps={{ maxLength: 13, inputMode: 'numeric' }}
  error={localFixedError}
  helperText={localFixedError ? '4 à 13 chiffres (sans indicatif)' : ''}
/>
            </Box>

            {/* Mobile — Indicatif */}
            <Box sx={{ mb: 2 }}>
              <Autocomplete
                options={dialOptions}
                value={dialOptions.find((o) => o.code === formData.phoneMobileCode) || null}
                onChange={(_, val) => {
                  if (val) setFormData((p) => ({ ...p, phoneMobileCode: val.code }));
                }}
                getOptionLabel={(opt) => (opt ? opt.code : '')}
                filterOptions={(options, state) => {
                  const q = state.inputValue.trim();
                  const nq = normalize(q.replace('+', ''));
                  return options.filter((o) => {
                    const name = normalize(o.name);
                    const digits = o.code.replace('+', '');
                    return name.includes(nq) || digits.startsWith(nq) || (`+${digits}`).startsWith(q);
                  });
                }}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Box display="flex" alignItems="center" gap={8}>
                      <span>{option.flag}</span>
                      <span>{option.name}</span>
                      <span>({option.code})</span>
                    </Box>
                  </li>
                )}
                isOptionEqualToValue={(o, v) => o.code === v.code}
                renderInput={(params) => {
                  const current = dialOptions.find((o) => o.code === formData.phoneMobileCode);
                  return (
                    <TextField
                      {...params}
                      label="Indicatif (portable)"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: current ? <Box mr={1}>{current.flag}</Box> : params.InputProps.startAdornment,
                      }}
                      fullWidth
                    />
                  );
                }}
                autoHighlight
                disableClearable
                fullWidth
              />
            </Box>

            {/* Mobile — Numéro local */}
            <Box sx={{ mb: 2 }}>
            <TextField
  label="Numéro portable *"
  name="phoneMobileLocal"
  value={formData.phoneMobileLocal}
  onChange={(e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 13);
    setFormData((p) => ({ ...p, phoneMobileLocal: digits }));
  }}
  fullWidth
  inputProps={{ maxLength: 13, inputMode: 'numeric' }}
  error={localMobileError}
  helperText={localMobileError ? '4 à 13 chiffres (sans indicatif)' : ''}
/>
            </Box>
          </>
        )}

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
            <RadioGroup row name="role" value={formData.role || ''} onChange={handleChange}>
              <FormControlLabel value="Opérateur" control={<Radio />} label="Opérateur" />
              <FormControlLabel value="Opérateur avec pouvoir" control={<Radio />} label="Opérateur avec pouvoir" />
            </RadioGroup>
          </FormControl>
        </Box>

        <Box sx={{ mb: 2 }}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Statut Administrateur</FormLabel>
            <RadioGroup row name="adminStatus" value={formData.adminStatus || ''} onChange={handleChange}>
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

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RegisterOP;
