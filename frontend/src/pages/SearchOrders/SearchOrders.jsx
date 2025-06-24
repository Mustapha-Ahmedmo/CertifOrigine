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
  Typography,
  FormControlLabel,
  Checkbox,
  Card,
  CardContent,
  CardActions,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import { fetchCountries, fetchRecipients, getCertifGoodsInfo, getCertifTranspMode, getCustAccountInfo, getOrderFilesInfo, getOrderOpInfo, getOrdersForCustomer, getTransmodeInfo, setOrderFiles, sendEmailAndMemo, sendEmail, setMemo, setMemoFiles } from '../../services/apiServices';
import { formatDate } from '../../utils/dateUtils';
import './SearchOrders.css';
import { generatePDF } from '../../components/orders/GeneratePDF';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';

// services pour récupérer audit & mémos
import { getOrderHisto, getOrderMemo } from '../../services/apiServices';

// icônes MUI pour le menu
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import HistoryIcon from '@mui/icons-material/History';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';


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

const API_URL = import.meta.env.VITE_API_URL;
const allStatuses = [1, 2, 3, 4, 5, 6, 7, 8, 9];
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
  const isOpUser = user?.isopuser;

  const currentYear = new Date().getFullYear();
  const [anchorElActions, setAnchorElActions] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleActionsOpen = (e, order) => {
    setAnchorElActions(e.currentTarget);
    setSelectedOrder(order);
  };
  const handleActionsClose = () => {
    setAnchorElActions(null);
    setSelectedOrder(null);
  };

  // États des filtres
  const defaultStartDate = `${currentYear}-01-01`;
  const defaultEndDate = `${currentYear}-12-31`;
  const [dateStart, setDateStart] = useState(defaultStartDate);
  const [dateEnd, setDateEnd] = useState(defaultEndDate);
  const [orderNumber, setOrderNumber] = useState('');
  const [searchText, setSearchText] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState([5]);
  const [filterCertificate, setFilterCertificate] = useState(false);
  const [filterLegalisation, setFilterLegalisation] = useState(false);
  const [filterInvoice, setFilterInvoice] = useState(false);

  // États des commandes
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [transpMode, settransportModes] = useState({});
  const [orderFiles, setOrderFilesMap] = useState({});

  // Détection d'affichage mobile/desktop
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Gestion du multi‑select pour le status
  const handleStatusChange = (event) => {
    const { target: { value } } = event;
    setSelectedStatuses(typeof value === 'string' ? value.split(',') : value);
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
  // Récupération des commandes selon les filtres, avec tri et filtrage client-side
  const fetchOrders = async () => {
    if (!operatorId && !user?.id_cust_account) return;

    try {
      setLoading(true);

      // On n'envoie plus dateStart / dateEnd au back
      const params = {
        p_id_order_list: null,  // on gère orderNumber en local
        p_id_custaccount_list: isOpUser ? null : user.id_cust_account,
        p_id_orderstatus_list: selectedStatuses.length
          ? selectedStatuses.join(',')
          : null,
        p_idlogin: operatorId,
      };

      // 1) Récupérer tout
      let allOrders;
      if (isOpUser) {
        const resp = await getOrderOpInfo(params);
        allOrders = resp.data || resp;
      } else {
        // inside fetchOrders, non-op user case:
        const resp = await getOrdersForCustomer({
          idOrderList: null,                            // or your orderNumber
          idCustAccountList: user.id_cust_account,
          idOrderStatusList: selectedStatuses.join(','),
          idLogin: operatorId,
        });
        allOrders = resp.data || resp;
      }

      // 2) Enrichir chaque objet d'une Date pour trier / filtrer
      const withDates = allOrders
        .map(o => ({
          ...o,
          __created: o.insertdate_order ? new Date(o.insertdate_order) : null,
        }))
        .filter(o => o.__created); // on jette ceux sans date

      // 3) Filtrer par année et plage dateStart/dateEnd
      const start = new Date(dateStart);
      const end = new Date(dateEnd);
      let loaded = withDates
        .filter(o => o.__created.getFullYear() === currentYear)
        .filter(o => o.__created >= start && o.__created <= end);

      // 4) Filtrer par numéro de commande (partial match)
      if (orderNumber.trim()) {
        const numStr = orderNumber.trim();
        loaded = loaded.filter(o => o.id_order.toString().includes(numStr));
      }

      // 5) Filtrer certificats / légalisations / factures
      if (filterCertificate) loaded = loaded.filter(o => o.id_ord_certif_ori);
      if (filterLegalisation) loaded = loaded.filter(o => o.id_ord_legalization);
      if (filterInvoice) loaded = loaded.filter(o => o.id_ord_com_invoice);

      // 6) Filtrer texte libre (désignation OU client)
      if (searchText.trim()) {
        const lc = searchText.toLowerCase();
        loaded = loaded.filter(o =>
          (o.order_title || '').toLowerCase().includes(lc) ||
          (o.cust_name || '').toLowerCase().includes(lc)
        );
      }

      // 7) Tri combiné :
      //    1) statut_flag asc,
      //    2) date création desc,
      //    3) numéro de commande desc
      loaded.sort((a, b) => {
        if (a.statut_flag !== b.statut_flag) {
          return a.statut_flag - b.statut_flag;
        }
        const dateDiff = b.__created - a.__created;
        if (dateDiff !== 0) return dateDiff;
        return b.id_order - a.id_order;
      });

      // 8) Retirer __created avant le setState
      const result = loaded.map(({ __created, ...rest }) => rest);
      setOrders(result);

    } catch (err) {
      console.error('Error loading orders for search:', err);
      setError(err.message || "Erreur lors du chargement des commandes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [operatorId, user?.id_cust_account]);

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
    if (isOpUser) {
      navigate(
        `/operator/oporderdetails?orderId=${order.id_order}&certifId=${certifId}`
      );
    } else {
      navigate(
        `/order-details?orderId=${order.id_order}&certifId=${certifId}`
      );
    }
  };

  useEffect(() => {
    const fetchTransportModes = async () => {
      try {
        const fetched = await getTransmodeInfo(null, true);
        settransportModes(fetched.data || {});
      } catch (error) {
        console.error("Error fetching transport modes:", error);
      }
    };
    fetchTransportModes();
  }, []);

  async function stampCopy(blobPdf) {
    const arrayBuffer = await blobPdf.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    pages.forEach(page => {
      const { width, height } = page.getSize();

      const text = 'COPIE';
      const fontSize = 12;
      const textWidth = font.widthOfTextAtSize(text, fontSize);
      const textHeight = fontSize;

      const x = width / 2 + 115;
      const y = height - 240;

      // Draw white rectangle behind the text
      page.drawRectangle({
        x: x - 4,
        y: y - 2,
        width: textWidth + 50,
        height: textHeight + 4,
        color: rgb(1, 1, 1), // white
      });

      // Draw text
      page.drawText(text, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(0, 0, 1), // blue
      });
    });

    const bytes = await pdfDoc.save();
    return new Blob([bytes], { type: 'application/pdf' });
  }


  const handleGeneratePDF = async (order) => {
    try {
      console.log('Génération de PDF pour la commande :', order);
  
      // ─── 0) Collecte des données ───────────────────────────────
      const originCountry = countries.find(c => c.id_country === order.id_country_origin)?.symbol_fr || '';
      const destinationCountry = countries.find(c => c.id_country === order.id_country_destination)?.symbol_fr || '';
      const portLoading = countries.find(c => c.id_country === order.id_country_port_loading)?.symbol_fr || '';
      const portDischarge = countries.find(c => c.id_country === order.id_country_port_discharge)?.symbol_fr || '';
  
      const transpResponse = await getCertifTranspMode({
        idListCT: null,
        idListCO: order.id_ord_certif_ori?.toString() || null,
        isActiveOT: 'true',
        isActiveTM: 'true',
        idListOrder: null,
        idListOrderStatus: null,
      });
      const transportModesObj = {};
      transpResponse?.data?.forEach(m => {
        transportModesObj[m.symbol_fr.toLowerCase()] = true;
      });
  
      const custAccountInfo = await getCustAccountInfo(order.id_cust_account);
      const exporterCountry = countries.find(c => c.id_country === custAccountInfo.data[0].id_country)?.symbol_fr || '';
      const certifGoods = await getCertifGoodsInfo(order.id_ord_certif_ori);
      const recipientList = await fetchRecipients({
        idListR: order.id_recipient_account?.toString() || null,
      });
      const recipient = recipientList.data?.[0] || {};
  
      const formData = {
        transportModes: transportModesObj,
        merchandises: certifGoods.data || [],
        exporterName: order.cust_name || '',
        exporterAddress: custAccountInfo.data[0].full_address,
        exporterCountry,
        originCountry,
        destinationCountry,
        portLoading,
        portDischarge,
        recipientName: recipient.recipient_name || '',
        recipientAddress: recipient.address_1,
        recipientCountry: recipient.country_symbol_fr_recipient,
        DateValidation: order.date_validation_ori,
        Certifid: order.id_ord_certif_ori,
      };
  
      // ─── 1) Génère le PDF original ───────────────────────────────
      const basePdfBlob = await generatePDF(formData);
      const origFileName = `certificat_${String(order.id_ord_certif_ori).padStart(8, '0')}.pdf`;
  
      // ─── 2) Upload du PDF ORIGINAL ──────────────────────────────
      await setOrderFiles({
        uploadType: 'commandes',
        p_id_order: order.id_order,
        p_idfiles_repo_typeof: 1000,
        p_file_origin_name: origFileName,
        p_typeof_order: 1,
        p_idlogin_insert: operatorId,
        file: new File([basePdfBlob], origFileName, { type: 'application/pdf' }),
      });
      console.log('Original uploadé:', origFileName);
  
      // ─── 3) Génération et upload de la copie si demandée ───────
      let copyBlob = null;
      let copyFileName = '';
      if ((order.copy_count_ori || 0) > 0) {
        console.log('Génération et upload d’une copie tamponnée');
        copyBlob = await stampCopy(basePdfBlob);
        copyFileName = `certificat_${String(order.id_ord_certif_ori).padStart(8, '0')}_COPIE.pdf`;
        await setOrderFiles({
          uploadType: 'commandes',
          p_id_order: order.id_order,
          p_idfiles_repo_typeof: 1001,
          p_file_origin_name: copyFileName,
          p_typeof_order: 1,
          p_idlogin_insert: operatorId,
          file: new File([copyBlob], copyFileName, { type: 'application/pdf' }),
        });
        console.log('Copie uploadée:', copyFileName);
      }
  
      // ─── 4) Mise à jour de l’état local et rafraîchissement ─────
      const fileCheck = await getOrderFilesInfo({
        p_id_order_list: order.id_order,
        p_idfiles_repo_typeof: 1000,
      });
      if (fileCheck?.length) {
        setOrderFilesMap(prev => ({ ...prev, [order.id_order]: fileCheck[0] }));
      }
      await fetchOrders();
  
      // ─── 5) Envoi de l’e-mail + création du mémo ────────────────
      const mainContact = custAccountInfo.data[0].main_contact?.find(c => c.ismain_user);
      const toEmail = mainContact?.email;
      if (!toEmail) {
        console.warn('Pas de contact principal pour la commande', order.id_order);
        return;
      }
  
      const subject = `Votre PDF de commande #${order.id_order} est disponible`;
      const body = `
        <p>Bonjour ${custAccountInfo.data[0].cust_name},</p>
        <p>Le PDF de votre commande <strong>#${order.id_order}</strong> a été généré${order.copy_count_ori > 0 ? ' et une copie a été créée' : ''}.</p>
        <p>Vous pouvez le télécharger via votre espace client.</p>
        <p>Bien cordialement,<br/>La Chambre de Commerce de Djibouti</p>
      `;
  
      await sendEmailAndMemo({
        to: toEmail,
        subject,
        body,
        isHtml: true,
        id_cust_account: order.id_cust_account,
        idlogin: operatorId,
      });
      console.log('E-mail envoyé à', toEmail);
  
      // ─── 6) Création du mémo en base ─────────────────────────────
      const memoResp = await setMemo({
        p_id_order:        order.id_order,
        p_id_cust_account: order.id_cust_account,
        p_typeof:          1, // mémo « certificat »
        p_idlogin_insert:  operatorId,
        p_memo_subject:    subject,
        p_memo_body:      `<p>Bonjour ${custAccountInfo.data[0].cust_name},</p>
        <p>Le PDF de votre commande <strong>#${order.id_order}</strong> a été généré${order.copy_count_ori > 0 ? ' et une copie a été créée' : ''}.</p>
        <p>Bien cordialement,<br/>La Chambre de Commerce de Djibouti</p>
      `,
        p_mail_to:         toEmail,
      });
      const newMemoId = memoResp.newMemoId;
      if (!newMemoId) throw new Error('Aucun ID de mémo renvoyé');
  
      // ─── 7) Upload du PDF original comme pièce jointe du mémo ────
      const formOrig = new FormData();
      formOrig.append('p_id_memo', newMemoId);
      formOrig.append('p_idfiles_repo_typeof', 1002); // ORIGINAL
      formOrig.append('p_file_origin_name', origFileName);
      formOrig.append('p_idlogin_insert', operatorId);
      formOrig.append('uploadType', 'memos');
      formOrig.append('file', new File([basePdfBlob], origFileName, { type: 'application/pdf' }));
      await setMemoFiles(formOrig);
  
      // ─── 8) Upload de la copie comme pièce jointe du mémo ────────
      if (copyBlob) {
        const formCopy = new FormData();
        formCopy.append('p_id_memo', newMemoId);
        formCopy.append('p_idfiles_repo_typeof', 1003); // COPIE
        formCopy.append('p_file_origin_name', copyFileName);
        formCopy.append('p_idlogin_insert', operatorId);
        formCopy.append('uploadType', 'memos');
        formCopy.append('file', new File([copyBlob], copyFileName, { type: 'application/pdf' }));
        await setMemoFiles(formCopy);
      }
  
      console.log('Mémo et pièces jointes créés avec succès.');
    } catch (err) {
      console.error('Erreur dans handleGeneratePDF :', err);
    }
  };

  const handleFileClick = (file) => {
    const fileUrl = `${API_URL}/files/commandes/${new Date().getFullYear()}/${file.file_guid}`;
    window.open(fileUrl, '_blank');
  };

  useEffect(() => {
    const fetchFilesForOrders = async () => {
      let filesMapping = {};
      for (const order of orders) {
        try {
          const result = await getOrderFilesInfo({
            p_id_order_list: order.id_order,
            p_idfiles_repo_typeof: 1000,
          });
          if (result && result.length > 0) {
            filesMapping[order.id_order] = result[0];
          }
        } catch (error) {
          console.error("Error fetching file info for order", order.id_order, error);
        }
      }
      setOrderFilesMap(filesMapping);
    };
    if (orders.length > 0) {
      fetchFilesForOrders();
    }
  }, [orders]);

  const paginatedOrders = orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // ──────────── États et handlers audit/mémos ────────────
  const [auditOpen, setAuditOpen] = useState(false);
  const [memoOpen, setMemoOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [memoList, setMemoList] = useState([]);
  const [auditOrder, setAuditOrder] = useState(null);

  const handleOpenAudit = async (order) => {
    setAuditOrder(order);
    const logs = await getOrderHisto({ p_id_list_order: String(order.id_order) });
    setAuditLogs(logs);
    setAuditOpen(true);
  };

  const handleOpenMemo = async (order) => {
    setAuditOrder(order);
    const memos = await getOrderMemo({
      p_id_order_list: String(order.id_order),
      p_idlogin: operatorId,
      p_isopuser: isOpUser
    });
    setMemoList(memos);
    setMemoOpen(true);
  };

  const handleCloseAudit = () => setAuditOpen(false);
  const handleCloseMemo = () => setMemoOpen(false);
  // ────────────────────────────────────────────────────────


  // Rendu en affichage mobile : Cartes
  const renderCardView = () => (
    <Grid container spacing={2}>
      {paginatedOrders.length > 0 ? (
        paginatedOrders.map((order) => (
          <Grid item xs={12} key={order.id_order}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2">
                  <strong>Date de création :</strong> {order.insertdate_order ? new Date(order.insertdate_order).toLocaleString() : '-'}
                </Typography>
                <Typography variant="subtitle2">
                  <strong>N° de commande :</strong> {order.id_order}
                </Typography>
                <Typography variant="subtitle2">
                  <strong>Client :</strong> {order.cust_name}
                </Typography>
                <Typography variant="subtitle2">
                  <strong>Désignation :</strong> {order.order_title}
                </Typography>
                <Typography variant="subtitle2">
                  <strong>Date de soumission :</strong> {order.date_last_submission ? formatDate(order.date_last_submission) : '-'}
                </Typography>
                <Typography variant="subtitle2">
                  <strong>Date d'approbation :</strong> {order.date_validation_order ? formatDate(order.date_validation_order) : '-'}
                </Typography>
              </CardContent>
              <CardActions>
                <IconButton size="small" onClick={e => handleActionsOpen(e, order)}>
                  <FontAwesomeIcon
                    icon={faEllipsisV}
                    style={{ color: '#DCAF26' }}
                  />
                </IconButton>

                <Menu
                  anchorEl={anchorElActions}
                  open={Boolean(anchorElActions) && selectedOrder?.id_order === order.id_order}
                  onClose={handleActionsClose}
                >
                  {/* 1) Détails */}
                  <MenuItem onClick={() => { handleDetailsClick(order); handleActionsClose(); }}>
                    <ListItemIcon sx={{ color: '#DCAF26' }}>
                      <VisibilityIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Détails" />
                  </MenuItem>

                  {/* 2) Piste d'audit */}
                  <MenuItem onClick={() => { handleOpenAudit(order); handleActionsClose(); }}>
                    <ListItemIcon sx={{ color: '#DCAF26' }}>
                      <HistoryIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Piste d’audit" />
                  </MenuItem>

                  {/* 3) Mémos */}
                  <MenuItem onClick={() => { handleOpenMemo(order); handleActionsClose(); }}>
                    <ListItemIcon sx={{ color: '#DCAF26' }}>
                      <ChatBubbleIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Mémos" />
                  </MenuItem>

                  {/* 2) Si statut = 5, actions PDF */}
                  {order.id_order_status === 5 && (
                    isOpUser
                      ? (
                        <>
                          {/* Ouvrir si déjà généré */}
                          {orderFiles[order.id_order] && (
                            <MenuItem
                              onClick={() => { handleFileClick(orderFiles[order.id_order]); handleActionsClose(); }}
                              sx={{ color: '#DCAF26' }}
                            >
                              <FontAwesomeIcon
                                icon={faFilePdf}
                                style={{ color: '#DCAF26', marginRight: 8 }}
                              />
                              Ouvrir
                            </MenuItem>
                          )}
                          {/* Toujours proposer Générer */}
                          <MenuItem
                            onClick={() => { handleGeneratePDF(order); handleActionsClose(); }}
                            sx={{ color: '#DCAF26' }}
                          >
                            <FontAwesomeIcon
                              icon={faFilePdf}
                              style={{ color: '#DCAF26', marginRight: 8 }}
                            />
                            Générer PDF
                          </MenuItem>
                        </>
                      )
                      : (
                        <MenuItem
                          onClick={() => {
                            handleFileClick(orderFiles[order.id_order]);
                            handleActionsClose();
                          }}
                          sx={{ color: '#DCAF26' }}
                        >
                          <FontAwesomeIcon
                            icon={faFilePdf}
                            style={{ color: '#DCAF26', marginRight: 8 }}
                          />
                          Ouvrir
                        </MenuItem>
                      )
                  )}
                </Menu>
              </CardActions>

            </Card>
          </Grid>
        ))
      ) : (
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography align="center">Aucune commande trouvée.</Typography>
          </Paper>
        </Grid>
      )}
    </Grid>
  );

  // Rendu en affichage desktop : Tableau
  const renderTableView = () => (
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
                  {order.insertdate_order ? new Date(order.insertdate_order).toLocaleString() : '-'}
                </TableCell>
                <TableCell>{order.id_order}</TableCell>
                <TableCell>{order.cust_name}</TableCell>
                <TableCell>{order.order_title}</TableCell>
                <TableCell>
                  {order.date_last_submission ? formatDate(order.date_last_submission) : '-'}
                </TableCell>
                <TableCell>
                  {order.date_validation_order ? formatDate(order.date_validation_order) : '-'}
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={e => handleActionsOpen(e, order)}>
                    <FontAwesomeIcon
                      icon={faEllipsisV}
                      style={{ color: '#DCAF26' }}
                    />
                  </IconButton>
                  <Menu
                    anchorEl={anchorElActions}
                    open={Boolean(anchorElActions) && selectedOrder?.id_order === order.id_order}
                    onClose={handleActionsClose}
                  >
                    {/* 1) Détails */}
                    <MenuItem onClick={() => { handleDetailsClick(order); handleActionsClose(); }}>
                      <FontAwesomeIcon icon={faEye} style={{ color: '#DCAF26', marginRight: 8 }} />
                      Détails
                    </MenuItem>

                    {/* 2) Piste d’audit */}
                    <MenuItem onClick={() => { handleOpenAudit(order); handleActionsClose(); }}>
                      <ListItemIcon sx={{ color: '#DCAF26' }}>
                        <HistoryIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Piste d’audit" />
                    </MenuItem>

                    {/* 3) Mémos */}
                    <MenuItem onClick={() => { handleOpenMemo(order); handleActionsClose(); }}>
                      <ListItemIcon sx={{ color: '#DCAF26' }}>
                        <ChatBubbleIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Mémos" />
                    </MenuItem>

                    {/* Seulement si status = 5 */}
                    {order.id_order_status === 5 && (
                      isOpUser
                        ? (
                          <>
                            {/* Ouvrir si déjà généré */}
                            {orderFiles[order.id_order] && (
                              <MenuItem
                                onClick={() => { handleFileClick(orderFiles[order.id_order]); handleActionsClose(); }}

                              >
                                <FontAwesomeIcon
                                  icon={faFilePdf}
                                  style={{ color: '#DCAF26', marginRight: 8 }}
                                />
                                Ouvrir
                              </MenuItem>
                            )}
                            {/* Toujours possibilité de régénérer */}
                            <MenuItem
                              onClick={() => { handleGeneratePDF(order); handleActionsClose(); }}

                            >
                              <FontAwesomeIcon
                                icon={faFilePdf}
                                style={{ color: '#DCAF26', marginRight: 8 }}
                              />
                              Générer PDF
                            </MenuItem>
                          </>
                        )
                        : (
                          /* Pour client non-opUser : link vers l’open côté client */
                          <MenuItem
                            onClick={() => {
                              handleFileClick(orderFiles[order.id_order]);
                              handleActionsClose();
                            }}
                            sx={{ color: '#DCAF26' }}
                          >
                            <FontAwesomeIcon
                              icon={faFilePdf}
                              style={{ color: '#DCAF26', marginRight: 8 }}
                            />
                            Ouvrir
                          </MenuItem>
                        )
                    )}
                  </Menu>
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

  );

  return (
    <Box sx={{ ml: { xs: 0, md: '240px' }, p: 2 }}>
      <Typography variant="h4" sx={{ mb: 2, mt: 2 }}>
        Historique de commandes terminées - {currentYear}
      </Typography>
      {/* Section des filtres */}
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

          {/* ─── Status Filter ─────────────────────────────────────────── */}
          <FormControl sx={{ minWidth: 200 }}>
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
                  {selected.map((value) => {
                    let label = '';
                    switch (value) {
                      case 5: label = 'Terminé'; break;
                      case 8: label = 'Annulé'; break;
                      case 9: label = 'Rejeté'; break;
                      default: label = statusMap[value] || value;
                    }
                    return <Chip key={value} label={label} size="small" />;
                  })}
                </Box>
              )}
              MenuProps={MenuProps}
            >
              {/* always allow Terminé */}
              <MenuItem value={5}>Terminé</MenuItem>
              {/* only non-operators can pick Annulé */}
              {!isOpUser && <MenuItem value={8}>Annulé</MenuItem>}
              {/* everyone can pick Rejeté */}
              <MenuItem value={9}>Rejeté</MenuItem>
            </Select>
          </FormControl>
          {/* ────────────────────────────────────────────────────────────── */}

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
      {loading ? (
        <Typography>Chargement en cours...</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        isSmallScreen ? renderCardView() : renderTableView()
      )}
      <TablePagination
        component="div"
        count={orders.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />
      {/* Dialog Audit */}

      <Dialog open={auditOpen} onClose={handleCloseAudit} fullWidth maxWidth="md">
        <DialogTitle>Piste d’audit – Commande #{auditOrder?.id_order}</DialogTitle>
        <DialogContent dividers>
          <Table size="small">
            <TableHead><TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Utilisateur</TableCell>
              <TableCell>Statut</TableCell>
            </TableRow></TableHead>
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
          <Button onClick={handleCloseAudit}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Mémos */}
      <Dialog open={memoOpen} onClose={handleCloseMemo} fullWidth maxWidth="md">
        <DialogTitle>Mémos – Commande #{auditOrder?.id_order}</DialogTitle>
        <DialogContent dividers>
          <Table size="small">
            <TableHead><TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Sujet</TableCell>
              <TableCell>Corps</TableCell>
              <TableCell>De</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {memoList.map(memo => {
                // Si l’ID du login qui a posté le mémo est celui de l’opérateur courant,
                // on affiche un libellé « Opérateur » (ou le nom du user if vous l’avez déjà en Redux)
                const isOperatorSender = memo.idlogin_insert === operatorId;

                return (
                  <TableRow key={memo.id_memo}>
                    <TableCell>
                      {new Date(memo.memo_date).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {memo.memo_subject}
                    </TableCell>
                    <TableCell>
                      {memo.memo_body}
                    </TableCell>
                    <TableCell>
                      {isOperatorSender
                        ? "Opérateur"
                        : memo.cust_user_full_name // le nom du contact
                      }
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMemo}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SearchOrders;
