import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  getCustUsersByAccount,
  setCustUser,
  deleteCustUser,
  setCustSmallUser,
} from '../services/apiServices';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import './ContactsList.css'; 
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  AppBar,
} from '@mui/material';

// Helpers pour l'accessibilité des onglets
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`inscriptions-tabpanel-${index}`}
      aria-labelledby={`inscriptions-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `inscriptions-tab-${index}`,
    'aria-controls': `inscriptions-tabpanel-${index}`,
  };
}

const API_URL = import.meta.env.VITE_API_URL;

// Validation du numéro de téléphone international : 
// Le numéro doit commencer par '+' suivi uniquement de chiffres et ne doit pas dépasser 12 caractères.
const isValidInternationalPhone = (number) => {
  return /^\+[0-9]+$/.test(number) && number.length <= 12;
};

const ContactsList = () => {
  const { user } = useSelector((state) => state.auth);
  const custAccountId = user?.id_cust_account;

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Barre de recherche
  const [searchTerm, setSearchTerm] = useState('');

  // Modale : ajout ou édition
  const [showModal, setShowModal] = useState(false);
  const [modalError, setModalError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const user2 = useSelector((state) => state.auth.user);
  const idLogin = user2?.id_login_user;

  // Contact en cours (pour la modale)
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

  // Calcul des erreurs pour les numéros de téléphone dans la modale
  const phoneFixedError =
    currentContact.phone_number !== '' && !isValidInternationalPhone(currentContact.phone_number);
  const phoneMobileError =
    currentContact.mobile_number !== '' && !isValidInternationalPhone(currentContact.mobile_number);

  // Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  // Récupération des contacts
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        if (!custAccountId) {
          setError('Aucun compte client trouvé.');
          setLoading(false);
          return;
        }
        const result = await getCustUsersByAccount(
          custAccountId,
          null,
          'true',
          'true',
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
  }, [custAccountId]);

  // Ouvrir la modale en mode Ajout
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

  // Ouvrir la modale en mode Édition
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

  // Fermer la modale
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Gérer la saisie (modale)
  const handleChange = (field, value) => {
    setCurrentContact((prev) => ({ ...prev, [field]: value }));
  };

  // Sauvegarder le contact
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

    if (!full_name || !email) {
      setModalError("Veuillez renseigner au minimum le nom et l'email du contact.");
      return;
    }

    if (!phone_number || !isValidInternationalPhone(phone_number)) {
      setModalError("Le téléphone fixe est obligatoire et doit être au format international (doit commencer par '+' suivi uniquement de chiffres et ne pas dépasser 12 caractères).");
      return;
    }
    if (!mobile_number || !isValidInternationalPhone(mobile_number)) {
      setModalError("Le téléphone portable est obligatoire et doit être au format international (doit commencer par '+' suivi uniquement de chiffres et ne pas dépasser 12 caractères).");
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
      let pwdToSend = null;
      if (isEditing) {
        if (password.trim()) {
          pwdToSend = password.trim();
        }
      } else {
        pwdToSend = null;
      }

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
        statut_flag: 1,
        id_login_insert: user?.id_login_user || 1,
        id_login_modify: isEditing ? (user?.id_login_user || 1) : null,
        password: 'account123password',
        idlogin: user?.id_login_user || 1,
      };

      await setCustSmallUser(payload);
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

  // Suppression
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

  // Filtrage local via searchTerm
  const filteredContacts = contacts.filter((contact) => {
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

  if (loading) {
    return <Box sx={{ ml: '240px', p: 3 }}>Chargement en cours...</Box>;
  }
  if (error) {
    return (
      <Box sx={{ ml: '240px', p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ ml: '240px', p: 3 }}>
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
            startIcon={<FontAwesomeIcon icon={faPlus} style={{ color: '#DCAF26' }} />}
            onClick={handleOpenAddModal}
            sx={{ backgroundColor: '#DCAF26', border: 'none' }}
          >
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
      </Box>

      {/* Tableau */}
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
              {filteredContacts.map((contact) => (
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
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<FontAwesomeIcon icon={faEdit} style={{ color: 'blue' }} />}
                      onClick={() => handleOpenEditModal(contact)}
                      sx={{
                        mr: 1,
                        border: 'none',
                        '&:hover': { border: 'none' },
                      }}
                    >
                      Modifier
                    </Button>
                    {!contact.ismain_user && (
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        startIcon={<FontAwesomeIcon icon={faTrashAlt} style={{ color: 'red' }} />}
                        onClick={() => handleDelete(contact.id_cust_user)}
                        sx={{
                          border: 'none',
                          '&:hover': { border: 'none' },
                        }}
                      >
                        Supprimer
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredContacts.length === 0 && (
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
                ? "Format incorrect. Doit commencer par '+' suivi uniquement de chiffres et ne pas dépasser 12 caractères."
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
                ? "Format incorrect. Doit commencer par '+' suivi uniquement de chiffres et ne pas dépasser 12 caractères."
                : ""
            }
            required
          />
          {isEditing && (
            <>
              <TextField
                label="Nouveau mot de passe (facultatif)"
                variant="outlined"
                fullWidth
                type="password"
                value={currentContact.password}
                onChange={(e) => handleChange('password', e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Confirmer le nouveau mot de passe"
                variant="outlined"
                fullWidth
                type="password"
                value={currentContact.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Annuler</Button>
          <Button variant="contained" onClick={handleSaveContact} sx={{ backgroundColor: '#DCAF26' }}>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ContactsList;
