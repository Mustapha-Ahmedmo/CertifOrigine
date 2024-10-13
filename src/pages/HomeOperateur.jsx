import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardList, faUndo } from '@fortawesome/free-solid-svg-icons';
import './Home.css'; // Utiliser le même fichier CSS
import '@fontsource/poppins'; // Cela importe la police Poppins

const HomeOperateur = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('waiting');

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  // Exemple de données pour chaque section
  const waitingOrders = [
    { id: 1, name: 'Order 1', date: '2024-08-01' },
    { id: 2, name: 'Order 2', date: '2024-08-02' },
  ];

  const returnedOrders = [
    { id: 1, name: 'Order 5', date: '2024-08-05', reason: 'Damaged product' },
    { id: 2, name: 'Order 6', date: '2024-08-06', reason: 'Incorrect item' },
  ];

  return (
    <div className="home-container">
      <div className="welcome-message">
        Bienvenue Opérateur 1
      </div>
      <div className="tabs-container">
        <div className={`tab-item ${activeTab === 'waiting' ? 'active' : ''}`} onClick={() => handleTabClick('waiting')}>
          <FontAwesomeIcon icon={faClipboardList} className="tab-icon" /> Commandes en attente de validation de votre part <span className="tab-counter">{waitingOrders.length}</span>
        </div>
        <div className={`tab-item ${activeTab === 'returned' ? 'active' : ''}`} onClick={() => handleTabClick('returned')}>
          <FontAwesomeIcon icon={faUndo} className="tab-icon" /> Commandes retournées <span className="tab-counter">{returnedOrders.length}</span>
        </div>
      </div>

      <div className="dashboard-grid">
        {activeTab === 'waiting' && (
          <div className="dashboard-item">
            <FontAwesomeIcon icon={faClipboardList} className="section-icon" />
            <ul>
              {waitingOrders.map(order => (
                <li key={order.id} className="order-item">
                  {order.name} - {order.date}
                  <div className="order-actions">
                    <button className="edit-button">{t('home.edit')}</button>
                    <button className="delete-button">{t('home.delete')}</button>
                  </div>
                </li>
              ))}
            </ul>
            <Link to="/dashboard/to-complete" className="dashboard-button">Voir les commandes en attente</Link>
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
            <Link to="/dashboard/returned-orders" className="dashboard-button">Voir les commandes retournées</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeOperateur;
