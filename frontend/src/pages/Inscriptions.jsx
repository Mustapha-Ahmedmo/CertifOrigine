import React, { useEffect, useState } from 'react';
import {
  getCustAccountInfo,
  updateCustAccountStatus,
  rejectCustAccount,
} from '../services/apiServices';
import { formatDate } from '../utils/dateUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';

// --- MUI ---
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
  Checkbox,
  Tabs,
  Tab,
  AppBar,
} from '@mui/material';

// --- CSS perso ---
import './Inscriptions.css';

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
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
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

const Inscriptions = () => {
  const [custAccounts, setCustAccounts] = useState([]);
  const [removingAccounts, setRemovingAccounts] = useState([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingAccountId, setRejectingAccountId] = useState(null);

  // État pour la modal de contacts
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  // État du champ de recherche
  const [searchTerm, setSearchTerm] = useState('');

  // État de l'onglet sélectionné
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  useEffect(() => {
    const fetchCustAccounts = async () => {
      try {
        const response = await getCustAccountInfo(null, 1, true);
        const data = response.data || [];
        setCustAccounts(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCustAccounts();
  }, []);

  const handleFileClick = (file) => {
    const fileUrl = `${API_URL}/files/inscriptions/${new Date().getFullYear()}/${file.file_guid}`;
    window.open(fileUrl, '_blank');
  };

  const handleValidate = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir valider cette inscription ?')) {
      return;
    }
    try {
      await updateCustAccountStatus(id);
      alert('Le statut du compte client a été mis à jour avec succès.');
      setRemovingAccounts((prev) => [...prev, id]);
      setTimeout(() => {
        setCustAccounts((prevAccounts) =>
          prevAccounts.filter((account) => account.id_cust_account !== id)
        );
        setRemovingAccounts((prev) =>
          prev.filter((accountId) => accountId !== id)
        );
      }, 300);

      window.dispatchEvent(new Event('updateInscriptionCount'));
    } catch (err) {
      alert(`Erreur lors de la mise à jour du statut : ${err.message}`);
    }
  };

  const handleReject = (id) => {
    setRejectingAccountId(id);
    setShowRejectModal(true);
  };

  const submitRejection = async () => {
    if (!rejectionReason.trim()) {
      alert('Veuillez entrer une raison de rejet.');
      return;
    }

    try {
      const idlogin = 1; // Remplace par l'ID opérateur réel
      await rejectCustAccount(rejectingAccountId, rejectionReason, idlogin);

      alert('Le compte client a été rejeté avec succès.');
      setRemovingAccounts((prev) => [...prev, rejectingAccountId]);
      setTimeout(() => {
        setCustAccounts((prevAccounts) =>
          prevAccounts.filter((account) => account.id_cust_account !== rejectingAccountId)
        );
        setRemovingAccounts((prev) =>
          prev.filter((accountId) => accountId !== rejectingAccountId)
        );
      }, 300);

      window.dispatchEvent(new Event('updateInscriptionCount'));

      setShowRejectModal(false);
      setRejectingAccountId(null);
      setRejectionReason('');
    } catch (err) {
      alert(`Erreur lors du rejet : ${err.message}`);
    }
  };

  // Gère la recherche textuelle
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filtrage : recherche sur plusieurs champs
  const filteredAccounts = custAccounts.filter((registration) => {
    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;

    const dateString = formatDate(registration.insertdate);

    const fields = [
      registration.cust_name,
      registration.legal_form,
      registration.full_address,
      registration.co_symbol_fr,
      registration.sectorName?.symbol_fr,
      registration.nif,
      registration.rchNumber,
      registration.licenseNumber,
      dateString,
    ]
      .filter(Boolean)
      .map((val) => String(val).toLowerCase());

    return fields.some((field) => field.includes(search));
  });

  // Ouvre la modal de contacts
  const handleOpenContactsModal = (account) => {
    setSelectedAccount(account);
    setShowContactModal(true);
  };

  // Ferme la modal de contacts
  const handleCloseContactsModal = () => {
    setSelectedAccount(null);
    setShowContactModal(false);
  };

  return (
    <Box sx={{ p: 3 }} className="inscriptions-page-container">
      {/* Barre d'onglets */}
      <AppBar position="static" color="default">
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          indicatorColor="secondary"
          textColor="inherit"
          variant="fullWidth"
          aria-label="Inscriptions Tabs"
        >
          {/* Ici, on pourrait ajouter d'autres Tab si besoin */}
          <Tab
            label={`Inscriptions à valider (${custAccounts.length})`}
            {...a11yProps(0)}
          />
        </Tabs>
      </AppBar>

      {/* Panel pour l'onglet "Inscriptions à valider" */}
      <TabPanel value={tabIndex} index={0}>
        {/* Barre de recherche */}
        <Box mb={2} display="flex" alignItems="center" gap={2}>
          <Typography>Rechercher :</Typography>
          <TextField
            id="searchInput"
            variant="outlined"
            placeholder="Tapez un mot-clé ou un chiffre..."
            size="small"
            value={searchTerm}
            onChange={handleSearch}
            style={{ maxWidth: '300px' }}
          />
        </Box>

        {/* Tableau */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Secteur</TableCell>
                  <TableCell>Adresse Complète</TableCell>
                  <TableCell>Pays</TableCell>
                  <TableCell>Implantation</TableCell>
                  <TableCell>Fichier Justificatifs</TableCell>
                  <TableCell>Contact Principal</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAccounts.map((registration) => {
                  const isRemoving = removingAccounts.includes(registration.id_cust_account);

                  return (
                    <TableRow
                      key={registration.id_cust_account}
                      className={isRemoving ? 'fade-out' : ''}
                    >
                      <TableCell>{formatDate(registration.insertdate)}</TableCell>
                      <TableCell>
                        {registration.legal_form} {registration.cust_name}
                      </TableCell>
                      <TableCell>
                        {registration.sectorName?.symbol_fr || 'N/A'}
                      </TableCell>
                      <TableCell>{registration.full_address}</TableCell>
                      <TableCell>{registration.co_symbol_fr}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Checkbox
                            checked={registration.in_free_zone}
                            readOnly
                            size="small"
                          />
                          <Typography variant="body2">Zone franche</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {/* Affichage des fichiers existants */}
                        {registration.files && registration.files.length > 0 ? (
                          registration.files.map((file) => {
                            let fileDescription = file.txt_description_fr || 'Type inconnu';
                            if (fileDescription === 'NIF' && registration.nif) {
                              fileDescription += ` (${registration.nif})`;
                            } else if (
                              fileDescription === 'Immatriculation RCS' &&
                              registration.rchNumber
                            ) {
                              fileDescription += ` (${registration.rchNumber})`;
                            } else if (
                              fileDescription === 'Numéro de licence' &&
                              registration.licenseNumber
                            ) {
                              fileDescription += ` (${registration.licenseNumber})`;
                            }

                            return (
                              <Button
                                key={file.id_files_repo}
                                variant="text"
                                onClick={() => handleFileClick(file)}
                                size="small"
                                style={{ marginRight: '6px' }}
                              >
                                {fileDescription}
                              </Button>
                            );
                          })
                        ) : (
                          <Typography variant="body2">Aucun fichier</Typography>
                        )}

                        {registration.in_free_zone && registration.trade_registration_num && (
                          <Box mt={1} fontStyle="italic">
                            Numéro de licence :{' '}
                            <strong>{registration.trade_registration_num}</strong>
                          </Box>
                        )}
                        {!registration.in_free_zone && registration.nif && (
                          <Box mt={1} fontStyle="italic">
                            NIF : <strong>{registration.nif}</strong>
                          </Box>
                        )}
                        {!registration.in_free_zone && registration.rchNumber && (
                          <Box mt={1} fontStyle="italic">
                            RCS : <strong>{registration.rchNumber}</strong>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<FontAwesomeIcon icon={faEye} />}
                          onClick={() => handleOpenContactsModal(registration)}
                        >
                          Ouvrir
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" flexDirection="column" gap={1}>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => handleValidate(registration.id_cust_account)}
                          >
                            Valider
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => handleReject(registration.id_cust_account)}
                          >
                            Rejeter
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </TabPanel>

      {/* Dialog pour fiche de contacts */}
      <Dialog
        open={showContactModal && !!selectedAccount}
        onClose={handleCloseContactsModal}
        fullWidth
      >
        <DialogTitle>
          LISTING DES CONTACTS DE LA SOCIÉTÉ "{selectedAccount?.cust_name}"
        </DialogTitle>
        <DialogContent>
          {selectedAccount?.main_contact && (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Nom</TableCell>
                    <TableCell>Fonction</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Tél</TableCell>
                    <TableCell>Portable</TableCell>
                    <TableCell>Statut</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      {selectedAccount.main_contact.full_name}
                    </TableCell>
                    <TableCell>
                      {selectedAccount.main_contact.position || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {selectedAccount.main_contact.email || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {selectedAccount.main_contact.phone_number || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {selectedAccount.main_contact.mobile_number || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Checkbox checked readOnly size="small" />
                        <Typography variant="body2">Contact principal</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseContactsModal} variant="outlined">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog pour le rejet */}
      <Dialog
        open={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        fullWidth
      >
        <DialogTitle>Raison du rejet</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            minRows={3}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Entrez la raison du rejet..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={submitRejection}
            variant="contained"
            color="error"
          >
            Confirmer le rejet
          </Button>
          <Button
            onClick={() => setShowRejectModal(false)}
            variant="outlined"
          >
            Annuler
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Inscriptions;
