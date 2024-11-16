import React, { useState } from 'react';

const Step4 = ({ nextStep, prevStep, handleChange, values }) => {
  // Liste des pièces justificatives disponibles
  const fakeJustificativePieces = [
    'Certificat sanitaire',
    'Agrément d’exploitation',
    'Bill of loading',
    'Airway Bill',
    'Facture fournisseur',
    'Patente industrie',
    'Autre',
  ];

  const [selectedJustificative, setSelectedJustificative] = useState('');
  const [justificativeRemarks, setJustificativeRemarks] = useState('');
  const [documents, setDocuments] = useState(values.documents || []);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (selectedJustificative) {
      const newDocument = {
        type: 'justificative',
        name: selectedJustificative,
        remarks: justificativeRemarks,
        file: selectedFile,
      };

      const updatedDocuments = [...documents, newDocument];

      // Mettre à jour l'état local
      setDocuments(updatedDocuments);

      // Mettre à jour les valeurs globales
      handleChange('documents', updatedDocuments);
    } else {
      // Si aucun document n'est sélectionné, transmettre l'état actuel
      handleChange('documents', documents);
    }

    // Passer à l'étape suivante
    nextStep();
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  return (
    <form onSubmit={handleSubmit} className="step-form">
      <h3>Étape 2: Pièces justificatives</h3>

      {/* Section pour les pièces justificatives */}
      <div className="form-inline-group">
        <label>Choisir une pièce justificative</label>
        <select
          value={selectedJustificative}
          onChange={(e) => setSelectedJustificative(e.target.value)}
        >
          <option value="">-- Sélectionnez une pièce --</option>
          {fakeJustificativePieces.map((piece, index) => (
            <option key={index} value={piece}>
              {piece}
            </option>
          ))}
        </select>

        {/* Bouton "Choisir le fichier" */}
        <label htmlFor="file-upload" className="upload-button">
          Choisir le fichier
        </label>
        <input
          id="file-upload"
          type="file"
          onChange={handleFileChange}
          className="file-input"
        />
      </div>

      {/* Afficher le nom du fichier sélectionné */}
      {selectedFile && <p>Fichier sélectionné : {selectedFile.name}</p>}

      <div className="form-group">
        <label>Remarques</label>
        <textarea
          value={justificativeRemarks}
          onChange={(e) => setJustificativeRemarks(e.target.value)}
          placeholder="Ajouter des remarques"
        />
      </div>

      <div className="step-actions">
        <button type="button" onClick={prevStep}>
          Retour
        </button>
        <button type="submit" className="next-button">
          Suivant
        </button>
      </div>

      {/* Styles en ligne */}
      <style jsx>{`
        .form-inline-group {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
        }
        .form-inline-group select {
          flex-grow: 1;
          padding: 5px;
        }
        .upload-button {
          padding: 5px 10px;
          font-size: 0.875rem;
          background-color: white;
          color: black;
          border: 1px solid #ced4da;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .upload-button:hover {
          background-color: #e9ecef;
        }
        .file-input {
          display: none;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .step-actions {
          display: flex;
          justify-content: space-between;
        }
        .next-button {
          background-color: #28a745;
          color: white;
          padding: 8px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .next-button:hover {
          background-color: #218838;
        }
      `}</style>
    </form>
  );
};

export default Step4;
