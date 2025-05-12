// HomeOperateur.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

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

import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PaymentIcon from '@mui/icons-material/Payment';

import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import VisibilityIcon from '@mui/icons-material/Visibility';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';


import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';

import { formatDate } from '../utils/dateUtils';
import PaymentModal from './PaymentModal';
import { getOrderOpInfo, getOrderHisto, getOrderMemo } from '../services/apiServices';
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

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialTab =
    params.get('mode') === 'payment' ? 1 :
      params.get('mode') === 'returned' ? 2 :
        0;

  useEffect(() => {


    const m = new URLSearchParams(location.search).get('mode');
    setTabIndex(
      m === 'payment' ? 1 :
        m === 'returned' ? 2 :
          0
    );
  }, [location.search]);


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
  const ordersNew = orders.filter(order =>
    order.id_order_status === 2 ||
    order.id_order_status === 7
  );
  const ordersReturned = orders.filter(o => o.id_order_status === 6);
  const ordersPayment = orders.filter(order => order.id_order_status === 3);

  const options = [
    { value: 'new', label: `Commandes à traiter (${ordersNew.length})` },
    { value: 'payment', label: `Commandes en attente de paiement (${ordersPayment.length})` },
    { value: 'returned', label: `Commandes retournées au client (${ordersReturned.length})` }
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
          <TabPanel value={tabIndex} index={2}>
            <OrderTable orders={ordersReturned} refreshOrders={fetchOrders} goToOrderDetails={goToOrderDetails} />
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
  
  // Récupère operatorId si besoin
  const user = useSelector(state => state.auth.user);
  const operatorId = user?.id_login_user;

  // États pour la piste d’audit
  const [auditOpen, setAuditOpen]             = useState(false);
  const [auditLogs, setAuditLogs]             = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  // nouveaux états
  const [memoOpen, setMemoOpen]         = useState(false);
  const [memoList, setMemoList]         = useState([]);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // pour piloter l’ancrage et l’ordre courant du menu « Actions »
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuOrderId, setMenuOrderId] = useState(null);
  

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

  const handleOpenAudit = async (orderId) => {
       setSelectedOrderId(orderId);
       try {
         // getOrderHisto renvoie directement un Array
         const logs = await getOrderHisto({
           p_id_list_order: String(orderId),
         });
         setAuditLogs(logs);
         setAuditOpen(true);
       } catch (err) {
         console.error('Erreur piste audit :', err);
       }
  };

  const handleOpenMemo = async (orderId) => {
    try {
      const memos = await getOrderMemo({
        p_id_order_list: String(orderId),
        p_idlogin: operatorId,   // ou null si vous ne filtrez pas sur l'operateur
        p_isopuser: true
      });
      setMemoList(memos);
      setMemoOpen(true);
    } catch (err) {
      console.error('Erreur memos :', err);
    }
  };

  const handleMenuOpen = (event, orderId) => {
    setAnchorEl(event.currentTarget);
    setMenuOrderId(orderId);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuOrderId(null);
  };
  
  
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
                <TableCell align="center">Actions</TableCell>
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
                <TableCell align="center">Actions</TableCell>
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
                    <TableCell align="center">
                      <IconButton 
                        size="small"
                        onClick={(e) => handleMenuOpen(e, order.id_order)}
                        sx={{ color: '#DCAF26' }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl}
                        open={menuOrderId === order.id_order}
                        onClose={handleMenuClose}
                      >
                        <MenuItem
                          onClick={() => {
                            handleOpenAudit(order.id_order);
                            handleMenuClose();
                          }}
                        >
                          <ListItemIcon sx={{ color: '#DCAF26' }}>
                            <VisibilityIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary="Piste d’audit" />
                        </MenuItem>

                        <MenuItem
                          onClick={() => {
                            handleOpenMemo(order.id_order);
                            handleMenuClose();
                          }}
                        >
                          <ListItemIcon sx={{ color: '#DCAF26' }}>
                            <PictureAsPdfIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary="Mémos" />
                        </MenuItem>

                        <MenuItem onClick={() => { handleOpenPayment(order); handleMenuClose(); }}>
                          <ListItemIcon sx={{ color: '#DCAF26' }}>
                            <PaymentIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary="Payer" />
                        </MenuItem>
                      </Menu>

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
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, order.id_order)}
                        sx={{ color: '#DCAF26' }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                      {/* À l’emplacement de ton ancien menu non-payment : */}
                      <Menu
                        anchorEl={anchorEl}
                        open={menuOrderId === order.id_order}
                        onClose={handleMenuClose}
                      >
                        <MenuItem
                          onClick={() => {
                            handleOpenAudit(order.id_order);
                            handleMenuClose();
                          }}
                        >
                          <ListItemIcon sx={{ color: '#DCAF26' }}>
                            <VisibilityIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary="Piste d’audit" />
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            handleOpenMemo(order.id_order);
                            handleMenuClose();
                          }}
                        >
                          <ListItemIcon sx={{ color: '#DCAF26' }}>
                            <PictureAsPdfIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary="Mémos" />
                        </MenuItem>
                      </Menu>
                    </TableCell>
                  </TableRow>
                )
              )
            ) : (
              <TableRow>
                <TableCell colSpan={mode === "payment" ? 10 : 8}>
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
      <Dialog open={auditOpen} onClose={() => setAuditOpen(false)} fullWidth maxWidth="md">
  <DialogTitle>Piste d’audit – Commande #{selectedOrderId}</DialogTitle>
  <DialogContent dividers>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Date Action</TableCell>
          <TableCell>Action</TableCell>
          <TableCell>Utilisateur</TableCell>
          <TableCell>Statut</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {auditLogs.map(log => {
          const infos = log.insert_isopuser
            ? 'Opérateur'
            : (!log.insert_isopuser && log.insert_role_user === 1)
              ? 'Contact principal'
              : '';
          return (
            <TableRow key={log.id_histo_order}>
              <TableCell>{new Date(log.insertdate_histo).toLocaleString()}</TableCell>
              <TableCell>{log.order_histo_action}</TableCell>
              <TableCell>
                {log.insert_full_name} {infos && `(${infos})`}
              </TableCell>
              <TableCell>{log.txt_order_status_fr}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setAuditOpen(false)}>Fermer</Button>
  </DialogActions>
</Dialog>
<Dialog open={memoOpen} onClose={() => setMemoOpen(false)} fullWidth maxWidth="md">
  <DialogTitle>Mémos – Commande #{selectedOrderId}</DialogTitle>
  <DialogContent dividers>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Date</TableCell>
          <TableCell>Sujet</TableCell>
          <TableCell>Corps</TableCell>
          <TableCell>De</TableCell>
          <TableCell>Accusé</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {memoList.map(memo => (
          <TableRow key={memo.id_memo}>
            <TableCell>{new Date(memo.memo_date).toLocaleString()}</TableCell>
            <TableCell>{memo.memo_subject}</TableCell>
            <TableCell>{memo.memo_body}</TableCell>
            <TableCell>{memo.cust_user_full_name || memo.cust_user_full_name}</TableCell>
            <TableCell>{memo.ack_date ? new Date(memo.ack_date).toLocaleString() : 'Non'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setMemoOpen(false)}>Fermer</Button>
  </DialogActions>
</Dialog>

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
