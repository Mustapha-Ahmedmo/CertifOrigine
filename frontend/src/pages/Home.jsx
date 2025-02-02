// Home.jsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList,
  faDollarSign,
  faCheckCircle,
  faPlus,
  faEye,
} from '@fortawesome/free-solid-svg-icons';
import { Helmet } from 'react-helmet';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getOrdersForCustomer, cancelOrder } from '../services/apiServices';
import './Home.css';

const Home = () => {
  const [activeTab, setActiveTab] = useState('visa');
  const [ordersVisa, setOrdersVisa] = useState([]);
  const [ordersValidation, setOrdersValidation] = useState([]);
  const [ordersPayment, setOrdersPayment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = useSelector((state) => state.auth.user);
  const idLogin = user?.id_login_user;
  const idCustAccount = user?.id_cust_account;
  const navigate = useNavigate();

  const fetchOrders = async () => {
    if (!idLogin || !idCustAccount) return;
    try {
      setLoading(true);
      const response = await getOrdersForCustomer({
        idCustAccountList: idCustAccount,
        idLogin,
      });
      console.log(response);
      const allOrders = response.data || [];

      // Categorize orders based on status
      setOrdersVisa(allOrders.filter(order => order.id_order_status === 1)); // À soumettre
      setOrdersValidation(allOrders.filter(order => order.id_order_status === 2)); // En attente de validation
      setOrdersPayment(allOrders.filter(order => order.id_order_status === 3)); // En attente de paiement
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Erreur lors de la récupération des commandes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [idLogin, idCustAccount]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleDropdownChange = (e) => {
    setActiveTab(e.target.value);
  };

  const options = [
    {
      value: 'visa',
      label: `Mes commandes à soumettre (${ordersVisa.length})`,
      title: `Mes commandes à soumettre (${ordersVisa.length})`,
    },
    {
      value: 'validation',
      label: `Mes commandes en attente de la CCD (${ordersValidation.length})`,
      title: `Mes commandes en attente de la CCD (${ordersValidation.length})`,
    },
    {
      value: 'payment',
      label: `Mes commandes en attente de paiement (${ordersPayment.length})`,
      title: `Mes commandes en attente de paiement (${ordersPayment.length})`,
    },
  ];

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
      <div className="home-welcome-message">
        Bienvenue <span className="home-highlight-text">{user?.companyname}</span>
      </div>

      {/* Dropdown for mobile */}
      <div className="home-dropdown-container">
        <select className="home-dropdown" value={activeTab} onChange={handleDropdownChange}>
          {options.map((option) => (
            <option key={option.value} value={option.value} title={option.title}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Tabs for desktop */}
      <div className="home-tabs-container">
        {options.map((option) => (
          <div
            key={option.value}
            className={`home-tab-item ${activeTab === option.value ? 'home-active' : ''}`}
            onClick={() => handleTabClick(option.value)}
          >
            <FontAwesomeIcon icon={option.value === 'visa' ? faClipboardList : option.value === 'validation' ? faCheckCircle : faDollarSign} className="home-tab-icon" />
            {option.label}
          </div>
        ))}
      </div>

      <div className="home-dashboard-grid">
        {activeTab === 'visa' && (
          <OrderTable
            title="Commandes à soumettre"
            orders={ordersVisa}
            refreshOrders={fetchOrders}
          />
        )}
        {activeTab === 'validation' && (
          <OrderTable
            title="Commandes en attente de validation"
            orders={ordersValidation}
            refreshOrders={fetchOrders}
          />
        )}
        {activeTab === 'payment' && (
          <OrderTable
            title="Commandes en attente de paiement"
            orders={ordersPayment}
            refreshOrders={fetchOrders}
          />
        )}
      </div>
    </div>
  );
};

const OrderTable = ({ title, orders, refreshOrders }) => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const currentUserId = user?.id_login_user;

  const handleDetailsClick = (orderId, certifId) => {
    navigate(`/dashboard/order-details?orderId=${orderId}&certifId=${certifId}`);
  };

  const handleCancelClick = async (orderId) => {
    try {
      const payload = {
        p_id_order: orderId,
        p_idlogin_modify: currentUserId,
      };
      const response = await cancelOrder(payload);
      console.log('Order cancelled:', response);
      // Refresh the orders list after cancellation
      refreshOrders && refreshOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert("Erreur lors de l'annulation de la commande.");
    }
  };

  return (
    <div className="home-dashboard-item">
      <h3>{title}</h3>
      <div className="home-dashboard-table-container">
        <table className="home-dashboard-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>N° de Commande</th>
              <th>Désignation</th>
              <th>Certificat d'Origine</th>
              <th>Facture Commerciale</th>
              <th>Législation</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id_order}>
                  <td>{new Date(order.insertdate_order).toLocaleDateString()}</td>
                  <td>{order.id_order || '-'}</td>
                  <td>{order.order_title || '-'}</td>

                  {/* Certificat d'Origine */}
                  <td>
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
                  </td>

                  {/* Facture Commerciale */}
                  <td>
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
                  </td>

                  {/* Législation */}
                  <td>
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
                  </td>

                  {/* Action Column */}
                  <td>
                    {(order.id_order_status === 1 || order.id_order_status === 6) ? (
                      <>
                      <button
                        className="home-icon-button home-minimal-button"
                        title="Annuler"
                        onClick={() => handleCancelClick(order.id_order)}
                      >
                        <FontAwesomeIcon /> Cancel
                      </button>
                                            <button className="home-submit-button home-minimal-button">
                                            {title.includes('paiement') ? 'Payer' : 'Soumettre'}
                                          </button>
                    </>) : (
                      <button className="home-submit-button home-minimal-button">
                        {title.includes('paiement') ? 'Payer' : 'Soumettre'}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">Aucune commande trouvée.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;