// OpOrderDetails.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  fetchCountries,
  getOrdersForCustomer,
  getCertifGoodsInfo,
  getCertifTranspMode,
  getOrderOpInfo,
  getOrderFilesInfo,
  approveOrder,
  sendbackOrder,
  rejectOrder,
  getCustUsersByAccount,
  fetchRecipients
} from '../services/apiServices';
import './OpOrderDetails.css';
import Step5 from '../components/orders/Create/steps/Step5';

const OpOrderDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const orderId = params.get('orderId');
  const certifId = params.get('certifId');

  const user = useSelector(s => s.auth.user);
  const idLogin = user?.id_login_user;
  const isOpUser = user?.isopuser;

  const [loading, setLoading] = useState(true);
  const [documentsInfo, setDocumentsInfo] = useState([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [formData, setFormData] = useState({
    exporterName: '',
    orderLabel: '',
    merchandises: [],
    goodsOrigin: '',
    goodsDestination: '',
    loadingPort: '',
    dischargingPort: '',
    transportModes: {},
    transportRemarks: '',
    recipients: [],
    selectedRecipientId: '',
    receiverName: '',
    receiverAddress: '',
    receiverAddress2: '',
    receiverPostalCode: '',
    receiverCity: '',
    receiverCountry: '',
    receiverPhone: '',
    copies: 1,
    remarks: '',
    orderStatus: null,
    custAccountId: null,
    title: '',
    date_last_submission: null,
    copy_count_ori: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const ctrs = await fetchCountries();
        const transp = await getCertifTranspMode({
          idListCT: null,
          idListCO: certifId?.toString(),
          isActiveOT: 'true',
          isActiveTM: 'true',
          idListOrder: null,
          idListOrderStatus: null,
        });
        const transportModesObj = {};
        (transp.data || []).forEach(m => {
          transportModesObj[m.symbol_fr.toLowerCase()] = true;
        });

        let ordResp = isOpUser
          ? await getOrderOpInfo({ p_id_order_list: orderId, p_idlogin: idLogin })
          : await getOrdersForCustomer({ idLogin });
        const orders = ordResp.data || ordResp;
        const order = orders.find(o => String(o.id_order) === String(orderId));

        let recList = [];
        if (order?.id_recipient_account) {
          const recResp = await fetchRecipients({ idListR: order.id_recipient_account });
          recList = recResp.data || [];
        }
        const recipient = recList[0] || {};

        let goods = [];
        if (certifId) {
          const g = await getCertifGoodsInfo(certifId);
          goods = (g.data || []).map(item => ({
            designation: item.good_description,
            boxReference: item.good_references,
            docReference: item.doc_references,
            quantity: item.weight_qty,
            unit: item.symbol_fr || 'N/A',
          }));
        }

        const files = await getOrderFilesInfo({
          p_id_order_list: orderId,
          p_isactive: true,
        });
        setDocumentsInfo(files);

        setFormData({
          exporterName: order?.cust_name || order?.exporter_company || 'Non spécifié',
          orderLabel: order?.order_title || '',
          merchandises: goods,
          goodsOrigin: order?.id_country_origin || 'Non spécifié',
          goodsDestination: order?.id_country_destination || 'Non spécifié',
          loadingPort: order?.id_country_port_loading || 'Non spécifié',
          dischargingPort: order?.id_country_port_discharge || 'Non spécifié',
          transportModes: transportModesObj,
          transportRemarks: order?.transport_remarks || '',
          recipients: recList,
          selectedRecipientId: order?.id_recipient_account || '',
          receiverName: recipient.recipient_name || 'N/A',
          receiverAddress: recipient.address_1 || 'N/A',
          receiverAddress2: recipient.address_2 || '',
          receiverPostalCode: recipient.address_3 || 'N/A',
          receiverCity: recipient.city_symbol_fr_recipient || 'N/A',
          receiverCountry: recipient.country_symbol_fr_recipient || 'N/A',
          receiverPhone: order?.receiver_phone || 'N/A',
          copies: order?.copy_count_ori || 1,
          remarks: order?.notes_ori || 'Aucune remarque',
          orderStatus: order?.id_order_status || null,
          custAccountId: order?.id_cust_account || null,
          title: order?.order_title || '',
          date_last_submission: order?.date_last_submission || null,
          copy_count_ori: order?.copy_count_ori || 1,
        });
      } catch (err) {
        console.error('Erreur chargement OpOrderDetails:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [orderId, certifId, idLogin, isOpUser]);

  if (loading) {
    return <div className="op-form">Chargement…</div>;
  }

  const handleChange = (field, value) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const performAction = async (apiFn, reason) => {
    const cu = await getCustUsersByAccount(
      formData.selectedRecipientId,
      null, 'true', 'true', true
    );
    const customerEmail = cu.data[0].email;
    const args = [
      orderId,
      formData.selectedRecipientId,
      idLogin,
      reason,
      customerEmail,
      formData.title,
    ];
    if (apiFn === approveOrder) {
      const totalPrice = 8500 + 2500 * formData.copy_count_ori;
      args.splice(3, 1, customerEmail); // shift reason out
      args.push(totalPrice);
    }
    await apiFn(...args);
    navigate('/operator-dashboard');
  };

  const handleRejectClick = () => setShowRejectModal(true);
  const handleReturnClick = () => setShowReturnModal(true);
  const handleRejectCancel = () => setShowRejectModal(false);
  const handleReturnCancel = () => setShowReturnModal(false);

  const handleRejectConfirm = () => {
    performAction(rejectOrder, rejectReason);
    setShowRejectModal(false);
  };
  const handleReturnConfirm = () => {
    performAction(sendbackOrder, returnReason);
    setShowReturnModal(false);
  };

  const handleFileClick = (file) => {
    const url = `${import.meta.env.VITE_API_URL}/files/commandes/${new Date().getFullYear()}/${file.file_guid}`;
    window.open(url, '_blank');
  };

  return (
    <div className="op-container">
      <Step5
        prevStep={() => navigate(-1)}
        values={formData}
        handleChange={handleChange}
        handleSubmit={() => { }}
        isModal={false}
      />

      {isOpUser && ![3, 4, 5, 8, 9].includes(formData.orderStatus) && (
        <div className="step5-submit-section">
          <button
            type="button"
            className="step5-next-button"
            onClick={() => performAction(approveOrder, '')}
          >
            Valider
          </button>
          <button
            type="button"
            className="step5-reject-button"
            onClick={handleRejectClick}
          >
            Rejeter
          </button>
          <button
            type="button"
            className="step5-return-button"
            onClick={handleReturnClick}
          >
            Retourner
          </button>
        </div>
      )}

      {showRejectModal && (
        <div className="modal-overlay" onClick={handleRejectCancel}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Rejeter la commande</h3>
            <textarea
              placeholder="Raison du rejet..."
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={4}
              style={{ width: '100%' }}
            />
            <div className="modal-actions">
              <button onClick={handleRejectCancel}>Annuler</button>
              <button onClick={handleRejectConfirm}>Confirmer</button>
            </div>
          </div>
        </div>
      )}

      {showReturnModal && (
        <div className="modal-overlay" onClick={handleReturnCancel}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Retourner la commande</h3>
            <textarea
              placeholder="Raison du retour..."
              value={returnReason}
              onChange={e => setReturnReason(e.target.value)}
              rows={4}
              style={{ width: '100%' }}
            />
            <div className="modal-actions">
              <button onClick={handleReturnCancel}>Annuler</button>
              <button onClick={handleReturnConfirm}>Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpOrderDetails;