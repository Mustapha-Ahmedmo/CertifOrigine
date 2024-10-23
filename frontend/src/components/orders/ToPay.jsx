import React, { useState } from 'react';
import './ToPay.css';

const ToPay = () => {
  // Exemple de données pour les commandes
  const initialOrders = [
    {
      id: 1,
      numeroCommande: 'CMD-001',
      dateTransmission: '2024-08-01',
      dateLivraison: '2024-08-05',
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
      dateTransmission: '2024-08-02',
      dateLivraison: '2024-08-06',
      destinataire: 'Entreprise Beta',
      numeroFacture: 'FACT-002',
      montant: '230.50 DJF',
      statut: 'En attente',
      listeMarchandises: 'Marchandise B',
      origine: 'Allemagne',
      modeTransport: 'Mer',
      nombreCopie: 1,
    },
    // Ajoutez plus de commandes si nécessaire...
  ];

  const [orders, setOrders] = useState(initialOrders);

  return (
    <div className="to-pay-container">
      {/* Ajout de l'indication en haut à gauche */}
      <div className="page-info">
        <h1>Commandes à payer</h1>
      </div>

      <table className="to-pay-table">
        <thead>
          <tr>
            <th>Numéro de commande</th>
            <th>Date de transmission</th>
            <th>Date de livraison</th>
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
              <td>{order.dateTransmission}</td>
              <td>{order.dateLivraison}</td>
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
              <td>
                <button className="pay-button">Payer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ToPay;
