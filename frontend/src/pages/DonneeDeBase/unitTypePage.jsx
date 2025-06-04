import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTimes } from '@fortawesome/free-solid-svg-icons';
import { getUnitWeightInfo, setUnitWeight, deleteUnitWeight } from '../../services/apiServices';
import './UnitTypePage.css';

const ListTypePage = () => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state and form values
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [formValues, setFormValues] = useState({
    id_unit_weight: 0,
    symbol_fr: '',
    symbol_eng: '',
  });

  // Fetch unit weights from API
  const fetchUnits = async () => {
    setLoading(true);
    try {
      const result = await getUnitWeightInfo(null, true);
      setUnits(result.data || result);
    } catch (error) {
      console.error("Erreur lors du chargement des types d'unité:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  // Open modal in "add" mode
  const handleAdd = () => {
    setModalMode('add');
    setFormValues({ id_unit_weight: 0, symbol_fr: '', symbol_eng: '' });
    setShowModal(true);
  };

  // Open modal in "edit" mode with pre-loaded values
  const handleModify = (unit) => {
    setModalMode('edit');
    setFormValues({ ...unit });
    setShowModal(true);
  };

  // Call delete API and refresh list
  const handleDelete = async (unitId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette unité ?")) {
      try {
        await deleteUnitWeight(unitId);
        alert("Unité supprimée avec succès");
        fetchUnits();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        alert("Erreur lors de la suppression");
      }
    }
  };

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  // Handle modal form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await setUnitWeight(formValues);
      alert(modalMode === 'add' ? "Unité ajoutée avec succès" : "Unité mise à jour avec succès");
      setShowModal(false);
      fetchUnits();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      alert("Erreur lors de l'enregistrement");
    }
  };

  // Close modal when clicking outside content or on cancel button
  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="unit-type-page">
      <Helmet>
        <title>Liste des unités de poids</title>
      </Helmet>
      <div className="header3" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Liste des unités de poids</h1>
        <button className="add-button" onClick={handleAdd}>
          Ajouter +
        </button>
      </div>
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <div className="table-container">
          <table className="unit-type-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom (FR)</th>
                <th>Nom (ENG)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {units.length > 0 ? (
                units.map((unit) => (
                  <tr key={unit.id_unit_weight}>
                    <td>{unit.id_unit_weight}</td>
                    <td>{unit.symbol_fr}</td>
                    <td>{unit.symbol_eng}</td>
                    <td>
                      <button
                        className="icon-button"
                        title="Modifier"
                        onClick={() => handleModify(unit)}
                      >
                        <FontAwesomeIcon icon={faPen} />
                      </button>
                      <button
                        className="icon-button"
                        title="Supprimer"
                        onClick={() => handleDelete(unit.id_unit_weight)}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">Aucune unité de poids trouvée.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for add/edit */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{modalMode === 'add' ? "Ajouter une unité" : "Modifier l'unité"}</h2>
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label>Symbole (FR):</label>
                <input
                  type="text"
                  name="symbol_fr"
                  value={formValues.symbol_fr}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Symbole (ENG):</label>
                <input
                  type="text"
                  name="symbol_eng"
                  value={formValues.symbol_eng}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={closeModal}>
                  Annuler
                </button>
                <button type="submit" className="submit-button">
                  {modalMode === 'add' ? "Ajouter" : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListTypePage;