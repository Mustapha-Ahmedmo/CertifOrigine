import React, { useState, useEffect } from 'react';
import { deleteCustAccountFile, fetchSectors, getCustAccountInfo, setCustAccount, updateCustAccount } from '../services/apiServices';
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

// Helper component for tab panels (unchanged)
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

// Helper function to ensure safe values (avoiding "undefined" as a string)
const safeValue = (val) => {
  return (val === undefined || val === null || val === "undefined") ? "" : val;
};

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

  // New state for file modal
  const [openFileModal, setOpenFileModal] = useState(false);
  const [selectedFileAccount, setSelectedFileAccount] = useState(null);
  const [fileData, setFileData] = useState({
    justificatifFile: null,
    justificatifFileName: ""
  });

  const handleOpenFileModal = (account) => {
    setSelectedFileAccount(account);
    setOpenFileModal(true);
  };

  const handleCloseFileModal = () => {
    setOpenFileModal(false);
    setSelectedFileAccount(null);
  };

  // Handler for deleting a file
  const handleDeleteFile = async (fileId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce fichier ?")) {
      try {
        await deleteCustAccountFile(fileId, 0);
        // Update the selectedFileAccount's files list after deletion:
        setSelectedFileAccount(prev => ({
          ...prev,
          files: prev.files.filter(file => file.id_cust_account_files !== fileId)
        }));


        let status;
        if (selectedFilter === "validé") {
          status = 2;
        } else if (selectedFilter === "non validé") {
          status = 1;
        } else if (selectedFilter === "rejeté") {
          status = 4;
        }
        // 

        const response = await getCustAccountInfo(null, status, true);
        const data = response.data || [];
        // Sort the list by insert date descending (most recent first)
        const sortedData = data.sort((a, b) => new Date(b.insertdate) - new Date(a.insertdate));
        setCustAccounts(sortedData);

        // If the file was deleted for a currently open account, update that account's state
        if (selectedFileAccount) {
          const updatedAccount = sortedData.find(
            (acc) => acc.id_cust_account === selectedFileAccount.id_cust_account
          );
          setSelectedFileAccount(updatedAccount);
        }

      } catch (error) {
        console.error("Error deleting file:", error);
        alert("Erreur lors de la suppression du fichier");
      }
    }
  };

  const handleFileModalChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileData((prev) => ({ ...prev, justificatifFile: file }));
    }
  };

  // Handler to update the file (for example, call your delete then upload APIs)
  const handleSaveFileModal = async () => {
    // Here you can implement your logic:
    // - If fileData.justificatifFile is set, upload this new file (using your API, e.g., setOrderFiles or a dedicated file update API)
    // - Otherwise, if no new file is selected, do nothing (the old file remains)
    // For now, we'll just log the file data:
    console.log("Saving file changes for account", selectedFileAccount.id_cust_account, fileData);

    // Then, you might want to refetch the customer accounts to update the grid
    // For example:
    const status = selectedFilter === 'validé' ? 2 : selectedFilter === 'non validé' ? 1 : 4;
    const response = await getCustAccountInfo(null, status, true);
    const data = response.data || [];
    setCustAccounts(data);

    handleCloseFileModal();
  };

  useEffect(() => {
    if (selectedEditAccount && selectedEditAccount.files && selectedEditAccount.files.length > 0) {
      // For example, pick the first file as the justificatif
      const existingFile = selectedEditAccount.files[0];
      setEditFormData(prev => ({ ...prev, justificatifFileName: safeValue(existingFile.file_origin_name) }));
    } else {
      setEditFormData(prev => ({ ...prev, justificatifFileName: "" }));
    }
  }, [selectedEditAccount]);

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
      registration.trade_registration_num,
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

    const justificatifFileName =
      account.files && account.files.length > 0
        ? safeValue(account.files[0].file_origin_name)
        : "";

    console.log("account => ", account.files[0]);


    console.log("justificatifFileName => ", justificatifFileName);
    setEditFormData({
      companyName: safeValue(account.cust_name),
      legalForm: safeValue(account.legal_form),
      fullAddress: safeValue(account.full_address),
      country: safeValue(account.co_symbol_fr),
      sector: safeValue(account.sectorName?.symbol_fr),
      nif: safeValue(account.trade_registration_num),
      rchNumber: safeValue(account.register_number),
      licenseNumber: safeValue(account.identification_number),
      companyType: companyType,
      otherCompanyType: safeValue(account.other_business_type),
      justificatifFile: "", // new field for the justificatif file if needed,
      justificatifFileName: justificatifFileName,
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
      // When a new file is selected, update the state.
      setEditFormData((prev) => ({
        ...prev,
        justificatifFile: file,
        // You might clear the existing file name so that the new file is used:
        justificatifFileName: "",
      }));
    }
  };

  // Handler to save modifications (update API call should be implemented here)
  const handleSaveEdit = async () => {
    console.log('Saving updated account data:', editFormData);

    if (
      (selectedEditAccount.in_free_zone && editFormData.companyType !== "zoneFranche") ||
      (!selectedEditAccount.in_free_zone &&
        editFormData.companyType !== "autre" &&
        editFormData.companyType !== "autres")
    ) {
      // In this example, if the company type has changed so that the file requirements differ,
      // we force the user to upload a new file.
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
      // Set other_business_type based on companyType selection:
      other_business_type: editFormData.companyType === 'autres' ? safeValue(editFormData.otherCompanyType) : "",
      companyType: editFormData.companyType || "",
    };

    // Now conditionally update the identification fields based on company type.
    if (editFormData.companyType === "autre") {
      // Entreprise: keep NIF and RCS; empty license and other business type.
      updateData.trade_registration_num = safeValue(editFormData.nif);
      updateData.register_number = safeValue(editFormData.rchNumber);
      updateData.identification_number = "";
      updateData.other_business_type = "";
    } else if (editFormData.companyType === "zoneFranche") {
      // Entreprise en zone franche: keep license number; empty NIF, RCS, and other business type.
      updateData.trade_registration_num = "";
      updateData.register_number = "";
      updateData.identification_number = safeValue(editFormData.licenseNumber);
      updateData.other_business_type = "";
      // Also, update in_free_zone to true
      updateData.in_free_zone = true;
    } else if (editFormData.companyType === "autres") {
      // Autre: empty NIF, RCS, and license; set other business type from the additional field.
      updateData.trade_registration_num = "";
      updateData.register_number = "";
      updateData.identification_number = "";
      updateData.other_business_type = safeValue(editFormData.otherCompanyType);
      // Also, update in_free_zone to false
      updateData.in_free_zone = false;
    } else {
      // Default: empty all identification fields.
      updateData.trade_registration_num = "";
      updateData.register_number = "";
      updateData.identification_number = "";
      updateData.other_business_type = "";
    }

    console.log('Updating customer account with:', updateData);
    let status;
    if (selectedFilter === 'validé') {
      status = 2;
    } else if (selectedFilter === 'non validé') {
      status = 1;
    } else if (selectedFilter === 'rejeté') {
      status = 4;
    }

    // Call the API service function to update the account.
    const result = await updateCustAccount(updateData);
    console.log('Update result:', result);
    const response = await getCustAccountInfo(null, status, true);
    const data = response.data || [];
    // Optionally, sort by date (keeping the same order)
    const sortedData = data.sort((a, b) => new Date(b.insertdate) - new Date(a.insertdate));
    setCustAccounts(sortedData);

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
                        if (fileDescription === 'NIF' && registration.trade_registration_number) {
                          fileDescription += ` (${registration.trade_registration_number})`;
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
                    {registration.in_free_zone && registration.identification_number && (
                      <Box mt={1} fontStyle="italic">
                        Numéro de licence : <strong>{registration.identification_number}</strong>
                      </Box>
                    )}
                    {!registration.in_free_zone && registration.trade_registration_num && (
                      <Box mt={1} fontStyle="italic">
                        NIF : <strong>{registration.trade_registration_num}</strong>
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
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="secondary"
                      size="small"
                      onClick={() => handleOpenFileModal(registration)}
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

      {/* File Management Modal */}
      <Dialog open={openFileModal} onClose={handleCloseFileModal} fullWidth maxWidth="sm">
        <DialogTitle>Gérer les fichiers justificatifs</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {selectedFileAccount && selectedFileAccount.files && selectedFileAccount.files.length > 0 ? (
              selectedFileAccount.files.map((file) => (
                <Box
                  key={file.id_cust_account_files}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 1, p: 1, border: '1px solid #ddd', borderRadius: '4px' }}
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
            {/* When "autres" is selected, display an additional text field */}
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
                    {sector.symbol_fr.charAt(0).toUpperCase() + sector.symbol_fr.slice(1).toLowerCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {/* Conditionally render identification fields based on company type */}
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
          <Button onClick={handleSaveEdit} color="primary" variant="contained">
            Sauvegarder
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientsValides;