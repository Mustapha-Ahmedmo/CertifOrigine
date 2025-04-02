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
  useMediaQuery
} from '@mui/material';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPlus, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

const DestinataireList = () => {
  // Récupération de l’utilisateur depuis Redux
  const user = useSelector((state) => state.auth.user);
  const customerAccountId = user?.id_cust_account;

  // État
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

  // Load
  useEffect(() => {
    loadRecipients();
    loadCountries();
  }, []);

  const loadRecipients = async () => {
    try {
      const response = await fetchRecipients({ idListCA: customerAccountId });
      const data = response.data || [];
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

  // Ouvrir la modale Édition
  const handleOpenEditModal = (recipient) => {
    setErrorMessage('');
    setEditingRecipientId(recipient.id_recipient_account);
    setNewRecipient({
      recipientName: recipient.recipient_name,
      address1: recipient.address_1,
      address2: recipient.address_2 || '',
      address3: recipient.address_3 || '',
      country: recipient.id_country,
      phone: recipient.phone_number || '',
    });
    setShowAddModal(true);
  };

  // Recherche
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredRecipients = recipients.filter((recipient) => {
    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;
    const dateString = formatDate(recipient.insertdate);
    const fields = [
      recipient.recipient_name,
      recipient.address_1,
      recipient.address_2,
      recipient.country_symbol_fr_recipient,
      dateString,
    ]
      .filter(Boolean)
      .map((val) => String(val).toLowerCase());
    return fields.some((field) => field.includes(search));
  });

  // Ouvrir la modale Ajout
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
    setNewRecipient((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveNewRecipient = async () => {
    if (!newRecipient.recipientName || !newRecipient.address1 || !newRecipient.country) {
      setErrorMessage("Veuillez remplir au minimum le nom, l'adresse et le pays.");
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
  const handleDelete = async (recipientId) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce destinataire ?')) return;
    try {
      await deleteCustUser(recipientId);
      setRecipients((prev) => prev.filter((r) => r.id_recipient_account !== recipientId));
      alert('Destinataire supprimé avec succès.');
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
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRecipients.map((recipient) => (
              <TableRow key={recipient.id_recipient_account}>
                <TableCell>{formatDate(recipient.insertdate)}</TableCell>
                <TableCell>{recipient.recipient_name}</TableCell>
                <TableCell>{recipient.address_1}</TableCell>
                <TableCell>{recipient.country_symbol_fr_recipient || 'N/A'}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={
                        <FontAwesomeIcon icon={faEdit} style={{ color: 'blue' }} />
                      }
                      onClick={() => handleOpenEditModal(recipient)}
                      sx={{ border: 'none', '&:hover': { border: 'none' } }}
                    >
                      Modifier
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      startIcon={
                        <FontAwesomeIcon icon={faTrashAlt} style={{ color: 'red' }} />
                      }
                      onClick={() => handleDelete(recipient.id_recipient_account)}
                      sx={{ border: 'none', '&:hover': { border: 'none' } }}
                    >
                      Supprimer
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {filteredRecipients.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
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
      {filteredRecipients.map((recipient) => (
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
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<FontAwesomeIcon icon={faEdit} style={{ color: 'blue' }} />}
              onClick={() => handleOpenEditModal(recipient)}
              sx={{ border: 'none', '&:hover': { border: 'none' } }}
            >
              Modifier
            </Button>
            <Button
              variant="outlined"
              size="small"
              color="error"
              startIcon={<FontAwesomeIcon icon={faTrashAlt} style={{ color: 'red' }} />}
              onClick={() => handleDelete(recipient.id_recipient_account)}
              sx={{ border: 'none', '&:hover': { border: 'none' } }}
            >
              Supprimer
            </Button>
          </Box>
        </Paper>
      ))}
      {filteredRecipients.length === 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography align="center">Aucun destinataire trouvé.</Typography>
        </Paper>
      )}
    </Box>
  );

  return (
    <Box
      sx={{
        ml: { xs: 0, md: '240px' }, // 240px de marge à gauche en mode desktop
        maxWidth: '1200px',
        mx: 'auto',
        px: { xs: 2, sm: 3 },
        py: { xs: 2, sm: 3 },
      }}
    >
      <AppBar position="static" color="default">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">Liste des Destinataires</Typography>

          {/* BOUTON plus petit en mobile */}
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

      {/* Affichage conditionnel : table ou cards */}
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
            label="Adresse 3 (ex: Code postal)"
            fullWidth
            variant="outlined"
            value={newRecipient.address3}
            onChange={(e) => handleNewRecipientChange('address3', e.target.value)}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel>Pays *</InputLabel>
            <Select
              value={newRecipient.country}
              onChange={(e) => handleNewRecipientChange('country', e.target.value)}
              label="Pays *"
            >
              <MenuItem value="">
                <em>-- Sélectionnez un pays --</em>
              </MenuItem>
              {countries.map((c) => (
                <MenuItem key={c.id_country} value={c.id_country}>
                  {c.symbol_fr}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Téléphone"
            fullWidth
            variant="outlined"
            value={newRecipient.phone}
            onChange={(e) => handleNewRecipientChange('phone', e.target.value)}
            sx={{ mb: 2 }}
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
    </Box>
  );
};

export default DestinataireList;
