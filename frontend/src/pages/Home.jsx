import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList,
  faDollarSign,
  faClock, // Icône pour les commandes en attente de validation
} from '@fortawesome/free-solid-svg-icons';
import { Helmet } from 'react-helmet'; // Importer Helmet
import './Home.css';
import '@fontsource/poppins'; // Cela importe la police Poppins

const Home = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('pending');

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  // Exemple de données pour chaque section
  const pendingOrders = [
    {
      id: 1,
      date: '2024-08-01',
      orderNumber: 'CMD-001',
      designation: 'Produit A',
      submissionDate: '2024-08-02',
      certificateOfOrigin: 'Certificat 1',
      commercialInvoice: 'Facture 1',
      legislation: 'Législation 1',
    },
    {
      id: 2,
      date: '2024-08-02',
      orderNumber: 'CMD-002',
      designation: 'Produit B',
      submissionDate: '2024-08-03',
      certificateOfOrigin: 'Certificat 2',
      commercialInvoice: 'Facture 2',
      legislation: 'Législation 2',
    },
    {
      id: 3,
      date: '2024-08-03',
      orderNumber: 'CMD-003',
      designation: 'Produit C',
      submissionDate: '2024-08-04',
      certificateOfOrigin: 'Certificat 3',
      commercialInvoice: 'Facture 3',
      legislation: 'Législation 3',
    },
  ];

  const toPayOrders = [
    {
      id: 1,
      date: '2024-08-01',
      orderNumber: 'CMD-003',
      invoiceNumber: 'INV-001',
      designation: 'Produit C',
      validationDate: '2024-08-02',
      certificateOfOrigin: 'Certificat 3',
      commercialInvoice: 'Facture 3',
      legislation: 'Législation 3',
    },
    {
      id: 2,
      date: '2024-08-02',
      orderNumber: 'CMD-004',
      invoiceNumber: 'INV-002',
      designation: 'Produit D',
      validationDate: '2024-08-03',
      certificateOfOrigin: 'Certificat 4',
      commercialInvoice: 'Facture 4',
      legislation: 'Législation 4',
    },
  ];

  return (
    <div className="home-container">
      <Helmet>
        <title>Dashboard</title> {/* Titre de la page */}
      </Helmet>
      <div className="welcome-message">
        Bienvenue <span style={{ color: '#007bff' }}>INDIGO TRADING FZCO</span>
      </div>
      <div className="tabs-container">
        <div
          className={`tab-item ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => handleTabClick('pending')}
        >
          <FontAwesomeIcon icon={faClipboardList} className="tab-icon" /> Commandes en attente de Visa{' '}
          <span className="tab-counter">{pendingOrders.length}</span>
        </div>
        <div
          className={`tab-item ${activeTab === 'pay' ? 'active' : ''}`}
          onClick={() => handleTabClick('pay')}
        >
          <FontAwesomeIcon icon={faDollarSign} className="tab-icon" /> Commandes en attente de paiement{' '}
          <span className="tab-counter">{toPayOrders.length}</span>
        </div>
        <div
          className={`tab-item ${activeTab === 'validation' ? 'active' : ''}`}
          onClick={() => handleTabClick('validation')}
        >
          <FontAwesomeIcon icon={faClock} className="tab-icon" /> Commandes en attente de validation{' '}
          <span className="tab-counter">{pendingOrders.length}</span>
        </div>
      </div>

      <div className="dashboard-grid">
        {activeTab === 'pending' && (
          <div className="dashboard-item">
            <table className="pending-orders-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>N° de Commande</th>
                  <th>Désignation</th>
                  <th>Certificat d'Origine</th>
                  <th>Facture Commerciale</th>
                  <th>Législation</th>
                </tr>
              </thead>
              <tbody>
                {pendingOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.date}</td>
                    <td>{order.orderNumber}</td>
                    <td>{order.designation}</td>
                    <td>{order.certificateOfOrigin}</td>
                    <td>{order.commercialInvoice}</td>
                    <td>{order.legislation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Link to="/dashboard/to-complete" className="dashboard-button see-orders-button">
              {t('home.goToUncompletedOrders')}
            </Link>
          </div>
        )}

        {activeTab === 'pay' && (
          <div className="dashboard-item">
            <table className="pending-orders-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>N° de Commande</th>
                  <th>N° Facture</th>
                  <th>Désignation</th>
                  <th>Date Validation</th>
                  <th>Certificat d'Origine</th>
                  <th>Facture Commerciale</th>
                  <th>Législation</th>
                </tr>
              </thead>
              <tbody>
                {toPayOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.date}</td>
                    <td>{order.orderNumber}</td>
                    <td>{order.invoiceNumber}</td>
                    <td>{order.designation}</td>
                    <td>{order.validationDate}</td>
                    <td>{order.certificateOfOrigin}</td>
                    <td>{order.commercialInvoice}</td>
                    <td>{order.legislation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Link to="/dashboard/to-pay" className="dashboard-button see-orders-button">
              {t('home.goToOrdersToPay')}
            </Link>
          </div>
        )}

        {activeTab === 'validation' && (
          <div className="dashboard-item validated-orders">
            <table className="pending-orders-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>N° de Commande</th>
                  <th>Désignation</th>
                  <th>Date Soumission</th>
                  <th>Certificat d'Origine</th>
                  <th>Facture Commerciale</th>
                  <th>Législation</th>
                </tr>
              </thead>
              <tbody>
                {pendingOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.date}</td>
                    <td>{order.orderNumber}</td>
                    <td>{order.designation}</td>
                    <td>{order.submissionDate}</td>
                    <td>{order.certificateOfOrigin}</td>
                    <td>{order.commercialInvoice}</td>
                    <td>{order.legislation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Link to="/dashboard/validated-orders" className="dashboard-button see-orders-button">
              Voir les commandes en attente de validation
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
