import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList,
  faDollarSign,
  faUndo,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons';
import { Helmet } from 'react-helmet'; // Importer Helmet
import './Home.css';
import '@fontsource/poppins'; // Cela importe la police Poppins

const Home = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('complete');

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  // Exemple de données pour chaque section
  const toCompleteOrders = [
    { id: 1, name: 'Commande 1', date: '2024-08-01' },
    { id: 2, name: 'Commande 2', date: '2024-08-02' },
  ];

  const toPayOrders = [
    { id: 1, name: 'Commande 3', date: '2024-08-03', price: '50.00€' },
    { id: 2, name: 'Commande 4', date: '2024-08-04', price: '75.00€' },
  ];

  const validatedOrders = [
    { id: 1, name: 'Commande 5', date: '2024-08-05' },
    { id: 2, name: 'Commande 6', date: '2024-08-06' },
  ];

  const returnedOrders = [
    { id: 1, name: 'Commande 7', date: '2024-08-07' },
    { id: 2, name: 'Commande 8', date: '2024-08-08' },
  ];

  return (
    <div className="home-container">
      <Helmet>
        <title>Dashboard</title> {/* Titre de la page */}
      </Helmet>
      <div className="welcome-message">
        Bienvenue Entreprise 1
      </div>
      <div className="tabs-container">
        <div
          className={`tab-item ${activeTab === 'complete' ? 'active' : ''}`}
          onClick={() => handleTabClick('complete')}
        >
          <FontAwesomeIcon icon={faClipboardList} className="tab-icon" /> {t('home.ordersToComplete')}{' '}
          <span className="tab-counter">{toCompleteOrders.length}</span>
        </div>
        <div
          className={`tab-item ${activeTab === 'pay' ? 'active' : ''}`}
          onClick={() => handleTabClick('pay')}
        >
          <FontAwesomeIcon icon={faDollarSign} className="tab-icon" /> {t('home.ordersToPay')}{' '}
          <span className="tab-counter">{toPayOrders.length}</span>
        </div>
        <div
          className={`tab-item ${activeTab === 'returned' ? 'active' : ''}`}
          onClick={() => handleTabClick('returned')}
        >
          <FontAwesomeIcon icon={faUndo} className="tab-icon" /> {t('home.returnedOrders')}{' '}
          <span className="tab-counter">{returnedOrders.length}</span>
        </div>
        <div
          className={`tab-item ${activeTab === 'validated' ? 'active' : ''}`}
          onClick={() => handleTabClick('validated')}
        >
          <FontAwesomeIcon icon={faCheckCircle} className="tab-icon" /> {t('home.validatedOrders')}{' '}
          <span className="tab-counter">{validatedOrders.length}</span>
        </div>
      </div>

      <div className="dashboard-grid">
        {activeTab === 'complete' && (
          <div className="dashboard-item">
            <FontAwesomeIcon icon={faClipboardList} className="section-icon" />
            <ul>
              {toCompleteOrders.map((order) => (
                <li key={order.id} className="order-item">
                  {order.name} - {order.date}
                  <div className="order-actions">
                    <button className="edit-button">{t('home.edit')}</button>
                    <button className="delete-button">{t('home.delete')}</button>
                  </div>
                </li>
              ))}
            </ul>
            <Link to="/dashboard/to-complete" className="dashboard-button see-orders-button">
              {t('home.goToUncompletedOrders')}
            </Link>
          </div>
        )}

        {activeTab === 'pay' && (
          <div className="dashboard-item">
            <FontAwesomeIcon icon={faDollarSign} className="section-icon" />
            <ul>
              {toPayOrders.map((order) => (
                <li key={order.id} className="order-item">
                  {order.name} - {order.date} - {order.price}
                  <div className="order-actions">
                    <button className="pay-button">{t('home.pay')}</button>
                  </div>
                </li>
              ))}
            </ul>
            <Link to="/dashboard/to-pay" className="dashboard-button see-orders-button">
              {t('home.goToOrdersToPay')}
            </Link>
          </div>
        )}

        {activeTab === 'returned' && (
          <div className="dashboard-item returned-orders">
            <FontAwesomeIcon icon={faUndo} className="section-icon" />
            <ul>
              {returnedOrders.map((order) => (
                <li key={order.id} className="order-item">
                  {order.name} - {order.date}
                  <div className="order-actions">
                    <button className="complete-button">{t('home.complete')}</button>
                  </div>
                </li>
              ))}
            </ul>
            <Link to="/dashboard/returned-orders" className="dashboard-button see-orders-button">
              Voir les commandes retournées
            </Link>
          </div>
        )}

        {activeTab === 'validated' && (
          <div className="dashboard-item validated-orders">
            <FontAwesomeIcon icon={faCheckCircle} className="section-icon" />
            <ul>
              {validatedOrders.map((order) => (
                <li key={order.id} className="order-item">
                  {order.name} - {order.date}
                  <div className="order-actions">
                    <button className="complete-button">Voir</button> {/* Changement ici */}
                  </div>
                </li>
              ))}
            </ul>
            <Link to="/dashboard/validated-orders" className="dashboard-button see-orders-button">
              Voir les commandes validées
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
