import React, { useState } from 'react';
import './Step1.css';

const Step1 = ({ nextStep, handleChange, values }) => {
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!values.orderName || values.orderName.trim() === '') {
      setErrorMessage('Le nom de la commande est requis.');
      return;
    }

    setErrorMessage('');
    nextStep(); // Call the nextStep function (createEmptyOrder)
  };

  return (
    <form onSubmit={handleSubmit} className="step1-form">
      <h3>Étape 1: Création d'une commande</h3>

      <div className="form-group">
        <label htmlFor="orderName">Nom de la commande *</label>
        <input
          id="orderName"
          type="text"
          value={values.orderName}
          onChange={(e) => handleChange('orderName', e.target.value)}
          placeholder="Entrez le nom de la commande"
          required
        />
      </div>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <div className="button-group">
        <button type="submit" className="next-button">
          Créer et continuer
        </button>
      </div>
    </form>
  );
};

export default Step1;