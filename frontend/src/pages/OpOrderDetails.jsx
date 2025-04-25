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
  const location  = useLocation();
  const navigate  = useNavigate();
  const params    = new URLSearchParams(location.search);
  const orderId   = params.get('orderId');
  const certifId  = params.get('certifId');

  const user     = useSelector(s => s.auth.user);
  const idLogin  = user?.id_login_user;
  const isOpUser = user?.isopuser;

  const [loading, setLoading]           = useState(true);
  const [documentsInfo, setDocumentsInfo] = useState([]);
  const [formData, setFormData]         = useState({
    exporterName:     '',
    orderLabel:       '',
    merchandises:     [],
    goodsOrigin:      '',
    goodsDestination: '',
    loadingPort:      '',
    dischargingPort:  '',
    transportModes:   {},
    transportRemarks: '',
    recipients:       [],
    selectedRecipientId: '',
    receiverName:     '',
    receiverAddress:  '',
    receiverAddress2: '',
    receiverPostalCode: '',
    receiverCity:     '',
    receiverCountry:  '',
    receiverPhone:    '',
    copies:           1,
    remarks:          '',
    orderStatus:      null,
    custAccountId:    null,
    title:            '',
    date_last_submission: null,
    copy_count_ori:   1,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // --- 1) Pays ---
        const ctrs = await fetchCountries();

        // --- 2) Modes transport ---
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

        // --- 3) Commande ---
        let ordResp;
        if (isOpUser) {
          ordResp = await getOrderOpInfo({ p_id_order_list: orderId, p_idlogin: idLogin });
        } else {
          ordResp = await getOrdersForCustomer({ idLogin });
        }
        const orders = ordResp.data || ordResp;
        const order  = orders.find(o => String(o.id_order) === String(orderId));

        // --- 4) Destinataire unique ---
        let recList = [];
        if (order?.id_recipient_account) {
          const recResp = await fetchRecipients({ idListR: order.id_recipient_account });
          recList = recResp.data || [];
        }
        const recipient = recList[0] || {};

        // --- 5) Marchandises ---
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

        // --- 6) Pièces jointes ---
        const files = await getOrderFilesInfo({
          p_id_order_list: orderId,
          p_isactive: true,
        });
        setDocumentsInfo(files);

        // --- 7) Remplissage du state ---
        setFormData({
          exporterName:     order?.cust_name || order?.exporter_company || 'Non spécifié',
          orderLabel:       order?.order_title || '',
          merchandises:     goods,
          goodsOrigin:      order?.id_country_origin || 'Non spécifié',
          goodsDestination: order?.id_country_destination || 'Non spécifié',
          loadingPort:      order?.id_country_port_loading || 'Non spécifié',
          dischargingPort:  order?.id_country_port_discharge || 'Non spécifié',
          transportModes:   transportModesObj,
          transportRemarks: order?.transport_remarks || '',
          recipients:       recList,
          selectedRecipientId: order?.id_recipient_account || '',
          receiverName:     recipient.recipient_name || 'N/A',
          receiverAddress:  recipient.address_1 || 'N/A',
          receiverAddress2: recipient.address_2 || '',
          receiverPostalCode: recipient.address_3 || 'N/A',
          receiverCity:     recipient.city_symbol_fr_recipient || 'N/A',
          receiverCountry:  recipient.country_symbol_fr_recipient || 'N/A',
          receiverPhone:    order?.receiver_phone || 'N/A',
          copies:           order?.copy_count_ori || 1,
          remarks:          order?.notes_ori || 'Aucune remarque',
          orderStatus:      order?.id_order_status || null,
          custAccountId:    order?.id_cust_account || null,
          title:            order?.order_title || '',
          date_last_submission: order?.date_last_submission || null,
          copy_count_ori:   order?.copy_count_ori || 1,
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

  const performAction = async (apiFn) => {
    const cu = await getCustUsersByAccount(
      formData.selectedRecipientId, null, 'true', 'true', true
    );
    const customerEmail = cu.data[0].email;

    // pour validate, on calcule le total ; sinon ignore
    const args = [
      orderId,
      formData.selectedRecipientId,
      idLogin,
      customerEmail,
      formData.title,
      formData.date_last_submission
    ];
    if (apiFn === approveOrder) {
      const totalPrice = 8500 + 2500 * formData.copy_count_ori;
      args.push(totalPrice);
    }

    await apiFn(...args);
    navigate('/operator-dashboard');
  };

  const handleFileClick = (file) => {
    const url = `${import.meta.env.VITE_API_URL}/files/commandes/${new Date().getFullYear()}/${file.file_guid}`;
    window.open(url, '_blank');
  };

  return (
    <div className="op-container">
      {/* résumé principal */}
      <Step5
        prevStep={() => navigate(-1)}
        values={formData}
        handleChange={handleChange}
        handleSubmit={() => {}}
        isModal={false}
      />

      {/* piéces justificatives & annexes (7/7) */}
      <div className="step5-section">
        <h4 className="step5-main-title">7/7 Pièces justificatives & annexes</h4>
        {documentsInfo.length > 0 ? (
          <div className="step5-table-responsive">
            <table className="step5-document-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Fichier</th>
                </tr>
              </thead>
              <tbody>
                {documentsInfo.map((doc, idx) => (
                  <tr key={idx}>
                    <td>{doc.txt_description_fr}</td>
                    <td>
                      {doc.file_guid ? (
                        <span
                          onClick={() => handleFileClick(doc)}
                          style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
                        >
                          {doc.file_origin_name || 'Télécharger'}
                        </span>
                      ) : (
                        'Aucun fichier'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Aucune pièce justificative ajoutée.</p>
        )}
      </div>

      {isOpUser && (
        <div className="step5-submit-section">
          <button
            type="button"
            className="step5-next-button"
            onClick={() => performAction(approveOrder)}
          >
            Valider
          </button>
          <button
            type="button"
            className="step5-reject-button"
            onClick={() => performAction(rejectOrder)}
          >
            Rejeter
          </button>
          <button
            type="button"
            className="step5-return-button"
            onClick={() => performAction(sendbackOrder)}
          >
            Retourner
          </button>
        </div>
      )}
    </div>
  );
};

export default OpOrderDetails;