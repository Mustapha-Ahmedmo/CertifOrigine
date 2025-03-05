import React, { useState, useEffect } from 'react';
import { getCustAccountInfo } from '../services/apiServices';
import './Inscriptions.css'; // Retain your CSS classes
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
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
  // New: state to manage the selected filter (default is "validé")
  const [selectedFilter, setSelectedFilter] = useState('validé');
  const currentYear = new Date().getFullYear();

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default ClientsValides;