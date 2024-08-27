import React, { useState } from 'react';

const Step2 = ({ nextStep, prevStep }) => {
  const [originCountry, setOriginCountry] = useState('');
  const [destinationCountry, setDestinationCountry] = useState('');
  const [transportModes, setTransportModes] = useState({
    air: false,
    terre: false,
    mer: false,
  });
  const [comment, setComment] = useState('');
  const [merchandises, setMerchandises] = useState([]);
  const [merchandise, setMerchandise] = useState({
    designation: '',
    reference: '',
    quantity: '',
  });

  const handleTransportChange = (e) => {
    const { name, checked } = e.target;
    setTransportModes({
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
    setMerchandises([...merchandises, merchandise]);
    setMerchandise({ designation: '', reference: '', quantity: '' });
  };

  const removeMerchandise = (index) => {
    const updatedMerchandises = merchandises.filter((_, i) => i !== index);
    setMerchandises(updatedMerchandises);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate and proceed to the next step
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="step-form">
      <h3>Step 2: Origine des marchandises</h3>
      <div className="form-group">
        <label>Pays d'origine</label>
        <input
          type="text"
          value={originCountry}
          onChange={(e) => setOriginCountry(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label>Pays de destination</label>
        <input
          type="text"
          value={destinationCountry}
          onChange={(e) => setDestinationCountry(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label>Mode de transport</label>
        <div className="checkbox-group">
          <label>
            <input
              type="checkbox"
              name="air"
              checked={transportModes.air}
              onChange={handleTransportChange}
            />
            Air
          </label>
          <label>
            <input
              type="checkbox"
              name="terre"
              checked={transportModes.terre}
              onChange={handleTransportChange}
            />
            Terre
          </label>
          <label>
            <input
              type="checkbox"
              name="mer"
              checked={transportModes.mer}
              onChange={handleTransportChange}
            />
            Mer
          </label>
        </div>
      </div>
      <div className="form-group">
        <label>Commentaire</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
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
