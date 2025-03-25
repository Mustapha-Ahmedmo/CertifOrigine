import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getOrdersForCustomer, cancelOrder, submitOrder } from '../services/apiServices';
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
import useMediaQuery from '@mui/material/useMediaQuery';

import {
  AppBar,
  Tabs,
  Tab,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Divider
} from '@mui/material';

import './Home.css';

// ---------------------------------------------------
// TabPanel : gestion des onglets
// ---------------------------------------------------
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

// ---------------------------------------------------
// Composant principal Home
// ---------------------------------------------------
const Home = () => {
  // États pour les commandes et le chargement / erreur
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

  // Détecte si l'écran est inférieur ou égal à 768px
  const isMobile = useMediaQuery('(max-width:768px)');

  // Récupération et classement des commandes
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
      setOrdersValidation(
        allOrders.filter((order) => order.id_order_status === 2 || order.id_order_status === 7)
      );
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

  // Gère le changement de valeur de la dropdown sur mobile
  const handleDropdownChange = (event) => {
    setTabIndex(Number(event.target.value));
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

      {/* Affichage conditionnel selon la taille de l'écran */}
      {isMobile ? (
        <div className="home-dropdown-container">
          <select className="home-dropdown" value={tabIndex} onChange={handleDropdownChange}>
            {options.map((option, index) => (
              <option key={option.value} value={index}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="home-tabs-container">
          <Box sx={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
            <AppBar position="static" color="default">
              <Tabs
                value={tabIndex}
                onChange={handleTabChange}
                textColor="inherit"
                variant="fullWidth"
                aria-label="Dashboard Tabs"
                TabIndicatorProps={{
                  style: {
                    backgroundColor: '#DCAF26',
                  },
                }}
              >
                {options.map((option, index) => (
                  <Tab key={option.value} label={option.label} {...a11yProps(index)} />
                ))}
              </Tabs>
            </AppBar>
          </Box>
        </div>
      )}

      <Box sx={{ width: '100%', maxWidth: isMobile ? '100%' : '1200px', margin: '0 auto' }}>
        <TabPanel value={tabIndex} index={0} dir={theme.direction}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <OrderTable orders={ordersVisa} refreshOrders={fetchOrders} />
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabIndex} index={1} dir={theme.direction}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <OrderTable orders={ordersValidation} refreshOrders={fetchOrders} />
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabIndex} index={2} dir={theme.direction}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <OrderTable orders={ordersPayment} refreshOrders={fetchOrders} hideActions />
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabIndex} index={3} dir={theme.direction}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <OrderTable orders={ordersReturned} refreshOrders={fetchOrders} />
            </Grid>
          </Grid>
        </TabPanel>
      </Box>
    </div>
  );
};

// ---------------------------------------------------
// OrderTable : tableau sur desktop, "inspired card" sur mobile
// ---------------------------------------------------
const OrderTable = ({ orders, refreshOrders, hideActions }) => {
  const isMobile = useMediaQuery('(max-width:768px)');
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const currentUserId = user?.id_login_user;

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedOrders = orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleDetailsClick = (orderId, certifId) => {
    navigate(`/dashboard/order-details?orderId=${orderId}&certifId=${certifId}`);
  };

  const handleCancelClick = async (orderId) => {
    try {
      const payload = {
        p_id_order: orderId,
        p_idlogin_modify: currentUserId,
      };
      await cancelOrder(payload);
      refreshOrders && refreshOrders();
    } catch (error) {
      alert("Erreur lors de l'annulation de la commande.");
      console.error(error);
    }
  };

  const handleSoumettreClick = async (orderId) => {
    try {
      const payload = {
        p_id_order: orderId,
        p_idlogin_modify: currentUserId,
      };
      await submitOrder(payload);
      refreshOrders && refreshOrders();
    } catch (error) {
      alert("Erreur lors de la soumission de la commande.");
      console.error(error);
    }
  };

  // Gère l'affichage des boutons en fonction du statut
  const renderActionButtons = (order) => {
    if (hideActions) return null;

    if ([1, 6].includes(order.id_order_status)) {
      // Statut = 1 ou 6 => "Supprimer" + "Soumettre"
      return (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="error"
            size="small"
            sx={{ fontSize: '0.7rem', padding: '4px 8px' }}
            onClick={() => handleCancelClick(order.id_order)}
          >
            Supprimer
          </Button>
          <Button
            variant="contained"
            color="success"
            size="small"
            sx={{ fontSize: '0.7rem', padding: '4px 8px' }}
            onClick={() => handleSoumettreClick(order.id_order)}
          >
            Soumettre
          </Button>
        </Box>
      );
    } else if (order.id_order_status === 2) {
      // Statut = 2 => Rien
      return null;
    } else if (order.id_order_status === 3) {
      // Statut = 3 => "Payer"
      return (
        <Button variant="contained" color="primary" size="small" sx={{ fontSize: '0.7rem' }}>
          Payer
        </Button>
      );
    } else {
      // Sinon => "Soumettre"
      return (
        <Button
          variant="contained"
          color="primary"
          size="small"
          sx={{ fontSize: '0.7rem', padding: '4px 8px' }}
          onClick={() => handleSoumettreClick(order.id_order)}
        >
          Soumettre
        </Button>
      );
    }
  };

  // ---------------------------------------------------
  // Affichage MOBILE => Cartes plus “modernes”
  // ---------------------------------------------------
  if (isMobile) {
    return (
      <>
        {paginatedOrders.map((order) => {
          const dateStr = new Date(order.insertdate_order).toLocaleDateString();

          return (
            <Card
              key={order.id_order}
              sx={{
                marginBottom: 2,
                borderRadius: 3,
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              }}
            >
              {/* En-tête de la carte */}
              <CardHeader
                title={`Commande #${order.id_order || '-'}`}
                subheader={dateStr}
                sx={{
                  paddingBottom: 0,
                  '& .MuiCardHeader-title': {
                    fontWeight: 'bold',
                    fontSize: '1rem',
                  },
                  '& .MuiCardHeader-subheader': {
                    fontSize: '0.85rem',
                    color: '#888',
                  },
                }}
              />

              <CardContent sx={{ paddingTop: 0 }}>
                {/* Désignation */}
                <Box sx={{ marginTop: 1, marginBottom: 2 }}>
                  <Typography variant="body2" sx={{ color: '#888' }}>
                    Désignation
                  </Typography>
                  <Typography variant="body1">
                    {order.order_title || '-'}
                  </Typography>
                </Box>
                <Divider sx={{ marginBottom: 2 }} />

                {/* Certificat d'Origine */}
                <Box sx={{ marginBottom: 2 }}>
                  <Typography variant="body2" sx={{ color: '#888', marginBottom: 1 }}>
                    Certificat d'Origine
                  </Typography>
                  {order.id_ord_certif_ori ? (
                    <button
                      className="home-icon-button home-minimal-button"
                      title="Voir"
                      onClick={() => handleDetailsClick(order.id_order, order.id_ord_certif_ori)}
                    >
                      <FontAwesomeIcon icon={faEye} />
                      <span className="home-button-text">Détails</span>
                    </button>
                  ) : (
                    <button className="home-icon-button home-minimal-button" title="Ajouter">
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  )}
                </Box>
                <Divider sx={{ marginBottom: 2 }} />

                {/* Facture Commerciale */}
                <Box sx={{ marginBottom: 2 }}>
                  <Typography variant="body2" sx={{ color: '#888', marginBottom: 1 }}>
                    Facture Commerciale
                  </Typography>
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
                </Box>
                <Divider sx={{ marginBottom: 2 }} />

                {/* Législation */}
                <Box sx={{ marginBottom: 2 }}>
                  <Typography variant="body2" sx={{ color: '#888', marginBottom: 1 }}>
                    Législation
                  </Typography>
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
                </Box>
              </CardContent>

              {!hideActions && (
                <CardActions
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    backgroundColor: '#f9f9f9',
                    borderTop: '1px solid #eee',
                  }}
                >
                  {renderActionButtons(order)}
                </CardActions>
              )}
            </Card>
          );
        })}

        {/* Pagination (même composant pour rester cohérent) */}
        <TablePagination
          component="div"
          count={orders.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </>
    );
  }

  // ---------------------------------------------------
  // Affichage DESKTOP => Tableau classique
  // ---------------------------------------------------
  return (
    <TableContainer
      component={Paper}
      sx={{
        width: '100%',
        overflowX: 'visible',
      }}
    >
      <Table
        stickyHeader
        aria-label="orders table"
        sx={{
          width: '100%',
          tableLayout: 'fixed',
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: '10%', textAlign: 'center' }}>Date</TableCell>
            <TableCell sx={{ width: '10%', textAlign: 'center' }}>N° de Commande</TableCell>
            <TableCell sx={{ width: '20%', textAlign: 'center' }}>Désignation</TableCell>
            <TableCell sx={{ width: '15%', textAlign: 'center' }}>Certificat d'Origine</TableCell>
            <TableCell sx={{ width: '15%', textAlign: 'center' }}>Facture Commerciale</TableCell>
            <TableCell sx={{ width: '15%', textAlign: 'center' }}>Législation</TableCell>
            {!hideActions && (
              <TableCell sx={{ width: '15%', textAlign: 'center' }}>Action</TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedOrders.length > 0 ? (
            paginatedOrders.map((order) => (
              <TableRow key={order.id_order} hover>
                <TableCell sx={{ textAlign: 'center' }}>
                  {new Date(order.insertdate_order).toLocaleDateString()}
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                  {order.id_order || '-'}
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                  {order.order_title || '-'}
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                  {order.id_ord_certif_ori ? (
                    <button
                      className="home-icon-button home-minimal-button"
                      title="Voir"
                      onClick={() => handleDetailsClick(order.id_order, order.id_ord_certif_ori)}
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
                <TableCell sx={{ textAlign: 'center' }}>
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
                <TableCell sx={{ textAlign: 'center' }}>
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
                {!hideActions && (
                  <TableCell sx={{ textAlign: 'center' }}>
                    {renderActionButtons(order)}
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={hideActions ? 6 : 7}>
                Aucune commande trouvée.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={orders.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />
    </TableContainer>
  );
};

OrderTable.propTypes = {
  orders: PropTypes.array.isRequired,
  refreshOrders: PropTypes.func.isRequired,
  hideActions: PropTypes.bool,
};

export default Home;
