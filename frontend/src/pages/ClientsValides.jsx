import React, { useEffect, useState } from 'react';
import { getCustAccountInfo } from '../services/apiServices';
import './Inscriptions.css'; // Conserve ton CSS pour certaines classes
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { formatDate } from '../utils/dateUtils';

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

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`clients-valides-tabpanel-${index}`}
      aria-labelledby={`clients-valides-tab-${index}`}
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
    id: `clients-valides-tab-${index}`,
    'aria-controls': `clients-valides-tabpanel-${index}`,
  };
}

const API_URL = import.meta.env.VITE_API_URL;

const ClientsValides = () => {
  const [custAccounts, setCustAccounts] = useState([]);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  // État du champ de recherche
  const [searchTerm, setSearchTerm] = useState('');

  // État pour la gestion des onglets (ici, un seul onglet, mais ça te permet d’en rajouter plus tard)
  const [tabIndex, setTabIndex] = useState(0);
  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  useEffect(() => {
    const fetchValidatedAccounts = async () => {
      try {
        // Récupère tous les comptes (2=validé, 1=inscrit, etc.)
        const response = await getCustAccountInfo(null, 2, true);
        const data = response.data || [];

        // Filtre localement pour ne garder que les comptes dont le statut est validé (statut_flag = 2)
        const onlyValidated = data.filter((account) => account.statut_flag === 2);
        setCustAccounts(onlyValidated);
      } catch (err) {
        console.error(err);
      }
    };
    fetchValidatedAccounts();
  }, []);

  // Ouvre la modal de contacts
  const handleOpenContactsModal = (account) => {
    setSelectedAccount(account);
    setShowContactModal(true);
  };

  // Ferme la modal
  const handleCloseContactsModal = () => {
    setSelectedAccount(null);
    setShowContactModal(false);
  };

  // Ouvrir fichier
  const handleFileClick = (file) => {
    const fileUrl = `${API_URL}/files/inscriptions/${new Date().getFullYear()}/${file.file_guid}`;
    window.open(fileUrl, '_blank');
  };

  // Saisie de la recherche
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filtrage texte
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

  return (
    // Décalage pour la sidebar : marginLeft: 240px
    <Box sx={{ ml: '240px', p: 3 }}>
      {/* Barre d’onglets */}
      <AppBar position="static" color="default">
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          indicatorColor="secondary"
          textColor="inherit"
          variant="fullWidth"
          aria-label="Clients validés Tabs"
        >
          <Tab
            label={`CLIENTS VALIDÉS (${custAccounts.length})`}
            {...a11yProps(0)}
          />
        </Tabs>
      </AppBar>

      {/* Contenu de l’onglet 0 */}
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
            style={{ maxWidth: 300 }}
          />
        </Box>

        {/* Tableau MUI */}
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
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAccounts.map((registration) => (
                  <TableRow key={registration.id_cust_account}>
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
                      {/* Affichage des fichiers */}
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
                              size="small"
                              onClick={() => handleFileClick(file)}
                              style={{ marginRight: '6px' }}
                            >
                              {fileDescription}
                            </Button>
                          );
                        })
                      ) : (
                        <Typography variant="body2">Aucun fichier</Typography>
                      )}

                      {/* Affichage explicite du numéro */}
                      {registration.in_free_zone && registration.licenseNumber && (
                        <Box mt={1} fontStyle="italic">
                          Numéro de licence :{' '}
                          <strong>{registration.licenseNumber}</strong>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </TabPanel>

      {/* Modal de contact via un Dialog MUI */}
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
                    <TableCell>{selectedAccount.main_contact.full_name}</TableCell>
                    <TableCell>{selectedAccount.main_contact.position || 'N/A'}</TableCell>
                    <TableCell>{selectedAccount.main_contact.email || 'N/A'}</TableCell>
                    <TableCell>{selectedAccount.main_contact.phone_number || 'N/A'}</TableCell>
                    <TableCell>{selectedAccount.main_contact.mobile_number || 'N/A'}</TableCell>
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
    </Box>
  );
};

export default ClientsValides;
