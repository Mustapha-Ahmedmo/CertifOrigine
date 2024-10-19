import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import './ToValidateOP.css';

const ToValidateOP = () => {
  // Exemple de données pour les commandes
  const initialOrders = [
    {
      id: 1,
      numeroCommande: 'CMD-001',
      client: 'Client A (Alpha Industries)',
      dateTransmission: '2024-08-01',
      destinataire: 'Entreprise Alpha',
      numeroFacture: 'FACT-001',
      montant: '150.75 DJF',
      statut: 'En attente',
      listeMarchandises: 'Marchandise A',
      origine: 'France',
      modeTransport: 'Route',
      nombreCopie: 2,
    },
    {
      id: 2,
      numeroCommande: 'CMD-002',
      client: 'Client B (Beta Corp)',
      dateTransmission: '2024-08-02',
      destinataire: 'Entreprise Beta',
      numeroFacture: 'FACT-002',
      montant: '230.50 DJF',
      statut: 'En attente',
      listeMarchandises: 'Marchandise B',
      origine: 'Allemagne',
      modeTransport: 'Mer',
      nombreCopie: 1,
    },
    {
      id: 3,
      numeroCommande: 'CMD-003',
      client: 'Client C (Gamma LLC)',
      dateTransmission: '2024-08-03',
      destinataire: 'Entreprise Gamma',
      numeroFacture: 'FACT-003',
      montant: '300.00 DJF',
      statut: 'En attente',
      listeMarchandises: 'Marchandise C',
      origine: 'Espagne',
      modeTransport: 'Air',
      nombreCopie: 3,
    },
  ];

  const [orders, setOrders] = useState(initialOrders);

  // Fonctions pour gérer les actions de validation et de refus
  const handleValidate = (id) => {
    console.log(`Commande ${id} validée`);
  };

  const handleReject = (id) => {
    console.log(`Commande ${id} refusée`);
  };

  return (
    <div className="to-validate-op-container">
      <div className="page-info">
        <h1>Commandes à valider</h1>
      </div>

      <table className="to-validate-op-table">
        <thead>
          <tr>
            <th>Numéro de commande</th>
            <th>Client</th>
            <th>Date de transmission</th>
            <th>Destinataire</th>
            <th>Numéro de facture</th>
            <th>Montant</th>
            <th>Statut</th>
            <th>Liste des marchandises</th>
            <th>Origine de la marchandise</th>
            <th>Modes de transport</th>
            <th>Nombre de copie certifié</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.numeroCommande}</td>
              <td>{order.client}</td>
              <td>{order.dateTransmission}</td>
              <td>{order.destinataire}</td>
              <td>{order.numeroFacture}</td>
              <td>{order.montant}</td>
              <td>
                <span className="status-dot"></span>
                {order.statut}
              </td>
              <td>{order.listeMarchandises}</td>
              <td>{order.origine}</td>
              <td>{order.modeTransport}</td>
              <td>{order.nombreCopie}</td>
              <td className="to-validate-action-buttons">
                <button className="to-validate-action-button validate-button" onClick={() => handleValidate(order.id)}>
                  <FontAwesomeIcon icon={faCheckCircle} /> Valider
                </button>
                <button className="to-validate-action-button reject-button" onClick={() => handleReject(order.id)}>
                  <FontAwesomeIcon icon={faTimesCircle} /> Refuser
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ToValidateOP;
