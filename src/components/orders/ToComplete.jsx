import React, { useState } from 'react';
import './ToComplete.css';

const ToComplete = () => {
  // Exemple de données pour les commandes
  const initialOrders = [
    { id: 1, numeroCommande: 'CMD-001', dateTransmission: '2024-08-01', dateLivraison: '2024-08-05', destinataire: 'Entreprise Alpha', numeroFacture: 'FACT-001', montant: '150.75 DJF', modePaiement: 'Carte de Crédit', statut: 'Incomplète' },
    { id: 2, numeroCommande: 'CMD-002', dateTransmission: '2024-08-02', dateLivraison: '2024-08-06', destinataire: 'Entreprise Beta', numeroFacture: 'FACT-002', montant: '230.50 DJF', modePaiement: 'PayPal', statut: 'En attente' },
    { id: 3, numeroCommande: 'CMD-003', dateTransmission: '2024-08-03', dateLivraison: '2024-08-07', destinataire: 'Entreprise Gamma', numeroFacture: 'FACT-003', montant: '99.99 DJF', modePaiement: 'Virement Bancaire', statut: 'Incomplète' },
    { id: 4, numeroCommande: 'CMD-004', dateTransmission: '2024-08-04', dateLivraison: '2024-08-08', destinataire: 'Entreprise Delta', numeroFacture: 'FACT-004', montant: '320.00 DJF', modePaiement: 'Carte de Crédit', statut: 'En attente' },
    { id: 5, numeroCommande: 'CMD-005', dateTransmission: '2024-08-05', dateLivraison: '2024-08-09', destinataire: 'Entreprise Epsilon', numeroFacture: 'FACT-005', montant: '175.20 DJF', modePaiement: 'Carte de Crédit', statut: 'Incomplète' },
    { id: 6, numeroCommande: 'CMD-006', dateTransmission: '2024-08-06', dateLivraison: '2024-08-10', destinataire: 'Entreprise Zeta', numeroFacture: 'FACT-006', montant: '420.89 DJF', modePaiement: 'PayPal', statut: 'En Incomplète' },
    // Ajoutez plus de lignes si nécessaire...
  ];

  const [orders, setOrders] = useState(initialOrders);

  return (
    <div className="to-complete-container">
      {/* Ajout de l'indication en haut à gauche */}
      <div className="page-info">
        <h1>Commandes à compléter</h1>
      </div>

      <table className="to-complete-table">
        <thead>
          <tr>
            <th>Numéro de commande</th>
            <th>Date de transmission</th>
            <th>Date de livraison</th>
            <th>Destinataire</th>
            <th>Numéro de facture</th>
            <th>Montant</th>
            <th>Mode de paiement</th>
            <th>Statut</th>
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
              <td>{order.modePaiement}</td>
              <td>
                <span className="status-dot"></span>
                {order.statut}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ToComplete;
