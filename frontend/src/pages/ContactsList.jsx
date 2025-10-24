import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  getCustUsersByAccount,
  deleteCustUser,
  setCustSmallUser,
  reactivateCustUser,
} from '../services/apiServices';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import {
  Box,
  Typography,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  InputLabel,
  Select,
  useTheme,
  useMediaQuery,
  FormControlLabel,
  Checkbox,
  FormControl,
  RadioGroup,
  Radio,
  Toolbar,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import './ContactsList.css';
import countryCodes from '../components/countryCodes';

/* =========================
   Helpers & validations
   ========================= */
const GOLD = '#DCAF26';

const onlyDigits = (s = '') => String(s).replace(/\D+/g, '');

// Construit E.164 : +code + numéro national (sans zéros de tête)
const joinE164 = (code, national) => {
  const cleanCode = String(code || '').trim(); // ex: +33
  const natNoTrunk = onlyDigits(national).replace(/^0+/, '');
  return `${cleanCode}${natNoTrunk}`;
};

// Numéro national : 4–13 chiffres
const isValidNational = (n) => /^\d{4,13}$/.test(onlyDigits(n));

// E.164 (international) : + suivi de 6–15 chiffres
const isValidInternationalPhone = (v) => /^\+[0-9]{6,15}$/.test(String(v || ''));

// Email standard
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Autocomplete helpers
const normalize = (s) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
const dialOptions = countryCodes.map((c) => ({ name: c.name, code: c.code, flag: c.flag }));

// Mot de passe aléatoire (si backend l’utilise à la création)
const generateRandomPassword = (length = 12) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) password += chars.charAt(Math.floor(Math.random() * chars.length));
  return password;
};

const ContactsList = () => {
  const { user } = useSelector((state) => state.auth);
  const custAccountId = user?.id_cust_account;
  const isMainUser = Boolean(user?.role_user);

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Recherche
  const [searchTerm, setSearchTerm] = useState('');

  // Filtre actif/inactif (même logique que l’autre fichier)
  const [radioValue, setRadioValue] = useState('active');

  // Modale d’ajout/édition
  const [showModal, setShowModal] = useState(false);
  const [modalError, setModalError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Contact courant (création vs édition)
  const [currentContact, setCurrentContact] = useState({
    id_cust_user: 0,
    full_name: '',
    position: '',
    email: '',
    // ÉDITION: E.164 direct
    phone_number: '',
    mobile_number: '',
    // CRÉATION: indicatif + national
    phone_code: '+253',
    phone_national: '',
    mobile_code: '+253',
    mobile_national: '',
    ismain_user: false,
    password: '',
    confirmPassword: '',
  });

  // Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Responsive
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // --- menu Actions (⋮) ---
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const handleMenuOpen = (e, contact) => {
    setAnchorEl(e.currentTarget);
    setSelectedRow(contact);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const StatusFilter = () =>
    isSmallScreen ? (
      <FormControl
        size="small"
        sx={{
          minWidth: 180,
          '& .MuiOutlinedInput-notchedOutline': { borderColor: GOLD },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: GOLD },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: GOLD },
          '& .MuiInputLabel-root.Mui-focused': { color: GOLD },
          '& .MuiSelect-icon': { color: GOLD },
        }}
      >
        <InputLabel id="status-label">Filtrer</InputLabel>
        <Select
          labelId="status-label"
          id="status-select"
          value={radioValue}
          label="Filtrer"
          onChange={(e) => setRadioValue(e.target.value)}
          sx={{ color: '#000' }}
          MenuProps={{
            MenuListProps: {
              sx: {
                '& .Mui-selected': { backgroundColor: '#F4E6B4 !important', color: '#000' },
                '& .Mui-selected:hover': { backgroundColor: '#EBD68A !important' },
              },
            },
          }}
        >
          <MenuItem value="active" sx={{ '&.Mui-selected': { backgroundColor: '#F4E6B4', color: '#000' } }}>
            Contacts Actifs
          </MenuItem>
          <MenuItem value="inactive" sx={{ '&.Mui-selected': { backgroundColor: '#F4E6B4', color: '#000' } }}>
            Contacts Désactivés
          </MenuItem>
        </Select>
      </FormControl>
    ) : (
      <FormControl component="fieldset">
        <RadioGroup row name="contactsFilter" value={radioValue} onChange={(e) => setRadioValue(e.target.value)}>
          <FormControlLabel value="active" control={<Radio />} label="Contacts Actifs" />
          <FormControlLabel value="inactive" control={<Radio />} label="Contacts Désactivés" />
        </RadioGroup>
      </FormControl>
    );

  const buildIsactiveCU = () => (radioValue === 'active' ? 'true' : 'false');

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        if (!custAccountId) {
          setError('Aucun compte client trouvé.');
          setLoading(false);
          return;
        }
        setLoading(true);
        const isactiveCUParam = buildIsactiveCU();
        const result = await getCustUsersByAccount(
          custAccountId,
          null,   // statutflag
          'true', // compte client actif
          isactiveCUParam,
          null
        );
        setContacts(result.data || []);
      } catch (err) {
        console.error('Error fetching contacts:', err);
        setError('Une erreur est survenue lors de la récupération des contacts.');
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, [custAccountId, radioValue]);

  // Ouvrir ajout
  const handleOpenAddModal = () => {
    setModalError('');
    setIsEditing(false);
    setCurrentContact({
      id_cust_user: 0,
      full_name: '',
      position: '',
      email: '',
      phone_number: '',
      mobile_number: '',
      phone_code: '+253',
      phone_national: '',
      mobile_code: '+253',
      mobile_national: '',
      ismain_user: false,
      password: '',
      confirmPassword: '',
    });
    setShowModal(true);
  };

  // Ouvrir édition
  const handleOpenEditModal = (contact) => {
    setModalError('');
    setIsEditing(true);
    setCurrentContact({
      id_cust_user: contact.id_cust_user,
      full_name: contact.full_name || '',
      position: contact.position || '',
      email: contact.email || '',
      phone_number: contact.phone_number || '',
      mobile_number: contact.mobile_number || '',
      phone_code: '+253',      // non utilisés en édition
      phone_national: '',
      mobile_code: '+253',     // non utilisés en édition
      mobile_national: '',
      ismain_user: contact.ismain_user || false,
      password: '',
      confirmPassword: '',
    });
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleChange = (field, value) => {
    setCurrentContact((prev) => ({ ...prev, [field]: value }));
  };

  // Sauvegarder (même logique que l’autre fichier)
  const handleSaveContact = async () => {
    const {
      id_cust_user,
      full_name,
      position,
      email,
      phone_number,
      mobile_number,
      phone_code,
      phone_national,
      mobile_code,
      mobile_national,
      ismain_user,
      password,
      confirmPassword,
    } = currentContact;

    // Champs obligatoires
    if (!full_name || !email) {
      setModalError("Veuillez renseigner au minimum le nom et l'email du contact.");
      return;
    }
    if (!isValidEmail(email)) {
      setModalError("Le format de l'email est invalide.");
      return;
    }

    // Téléphones (création vs édition)
    let phone_number_to_send = phone_number;
    let mobile_number_to_send = mobile_number;

    if (isEditing) {
      // ÉDITION : E.164 direct
      if (!isValidInternationalPhone(phone_number_to_send)) {
        setModalError("Le téléphone fixe doit être au format international (ex. +123456...).");
        return;
      }
      if (!isValidInternationalPhone(mobile_number_to_send)) {
        setModalError("Le téléphone portable doit être au format international (ex. +123456...).");
        return;
      }
      if (password || confirmPassword) {
        if (password !== confirmPassword) {
          setModalError('Les mots de passe ne correspondent pas.');
          return;
        }
      }
    } else {
      // CRÉATION : indicatif + national
      if (!phone_code) {
        setModalError("Veuillez choisir l’indicatif du téléphone fixe.");
        return;
      }
      if (!mobile_code) {
        setModalError("Veuillez choisir l’indicatif du téléphone portable.");
        return;
      }
      if (!isValidNational(phone_national)) {
        setModalError('Téléphone fixe : 4 à 13 chiffres (sans indicatif).');
        return;
      }
      if (!isValidNational(mobile_national)) {
        setModalError('Téléphone portable : 4 à 13 chiffres (sans indicatif).');
        return;
      }
      phone_number_to_send = joinE164(phone_code, phone_national);
      mobile_number_to_send = joinE164(mobile_code, mobile_national);
      if (!isValidInternationalPhone(phone_number_to_send)) {
        setModalError('Téléphone fixe invalide (format international).');
        return;
      }
      if (!isValidInternationalPhone(mobile_number_to_send)) {
        setModalError('Téléphone portable invalide (format international).');
        return;
      }
    }

    try {
      setModalError('');

      const payload = {
        id_cust_user: isEditing ? id_cust_user : 0,
        id_cust_account: custAccountId,
        gender: 0,
        full_name,
        position,
        email,
        phone_number: phone_number_to_send,
        mobile_number: mobile_number_to_send,
        pwd: isEditing ? (password?.trim() ? password.trim() : null) : null,
        ismain_user,
        statut_flag: 1, // actif
        id_login_insert: user?.id_login_user || 1,
        id_login_modify: isEditing ? (user?.id_login_user || 1) : null,
        password: isEditing ? null : generateRandomPassword(), // si utilisé côté backend
        idlogin: user?.id_login_user || 1,
      };

      await setCustSmallUser(payload);

      // Recharge selon le filtre actif/inactif
      const refreshed = await getCustUsersByAccount(
        custAccountId,
        null,
        'true',
        buildIsactiveCU(),
        null
      );
      setContacts(refreshed.data || []);
      setShowModal(false);
    } catch (err) {
      console.error('Erreur lors de la création/édition du contact:', err);
      setModalError(isEditing ? 'Impossible de modifier ce contact.' : 'Impossible de créer ce contact.');
    }
  };

  const handleReactivate = async (contactId) => {
    if (!window.confirm('Voulez-vous vraiment réactiver ce contact ?')) return;
    try {
      await reactivateCustUser(contactId);
      setContacts((prev) => prev.filter((c) => c.id_cust_user !== contactId));
      setSnackbarMessage('Contact réactivé avec succès.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Erreur lors de la réactivation du contact:', err);
      alert('Impossible de réactiver ce contact.');
    }
  };

  const handleDelete = async (contactId) => {
    if (!window.confirm('Voulez-vous vraiment désactiver ce contact ?')) return;
    try {
      await deleteCustUser(contactId);
      setContacts((prev) => prev.filter((c) => c.id_cust_user !== contactId));
      alert('Contact désactivé avec succès.');
    } catch (err) {
      console.error('Erreur lors de la suppression du contact:', err);
      alert('Impossible de désactiver ce contact.');
    }
  };

  // Filtrage recherche
  const searchFilteredContacts = contacts.filter((contact) => {
    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;
    const fields = [
      contact.full_name,
      contact.position,
      contact.email,
      contact.phone_number,
      contact.mobile_number,
    ]
      .filter(Boolean)
      .map((v) => v.toLowerCase());
    return fields.some((f) => f.includes(search));
  });

  const renderMobileCards = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {searchFilteredContacts.map((contact) => (
        <Paper key={contact.id_cust_user} sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="body2"><strong>Nom : </strong> {contact.full_name}</Typography>
          <Typography variant="body2"><strong>Fonction : </strong> {contact.position}</Typography>
          <Typography variant="body2">
            <strong>Email : </strong>
            <a href={`mailto:${contact.email}`} style={{ color: '#DCAF26' }}>{contact.email}</a>
          </Typography>
          <Typography variant="body2"><strong>Tél : </strong> {contact.phone_number}</Typography>
          <Typography variant="body2"><strong>Portable : </strong> {contact.mobile_number}</Typography>
          <Typography variant="body2"><strong>Contact Principal : </strong> {contact.ismain_user ? 'Oui' : 'Non'}</Typography>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 1 }}>
            <IconButton onClick={(e) => handleMenuOpen(e, contact)} sx={{ p: 0 }}>
              <FontAwesomeIcon icon={faEllipsisV} style={{ color: '#DCAF26' }} />
            </IconButton>
          </Box>
        </Paper>
      ))}
      {searchFilteredContacts.length === 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography align="center">Aucun contact trouvé.</Typography>
        </Paper>
      )}
    </Box>
  );

  if (loading) {
    return <Box sx={{ ml: { xs: 0, md: '240px' }, p: 3 }}>Chargement en cours...</Box>;
  }
  if (error) {
    return (
      <Box sx={{ ml: { xs: 0, md: '240px' }, p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ ml: { xs: 0, md: '240px' }, maxWidth: '1200px', mx: 'auto', px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
      {/* Entête */}
      <Paper elevation={1} sx={{ mb: 2, borderRadius: 2 }}>
        <Toolbar>
          <Typography
            variant="button"
            sx={(theme) => ({
              ...theme.typography.button,
              textTransform: 'uppercase',
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
            })}
          >
            LISTE DES CONTACTS
          </Typography>
          <Button
            variant="contained"
            onClick={handleOpenAddModal}
            disabled={!isMainUser}
            size="small"
            sx={{
              backgroundColor: '#DCAF26',
              fontSize: { xs: '0.7rem', sm: '0.85rem' },
              px: { xs: 1, sm: 2 },
              py: { xs: 0.5, sm: 1 },
              borderRadius: 2,
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          >
            <FontAwesomeIcon icon={faPlus} style={{ marginRight: 8 }} />
            Ajouter un contact
          </Button>
        </Toolbar>
      </Paper>

      {/* Barre de recherche */}
      <Box mb={2} display="flex" alignItems="center" gap={2}>
        <Typography>Rechercher :</Typography>
        <TextField
          variant="outlined"
          placeholder="Tapez un nom, email, téléphone..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: 300 }}
        />
        <StatusFilter />
      </Box>

      {/* Affichage conditionnel */}
      {isSmallScreen ? (
        renderMobileCards()
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Fonction</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Tél</TableCell>
                  <TableCell>Portable</TableCell>
                  <TableCell>Contact Principal</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {searchFilteredContacts.map((contact) => (
                  <TableRow key={contact.id_cust_user}>
                    <TableCell>{contact.full_name}</TableCell>
                    <TableCell>{contact.position}</TableCell>
                    <TableCell>
                      <a href={`mailto:${contact.email}`} style={{ color: '#DCAF26' }}>
                        {contact.email}
                      </a>
                    </TableCell>
                    <TableCell>{contact.phone_number}</TableCell>
                    <TableCell>{contact.mobile_number}</TableCell>
                    <TableCell>
                      <input type="checkbox" checked={contact.ismain_user} disabled />
                    </TableCell>
                    <TableCell align="center" sx={{ p: 0 }}>
                      {(isMainUser || contact.email === user.email) && (
                        <IconButton onClick={(e) => handleMenuOpen(e, contact)} sx={{ p: 0 }}>
                          <FontAwesomeIcon icon={faEllipsisV} style={{ color: '#DCAF26' }} />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {searchFilteredContacts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Aucun contact trouvé.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Modale d'ajout/édition */}
      <Dialog open={showModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Modifier le contact' : 'Ajouter un contact'}</DialogTitle>
        <DialogContent dividers>
          {modalError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {modalError}
            </Alert>
          )}

          <TextField
            label="Nom du contact *"
            variant="outlined"
            fullWidth
            value={currentContact.full_name}
            onChange={(e) => handleChange('full_name', e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Fonction"
            variant="outlined"
            fullWidth
            value={currentContact.position}
            onChange={(e) => handleChange('position', e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Email *"
            variant="outlined"
            fullWidth
            value={currentContact.email}
            onChange={(e) => handleChange('email', e.target.value)}
            sx={{ mb: 2 }}
            disabled={isEditing}
            error={currentContact.email !== '' && !isValidEmail(currentContact.email)}
            helperText={
              currentContact.email !== '' && !isValidEmail(currentContact.email)
                ? "Format incorrect. Exemple : user@example.com"
                : ""
            }
          />

          {isEditing ? (
            <>
              {/* ÉDITION : E.164 */}
              <TextField
                label="Téléphone fixe (format international)"
                variant="outlined"
                fullWidth
                value={currentContact.phone_number}
                onChange={(e) => handleChange('phone_number', e.target.value)}
                sx={{ mb: 2 }}
                inputProps={{ maxLength: 20 }}
                error={currentContact.phone_number !== '' && !isValidInternationalPhone(currentContact.phone_number)}
                helperText={
                  currentContact.phone_number !== '' && !isValidInternationalPhone(currentContact.phone_number)
                    ? "Format incorrect. Exemple : +25366111569"
                    : ""
                }
                required
              />
              <TextField
                label="Téléphone portable (format international)"
                variant="outlined"
                fullWidth
                value={currentContact.mobile_number}
                onChange={(e) => handleChange('mobile_number', e.target.value)}
                sx={{ mb: 2 }}
                inputProps={{ maxLength: 20 }}
                error={currentContact.mobile_number !== '' && !isValidInternationalPhone(currentContact.mobile_number)}
                helperText={
                  currentContact.mobile_number !== '' && !isValidInternationalPhone(currentContact.mobile_number)
                    ? "Format incorrect. Exemple : +25366111569"
                    : ""
                }
                required
              />
            </>
          ) : (
            <>
              {/* CRÉATION : indicatif + numéro national (Autocomplete + input) */}
              {/* Fixe */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr' }, gap: 2, mb: 2 }}>
                <Autocomplete
                  options={dialOptions}
                  value={dialOptions.find((o) => o.code === currentContact.phone_code) || null}
                  onChange={(_, val) => { if (val) handleChange('phone_code', val.code); }}
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
                    const current = dialOptions.find((o) => o.code === currentContact.phone_code);
                    return (
                      <TextField
                        {...params}
                        label="Indicatif (téléphone fixe)"
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
                <TextField
                  fullWidth
                  required
                  label="Téléphone fixe (sans indicatif)"
                  placeholder="numéro national"
                  value={currentContact.phone_national || ''}
                  onChange={(e) => handleChange('phone_national', e.target.value)}
                  inputProps={{ maxLength: 14 }}
  error={currentContact.phone_national !== '' && !isValidNational(currentContact.phone_national)}
  helperText={
    currentContact.phone_national !== '' && !isValidNational(currentContact.phone_national)
      ? 'Entre 6 et 14 chiffres (sans indicatif)'
      : ''
  }
/>
              </Box>

              {/* Mobile */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr' }, gap: 2, mb: 2 }}>
                <Autocomplete
                  options={dialOptions}
                  value={dialOptions.find((o) => o.code === currentContact.mobile_code) || null}
                  onChange={(_, val) => { if (val) handleChange('mobile_code', val.code); }}
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
                    const current = dialOptions.find((o) => o.code === currentContact.mobile_code);
                    return (
                      <TextField
                        {...params}
                        label="Indicatif (téléphone portable)"
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
                <TextField
                  fullWidth
                  required
                  label="Téléphone portable (sans indicatif)"
                  placeholder="numéro national"
                  value={currentContact.mobile_national || ''}
                  onChange={(e) => handleChange('mobile_national', e.target.value)}
                  slotProps={{ input: { maxLength: 13, inputMode: 'numeric' } }}
  error={currentContact.mobile_national !== '' && !isValidNational(currentContact.mobile_national)}
  helperText={
    currentContact.mobile_national !== '' && !isValidNational(currentContact.mobile_national)
      ? '4 à 13 chiffres (sans indicatif)'
      : ''
  }
/>
              </Box>
            </>
          )}
        </DialogContent>

        {isMainUser && (
          <FormControlLabel
            sx={{ ml: 2, mt: 1 }}
            control={
              <Checkbox
                checked={currentContact.ismain_user}
                onChange={(e) => handleChange('ismain_user', e.target.checked)}
                color="primary"
              />
            }
            label="Contact principal"
          />
        )}

        <DialogActions>
          <Button onClick={handleCloseModal}>Annuler</Button>
          <Button variant="contained" onClick={handleSaveContact} sx={{ backgroundColor: '#DCAF26' }}>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={(e, reason) => {
          if (reason === 'clickaway') return;
          setSnackbarOpen(false);
        }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Menu actions */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            handleOpenEditModal(selectedRow);
            handleMenuClose();
          }}
        >
          Modifier
        </MenuItem>

        {radioValue === 'active' && !selectedRow?.ismain_user && selectedRow?.email !== user.email && (
          <MenuItem
            onClick={() => {
              handleDelete(selectedRow.id_cust_user);
              handleMenuClose();
            }}
          >
            Désactiver
          </MenuItem>
        )}

        {radioValue === 'inactive' && (
          <MenuItem
            onClick={() => {
              handleReactivate(selectedRow.id_cust_user);
              handleMenuClose();
            }}
          >
            Réactiver
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default ContactsList;
