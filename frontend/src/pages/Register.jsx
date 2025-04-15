import React, { useState, forwardRef, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Helmet } from 'react-helmet';
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
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
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

// Fonction de validation pour un numéro de téléphone international
const isValidInternationalPhone = (number) => {
  return /^\+[0-9]+$/.test(number) && number.length <= 12;
};

// Fonction de validation pour un email au format standard
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Register = () => {
  const navigate = useNavigate();
  const allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

  const [showPassword, setShowPassword] = useState(false);

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
    country: '',
    originCountry: '',
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

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [sectors, setSectors] = useState([]);
  const [allCountries, setAllCountries] = useState([]);
  const [residenceCountries, setResidenceCountries] = useState([]);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sectorData = await fetchSectors();
        setSectors(sectorData);
        const countryData = await fetchCountries();
        setAllCountries(countryData);
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

  const validateFileType = (file) => {
    if (!file) return true;
    return allowedFileTypes.includes(file.type);
  };

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

  const phoneFixedError =
    formData.phoneFixedNumber !== "" && !isValidInternationalPhone(formData.phoneFixedNumber);
  const phoneMobileError =
    formData.phoneMobileNumber !== "" && !isValidInternationalPhone(formData.phoneMobileNumber);

  // Styles communs pour les champs
  const commonFieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      background: 'linear-gradient(135deg, #fff, #f9f9f9)',
      '&.Mui-focused fieldset': {
        borderColor: '#DCAF26',
      },
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#DCAF26',
    },
  };

  const commonButtonSx = {
    backgroundColor: '#DCAF26',
    '&:hover': { backgroundColor: '#DCAF26' },
  };

  const commonRadioSx = {
    color: '#DCAF26',
    '&.Mui-checked': { color: '#DCAF26' },
  };

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

    // Check if required documents are uploaded
    if (formData.isFreeZoneCompany && !formData.licenseFile) {
      setSnackbarMessage("Veuillez télécharger le fichier de licence pour les entreprises en zone franche.");
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    if (formData.isOtherCompany && !formData.patenteFile) {
      setSnackbarMessage("Veuillez télécharger le fichier de patente pour les entreprises de type Entreprise.");
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    if (!isValidEmail(formData.email)) {
      setSnackbarMessage("Le format de l'email est invalide. Exemple : user@example.com");
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
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
        in_free_zone: formData.isFreeZoneCompany,
        trade_registration_num: formData.nif || 'null',
        identification_number: formData.licenseNumber || 'null',
        register_number: formData.rchNumber || 'null',
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

      <Box textAlign="center" mb={2}>
        <Typography variant="h4" align="center" sx={{ color: '#DCAF26' }}>
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
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#DCAF26' }}>
          Information(s) Entreprise
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Nom de l'entreprise"
              placeholder="Nom de l'entreprise"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              sx={commonFieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required sx={commonFieldSx}>
              <InputLabel>Statut juridique</InputLabel>
              <Select
                name="companyCategory"
                value={formData.companyCategory}
                label="Statut juridique"
                onChange={handleChange}
                sx={commonFieldSx}
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
                sx={commonFieldSx}
              />
            </Grid>
          )}

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required sx={commonFieldSx}>
              <InputLabel>Secteur</InputLabel>
              <Select
                name="sector"
                value={formData.sector}
                label="Secteur"
                onChange={handleChange}
                sx={commonFieldSx}
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
                sx={commonFieldSx}
              />
            </Grid>
          )}

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required sx={commonFieldSx}>
              <InputLabel>Pays de résidence</InputLabel>
              <Select
                name="country"
                value={formData.country}
                label="Pays de résidence"
                disabled
                sx={commonFieldSx}
              >
                {residenceCountries.map((country) => (
                  <MenuItem key={country.id_country} value={country.symbol_fr}>
                    {country.symbol_fr.toLowerCase() === 'rep. de djibouti'
                      ? 'République de Djibouti'
                      : country.symbol_fr}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required sx={commonFieldSx}>
              <InputLabel>Pays d'origine</InputLabel>
              <Select
                name="originCountry"
                value={formData.originCountry}
                label="Pays d'origine"
                onChange={handleChange}
                sx={commonFieldSx}
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

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required sx={commonFieldSx}>
              <InputLabel>Type d'entreprise</InputLabel>
              <Select
                name="companyType"
                value={formData.companyType}
                label="Type d'entreprise"
                onChange={handleChange}
                sx={commonFieldSx}
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
              sx={commonFieldSx}
            />
          </Grid>

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
                  sx={commonFieldSx}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Licence (Fichier)
                </Typography>
                <Button variant="contained" component="label" sx={commonButtonSx}>
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
                  sx={commonFieldSx}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Patente (Fichier)
                </Typography>
                <Button variant="contained" component="label" sx={commonButtonSx}>
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
                  sx={commonFieldSx}
                />
              </Grid>
            </>
          )}
        </Grid>

        <Box mt={4}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#DCAF26' }}>
            Information(s) Contact
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Civilité</FormLabel>
              <RadioGroup row name="gender" value={formData.gender} onChange={handleChange}>
                <FormControlLabel value="Mr" control={<Radio sx={commonRadioSx} />} label="Mr" />
                <FormControlLabel value="Mme" control={<Radio sx={commonRadioSx} />} label="Mme" />
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
              sx={commonFieldSx}
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
              sx={commonFieldSx}
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
              helperText={
                phoneFixedError
                  ? "Format incorrect. Doit commencer par '+' suivi uniquement de chiffres et ne pas dépasser 12 caractères."
                  : ""
              }
              sx={commonFieldSx}
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
              helperText={
                phoneMobileError
                  ? "Format incorrect. Doit commencer par '+' suivi uniquement de chiffres et ne pas dépasser 12 caractères."
                  : ""
              }
              sx={commonFieldSx}
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
              sx={commonFieldSx}
              error={formData.email !== '' && !isValidEmail(formData.email)}
              helperText={
                formData.email !== '' && !isValidEmail(formData.email)
                  ? "Format incorrect. Exemple : user@example.com"
                  : ""
              }
            />
          </Grid>

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
              sx={commonFieldSx}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

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
              sx={commonFieldSx}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>

        <Box mt={4}>
          <FormControlLabel
            control={
              <Checkbox
                name="acceptsConditions"
                checked={formData.acceptsConditions}
                onChange={handleChange}
                required
              />
            }
            label="Je certifie être habilité à faire des formalités export pour la société que je viens de désigner ci-dessus."
          />
          <br />
          <FormControlLabel
            control={
              <Checkbox
                name="acceptsDataProcessing"
                checked={formData.acceptsDataProcessing}
                onChange={handleChange}
                required
              />
            }
            label="J'accepte les conditions générales de vente"
          />
        </Box>

        <Box mt={4} textAlign="center">
          <Button variant="contained" type="submit" sx={commonButtonSx}>
            Créer
          </Button>
        </Box>
      </Box>

      <Box mt={2} textAlign="center">
        <Typography variant="body2">
          <Box component={RouterLink} to="/login" sx={{ textDecoration: 'none', color: '#DCAF26' }}>
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
