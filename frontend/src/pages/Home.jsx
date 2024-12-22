// Home.jsx
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

import { useSelector } from 'react-redux';

const Home = () => {
  const [activeTab, setActiveTab] = useState('visa');


  const user = useSelector((state) => state.auth.user);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleDropdownChange = (e) => {
    setActiveTab(e.target.value);
  };

  // Déclarez les données avant de définir les options
  const ordersVisa = [
    { id: 1, date: '01/08/2024', orderNumber: 'O-06789/24', designation: 'Produit A' },
    { id: 2, date: '02/08/2024', orderNumber: 'O-06779/24', designation: 'Produit B' },
    { id: 3, date: '27/10/2024', orderNumber: '', designation: 'Produit C' },
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

  // Définissez les options après la déclaration des données
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

  console.log(user);

  return (
    <div className="home-container">
      <Helmet>
        <title>Dashboard</title>
      </Helmet>
      <div className="home-welcome-message">
        Bienvenue <span className="home-highlight-text">{user?.companyname}</span>
      </div>

      {/* Dropdown visible uniquement sur mobile */}
      <div className="home-dropdown-container">
        <select
          className="home-dropdown"
          value={activeTab}
          onChange={handleDropdownChange}
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              title={option.title} // Affiche le texte complet au survol
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Onglets visibles uniquement sur desktop */}
      <div className="home-tabs-container">
        <div
          className={`home-tab-item ${activeTab === 'visa' ? 'home-active' : ''}`}
          onClick={() => handleTabClick('visa')}
        >
          <FontAwesomeIcon icon={faClipboardList} className="home-tab-icon" /> Mes commandes à soumettre ({ordersVisa.length})
        </div>
        <div
          className={`home-tab-item ${activeTab === 'validation' ? 'home-active' : ''}`}
          onClick={() => handleTabClick('validation')}
        >
          <FontAwesomeIcon icon={faCheckCircle} className="home-tab-icon" /> Mes commandes en attente de la CCD ({ordersValidation.length})
        </div>
        <div
          className={`home-tab-item ${activeTab === 'payment' ? 'home-active' : ''}`}
          onClick={() => handleTabClick('payment')}
        >
          <FontAwesomeIcon icon={faDollarSign} className="home-tab-icon" /> Mes commandes en attente de paiement ({ordersPayment.length})
        </div>
      </div>

      <div className="home-dashboard-grid">
        {/* Commandes en attente de Visa */}
        {activeTab === 'visa' && (
          <div className="home-dashboard-item">
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
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {ordersVisa.map((order) => (
                    <tr key={order.id}>
                      <td>{order.date}</td>
                      <td>{order.orderNumber || '-'}</td>
                      <td>{order.designation}</td>
                      <td>
                        {order.id === 2 || order.id === 3 ? (
                          <button className="home-icon-button home-minimal-button" title="Ajouter">
                            <FontAwesomeIcon icon={faPlus} />
                          </button>
                        ) : (
                          <div className="home-icon-button-group">
                            <button className="home-icon-button home-minimal-button" title="Modifier">
                              <FontAwesomeIcon icon={faPen} />
                            </button>
                            <button className="home-icon-button home-delete-button home-minimal-button" title="Supprimer">
                              <FontAwesomeIcon icon={faTimes} />
                            </button>
                          </div>
                        )}
                      </td>
                      <td>
                        {order.id === 3 ? (
                          <div className="home-icon-button-group">
                            <button className="home-icon-button home-minimal-button" title="Modifier">
                              <FontAwesomeIcon icon={faPen} />
                            </button>
                            <button className="home-icon-button home-delete-button home-minimal-button" title="Supprimer">
                              <FontAwesomeIcon icon={faTimes} />
                            </button>
                          </div>
                        ) : (
                          <button className="home-icon-button home-minimal-button" title="Ajouter">
                            <FontAwesomeIcon icon={faPlus} />
                          </button>
                        )}
                      </td>
                      <td>
                        {order.id === 3 ? (
                          <button className="home-icon-button home-minimal-button" title="Ajouter">
                            <FontAwesomeIcon icon={faPlus} />
                          </button>
                        ) : (
                          <div className="home-icon-button-group">
                            <button className="home-icon-button home-minimal-button" title="Modifier">
                              <FontAwesomeIcon icon={faPen} />
                            </button>
                            <button className="home-icon-button home-delete-button home-minimal-button" title="Supprimer">
                              <FontAwesomeIcon icon={faTimes} />
                            </button>
                          </div>
                        )}
                      </td>
                      <td>
                        <button className="home-submit-button home-minimal-button">Soumettre</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Commandes en attente de validation */}
        {activeTab === 'validation' && (
          <div className="home-dashboard-item">
            <div className="home-dashboard-table-container">
              <table className="home-dashboard-table">
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
                      <td>{order.orderNumber || '-'}</td>
                      <td>{order.designation}</td>
                      <td>{order.submissionDate}</td>
                      <td>
                        <button className="home-icon-button home-minimal-button" title="Voir">
                          <FontAwesomeIcon icon={faEye} />
                          <span className="home-button-text">Détails</span>
                        </button>
                      </td>
                      <td></td>
                      <td>
                        <button className="home-icon-button home-minimal-button" title="Voir">
                          <FontAwesomeIcon icon={faEye} />
                          <span className="home-button-text">Détails</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Commandes en attente de paiement */}
        {activeTab === 'payment' && (
          <div className="home-dashboard-item">
            <div className="home-dashboard-table-container">
              <table className="home-dashboard-table">
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
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {ordersPayment.map((order) => (
                    <tr key={order.id}>
                      <td>{order.date}</td>
                      <td>{order.orderNumber || '-'}</td>
                      <td>{order.invoiceNumber || '-'}</td>
                      <td>{order.designation}</td>
                      <td>{order.validationDate}</td>
                      <td>
                        <button className="home-icon-button home-minimal-button" title="Voir">
                          <FontAwesomeIcon icon={faEye} />
                          <span className="home-button-text">Détails</span>
                        </button>
                      </td>
                      <td></td>
                      <td>
                        <button className="home-icon-button home-minimal-button" title="Voir">
                          <FontAwesomeIcon icon={faEye} />
                          <span className="home-button-text">Détails</span>
                        </button>
                      </td>
                      <td>
                        <button className="home-submit-button home-minimal-button">Payer</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
