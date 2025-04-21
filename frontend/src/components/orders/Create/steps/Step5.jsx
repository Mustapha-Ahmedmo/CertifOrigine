import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Checkbox,
  FormControlLabel,
  Card,
  CardContent,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faTimes } from '@fortawesome/free-solid-svg-icons';

import {
  addRecipient,
  fetchCountries,
  fetchRecipients,
  getOrderFilesInfo,
  getOrdersForCustomer,
  renameOrder,
  updateCertificate,
  getUnitWeightInfo,
  submitOrder,
  deleteCertifGoods,
  addOrUpdateGoods,
  getTransmodeInfo,
  setOrdCertifTranspMode,
  removeSingleCertifTranspMode,
  getFilesRepoTypeofInfo,
  setOrderFiles,
  delOrderFiles,
} from '../../../../services/apiServices';

const Step5 = ({
  prevStep,
  values,
  handleSubmit,
  isModal,
  openSecondModal,
  handleChange,
}) => {
  // --- Récupération des infos user / état commande ---
  const user = useSelector((state) => state.auth.user);
  const idLogin = user?.id_login_user;
  const customerAccountId = user?.id_cust_account;
  const companyName = user?.companyname;

  // Query params
  const params = new URLSearchParams(location.search);
  const certifId = params.get('certifId');
  const orderId = params.get('orderId') || values.orderId;

  // Commande modifiable ?
  const isModifiable = values.orderStatus === 1 || values.orderStatus === 6;

  // --- Responsivité : “cartes” sur mobile, “table” sur desktop ---
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // --- Champs “généraux” ---
  const [orderLabel, setOrderLabel] = useState(values.orderLabel || values.orderName || '');
  const [isEditingLabel, setIsEditingLabel] = useState(false);

  const [copies, setCopies] = useState(values.copies || '');
  const [isEditingCopies, setIsEditingCopies] = useState(false);

  const [remarks, setRemarks] = useState(values.remarks || '');
  const [isEditingRemarks, setIsEditingRemarks] = useState(false);

  // --- Pays, destinataires, modes de transport, etc. ---
  const [countries, setCountries] = useState([]);
  const [localRecipients, setLocalRecipients] = useState(values.recipients || []);
  const [selectedRecipientId, setSelectedRecipientId] = useState(values.selectedRecipientId || '');
  const [transpModeList, setTranspModeList] = useState([]);
  const [tempTransportModes, setTempTransportModes] = useState(values.transportModes || {});
  const [unitWeights, setUnitWeights] = useState([]);

  // --- Marchandises ---
  const [merchandises, setMerchandises] = useState(values.merchandises || []);

  // --- Documents ---
  const [documentsInfo, setDocumentsInfo] = useState([]);

  // --- Dialog states (uniques, pas de doublons) ---
  const [showNewRecipientDialog, setShowNewRecipientDialog] = useState(false);
  const [newRecipientLocal, setNewRecipientLocal] = useState({
    receiverName: '',
    receiverAddress: '',
    receiverAddress2: '',
    receiverPostalCity: '',    // 
    receiverCountry: '',
  });

  const [showNewMerchDialog, setShowNewMerchDialog] = useState(false);
  const [newMerchLocal, setNewMerchLocal] = useState({
    designation: '',
    boxReference: '',
    docReference: '',
    quantity: '',
    unit: '',
  });

  const [showNewDocumentDialog, setShowNewDocumentDialog] = useState(false);
  const [newDocumentData, setNewDocumentData] = useState({
    file: null,
    selectedFileType: '',
  });
  const [mandatoryFileTypes, setMandatoryFileTypes] = useState([]);

  // Pour gérer d'éventuels messages d'erreur
  const [errorMessage, setErrorMessage] = useState('');
  const [submitError, setSubmitError] = useState('');


  // --- CHARGEMENT INITIAL ---
  useEffect(() => {
    const loadInitData = async () => {
      try {
        // Pays
        const ctries = await fetchCountries();
        setCountries(ctries.data || ctries);

        // Destinataires
        if ((!localRecipients || localRecipients.length === 0) && customerAccountId) {
          const resp = await fetchRecipients({ idListCA: customerAccountId, statutFlagR : 1  });
          setLocalRecipients(resp.data || []);
          handleChange?.('recipients', resp.data || []);
        }

        if (orderId && customerAccountId) {
          const ordersResp = await getOrdersForCustomer({
            idCustAccountList: customerAccountId,
            idLogin,
          });
          const orders = ordersResp.data || [];
          const currentOrder = orders.find(
            (o) => Number(o.id_order) === Number(orderId)
          );
          if (currentOrder?.id_recipient_account) {
            setSelectedRecipientId(String(currentOrder.id_recipient_account));
            handleChange?.('selectedRecipientId', currentOrder.id_recipient_account);
          }
        }

        // Modes de transport
        const tModes = await getTransmodeInfo(null, true);
        setTranspModeList(tModes.data || []);

        // Unités de poids
        const uw = await getUnitWeightInfo(null, true);
        setUnitWeights(uw.data || []);

        // Documents de la commande
        if (orderId) {
          const files = await getOrderFilesInfo({
            p_id_order_list: orderId,
            p_isactive: true,
            p_id_custaccount: customerAccountId,
          });
          setDocumentsInfo(files);
        }

        // Types de fichiers
        const fileTypesResp = await getFilesRepoTypeofInfo({
          p_id_files_repo_typeof_first: 500,
          p_id_files_repo_typeof_last: 649,
          p_ismandatory: null,
        });
        setMandatoryFileTypes(fileTypesResp.data || []);
      } catch (error) {
        console.error('Step5 init error:', error);
      }
    };
    loadInitData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync des marchandises
  useEffect(() => {
    setMerchandises(values.merchandises || []);
  }, [values.merchandises]);

  // Sync copies & remarks
  useEffect(() => {
    setCopies(values.copies || '');
    setRemarks(values.remarks || '');
  }, [values.copies, values.remarks]);

  // Sync label
  useEffect(() => {
    setOrderLabel(values.orderLabel || values.orderName || '');
  }, [values.orderLabel, values.orderName]);

  // Sync modes de transport
  useEffect(() => {
    setTempTransportModes(values.transportModes || {});
  }, [values.transportModes]);

  // Sélection auto destinataire s'il n'y en a pas
  useEffect(() => {
    if ((!selectedRecipientId || selectedRecipientId === '') && localRecipients.length > 0) {
      const defaultId = localRecipients[0].id_recipient_account;
      setSelectedRecipientId(String(defaultId));
      handleChange?.('selectedRecipientId', defaultId);
    }
  }, [selectedRecipientId, localRecipients, handleChange]);

  // ------------------------------------------------
  // 1) GESTION DU LABEL
  // ------------------------------------------------
  const saveOrderLabel = async () => {
    if (!values.orderId || !idLogin) return;
    try {
      await renameOrder({
        p_id_order: values.orderId,
        p_order_title: orderLabel,
        p_idlogin_modify: idLogin,
      });
      setIsEditingLabel(false);
      handleChange?.('orderLabel', orderLabel);
    } catch (error) {
      console.error('Rename order error:', error);
    }
  };

  // ------------------------------------------------
  // 2) DESTINATAIRE
  // ------------------------------------------------
  const handleRecipientChange = (e) => {
    const newVal = e.target.value;
    setSelectedRecipientId(newVal);
    handleChange?.('selectedRecipientId', newVal);
  };

  const handleRecipientSubmit = async () => {
    try {
      if (!values.orderId || !selectedRecipientId || !idLogin) return;

      const ordersResponse = await getOrdersForCustomer({
        idCustAccountList: customerAccountId,
        idLogin,
      });
      const orders = ordersResponse.data || [];
      const currentOrder = orders.find((o) => Number(o.id_order) === Number(orderId));
      if (!currentOrder) return;

      const certData = currentOrder.certData || currentOrder;

      const certUpdateData = {
        p_id_ord_certif_ori: certData.id_ord_certif_ori,
        p_id_recipient_account: selectedRecipientId,
        p_id_country_origin: certData.id_country_origin,
        p_id_country_destination: certData.id_country_destination,
        p_id_country_port_loading: certData.id_country_port_loading,
        p_id_country_port_discharge: certData.id_country_port_discharge,
        p_notes: certData.notes || '',
        p_copy_count: certData.copy_count || values.copies,
        p_idlogin_modify: idLogin,
        p_transport_remains: values.transportRemarks || '',
      };
      await updateCertificate(certUpdateData);

      alert('Le destinataire a bien été mis à jour.');
      handleChange?.('selectedRecipientId', selectedRecipientId);
      
    } catch (error) {
      console.error('Error updating recipient:', error);
      alert("Erreur lors de la mise à jour du destinataire.");
    }
  };

  const handleNewRecipientChange = (field, value) => {
    setNewRecipientLocal((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveNewRecipient = async () => {
    try {
      const newRecipientData = {
        idRecipientAccount: null,
        idCustAccount: customerAccountId,
        recipientName: newRecipientLocal.receiverName,
        address1: newRecipientLocal.receiverAddress,
        address2: newRecipientLocal.receiverAddress2,
        address3: newRecipientLocal.receiverPostalCity,
        idCity: 1,
        statutFlag: 1,
        activationDate: new Date().toISOString(),
        idCountry: newRecipientLocal.receiverCountry,
        deactivationDate: new Date('9999-12-31').toISOString(),
        idLoginInsert: idLogin || 1,
        idLoginModify: null,
        city_symbol_fr_recipient: newRecipientLocal.receiverCity,
        country_symbol_fr_recipient: newRecipientLocal.receiverCountry,
      };

      const resp = await addRecipient(newRecipientData);
      const newRecipientId = resp?.newRecipientId;
      const updatedList = await fetchRecipients({ idListCA: customerAccountId });
      setLocalRecipients(updatedList.data);
      handleChange?.('recipients', updatedList.data);

      setSelectedRecipientId(String(newRecipientId));
      handleChange?.('selectedRecipientId', newRecipientId);

      setShowNewRecipientDialog(false);
      setNewRecipientLocal({
        receiverName: '',
        receiverAddress: '',
        receiverAddress2: '',
        receiverPostalCode: '',
        receiverCity: '',
        receiverCountry: '',
      });
    } catch (error) {
      console.error('Error creating new recipient:', error);
    }
  };

  // ------------------------------------------------
  // 3) MARCHANDISES
  // ------------------------------------------------
  const handleDeleteMerchandise = async (index) => {
    const merchandiseToDelete = merchandises[index];
    if (merchandiseToDelete?.id_ord_certif_goods) {
      try {
        await deleteCertifGoods(merchandiseToDelete.id_ord_certif_goods, idLogin, 0);
      } catch (error) {
        console.error('Error deleting merch from DB:', error);
        alert("Erreur lors de la suppression de la marchandise.");
      }
    }
    const updated = merchandises.filter((_, i) => i !== index);
    setMerchandises(updated);
    handleChange?.('merchandises', updated);
  };

  const handleNewMerchChange = (field, value) => {
    setNewMerchLocal((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveNewMerch = async () => {
    if (
      !newMerchLocal.designation ||
      !newMerchLocal.boxReference ||
      !newMerchLocal.quantity ||
      !newMerchLocal.unit
    ) {
      alert("Veuillez remplir tous les champs de la marchandise.");
      return;
    }
    try {
      const matchedUnit = unitWeights.find((u) => u.symbol_fr === newMerchLocal.unit);
      if (!matchedUnit) {
        alert("Unité non valide.");
        return;
      }
      const goodsData = {
        idOrdCertifOri: certifId,
        goodDescription: newMerchLocal.designation,
        goodReferences: newMerchLocal.boxReference,
        docReferences: newMerchLocal.docReference,
        weight_qty: newMerchLocal.quantity,
        idUnitWeight: matchedUnit.id_unit_weight,
      };
      const response = await addOrUpdateGoods(goodsData);
      const newMerchItem = {
        ...newMerchLocal,
        id_ord_certif_goods: response?.new_ord_certif_goods_id,
      };
      const updatedMerch = [...merchandises, newMerchItem];
      setMerchandises(updatedMerch);
      handleChange?.('merchandises', updatedMerch);

      setShowNewMerchDialog(false);
      setNewMerchLocal({
        designation: '',
        boxReference: '',
        docReference: '',
        quantity: '',
        unit: '',
      });
    } catch (error) {
      console.error('Error adding new merch:', error);
      alert("Erreur lors de l'ajout de la marchandise.");
    }
  };

  // Affichage “table” sur desktop
  const renderMerchDesktop = () => {
    return (
      <Box sx={{ overflowX: 'auto' }}>
        <Box component="table" sx={{ borderCollapse: 'collapse', width: '100%' }}>
          <Box component="thead" sx={{ backgroundColor: '#f9f9f9' }}>
            <Box component="tr">
              <Box component="th" sx={tableCellStyle}>Désignation</Box>
              <Box component="th" sx={tableCellStyle}>Référence / HSCODE</Box>
              <Box component="th" sx={tableCellStyle}>Réf. doc</Box>
              <Box component="th" sx={tableCellStyle}>Quantité</Box>
              <Box component="th" sx={tableCellStyle}>Unité</Box>
              {isModifiable && <Box component="th" sx={tableCellStyle}></Box>}
            </Box>
          </Box>
          <Box component="tbody">
            {merchandises.map((m, idx) => (
              <Box
                component="tr"
                key={idx}
                sx={{ '&:nth-of-type(even)': { backgroundColor: '#f1f1f1' } }}
              >
                <Box component="td" sx={tableCellStyle}>
                  {m.designation || 'Non spécifié'}
                </Box>
                <Box component="td" sx={tableCellStyle}>
                  {m.boxReference || 'Non spécifié'}
                </Box>
                <Box component="td" sx={tableCellStyle}>
                  {m.docReference || 'Non spécifié'}
                </Box>
                <Box component="td" sx={tableCellStyle}>
                  {m.quantity || 'Non spécifié'}
                </Box>
                <Box component="td" sx={tableCellStyle}>
                  {m.unit || 'Non spécifié'}
                </Box>
                {isModifiable && (
                  <Box component="td" sx={tableCellStyle}>
                    <Button
                      variant="text"
                      color="error"
                      onClick={() => handleDeleteMerchandise(idx)}
                    >
                      Supprimer
                    </Button>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    );
  };

  // Affichage “cartes” sur mobile
  const renderMerchMobile = () => {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {merchandises.map((m, idx) => (
          <Box
            key={idx}
            sx={{
              border: '1px solid #ddd',
              borderRadius: 1,
              backgroundColor: '#f9f9f9',
              p: 2
            }}
          >
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Désignation :</strong> {m.designation || 'Non spécifié'}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Référence / HSCODE :</strong> {m.boxReference || 'Non spécifié'}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Doc Justif :</strong> {m.docReference || 'Non spécifié'}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Quantité :</strong> {m.quantity || 'Non spécifié'}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Unité :</strong> {m.unit || 'Non spécifié'}
            </Typography>
            {isModifiable && (
              <Box sx={{ textAlign: 'right' }}>
                <Button
                  variant="text"
                  color="error"
                  startIcon={<FontAwesomeIcon icon={faTimes} />}
                  onClick={() => handleDeleteMerchandise(idx)}
                >
                  Supprimer
                </Button>
              </Box>
            )}
          </Box>
        ))}
      </Box>
    );
  };

  // ------------------------------------------------
  // 4) ORIGINE / DESTINATION
  // ------------------------------------------------
  const handleCountryUpdateSubmit = async () => {
    if (!values.orderId || !values.certifId) return;
    try {
      const payload = {
        p_id_ord_certif_ori: values.certifId,
        p_id_recipient_account: values.selectedRecipientId,
        p_id_country_origin: parseInt(values.goodsOrigin, 10),
        p_id_country_destination: parseInt(values.goodsDestination, 10),
        p_id_country_port_loading: parseInt(values.loadingPort, 10),
        p_id_country_port_discharge: parseInt(values.dischargingPort, 10),
        p_notes: values.remarks || '',
        p_copy_count: values.copies ?? 0,
        p_idlogin_modify: idLogin,
        p_transport_remains: values.transportRemarks || '',
      };
      await updateCertificate(payload);
      alert('Les pays/ports ont été mis à jour.');
    } catch (error) {
      console.error('Error updating countries/ports:', error);
      alert("Erreur lors de la mise à jour des pays/ports.");
    }
  };

  // ------------------------------------------------
  // 5) TRANSPORT
  // ------------------------------------------------
  const handleTransportModeChange = async (mode, checked) => {
    if (!isModifiable) return;
    const newKey = mode.symbol_fr.toLowerCase();
    setTempTransportModes((prev) => ({ ...prev, [newKey]: checked }));

    if (checked) {
      try {
        await setOrdCertifTranspMode({
          id_ord_certif_transp_mode: null,
          id_ord_certif_ori: certifId,
          id_transport_mode: mode.id_transport_mode,
        });
      } catch (error) {
        console.error('Error adding transport mode:', error);
      }
    } else {
      try {
        await removeSingleCertifTranspMode(certifId, mode.id_transport_mode, idLogin);
      } catch (error) {
        console.error('Error removing transport mode:', error);
      }
    }
  };

  const handleTransportModesSave = () => {
    handleChange?.('transportModes', tempTransportModes);
    alert('Modes de transport enregistrés.');
  };

  // only persists the transport remarks
  const handleSaveTransportRemarks = async () => {
    try {
      // fetch the current certificate so we can get its id
      const ordersResp = await getOrdersForCustomer({
        idCustAccountList: customerAccountId,
        idLogin,
      });
      const currentOrder = (ordersResp.data || [])
        .find((o) => Number(o.id_order) === Number(orderId));
      if (!currentOrder) throw new Error('Commande introuvable');

      await updateCertificate({
        p_id_ord_certif_ori: currentOrder.id_ord_certif_ori,
        // leave everything else on the back‑end unchanged:
        p_transport_remains: values.transportRemarks || '',
        p_idlogin_modify: idLogin,
      });

      alert('Remarques de transport enregistrées.');
      // if you need to push the new remark back up into parent form state:
      handleChange?.('transportRemarks', values.transportRemarks);
    } catch (err) {
      console.error('Erreur en sauvegardant les remarques de transport:', err);
      alert('Impossible d’enregistrer les remarques de transport.');
    }
  };

  // ------------------------------------------------
  // 6) COPIES / REMARQUES
  // ------------------------------------------------
  const SaveCopies = async () => {
    try {
      // 1) retrieve the current certificate to get its id
      const ordersResp = await getOrdersForCustomer({
        idCustAccountList: customerAccountId,
        idLogin,
      });
      const currentOrder = (ordersResp.data || [])
        .find(o => Number(o.id_order) === Number(orderId));
      if (!currentOrder) throw new Error('Commande introuvable');
  
      // 2) send only the new copy count
      await updateCertificate({
        p_id_ord_certif_ori: currentOrder.id_ord_certif_ori,
        p_copy_count: copies,
        p_idlogin_modify: idLogin,
      });
  
      alert('Nombre de copies certifiées mis à jour.');
      setIsEditingCopies(false);
      handleChange?.('copies', copies);
    } catch (err) {
      console.error('Erreur en sauvegardant les copies certifiées :', err);
      alert('Impossible d’enregistrer le nombre de copies.');
    }
  };
  
// inside Step5:
const handleSaveGeneralRemarks = async () => {
  try {
    // fetch current certificate to get its id
    const ordersResp = await getOrdersForCustomer({
      idCustAccountList: customerAccountId,
      idLogin,
    });
    const currentOrder = (ordersResp.data || [])
      .find(o => Number(o.id_order) === Number(orderId));
    if (!currentOrder) throw new Error('Commande introuvable');

    await updateCertificate({
      p_id_ord_certif_ori: currentOrder.id_ord_certif_ori,
      p_notes: remarks || '',
      p_idlogin_modify: idLogin,
    });

    alert('Remarques générales enregistrées.');
    handleChange?.('remarks', remarks);
    setIsEditingRemarks(false);
  } catch (err) {
    console.error('Erreur en sauvegardant remarques générales:', err);
    alert('Impossible d’enregistrer les remarques générales.');
  }
};

  // ------------------------------------------------
  // 7) DOCUMENTS
  // ------------------------------------------------
  const handleFileClick = (doc) => {
    if (!doc.file_guid) return;
    const fileUrl = `${import.meta.env.VITE_API_URL}/files/commandes/${new Date().getFullYear()}/${doc.file_guid}`;
    window.open(fileUrl, '_blank');
  };

  const handleDeleteDocument = async (docId) => {
    try {
      await delOrderFiles(docId);
      const files = await getOrderFilesInfo({
        p_id_order_list: orderId,
        p_isactive: true,
        p_id_custaccount: customerAccountId,
      });
      setDocumentsInfo(files);
      alert('Document supprimé avec succès.');
    } catch (error) {
      console.error('Error deleting document:', error);
      alert("Erreur lors de la suppression du document.");
    }
  };

  const handleSaveNewDocument = async () => {
    if (!newDocumentData.file || !newDocumentData.selectedFileType) {
      alert('Veuillez sélectionner un fichier ET un type de document.');
      return;
    }
    try {
      const orderFileData = {
        uploadType: 'commandes',
        p_id_order: orderId,
        p_idfiles_repo_typeof: newDocumentData.selectedFileType,
        p_file_origin_name: newDocumentData.file.name,
        p_typeof_order: 1,
        p_idlogin_insert: idLogin,
        file: newDocumentData.file,
      };
      await setOrderFiles(orderFileData);

      const files = await getOrderFilesInfo({
        p_id_order_list: orderId,
        p_isactive: true,
        p_id_custaccount: customerAccountId,
      });
      setDocumentsInfo(files);

      alert('Document uploadé avec succès.');
      setShowNewDocumentDialog(false);
      setNewDocumentData({ file: null, selectedFileType: '' });
    } catch (error) {
      console.error('Error uploading document:', error);
      alert("Erreur lors de l'upload du document.");
    }
  };

  // Affichage “table” (desktop) pour docs
  const renderDocsDesktop = () => {
    return (
      <Box sx={{ overflowX: 'auto' }}>
        <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
          <Box component="thead" sx={{ backgroundColor: '#f9f9f9' }}>
            <Box component="tr">
              <Box component="th" sx={tableCellStyle}>Type</Box>
              <Box component="th" sx={tableCellStyle}>Fichier</Box>
              {isModifiable && <Box component="th" sx={tableCellStyle}></Box>}
            </Box>
          </Box>
          <Box component="tbody">
            {documentsInfo.map((doc, i) => (
              <Box
                component="tr"
                key={i}
                sx={{ '&:nth-of-type(even)': { backgroundColor: '#f1f1f1' } }}
              >
                <Box component="td" sx={tableCellStyle}>
                  {doc.txt_description_fr}
                </Box>
                <Box component="td" sx={tableCellStyle}>
                  {doc.file_guid ? (
                    <Typography
                      sx={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
                      onClick={() => handleFileClick(doc)}
                    >
                      {doc.file_origin_name || 'Voir le fichier'}
                    </Typography>
                  ) : (
                    'Aucun fichier'
                  )}
                </Box>
                {isModifiable && (
                  <Box component="td" sx={tableCellStyle}>
                    <Button variant="text" color="error" onClick={() => handleDeleteDocument(doc.id_order_files)}>
                      Supprimer
                    </Button>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    );
  };

  // Affichage “cartes” (mobile) pour docs
  const renderDocsMobile = () => {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {documentsInfo.map((doc, i) => (
          <Box
            key={i}
            sx={{
              border: '1px solid #ddd',
              borderRadius: 1,
              backgroundColor: '#f9f9f9',
              p: 2
            }}
          >
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Type :</strong> {doc.txt_description_fr}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Fichier :</strong>{' '}
              {doc.file_guid ? (
                <Box
                  component="span"
                  sx={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
                  onClick={() => handleFileClick(doc)}
                >
                  {doc.file_origin_name || 'Voir le fichier'}
                </Box>
              ) : (
                'Aucun fichier'
              )}
            </Typography>
            {isModifiable && (
              <Box sx={{ textAlign: 'right' }}>
                <Button
                  variant="text"
                  color="error"
                  startIcon={<FontAwesomeIcon icon={faTimes} />}
                  onClick={() => handleDeleteDocument(doc.id_order_files)}
                >
                  Supprimer
                </Button>
              </Box>
            )}
          </Box>
        ))}
      </Box>
    );
  };

  // ------------------------------------------------
  // 8) SOUMETTRE LA COMMANDE
  // ------------------------------------------------
  const handleSubmitOrder = async () => {
    if (!values.orderId || !idLogin) return;


    if (!documentsInfo || documentsInfo.length === 0) {
      setSubmitError('Au moins un document doit être uploadé.');
      return;
    }

    try {
      await submitOrder(values.orderId, idLogin);
      alert('Commande soumise avec succès.');
      handleSubmit?.();
    } catch (error) {
      console.error('Error submitting order:', error);
      alert("Erreur lors de la soumission de la commande.");
    }
  };

  // ------------------------------------------------
  // RENDU PRINCIPAL
  // ------------------------------------------------
  return (
    <Box
      sx={{
        maxWidth: '1200px',
        mx: 'auto',
        p: { xs: 0, sm: 2, md: 3 },
      }}
    >
      <Typography variant="h5" sx={{ textAlign: 'center', fontWeight: 'bold', mb: 2 }}>
        Récapitulatif
      </Typography>

      {/* (1) DEMANDEUR / EXPEDITEUR */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#C39408', mb: 2 }}>
            1/7 Demandeur / Expéditeur
          </Typography>

          {/* Société */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography sx={{ width: 180, fontWeight: 600 }}>Société :</Typography>
            <Box
              sx={{
                flex: 1,
                backgroundColor: '#e0e0e0',
                p: 1,
                borderRadius: 1,
                cursor: isModal ? 'pointer' : 'default',
              }}
              onClick={
                isModal
                  ? () => openSecondModal?.({
                    name: companyName,
                    address: '123 Rue Principale, Ville, Pays',
                    address2: 'Suite 456',
                    contact: 'M. Vladimir Outof\nManager',
                    activity: 'Construction',
                    statut: 'Actif',
                  })
                  : undefined
              }
            >
              {companyName || 'Société non renseignée'}
            </Box>
          </Box>

          {/* Libellé commande */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography sx={{ width: 180, fontWeight: 600 }}>Libellé :</Typography>
            <Box sx={{ flex: 1 }}>
              {isEditingLabel ? (
                <Box>
                  <TextField
                    fullWidth
                    size="small"
                    value={orderLabel}
                    onChange={(e) => setOrderLabel(e.target.value)}
                  />
                  <Box sx={{ textAlign: 'right', mt: 1 }}>
                    <Button variant="contained" color="success" onClick={saveOrderLabel}>
                      Enregistrer
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#e0e0e0',
                    p: 1,
                    borderRadius: 1,
                  }}
                >
                  <Typography sx={{ flex: 1 }}>
                    {orderLabel || 'Aucun libellé spécifié'}
                  </Typography>
                  {isModifiable && (
                    <IconButton size="small" onClick={() => setIsEditingLabel(true)}>
                      <FontAwesomeIcon icon={faPencilAlt} style={{ color: '#DCAF26' }} />
                    </IconButton>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* (2) DESTINATAIRE */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#C39408', mb: 2 }}>
            2/7 Destinataire
          </Typography>

          <FormControl sx={{ minWidth: 220, mb: 1 }} size="small">
            <InputLabel>Destinataire</InputLabel>
            <Select
              label="Destinataire"
              value={selectedRecipientId}
              onChange={isModifiable ? handleRecipientChange : undefined}
              disabled={!isModifiable}
            >
              <MenuItem value="">-- Sélectionnez --</MenuItem>
              {localRecipients.map((r) => (
                <MenuItem key={r.id_recipient_account} value={String(r.id_recipient_account)}>
                  {r.recipient_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {isModifiable && (
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Button variant="outlined" onClick={handleRecipientSubmit}>
                Enregistrer
              </Button>
              <Button variant="contained" onClick={() => setShowNewRecipientDialog(true)}>
                + Nouveau
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* (3) MARCHANDISES */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#C39408', mb: 2 }}>
            3/7 Description de la marchandise
          </Typography>
          {merchandises.length === 0 && (
            <Typography>Aucune marchandise ajoutée.</Typography>
          )}
          {merchandises.length > 0 && (
            isSmallScreen ? renderMerchMobile() : renderMerchDesktop()
          )}
          {isModifiable && (
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => setShowNewMerchDialog(true)}
            >
              + Ajouter une marchandise
            </Button>
          )}
        </CardContent>
      </Card>

      {/* (4) ORIGINE & DESTINATION */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#C39408', mb: 2 }}>
            4/7 Origine et Destination
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel>Pays d'origine</InputLabel>
              <Select
                label="Pays d'origine"
                value={values.goodsOrigin || ''}
                onChange={
                  isModifiable
                    ? (e) => handleChange?.('goodsOrigin', e.target.value)
                    : undefined
                }
                disabled={!isModifiable}
              >
                <MenuItem value="">-- Sélectionnez --</MenuItem>
                {countries.map((c) => (
                  <MenuItem key={c.id_country} value={String(c.id_country)}>
                    {c.symbol_fr}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel>Pays de destination</InputLabel>
              <Select
                label="Pays de destination"
                value={values.goodsDestination || ''}
                onChange={
                  isModifiable
                    ? (e) => handleChange?.('goodsDestination', e.target.value)
                    : undefined
                }
                disabled={!isModifiable}
              >
                <MenuItem value="">-- Sélectionnez --</MenuItem>
                {countries.map((c) => (
                  <MenuItem key={c.id_country} value={String(c.id_country)}>
                    {c.symbol_fr}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* (5) TRANSPORT */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#C39408', mb: 2 }}>
            5/7 Transport
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel>Port de chargement</InputLabel>
              <Select
                label="Port de chargement"
                value={values.loadingPort || ''}
                onChange={
                  isModifiable
                    ? (e) => handleChange?.('loadingPort', e.target.value)
                    : undefined
                }
                disabled={!isModifiable}
              >
                <MenuItem value="">-- Sélectionnez --</MenuItem>
                {countries.map((c) => (
                  <MenuItem key={c.id_country} value={String(c.id_country)}>
                    {c.symbol_fr}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel>Port de déchargement</InputLabel>
              <Select
                label="Port de déchargement"
                value={values.dischargingPort || ''}
                onChange={
                  isModifiable
                    ? (e) => handleChange?.('dischargingPort', e.target.value)
                    : undefined
                }
                disabled={!isModifiable}
              >
                <MenuItem value="">-- Sélectionnez --</MenuItem>
                {countries.map((c) => (
                  <MenuItem key={c.id_country} value={String(c.id_country)}>
                    {c.symbol_fr}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {isModifiable && (
              <Box>
                <Button variant="outlined" onClick={handleCountryUpdateSubmit}>
                  Enregistrer pays/ports
                </Button>
              </Box>
            )}
          </Box>

          <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
            Modes de transport
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            {transpModeList && transpModeList.length > 0 ? (
              transpModeList.map((mode) => {
                const key = mode.symbol_fr.toLowerCase();
                return (
                  <FormControlLabel
                    key={mode.id_transport_mode}
                    label={mode.symbol_fr}
                    control={
                      <Checkbox
                        checked={!!tempTransportModes[key]}
                        onChange={(e) => handleTransportModeChange(mode, e.target.checked)}
                        disabled={!isModifiable}
                      />
                    }
                  />
                );
              })
            ) : (
              <Typography>Aucun mode de transport disponible.</Typography>
            )}
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Remarques sur le transport
            </Typography>
            <TextField
              multiline
              minRows={3}
              fullWidth
              value={values.transportRemarks || ''}
              onChange={
                isModifiable
                  ? (e) => handleChange?.('transportRemarks', e.target.value)
                  : undefined
              }
              disabled={!isModifiable}
            />
          </Box>

          {isModifiable && (
            <Button variant="contained" color="success" onClick={handleSaveTransportRemarks}>
              Enregistrer modes de transport
            </Button>
          )}
        </CardContent>
      </Card>

      {/* (6) AUTRES */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#C39408', mb: 2 }}>
            6/7 Autres
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography sx={{ width: 180, fontWeight: 600 }}>Copies certifiées :</Typography>
            <Box sx={{ flex: 1 }}>
              {isModifiable ? (
                isEditingCopies ? (
                  <Box>
                    <TextField
                      type="number"
                      size="small"
                      fullWidth
                      value={copies}
                      onChange={(e) => setCopies(e.target.value)}
                    />
                    <Box sx={{ textAlign: 'right', mt: 1 }}>
                      <Button variant="contained" color="success" onClick={SaveCopies}>
                        Enregistrer
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: '#e0e0e0',
                      p: 1,
                      borderRadius: 1,
                    }}
                  >
                    <Typography sx={{ flex: 1 }}>
                      {copies || 'Non spécifié'}
                    </Typography>
                    <IconButton size="small" onClick={() => setIsEditingCopies(true)}>
                      <FontAwesomeIcon icon={faPencilAlt} style={{ color: '#DCAF26' }} />
                    </IconButton>
                  </Box>
                )
              ) : (
                <TextField
                  type="number"
                  size="small"
                  fullWidth
                  value={copies}
                  disabled
                />
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <Typography sx={{ width: 180, fontWeight: 600, mt: 1 }}>Remarques générales :</Typography>
            <Box sx={{ flex: 1 }}>
              {isModifiable ? (
                isEditingRemarks ? (
                  <Box>
                    <TextField
                      multiline
                      minRows={3}
                      fullWidth
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                    />
                    <Box sx={{ textAlign: 'right', mt: 1 }}>
                      <Button variant="contained" color="success" onClick={handleSaveGeneralRemarks}>
                        Enregistrer
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: '#e0e0e0',
                      p: 1,
                      borderRadius: 1,
                    }}
                  >
                    <Typography sx={{ flex: 1 }}>
                      {remarks || 'Aucune remarque'}
                    </Typography>
                    <IconButton size="small" onClick={() => setIsEditingRemarks(true)}>
                      <FontAwesomeIcon icon={faPencilAlt} style={{ color: '#DCAF26' }} />
                    </IconButton>
                  </Box>
                )
              ) : (
                <TextField
                  multiline
                  minRows={3}
                  fullWidth
                  value={remarks}
                  disabled
                />
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* (7) PIÈCES JUSTIFICATIVES */}
      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#DCAF26', mb: 2 }}>
        Pièces Justificatives (7/7)
      </Typography>
      <Card>
        <CardContent>
          {documentsInfo.length === 0 && (
            <Typography>Aucune pièce justificative ajoutée.</Typography>
          )}
          {documentsInfo.length > 0 && (
            isSmallScreen ? renderDocsMobile() : renderDocsDesktop()
          )}
          {isModifiable && (
            <Button variant="contained" sx={{ mt: 2 }} onClick={() => setShowNewDocumentDialog(true)}>
              Upload
            </Button>
          )}
        </CardContent>
      </Card>

      {/* BOUTON FINAL "SOUMETTRE" */}


      {!isModal && isModifiable && (
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button
            variant="contained"
            color="success"
            onClick={handleSubmitOrder}
            disabled={!isModifiable}
          >
            Soumettre la commande
          </Button>
          {submitError && (
            <Typography color="error" sx={{ mt: 1 }}>
              {submitError}
            </Typography>
          )}
        </Box>



      )}


      {/* ---------- DIALOGS ---------- */}

      {/* Dialog : Nouveau destinataire */}
      <Dialog open={showNewRecipientDialog} onClose={() => setShowNewRecipientDialog(false)}>
        <DialogTitle>Créer un nouveau destinataire</DialogTitle>
        <DialogContent dividers>
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <TextField
      label="Nom de l'entreprise *"
      value={newRecipientLocal.receiverName}
      onChange={e => handleNewRecipientChange('receiverName', e.target.value)}
      fullWidth
    />

    <TextField
      label="Adresse *"
      value={newRecipientLocal.receiverAddress}
      onChange={e => handleNewRecipientChange('receiverAddress', e.target.value)}
      fullWidth
    />

    <TextField
      label="Complément d'adresse"
      value={newRecipientLocal.receiverAddress2}
      onChange={e => handleNewRecipientChange('receiverAddress2', e.target.value)}
      fullWidth
    />

    {/* Fusion code postal + ville */}
    <TextField
      label="Code postal - Ville *"
      value={newRecipientLocal.receiverPostalCity}
      onChange={e => handleNewRecipientChange('receiverPostalCity', e.target.value)}
      placeholder="75001 Paris"
      fullWidth
    />

    <FormControl fullWidth>
      <InputLabel>Pays *</InputLabel>
      <Select
        label="Pays *"
        value={newRecipientLocal.receiverCountry}
        onChange={e => handleNewRecipientChange('receiverCountry', e.target.value)}
      >
        <MenuItem value="">-- Sélectionnez un pays --</MenuItem>
        {countries.map(c => (
          <MenuItem key={c.id_country} value={c.id_country}>
            {c.symbol_fr}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </Box>
</DialogContent>

        <DialogActions>
          <Button onClick={() => setShowNewRecipientDialog(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleSaveNewRecipient}>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog : Nouvelle marchandise */}
      <Dialog open={showNewMerchDialog} onClose={() => setShowNewMerchDialog(false)}>
        <DialogTitle>Ajouter une nouvelle marchandise</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Désignation"
              value={newMerchLocal.designation}
              onChange={(e) => handleNewMerchChange('designation', e.target.value)}
              fullWidth
            />
            <TextField
              label="Référence / HSCODE"
              value={newMerchLocal.boxReference}
              onChange={(e) => handleNewMerchChange('boxReference', e.target.value)}
              fullWidth
            />
            <TextField
              label="Référence doc justificatif"
              value={newMerchLocal.docReference}
              onChange={(e) => handleNewMerchChange('docReference', e.target.value)}
              fullWidth
            />
            <TextField
              label="Quantité"
              type="number"
              value={newMerchLocal.quantity}
              onChange={(e) => handleNewMerchChange('quantity', e.target.value)}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Unité</InputLabel>
              <Select
                label="Unité"
                value={newMerchLocal.unit || ''}
                onChange={(e) => handleNewMerchChange('unit', e.target.value)}
              >
                <MenuItem value="">-- Sélectionnez l'unité --</MenuItem>
                {unitWeights
                  .filter((u) => u.id_unit_weight >= 1)
                  .map((u) => (
                    <MenuItem key={u.id_unit_weight} value={u.symbol_fr}>
                      {u.symbol_fr}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewMerchDialog(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleSaveNewMerch}>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog : Nouveau document */}
      <Dialog open={showNewDocumentDialog} onClose={() => setShowNewDocumentDialog(false)}>
        <DialogTitle>Ajouter une nouvelle pièce justificative</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button variant="outlined" component="label">
              Choisir un fichier
              <input
                type="file"
                hidden
                onChange={(e) =>
                  setNewDocumentData((prev) => ({
                    ...prev,
                    file: e.target.files ? e.target.files[0] : null
                  }))
                }
              />
            </Button>
            {newDocumentData.file && (
              <Typography variant="body2">{newDocumentData.file.name}</Typography>
            )}
            <FormControl fullWidth>
              <InputLabel>Type de document (obligatoire)</InputLabel>
              <Select
                label="Type de document (obligatoire)"
                value={newDocumentData.selectedFileType || ''}
                onChange={(e) =>
                  setNewDocumentData((prev) => ({ ...prev, selectedFileType: e.target.value }))
                }
              >
                <MenuItem value="">-- Sélectionnez --</MenuItem>
                {mandatoryFileTypes.map((type) => (
                  <MenuItem key={type.id_files_repo_typeof} value={type.id_files_repo_typeof}>
                    {type.txt_description_fr} - {type.txt_description_eng}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewDocumentDialog(false)}>Annuler</Button>
          {isModifiable && (
            <Button variant="contained" onClick={handleSaveNewDocument}>
              Enregistrer
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Style minimaliste pour chaque cellule <td> en mode "desktop table"
const tableCellStyle = {
  border: '1px solid #ddd',
  p: 1,
  textAlign: 'left',
  fontSize: '14px',
  wordWrap: 'break-word',
};

export default Step5;
