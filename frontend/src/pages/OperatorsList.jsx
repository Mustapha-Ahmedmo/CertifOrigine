import React from 'react';
import './OperatorsList.css'; // ou import de Inscriptions.css si tu le préfères

const OperatorsList = () => {
  // Données factices pour l’exemple
  const operators = [
    {
      id: 1,
      name: 'Mr Mohamed Ali',
      login: 'mohamed.ali',
      email: 'mohamed.ali@ccd.dj',
      phone: '355432',
      mobile: '0625592038',
      group: 'Administrateurs',
    },
    {
      id: 2,
      name: 'Mme Neima Youssouf',
      login: 'neima.youssouf',
      email: 'n.youssouf@ccd.dj',
      phone: '355432',
      mobile: '623789093',
      group: 'Opérateurs avec pouvoirs',
    },
    {
      id: 3,
      name: 'Mme Fatima Abdallah',
      login: 'fatima.abd',
      email: 'f.abdallah@ccd.dj',
      phone: '355433',
      mobile: '772345678',
      group: 'Opérateurs avec pouvoirs',
    },
    {
      id: 4,
      name: 'Mr Djamal Houmed',
      login: 'djhoumed',
      email: 'djhoumed@ccd.dj',
      phone: '355431',
      mobile: '779876543',
      group: 'Administrateurs',
    },
  ];

  // Handlers fictifs (pour l’instant) :
  const handleAdd = (operatorId) => {
    alert(`Action: Ajouter un opérateur (ou fonctionnalité) pour l’ID ${operatorId}`);
  };

  const handleEdit = (operatorId) => {
    alert(`Action: Modifier l’opérateur avec l’ID ${operatorId}`);
  };

  const handleDelete = (operatorId) => {
    alert(`Action: Supprimer l’opérateur avec l’ID ${operatorId}`);
  };

  return (
    <div className="operators-page-container">
      <h1>LISTING DES OPÉRATEURS</h1>
      <div className="dashboard-table-container">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Login</th>
              <th>Email</th>
              <th>Tél</th>
              <th>Portable</th>
              <th>Groupe</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {operators.map((op) => (
              <tr key={op.id}>
                <td>{op.name}</td>
                <td>{op.login}</td>
                <td>
                  <a href={`mailto:${op.email}`}>{op.email}</a>
                </td>
                <td>{op.phone}</td>
                <td>{op.mobile}</td>
                <td>{op.group}</td>
                <td>
                  {/* Trois liens/boutons pour Ajouter, Modifier, Supprimer */}
                  <button
                    className="minimal-button action-button"
                    onClick={() => handleAdd(op.id)}
                  >
                    Ajouter
                  </button>
                  <button
                    className="minimal-button action-button"
                    onClick={() => handleEdit(op.id)}
                  >
                    Modifier
                  </button>
                  <button
                    className="minimal-button action-button"
                    onClick={() => handleDelete(op.id)}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OperatorsList;
