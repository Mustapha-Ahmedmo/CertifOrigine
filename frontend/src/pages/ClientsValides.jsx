import React, { useEffect, useState } from 'react';
import {
  deleteCustAccountFile,
  fetchSectors,
  getCustAccountInfo,
  updateCustAccount
} from '../services/apiServices';
import './Inscriptions.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEdit } from '@fortawesome/free-solid-svg-icons';
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
  Checkbox,
  Tabs,
  Tab,
  AppBar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardActions,
  Grid,
  useTheme,
  useMediaQuery
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
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
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

// Helper pour ne pas afficher "undefined"
const safeValue = (val) => {
  return val === undefined || val === null || val === 'undefined' ? '' : val;
};

// Retourne le texte pour la colonne "Implantation"
function getImplantationLabel(registration) {
  if (registration.in_free_zone) {
    return 'Zone franche';
  } else if (registration.other_business_type) {
    return 'Autre';
  } else {
    return 'Entreprise';
  }
}

const ClientsValides = () => {
  const [custAccounts, setCustAccounts] = useState([]);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('validé');

  // Modale édition
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedEditAccount, setSelectedEditAccount] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [sectors, setSectors] = useState([]);

  // Modale fichiers
  const [openFileModal, setOpenFileModal] = useState(false);
  const [selectedFileAccount, setSelectedFileAccount] = useState(null);
  const [fileData, setFileData] = useState({
    justificatifFile: null,
    justificatifFileName: ''
  });

  // Récupère les comptes selon le filtre
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        let status;
        if (selectedFilter === 'validé') {
          status = 2;
        } else if (selectedFilter === 'non validé') {
          status = 1;
        } else if (selectedFilter === 'rejeté') {
          status = 4;
        }
        const response = await getCustAccountInfo(null, status, true);
        const data = response.data || [];
        setCustAccounts(data);
      } catch (err) {
        console.error('Error fetching accounts:', err);
      }
    };
    fetchAccounts();
  }, [selectedFilter]);

  // Récupère les secteurs
  useEffect(() => {
    const fetchData = async () => {
      try {
        const sectorData = await fetchSectors();
        setSectors(sectorData);
      } catch (err) {
        console.error('Error fetching sectors:', err);
      }
    };
    fetchData();
  }, []);

  // Modale fichiers
  const handleOpenFileModal = (account) => {
    setSelectedFileAccount(account);
    setOpenFileModal(true);
  };

  const handleCloseFileModal = () => {
    setOpenFileModal(false);
    setSelectedFileAccount(null);
  };

  const handleDeleteFile = async (fileId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
      try {
        await deleteCustAccountFile(fileId, 0);
        setSelectedFileAccount((prev) => ({
          ...prev,
          files: prev.files.filter((file) => file.id_cust_account_files !== fileId)
        }));
        let status;
        if (selectedFilter === 'validé') {
          status = 2;
        } else if (selectedFilter === 'non validé') {
          status = 1;
        } else if (selectedFilter === 'rejeté') {
          status = 4;
        }
        const response = await getCustAccountInfo(null, status, true);
        const data = response.data || [];
        const sortedData = data.sort(
          (a, b) => new Date(b.insertdate) - new Date(a.insertdate)
        );
        setCustAccounts(sortedData);
        if (selectedFileAccount) {
          const updatedAccount = sortedData.find(
            (acc) => acc.id_cust_account === selectedFileAccount.id_cust_account
          );
          setSelectedFileAccount(updatedAccount);
        }
      } catch (error) {
        console.error('Error deleting file:', error);
        alert('Erreur lors de la suppression du fichier');
      }
    }
  };

  const handleFileModalChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileData((prev) => ({ ...prev, justificatifFile: file }));
    }
  };

  const handleSaveFileModal = async () => {
    console.log('Saving file changes for account', selectedFileAccount.id_cust_account, fileData);
    let status;
    if (selectedFilter === 'validé') {
      status = 2;
    } else if (selectedFilter === 'non validé') {
      status = 1;
    } else if (selectedFilter === 'rejeté') {
      status = 4;
    }
    const response = await getCustAccountInfo(null, status, true);
    const data = response.data || [];
    setCustAccounts(data);
    handleCloseFileModal();
  };

  useEffect(() => {
    if (selectedEditAccount && selectedEditAccount.files && selectedEditAccount.files.length > 0) {
      const existingFile = selectedEditAccount.files[0];
      setEditFormData((prev) => ({
        ...prev,
        justificatifFileName: safeValue(existingFile.file_origin_name)
      }));
    } else {
      setEditFormData((prev) => ({ ...prev, justificatifFileName: '' }));
    }
  }, [selectedEditAccount]);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  // Contact principal
  const handleOpenContactsModal = (account) => {
    setSelectedAccount(account);
    setShowContactModal(true);
  };

  const handleCloseContactsModal = () => {
    setSelectedAccount(null);
    setShowContactModal(false);
  };

  const handleFileClick = (file) => {
    const fileUrl = `${API_URL}/files/inscriptions/${new Date().getFullYear()}/${file.file_guid}`;
    window.open(fileUrl, '_blank');
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

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
      registration.trade_registration_num,
      registration.rchNumber,
      registration.licenseNumber,
      dateString
    ]
      .filter(Boolean)
      .map((val) => String(val).toLowerCase());
    return fields.some((field) => field.includes(search));
  });

  const handleOpenEditModal = (account) => {
    setSelectedEditAccount(account);
    let companyType = '';
    if (account.in_free_zone) {
      companyType = 'zoneFranche';
    } else if (!account.in_free_zone && account.other_business_type) {
      companyType = 'autres';
    } else {
      companyType = 'autre';
    }
    const justificatifFileName =
      account.files && account.files.length > 0
        ? safeValue(account.files[0].file_origin_name)
        : '';
    setEditFormData({
      companyName: safeValue(account.cust_name),
      legalForm: safeValue(account.legal_form),
      fullAddress: safeValue(account.full_address),
      country: safeValue(account.co_symbol_fr),
      sector: safeValue(account.sectorName?.symbol_fr),
      nif: safeValue(account.trade_registration_num),
      rchNumber: safeValue(account.register_number),
      licenseNumber: safeValue(account.identification_number),
      companyType,
      otherCompanyType: safeValue(account.other_business_type),
      justificatifFile: '',
      justificatifFileName
    });
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedEditAccount(null);
    setEditFormData({});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleJustificatifChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditFormData((prev) => ({
        ...prev,
        justificatifFile: file,
        justificatifFileName: ''
      }));
    }
  };

  const handleSaveEdit = async () => {
    if (
      (selectedEditAccount.in_free_zone && editFormData.companyType !== 'zoneFranche') ||
      (!selectedEditAccount.in_free_zone &&
        editFormData.companyType !== 'autre' &&
        editFormData.companyType !== 'autres')
    ) {
      if (!editFormData.justificatifFile) {
        alert(
          "Le type d'entreprise a changé. Veuillez réuploader le fichier justificatif."
        );
        return;
      }
    }
    const updateData = {
      id_cust_account: selectedEditAccount.id_cust_account,
      legal_form: editFormData.legalForm,
      cust_name: editFormData.companyName,
      trade_registration_num: editFormData.nif || '',
      in_free_zone: selectedEditAccount.in_free_zone,
      identification_number: editFormData.licenseNumber,
      register_number: editFormData.rchNumber,
      full_address: editFormData.fullAddress,
      id_sector: selectedEditAccount.id_sector,
      other_sector: selectedEditAccount.other_sector || '',
      id_country: selectedEditAccount.id_country,
      statut_flag: selectedEditAccount.statut_flag,
      idlogin: selectedEditAccount.idlogin_modify || 1,
      billed_cust_name: selectedEditAccount.billed_cust_name || '',
      bill_full_address: selectedEditAccount.bill_full_address || '',
      id_country_headoffice: selectedEditAccount.id_country_headoffice || null,
      other_legal_form: selectedEditAccount.other_legal_form || '',
      other_business_type:
        editFormData.companyType === 'autres'
          ? safeValue(editFormData.otherCompanyType)
          : '',
      companyType: editFormData.companyType || ''
    };
    if (editFormData.companyType === 'autre') {
      updateData.trade_registration_num = safeValue(editFormData.nif);
      updateData.register_number = safeValue(editFormData.rchNumber);
      updateData.identification_number = '';
      updateData.other_business_type = '';
    } else if (editFormData.companyType === 'zoneFranche') {
      updateData.trade_registration_num = '';
      updateData.register_number = '';
      updateData.identification_number = safeValue(editFormData.licenseNumber);
      updateData.other_business_type = '';
      updateData.in_free_zone = true;
    } else if (editFormData.companyType === 'autres') {
      updateData.trade_registration_num = '';
      updateData.register_number = '';
      updateData.identification_number = '';
      updateData.other_business_type = safeValue(editFormData.otherCompanyType);
      updateData.in_free_zone = false;
    } else {
      updateData.trade_registration_num = '';
      updateData.register_number = '';
      updateData.identification_number = '';
      updateData.other_business_type = '';
    }
    let status;
    if (selectedFilter === 'validé') {
      status = 2;
    } else if (selectedFilter === 'non validé') {
      status = 1;
    } else if (selectedFilter === 'rejeté') {
      status = 4;
    }
    await updateCustAccount(updateData);
    const response = await getCustAccountInfo(null, status, true);
    const data = response.data || [];
    const sortedData = data.sort(
      (a, b) => new Date(b.insertdate) - new Date(a.insertdate)
    );
    setCustAccounts(sortedData);
    handleCloseEditModal();
  };

  // Détection de l'affichage mobile
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Rendu en mode Table (desktop)
  const renderTableView = () => (
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
              <TableCell>Type d'entreprise</TableCell>
              <TableCell>Fichier Justificatifs</TableCell>
              <TableCell>Contact Principal</TableCell>
              <TableCell>Action</TableCell>
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
                <TableCell>{getImplantationLabel(registration)}</TableCell>
                <TableCell>
                  {registration.files && registration.files.length > 0 ? (
                    registration.files.map((file) => {
                      let fileDescription = file.txt_description_fr || 'Type inconnu';
                      if (fileDescription.toLowerCase().includes('nif')) {
                        fileDescription = 'Patente';
                      }
                      return (
                        <Button
                          key={file.id_files_repo}
                          variant="text"
                          size="small"
                          onClick={() => handleFileClick(file)}
                          style={{ color: '#C39408' }}
                        >
                          {fileDescription}
                        </Button>
                      );
                    })
                  ) : (
                    <Typography variant="body2">Aucun fichier</Typography>
                  )}
                  {registration.in_free_zone && registration.identification_number && (
                    <Box mt={1} fontStyle="italic">
                      Numéro de licence : <strong>{registration.identification_number}</strong>
                    </Box>
                  )}
                  {!registration.in_free_zone && registration.trade_registration_num && (
                    <Box mt={1} fontStyle="italic">
                      Patente : <strong>{registration.trade_registration_num}</strong>
                    </Box>
                  )}
                  {!registration.in_free_zone && registration.register_number && (
                    <Box mt={1} fontStyle="italic">
                      RCS : <strong>{registration.register_number}</strong>
                    </Box>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<FontAwesomeIcon icon={faEye} />}
                    onClick={() => handleOpenContactsModal(registration)}
                    style={{ color: '#C39408', borderColor: '#C39408' }}
                  >
                    Ouvrir
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<FontAwesomeIcon icon={faEdit} />}
                    onClick={() => handleOpenEditModal(registration)}
                    style={{ color: '#C39408', borderColor: '#C39408' }}
                  >
                    Modifier
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleOpenFileModal(registration)}
                    style={{ color: '#C39408', borderColor: '#C39408' }}
                  >
                    Gérer les fichiers
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );

  // Rendu en mode Card (mobile)
  const renderCardView = () => (
    <Grid container spacing={2}>
      {filteredAccounts.map((registration) => (
        <Grid item xs={12} key={registration.id_cust_account}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2">
                <strong>Date :</strong> {formatDate(registration.insertdate)}
              </Typography>
              <Typography variant="subtitle2">
                <strong>Client :</strong> {registration.legal_form} {registration.cust_name}
              </Typography>
              <Typography variant="subtitle2">
                <strong>Secteur :</strong> {registration.sectorName?.symbol_fr || 'N/A'}
              </Typography>
              <Typography variant="subtitle2">
                <strong>Adresse :</strong> {registration.full_address}
              </Typography>
              <Typography variant="subtitle2">
                <strong>Pays :</strong> {registration.co_symbol_fr}
              </Typography>
              <Typography variant="subtitle2">
                <strong>Type :</strong> {getImplantationLabel(registration)}
              </Typography>
              <Typography variant="subtitle2" sx={{ mt: 1 }}>
                <strong>Fichiers :</strong>
              </Typography>
              {registration.files && registration.files.length > 0 ? (
                registration.files.map((file) => {
                  let fileDescription = file.txt_description_fr || 'Type inconnu';
                  if (fileDescription.toLowerCase().includes('nif')) {
                    fileDescription = 'Patente';
                  }
                  return (
                    <Button
                      key={file.id_files_repo}
                      variant="text"
                      size="small"
                      onClick={() => handleFileClick(file)}
                      style={{ color: '#C39408' }}
                    >
                      {fileDescription}
                    </Button>
                  );
                })
              ) : (
                <Typography variant="body2">Aucun fichier</Typography>
              )}
              {registration.in_free_zone && registration.identification_number && (
                <Box mt={1} fontStyle="italic">
                  Numéro de licence : <strong>{registration.identification_number}</strong>
                </Box>
              )}
              {!registration.in_free_zone && registration.trade_registration_num && (
                <Box mt={1} fontStyle="italic">
                  Patente : <strong>{registration.trade_registration_num}</strong>
                </Box>
              )}
              {!registration.in_free_zone && registration.register_number && (
                <Box mt={1} fontStyle="italic">
                  RCS : <strong>{registration.register_number}</strong>
                </Box>
              )}
            </CardContent>
            <CardActions>
              <Button
                variant="outlined"
                size="small"
                startIcon={<FontAwesomeIcon icon={faEye} />}
                onClick={() => handleOpenContactsModal(registration)}
                style={{ color: '#C39408', borderColor: '#C39408' }}
              >
                Ouvrir
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<FontAwesomeIcon icon={faEdit} />}
                onClick={() => handleOpenEditModal(registration)}
                style={{ color: '#C39408', borderColor: '#C39408' }}
              >
                Modifier
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleOpenFileModal(registration)}
                style={{ color: '#C39408', borderColor: '#C39408' }}
              >
                Gérer les fichiers
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box sx={{ ml: { xs: '2px', md: '240px' }, p: 3 }} className="inscriptions-page-container">
      <AppBar position="static" color="default">
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          indicatorColor="secondary"
          textColor="inherit"
          variant="fullWidth"
          aria-label="Clients validés Tabs"
        >
          <Tab label={`CLIENTS (${custAccounts.length})`} {...a11yProps(0)} />
        </Tabs>
      </AppBar>

      {/* Boutons de filtre */}
      <Box sx={{ mt: 2, mb: 2, display: 'flex', gap: 2 }}>
        <Button
          variant={selectedFilter === 'validé' ? 'contained' : 'outlined'}
          onClick={() => setSelectedFilter('validé')}
          style={
            selectedFilter === 'validé'
              ? { backgroundColor: '#C39408', color: '#fff' }
              : { color: '#C39408', borderColor: '#C39408' }
          }
        >
          Clients Validés
        </Button>
        <Button
          variant={selectedFilter === 'non validé' ? 'contained' : 'outlined'}
          onClick={() => setSelectedFilter('non validé')}
          style={
            selectedFilter === 'non validé'
              ? { backgroundColor: '#C39408', color: '#fff' }
              : { color: '#C39408', borderColor: '#C39408' }
          }
        >
          Clients Non Validés
        </Button>
        <Button
          variant={selectedFilter === 'rejeté' ? 'contained' : 'outlined'}
          onClick={() => setSelectedFilter('rejeté')}
          style={
            selectedFilter === 'rejeté'
              ? { backgroundColor: '#C39408', color: '#fff' }
              : { color: '#C39408', borderColor: '#C39408' }
          }
        >
          Clients Rejetés
        </Button>
      </Box>

      {/* Recherche */}
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

      {isSmallScreen ? renderCardView() : renderTableView()}

      {/* Modale de gestion de fichiers */}
      <Dialog
        open={openFileModal}
        onClose={handleCloseFileModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Gérer les fichiers justificatifs</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {selectedFileAccount &&
            selectedFileAccount.files &&
            selectedFileAccount.files.length > 0 ? (
              selectedFileAccount.files.map((file) => (
                <Box
                  key={file.id_cust_account_files}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    mb: 1,
                    p: 1,
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                >
                  <Typography variant="body2">
                    {file.txt_description_fr}: {file.file_origin_name}
                  </Typography>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDeleteFile(file.id_cust_account)}
                  >
                    Supprimer
                  </Button>
                </Box>
              ))
            ) : (
              <Typography variant="body2">Aucun fichier associé</Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFileModal} color="error">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modale d'édition */}
      <Dialog
        open={openEditModal}
        onClose={handleCloseEditModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Modifier les informations du client</DialogTitle>
        <DialogContent>
          <Box component="form" noValidate sx={{ mt: 2 }}>
            <TextField
              margin="normal"
              fullWidth
              label="Nom de l'entreprise"
              name="companyName"
              value={safeValue(editFormData.companyName)}
              onChange={handleEditChange}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Statut juridique"
              name="legalForm"
              value={safeValue(editFormData.legalForm)}
              onChange={handleEditChange}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Adresse complète"
              name="fullAddress"
              value={safeValue(editFormData.fullAddress)}
              onChange={handleEditChange}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Pays"
              name="country"
              value={safeValue(editFormData.country)}
              onChange={handleEditChange}
              disabled
              InputProps={{ style: { backgroundColor: '#f0f0f0' } }}
            />
            <FormControl margin="normal" fullWidth>
              <InputLabel id="edit-company-type-label">Type d'entreprise</InputLabel>
              <Select
                labelId="edit-company-type-label"
                id="edit-company-type-select"
                name="companyType"
                value={safeValue(editFormData.companyType)}
                onChange={handleEditChange}
                label="Type d'entreprise"
              >
                <MenuItem value="autre">Entreprise</MenuItem>
                <MenuItem value="zoneFranche">Entreprise en zone franche</MenuItem>
                <MenuItem value="autres">Autre</MenuItem>
              </Select>
            </FormControl>
            {safeValue(editFormData.companyType) === 'autres' && (
              <TextField
                margin="normal"
                fullWidth
                label="Autre Entreprise Type"
                name="otherCompanyType"
                value={safeValue(editFormData.otherCompanyType)}
                onChange={handleEditChange}
              />
            )}
            <FormControl margin="normal" fullWidth>
              <InputLabel id="edit-sector-label">Secteur</InputLabel>
              <Select
                labelId="edit-sector-label"
                id="edit-sector-select"
                name="sector"
                value={safeValue(editFormData.sector)}
                onChange={handleEditChange}
                label="Secteur"
              >
                {sectors.map((sector) => (
                  <MenuItem key={sector.id_sector} value={sector.symbol_fr}>
                    {sector.symbol_fr.charAt(0).toUpperCase() +
                      sector.symbol_fr.slice(1).toLowerCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {safeValue(editFormData.companyType) === 'zoneFranche' ? (
              <TextField
                margin="normal"
                fullWidth
                label="Numéro de licence"
                name="licenseNumber"
                value={safeValue(editFormData.licenseNumber)}
                onChange={handleEditChange}
              />
            ) : safeValue(editFormData.companyType) === 'autre' ? (
              <>
                <TextField
                  margin="normal"
                  fullWidth
                  label="NIF"
                  name="nif"
                  value={safeValue(editFormData.nif)}
                  onChange={handleEditChange}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  label="Numéro RCS"
                  name="rchNumber"
                  value={safeValue(editFormData.rchNumber)}
                  onChange={handleEditChange}
                />
              </>
            ) : null}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditModal} color="error">
            Annuler
          </Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            style={{ backgroundColor: '#C39408', color: '#fff' }}
          >
            Sauvegarder
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modale Contact Principal */}
      <Dialog
        open={showContactModal && !!selectedAccount}
        onClose={handleCloseContactsModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Contact Principal</DialogTitle>
        <DialogContent>
          {selectedAccount?.main_contact ? (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Nom</TableCell>
                    <TableCell>Fonction</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Tél</TableCell>
                    <TableCell>Portable</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>{selectedAccount.main_contact.full_name || 'N/A'}</TableCell>
                    <TableCell>{selectedAccount.main_contact.position || 'N/A'}</TableCell>
                    <TableCell>{selectedAccount.main_contact.email || 'N/A'}</TableCell>
                    <TableCell>{selectedAccount.main_contact.phone_number || 'N/A'}</TableCell>
                    <TableCell>{selectedAccount.main_contact.mobile_number || 'N/A'}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography>Aucun contact principal trouvé</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseContactsModal} color="error">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientsValides;
