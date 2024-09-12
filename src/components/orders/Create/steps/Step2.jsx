import React, { useState } from 'react';

const Step2 = ({ nextStep, prevStep, handleChange, values }) => {
  const { originCountry, destinationCountry, transportModes, comment, merchandises } = values; // Extraire les valeurs de formData

  const [merchandise, setMerchandise] = useState({
    designation: '',
    reference: '',
    quantity: '',
  });

  const handleTransportChange = (e) => {
    const { name, checked } = e.target;
    handleChange('transportModes', {
      ...transportModes,
      [name]: checked,
    });
  };

  const handleMerchandiseChange = (e) => {
    const { name, value } = e.target;
    setMerchandise({
      ...merchandise,
      [name]: value,
    });
  };

  const addMerchandise = () => {
    handleChange('merchandises', [...merchandises, merchandise]);
    setMerchandise({ designation: '', reference: '', quantity: '' });
  };

  const removeMerchandise = (index) => {
    const updatedMerchandises = merchandises.filter((_, i) => i !== index);
    handleChange('merchandises', updatedMerchandises);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    nextStep(); // Pass to the next step
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
              name="truck" // Mettre les bons noms correspondant aux clés
              checked={transportModes.truck} // Correspond à la clé dans transportModes
              onChange={handleTransportChange}
            />
            Camion
          </label>
          <label>
            <input
              type="checkbox"
              name="ship" // Correspond à la clé dans transportModes
              checked={transportModes.ship}
              onChange={handleTransportChange}
            />
            Bateau
          </label>
          <label>
            <input
              type="checkbox"
              name="train" // Correspond à la clé dans transportModes
              checked={transportModes.train}
              onChange={handleTransportChange}
            />
            Train
          </label>
          <label>
            <input
              type="checkbox"
              name="plane" // Correspond à la clé dans transportModes
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
      <div className="form-group">
        <h4>Liste des marchandises</h4>
        <div className="merchandise-form">
          <input
            type="text"
            name="designation"
            placeholder="Désignation"
            value={merchandise.designation}
            onChange={handleMerchandiseChange}
          />
          <input
            type="text"
            name="reference"
            placeholder="Réference"
            value={merchandise.reference}
            onChange={handleMerchandiseChange}
          />
          <input
            type="number"
            name="quantity"
            placeholder="Quantité"
            value={merchandise.quantity}
            onChange={handleMerchandiseChange}
          />
          <button type="button" onClick={addMerchandise}>
            Add
          </button>
        </div>
        <ul className="merchandise-list">
          {merchandises.map((item, index) => (
            <li key={index}>
              {item.designation} - {item.reference} - {item.quantity}{' '}
              <button type="button" onClick={() => removeMerchandise(index)}>
                ❌
              </button>
            </li>
          ))}
        </ul>
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