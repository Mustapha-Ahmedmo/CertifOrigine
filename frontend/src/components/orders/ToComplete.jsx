import React, { useState } from 'react';
import './ToComplete.css';

const ToComplete = () => {
  // Exemple de données pour les commandes
  const initialOrders = [
    { id: 1, numeroCommande: 'CMD-001', dateTransmission: '2024-08-01', dateLivraison: '2024-08-05', destinataire: 'Entreprise Alpha', numeroFacture: 'FACT-001', montant: '150.75 DJF', statut: 'Incomplète', listeMarchandises: 'Marchandise A', origine: 'France', modeTransport: 'Route', nombreCopie: 2 },
    { id: 2, numeroCommande: 'CMD-002', dateTransmission: '2024-08-02', dateLivraison: '2024-08-06', destinataire: 'Entreprise Beta', numeroFacture: 'FACT-002', montant: '230.50 DJF', statut: 'En attente', listeMarchandises: 'Marchandise B', origine: 'Allemagne', modeTransport: 'Mer', nombreCopie: 1 },
    // Ajoutez plus de commandes si nécessaire...
  ];

  const [orders, setOrders] = useState(initialOrders);

  const handleEdit = (id) => {
    console.log(`Edit order ${id}`);
    // Ajoutez ici votre logique d'édition
  };

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
            <th>Statut</th>
            <th>Liste des marchandises</th>
            <th>Origine de la marchandise</th>
            <th>Modes de transport</th>
            <th>Nombre de copie certifié</th>
            <th>Actions</th> {/* Nouvelle colonne Actions */}
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
                <button className="edit-button" onClick={() => handleEdit(order.id)}>Éditer</button> {/* Bouton Éditer */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ToComplete;
