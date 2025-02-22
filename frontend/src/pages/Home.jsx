// Home.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getOrdersForCustomer, cancelOrder } from '../services/apiServices';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList,
  faCheckCircle,
  faDollarSign,
  faPlus,
  faEye,
  faUndo,
} from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TablePagination from '@mui/material/TablePagination';
import './Home.css';

// Composant TabPanel pour l'affichage du contenu de chaque onglet
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`home-tabpanel-${index}`}
      aria-labelledby={`home-tab-${index}`}
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
    id: `home-tab-${index}`,
    'aria-controls': `home-tabpanel-${index}`,
  };
}

const Home = () => {
  // États pour les commandes
  const [ordersVisa, setOrdersVisa] = useState([]);
  const [ordersValidation, setOrdersValidation] = useState([]);
  const [ordersPayment, setOrdersPayment] = useState([]);
  const [ordersReturned, setOrdersReturned] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // État pour l'onglet actif (index)
  const [tabIndex, setTabIndex] = useState(0);

  const user = useSelector((state) => state.auth.user);
  const idLogin = user?.id_login_user;
  const idCustAccount = user?.id_cust_account;
  const navigate = useNavigate();
  const theme = useTheme();

  // Fonction pour récupérer et classer les commandes
  const fetchOrders = async () => {
    if (!idLogin || !idCustAccount) return;
    try {
      setLoading(true);
      const response = await getOrdersForCustomer({
        idCustAccountList: idCustAccount,
        idLogin,
      });
      const allOrders = response.data || [];
      setOrdersVisa(allOrders.filter((order) => order.id_order_status === 1));
      setOrdersValidation(allOrders.filter((order) => order.id_order_status === 2));
      setOrdersPayment(allOrders.filter((order) => order.id_order_status === 3));
      setOrdersReturned(allOrders.filter((order) => order.id_order_status === 6));
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message || "Erreur lors de la récupération des commandes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [idLogin, idCustAccount]);

  const options = [
    { value: 'visa', label: `Mes commandes à soumettre (${ordersVisa.length})` },
    { value: 'validation', label: `Mes commandes en attente de la CCD (${ordersValidation.length})` },
    { value: 'payment', label: `Mes commandes en attente de paiement (${ordersPayment.length})` },
    { value: 'returned', label: `Mes commandes retournées par la CDD (${ordersReturned.length})` },
  ];

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  if (loading) {
    return <div className="loading">Chargement des commandes...</div>;
  }
  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="home-container">
      <Helmet>
        <title>Dashboard</title>
      </Helmet>
      <div className="home-welcome-message">
        Bienvenue <span className="home-highlight-text">{user?.companyname}</span>
      </div>
      {/* Conteneur centré pour les onglets et le tableau */}
      <div className="home-tabs-container">
        <Box sx={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          <AppBar position="static" color="default">
            <Tabs
              value={tabIndex}
              onChange={handleTabChange}
              indicatorColor="secondary"
              textColor="inherit"
              variant="fullWidth"
              aria-label="Dashboard Tabs"
            >
              {options.map((option, index) => (
                <Tab key={option.value} label={option.label} {...a11yProps(index)} />
              ))}
            </Tabs>
          </AppBar>
          <TabPanel value={tabIndex} index={0} dir={theme.direction}>
            <OrderTable orders={ordersVisa} refreshOrders={fetchOrders} />
          </TabPanel>
          <TabPanel value={tabIndex} index={1} dir={theme.direction}>
            <OrderTable orders={ordersValidation} refreshOrders={fetchOrders} />
          </TabPanel>
          <TabPanel value={tabIndex} index={2} dir={theme.direction}>
            <OrderTable orders={ordersPayment} refreshOrders={fetchOrders} />
          </TabPanel>
          <TabPanel value={tabIndex} index={3} dir={theme.direction}>
            <OrderTable orders={ordersReturned} refreshOrders={fetchOrders} />
          </TabPanel>
        </Box>
      </div>
    </div>
  );
};

// Composant OrderTable utilisant MUI pour styliser le tableau avec pagination
const OrderTable = ({ orders, refreshOrders }) => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const currentUserId = user?.id_login_user;

  // État de pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDetailsClick = (orderId, certifId) => {
    navigate(`/dashboard/order-details?orderId=${orderId}&certifId=${certifId}`);
  };

  const handleCancelClick = async (orderId) => {
    try {
      const payload = {
        p_id_order: orderId,
        p_idlogin_modify: currentUserId,
      };
      const response = await cancelOrder(payload);
      console.log('Order cancelled:', response);
      refreshOrders && refreshOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert("Erreur lors de l'annulation de la commande.");
    }
  };

  // Slicing orders pour la pagination
  const paginatedOrders = orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 600, overflowX: 'auto' }}>
        <Table stickyHeader aria-label="orders table" sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>N° de Commande</TableCell>
              <TableCell>Désignation</TableCell>
              <TableCell>Certificat d'Origine</TableCell>
              <TableCell>Facture Commerciale</TableCell>
              <TableCell>Législation</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedOrders.length > 0 ? (
              paginatedOrders.map((order) => (
                <TableRow key={order.id_order} hover>
                  <TableCell>{new Date(order.insertdate_order).toLocaleDateString()}</TableCell>
                  <TableCell>{order.id_order || '-'}</TableCell>
                  <TableCell>{order.order_title || '-'}</TableCell>
                  <TableCell>
                    {order.id_ord_certif_ori ? (
                      <button
                        className="home-icon-button home-minimal-button"
                        title="Voir"
                        onClick={() =>
                          handleDetailsClick(order.id_order, order.id_ord_certif_ori)
                        }
                      >
                        <FontAwesomeIcon icon={faEye} />
                        <span className="home-button-text">Détails</span>
                      </button>
                    ) : (
                      <button className="home-icon-button home-minimal-button" title="Ajouter">
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                    )}
                  </TableCell>
                  <TableCell>
                    {order.id_ord_com_invoice ? (
                      <button className="home-icon-button home-minimal-button" title="Voir">
                        <FontAwesomeIcon icon={faEye} />
                        <span className="home-button-text">Détails</span>
                      </button>
                    ) : (
                      <button className="home-icon-button home-minimal-button" title="Ajouter">
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                    )}
                  </TableCell>
                  <TableCell>
                    {order.id_ord_legalization ? (
                      <button className="home-icon-button home-minimal-button" title="Voir">
                        <FontAwesomeIcon icon={faEye} />
                        <span className="home-button-text">Détails</span>
                      </button>
                    ) : (
                      <button className="home-icon-button home-minimal-button" title="Ajouter">
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                    )}
                  </TableCell>
                  <TableCell>
                    {(order.id_order_status === 1 || order.id_order_status === 6) ? (
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'nowrap', alignItems: 'center' }}>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => handleCancelClick(order.id_order)}
                        >
                          Supprimer
                        </Button>
                        <Button variant="contained" color="success" size="small">
                          {order.id_order_status === 3 ? 'Payer' : 'Soumettre'}
                        </Button>
                      </Box>
                    ) : (
                      <Button variant="contained" color="primary" size="small">
                        {order.id_order_status === 3 ? 'Payer' : 'Soumettre'}
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
    </Paper>
  );
};

OrderTable.propTypes = {
  orders: PropTypes.array.isRequired,
  refreshOrders: PropTypes.func.isRequired,
};

export default Home;
