import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import { fetchCountries, getOrderOpInfo } from '../../services/apiServices';
import { formatDate } from '../../utils/dateUtils';
import './SearchOrders.css';
import { generatePDF } from '../../components/orders/GeneratePDF'
// Constants for the multi-select dropdown
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

// List of status codes
const allStatuses = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// Mapping from status code to display name
const statusMap = {
  1: "insert",
  2: "new",
  3: "approved",
  4: "billed",
  5: "paid",
  6: "pending replace",
  7: "replaced",
  8: "Canceled",
  9: "Rejected"
};

const SearchOrders = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const operatorId = user?.id_login_user;
  const currentYear = new Date().getFullYear();

  // Filters state
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [searchText, setSearchText] = useState('');
  // Use a multi‑select dropdown for statuses (now with names)
  const [selectedStatuses, setSelectedStatuses] = useState([]);

  const [filterCertificate, setFilterCertificate] = useState(false);
  const [filterLegalisation, setFilterLegalisation] = useState(false);
  const [filterInvoice, setFilterInvoice] = useState(false);

  // Orders state
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Handler for multi‑select dropdown change
  const handleStatusChange = (event) => {
    const { target: { value } } = event;
    setSelectedStatuses(
      typeof value === 'string' ? value.split(',') : value
    );
  };

  const [countries, setCountries] = useState([]);
  useEffect(() => {
    const getCountries = async () => {
      try {
        const fetchedCountries = await fetchCountries();
        setCountries(fetchedCountries);
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };
    getCountries();
  }, []);

  // Fetch orders based on filters
  const fetchOrders = async () => {
    if (!operatorId) return;
    try {
      setLoading(true);
      // Build filter parameters; join selected statuses into a comma‑separated string if any
      const params = {
        p_id_order_list: orderNumber || null,
        p_id_custaccount_list: null,
        p_id_orderstatus_list: selectedStatuses.length > 0 ? selectedStatuses.join(',') : null,
        p_idlogin: operatorId,
        p_date_start: dateStart || null,
        p_date_end: dateEnd || null,
      };
      const result = await getOrderOpInfo(params);
      let loadedOrders = result.data || result;
      // Filter orders to include only those created in the current year.
      loadedOrders = loadedOrders.filter(order => {
        if (!order.insertdate_order) return false;
        const orderYear = new Date(order.insertdate_order).getFullYear();
        return orderYear === currentYear;
      });
      // Apply additional checkbox filters if any are selected.
      if (filterCertificate) {
        loadedOrders = loadedOrders.filter(order => order.id_ord_certif_ori);
      }
      if (filterLegalisation) {
        loadedOrders = loadedOrders.filter(order => order.id_ord_legalization);
      }
      if (filterInvoice) {
        loadedOrders = loadedOrders.filter(order => order.id_ord_com_invoice);
      }
      // Apply free‑text search on order title or customer name.
      if (searchText) {
        const lowerSearch = searchText.toLowerCase();
        loadedOrders = loadedOrders.filter(order =>
          (order.order_title && order.order_title.toLowerCase().includes(lowerSearch)) ||
          (order.cust_name && order.cust_name.toLowerCase().includes(lowerSearch))
        );
      }
      setOrders(loadedOrders);
    } catch (err) {
      console.error('Error loading orders for search:', err);
      setError(err.message || "Erreur lors du chargement des commandes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (operatorId) {
      fetchOrders();
    }
  }, [operatorId]);

  const handleApplyFilters = () => {
    fetchOrders();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDetailsClick = (order) => {
    const certifId = order.id_ord_certif_ori || '';
    navigate(`/dashboard/operator/oporderdetails?orderId=${order.id_order}&certifId=${certifId}`);
  };

  const handleGeneratePDF = (order) => {
    console.log('Génération de PDF pour la commande:', order);
    // Lookup country names based on the order's country IDs.
    const originCountry = countries.find(c => c.id_country === order.id_country_origin)?.symbol_fr || '';
    const destinationCountry = countries.find(c => c.id_country === order.id_country_destination)?.symbol_fr || '';
    const portLoading = countries.find(c => c.id_country === order.id_country_port_loading)?.symbol_fr || '';
    const portDischarge = countries.find(c => c.id_country === order.id_country_port_discharge)?.symbol_fr || '';

    const formData = {
      transportModes: order.transportModes || { road: false, sea: false, air: false },
      merchandises: order.merchandises || [],
      exporterName: order.cust_name || '',
      exporterAddress: [order.address_1, order.address_2, order.address_3].filter(Boolean).join(', '),
      exporterCity: order.city || '',
      originCountry,        // Country of origin name
      destinationCountry,   // Destination country name
      portLoading,          // Port de chargement name
      portDischarge,        // Port de déchargement name
    };

    // Now call generatePDF with the real formData
    generatePDF(formData);
  };


  const paginatedOrders = orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <div className="search-orders-container" style={{ marginLeft: '240px' }}>
      <Typography variant="h4" sx={{ mb: 2, mt: 2 }}>
        Recherche de Commandes - {currentYear}
      </Typography>
      {/* Filters Section */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Date de début"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={dateStart}
            onChange={(e) => setDateStart(e.target.value)}
          />
          <TextField
            label="Date de fin"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={dateEnd}
            onChange={(e) => setDateEnd(e.target.value)}
          />
          <TextField
            label="Numéro de commande"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
          />
          <TextField
            label="Recherche (Désignation ou Client)"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          {/* Multi-select dropdown for statuses with names */}
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel id="status-select-label">Status</InputLabel>
            <Select
              labelId="status-select-label"
              id="status-select"
              multiple
              value={selectedStatuses}
              onChange={handleStatusChange}
              input={<OutlinedInput label="Status" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={statusMap[value]} size="small" />
                  ))}
                </Box>
              )}
              MenuProps={MenuProps}
            >
              {allStatuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {statusMap[status]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {/* Existing additional filters */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <FormControlLabel
              control={<Checkbox checked={filterCertificate} onChange={(e) => setFilterCertificate(e.target.checked)} />}
              label="Certificat d'origine"
            />
            <FormControlLabel
              control={<Checkbox checked={filterLegalisation} onChange={(e) => setFilterLegalisation(e.target.checked)} />}
              label="Légalisation"
            />
            <FormControlLabel
              control={<Checkbox checked={filterInvoice} onChange={(e) => setFilterInvoice(e.target.checked)} />}
              label="Facture Commerciale"
            />
          </Box>
          <Button variant="contained" color="primary" onClick={handleApplyFilters}>
            Appliquer
          </Button>
        </Box>
      </Paper>
      {/* Orders Table */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 800 }} aria-label="orders table">
          <TableHead>
            <TableRow>
              <TableCell>Date de création</TableCell>
              <TableCell>N° de commande</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Désignation</TableCell>
              <TableCell>Date de soumission</TableCell>
              <TableCell>Date d'approbation</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedOrders.length > 0 ? (
              paginatedOrders.map((order) => (
                <TableRow key={order.id_order} hover>
                  <TableCell>
                    {order.insertdate_order
                      ? new Date(order.insertdate_order).toLocaleString()
                      : '-'}
                  </TableCell>
                  <TableCell>{order.id_order}</TableCell>
                  <TableCell>{order.cust_name}</TableCell>
                  <TableCell>{order.order_title}</TableCell>
                  <TableCell>
                    {order.date_last_submission
                      ? formatDate(order.date_last_submission)
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {order.date_validation_order
                      ? formatDate(order.date_validation_order)
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Button variant="contained" color="primary" size="small" onClick={() => handleDetailsClick(order)}>
                      <FontAwesomeIcon icon={faEye} /> Détails
                    </Button>
                    {order.id_order_status === 5 && (
                      <Button variant="contained" color="secondary" size="small" onClick={() => handleGeneratePDF(order)} sx={{ ml: 1 }}>
                        <FontAwesomeIcon icon={faFilePdf} /> Générer PDF
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7}>Aucune commande trouvée.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={orders.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />
    </div>
  );
};

export default SearchOrders;