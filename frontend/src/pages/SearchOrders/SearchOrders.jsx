// SearchOrders.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  AppBar,
  Tabs,
  Tab,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Button,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import './SearchOrders.css';
import { formatDate } from '../../utils/dateUtils';
import { getOrderOpInfo } from '../../services/apiServices';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`search-tabpanel-${index}`}
      aria-labelledby={`search-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography component="div">{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `search-tab-${index}`,
    'aria-controls': `search-tabpanel-${index}`,
  };
}

const SearchOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();

  // Get the operator info from Redux
  const user = useSelector((state) => state.auth.user);
  const operatorId = user?.id_login_user;

  // Current year for filtering
  const currentYear = new Date().getFullYear();

  // Function to fetch orders for the operator using statuses 5, 8, 9
  const fetchOrders = async () => {
    if (!operatorId) return;
    try {
      setLoading(true);
      // Call the API with p_id_orderstatus_list set to "5,8,9"
      const params = {
        p_id_order_list: null,
        p_id_custaccount_list: null,
        p_id_orderstatus_list: "5,8,9",
        p_idlogin: operatorId,
      };
      const result = await getOrderOpInfo(params);
      let loadedOrders = result.data || result;
      // Filter orders for the current year based on their insert date
      loadedOrders = loadedOrders.filter(order => {
        if (!order.insertdate_order) return false;
        const orderYear = new Date(order.insertdate_order).getFullYear();
        return orderYear === currentYear;
      });
      setOrders(loadedOrders);
    } catch (err) {
      console.error('Error loading orders for search:', err);
      setError(err.message || "Erreur lors du chargement des commandes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (operatorId) fetchOrders();
  }, [operatorId]);

  // Navigation to order details page
  const handleDetailsClick = (order) => {
    const certifId = order.id_ord_certif_ori || '';
    navigate(`/dashboard/operator/oporderdetails?orderId=${order.id_order}&certifId=${certifId}`);
  };

  // Pagination state and handlers
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return <div>Chargement des commandes...</div>;
  }
  if (error) {
    return <div>{error}</div>;
  }

  const paginatedOrders = orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <div className="search-orders-container" style={{ marginLeft: '240px' }}>
  
      <Typography variant="h4" sx={{ mb: 2, mt: 2 }}>
        Commandes de l'année {currentYear} (Statuts: 5, 8, 9)
      </Typography>
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
                  <TableCell>{order.insertdate_order ? new Date(order.insertdate_order).toLocaleString() : '-'}</TableCell>
                  <TableCell>{order.id_order}</TableCell>
                  <TableCell>{order.cust_name}</TableCell>
                  <TableCell>{order.order_title}</TableCell>
                  <TableCell>{order.date_last_submission ? formatDate(order.date_last_submission) : '-'}</TableCell>
                  <TableCell>{order.date_validation_order ? formatDate(order.date_validation_order) : '-'}</TableCell>
                  <TableCell>
                    <Button variant="contained" color="primary" size="small" onClick={() => handleDetailsClick(order)}>
                      <FontAwesomeIcon icon={faEye} /> Détails
                    </Button>
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

SearchOrders.propTypes = {
  // You can define propTypes here if needed
};

export default SearchOrders;