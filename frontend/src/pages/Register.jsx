// Register.jsx (version MUI v5, logique inchangée)

import React, { useState, forwardRef, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Helmet } from 'react-helmet';

// MUI v5
import {
  Container,
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Checkbox,
  Button,
  Grid,
  CssBaseline,
  InputAdornment,
  IconButton,
} from '@mui/material';

import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

// Import des icônes pour la visibilité du mot de passe
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// Icônes FontAwesome (import inchangé, même si non utilisées dans MUI)
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

// Autres imports internes
import './Register.css';
import logo from '../assets/logo.jpg';
import countryCodes from '../components/countryCodes';
import {
  registerUser,
  fetchSectors,
  fetchCountries,
  setCustAccount,
  setCustUser,
  addSubscription,
  addSubscriptionWithFile,
} from '../services/apiServices';
import { homemadeHash } from '../utils/hashUtils';

// Validation du numéro de téléphone international
const isValidInternationalPhone = (number) => {
  return /^\+[0-9]+$/.test(number) && number.length <= 12;
};

// Alert pour Snackbar
const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Register = () => {
  const navigate = useNavigate();
  const allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

  // État pour afficher ou masquer le mot de passe
  const [showPassword, setShowPassword] = useState(false);

  // State du formulaire
  const [formData, setFormData] = useState({
    gender: 'Mr',
    name: '',
    position: '',
    phoneFixedNumber: '',
    phoneMobileNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    address: '',
    city: '',
    country: '', // pour "Pays de résidence" (sera forcé)
    originCountry: '', // pour "Pays d'origine" (choix libre)
    companyCategory: '',
    otherCompanyCategory: '',
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

  // États pour gérer erreurs, secteurs et pays
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [sectors, setSectors] = useState([]);
  // allCountries pour "Pays d'origine"
  const [allCountries, setAllCountries] = useState([]);
  // residenceCountries pour "Pays de résidence"
  const [residenceCountries, setResidenceCountries] = useState([]);

  // Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Fermeture de la Snackbar
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  // Récupération des secteurs et des pays au chargement
  useEffect(() => {
    const fetchData = async () => {
      try {
        const sectorData = await fetchSectors();
        setSectors(sectorData);
        const countryData = await fetchCountries();
        setAllCountries(countryData);
        // Filtrer pour ne conserver que "Rep. de djibouti" pour "Pays de résidence"
        const djibouti = countryData.find(
          (country) =>
            country.symbol_fr.toLowerCase() === 'rep. de djibouti'.toLowerCase()
        );
        setResidenceCountries(djibouti ? [djibouti] : []);
        setFormData((prev) => ({
          ...prev,
          country: djibouti ? djibouti.symbol_fr : '',
        }));
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

  // Validation de type de fichier
  const validateFileType = (file) => {
    if (!file) return true;
    return allowedFileTypes.includes(file.type);
  };

  // Gestion du changement dans les champs du formulaire
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }
    if (type === 'file') {
      const file = files[0];
      if (file && !validateFileType(file)) {
        setSnackbarMessage(
          `Seulement les fichiers JPEG, JPG, PNG et PDF sont autorisés pour ${name}.`
        );
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      setFormData((prev) => ({ ...prev, [name]: file }));
      return;
    }
    if (name === 'companyType') {
      setFormData((prev) => ({
        ...prev,
        companyType: value,
        isFreeZoneCompany: value === 'zoneFranche' ? true : value === 'autre' ? false : null,
        isOtherCompany: value === 'autre',
      }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Vérification des erreurs pour les numéros de téléphone
  const phoneFixedError = formData.phoneFixedNumber !== "" && !isValidInternationalPhone(formData.phoneFixedNumber);
  const phoneMobileError = formData.phoneMobileNumber !== "" && !isValidInternationalPhone(formData.phoneMobileNumber);

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    const filesToValidate = [
      { name: 'licenseFile', file: formData.licenseFile },
      { name: 'patenteFile', file: formData.patenteFile },
      { name: 'rchFile', file: formData.rchFile },
    ];
    if (formData.isFreeZoneCompany != null) {
      for (const { name, file } of filesToValidate) {
        if (file && !validateFileType(file)) {
          setSnackbarMessage(
            `Seulement les fichiers JPEG, JPG, PNG et PDF sont autorisés pour ${name}.`
          );
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          return;
        }
      }
    }
    if (!isValidInternationalPhone(formData.phoneFixedNumber)) {
      setSnackbarMessage('Le numéro de téléphone fixe est invalide. Format international requis (max 12 caractères, commence par "+").');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    if (!isValidInternationalPhone(formData.phoneMobileNumber)) {
      setSnackbarMessage('Le numéro de téléphone portable est invalide. Format international requis (max 12 caractères, commence par "+").');
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
    try {
      const fullPhoneFixed = formData.phoneFixedNumber;
      const fullPhoneMobile = formData.phoneMobileNumber;
      const legalForm = formData.companyCategory === 'Autre' ? null : formData.companyCategory;
      const otherLegalForm = formData.companyCategory === 'Autre' ? formData.otherCompanyCategory : null;

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

      const selectedSector = sectors.find((s) => s.symbol_fr === formData.sector);
      const selectedCountry = allCountries.find((c) => c.symbol_fr === formData.country);
      const selectedHeadOfficeCountry = allCountries.find((c) => c.symbol_fr === formData.originCountry);

      const subscriptionData = {
        uploadType: 'inscriptions',
        legal_form: legalForm,
        p_other_legal_form: otherLegalForm,
        cust_name: formData.companyName,
        trade_registration_num: formData.licenseNumber || 'null',
        rchNumber: formData.rchNumber,
        licenseNumber: formData.licenseNumber,
        in_free_zone: formData.isFreeZoneCompany,
        nif: formData.nif,
        identification_number: null,
        register_number: null,
        identification_number: formData.identification_number,
        register_number: formData.register_number,
        full_address: formData.address,
        id_sector: selectedSector ? selectedSector.id_sector : null,
        other_sector: formData.otherSector || null,
        id_country: selectedCountry ? selectedCountry.id_country : null,
        id_country_headoffice: selectedHeadOfficeCountry ? selectedHeadOfficeCountry.id_country : null,
        other_legal_form: formData.otherCompanyCategory,
        statut_flag: 1,
        idlogin: 1,
        billed_cust_name: formData.billed_cust_name,
        bill_full_address: formData.bill_full_address,
        gender: formData.gender === 'Mr' ? 0 : 1,
        full_name: formData.name,
        ismain_user: true,
        email: formData.email,
        pwd: homemadeHash(formData.password, 'md5'),
        phone_number: fullPhoneFixed,
        mobile_number: fullPhoneMobile,
        position: formData.position,
        licenseFile: formData.isFreeZoneCompany ? formData.licenseFile : null,
        patenteFile: formData.isOtherCompany ? formData.patenteFile : null,
        rchFile: null,
      };

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
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Helmet>
        <title>Créer un Compte</title>
        <meta name="description" content="Inscrivez-vous pour créer un compte." />
      </Helmet>
      <CssBaseline />

      {/* Logo agrandi légèrement */}
      <Box display="flex" justifyContent="center" mb={2}>
        <Box
          component="img"
          src={logo}
          alt="Logo"
          sx={{
            width: 220,
            height: 'auto',
          }}
        />
      </Box>

      {/* Titre sans personnalisation excessive (même police que pour "Information(s) Entreprise") */}
      <Box textAlign="center" mb={2}>
        <Typography variant="h4" align="center">
          Créer son compte
        </Typography>
        {error && (
          <Typography variant="body1" color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
        {successMessage && (
          <Typography variant="body1" color="success.main" sx={{ mt: 1 }}>
            {successMessage}
          </Typography>
        )}
      </Box>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        {/* SECTION Informations Entreprise */}
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          Information(s) Entreprise
        </Typography>

        <Grid container spacing={2}>
          {/* Nom de l'entreprise */}
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Nom de l'entreprise"
              placeholder="Nom de l'entreprise"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
            />
          </Grid>

          {/* Statut juridique + champ "Autre" */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Statut juridique</InputLabel>
              <Select
                name="companyCategory"
                value={formData.companyCategory}
                label="Statut juridique"
                onChange={handleChange}
              >
                <MenuItem value="" disabled hidden>
                  Choisir
                </MenuItem>
                <MenuItem value="Auto-entrepreneur">Auto-entrepreneur</MenuItem>
                <MenuItem value="Entreprise individuelle">Entreprise individuelle</MenuItem>
                <MenuItem value="EIRL">EIRL</MenuItem>
                <MenuItem value="EURL">EURL</MenuItem>
                <MenuItem value="SARL">SARL</MenuItem>
                <MenuItem value="SAS">SAS</MenuItem>
                <MenuItem value="SASU">SASU</MenuItem>
                <MenuItem value="SA">SA</MenuItem>
                <MenuItem value="SNC">SNC</MenuItem>
                <MenuItem value="SCS">SCS</MenuItem>
                <MenuItem value="Autre">Autre</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {formData.companyCategory === 'Autre' && (
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Précisez votre statut juridique"
                name="otherCompanyCategory"
                placeholder="Précisez votre statut juridique"
                value={formData.otherCompanyCategory}
                onChange={handleChange}
              />
            </Grid>
          )}

          {/* Secteur + champ "Autres" */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Secteur</InputLabel>
              <Select
                name="sector"
                value={formData.sector}
                label="Secteur"
                onChange={handleChange}
              >
                <MenuItem value="" disabled hidden>
                  Choisir
                </MenuItem>
                {sectors.map((sector) => (
                  <MenuItem key={sector.id_sector} value={sector.symbol_fr}>
                    {sector.symbol_fr.charAt(0).toUpperCase() +
                      sector.symbol_fr.slice(1).toLowerCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {formData.sector.toLowerCase() === 'autres' && (
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Précisez votre secteur d'activité"
                name="otherSector"
                placeholder="Veuillez préciser votre secteur d'activité"
                value={formData.otherSector}
                onChange={handleChange}
              />
            </Grid>
          )}

          {/* Pays de résidence + Pays d'origine */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Pays de résidence</InputLabel>
              <Select
                name="country"
                value={formData.country}
                label="Pays de résidence"
                disabled
              >
                {residenceCountries.map((country) => (
                  <MenuItem key={country.id_country} value={country.symbol_fr}>
                    {country.symbol_fr}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Pays d'origine</InputLabel>
              <Select
                name="originCountry"
                value={formData.originCountry}
                label="Pays d'origine"
                onChange={handleChange}
              >
                <MenuItem value="" disabled hidden>
                  Choisir
                </MenuItem>
                {allCountries.map((country) => (
                  <MenuItem key={country.id_country} value={country.symbol_fr}>
                    {country.symbol_fr.charAt(0).toUpperCase() +
                      country.symbol_fr.slice(1).toLowerCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Type d'entreprise + Adresse */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Type d'entreprise</InputLabel>
              <Select
                name="companyType"
                value={formData.companyType}
                label="Type d'entreprise"
                onChange={handleChange}
              >
                <MenuItem value="" disabled hidden>
                  Choisir
                </MenuItem>
                <MenuItem value="autre">Entreprise</MenuItem>
                <MenuItem value="zoneFranche">Entreprise en zone franche</MenuItem>
                <MenuItem value="autres">Autre</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Adresse complète"
              name="address"
              placeholder="Adresse complète"
              value={formData.address}
              onChange={handleChange}
            />
          </Grid>

          {/* Champs conditionnels basés sur companyType */}
          {formData.isFreeZoneCompany && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Numéro de licence"
                  name="licenseNumber"
                  placeholder="Numéro de licence"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Licence (Fichier)
                </Typography>
                <Button variant="contained" component="label">
                  Upload
                  <input
                    hidden
                    type="file"
                    name="licenseFile"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setFormData((prev) => ({ ...prev, licenseFile: file }));
                      }
                    }}
                  />
                </Button>
                {formData.licenseFile && (
                  <Typography variant="caption" sx={{ ml: 1 }}>
                    {formData.licenseFile.name}
                  </Typography>
                )}
              </Grid>
            </>
          )}

          {formData.isOtherCompany && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="NIF"
                  name="nif"
                  placeholder="NIF"
                  value={formData.nif}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Patente (Fichier)
                </Typography>
                <Button variant="contained" component="label">
                  Upload
                  <input
                    hidden
                    type="file"
                    name="patenteFile"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setFormData((prev) => ({ ...prev, patenteFile: file }));
                      }
                    }}
                  />
                </Button>
                {formData.patenteFile && (
                  <Typography variant="caption" sx={{ ml: 1 }}>
                    {formData.patenteFile.name}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Numéro d'immatriculation RCS"
                  name="rchNumber"
                  placeholder="Numéro d'immatriculation RCS"
                  value={formData.rchNumber}
                  onChange={handleChange}
                />
              </Grid>
            </>
          )}
        </Grid>

        {/* SECTION Informations Contact */}
        <Box mt={4}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            Information(s) Contact
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Civilité</FormLabel>
              <RadioGroup row name="gender" value={formData.gender} onChange={handleChange}>
                <FormControlLabel value="Mr" control={<Radio />} label="Mr" />
                <FormControlLabel value="Mme" control={<Radio />} label="Mme" />
              </RadioGroup>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Nom"
              name="name"
              placeholder="Nom"
              value={formData.name}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Fonction"
              name="position"
              placeholder="Fonction"
              value={formData.position}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Téléphone (fixe, format international)"
              name="phoneFixedNumber"
              placeholder="+123456789"
              value={formData.phoneFixedNumber}
              onChange={handleChange}
              inputProps={{ maxLength: 12 }}
              error={phoneFixedError}
              helperText={phoneFixedError ? "Format incorrect. Doit commencer par '+' suivi uniquement de chiffres et ne pas dépasser 12 caractères." : ""}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Téléphone (portable, format international)"
              name="phoneMobileNumber"
              placeholder="+123456789"
              value={formData.phoneMobileNumber}
              onChange={handleChange}
              inputProps={{ maxLength: 12 }}
              error={phoneMobileError}
              helperText={phoneMobileError ? "Format incorrect. Doit commencer par '+' suivi uniquement de chiffres et ne pas dépasser 12 caractères." : ""}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              type="email"
              label="Email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />
          </Grid>

          {/* Mot de passe avec possibilité d'afficher/masquer */}
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              type={showPassword ? 'text' : 'password'}
              label="Mot de passe"
              name="password"
              placeholder="Mot de passe"
              value={formData.password}
              onChange={handleChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton aria-label="toggle password visibility" onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Confirmer mot de passe avec possibilité d'afficher/masquer */}
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              type={showPassword ? 'text' : 'password'}
              label="Confirmer mot de passe"
              name="confirmPassword"
              placeholder="Confirmer mot de passe"
              value={formData.confirmPassword}
              onChange={handleChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton aria-label="toggle password visibility" onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>

        {/* SECTION Conditions */}
        <Box mt={4}>
          <FormControlLabel
            control={<Checkbox name="acceptsConditions" checked={formData.acceptsConditions} onChange={handleChange} required />}
            label="Je certifie être habilité à faire des formalités export pour la société que je viens de désigner ci-dessus."
          />
          <br />
          <FormControlLabel
            control={<Checkbox name="acceptsDataProcessing" checked={formData.acceptsDataProcessing} onChange={handleChange} required />}
            label="J'accepte les conditions générales de vente"
          />
        </Box>

        <Box mt={4} textAlign="center">
          <Button variant="contained" color="primary" type="submit">
            Créer
          </Button>
        </Box>
      </Box>

      <Box mt={2} textAlign="center">
        <Typography variant="body2">
          <Box component={RouterLink} to="/login" sx={{ textDecoration: 'none', color: 'primary.main' }}>
            Revenir à la page de connexion
          </Box>
        </Typography>
      </Box>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Register;
