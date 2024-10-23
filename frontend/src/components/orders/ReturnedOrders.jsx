import React, { useState } from 'react';
import './ReturnedOrders.css';

const ReturnedOrders = () => {
  const initialOrders = [
    { id: 1, numeroCommande: 'CMD-001', dateTransmission: '2024-08-01', dateRetour: '2024-08-10', destinataire: 'Entreprise Alpha', numeroFacture: 'FACT-001', montant: '150.75 DJF', raison: 'Produit endommagé' },
    { id: 2, numeroCommande: 'CMD-002', dateTransmission: '2024-08-02', dateRetour: '2024-08-12', destinataire: 'Entreprise Beta', numeroFacture: 'FACT-002', montant: '230.50 DJF', raison: 'Article incorrect expédié' },
    // Ajoutez plus de commandes si nécessaire...
  ];

  const [orders, setOrders] = useState(initialOrders);

  const handleEdit = (id) => {
    console.log(`Edit order ${id}`);
    // Ajoutez ici votre logique d'édition
  };

  return (
    <div className="returned-orders-container">
      <div className="page-info">
        <h1>Commandes retournées</h1>
      </div>

      <table className="returned-orders-table">
        <thead>
          <tr>
            <th>Numéro de commande</th>
            <th>Date de transmission</th>
            <th>Date de retour</th>
            <th>Destinataire</th>
            <th>Numéro de facture</th>
            <th>Montant</th>
            <th>Raison du retour</th>
            <th>Actions</th> {/* Nouvelle colonne Actions */}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.numeroCommande}</td>
              <td>{order.dateTransmission}</td>
              <td>{order.dateRetour}</td>
              <td>{order.destinataire}</td>
              <td>{order.numeroFacture}</td>
              <td>{order.montant}</td>
              <td>{order.raison}</td>
              <td>
                <button className="edit-button" onClick={() => handleEdit(order.id)}>Éditer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReturnedOrders;
