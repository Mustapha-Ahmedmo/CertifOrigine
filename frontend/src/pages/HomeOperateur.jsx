import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardList, faUndo, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import './HomeOperateur.css'; // Utiliser le fichier CSS spécifique
import '@fontsource/poppins'; // Cela importe la police Poppins

const HomeOperateur = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('waiting');

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  // Exemple de données pour chaque section
  const waitingOrders = [
    { id: 1, name: 'Commande 1', date: '2024-08-01' },
    { id: 2, name: 'Commande 2', date: '2024-08-02' },
  ];

  const returnedOrders = [
    { id: 3, name: 'Commande 3', date: '2024-08-05', reason: 'Produit endommagé' },
    { id: 4, name: 'Commande 4', date: '2024-08-06', reason: 'Article incorrect' },
  ];

  const completedOrders = [
    { id: 5, name: 'Commande 5', date: '2024-08-07' },
    { id: 6, name: 'Commande 6', date: '2024-08-08' },
  ];

  return (
    <div className="home-container">
      <div className="welcome-message">
        Bienvenue Opérateur 1
      </div>
      <div className="tabs-container">
        <div
          className={`tab-item ${activeTab === 'waiting' ? 'active' : ''}`}
          onClick={() => handleTabClick('waiting')}
        >
          <FontAwesomeIcon icon={faClipboardList} className="tab-icon" /> Commandes en attente de validation de votre part{' '}
          <span className="tab-counter">{waitingOrders.length}</span>
        </div>
        <div
          className={`tab-item ${activeTab === 'returned' ? 'active' : ''}`}
          onClick={() => handleTabClick('returned')}
        >
          <FontAwesomeIcon icon={faUndo} className="tab-icon" /> Commandes retournées{' '}
          <span className="tab-counter">{returnedOrders.length}</span>
        </div>
        <div
          className={`tab-item ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => handleTabClick('completed')}
        >
          <FontAwesomeIcon icon={faCheckCircle} className="tab-icon" /> Commandes terminées{' '}
          <span className="tab-counter">{completedOrders.length}</span>
        </div>
      </div>

      <div className="dashboard-grid">
        {activeTab === 'waiting' && (
          <div className="dashboard-item">
            <FontAwesomeIcon icon={faClipboardList} className="section-icon" />
            <ul>
              {waitingOrders.map((order) => (
                <li key={order.id} className="order-item">
                  {order.name} - {order.date}
                  <div className="order-actions">
                    <button className="home-operateur-validate-button" onClick={() => console.log(`Commande ${order.id} validée`)}>
                      <FontAwesomeIcon icon={faCheckCircle} /> Valider
                    </button>
                    <button className="home-operateur-return-button" onClick={() => console.log(`Commande ${order.id} refusée`)}>
                      <FontAwesomeIcon icon={faUndo} /> Retourner
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <Link to="/home-operateur/to-validateOP" className="dashboard-button">
              Voir les commandes en attente
            </Link>
          </div>
        )}

        {activeTab === 'returned' && (
          <div className="dashboard-item">
            <FontAwesomeIcon icon={faUndo} className="section-icon" />
            <ul>
              {returnedOrders.map((order) => (
                <li key={order.id} className="order-item">
                  {order.name} - {order.date} - Raison : {order.reason}
                  <div className="order-actions">
                  </div>
                </li>
              ))}
            </ul>
            <Link to="/dashboard/returned-orders" className="dashboard-button">
              Voir les commandes retournées
            </Link>
          </div>
        )}

        {activeTab === 'completed' && (
          <div className="dashboard-item">
            <FontAwesomeIcon icon={faCheckCircle} className="section-icon" />
            <ul>
              {completedOrders.map((order) => (
                <li key={order.id} className="order-item">
                  {order.name} - {order.date}
                  <div className="order-actions">
                    <button className="home-operateur-return-button" onClick={() => console.log(`Commande ${order.id} vue`)}>
                      Voir
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <Link to="/dashboard/completed-orders" className="dashboard-button">
              Voir les commandes terminées
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeOperateur;
