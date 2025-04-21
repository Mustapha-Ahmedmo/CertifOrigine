// HomeOperateur.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';

import { formatDate } from '../utils/dateUtils';
import PaymentModal from './PaymentModal';
import { getOrderOpInfo } from '../services/apiServices';
import './HomeOperateur.css';

// ---------------------------------------------------
// Composant TabPanel pour la gestion des onglets
// ---------------------------------------------------
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`operator-tabpanel-${index}`}
      aria-labelledby={`operator-tab-${index}`}
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
    id: `operator-tab-${index}`,
    'aria-controls': `operator-tabpanel-${index}`,
  };
}

// ---------------------------------------------------
// Composant principal HomeOperateur
// ---------------------------------------------------
const HomeOperateur = () => {
  // États pour les commandes et le chargement / erreur
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // État pour l'onglet actif
  const [tabIndex, setTabIndex] = useState(0);

  const user = useSelector((state) => state.auth.user);
  const operatorId = user?.id_login_user;
  const navigate = useNavigate();
  const theme = useTheme();
  // Détection si l'écran est en mobile (largeur <= 768px)
  const isMobile = useMediaQuery('(max-width:768px)');

  // Chargement des commandes de l'opérateur
  const fetchOrders = async () => {
    if (!operatorId) return;
    try {
      setLoading(true);
      const params = {
        p_id_order_list: null,
        p_id_custaccount_list: null,
        p_id_orderstatus_list: null,
        p_idlogin: operatorId,
      };
      const result = await getOrderOpInfo(params);
      const loadedOrders = result.data || result;
      setOrders(loadedOrders);
    } catch (err) {
      console.error('Error loading orders for operator:', err);
      setError(err.message || "Erreur lors du chargement des commandes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (operatorId) fetchOrders();
  }, [operatorId]);

  // Pour l'opérateur :
  // - Nouvelles commandes : id_order_status === 2 ou 7
  // - Commandes en attente de paiement : id_order_status === 3
  const ordersNew = orders.filter(order => order.id_order_status === 2 || order.id_order_status === 7);
  const ordersPayment = orders.filter(order => order.id_order_status === 3);

  const options = [
    { value: 'new', label: `Nouvelles commandes (${ordersNew.length})` },
    { value: 'payment', label: `Commandes en attente de paiement (${ordersPayment.length})` },
  ];

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  // Navigation pour afficher les détails d'une commande
  const goToOrderDetails = (order) => {
    const certifId = order.id_ord_certif_ori || '';
    navigate(`/dashboard/operator/oporderdetails?orderId=${order.id_order}&certifId=${certifId}`);
  };

  if (loading) {
    return <div className="loading">Chargement des commandes...</div>;
  }
  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    // Appliquer la marge à gauche uniquement en version desktop
    <div className="operator-home-container" style={{ marginLeft: isMobile ? '0px' : '240px' }}>
      <Helmet>
        <title>Dashboard Opérateur</title>
      </Helmet>
      <div className="operator-tabs-container" style={{ width: '100%' }}>
        <Box sx={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          <AppBar position="static" color="default">
            <Tabs
              value={tabIndex}
              onChange={handleTabChange}
              indicatorColor="secondary"
              textColor="inherit"
              variant="fullWidth"
              aria-label="Operator Dashboard Tabs"
              sx={{
                '& .MuiTabs-indicator': { backgroundColor: '#DCAF26' },
                '& .MuiTab-root.Mui-selected': { color: '#DCAF26' },
              }}
            >
              {options.map((option, index) => (
                <Tab key={option.value} label={option.label} {...a11yProps(index)} />
              ))}
            </Tabs>
          </AppBar>
          <TabPanel value={tabIndex} index={0} dir={theme.direction}>
            <OrderTable
              orders={ordersNew}
              refreshOrders={fetchOrders}
              goToOrderDetails={goToOrderDetails}
            />
          </TabPanel>
          <TabPanel value={tabIndex} index={1} dir={theme.direction}>
            <OrderTable
              orders={ordersPayment}
              refreshOrders={fetchOrders}
              goToOrderDetails={goToOrderDetails}
              mode="payment"  // Mode pour les commandes en attente de paiement
            />
          </TabPanel>
        </Box>
      </div>
    </div>
  );
};

// ---------------------------------------------------
// Composant OrderTable : affichage en tableau (desktop) et en cartes (mobile)
// ---------------------------------------------------
const OrderTable = ({ orders, refreshOrders, goToOrderDetails, mode }) => {
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // États pour la modale de paiement (utilisée en mode "payment")
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:768px)');

  const handleOpenPayment = (order) => {
    setSelectedOrder(order);
    setOpenPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setOpenPaymentModal(false);
    setSelectedOrder(null);
  };

  const handlePaymentSubmit = async (paymentData) => {
    // Ajoutez ici l'appel API pour valider le paiement
    console.log('Payment submitted:', paymentData);
    setOpenPaymentModal(false);
    setSelectedOrder(null);
    refreshOrders();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedOrders = orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // -----------------------------
  // Affichage MOBILE : version cartes
  // -----------------------------
  if (isMobile) {
    return (
      <>
        <Grid container spacing={2}>
          {paginatedOrders.length > 0 ? (
            paginatedOrders.map((order) => {
              const dateStr = order.insertdate_order ? new Date(order.insertdate_order).toLocaleDateString() : '-';
              return (
                <Grid item xs={12} key={order.id_order}>
                  <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.12)', ml: '2px' }}>
                    <CardHeader
                      title={`Commande #${order.id_order || '-'}`}
                      subheader={dateStr}
                      sx={{
                        paddingBottom: 0,
                        '& .MuiCardHeader-title': { fontWeight: 'bold', fontSize: '1rem' },
                        '& .MuiCardHeader-subheader': { fontSize: '0.85rem', color: '#888' },
                      }}
                    />
                    <CardContent sx={{ pt: 1 }}>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Client
                        </Typography>
                        <Typography variant="body1">
                          {order.cust_name || '-'}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Désignation
                        </Typography>
                        <Typography variant="body1">
                          {order.order_title || '-'}
                        </Typography>
                      </Box>
                    
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Certificat d'Origine
                          </Typography>
                          {order.id_ord_certif_ori ? (
                            <Button size="small" onClick={() => goToOrderDetails(order)} sx={{ textTransform: 'none' }}>
                              <FontAwesomeIcon icon={faEye} /> Consulter
                            </Button>
                          ) : (
                            <Typography variant="body1">-</Typography>
                          )}
                        </Box>
                      </Box>
                      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Facture Commerciale
                          </Typography>
                          {order.id_ord_com_invoice ? (
                            <Button size="small" onClick={() => goToOrderDetails(order)} sx={{ textTransform: 'none' }}>
                              <FontAwesomeIcon icon={faEye} /> Consulter
                            </Button>
                          ) : (
                            <Typography variant="body1">-</Typography>
                          )}
                        </Box>
                      </Box>
                      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Légalisations
                          </Typography>
                          {order.id_ord_legalization ? (
                            <Button size="small" onClick={() => goToOrderDetails(order)} sx={{ textTransform: 'none' }}>
                              <FontAwesomeIcon icon={faEye} /> Consulter
                            </Button>
                          ) : (
                            <Typography variant="body1">-</Typography>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                    <CardActions
                      sx={{ justifyContent: 'center', backgroundColor: '#f9f9f9', borderTop: '1px solid #eee' }}
                    >
                      {mode === "payment" ? (
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => handleOpenPayment(order)}
                          sx={{ textTransform: 'none' }}
                        >
                          Payer
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => goToOrderDetails(order)}
                          sx={{ textTransform: 'none' }}
                        >
                          Consulter
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              );
            })
          ) : (
            <Grid item xs={12}>
              <Typography>Aucune commande trouvée.</Typography>
            </Grid>
          )}
        </Grid>
        <TablePagination
          component="div"
          count={orders.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
        <PaymentModal
          open={openPaymentModal}
          onClose={handleClosePaymentModal}
          onSubmit={handlePaymentSubmit}
          order={selectedOrder}
        />
      </>
    );
  }

  // -----------------------------
  // Affichage DESKTOP : version tableau classique
  // -----------------------------
  return (
    <>
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table stickyHeader aria-label="orders table" sx={{ minWidth: 800 }}>
          {mode === "payment" ? (
            <TableHead>
              <TableRow>
                <TableCell>Date de soumission</TableCell>
                <TableCell>N° de Commande</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Désignation</TableCell>
                <TableCell>Date d'approbation</TableCell>
                <TableCell>Certificat d'Origine</TableCell>
                <TableCell>Facture Commerciale</TableCell>
                <TableCell>Légalisations</TableCell>
                <TableCell>Payer</TableCell>
              </TableRow>
            </TableHead>
          ) : (
            <TableHead>
              <TableRow>
                <TableCell>Date de soumission</TableCell>
                <TableCell>N° de Commande</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Désignation</TableCell>
                <TableCell>Certificat d'Origine</TableCell>
                <TableCell>Facture Commerciale</TableCell>
                <TableCell>Légalisations</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
          )}
          <TableBody>
            {paginatedOrders.length > 0 ? (
              paginatedOrders.map((order) =>
                mode === "payment" ? (
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
                      {order.date_validation_order
                        ? formatDate(order.date_validation_order)
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {order.id_ord_certif_ori ? (
                        <button
                          className="icon-button minimal-button"
                          onClick={() => goToOrderDetails(order)}
                        >
                          <FontAwesomeIcon icon={faEye} /> Consulter
                        </button>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {order.id_ord_com_invoice ? (
                        <button
                          className="icon-button minimal-button"
                          onClick={() => goToOrderDetails(order)}
                        >
                          <FontAwesomeIcon icon={faEye} /> Consulter
                        </button>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {order.id_ord_legalization ? (
                        <button
                          className="icon-button minimal-button"
                          onClick={() => goToOrderDetails(order)}
                        >
                          <FontAwesomeIcon icon={faEye} /> Consulter
                        </button>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <button
                        className="submit-button minimal-button"
                        onClick={() => handleOpenPayment(order)}
                      >
                        Payer
                      </button>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow key={order.id_order} hover>
                    <TableCell>{formatDate(order.insertdate_order)}</TableCell>
                    <TableCell>{order.id_order}</TableCell>
                    <TableCell>{order.cust_name}</TableCell>
                    <TableCell>{order.order_title || '-'}</TableCell>
                    <TableCell>
                      {order.id_ord_certif_ori ? (
                        <button
                          className="icon-button minimal-button"
                          onClick={() => goToOrderDetails(order)}
                        >
                          <FontAwesomeIcon icon={faEye} /> Consulter
                        </button>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {order.id_ord_com_invoice ? (
                        <button
                          className="icon-button minimal-button"
                          onClick={() => goToOrderDetails(order)}
                        >
                          <FontAwesomeIcon icon={faEye} /> Consulter
                        </button>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {order.id_ord_legalization ? (
                        <button
                          className="icon-button minimal-button"
                          onClick={() => goToOrderDetails(order)}
                        >
                          <FontAwesomeIcon icon={faEye} /> Consulter
                        </button>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <button
                        className="icon-button minimal-button"
                        onClick={() => goToOrderDetails(order)}
                      >
                        Consulter
                      </button>
                    </TableCell>
                  </TableRow>
                )
              )
            ) : (
              <TableRow>
                <TableCell colSpan={mode === "payment" ? 10 : 9}>
                  Aucune commande trouvée.
                </TableCell>
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
      <PaymentModal
        open={openPaymentModal}
        onClose={handleClosePaymentModal}
        onSubmit={handlePaymentSubmit}
        order={selectedOrder}
      />
    </>
  );
};

OrderTable.propTypes = {
  orders: PropTypes.array.isRequired,
  refreshOrders: PropTypes.func.isRequired,
  goToOrderDetails: PropTypes.func,
  mode: PropTypes.string, // 'payment' pour le mode Commandes en attente de paiement
};

export default HomeOperateur;
