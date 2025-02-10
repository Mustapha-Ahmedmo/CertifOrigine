import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList,
  faDollarSign,
  faCheckCircle,
  faEye,
} from '@fortawesome/free-solid-svg-icons';
import { Helmet } from 'react-helmet';
import './HomeOperateur.css';
import Step5 from '../components/orders/Create/steps/Step5';
import ClientProfile from '../pages/ClientProfile';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getOrderOpInfo } from '../services/apiServices';


const HomeOperateur = () => {
  const [activeTab, setActiveTab] = useState('visa');
  const [showModal, setShowModal] = useState(false);
  const [modalValues, setModalValues] = useState(null);
  const [showSecondModal, setShowSecondModal] = useState(false);
  const [secondModalContent, setSecondModalContent] = useState(null);

  // Nouveaux états pour la modal de paiement
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const user = useSelector((state) => state.auth.user);
  const operatorId = user?.id_login_user;

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const navigate = useNavigate();
  const goToOrderDetails = (order) => {
    const certifId = order.id_ord_certif_ori || '';
    navigate(`/dashboard/operator/oporderdetails?orderId=${order.id_order}&certifId=${certifId}`);
  };



  const openModal = (values) => {
    setModalValues(values);
    setShowModal(true);
  };

  const closeModal = () => {
    setModalValues(null);
    setShowModal(false);
  };

  const openSecondModal = (clientData) => {
    setSecondModalContent(clientData);
    setShowModal(false);
    setShowSecondModal(true);
  };

  const closeSecondModal = () => {
    setSecondModalContent(null);
    setShowSecondModal(false);
  };

  // Fonction pour ouvrir la modal de paiement
  const openPaymentModal = (order) => {
    setPaymentOrder(order);
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setPaymentOrder(null);
    setShowPaymentModal(false);
  };

  useEffect(() => {
    const loadOrders = async () => {
      try {
        // Build params; if you do not wish to filter by order or customer, pass null
        const params = {
          p_id_order_list: null,
          p_id_custaccount_list: null,
          p_id_orderstatus_list: null,
          p_idlogin: operatorId,
        };
        const result = await getOrderOpInfo(params);
        // Depending on your API response structure, adjust here.
        // For example, if your response returns { data: [...] } or just the array directly:
        const loadedOrders = result.data || result;
        setOrders(loadedOrders);
      } catch (error) {
        console.error('Error loading orders for operator:', error);
      }
    };

    if (operatorId) {
      loadOrders();
    }
  }, [operatorId]);



  const ordersVisa = orders.filter(order => order.id_order_status === 1);
  const ordersValidation = orders.filter(order => order.id_order_status === 2);
  const ordersPayment = orders.filter(order => order.id_order_status === 3);

  const commandsOptions = [
    { value: 'visa', label: `Nouvelles commandes (${ordersVisa.length})` },
    { value: 'validation', label: `Commandes en cours de traitement (${ordersValidation.length})` },
    { value: 'payment', label: `Commandes en attente de paiement (${ordersPayment.length})` },
  ];

  const handleCommandsDropdownChange = (e) => {
    setActiveTab(e.target.value);
  };

  return (
    <div className="home-operator-container">
      <Helmet>
        <title>Dashboard Opérateur</title>
      </Helmet>

      <div className="welcome-message">
        Bienvenue {user?.full_name || 'Utilisateur'}
      </div>

      {/* Section COMMANDES */}
      <div className="commands-title highlight-text">COMMANDES</div>

      {/* Dropdown mobile pour COMMANDES */}
      <div className="commands-dropdown-container">
        <select className="commands-dropdown" value={activeTab} onChange={handleCommandsDropdownChange}>
          {commandsOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Tabs desktop pour COMMANDES */}
      <div className="tabs-container commands-tabs-container">
        <div
          className={`tab-item ${activeTab === 'visa' ? 'active' : ''}`}
          onClick={() => handleTabClick('visa')}
        >
          <FontAwesomeIcon icon={faClipboardList} className="tab-icon" />
          Nouvelles commandes ({ordersVisa.length})
        </div>
        <div
          className={`tab-item ${activeTab === 'validation' ? 'active' : ''}`}
          onClick={() => handleTabClick('validation')}
        >
          <FontAwesomeIcon icon={faCheckCircle} className="tab-icon" />
          Commandes en cours de traitement ({ordersValidation.length})
        </div>
        <div
          className={`tab-item ${activeTab === 'payment' ? 'active' : ''}`}
          onClick={() => handleTabClick('payment')}
        >
          <FontAwesomeIcon icon={faDollarSign} className="tab-icon" />
          Commandes en attente de paiement ({ordersPayment.length})
        </div>
      </div>

      <div className="dashboard-grid">
        {activeTab === 'visa' && (
          <div className="dashboard-item">
            <div className="dashboard-table-container">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>N° de Commande</th>
                    <th>Client</th>
                    <th>Désignation</th>
                    <th>Date soumission</th>
                    <th>Certificat d'Origine</th>
                    <th>Facture Commerciale</th>
                    <th>Légalisations</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {ordersVisa.map((order) => (
                    <tr key={order.id_order}>
                      <td>{order.insertdate_order}</td>
                      <td>{order.id_order}</td>
                      <td>{order.cust_name}</td>
                      <td>{order.designation}</td>
                      <td>{order.submissionDate}</td>
                      <td>
                        <button
                          className="icon-button minimal-button"
                          onClick={() => goToOrderDetails(order)}
                        >
                          <FontAwesomeIcon icon={faEye} title="Vérifier" />
                          <span className="button-text">Vérifier</span>
                        </button>
                      </td>
                      <td></td>
                      <td>
                        <button className="icon-button minimal-button">
                          <FontAwesomeIcon icon={faEye} title="Vérifier" />
                          <span className="button-text">Vérifier</span>
                        </button>
                      </td>
                      <td>
                        <button className="submit-button minimal-button">Facturer</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'validation' && ordersValidation.length > 0 && (
          <div className="dashboard-item">
            {/* Afficher les commandes en validation si nécessaire */}
          </div>
        )}

        {activeTab === 'payment' && (
          <div className="dashboard-item">
            <div className="dashboard-table-container">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>N° de commande</th>
                    <th>Client</th>
                    <th>N° de facture</th>
                    <th>Désignation</th>
                    <th>Date de validation</th>
                    <th>Certificat d'origine</th>
                    <th>Facture Commerciale</th>
                    <th>Légalisation</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersPayment.map((order) => (
                    <tr key={order.id}>
                      <td>{order.date}</td>
                      <td>{order.orderNumber}</td>
                      <td>{order.client}</td>
                      <td>{order.invoiceNumber}</td>
                      <td>{order.designation}</td>
                      <td>{order.validationDate}</td>
                      <td>
                        <button
                          className="icon-button minimal-button"
                          onClick={() => openModal(order.details)}
                        >
                          <FontAwesomeIcon icon={faEye} title="Voir" />
                          <span className="button-text">Détails</span>
                        </button>
                      </td>
                      <td></td>
                      <td>
                        <button className="icon-button minimal-button">
                          <FontAwesomeIcon icon={faEye} title="Voir" />
                          <span className="button-text">Détails</span>
                        </button>
                      </td>
                      <td>
                        <button
                          className="submit-button minimal-button"
                          onClick={() => openPaymentModal(order)}
                        >
                          Payer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      

      {/* Modal secondaire */}
      {showSecondModal && secondModalContent && (
        <div className="modal-overlay" onClick={closeSecondModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <ClientProfile clientData={secondModalContent} closeModal={closeSecondModal} />
          </div>
        </div>
      )}

      {/* Modal de paiement avec le même style que Certificat d'origine */}
      {showPaymentModal && paymentOrder && (
        <div className="modal-overlay" onClick={closePaymentModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="payment-modal-header">
              PAIEMENT DE LA COMMANDE N° {paymentOrder.orderNumber}
            </div>
            <div className="payment-modal-client-section">
              <div className="payment-modal-client">
                <div className="client-name">{paymentOrder.client}</div>
                <div>DJIBOUTI FREE ZONE Po Box 2520</div>
                <div>REP. DE DJIBOUTI</div>
              </div>

              <div className="payment-modal-fields">
                <div>
                  <label>Date de facture</label>
                  <input type="date" defaultValue="2024-11-25" />
                </div>
                <div>
                  <label>N° Facture</label>
                  <input type="text" defaultValue={paymentOrder.invoiceNumber} />
                </div>
                <div>
                  <label>Montant</label>
                  <input type="text" defaultValue={paymentOrder.amount} />
                </div>
              </div>
            </div>

            <hr />

            <div className="payment-modal-reglement">
              <h4>Règlement de la facture</h4>
              <div className="payment-modal-fields">
                <div>
                  <label>Date de paiement</label>
                  <input type="date" defaultValue="2024-11-25" />
                </div>
                <div>
                  <label>Moyen de paiement</label>
                  <select defaultValue="Cash">
                    <option value="Cash">Cash</option>
                    <option value="Virement">Virement</option>
                    <option value="Chèque">Chèque</option>
                  </select>
                </div>
                <div>
                  <label>Information concernant le paiement</label>
                  <input type="text" defaultValue="4*10K + 2*5K + 3*1K" />
                </div>
                <div className="payment-modal-checkbox">
                  <label>
                    <input type="checkbox" defaultChecked={true} />
                    Générer le certificat d'origine et les copies conformes
                  </label>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={closePaymentModal} className="reject-button">FERMER</button>
              <button onClick={() => alert('Paiement enregistré')} className="validate-button">ENREGISTRER LE PAIEMENT</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeOperateur;
