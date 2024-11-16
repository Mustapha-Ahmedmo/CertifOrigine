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
import './HomeOperateur.css';

const HomeOperateur = () => {
  const [activeTab, setActiveTab] = useState('visa');
  const [activeInscriptionsTab, setActiveInscriptionsTab] = useState('newRegistrations');

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleInscriptionsTabClick = (tab) => {
    setActiveInscriptionsTab(tab);
  };

  // Données d'exemple
  const ordersVisa = [
    {
      id: 1,
      date: '01/08/2024',
      orderNumber: 'O-06789/24',
      client: 'INDIGO TRADING FZCO',
      designation: 'Produit A',
      submissionDate: '02/08/2024',
    },
  ];

  // Tableau vide pour les commandes en cours de traitement
  const ordersValidation = [];

  const ordersPayment = [
    {
      id: 1,
      date: '14/10/2024',
      orderNumber: 'O-06789/24',
      client: 'INDIGO TRADING FZCO',
      invoiceNumber: 'F-3993/24',
      designation: 'Produit G',
      validationDate: '16/10/2024',
    },
  ];

  const newRegistrations = [
    {
      id: 1,
      date: '14/10/2024',
      category: 'SAS',
      client: 'INDIGO TRADING FZCO',
      licenceZF: 'ZF-00123',
      // Ajout de faux documents à télécharger
      documents: [
        { name: 'Document1.pdf', link: '#' },
        { name: 'Document2.pdf', link: '#' },
      ],
      contactPrincipal: 'Yusuf Daher',
      fonction: 'Directeur Général',
      email: 'indiotr@gmail.com',
      numTel: '0123456789',
      numPortable: '0698765432',
    },
  ];

  return (
    <div className="home-operator-container">
      <Helmet>
        <title>Dashboard Opérateur</title>
      </Helmet>

      {/* Section COMMANDES */}
      <div className="commands-title highlight-text">COMMANDES</div>
      <div className="tabs-container">
        <div
          className={`tab-item ${activeTab === 'visa' ? 'active' : ''}`}
          onClick={() => handleTabClick('visa')}
        >
          <FontAwesomeIcon icon={faClipboardList} className="tab-icon" /> Nouvelles commandes
          {ordersVisa.length > 0 ? ` (${ordersVisa.length})` : ''}
        </div>
        <div
          className={`tab-item ${activeTab === 'validation' ? 'active' : ''}`}
          onClick={() => handleTabClick('validation')}
        >
          <FontAwesomeIcon icon={faCheckCircle} className="tab-icon" /> En cours de traitement
          {ordersValidation.length > 0 ? ` (${ordersValidation.length})` : ''}
        </div>
        <div
          className={`tab-item ${activeTab === 'payment' ? 'active' : ''}`}
          onClick={() => handleTabClick('payment')}
        >
          <FontAwesomeIcon icon={faDollarSign} className="tab-icon" /> En attente de paiement
          {ordersPayment.length > 0 ? ` (${ordersPayment.length})` : ''}
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
                  <th>Client</th>
                  <th>Désignation</th>
                  <th>Date soumission</th>
                  <th>Certificat d'Origine</th>
                  <th>Facture Commerciale</th>
                  <th>Légalisations</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {ordersVisa.map((order) => (
                  <tr key={order.id}>
                    <td>{order.date}</td>
                    <td>{order.orderNumber}</td>
                    <td>{order.client}</td>
                    <td>{order.designation}</td>
                    <td>{order.submissionDate}</td>
                    <td>
                      <button className="icon-button minimal-button">
                        <FontAwesomeIcon icon={faEye} title="Vérifier" />
                        <span className="button-text">Vérifier</span>
                      </button>
                    </td>
                    {/* Suppression du bouton "+" dans la colonne "Facture Commerciale" */}
                    <td></td>
                    <td>
                      <button className="icon-button minimal-button">
                        <FontAwesomeIcon icon={faEye} title="Vérifier" />
                        <span className="button-text">Vérifier</span>
                      </button>
                    </td>
                    <td>
                      <button className="submit-button minimal-button">Facturer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Commandes en attente de validation */}
        {activeTab === 'validation' && ordersValidation.length > 0 && (
          <div className="dashboard-item">
            {/* Contenu du tableau pour les commandes en cours de traitement */}
          </div>
        )}

        {/* Commandes en attente de paiement */}
        {activeTab === 'payment' && (
          <div className="dashboard-item">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>N° de commande</th>
                  <th>Client</th>
                  <th>N° de facture</th>
                  <th>Désignation</th>
                  <th>Date de validation</th>
                  <th>Certificat d'origine</th>
                  <th>Facture Commerciale</th>
                  <th>Légalisation</th>
                  <th></th> {/* Colonne pour le bouton Payer */}
                </tr>
              </thead>
              <tbody>
                {ordersPayment.map((order) => (
                  <tr key={order.id}>
                    <td>{order.date}</td>
                    <td>{order.orderNumber}</td>
                    <td>{order.client}</td>
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
                      {/* Nouveau bouton Payer */}
                      <button className="submit-button minimal-button">Payer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section INSCRIPTIONS */}
      <div className="inscriptions-title highlight-text">INSCRIPTIONS</div>
      <div className="tabs-container">
        <div
          className={`tab-item ${activeInscriptionsTab === 'newRegistrations' ? 'active' : ''}`}
          onClick={() => handleInscriptionsTabClick('newRegistrations')}
        >
          <FontAwesomeIcon icon={faPlus} className="tab-icon" /> Nouvelles Inscriptions
        </div>
        <div
          className={`tab-item ${activeInscriptionsTab === 'additionalRequest' ? 'active' : ''}`}
          onClick={() => handleInscriptionsTabClick('additionalRequest')}
        >
          <FontAwesomeIcon icon={faPen} className="tab-icon" /> Demande de complément
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Nouvelles Inscriptions */}
        {activeInscriptionsTab === 'newRegistrations' && (
          <div className="dashboard-item">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Catégorie</th>
                  <th>Client</th>
                  <th>Licence ZF</th>
                  <th>Autres</th>
                  <th>Contact Principal</th>
                  <th>Fonction</th>
                  <th>E-mail</th>
                  <th>Num. tel</th>
                  <th>N° portable</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {newRegistrations.map((registration) => (
                  <tr key={registration.id}>
                    <td>{registration.date}</td>
                    <td>{registration.category}</td>
                    <td>{registration.client}</td>
                    <td>
                      <button className="icon-button minimal-button">
                        <FontAwesomeIcon icon={faEye} title="Ouvrir" />
                        <span className="button-text">Ouvrir</span>
                      </button>
                    </td>
                    <td>
                      {registration.documents && registration.documents.length > 0 ? (
                        registration.documents.map((doc, index) => (
                          <div key={index}>
                            <a href={doc.link} download>
                              {doc.name}
                            </a>
                          </div>
                        ))
                      ) : (
                        'Aucun document'
                      )}
                    </td>
                    <td>{registration.contactPrincipal}</td>
                    <td>{registration.fonction}</td>
                    <td>{registration.email}</td>
                    <td>{registration.numTel}</td>
                    <td>{registration.numPortable}</td>
                    <td>
                      <button className="submit-button minimal-button">Valider</button>
                      <button className="submit-button minimal-button reject-button">Rejeter</button>
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

export default HomeOperateur;
