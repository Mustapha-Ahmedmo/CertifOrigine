import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList,
  faDollarSign,
  faCheckCircle,
  faPen,
  faPlus,
  faEye,
} from '@fortawesome/free-solid-svg-icons';
import { Helmet } from 'react-helmet';
import './HomeOperateur.css';
import Step5 from '../components/orders/Create/steps/Step5';
import ClientProfile from '../pages/ClientProfile';

const HomeOperateur = () => {
  const [activeTab, setActiveTab] = useState('visa');
  const [activeInscriptionsTab, setActiveInscriptionsTab] = useState('newRegistrations');
  const [showModal, setShowModal] = useState(false);
  const [modalValues, setModalValues] = useState(null);
  const [showSecondModal, setShowSecondModal] = useState(false);
  const [secondModalContent, setSecondModalContent] = useState(null);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleInscriptionsTabClick = (tab) => {
    setActiveInscriptionsTab(tab);
  };

  const openModal = (values) => {
    setModalValues(values);
    setShowModal(true);
  };

  const closeModal = () => {
    setModalValues(null);
    setShowModal(false);
  };

  const openSecondModal = (clientData) => {
    setSecondModalContent(clientData);
    setShowModal(false);
    setShowSecondModal(true);
  };

  const closeSecondModal = () => {
    setSecondModalContent(null);
    setShowSecondModal(false);
  };

  // Données exemple
  const ordersVisa = [
    {
      id: 1,
      date: '01/08/2024',
      orderNumber: 'O-06789/24',
      client: 'INDIGO TRADING FZCO',
      designation: 'Pneu Bridgestone',
      submissionDate: '02/08/2024',
      values: {
        exporterName: 'INDIGO TRADING FZCO SARL',
        exporterAddress: 'DJIBOUTI FREE ZONE Po Box 2520',
        exporterAddress2: 'REP. DE DJIBOUTI',
        exporterActivity: 'Construction ',
        exporterStatut: 'Actif ',
        exporterContact: 'M. Vladimir Outof\nManager\noutof@indigotrading.ru\nTel: +253-77 016463',
        orderLabel: 'Pneu Bridgestone',
        receiverName: 'Good Construction Private Limited',
        receiverAddress: 'Jackros, Gerji',
        receiverCity: 'Addis Ababa',
        receiverPostalCode: '75001',
        receiverCountry: 'Ethiopie',
        receiverPhone: '+251-11 646 3290',
        goodsOrigin: 'Emirates Arabes Unis',
        goodsDestination: 'Ethiopie',
        transportModes: { air: false, mer: false, terre: true, multimodal: false },
        transportRemarks: 'Transport urgent.',
        merchandises: [
          { designation: 'Produit A', boxReference: 'REF001', quantity: 10, unit: 'Kg' },
          { designation: 'Produit B', boxReference: 'REF002', quantity: 5, unit: 'L' },
        ],
        copies: 1,
        remarks: 'Commande prioritaire.',
        isCommitted: true,
        documents: [
          { name: 'Borderau_changement.pdf', type: 'justificative', remarks: 'Facture originale', file: null },
        ],
      },
    },
  ];

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

  // Options dropdown COMMANDES (mobile)
  const commandsOptions = [
    {
      value: 'visa',
      label: `Mes commandes à soumettre (${ordersVisa.length})`,
    },
    {
      value: 'validation',
      label: `Mes commandes en attente de la CCD (${ordersValidation.length})`,
    },
    {
      value: 'payment',
      label: `Mes commandes en attente de paiement (${ordersPayment.length})`,
    },
  ];

  // Options dropdown INSCRIPTIONS (mobile)
  const inscriptionsOptions = [
    {
      value: 'newRegistrations',
      label: 'Nouvelles Inscriptions',
    },
    {
      value: 'additionalRequest',
      label: 'Demande de complément',
    },
  ];

  const handleCommandsDropdownChange = (e) => {
    setActiveTab(e.target.value);
  };

  const handleInscriptionsDropdownChange = (e) => {
    setActiveInscriptionsTab(e.target.value);
  };

  return (
    <div className="home-operator-container">
      <Helmet>
        <title>Dashboard Opérateur</title>
      </Helmet>

      <div className="welcome-message">Bienvenue M. Abdourhaman Abdi Ali</div>

      {/* Section COMMANDES */}
      <div className="commands-title highlight-text">COMMANDES</div>

      {/* Dropdown mobile pour COMMANDES */}
      <div className="commands-dropdown-container">
        <select className="commands-dropdown" value={activeTab} onChange={handleCommandsDropdownChange}>
          {commandsOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Tabs desktop pour COMMANDES */}
      <div className="tabs-container commands-tabs-container">
        <div
          className={`tab-item ${activeTab === 'visa' ? 'active' : ''}`}
          onClick={() => handleTabClick('visa')}
        >
          <FontAwesomeIcon icon={faClipboardList} className="tab-icon" /> 
          Mes commandes à soumettre ({ordersVisa.length})
        </div>
        <div
          className={`tab-item ${activeTab === 'validation' ? 'active' : ''}`}
          onClick={() => handleTabClick('validation')}
        >
          <FontAwesomeIcon icon={faCheckCircle} className="tab-icon" /> 
          Mes commandes en attente de la CCD ({ordersValidation.length})
        </div>
        <div
          className={`tab-item ${activeTab === 'payment' ? 'active' : ''}`}
          onClick={() => handleTabClick('payment')}
        >
          <FontAwesomeIcon icon={faDollarSign} className="tab-icon" /> 
          Mes commandes en attente de paiement ({ordersPayment.length})
        </div>
      </div>

      <div className="dashboard-grid">
        {activeTab === 'visa' && (
          <div className="dashboard-item">
            <div className="dashboard-table-container">
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
                        <button
                          className="icon-button minimal-button"
                          onClick={() => openModal(order.values)}
                        >
                          <FontAwesomeIcon icon={faEye} title="Vérifier" />
                          <span className="button-text">Vérifier</span>
                        </button>
                      </td>
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
          </div>
        )}

        {activeTab === 'validation' && ordersValidation.length > 0 && (
          <div className="dashboard-item">
            {/* Exemple si vous aviez un tableau ici, vous le mettriez dans une dashboard-table-container */}
          </div>
        )}

        {activeTab === 'payment' && (
          <div className="dashboard-item">
            <div className="dashboard-table-container">
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
                        <button
                          className="icon-button minimal-button"
                          onClick={() => openModal(order.details)}
                        >
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
          </div>
        )}
      </div>

      {/* Section INSCRIPTIONS */}
      <div className="inscriptions-title highlight-text">INSCRIPTIONS</div>

      {/* Dropdown mobile pour INSCRIPTIONS */}
      <div className="inscriptions-dropdown-container">
        <select className="inscriptions-dropdown" value={activeInscriptionsTab} onChange={handleInscriptionsDropdownChange}>
          {inscriptionsOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Tabs desktop pour INSCRIPTIONS */}
      <div className="tabs-container inscriptions-tabs-container">
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
        {activeInscriptionsTab === 'newRegistrations' && (
          <div className="dashboard-item">
            <div className="dashboard-table-container">
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
                        {registration.documents.map((doc, index) => (
                          <div key={index}>
                            <a href={doc.link} download>
                              {doc.name}
                            </a>
                          </div>
                        ))}
                      </td>
                      <td>{registration.contactPrincipal}</td>
                      <td>{registration.fonction}</td>
                      <td>{registration.email}</td>
                      <td>{registration.numTel}</td>
                      <td>{registration.numPortable}</td>
                      <td>
                        <button className="validate-button">Valider</button>
                        <button className="reject-button">Rejeter</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal principal */}
      {showModal && modalValues && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <Step5
              values={modalValues}
              isModal={true}
              handleSubmit={() => console.log('Soumis')}
              openSecondModal={openSecondModal}
            />

            <div className="modal-actions">
              <button onClick={() => console.log('Rejeté')} className="reject-button">
                Rejeter
              </button>
              <button onClick={() => console.log('Validé')} className="validate-button">
                Valider
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal secondaire */}
      {showSecondModal && secondModalContent && (
        <div className="modal-overlay" onClick={closeSecondModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <ClientProfile clientData={secondModalContent} closeModal={closeSecondModal} />
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeOperateur;
