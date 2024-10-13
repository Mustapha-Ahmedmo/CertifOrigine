import React, { useState } from 'react';

const Step3 = ({ nextStep, prevStep, handleChange, values }) => {
  const [copies, setCopies] = useState(values.copies || 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleChange('copies', copies);
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="step-form">
      <h3>Etape 2: Nombre de copie certifié</h3>
      <div className="form-group">
        <label>Nombre de copie certifié</label>
        <input
          type="number"
          value={copies}
          onChange={(e) => setCopies(e.target.value)}
          min="1"
          required
        />
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
