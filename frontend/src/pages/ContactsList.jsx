import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  getCustUsersByAccount,
  deleteCustUser,
  setCustSmallUser,
  reactivateCustUser,
} from '../services/apiServices';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrashAlt, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
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
  FormLabel,
  RadioGroup,
  Radio,
} from '@mui/material';
import './ContactsList.css';

// Générer un mot de passe aléatoire si nécessaire
const generateRandomPassword = (length = 12) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Valider un numéro de téléphone international
const isValidInternationalPhone = (number) => {
  return /^\+[0-9]+$/.test(number) && number.length <= 12;
};

// Valider un email standard
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

  // Etats pour showActive / showInactive
  const [showActive, setShowActive] = useState(true);
  const [showInactive, setShowInactive] = useState(false);

  // Modale d'ajout/édition
  const [showModal, setShowModal] = useState(false);
  const [modalError, setModalError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Contact en cours d'édition
  const [currentContact, setCurrentContact] = useState({
    id_cust_user: 0,
    full_name: '',
    position: '',
    email: '',
    phone_number: '',
    mobile_number: '',
    ismain_user: false,
    password: '',
    confirmPassword: '',
  });

  // Vérifications téléphone
  const phoneFixedError =
    currentContact.phone_number !== '' && !isValidInternationalPhone(currentContact.phone_number);
  const phoneMobileError =
    currentContact.mobile_number !== '' && !isValidInternationalPhone(currentContact.mobile_number);

  // Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Responsive
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // --- menu Actions (⋮) ---
  const [anchorEl, setAnchorEl] = useState(null);   // ancre du Menu
  const [selectedRow, setSelectedRow] = useState(null); // contact cliqué

  const handleMenuOpen = (e, contact) => {
    setAnchorEl(e.currentTarget);
    setSelectedRow(contact);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const GOLD = '#DCAF26';

  const StatusFilter = () =>
    isSmallScreen ? (
      /* ----- version mobile : Select ----- */
      <FormControl
        size="small"
        sx={{
          minWidth: 180,

          /* === BORDURE === */
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: GOLD,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: GOLD,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: GOLD,
          },

          /* === LABEL === */
          '& .MuiInputLabel-root.Mui-focused': {
            color: GOLD,
          },

          /* === ICÔNE ▾ === */
          '& .MuiSelect-icon': {
            color: GOLD,
          },
        }}
      >
        <InputLabel id="status-label">Filtrer</InputLabel>

        <Select
          labelId="status-label"
          id="status-select"
          value={radioValue}
          label="Filtrer"
          onChange={handleRadioChange}
          sx={{ color: '#000' }}          /* couleur du texte sélectionné */
          MenuProps={{
            MenuListProps: {
              sx: {
                '& .Mui-selected': {
                  backgroundColor: '#F4E6B4 !important',
                  color: '#000',
                },
                '& .Mui-selected:hover': {
                  backgroundColor: '#EBD68A !important',
                },
              },
            },
          }}
        >
          <MenuItem
            value="active"
            sx={{
              '&.Mui-selected': {
                backgroundColor: '#F4E6B4',
                color: '#000',
              },
              '&.Mui-selected:hover': {
                backgroundColor: '#EBD68A',
              },
            }}
          >
            Contacts Actifs
          </MenuItem>

          <MenuItem
            value="inactive"
            sx={{
              '&.Mui-selected': {
                backgroundColor: '#F4E6B4',
                color: '#000',
              },
              '&.Mui-selected:hover': {
                backgroundColor: '#EBD68A',
              },
            }}
          >
            Contacts Désactivés
          </MenuItem>

        </Select>
      </FormControl>
    ) : (
      /* ----- version desktop : RadioGroup ----- */
      <FormControl component="fieldset">
        <RadioGroup
          row
          name="contactsFilter"
          value={radioValue}
          onChange={handleRadioChange}
        >
          <FormControlLabel value="active" control={<Radio />} label="Contacts Actifs" />
          <FormControlLabel value="inactive" control={<Radio />} label="Contacts Désactivés" />
        </RadioGroup>
      </FormControl>
    );

  // Ouvrir la modale d'ajout
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
      ismain_user: false,
      password: '',
      confirmPassword: '',
    });
    setShowModal(true);
  };

  const [radioValue, setRadioValue] = useState('active');

  const buildIsactiveCU = () => {
    // If radioValue === 'active' => 'true'
    // If radioValue === 'inactive' => 'false'
    return radioValue === 'active' ? 'true' : 'false';
  };
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
        // Récupérer contacts (actifs ou inactifs selon radioValue)
        const result = await getCustUsersByAccount(
          custAccountId,
          null,      // statutflag
          'true',    // isactiveCA => true => compte client actif
          isactiveCUParam, // isactiveCU => 'true' ou 'false'
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

  const handleRadioChange = (event) => {
    setRadioValue(event.target.value);
  };

  // Ouvrir la modale d'édition
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
      ismain_user: contact.ismain_user || false,
      password: '',
      confirmPassword: '',
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Gérer la saisie dans la modale
  const handleChange = (field, value) => {
    setCurrentContact((prev) => ({ ...prev, [field]: value }));
  };

  // Sauvegarder
  const handleSaveContact = async () => {
    const {
      id_cust_user,
      full_name,
      position,
      email,
      phone_number,
      mobile_number,
      ismain_user,
      password,
      confirmPassword,
    } = currentContact;

    // Vérifications simples
    if (!full_name || !email) {
      setModalError("Veuillez renseigner au minimum le nom et l'email du contact.");
      return;
    }

    if (!isValidEmail(email)) {
      setModalError("Le format de l'email est invalide.");
      return;
    }

    if (!phone_number || !isValidInternationalPhone(phone_number)) {
      setModalError("Le téléphone fixe doit être au format international (e.g. '+123456').");
      return;
    }
    if (!mobile_number || !isValidInternationalPhone(mobile_number)) {
      setModalError("Le téléphone portable doit être au format international (e.g. '+123456').");
      return;
    }

    if (isEditing && (password || confirmPassword)) {
      if (password !== confirmPassword) {
        setModalError('Les mots de passe ne correspondent pas.');
        return;
      }
    }

    try {
      setModalError('');

      // Si on modifie, on n'envoie un pwd que si l'utilisateur a saisi qqchose
      let pwdToSend = null;
      if (isEditing) {
        if (password.trim()) {
          pwdToSend = password.trim();
        }
      } else {
        // En création
        pwdToSend = null;
      }

      // On suppose statut_flag = 1 => actif
      const payload = {
        id_cust_user: isEditing ? id_cust_user : 0,
        id_cust_account: custAccountId,
        gender: 0,
        full_name,
        position,
        email,
        phone_number,
        mobile_number,
        pwd: pwdToSend,
        ismain_user,
        statut_flag: 1, // actif
        id_login_insert: user?.id_login_user || 1,
        id_login_modify: isEditing ? (user?.id_login_user || 1) : null,
        password: isEditing ? null : generateRandomPassword(),
        idlogin: user?.id_login_user || 1,
      };

      await setCustSmallUser(payload);
      // Recharger la liste complète
      const updated = await getCustUsersByAccount(custAccountId, null, 'true', 'true', null);
      setContacts(updated.data || []);
      setShowModal(false);
    } catch (err) {
      console.error('Erreur lors de la création/édition du contact:', err);
      setModalError(
        isEditing
          ? 'Impossible de modifier ce contact.'
          : 'Impossible de créer ce contact.'
      );
    }
  };

  const handleReactivate = async (contactId) => {
    if (!window.confirm('Voulez-vous vraiment réactiver ce contact ?')) {
      return;
    }
    try {
      await reactivateCustUser(contactId);

      // Retirer le contact réactivé de la liste locale
      setContacts((prev) => prev.filter((c) => c.id_cust_user !== contactId));

      setSnackbarMessage('Contact réactivé avec succès.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Erreur lors de la réactivation du contact:', err);
      alert('Impossible de réactiver ce contact.');
    }
  };

  // Suppression => on suppose statut_flag != 1 => inactif
  const handleDelete = async (contactId) => {
    if (!window.confirm('Voulez-vous vraiment désactiver ce contact ?')) {
      return;
    }
    try {
      await deleteCustUser(contactId);
      setContacts((prev) => prev.filter((c) => c.id_cust_user !== contactId));
      alert('Contact désactivé avec succès.');
    } catch (err) {
      console.error('Erreur lors de la suppression du contact:', err);
      alert('Impossible de désactiver ce contact.');
    }
  };

  // Premier filtrage => Search
  const searchFilteredContacts = contacts.filter((contact) => {
    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;

    const fieldsToSearch = [
      contact.full_name,
      contact.position,
      contact.email,
      contact.phone_number,
      contact.mobile_number,
    ]
      .filter(Boolean)
      .map((val) => val.toLowerCase());
    return fieldsToSearch.some((field) => field.includes(search));
  });


  const renderMobileCards = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {searchFilteredContacts.map((contact) => (
        <Paper
          key={contact.id_cust_user}
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <Typography variant="body2">
            <strong>Nom : </strong> {contact.full_name}
          </Typography>
          <Typography variant="body2">
            <strong>Fonction : </strong> {contact.position}
          </Typography>
          <Typography variant="body2">
            <strong>Email : </strong>
            <a href={`mailto:${contact.email}`} style={{ color: '#DCAF26' }}>
              {contact.email}
            </a>
          </Typography>
          <Typography variant="body2">
            <strong>Tél : </strong> {contact.phone_number}
          </Typography>
          <Typography variant="body2">
            <strong>Portable : </strong> {contact.mobile_number}
          </Typography>
          <Typography variant="body2">
            <strong>Contact Principal : </strong> {contact.ismain_user ? 'Oui' : 'Non'}
          </Typography>
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
      <Paper elevation={1} sx={{ mb: 2 }}>
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h6">LISTE DES CONTACTS</Typography>
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
              border: 'none'
            }}
          >
            <FontAwesomeIcon icon={faPlus} style={{ marginRight: 8 }} />
            Ajouter un contact
          </Button>
        </Box>
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

      {/* Affichage conditionnel : tableau ou cartes mobiles */}
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
          <TextField
            label="Téléphone fixe (format international)"
            variant="outlined"
            fullWidth
            value={currentContact.phone_number}
            onChange={(e) => handleChange('phone_number', e.target.value)}
            sx={{ mb: 2 }}
            inputProps={{ maxLength: 12 }}
            error={phoneFixedError}
            helperText={
              phoneFixedError
                ? "Format incorrect. Doit commencer par '+' et max 12 caractères."
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
            inputProps={{ maxLength: 12 }}
            error={phoneMobileError}
            helperText={
              phoneMobileError
                ? "Format incorrect. Doit commencer par '+' et max 12 caractères."
                : ""
            }
            required
          />

        </DialogContent>

        {isMainUser && (
          <FormControlLabel
            sx={{ ml: 2 }}
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
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {/* --- Modifier --- */}
        <MenuItem
          onClick={() => {
            handleOpenEditModal(selectedRow);
            handleMenuClose();
          }}
        >
          Modifier
        </MenuItem>

        {/* --- Désactiver --- */}
        {radioValue === 'active' && !selectedRow?.ismain_user && (
          <MenuItem
            onClick={() => {
              handleDelete(selectedRow.id_cust_user);
              handleMenuClose();
            }}
          >
            Désactiver
          </MenuItem>
        )}

        {/* --- Réactiver --- */}
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