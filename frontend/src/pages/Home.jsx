import React, { useState } from 'react';
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
import { Helmet } from 'react-helmet';
import './Home.css';

const Home = () => {
  const [activeTab, setActiveTab] = useState('visa');

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  // Données d'exemple
  const ordersVisa = [
    { id: 1, date: '01/08/2024', orderNumber: 'O-06789/24', designation: 'Produit A' },
    { id: 2, date: '02/08/2024', orderNumber: 'O-06779/24', designation: 'Produit B' },
    { id: 3, date: '27/10/2024', orderNumber: '', designation: 'Produit C' },
  ];

  const ordersPayment = [
    {
      id: 1,
      date: '01/08/2024',
      orderNumber: 'O-06759/24',
      invoiceNumber: '',
      designation: 'Produit C',
      validationDate: '05/08/2024',
    },
    {
      id: 2,
      date: '03/08/2024',
      orderNumber: 'O-06749/24',
      invoiceNumber: '',
      designation: 'Produit D',
      validationDate: '06/08/2024',
    },
  ];

  const ordersValidation = [
    {
      id: 1,
      date: '01/08/2024',
      orderNumber: 'O-06791/24',
      designation: 'Produit E',
      submissionDate: '02/08/2024',
    },
    {
      id: 2,
      date: '04/08/2024',
      orderNumber: 'O-06793/24',
      designation: 'Produit F',
      submissionDate: '05/08/2024',
    },
    {
      id: 3,
      date: '06/08/2024',
      orderNumber: 'O-06734/24',
      designation: 'Produit G',
      submissionDate: '07/08/2024',
    },
  ];

  return (
    <div className="home-container">
      <Helmet>
        <title>Dashboard</title>
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
                        <button className="icon-button minimal-button">
                          <FontAwesomeIcon icon={faPlus} title="Ajouter" />
                        </button>
                      ) : (
                        <div className="icon-button-group">
                          <button className="icon-button minimal-button">
                            <FontAwesomeIcon icon={faPen} title="Modifier" />
                          </button>
                          <button className="icon-button delete-button minimal-button">
                            <FontAwesomeIcon icon={faTimes} title="Supprimer" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td>
                      {/* Facture Commerciale */}
                      {order.id === 3 ? (
                        <div className="icon-button-group">
                          <button className="icon-button minimal-button">
                            <FontAwesomeIcon icon={faPen} title="Modifier" />
                          </button>
                          <button className="icon-button delete-button minimal-button">
                            <FontAwesomeIcon icon={faTimes} title="Supprimer" />
                          </button>
                        </div>
                      ) : (
                        <button className="icon-button minimal-button">
                          <FontAwesomeIcon icon={faPlus} title="Ajouter" />
                        </button>
                      )}
                    </td>
                    <td>
                      {/* Législation */}
                      {order.id === 3 ? (
                        <button className="icon-button minimal-button">
                          <FontAwesomeIcon icon={faPlus} title="Ajouter" />
                        </button>
                      ) : (
                        <div className="icon-button-group">
                          <button className="icon-button minimal-button">
                            <FontAwesomeIcon icon={faPen} title="Modifier" />
                          </button>
                          <button className="icon-button delete-button minimal-button">
                            <FontAwesomeIcon icon={faTimes} title="Supprimer" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td>
                      <button className="submit-button minimal-button">Soumettre</button>
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
                      <button className="icon-button minimal-button">
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
                  <th></th> {/* En-tête vide pour le nouveau bouton */}
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
                      <button className="icon-button minimal-button">
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
                      {/* Nouveau bouton */}
                      <button className="submit-button minimal-button">Payer</button>
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
