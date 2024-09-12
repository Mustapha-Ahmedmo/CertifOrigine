import React, { useState } from 'react';

const Step1 = ({ nextStep }) => {
  const [orderName, setOrderName] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [weight, setWeight] = useState('');
  const [quantity, setQuantity] = useState('');
  const [merchandises, setMerchandises] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    nextStep();
  };

  const addMerchandise = () => {
    const newMerchandise = { brand, description, weight, quantity };
    setMerchandises([...merchandises, newMerchandise]);
    setBrand('');
    setDescription('');
    setWeight('');
    setQuantity('');
  };

  const removeMerchandise = (index) => {
    const updatedMerchandises = merchandises.filter((_, i) => i !== index);
    setMerchandises(updatedMerchandises);
  };

  return (
    <form onSubmit={handleSubmit} className="step-form">
      <h3>Step 1: Nature de la Marchandise</h3>

      <div className="form-group">
        <label>Nom de la commande</label>
        <input
          type="text"
          value={orderName}
          onChange={(e) => setOrderName(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Marque</label>
        <input
          type="text"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Description de la marchandise</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Poids de chaque marchandise (en kg)</label>
        <input
          type="text"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Quantité</label>
        <input
          type="text"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
      </div>

      {/* Grouping buttons */}
      <div className="button-group">
        <button type="button" onClick={addMerchandise} className="add-button">Add</button>
        <button type="submit" className="next-button">Next</button>
      </div>

      {/* Affichage du tableau des marchandises */}
      {merchandises.length > 0 && (
        <table className="merchandise-table">
          <thead>
            <tr>
              <th>Marque</th>
              <th>Description</th>
              <th>Poids (kg)</th>
              <th>Quantité</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {merchandises.map((item, index) => (
              <tr key={index}>
                <td>{item.brand}</td>
                <td>{item.description}</td>
                <td>{item.weight}</td>
                <td>{item.quantity}</td>
                <td>
                  <button type="button" onClick={() => removeMerchandise(index)}>❌</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </form>
  );
};

export default Step1;
