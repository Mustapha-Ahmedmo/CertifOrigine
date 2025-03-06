import React, { useState, useEffect } from 'react';
import { fetchSectors, getCustAccountInfo, setCustAccount, updateCustAccount } from '../services/apiServices';
import './Inscriptions.css'; // Retain your CSS classes
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

const ClientsValides = () => {
  const [custAccounts, setCustAccounts] = useState([]);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabIndex, setTabIndex] = useState(0);
  // State to manage the selected filter (default is "validé")
  const [selectedFilter, setSelectedFilter] = useState('validé');
  const currentYear = new Date().getFullYear();

  // States for the edit modal
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedEditAccount, setSelectedEditAccount] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [sectors, setSectors] = useState([]);

  // Fetch accounts based on the selected filter.
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
        console.error("Error fetching accounts:", err);
      }
    };
    fetchAccounts();
  }, [selectedFilter]);

  // Fetch sectors for the dropdown in the edit modal.
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

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

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

  // Filter accounts based on the search term
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

  // Open edit modal and preload form data
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

    setEditFormData({
      companyName: account.cust_name,
      legalForm: account.legal_form,
      fullAddress: account.full_address,
      country: account.co_symbol_fr,
      sector: account.sectorName?.symbol_fr || '',
      nif: account.trade_registration_num,
      rchNumber: account.register_number,
      licenseNumber: account.identification_number,
      companyType
      // You can add additional fields as needed.
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

  // Handler to save modifications (update API call should be implemented here)
  const handleSaveEdit = async () => {
    console.log('Saving updated account data:', editFormData);

    const updateData = {
      // Required by your stored procedure
      id_cust_account: selectedEditAccount.id_cust_account,
      legal_form: editFormData.legalForm, // Updated from the edit form
      cust_name: editFormData.companyName, // Updated from the edit form
      // For fields not edited in the modal, use the existing account values:
      trade_registration_num: editFormData.nif || '',
      in_free_zone: selectedEditAccount.in_free_zone,
      // We'll assume that the new license number is also the identification number:
      identification_number: editFormData.licenseNumber,
      // And that the RCS field corresponds to register_number:
      register_number: editFormData.rchNumber,

      full_address: editFormData.fullAddress,
      id_sector: selectedEditAccount.id_sector,
      other_sector: selectedEditAccount.other_sector || '',
      id_country: selectedEditAccount.id_country,
      statut_flag: selectedEditAccount.statut_flag, // Not changed here
      idlogin: selectedEditAccount.idlogin_modify || 1,
      billed_cust_name: selectedEditAccount.billed_cust_name || '',
      bill_full_address: selectedEditAccount.bill_full_address || '',
      id_country_headoffice: selectedEditAccount.id_country_headoffice || null,
      other_legal_form: selectedEditAccount.other_legal_form || '',
      other_business_type: selectedEditAccount.other_business_type || '',
      companyType: editFormData.companyType || ''
    };

    console.log('Updating customer account with:', updateData);
    let status;
    if (selectedFilter === 'validé') {
      status = 2;
    } else if (selectedFilter === 'non validé') {
      status = 1;
    } else if (selectedFilter === 'rejeté') {
      status = 4;
    }

    // Call the API service function
    const result = await updateCustAccount(updateData);
    console.log('Update result:', result);
    const response = await getCustAccountInfo(null, status, true);
    const data = response.data || [];
    setCustAccounts(data);

    handleCloseEditModal();
  };

  return (
    <Box sx={{ ml: '240px', p: 3 }}>
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

      {/* Filter Buttons */}
      <Box sx={{ mt: 2, mb: 2, display: 'flex', gap: 2 }}>
        <Button
          variant={selectedFilter === 'validé' ? 'contained' : 'outlined'}
          onClick={() => setSelectedFilter('validé')}
        >
          Clients Validés
        </Button>
        <Button
          variant={selectedFilter === 'non validé' ? 'contained' : 'outlined'}
          onClick={() => setSelectedFilter('non validé')}
        >
          Clients Non Validés
        </Button>
        <Button
          variant={selectedFilter === 'rejeté' ? 'contained' : 'outlined'}
          onClick={() => setSelectedFilter('rejeté')}
        >
          Clients Rejetés
        </Button>
      </Box>

      {/* Search Field */}
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

      {/* Accounts Table */}
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
                  <TableCell>{registration.sectorName?.symbol_fr || 'N/A'}</TableCell>
                  <TableCell>{registration.full_address}</TableCell>
                  <TableCell>{registration.co_symbol_fr}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Checkbox checked={registration.in_free_zone} readOnly size="small" />
                      <Typography variant="body2">Zone franche</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {registration.files && registration.files.length > 0 ? (
                      registration.files.map((file) => {
                        let fileDescription = file.txt_description_fr || 'Type inconnu';
                        if (fileDescription === 'NIF' && registration.nif) {
                          fileDescription += ` (${registration.nif})`;
                        } else if (fileDescription === 'Immatriculation RCS' && registration.rchNumber) {
                          fileDescription += ` (${registration.rchNumber})`;
                        } else if (fileDescription === 'Numéro de licence' && registration.licenseNumber) {
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
                    {registration.in_free_zone && registration.licenseNumber && (
                      <Box mt={1} fontStyle="italic">
                        Numéro de licence : <strong>{registration.licenseNumber}</strong>
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
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      startIcon={<FontAwesomeIcon icon={faEdit} />}
                      onClick={() => handleOpenEditModal(registration)}
                    >
                      Modifier
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Edit Modal */}
      <Dialog open={openEditModal} onClose={handleCloseEditModal} fullWidth maxWidth="sm">
        <DialogTitle>Modifier les informations du client</DialogTitle>
        <DialogContent>
          <Box component="form" noValidate sx={{ mt: 2 }}>
            <TextField
              margin="normal"
              fullWidth
              label="Nom de l'entreprise"
              name="companyName"
              value={editFormData.companyName || ''}
              onChange={handleEditChange}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Statut juridique"
              name="legalForm"
              value={editFormData.legalForm || ''}
              onChange={handleEditChange}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Adresse complète"
              name="fullAddress"
              value={editFormData.fullAddress || ''}
              onChange={handleEditChange}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Pays"
              name="country"
              value={editFormData.country || ''}
              onChange={handleEditChange}
              disabled
            />
            <FormControl margin="normal" fullWidth>
              <InputLabel id="edit-company-type-label">Type d'entreprise</InputLabel>
              <Select
                labelId="edit-company-type-label"
                id="edit-company-type-select"
                name="companyType"
                value={editFormData.companyType || ''}
                onChange={handleEditChange}
                label="Type d'entreprise"
              >
                <MenuItem value="autre">Entreprise</MenuItem>
                <MenuItem value="zoneFranche">Entreprise en zone franche</MenuItem>
                <MenuItem value="autres">Autre</MenuItem>
              </Select>
            </FormControl>
            <FormControl margin="normal" fullWidth>
              <InputLabel id="edit-sector-label">Secteur</InputLabel>
              <Select
                labelId="edit-sector-label"
                id="edit-sector-select"
                name="sector"
                value={editFormData.sector || ''}
                onChange={handleEditChange}
                label="Secteur"
              >
                {sectors.map((sector) => (
                  <MenuItem key={sector.id_sector} value={sector.symbol_fr}>
                    {sector.symbol_fr.charAt(0).toUpperCase() + sector.symbol_fr.slice(1).toLowerCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {/* Conditionally render identification fields */}
            {editFormData.companyType === 'zoneFranche' ? (
              <TextField
                margin="normal"
                fullWidth
                label="Numéro de licence"
                name="licenseNumber"
                value={editFormData.licenseNumber || ''}
                onChange={handleEditChange}
              />
            ) : editFormData.companyType === 'autre' ? (
              <>
                <TextField
                  margin="normal"
                  fullWidth
                  label="NIF"
                  name="nif"
                  value={editFormData.nif || ''}
                  onChange={handleEditChange}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  label="Numéro RCS"
                  name="rchNumber"
                  value={editFormData.rchNumber || ''}
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
          <Button onClick={handleSaveEdit} color="primary" variant="contained">
            Sauvegarder
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientsValides;