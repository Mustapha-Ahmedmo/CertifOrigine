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
import { fetchCountries, fetchRecipients, getCertifGoodsInfo, getCertifTranspMode, getCustAccountInfo, getOrderFilesInfo, getOrderOpInfo, getOrdersForCustomer, getTransmodeInfo, setOrderFiles } from '../../services/apiServices';
import { formatDate } from '../../utils/dateUtils';
import './SearchOrders.css';
import { generatePDF } from '../../components/orders/GeneratePDF';

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
        `/dashboard/operator/oporderdetails?orderId=${order.id_order}&certifId=${certifId}`
      );
    } else {
      navigate(
        `/dashboard/order-details?orderId=${order.id_order}&certifId=${certifId}`
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

  const handleGeneratePDF = async (order) => {
    console.log('Génération de PDF pour la commande:', order);
    console.log("Transmode : ", transpMode);
    const originCountry = countries.find(c => c.id_country === order.id_country_origin)?.symbol_fr || '';
    const destinationCountry = countries.find(c => c.id_country === order.id_country_destination)?.symbol_fr || '';
    const portLoading = countries.find(c => c.id_country === order.id_country_port_loading)?.symbol_fr || '';
    const portDischarge = countries.find(c => c.id_country === order.id_country_port_discharge)?.symbol_fr || '';
    const transpResponse = await getCertifTranspMode({
      idListCT: null,
      idListCO: order.id_ord_certif_ori ? order.id_ord_certif_ori.toString() : null,
      isActiveOT: 'true',
      isActiveTM: 'true',
      idListOrder: null,
      idListOrderStatus: null,
    });
    let transportModesObj = {};
    if (transpResponse && transpResponse.data) {
      transpResponse.data.forEach((mode) => {
        transportModesObj[mode.symbol_fr.toLowerCase()] = true;
      });
    }
    console.log("transpResponse ", transportModesObj);
    const custAccountInfo = await getCustAccountInfo(order.id_cust_account);
    console.log("custAccountInfo ", custAccountInfo);
    const exporterCountry = countries.find(c => c.id_country === custAccountInfo.data[0].id_country)?.symbol_fr || '';
    console.log("exporterCountry ", exporterCountry);
    const certifGoods = await getCertifGoodsInfo(order.id_ord_certif_ori);
    console.log("certifGoods =>", certifGoods);
    const recipientInfoResponse = await fetchRecipients({
      idListR: order.id_recipient_account ? order.id_recipient_account.toString() : null,
    });
    const recipient = (recipientInfoResponse.data && recipientInfoResponse.data.length > 0)
      ? recipientInfoResponse.data[0]
      : {};
    console.log("Recipient info:", recipient);
    const formData = {
      transportModes: transportModesObj,
      merchandises: certifGoods.data || [],
      exporterName: order.cust_name || '',
      exporterAddress: custAccountInfo.data[0].full_address,
      exporterCountry: exporterCountry || '',
      originCountry,
      destinationCountry,
      portLoading,
      portDischarge,
      recipientName: recipient.recipient_name || '',
      recipientAddress: [recipient.address_1, recipient.address_2, recipient.address_3].filter(Boolean).join(', '),
      recipientCountry: recipient.country_symbol_fr_recipient,
      DateValidation: order.date_validation_ori,
      Certifid: order.id_ord_certif_ori
    };
    const pdfBlob = await generatePDF(formData);
    const pdfFile = new File(
      [pdfBlob],
      `certificat_${String(order.id_ord_certif_ori).padStart(8, '0')}.pdf`,
      { type: 'application/pdf' }
    );
    const orderFileData = {
      uploadType: 'commandes',
      p_id_order: order.id_order,
      p_idfiles_repo_typeof: 1000,
      p_file_origin_name: `certificat_${String(order.id_ord_certif_ori).padStart(8, '0')}.pdf`,
      p_typeof_order: 1,
      p_idlogin_insert: operatorId,
      file: pdfFile,
    };

    console.log('Sending file data to setOrderFiles:', orderFileData);
    const result = await setOrderFiles(orderFileData);
    console.log('Result from setOrderFiles:', result);

    console.log('Fetching file info for order:', order.id_order);
    const fileCheck = await getOrderFilesInfo({
      p_id_order_list: order.id_order,
      p_idfiles_repo_typeof: 1000,
    });
    console.log('File info (fileCheck):', fileCheck);

    if (fileCheck && fileCheck.length > 0) {
      console.log('Found file record, updating local state orderFilesMap...');
      setOrderFilesMap((prev) => ({
        ...prev,
        [order.id_order]: fileCheck[0],
      }));
    } else {
      console.log('No file record returned in fileCheck. Nothing to update in orderFilesMap.');
    }

    console.log('PDF generated and order file saved successfully. Now refreshing orders...');
    await fetchOrders();
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
                <Button variant="contained" color="primary" size="small" onClick={() => handleDetailsClick(order)}>
                  <FontAwesomeIcon icon={faEye} /> Détails
                </Button>

                {order.id_order_status === 5 && (
                  isOpUser ? (
                    <>
                      {orderFiles[order.id_order] && (
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          sx={{ mr: 1 }}
                          onClick={() => handleFileClick(orderFiles[order.id_order])}
                        >
                          <FontAwesomeIcon icon={faFilePdf} /> Ouvrir
                        </Button>
                      )}
                      <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        onClick={() => handleGeneratePDF(order)}
                      >
                        <FontAwesomeIcon icon={faFilePdf} /> Générer PDF
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      onClick={() =>
                        navigate(
                          `/dashboard/order-details?orderId=${order.id_order}&certifId=${order.id_ord_certif_ori}`
                        )
                      }
                    >
                      <FontAwesomeIcon icon={faFilePdf} /> Ouvrir
                    </Button>
                  )
                )}
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
                  <Button variant="contained" color="primary" size="small" onClick={() => handleDetailsClick(order)}>
                    <FontAwesomeIcon icon={faEye} /> Détails
                  </Button>

                  {order.id_order_status === 5 && (
                    isOpUser ? (
                      <>
                        {orderFiles[order.id_order] && (
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            sx={{ ml: 1 }}
                            onClick={() => handleFileClick(orderFiles[order.id_order])}
                          >
                            <FontAwesomeIcon icon={faFilePdf} /> Ouvrir
                          </Button>
                        )}
                        <Button
                          variant="contained"
                          color="secondary"
                          size="small"
                          sx={{ ml: 1 }}
                          onClick={() => handleGeneratePDF(order)}
                        >
                          <FontAwesomeIcon icon={faFilePdf} /> Générer PDF
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        sx={{ ml: 1 }}
                        onClick={() =>
                          navigate(
                            `/dashboard/order-details?orderId=${order.id_order}&certifId=${order.id_ord_certif_ori}`
                          )
                        }
                      >
                        <FontAwesomeIcon icon={faFilePdf} /> Ouvrir
                      </Button>
                    )
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
    </Box>
  );
};

export default SearchOrders;
