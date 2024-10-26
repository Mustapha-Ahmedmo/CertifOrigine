import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList,
  faDollarSign,
  faCheckCircle,
  faPen,
  faTimes,
  faPlus,
  faEye,
} from '@fortawesome/free-solid-svg-icons';
import { Helmet } from 'react-helmet'; // Importer Helmet
import './Home.css';

const Home = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('visa');

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  // Données d'exemple avec format de date et nom de commande modifié
  const ordersVisa = [
    { id: 1, date: '01/08/2024', orderNumber: 'O-06789/24', designation: 'Produit A' },
    { id: 2, date: '02/08/2024', orderNumber: 'O-06779/24', designation: 'Produit B' },
    { id: 3, date: '03/08/2024', orderNumber: 'O-06799/24', designation: 'Produit C' },
  ];

  const ordersPayment = [
    { id: 1, date: '01/08/2024', orderNumber: 'O-06759/24', invoiceNumber: '', designation: 'Produit C', validationDate: '05/08/2024' },
    { id: 2, date: '03/08/2024', orderNumber: 'O-06749/24', invoiceNumber: '', designation: 'Produit D', validationDate: '06/08/2024' },
  ];

  const ordersValidation = [
    { id: 1, date: '01/08/2024', orderNumber: 'O-06791/24', designation: 'Produit E', submissionDate: '02/08/2024' },
    { id: 2, date: '04/08/2024', orderNumber: 'O-06793/24', designation: 'Produit F', submissionDate: '05/08/2024' },
    { id: 3, date: '06/08/2024', orderNumber: 'O-06734/24', designation: 'Produit G', submissionDate: '07/08/2024' },
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
          <FontAwesomeIcon icon={faClipboardList} className="tab-icon" /> Mes commandes à soumettre ({ordersVisa.length})
        </div>
        <div
          className={`tab-item ${activeTab === 'validation' ? 'active' : ''}`}
          onClick={() => handleTabClick('validation')}
        >
          <FontAwesomeIcon icon={faCheckCircle} className="tab-icon" /> Mes commandes en attente de la CCD ({ordersValidation.length})
        </div>
        <div
          className={`tab-item ${activeTab === 'payment' ? 'active' : ''}`}
          onClick={() => handleTabClick('payment')}
        >
          <FontAwesomeIcon icon={faDollarSign} className="tab-icon" /> Mes commandes en attente de paiement ({ordersPayment.length})
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
                  <th></th> {/* En-tête vide pour le bouton Soumettre */}
                </tr>
              </thead>
              <tbody>
                {ordersVisa.map((order) => (
                  <tr key={order.id}>
                    <td>{order.date}</td>
                    <td>{order.orderNumber}</td>
                    <td>{order.designation}</td>
                    <td>
                      {/* Certificat d'Origine */}
                      {order.id === 2 || order.id === 3 ? (
                        <button className="small-button"><FontAwesomeIcon icon={faPlus} /> Ajouter</button>
                      ) : (
                        <>
                          <button className="small-button"><FontAwesomeIcon icon={faPen} /> Modifier</button>
                          <button className="small-button delete-button"><FontAwesomeIcon icon={faTimes} /> Supprimer</button>
                        </>
                      )}
                    </td>
                    <td>
                      {/* Facture Commerciale */}
                      {order.id === 3 ? (
                        <>
                          <button className="small-button"><FontAwesomeIcon icon={faPen} /> Modifier</button>
                          <button className="small-button delete-button"><FontAwesomeIcon icon={faTimes} /> Supprimer</button>
                        </>
                      ) : (
                        <button className="small-button"><FontAwesomeIcon icon={faPlus} /> Ajouter</button>
                      )}
                    </td>
                    <td>
                      {/* Législation */}
                      {order.id === 3 ? (
                        <button className="small-button"><FontAwesomeIcon icon={faPlus} /> Ajouter</button>
                      ) : (
                        <>
                          <button className="small-button"><FontAwesomeIcon icon={faPen} /> Modifier</button>
                          <button className="small-button delete-button"><FontAwesomeIcon icon={faTimes} /> Supprimer</button>
                        </>
                      )}
                    </td>
                    <td>
                      <button className="submit-button">Soumettre</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                      <button className="small-button"><FontAwesomeIcon icon={faEye} /> Voir</button>
                    </td>
                    <td></td> {/* Colonne vide pour Facture Commerciale */}
                    <td>
                      <button className="small-button"><FontAwesomeIcon icon={faEye} /> Voir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                      <button className="small-button"><FontAwesomeIcon icon={faEye} /> Voir</button>
                    </td>
                    <td></td> {/* Colonne vide pour Facture Commerciale */}
                    <td>
                      <button className="small-button"><FontAwesomeIcon icon={faEye} /> Voir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
