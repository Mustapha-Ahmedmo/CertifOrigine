import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  fetchRecipients,
  addRecipient,
  fetchCountries,
  deleteCustUser,
} from '../services/apiServices';
import './Inscriptions.css';
import { formatDate } from '../utils/dateUtils';

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
  Alert,
  AppBar,
  Toolbar,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
  useTheme,
  useMediaQuery,
  Menu,
} from '@mui/material';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPlus, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { IconButton } from '@mui/material';

// Fonction de validation pour un numéro de téléphone international
// Le numéro doit commencer par '+' ou '00', suivi uniquement de chiffres, avec une longueur comprise entre 8 et 16 caractères.
const isValidInternationalPhone = (number) => {
  return /^(?:\+|00)[1-9][0-9]*$/.test(number) && number.length >= 8 && number.length <= 16;
};

const DestinataireList = () => {
  // Récupération de l’utilisateur depuis Redux
  const user = useSelector((state) => state.auth.user);
  const customerAccountId = user?.id_cust_account;

  // États
  const [recipients, setRecipients] = useState([]);
  const [countries, setCountries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Modale
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecipientId, setEditingRecipientId] = useState(null);

  // Données destinataire
  const [newRecipient, setNewRecipient] = useState({
    recipientName: '',
    address1: '',
    address2: '',
    address3: '',
    country: '',
    phone: '',
  });
  const [errorMessage, setErrorMessage] = useState('');

  // Responsive
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // --- menu Actions (⋮) ---
  const [anchorEl, setAnchorEl] = useState(null);           // ancre du Menu
  const [selectedRow, setSelectedRow] = useState(null);     // destinataire cliqué

  const handleMenuOpen = (e, recipient) => {
    setAnchorEl(e.currentTarget);
    setSelectedRow(recipient);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };


  // Chargement initial
  useEffect(() => {
    loadRecipients();
    loadCountries();
  }, []);

  const loadRecipients = async () => {
    try {
      const response = await fetchRecipients({ idListCA: customerAccountId, statutFlagR : 1  });
      const data = response.data || [];
      console.log('Destinataires reçus:', data); // Ajoutez cette ligne pour voir la structure
      setRecipients(data);
    } catch (err) {
      console.error('Erreur lors de la récupération des destinataires:', err);
    }
  };

  const loadCountries = async () => {
    try {
      const data = await fetchCountries();
      setCountries(data);
    } catch (err) {
      console.error('Erreur lors du chargement des pays:', err);
    }
  };

  // Ouvrir la modale d'édition
  const handleOpenEditModal = (recipient) => {
    console.log('[DEBUG] open edit modal for:', recipient,
      'id_country =>', recipient.id_country, typeof recipient.id_country);
    setErrorMessage('');
    setEditingRecipientId(recipient.id_recipient_account);
    setNewRecipient({
      recipientName: recipient.recipient_name,
      address1: recipient.address_1,
      address2: recipient.address_2 || '',
      address3: recipient.address_3 || '',
      country: recipient.id_country_recipient ?? '',
      phone: recipient.phone_number || '',
    });
    setShowAddModal(true);
  };

  // Ouvrir la modale d'ajout
  const handleOpenAddModal = () => {
    setErrorMessage('');
    setEditingRecipientId(null);
    setNewRecipient({
      recipientName: '',
      address1: '',
      address2: '',
      address3: '',
      country: '',
      phone: '',
    });
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
  };

  const handleNewRecipientChange = (field, value) => {
    // Si le champ modifié est le téléphone, on peut effectuer une vérification instantanée
    if (field === 'phone' && value !== '') {
      if (!isValidInternationalPhone(value)) {
        setErrorMessage("Format incorrect pour le numéro de téléphone. Doit commencer par '+' ou '00', suivi uniquement de chiffres, entre 8 et 16 caractères.");
      } else {
        setErrorMessage('');
      }
    }
    setNewRecipient((prev) => ({ ...prev, [field]: value }));
  };

  // Lors de la sauvegarde, vérification des champs obligatoires et du téléphone
  const handleSaveNewRecipient = async () => {
    if (!newRecipient.recipientName || !newRecipient.address1 || !newRecipient.country) {
      setErrorMessage("Veuillez remplir au minimum le nom, l'adresse et le pays.");
      return;
    }
    if (newRecipient.phone && !isValidInternationalPhone(newRecipient.phone)) {
      setErrorMessage("Le numéro de téléphone est invalide. Format international requis (doit commencer par '+' ou '00', suivi uniquement de chiffres, et contenir entre 8 et 16 caractères).");
      return;
    }
    try {
      setErrorMessage('');
      const payload = {
        idRecipientAccount: editingRecipientId ? editingRecipientId : null,
        idCustAccount: customerAccountId,
        recipientName: newRecipient.recipientName,
        address1: newRecipient.address1,
        address2: newRecipient.address2,
        address3: newRecipient.address3,
        idCountry: newRecipient.country,
        statutFlag: 1,
        activationDate: new Date().toISOString(),
        deactivationDate: new Date('9999-12-31').toISOString(),
        idLoginInsert: editingRecipientId ? null : (user?.id_login_user || 1),
        idLoginModify: editingRecipientId ? (user?.id_login_user || 1) : null,
        phone_number: newRecipient.phone,
      };

      await addRecipient(payload);
      await loadRecipients();

      setEditingRecipientId(null);
      setShowAddModal(false);
    } catch (err) {
      console.error("Erreur lors de l'ajout/modification du destinataire:", err);
      setErrorMessage("Une erreur s'est produite lors de l'enregistrement du destinataire.");
    }
  };

  // Suppression
  const handleDelete = async (recipient) => {
    if (!window.confirm('Voulez-vous vraiment désactiver ce destinataire ?')) return;
    try {

      const payload = {
        idRecipientAccount : recipient.id_recipient_account,
        idCustAccount      : recipient.id_cust_account,
        recipientName      : recipient.recipient_name,
        address1           : recipient.address_1,
        address2           : recipient.address_2,
        address3           : recipient.address_3,
        idCountry          : recipient.id_country_recipient,   // champ dispo depuis la fonction SQL
        statutFlag         : 2,                                // ← désactivé
        activationDate     : recipient.activation_date,        // on conserve la date d’activation d’origine
        deactivationDate   : new Date().toISOString(),         // on le rend inactif maintenant
        idLoginInsert      : recipient.idlogin_insert,
        idLoginModify      : user?.id_login_user || 1,
        phone_number       : recipient.phone_number,
      };

      await addRecipient(payload);      // “update” avec statut_flag = 2
      await loadRecipients();           // on recharge la liste (filtrée sur actifs)
      
      alert('Destinataire désactivé avec succès.');
    } catch (err) {
      console.error('Erreur lors de la suppression du destinataire:', err);
      alert('Impossible de supprimer ce destinataire.');
    }
  };



  // ----- RENDU Desktop : Table -----
  const renderDesktopTable = () => (
    <Paper>
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date Création</TableCell>
              <TableCell>Nom du destinataire</TableCell>
              <TableCell>Adresse</TableCell>
              <TableCell>Pays</TableCell>
              <TableCell>Téléphone</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recipients.map((recipient) => (
              <TableRow key={recipient.id_recipient_account}>
                <TableCell>{formatDate(recipient.insertdate)}</TableCell>
                <TableCell>{recipient.recipient_name}</TableCell>
                <TableCell>{recipient.address_1}</TableCell>
                <TableCell>{recipient.country_symbol_fr_recipient || 'N/A'}</TableCell>
                <TableCell>{recipient.phone_number}</TableCell>
                <TableCell
                  align="center"
                  sx={{            // ← styles supplémentaires
                    p: 0,          // plus de padding dans la cellule
                    textAlign: 'center'
                  }}
                >
                  <IconButton onClick={(e) => handleMenuOpen(e, recipient)}>
                    <FontAwesomeIcon icon={faEllipsisV} style={{ color: '#DCAF26' }} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {recipients.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Aucun destinataire trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );

  // ----- RENDU Mobile : Cards -----
  const renderMobileCards = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {recipients.map((recipient) => (
        <Paper
          key={recipient.id_recipient_account}
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <Typography variant="body2">
            <strong>Date Création : </strong> {formatDate(recipient.insertdate)}
          </Typography>
          <Typography variant="body2">
            <strong>Nom du destinataire : </strong> {recipient.recipient_name}
          </Typography>
          <Typography variant="body2">
            <strong>Adresse : </strong> {recipient.address_1}
          </Typography>
          <Typography variant="body2">
            <strong>Pays : </strong> {recipient.country_symbol_fr_recipient || 'N/A'}
          </Typography>
          <Typography variant="body2">
            <strong>Téléphone : </strong> {recipient.phone_number}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <IconButton onClick={(e) => handleMenuOpen(e, recipient)}>
              <FontAwesomeIcon icon={faEllipsisV} style={{ color: '#DCAF26' }} />
            </IconButton>

          </Box>

        </Paper>
      ))}
      {recipients.length === 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography align="center">Aucun destinataire trouvé.</Typography>
        </Paper>
      )}
    </Box>
  );

  // Gestion de la recherche (à implémenter selon vos besoins)
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <Box
      sx={{
        ml: { xs: 0, md: '240px' },
        maxWidth: '1200px',
        mx: 'auto',
        px: { xs: 2, sm: 3 },
        py: { xs: 2, sm: 3 },
      }}
    >
      <AppBar position="static" color="default">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">Liste des Destinataires</Typography>
          <Button
            variant="contained"
            onClick={handleOpenAddModal}
            size="small"
            sx={{
              backgroundColor: '#DCAF26',
              fontSize: { xs: '0.7rem', sm: '0.85rem' },
              px: { xs: 1, sm: 2 },
              py: { xs: 0.5, sm: 1 },
            }}
          >
            <FontAwesomeIcon icon={faPlus} style={{ marginRight: 8 }} />
            Ajouter un destinataire
          </Button>
        </Toolbar>
      </AppBar>

      <Box mb={2} mt={2} display="flex" alignItems="center" gap={2}>
        <Typography>Rechercher :</Typography>
        <TextField
          variant="outlined"
          placeholder="Tapez un mot-clé ou un chiffre..."
          size="small"
          value={searchTerm}
          onChange={handleSearch}
          style={{ maxWidth: 300 }}
        />
      </Box>

      {isSmallScreen ? renderMobileCards() : renderDesktopTable()}

      <Dialog open={showAddModal} onClose={handleCloseAddModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingRecipientId ? 'Modifier un destinataire' : 'Ajouter un destinataire'}
        </DialogTitle>
        <DialogContent dividers>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <TextField
            label="Nom du destinataire *"
            fullWidth
            variant="outlined"
            value={newRecipient.recipientName}
            onChange={(e) => handleNewRecipientChange('recipientName', e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Adresse 1 *"
            fullWidth
            variant="outlined"
            value={newRecipient.address1}
            onChange={(e) => handleNewRecipientChange('address1', e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Adresse 2"
            fullWidth
            variant="outlined"
            value={newRecipient.address2}
            onChange={(e) => handleNewRecipientChange('address2', e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Code postal"
            fullWidth
            variant="outlined"
            value={newRecipient.address3}
            onChange={(e) => handleNewRecipientChange('address3', e.target.value)}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel id="country-label">Pays *</InputLabel>
            <Select
              labelId="country-label"
              id="country-select"
              value={newRecipient.country}
              onChange={(e) => handleNewRecipientChange('country', e.target.value)}
              label="Pays *"
            >
              <MenuItem value="">
                <em>-- Sélectionnez un pays --</em>
              </MenuItem>
              {countries.map(c => (
                <MenuItem key={c.id_country} value={c.id_country}>
                  {c.symbol_fr}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Téléphone (format international)"
            fullWidth
            variant="outlined"
            value={newRecipient.phone}
            onChange={(e) => handleNewRecipientChange('phone', e.target.value)}
            sx={{ mb: 2 }}
            inputProps={{ maxLength: 16 }}
            error={newRecipient.phone !== '' && !isValidInternationalPhone(newRecipient.phone)}
            helperText={
              newRecipient.phone !== '' && !isValidInternationalPhone(newRecipient.phone)
                ? "Format incorrect. Doit commencer par '+' ou '00' suivi uniquement de chiffres."
                : "Doit commencer par '+' ou '00' suivi uniquement de chiffres, entre 8 et 16 caractères."
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddModal}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleSaveNewRecipient}
            sx={{ backgroundColor: '#DCAF26' }}
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>


      {/* --- menu Actions : Modifier / Supprimer --- */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            handleOpenEditModal(selectedRow);
            handleMenuClose();
          }}
        >
          Modifier
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (selectedRow) handleDelete(selectedRow);
            handleMenuClose();
          }}
        >
          Désactiver
        </MenuItem>
      </Menu>

    </Box>


  );
};

export default DestinataireList;
