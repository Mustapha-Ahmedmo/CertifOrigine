// OpOrderDetails.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Pour React Router v6
import { useSelector } from 'react-redux';
import {
  fetchCountries,
  getOrdersForCustomer,
  getCertifGoodsInfo,
  getCertifTranspMode,
  getOrderOpInfo,
  getOrderFilesInfo
} from '../services/apiServices';
import './OpOrderDetails.css';

const OpOrderDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

const API_URL = import.meta.env.VITE_API_URL;
  const params = new URLSearchParams(location.search);
  const orderId = params.get('orderId');
  const certifId = params.get('certifId');

  // L'utilisateur connecté ici est l'opérateur, mais nous souhaitons afficher
  // les informations du customer (exportateur) qui a passé la commande.
  const user = useSelector((state) => state.auth.user);
  const idLogin = user?.id_login_user;
  const isOpUser = user?.isopuser;
  // Pour l'opérateur, on ne se base pas sur son idCustAccount pour récupérer la commande.
  // Nous utiliserons uniquement orderId (via idOrderList) pour filtrer la commande.



  const [documentsInfo, setDocumentsInfo] = useState([]);

  // État local pour stocker les données de la commande
  const [formData, setFormData] = useState({
    exporterName: '', // Information du customer (exportateur)
    orderLabel: '',
    merchandises: [],
    goodsOrigin: '',
    goodsDestination: '',
    loadingPort: '',
    dischargingPort: '',
    transportModes: {},
    transportRemarks: '',
    receiverName: '',
    receiverAddress: '',
    receiverAddress2: '',
    receiverPostalCode: '',
    receiverCity: '',
    receiverCountry: '',
    receiverPhone: '',
    copies: 1,
    remarks: '',
    documents: [],
  });
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Récupérer la liste des pays et construire une map (id -> symbole)
        const countriesResponse = await fetchCountries();
        setCountries(countriesResponse);
        const countryMap = {};
        countriesResponse.forEach((country) => {
          countryMap[country.id_country] = country.symbol_fr;
        });

        // 2. Récupérer les modes de transport (optionnel)
        const transpResponse = await getCertifTranspMode({
          idListCT: null,
          idListCO: certifId ? certifId.toString() : null,
          isActiveOT: 'true',
          isActiveTM: 'true',
          idListOrder: null,
          idListOrderStatus: null,
        });
        let transportModesObj = {};
        if (transpResponse && transpResponse.data) {
          transpResponse.data.forEach((mode) => {
            transportModesObj[mode.symbol_eng.toLowerCase()] = true;
          });
        }

        // 3. Récupérer les détails de la commande
        if (orderId) {
          let ordersResponse;

          if (isOpUser) {
            // For operator users, force lookup using orderId
            ordersResponse = await getOrderOpInfo({
              p_id_order_list: orderId,  // Force the search by orderId
              p_idlogin: idLogin,
            });
          } else {
            // For non-operator users, use a default lookup (or other filters)
            ordersResponse = await getOrdersForCustomer({
              idLogin: idLogin,
            });
          }
          const orders = ordersResponse.data || ordersResponse;
          // Forcer la comparaison en chaîne de caractères
          const order = orders.find(o => String(o.id_order) === String(orderId));
          if (order) {
            setFormData(prev => ({
              ...prev,
              // Pour le nom de l'exportateur, utilisez la propriété renvoyée par l'API.
              // Vérifiez que l'API retourne bien "exporterName" ou "exporter_company".
              exporterName: order.cust_name || order.exporter_company || 'Non spécifié',
              orderLabel: order.order_title || '',
              merchandises: order.merchandises || [],
              goodsOrigin: order.id_country_origin && countryMap[order.id_country_origin]
                ? countryMap[order.id_country_origin]
                : 'Non spécifié',
              goodsDestination: order.id_country_destination && countryMap[order.id_country_destination]
                ? countryMap[order.id_country_destination]
                : 'Non spécifié',
              loadingPort: order.loadingPort || '',
              dischargingPort: order.dischargingPort || '',
              transportRemarks: order.transport_remarks || '',
              receiverName: order.recipient_name || 'N/A',
              receiverAddress: order.address_1 || 'N/A',
              receiverAddress2: order.address_2 || '',
              receiverPostalCode: order.postal_code || 'N/A',
              receiverCity: order.city || 'N/A',
              receiverCountry: order.country || 'N/A',
              receiverPhone: order.receiver_phone || 'N/A',
              copies: order.copy_count_ori || 1,
              remarks: order.notes_ori || 'Aucune remarque',
              transportModes: transportModesObj,
              documents: order.documents || [],
            }));
          } else {
            console.error('Commande introuvable pour l’ID :', orderId);
          }
        }

        // 4. Si un certifId est présent, récupérer les marchandises associées au certificat
        if (certifId) {
          const goodsResponse = await getCertifGoodsInfo(certifId);
          const mappedGoods = (goodsResponse.data || []).map(good => ({
            designation: good.good_description,
            boxReference: good.good_references,
            quantity: good.weight_qty,
            unit: good.symbol_fr || 'N/A',
          }));
          setFormData(prev => ({
            ...prev,
            merchandises: mappedGoods,
          }));
        }
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données', error);
        setLoading(false);
      }
    };

    loadData();
  }, [orderId, certifId, idLogin]);


const handleFileClick = (file) => {
  // Construct the file URL
  const fileUrl = `${API_URL}/files/commandes/${new Date().getFullYear()}/${file.file_guid}`;
  // Open in a new browser tab
  window.open(fileUrl, '_blank');
};


  const handleValidate = () => {
    console.log('Commande validée :', orderId);
    navigate('/operator-dashboard');
  };

  const handleReject = () => {
    console.log('Commande rejetée :', orderId);
    navigate('/operator-dashboard');
  };

  useEffect(() => {
    const loadDocumentsInfo = async () => {
      try {
        // Prepare parameters for the function.
        // Here we pass the current orderId. You may add more parameters as needed.
        const queryParams = {
          p_id_order_list: orderId,
          p_isactive: true,
          // p_id_custaccount: customerAccountId,
        };
        const result = await getOrderFilesInfo(queryParams);
        // Update our state with the retrieved documents info
        setDocumentsInfo(result);
      } catch (error) {
        console.error('Error retrieving documents info:', error);
      }
    };

    if (orderId) {
      loadDocumentsInfo();
    }
  }, [orderId]);


  if (loading) {
    return <div className="op-form">Chargement…</div>;
  }

  return (
    <div className="op-container">
      <form className="op-form">
        <h3 className="step5-title">Récapitulatif</h3>

        {/* Section : Désignation de la commande */}
        <h4 className="step5-main-title">Désignation commande</h4>
        <div className="step5-designation-commande">
          <div className="step5-field-row">
            <span className="step5-field-label">Société :</span>
            <span className="step5-field-value step5-fixed-field">
              {formData.exporterName}
            </span>
          </div>
          <div className="step5-field-row">
            <span className="step5-field-label">Libellé de commande :</span>
            <span className="step5-field-value">
              {formData.orderLabel || 'Aucun libellé spécifié'}
            </span>
          </div>
        </div>

        <div className="step5-designation-header">
          <h4>Contenu du Certificat d'origine</h4>
        </div>

        {/* Contenu du Certificat */}
        <div className="step5-contenu-certificat">
          {/* Section : Destinataire */}
          <div className="step5-recap-section">
            <h5>2/7 Destinataire</h5>
            <div className="step5-form-group">
              <label>Destinataire :</label>
              <span className="step5-field-value">{formData.receiverName}</span>
            </div>
            <div className="step5-form-group">
              <label>Adresse :</label>
              <span className="step5-field-value">{formData.receiverAddress}</span>
            </div>
            <div className="step5-form-group">
              <label>Complément :</label>
              <span className="step5-field-value">{formData.receiverAddress2}</span>
            </div>
            <div className="step5-form-group">
              <label>Code Postal :</label>
              <span className="step5-field-value">{formData.receiverPostalCode}</span>
            </div>
            <div className="step5-form-group">
              <label>Ville :</label>
              <span className="step5-field-value">{formData.receiverCity}</span>
            </div>
            <div className="step5-form-group">
              <label>Pays :</label>
              <span className="step5-field-value">{formData.receiverCountry}</span>
            </div>
            <div className="step5-form-group">
              <label>Téléphone :</label>
              <span className="step5-field-value">{formData.receiverPhone}</span>
            </div>
          </div>

          {/* Section : Marchandises */}
          <div className="step5-recap-section">
            <h5>3/7 Description de la marchandise</h5>
            {formData.merchandises && formData.merchandises.length > 0 ? (
              <div className="step5-table-responsive">
                <table className="step5-merchandise-table">
                  <thead>
                    <tr>
                      <th>Désignation</th>
                      <th>Référence</th>
                      <th>Quantité</th>
                      <th>Unité</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.merchandises.map((item, index) => (
                      <tr key={index}>
                        <td>{item.designation || 'Non spécifié'}</td>
                        <td>{item.boxReference || 'Non spécifié'}</td>
                        <td>{item.quantity || 'Non spécifié'}</td>
                        <td>{item.unit || 'Non spécifié'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>Aucune marchandise ajoutée.</p>
            )}
          </div>

          {/* Section : Origine et Destination */}
          <div className="step5-recap-section">
            <h5>4/7 Origine et Destination des Marchandises</h5>
            <div className="step5-country-selection">
              <div className="step5-form-group">
                <label>Pays d'origine :</label>
                <span className="step5-field-value">
                  {formData.goodsOrigin || 'Non spécifié'}
                </span>
              </div>
              <div className="step5-form-group">
                <label>Pays de destination :</label>
                <span className="step5-field-value">
                  {formData.goodsDestination || 'Non spécifié'}
                </span>
              </div>
            </div>
          </div>

          {/* Section : Transport */}
          <div className="step5-recap-section">
            <h5>5/7 Transport</h5>
            <div className="step5-form-group">
              <label>Port de chargement :</label>
              <span className="step5-field-value">{formData.loadingPort || 'Non spécifié'}</span>
            </div>
            <div className="step5-form-group">
              <label>Port de déchargement :</label>
              <span className="step5-field-value">{formData.dischargingPort || 'Non spécifié'}</span>
            </div>
            <div className="step5-form-group">
              <label>Modes de transport :</label>
              <span className="step5-field-value">
                {Object.keys(formData.transportModes || {})
                  .filter(key => formData.transportModes[key])
                  .map(key => key.charAt(0).toUpperCase() + key.slice(1))
                  .join(', ') || 'Aucun mode sélectionné'}
              </span>
            </div>
            <div className="step5-form-group">
              <label>Remarques sur le transport :</label>
              <span className="step5-recap-value">{formData.transportRemarks || 'Aucune remarque'}</span>
            </div>
          </div>

          {/* Section : Copies et Remarques */}
          <div className="step5-recap-section">
            <h5>6/7 Autres</h5>
            <div className="step5-recap-item">
              <span className="step5-recap-label">Copies certifiées :</span>
              <span className="step5-recap-value step5-fixed-field">{formData.copies || 'Non spécifié'}</span>
            </div>
            <div className="step5-recap-item">
              <span className="step5-recap-label">Remarques :</span>
              <span className="step5-recap-value step5-fixed-field">{formData.remarks || 'Aucune remarque'}</span>
            </div>
          </div>
        </div>

        {/* Section : Pièces justificatives & annexes */}
        <h4 className="step5-main-title">Pièce justificatives & annexes</h4>
        <div className="step5-designation-commande">
          <h5 className="step5-sub-title">7/7 Pièce Justificatives & annexes</h5>
          <div className="step5-pieces-justificatives-rectangle">
            {documentsInfo && documentsInfo.length > 0 ? (
              <div className="step5-table-responsive">
                <table className="step5-document-table">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Type</th>
                      <th>Fichier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documentsInfo.map((doc, index) => (
                      <tr key={index}>
                        <td>{doc.txt_description_fr}</td>
                        <td>{doc.type === 'justificative' ? 'Justificative' : 'Annexe'}</td>
                        {/* 3) Clickable link */}
                        <td>
                          {doc.file_guid ? (
                            <span
                              onClick={() => handleFileClick(doc)}
                              style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
                            >
                              {doc.file_origin_name || 'Télécharger le fichier'}
                            </span>
                          ) : (
                            "Aucun fichier"
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
            <button type="button" className="step5-upload-button">
              Upload
            </button>
          </div>
        </div>

        <div className="step5-submit-section">
          {/* Bouton Valider */}
          <button
            type="button"
            className="step5-next-button"
            onClick={handleValidate}
          >
            Valider
          </button>

          {/* Bouton Rejeter */}
          <button
            type="button"
            className="step5-reject-button"
            onClick={handleReject}
          >
            Rejeter
          </button>
        </div>

      </form>
    </div>
  );
};

export default OpOrderDetails;
