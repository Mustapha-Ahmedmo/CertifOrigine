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
  IconButton,
} from '@mui/material';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';

import Autocomplete from '@mui/material/Autocomplete';
import countryCodes from '../components/countryCodes';

// juste après vos imports utilitaires
const getFullAddress = (r) => r.address_1;

// Validation regex pour numéro international (+ ou 00, 8 à 16 chiffres)
const isValidInternationalPhone = (value) => {
  return /^(?:\+|00)[1-9][0-9]*$/.test(value) && value.length >= 8 && value.length <= 16;
};

// Validation numéro local : 4–13 chiffres, sans contrainte de 0
const isValidLocalPhone = (v) => /^\d{4,13}$/.test(String(v || '').replace(/\D/g, ''));

// helpers Autocomplete
const normalize = (s) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
const dialOptions = countryCodes.map((c) => ({ name: c.name, code: c.code, flag: c.flag }));

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
    address2: '',     // téléphone (édition: international / création: rempli à l’enregistrement)
    address3: '',
    country: '',
    // Champs spécifiques à la création
    phoneCode: '+253',
    phoneLocal: '',
  });
  const [errorMessage, setErrorMessage] = useState('');

  // nettoyage erreur si tel valide
  useEffect(() => {
    if (editingRecipientId) {
      if (newRecipient.address2 && isValidInternationalPhone(newRecipient.address2)) {
        setErrorMessage('');
      }
    } else {
      if (newRecipient.phoneLocal && isValidLocalPhone(newRecipient.phoneLocal)) {
        setErrorMessage('');
      }
    }
  }, [newRecipient.address2, newRecipient.phoneLocal, editingRecipientId]);

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
      const response = await fetchRecipients({ idListCA: customerAccountId, statutFlagR: 1 });
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

  // Ouvrir la modale d'édition (on ne change rien au comportement d’édition)
  const handleOpenEditModal = (recipient) => {
    setErrorMessage('');
    setEditingRecipientId(recipient.id_recipient_account);
    setNewRecipient({
      recipientName: recipient.recipient_name,
      address1: recipient.address_1,
      address2: recipient.address_2 || '',
      address3: recipient.address_3 || '',
      country: recipient.id_country_recipient ?? '',
      // champs création remis à défaut (non utilisés en édition)
      phoneCode: '+253',
      phoneLocal: '',
    });
    setShowAddModal(true);
  };

  // Ouvrir la modale d'ajout (nouveau comportement : indicatif + téléphone local)
  const handleOpenAddModal = () => {
    setErrorMessage('');
    setEditingRecipientId(null);
    setNewRecipient({
      recipientName: '',
      address1: '',
      address2: '', // sera rempli comme phoneCode + phoneLocal à l’enregistrement
      address3: '',
      country: '',
      phoneCode: '+253',
      phoneLocal: '',
    });
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
  };

  const handleNewRecipientChange = (field, value) => {
    setNewRecipient((prev) => ({ ...prev, [field]: value }));
  };

  // Lors de la sauvegarde, vérification des champs obligatoires et du téléphone
  const handleSaveNewRecipient = async () => {
    // validations communes
    if (!newRecipient.recipientName || !newRecipient.address1 || !newRecipient.address3 || !newRecipient.country) {
      setErrorMessage("Veuillez renseigner le nom, l'adresse, le code postal - ville et le pays.");
      return;
    }

    // Validation du téléphone selon mode
    if (editingRecipientId) {
      // Édition : format international dans address2
      if (!newRecipient.address2) {
        setErrorMessage("Veuillez renseigner le numéro de téléphone.");
        return;
      }
      if (!isValidInternationalPhone(newRecipient.address2)) {
        setErrorMessage("Numéro de téléphone invalide. Format international requis (+ ou 00, 8–16 chiffres).");
        return;
      }
    } else {
      // Création : indicatif + numéro local
      if (!newRecipient.phoneLocal) {
        setErrorMessage("Veuillez renseigner le numéro de téléphone.");
        return;
      }
      if (!isValidLocalPhone(newRecipient.phoneLocal)) {
        setErrorMessage("Numéro local invalide. 4 à 13 chiffres (sans indicatif).");
        return;
      }
    }

    try {
      setErrorMessage('');

      // Compose le téléphone pour la création, inchangé en édition
      const phoneToSave = editingRecipientId
  ? newRecipient.address2
  : `${newRecipient.phoneCode}${newRecipient.phoneLocal.replace(/^0+/, '')}`;
      const payload = {
        idRecipientAccount: editingRecipientId ? editingRecipientId : null,
        idCustAccount: customerAccountId,
        recipientName: newRecipient.recipientName,
        address1: newRecipient.address1,
        address2: phoneToSave,          // <- on enregistre ici le téléphone
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

  // Suppression (désactivation) – inchangé, si besoin de réactiver, tu as déjà la logique ailleurs
  const handleDelete = async (recipient) => {
    if (!window.confirm('Voulez-vous vraiment désactiver ce destinataire ?')) return;
    try {
      const payload = {
        idRecipientAccount: recipient.id_recipient_account,
        idCustAccount: recipient.id_cust_account,
        recipientName: recipient.recipient_name,
        address1: recipient.address_1,
        address2: recipient.address_2,
        address3: recipient.address_3,
        idCountry: recipient.id_country_recipient,
        statutFlag: 2,
        activationDate: recipient.activation_date,
        deactivationDate: new Date().toISOString(),
        idLoginInsert: recipient.idlogin_insert,
        idLoginModify: user?.id_login_user || 1,
        phone_number: recipient.phone_number,
      };

      await addRecipient(payload);
      await loadRecipients();
      alert('Destinataire désactivé avec succès.');
    } catch (err) {
      console.error('Erreur lors de la suppression du destinataire:', err);
      alert('Impossible de supprimer ce destinataire.');
    }
  };

  // ----- RENDU Desktop : Table -----
  const renderDesktopTable = () => (
    <Paper sx={{ borderRadius: 4, overflow: 'hidden' }}>
      <TableContainer sx={{ overflowX: 'auto', borderRadius: 2, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date Création</TableCell>
              <TableCell>Nom du destinataire</TableCell>
              <TableCell>Adresse</TableCell>
              <TableCell>N° de téléphone</TableCell>
              <TableCell>Code postal / Ville</TableCell>
              <TableCell>Pays</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recipients.map((recipient) => (
              <TableRow key={recipient.id_recipient_account}>
                <TableCell>{formatDate(recipient.insertdate)}</TableCell>
                <TableCell>{recipient.recipient_name}</TableCell>
                <TableCell>{getFullAddress(recipient)}</TableCell>
                <TableCell>{recipient.address_2 || 'N/A'}</TableCell>
                <TableCell>{recipient.address_3 || 'N/A'}</TableCell>
                <TableCell>{recipient.country_symbol_fr_recipient || 'N/A'}</TableCell>
                <TableCell align="center" sx={{ p: 0, textAlign: 'center' }}>
                  <IconButton onClick={(e) => handleMenuOpen(e, recipient)}>
                    <FontAwesomeIcon icon={faEllipsisV} style={{ color: '#DCAF26' }} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {recipients.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
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
        <Paper key={recipient.id_recipient_account} sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1, borderRadius: 2 }}>
          <Typography variant="body2"><strong>Date Création : </strong> {formatDate(recipient.insertdate)}</Typography>
          <Typography variant="body2"><strong>Nom du destinataire : </strong> {recipient.recipient_name}</Typography>
          <Typography variant="body2"><strong>Adresse : </strong> {getFullAddress(recipient)}</Typography>
          <Typography variant="body2"><strong>Code postal / Ville : </strong> {recipient.address_3 || 'N/A'}</Typography>
          <Typography variant="body2"><strong>Pays : </strong> {recipient.country_symbol_fr_recipient || 'N/A'}</Typography>
          <Typography variant="body2"><strong>N° de téléphone : </strong> {recipient.address_2 || 'N/A'}</Typography>
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

  // Recherche (à implémenter si besoin)
  const handleSearch = (e) => setSearchTerm(e.target.value);

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
      <AppBar position="static" color="default" sx={{ borderRadius: 4 }}>
        <Toolbar sx={{ position: 'relative', px: 2 }}>
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
            LISTE DES DESTINATAIRES
          </Typography>
          <Button
            variant="contained"
            onClick={handleOpenAddModal}
            size="small"
            sx={{
              backgroundColor: '#DCAF26',
              fontSize: { xs: '0.7rem', sm: '0.85rem' },
              px: { xs: 1, sm: 2 },
              py: { xs: 0.5, sm: 1 },
              borderRadius: 2,
              ml: 'auto',
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

      <Dialog open={showAddModal} onClose={handleCloseAddModal} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
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
            label="Adresse *"
            fullWidth
            variant="outlined"
            value={newRecipient.address1}
            onChange={(e) => handleNewRecipientChange('address1', e.target.value)}
            sx={{ mb: 2 }}
          />

          {/* Téléphone – Ajout : Autocomplete indicatif + numéro local | Édition : champ international */}
          {editingRecipientId ? (
            <TextField
              label="N° de téléphone * (format international)"
              fullWidth
              variant="outlined"
              value={newRecipient.address2}
              onChange={(e) => handleNewRecipientChange('address2', e.target.value)}
              onBlur={() => {
                if (newRecipient.address2 && !isValidInternationalPhone(newRecipient.address2)) {
                  setErrorMessage('Numéro invalide (+ ou 00, 8–16 chiffres)');
                }
              }}
              error={!!errorMessage && newRecipient.address2 && !isValidInternationalPhone(newRecipient.address2)}
              helperText={newRecipient.address2 && !isValidInternationalPhone(newRecipient.address2) ? 'Format incorrect.' : ''}
              sx={{ mb: 2 }}
            />
          ) : (
            <>
              <Autocomplete
                options={dialOptions}
                value={dialOptions.find((o) => o.code === newRecipient.phoneCode) || null}
                onChange={(_, val) => {
                  if (val) handleNewRecipientChange('phoneCode', val.code);
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
                  const current = dialOptions.find((o) => o.code === newRecipient.phoneCode);
                  return (
                    <TextField
                      {...params}
                      label="Indicatif (téléphone)"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: current ? <Box mr={1}>{current.flag}</Box> : params.InputProps.startAdornment,
                      }}
                      fullWidth
                      sx={{ mb: 2 }}
                    />
                  );
                }}
                autoHighlight
                disableClearable
                fullWidth
              />

              <TextField
                label="N° de téléphone local *"
                fullWidth
                variant="outlined"
                value={newRecipient.phoneLocal}
  onChange={(e) => {
    // n’autoriser que des chiffres et limiter à 13
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 13);
    handleNewRecipientChange('phoneLocal', digitsOnly);
  }}
  inputProps={{ maxLength: 13, inputMode: 'numeric' }}
  error={!!newRecipient.phoneLocal && !isValidLocalPhone(newRecipient.phoneLocal)}
  helperText={
    !!newRecipient.phoneLocal && !isValidLocalPhone(newRecipient.phoneLocal)
      ? '4 à 13 chiffres (sans indicatif)'
      : ''
  }
/>
            </>
          )}

          <TextField
            label="Code postal - Ville *"
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
              {countries.map((c) => (
                <MenuItem key={c.id_country} value={c.id_country}>
                  {c.symbol_fr}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseAddModal}>Annuler</Button>
          <Button variant="contained" onClick={handleSaveNewRecipient} sx={{ backgroundColor: '#DCAF26' }}>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- menu Actions : Modifier (désactiver laissé en commentaire) --- */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            handleOpenEditModal(selectedRow);
            handleMenuClose();
          }}
        >
          Modifier
        </MenuItem>

        {/* 
        <MenuItem
          onClick={() => {
            if (selectedRow) handleDelete(selectedRow);
            handleMenuClose();
          }}
        >
          Désactiver
        </MenuItem> 
        */}
      </Menu>
    </Box>
  );
};

export default DestinataireList;
