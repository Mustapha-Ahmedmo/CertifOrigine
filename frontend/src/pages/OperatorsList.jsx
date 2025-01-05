import React from 'react';
import { useNavigate } from 'react-router-dom';

// Importe le composant "FontAwesomeIcon"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Importe seulement les icônes que tu utilises
// (tu peux en importer plusieurs et les lister comme tu le fais déjà)
import {
  faPlus,     // pour le bouton "ajouter"
  faEdit,     // pour le bouton "modifier"
  faTrashAlt, // pour le bouton "supprimer"
} from '@fortawesome/free-solid-svg-icons';

import './OperatorsList.css';

const OperatorsList = () => {
  const navigate = useNavigate();

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
    // ...
  ];

  const handleEdit = (operatorId) => {
    alert(`Action: Modifier l’opérateur ID = ${operatorId}`);
  };

  const handleDelete = (operatorId) => {
    alert(`Action: Supprimer l’opérateur ID = ${operatorId}`);
  };

  // Redirige vers /registerop
  const handleAddNew = () => {
    navigate('/registerop');
  };

  return (
    <div className="operators-page-container">
      {/* En-tête de la page */}
      <div className="operators-header">
        <h1>LISTING DES OPÉRATEURS</h1>

        {/* Bouton "Ajouter un nouvel opérateur" avec l'icône faPlus */}
        <button className="add-operator-button" onClick={handleAddNew}>
          <FontAwesomeIcon icon={faPlus} className="icon-left" />
          Ajouter un nouvel opérateur
        </button>
      </div>

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
                  {/* On a retiré le bouton "Ajouter" dans la colonne Actions */}
                  <button
                    className="minimal-button action-button"
                    onClick={() => handleEdit(op.id)}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                    &nbsp; Modifier
                  </button>
                  <button
                    className="minimal-button action-button"
                    onClick={() => handleDelete(op.id)}
                  >
                    <FontAwesomeIcon icon={faTrashAlt} />
                    &nbsp; Supprimer
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
