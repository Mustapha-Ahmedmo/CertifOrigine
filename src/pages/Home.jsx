import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardList, faDollarSign, faBoxOpen, faUndo } from '@fortawesome/free-solid-svg-icons';
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
    { id: 1, name: 'Order 1', date: '2024-08-01' },
    { id: 2, name: 'Order 2', date: '2024-08-02' },
  ];

  const toPayOrders = [
    { id: 1, name: 'Order 3', date: '2024-08-03', price: '50.00€' },
    { id: 2, name: 'Order 4', date: '2024-08-04', price: '75.00€' },
  ];

  const returnedOrders = [
    { id: 1, name: 'Order 5', date: '2024-08-05', reason: 'Damaged product' },
    { id: 2, name: 'Order 6', date: '2024-08-06', reason: 'Incorrect item' },
  ];

  return (
    <div className="home-container">
      <div className="welcome-message">
        Bienvenue Entreprise 1
      </div>
      <div className="tabs-container">
        <div className={`tab-item ${activeTab === 'complete' ? 'active' : ''}`} onClick={() => handleTabClick('complete')}>
          <FontAwesomeIcon icon={faClipboardList} className="tab-icon" /> {t('home.ordersToComplete')} <span className="tab-counter">2</span>
        </div>
        <div className={`tab-item ${activeTab === 'pay' ? 'active' : ''}`} onClick={() => handleTabClick('pay')}>
          <FontAwesomeIcon icon={faDollarSign} className="tab-icon" /> {t('home.ordersToPay')} <span className="tab-counter">2</span>
        </div>
        <div className={`tab-item ${activeTab === 'returned' ? 'active' : ''}`} onClick={() => handleTabClick('returned')}>
          <FontAwesomeIcon icon={faUndo} className="tab-icon" /> {t('home.returnedOrders')} <span className="tab-counter">2</span>
        </div>
      </div>

      <div className="dashboard-grid">
        {activeTab === 'complete' && (
          <div className="dashboard-item">
            <FontAwesomeIcon icon={faClipboardList} className="section-icon" />
            <ul>
              {toCompleteOrders.map(order => (
                <li key={order.id} className="order-item">
                  {order.name} - {order.date}
                  <div className="order-actions">
                    <button className="edit-button">{t('home.edit')}</button>
                    <button className="delete-button">{t('home.delete')}</button>
                  </div>
                </li>
              ))}
            </ul>
            <Link to="/dashboard/to-complete" className="dashboard-button">{t('home.goToUncompletedOrders')}</Link>
          </div>
        )}

        {activeTab === 'pay' && (
          <div className="dashboard-item">
            <FontAwesomeIcon icon={faDollarSign} className="section-icon" />
            <ul>
              {toPayOrders.map(order => (
                <li key={order.id} className="order-item">
                  {order.name} - {order.date} - {order.price}
                  <div className="order-actions">
                    <button className="pay-button">{t('home.pay')}</button>
                  </div>
                </li>
              ))}
            </ul>
            <Link to="/dashboard/to-pay" className="dashboard-button">{t('home.goToOrdersToPay')}</Link>
          </div>
        )}

        {activeTab === 'returned' && (
          <div className="dashboard-item">
            <FontAwesomeIcon icon={faUndo} className="section-icon" />
            <ul>
              {returnedOrders.map(order => (
                <li key={order.id} className="order-item">
                  {order.name} - {order.date} - {order.reason}
                  <div className="order-actions">
                    <button className="complete-button">{t('home.complete')}</button>
                  </div>
                </li>
              ))}
            </ul>
            <Link to="/dashboard/returned-orders" className="dashboard-button">{t('home.goToReturnedOrders')}</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
