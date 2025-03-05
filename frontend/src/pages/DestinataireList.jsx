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
} from '@mui/material';

const DestinataireList = () => {
  // On récupère l’utilisateur depuis Redux
  const user = useSelector((state) => state.auth.user);
  // On en déduit l’ID du compte client
  const customerAccountId = user?.id_cust_account;

  const [recipients, setRecipients] = useState([]);
  const [countries, setCountries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Modale d'ajout
  const [showAddModal, setShowAddModal] = useState(false);

  // Comme dans Step2, on a : 
  //  - recipientName
  //  - address1
  //  - address2 (facultatif)
  //  - address3 (pour code postal ou complément)
  //  - idCity: 1 (forcé, comme Step2)
  //  - country
  //  - phone
  const [newRecipient, setNewRecipient] = useState({
    recipientName: '',
    address1: '',
    address2: '',
    address3: '',  // Dans Step2, c'est le postalCode
    // city est remplacé par idCity forcé à 1
    idCity: 1,
    country: '',
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
      // Filtrer par compte client
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

  // Gère la recherche
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filtrer la liste selon la recherche
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

  // Ouvre la modale "Ajouter un destinataire"
  const handleOpenAddModal = () => {
    setErrorMessage('');
    setNewRecipient({
      recipientName: '',
      address1: '',
      address2: '',
      address3: '',
      idCity: 1,  // Forcé comme dans Step2
      country: '',
      phone: '',
    });
    setShowAddModal(true);
  };

  // Ferme la modale "Ajouter un destinataire"
  const handleCloseAddModal = () => {
    setShowAddModal(false);
  };

  // Gestion des champs du nouveau destinataire
  const handleNewRecipientChange = (field, value) => {
    setNewRecipient((prev) => ({ ...prev, [field]: value }));
  };

  // Ajoute un nouveau destinataire (similaire Step2 : "idCity: 1")
  const handleSaveNewRecipient = async () => {
    // Vérif minimal : nom, adresse1, pays => obligatoires
    if (!newRecipient.recipientName || !newRecipient.address1 || !newRecipient.country) {
      setErrorMessage("Veuillez remplir au minimum le nom, l'adresse et le pays.");
      return;
    }

    try {
      setErrorMessage('');

      // Payload pour l'API : on utilise idCity: 1 (comme Step2)
      const payload = {
        idRecipientAccount: null,
        idCustAccount: customerAccountId,
        recipientName: newRecipient.recipientName,
        address1: newRecipient.address1,
        address2: newRecipient.address2,
        address3: newRecipient.address3,
        // Au lieu de "city", on envoie "idCity"
        idCity: 1,
        country: newRecipient.country,
        phone: newRecipient.phone,
        statutFlag: 1,
        activationDate: new Date().toISOString(),
        deactivationDate: new Date('9999-12-31').toISOString(),
        idLoginInsert: user?.id_login_user || 1,
        idLoginModify: null,
      };

      await addRecipient(payload);
      // Recharge la liste
      await loadRecipients();
      // Ferme la modale
      setShowAddModal(false);
    } catch (err) {
      console.error("Erreur lors de l'ajout du destinataire:", err);
      setErrorMessage("Une erreur s'est produite lors de l'enregistrement du destinataire.");
    }
  };

  return (
    <Box sx={{ ml: '240px', p: 3 }}>
      {/* Barre avec titre et bouton "Ajouter un destinataire" */}
      <AppBar position="static" color="default">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">Liste des Destinataires</Typography>
          <Button variant="contained" onClick={handleOpenAddModal}>
            Ajouter un destinataire
          </Button>
        </Toolbar>
      </AppBar>

      {/* Barre de recherche */}
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

      {/* Tableau des destinataires (4 colonnes seulement) */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date Création</TableCell>
                <TableCell>Nom du destinataire</TableCell>
                <TableCell>Adresse</TableCell>
                <TableCell>Pays</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRecipients.map((recipient) => (
                <TableRow key={recipient.id_recipient_account}>
                  <TableCell>{formatDate(recipient.insertdate)}</TableCell>
                  <TableCell>{recipient.recipient_name}</TableCell>
                  <TableCell>
                    {recipient.address_1}
                    {recipient.address_2 ? `, ${recipient.address_2}` : ''}
                    {recipient.address_3 ? `, ${recipient.address_3}` : ''}
                  </TableCell>
                  <TableCell>
                    {recipient.country_symbol_fr_recipient || 'N/A'}
                  </TableCell>
                </TableRow>
              ))}

              {filteredRecipients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Aucun destinataire trouvé.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Modale d'ajout d'un destinataire (similaire Step2) */}
      <Dialog open={showAddModal} onClose={handleCloseAddModal} maxWidth="sm" fullWidth>
        <DialogTitle>Ajouter un destinataire</DialogTitle>
        <DialogContent dividers>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          {/* Nom du destinataire */}
          <TextField
            label="Nom du destinataire *"
            fullWidth
            variant="outlined"
            value={newRecipient.recipientName}
            onChange={(e) => handleNewRecipientChange('recipientName', e.target.value)}
            sx={{ mb: 2 }}
          />

          {/* Adresse1 obligatoire */}
          <TextField
            label="Adresse 1 *"
            fullWidth
            variant="outlined"
            value={newRecipient.address1}
            onChange={(e) => handleNewRecipientChange('address1', e.target.value)}
            sx={{ mb: 2 }}
          />

          {/* Adresse2 facultative */}
          <TextField
            label="Adresse 2"
            fullWidth
            variant="outlined"
            value={newRecipient.address2}
            onChange={(e) => handleNewRecipientChange('address2', e.target.value)}
            sx={{ mb: 2 }}
          />

          {/* address3 => ex. Code postal */}
          <TextField
            label="Adresse 3 (ex: Code postal)"
            fullWidth
            variant="outlined"
            value={newRecipient.address3}
            onChange={(e) => handleNewRecipientChange('address3', e.target.value)}
            sx={{ mb: 2 }}
          />

          {/* Pays */}
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
                <MenuItem key={c.id_country} value={c.symbol_fr}>
                  {c.symbol_fr}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Téléphone */}
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
