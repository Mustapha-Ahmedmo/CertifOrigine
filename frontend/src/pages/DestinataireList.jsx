// DestinataireList.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux'; 
import {
  fetchRecipients,
  addRecipient,
  fetchCountries,
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
  Menu,
  IconButton
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';


const DestinataireList = () => {
  // Récupération de l’utilisateur depuis Redux
  const user = useSelector((state) => state.auth.user);
  const customerAccountId = user?.id_cust_account;

  const [recipients, setRecipients] = useState([]);
  const [countries, setCountries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  // Gestion de la modale d'ajout
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecipientId, setEditingRecipientId] = useState(null);
  // Données du nouveau destinataire
  const [newRecipient, setNewRecipient] = useState({
    recipientName: '',
    address1: '',
    address2: '',
    address3: '',
    country: '',  // Doit contenir l'ID numérique du pays
    phone: '',
  });

  const [errorMessage, setErrorMessage] = useState('');

  // Chargement initial
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
  const handleMenuOpen = (event, recipient) => {
    setAnchorEl(event.currentTarget);
    setSelectedRecipient(recipient);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRecipient(null);
  };

  const handleEdit = () => {
  if (selectedRecipient) {
    setNewRecipient({
      recipientName: selectedRecipient.recipient_name,
      address1: selectedRecipient.address_1,
      address2: selectedRecipient.address_2 || '',
      address3: selectedRecipient.address_3 || '',
      country: selectedRecipient.id_country,
      phone: selectedRecipient.phone_number || '',
    });
    setEditingRecipientId(selectedRecipient.id_recipient_account); // Stocker l'ID pour savoir si on modifie
    setShowAddModal(true);
  }
  if (!selectedRecipient) return;
  handleMenuClose();
};


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

  const handleOpenAddModal = () => {
    setErrorMessage('');
    setEditingRecipientId(null); // On remet l'ID d'édition à null
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

  // Construction du payload sans préfixe pour le front-end
  const handleSaveNewRecipient = async () => {
    if (!newRecipient.recipientName || !newRecipient.address1 || !newRecipient.country) {
      setErrorMessage("Veuillez remplir au minimum le nom, l'adresse et le pays.");
      return;
    }
  
    try {
      setErrorMessage('');
  
      const payload = {
        idRecipientAccount: editingRecipientId ? editingRecipientId : null, // Vérifie si on modifie ou ajoute
        idCustAccount: customerAccountId,
        recipientName: newRecipient.recipientName,
        address1: newRecipient.address1,
        address2: newRecipient.address2,
        address3: newRecipient.address3,
        idCountry: newRecipient.country,
        statutFlag: 1,
        activationDate: new Date().toISOString(),
        deactivationDate: new Date('9999-12-31').toISOString(),
        idLoginInsert: editingRecipientId ? null : (user?.id_login_user || 1), // Seulement à l'ajout
        idLoginModify: editingRecipientId ? (user?.id_login_user || 1) : null, // Seulement à la modification
      };
  
      await addRecipient(payload); // Cette fonction doit être capable de gérer ajout/modification côté backend
      await loadRecipients();
      
      // Réinitialiser l'ID d'édition après la modification
      setEditingRecipientId(null);
      setShowAddModal(false);
    } catch (err) {
      console.error("Erreur lors de l'ajout/modification du destinataire:", err);
      setErrorMessage("Une erreur s'est produite lors de l'enregistrement du destinataire.");
    }
  };
  

  return (
    <Box sx={{ ml: '240px', p: 3 }}>
      <AppBar position="static" color="default">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">Liste des Destinataires</Typography>
          <Button variant="contained" onClick={handleOpenAddModal}>
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

      <Paper>
        <TableContainer>
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
              {recipients.map((recipient) => (
                <TableRow key={recipient.id_recipient_account}>
                  <TableCell>{formatDate(recipient.insertdate)}</TableCell>
                  <TableCell>{recipient.recipient_name}</TableCell>
                  <TableCell>{recipient.address_1}</TableCell>
                  <TableCell>{recipient.country_symbol_fr_recipient || 'N/A'}</TableCell>
                  <TableCell>
                    <IconButton onClick={(event) => handleMenuOpen(event, recipient)}>
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleEdit}>
          <FontAwesomeIcon icon={faEdit} style={{ marginRight: 8 }} /> Modifier
        </MenuItem>
      </Menu>

      <Dialog open={showAddModal} onClose={handleCloseAddModal} maxWidth="sm" fullWidth>
        <DialogTitle>Ajouter un destinataire</DialogTitle>
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

          {/* Sélection du pays */}
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
          <Button variant="contained" onClick={handleSaveNewRecipient}>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DestinataireList;