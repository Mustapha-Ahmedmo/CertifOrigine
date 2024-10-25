import React, { useState } from 'react';

const Step4 = ({ nextStep, prevStep, handleChange, values }) => {
  // Fausse liste de documents disponibles à importer (à simuler depuis une BDD)
  const fakeJustificativePieces = [
    'Certificat sanitaire',
    'Agrément d’exploitation',
    'Bill of loading',
    'Airway Bill',
    'Facture fournisseur',
    'Patente industrie',
    'Autre',
  ];
  const fakeAnnexes = ['Note explicative', 'Photocopie du contrat', 'Autre annexe'];

  const [selectedJustificative, setSelectedJustificative] = useState('');
  const [selectedAnnex, setSelectedAnnex] = useState('');
  const [justificativeRemarks, setJustificativeRemarks] = useState('');
  const [annexRemarks, setAnnexRemarks] = useState('');
  const [documents, setDocuments] = useState(values.documents || []);
  const [selectedFile, setSelectedFile] = useState(null);

  const addDocument = (type) => {
    if (type === 'justificative' && selectedJustificative) {
      setDocuments([
        ...documents,
        {
          type: 'justificative',
          name: selectedJustificative,
          remarks: justificativeRemarks,
          file: selectedFile,
        },
      ]);
      setSelectedJustificative('');
      setJustificativeRemarks('');
      setSelectedFile(null);
    } else if (type === 'annex' && selectedAnnex) {
      setDocuments([
        ...documents,
        { type: 'annex', name: selectedAnnex, remarks: annexRemarks, file: selectedFile },
      ]);
      setSelectedAnnex('');
      setAnnexRemarks('');
      setSelectedFile(null);
    }
  };

  const removeDocument = (index) => {
    const updatedDocuments = documents.filter((_, i) => i !== index);
    setDocuments(updatedDocuments);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleChange('documents', documents);
    nextStep();
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  return (
    <form onSubmit={handleSubmit} className="step-form">
      <h3>Étape 2: Pièces justificatives</h3>

      {/* Section pour les pièces justificatives (obligatoires) */}
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

        {/* Bouton "Choisir le fichier" avec fond blanc et texte noir */}
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

      
      {/* Liste des documents ajoutés */}
      <ul className="document-list">
        {documents.map((doc, index) => (
          <li key={index}>
            <strong>{doc.type === 'justificative' ? 'Justificative' : 'Annexe'}:</strong> {doc.name} - {doc.remarks} -{' '}
            {doc.file ? doc.file.name : 'Aucun fichier'}
            <button type="button" onClick={() => removeDocument(index)}>
              ❌
            </button>
          </li>
        ))}
      </ul>

      <div className="step-actions">
        <button type="button" onClick={prevStep}>
          Retour
        </button>
        <button type="submit" className="next-button">
          Suivant
        </button>
      </div>

      {/* Inline CSS for styling */}
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
          background-color: white; /* Fond blanc */
          color: black; /* Texte noir */
          border: 1px solid #ced4da;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .upload-button:hover {
          background-color: #e9ecef;
        }
        .file-input {
          display: none; /* Masquer l'input réel */
        }
        .form-group {
          margin-bottom: 20px;
        }
        .step-actions {
          display: flex;
          justify-content: space-between;
        }
        .document-list {
          list-style-type: none;
          padding: 0;
        }
        .document-list li {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
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
