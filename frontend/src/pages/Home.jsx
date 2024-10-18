import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList,
  faDollarSign,
  faCheckCircle, // Nouvelle icône pour Commandes validées
} from '@fortawesome/free-solid-svg-icons';
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

  return (
    <div className="home-container">
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
            <Link to="/dashboard/to-complete" className="dashboard-button">
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
            <Link to="/dashboard/to-pay" className="dashboard-button">
              {t('home.goToOrdersToPay')}
            </Link>
          </div>
        )}

        {activeTab === 'validated' && (
          <div className="dashboard-item">
            <FontAwesomeIcon icon={faCheckCircle} className="section-icon" />
            <ul>
              {validatedOrders.map((order) => (
                <li key={order.id} className="order-item">
                  {order.name} - {order.date}
                  <div className="order-actions">
                    <button className="view-button">{t('home.view')}</button>
                  </div>
                </li>
              ))}
            </ul>
            <Link to="/dashboard/validated-orders" className="dashboard-button">
              {t('home.goToValidatedOrders')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
