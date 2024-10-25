import React, { useState } from 'react';

const Step3 = ({ nextStep, prevStep, handleChange, values }) => {
  const [copies, setCopies] = useState(values.copies || 1);
  const [file, setFile] = useState(values.file || null);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleChange('copies', copies);
    handleChange('file', file);
    nextStep();
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  return (
    <form onSubmit={handleSubmit} className="step-form">
      <h3>Étape 2: Nombre de copies certifiées</h3>
      <div className="form-group">
        <label>Nombre de copies certifiées</label>
        <input
          type="number"
          value={copies}
          onChange={(e) => setCopies(e.target.value)}
          min="1"
          required
        />
      </div>
      <div className="form-group">
        <label>Télécharger le fichier</label>
        <label htmlFor="file-upload" className="custom-file-upload">
          Choisir le fichier
        </label>
        <input
          id="file-upload"
          type="file"
          onChange={handleFileChange}
          className="file-input"
          required
        />
        {file && <p>Fichier sélectionné : {file.name}</p>}
      </div>
      <div className="step-actions">
        <button type="button" onClick={prevStep}>
          Back
        </button>
        <button type="submit" className="next-button">
          Next
        </button>
      </div>
    </form>
  );
};

export default Step3;
