import React, { useState } from 'react';

const Step1 = ({ nextStep }) => {
  const [orderName, setOrderName] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [weight, setWeight] = useState('');
  const [quantity, setQuantity] = useState(''); // Quantité comme un champ classique

  const handleSubmit = (e) => {
    e.preventDefault();
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="step-form">
      <h3>Step 1: Nature de la Marchandise</h3>

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
          value={weight}  // Input classique pour le poids
          onChange={(e) => setWeight(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Quantité</label>
        <input
          type="text"  // Input classique pour la quantité
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
      </div>

      <button type="submit" className="next-button">Next</button>
    </form>
  );
};

export default Step1;
