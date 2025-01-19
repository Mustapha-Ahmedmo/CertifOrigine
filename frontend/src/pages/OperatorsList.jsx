import React, { useEffect, useState } from 'react';
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
import { disableOperator, getOperatorList } from '../services/apiServices';
import { useSelector } from 'react-redux';

const OperatorsList = () => {
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  // If the user object contains isadmin_login, we check that to restrict operator creation.
  const isAdmin = user?.isadmin_login;

  const [operators, setOperators] = useState([]); // State for operators
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  const getGroupLabel = (roles) => {
    const labels = [];
    if (roles === 1) labels.push('Administrateur');
    if (roles === 2) labels.push('Opérateur avec pouvoir');
    return labels.join(' ET ');
  };

  useEffect(() => {
    const fetchOperators = async () => {
      try {
        const response = await getOperatorList(null, null, true); // Fetch active operators
        setOperators(response.data); // Set the retrieved data
      } catch (err) {
        setError('Erreur lors de la récupération des opérateurs.');
        console.error(err);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchOperators();
  }, []);

  const handleEdit = (operatorId) => {
    navigate(`/registerop/${operatorId}`);
  };

  const handleDelete = async (operatorId) => {
    if (window.confirm('Êtes-vous sûr de vouloir désactiver cet opérateur ?')) {
      try {
        await disableOperator(operatorId);
        setOperators((prevOperators) =>
          prevOperators.filter((op) => op.id_op_user !== operatorId)
        );
        alert('Opérateur désactivé avec succès.');
      } catch (err) {
        alert('Erreur lors de la désactivation de l’opérateur.');
        console.error(err);
      }
    }
  };

  // Redirige vers /registerop
  const handleAddNew = () => {
    if (isAdmin) {
      navigate('/registerop');
    } else {
      alert("Seul un administrateur peut créer un nouvel opérateur.");
    }
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
              <tr key={op.id_op_user}>
                <td>{op.full_name}</td>
                <td>{op.username}</td>
                <td>
                  <a href={`mailto:${op.email}`}>{op.email}</a>
                </td>
                <td>{op.phone_number}</td>
                <td>{op.mobile_number}</td>
                <td>{getGroupLabel(op.roles)}</td>
                <td>
                  {/* On a retiré le bouton "Ajouter" dans la colonne Actions */}
                  <button
                    className="minimal-button action-button"
                    onClick={() => handleEdit(op.id_op_user)}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                    &nbsp; Modifier
                  </button>
                  <button
                    className="minimal-button action-button"
                    onClick={() => handleDelete(op.id_op_user)}
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
