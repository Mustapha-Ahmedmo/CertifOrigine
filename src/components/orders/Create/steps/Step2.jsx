import React, { useState } from 'react';

const Step2 = ({ nextStep, prevStep, handleChange, values }) => {
  const { originCountry, destinationCountry, transportModes, comment } = values; // Extraire les valeurs de formData

  const handleTransportChange = (e) => {
    const { name, checked } = e.target;
    handleChange('transportModes', {
      ...transportModes,
      [name]: checked,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    nextStep(); // Passer à l'étape suivante
  };

  return (
    <form onSubmit={handleSubmit} className="step-form">
      <h3>Step 2: Origine des marchandises</h3>
      <div className="form-group">
        <label>Pays d'origine</label>
        <input
          type="text"
          value={originCountry}
          onChange={(e) => handleChange('originCountry', e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label>Pays de destination</label>
        <input
          type="text"
          value={destinationCountry}
          onChange={(e) => handleChange('destinationCountry', e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label>Mode de transport</label>
        <div className="checkbox-group">
          <label>
            <input
              type="checkbox"
              name="truck"
              checked={transportModes.truck}
              onChange={handleTransportChange}
            />
            Camion
          </label>
          <label>
            <input
              type="checkbox"
              name="ship"
              checked={transportModes.ship}
              onChange={handleTransportChange}
            />
            Bateau
          </label>
          <label>
            <input
              type="checkbox"
              name="train"
              checked={transportModes.train}
              onChange={handleTransportChange}
            />
            Train
          </label>
          <label>
            <input
              type="checkbox"
              name="plane"
              checked={transportModes.plane}
              onChange={handleTransportChange}
            />
            Avion
          </label>
        </div>
      </div>
      <div className="form-group">
        <label>Commentaire</label>
        <textarea
          value={comment}
          onChange={(e) => handleChange('comment', e.target.value)}
        ></textarea>
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

export default Step2;
