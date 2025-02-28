// HomeOperateur.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getOrderOpInfo, cancelOrder } from '../services/apiServices';
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
import './HomeOperateur.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { formatDate } from '../utils/dateUtils';
import PaymentModal from './PaymentModal'; // Chemin à adapter si nécessaire



// Composant TabPanel pour l'affichage du contenu de chaque onglet
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

const HomeOperateur = () => {
  // États pour les commandes
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // État pour l'onglet actif (0 pour "Nouvelles commandes", 1 pour "Commandes en attente de paiement")
  const [tabIndex, setTabIndex] = useState(0);

  const user = useSelector((state) => state.auth.user);
  const operatorId = user?.id_login_user;
  const navigate = useNavigate();
  const theme = useTheme();

  // Fonction pour charger les commandes pour l'opérateur
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
  // Nouvelles commandes : filtre sur id_order_status === 2
  // Commandes en attente de paiement : filtre sur id_order_status === 3
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
    // On ajoute une marge à gauche pour décaler le contenu (largeur du menu)
    <div className="operator-home-container" style={{ marginLeft: '240px' }}>
      <Helmet>
        <title>Dashboard Opérateur</title>
      </Helmet>
      {/* Onglets et tableau */}
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
            >
              {options.map((option, index) => (
                <Tab key={option.value} label={option.label} {...a11yProps(index)} />
              ))}
            </Tabs>
          </AppBar>
          <TabPanel value={tabIndex} index={0} dir={theme.direction}>
            <OrderTable orders={ordersNew} refreshOrders={fetchOrders} goToOrderDetails={goToOrderDetails} />
          </TabPanel>
          <TabPanel value={tabIndex} index={1} dir={theme.direction}>
            <OrderTable
              orders={ordersPayment}
              refreshOrders={fetchOrders}
              goToOrderDetails={goToOrderDetails}
              mode="payment"  // indique que l'affichage sera pour les commandes en attente de paiement
            />
          </TabPanel>
        </Box>
      </div>
    </div>
  );
};

const OrderTable = ({ orders, refreshOrders, goToOrderDetails, mode }) => {
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // === 1) État pour la modale de paiement ===
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // === 2) Fonctions pour gérer l'ouverture/fermeture de la modale ===
  const handleOpenPayment = (order) => {
    setSelectedOrder(order);
    setOpenPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setOpenPaymentModal(false);
    setSelectedOrder(null);
  };

  // === 3) Fonction appelée quand on valide le paiement dans la modale ===
  const handlePaymentSubmit = async (paymentData) => {
    // Ici, vous pouvez faire un appel API pour valider le paiement
    console.log('Payment submitted:', paymentData);

    // Exemple : await validatePaymentAPI(paymentData);

    // Fermez la modale
    setOpenPaymentModal(false);
    setSelectedOrder(null);

    // Rafraîchissez la liste des commandes après le paiement
    refreshOrders();
  };


  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Découpage pour la pagination
  const paginatedOrders = orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 600, overflowX: 'auto' }}>
        <Table stickyHeader aria-label="orders table" sx={{ minWidth: 800 }}>
          {mode === "payment" ? (
            // En mode "payment", affichage simplifié sans icônes œil
            <TableHead>
              <TableRow>
                <TableCell>Date de création</TableCell>
                <TableCell>N° de Commande</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Désignation</TableCell>
                <TableCell>Date de soumission</TableCell>
                <TableCell>Date d'approbation</TableCell>
                <TableCell>Certificat d'Origine</TableCell>
                <TableCell>Facture Commerciale</TableCell>
                <TableCell>Légalisations</TableCell>
              </TableRow>
            </TableHead>
          ) : (
            // Mode par défaut (pour les autres onglets)
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>N° de Commande</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Désignation</TableCell>
                <TableCell>Date soumission</TableCell>
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
                      {order.id_ord_certif_ori ? (
                        <button
                          className="icon-button minimal-button"
                          onClick={() => goToOrderDetails(order)}
                        >
                          <FontAwesomeIcon icon={faEye} title="Vérifier" />
                          <span className="button-text">Consulter</span>
                        </button>
                      ) : (
                        <span>-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {order.id_ord_com_invoice ? (
                        <button className="icon-button minimal-button" onClick={() => goToOrderDetails(order)}>
                          <FontAwesomeIcon icon={faEye} title="Vérifier" />
                          <span className="button-text">Consulter</span>
                        </button>
                      ) : (
                        <span>-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {order.id_ord_legalization ? (
                        <button className="icon-button minimal-button" onClick={() => goToOrderDetails(order)}>
                          <FontAwesomeIcon icon={faEye} title="Vérifier" />
                          <span className="button-text">Consulter</span>
                        </button>
                      ) : (
                        <span>-</span>
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
                  // Rendu par défaut pour les autres modes (exemple existant)
                  <TableRow key={order.id_order} hover>
                    <TableCell>{formatDate(order.insertdate_order)}</TableCell>
                    <TableCell>{order.id_order}</TableCell>
                    <TableCell>{order.cust_name}</TableCell>
                    <TableCell>{order.order_title || '-'}</TableCell>
                    <TableCell>
                      {order.date_last_submission
                        ? formatDate(order.date_last_submission)
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {order.id_ord_certif_ori ? (
                        <button
                          className="icon-button minimal-button"
                          onClick={() => goToOrderDetails(order)}
                        >
                          <FontAwesomeIcon icon={faEye} title="Vérifier" />
                          <span className="button-text">Vérifier</span>
                        </button>
                      ) : (
                        <span>-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {order.id_ord_com_invoice ? (
                        <button className="icon-button minimal-button" onClick={() => goToOrderDetails(order)}>
                          <FontAwesomeIcon icon={faEye} title="Vérifier" />
                          <span className="button-text">Vérifier</span>
                        </button>
                      ) : (
                        <span>-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {order.id_ord_legalization ? (
                        <button className="icon-button minimal-button" onClick={() => goToOrderDetails(order)}>
                          <FontAwesomeIcon icon={faEye} title="Vérifier" />
                          <span className="button-text">Vérifier</span>
                        </button>
                      ) : (
                        <span>-</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              )
            ) : (
              <TableRow>
                <TableCell colSpan={mode === "payment" ? 7 : 9}>Aucune commande trouvée.</TableCell>
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

    </Paper>
  );
};

OrderTable.propTypes = {
  orders: PropTypes.array.isRequired,
  refreshOrders: PropTypes.func.isRequired,
  goToOrderDetails: PropTypes.func,
  mode: PropTypes.string, // 'payment' pour le mode Commandes en attente de paiement
};


export default HomeOperateur;
