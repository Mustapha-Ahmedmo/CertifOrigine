import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList,
  faDollarSign,
  faUndo,
  faCheckCircle,
  faPen,
  faTimes,
  faPlus,
  faEye,
} from '@fortawesome/free-solid-svg-icons';
import { Helmet } from 'react-helmet'; // Importer Helmet
import './Home.css';
import '@fontsource/poppins'; // Cela importe la police Poppins

const Home = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('visa');

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  // Données d'exemple
  const ordersVisa = [
    { id: 1, date: '2024-08-01', orderNumber: 'CMD-001', designation: 'Produit A' },
    { id: 2, date: '2024-08-02', orderNumber: 'CMD-002', designation: 'Produit B' },
  ];

  const ordersPayment = [
    { id: 1, date: '2024-08-01', orderNumber: 'CMD-003', invoiceNumber: '', designation: 'Produit C', validationDate: '2024-08-05' },
    { id: 2, date: '2024-08-03', orderNumber: 'CMD-004', invoiceNumber: '', designation: 'Produit D', validationDate: '2024-08-06' },
  ];

  const ordersValidation = [
    { id: 1, date: '2024-08-01', orderNumber: 'CMD-005', designation: 'Produit E', submissionDate: '2024-08-02' },
    { id: 2, date: '2024-08-04', orderNumber: 'CMD-006', designation: 'Produit F', submissionDate: '2024-08-05' },
    { id: 3, date: '2024-08-06', orderNumber: 'CMD-007', designation: 'Produit G', submissionDate: '2024-08-07' },
  ];

  return (
    <div className="home-container">
      <Helmet>
        <title>Dashboard</title> {/* Titre de la page */}
      </Helmet>
      <div className="welcome-message">
        Bienvenue <span className="highlight-text">INDIGO TRADING FZCO</span>
      </div>
      <div className="tabs-container">
        <div
          className={`tab-item ${activeTab === 'visa' ? 'active' : ''}`}
          onClick={() => handleTabClick('visa')}
        >
          <FontAwesomeIcon icon={faClipboardList} className="tab-icon" /> Commandes en attente de Visa ({ordersVisa.length})
        </div>
        <div
          className={`tab-item ${activeTab === 'validation' ? 'active' : ''}`}
          onClick={() => handleTabClick('validation')}
        >
          <FontAwesomeIcon icon={faCheckCircle} className="tab-icon" /> Commandes en attente de validation ({ordersValidation.length})
        </div>
        <div
          className={`tab-item ${activeTab === 'payment' ? 'active' : ''}`}
          onClick={() => handleTabClick('payment')}
        >
          <FontAwesomeIcon icon={faDollarSign} className="tab-icon" /> Commandes en attente de paiement ({ordersPayment.length})
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Commandes en attente de Visa */}
        {activeTab === 'visa' && (
          <div className="dashboard-item">
            <table className="dashboard-table">
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
                {ordersVisa.map((order) => (
                  <tr key={order.id}>
                    <td>{order.date}</td>
                    <td>{order.orderNumber}</td>
                    <td>{order.designation}</td>
                    <td>
                      <button className="small-button"><FontAwesomeIcon icon={faEye} /></button>
                    </td>
                    <td>
                      <button className="small-button"><FontAwesomeIcon icon={faPlus} /></button>
                    </td>
                    <td>
                      <button className="small-button"><FontAwesomeIcon icon={faEye} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="action-button">Voir les commandes en attente de Visa</button>
          </div>
        )}

        {/* Commandes en attente de validation */}
        {activeTab === 'validation' && (
          <div className="dashboard-item">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>N° de Commande</th>
                  <th>Désignation</th>
                  <th>Date soumission</th>
                  <th>Certificat d'Origine</th>
                  <th>Facture Commerciale</th>
                  <th>Législation</th>
                </tr>
              </thead>
              <tbody>
                {ordersValidation.map((order) => (
                  <tr key={order.id}>
                    <td>{order.date}</td>
                    <td>{order.orderNumber}</td>
                    <td>{order.designation}</td>
                    <td>{order.submissionDate}</td>
                    <td>
                      <button className="small-button"><FontAwesomeIcon icon={faEye} /></button>
                    </td>
                    <td></td> {/* Colonne vide pour Facture Commerciale */}
                    <td>
                      <button className="small-button"><FontAwesomeIcon icon={faEye} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="action-button">Voir les commandes en attente de validation</button>
          </div>
        )}

        {/* Commandes en attente de paiement */}
        {activeTab === 'payment' && (
          <div className="dashboard-item">
            <table className="dashboard-table">
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
                {ordersPayment.map((order) => (
                  <tr key={order.id}>
                    <td>{order.date}</td>
                    <td>{order.orderNumber}</td>
                    <td>{order.invoiceNumber}</td>
                    <td>{order.designation}</td>
                    <td>{order.validationDate}</td>
                    <td>
                      <button className="small-button"><FontAwesomeIcon icon={faEye} /></button>
                    </td>
                    <td></td> {/* Colonne vide pour Facture Commerciale */}
                    <td>
                      <button className="small-button"><FontAwesomeIcon icon={faEye} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="action-button">Voir les commandes en attente de paiement</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
